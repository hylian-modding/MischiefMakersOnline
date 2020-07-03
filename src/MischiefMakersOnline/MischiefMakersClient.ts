import { InjectCore } from 'modloader64_api/CoreInjection';
import { bus, EventHandler, EventsClient } from 'modloader64_api/EventHandler';
import { INetworkPlayer, LobbyData, NetworkHandler } from 'modloader64_api/NetworkHandler';
import { IMischiefMakersCore, MischiefMakers } from './Core/MischiefMakers/MischiefMakers'
import { Init, Preinit, Postinit, onTick } from 'modloader64_api/PluginLifecycle';
import { IModLoaderAPI, ModLoaderEvents } from 'modloader64_api/IModLoaderAPI';
import { ModLoaderAPIInject } from 'modloader64_api/ModLoaderAPIInjector';
import { Player, Actor, ACTOR_LIST_POINTER } from './Core/MischiefMakers/API/IActor';
import { UpdatePlayerPositionPacket, GoldGemsPacket, UnlockedLevelsPacket, BestTimesPacket, UpdatePlayerVelocityPacket, UpdatePlayerDataPacket } from './MischiefMakersPacketTypes';
import { Save } from './Core/MischiefMakers/API/ISave';
import PuppetOverlord, { Puppet, ACTOR_LIST_NUM_GENERATED } from './MischiefMakersPuppet';
import { Game } from './Core/MischiefMakers/API/IGame';
import Vector3 from 'modloader64_api/math/Vector3';
import Vector2 from './Core/MischiefMakers/Math/Vector2';
import { Packet } from 'modloader64_api/ModLoaderDefaultImpls';

const DT: number = 1 / 60

class MischiefMakersClient {
    last_player_state!: Buffer
    last_gold_gems!: Buffer
    last_unlocked_levels!: Buffer
    last_best_times!: Buffer

    last_velocity!: Vector2

    last_frame!: number

    core: MischiefMakers

    puppet_overlord!: PuppetOverlord

    constructor() {
        this.core = new MischiefMakers();
    }

    @ModLoaderAPIInject() ModLoader!: IModLoaderAPI;

    @Preinit()
    preinit() {}

    @Init()
    init() {}

    @Postinit()
    postinit() {
        this.last_player_state = Buffer.alloc(0x198)
        this.last_gold_gems = Buffer.alloc(8)
        this.last_unlocked_levels = Buffer.alloc(4)
        this.last_best_times = Buffer.alloc(0x90)
        this.last_velocity = new Vector2()
        this.last_frame = 0

        this.puppet_overlord = new PuppetOverlord(this.ModLoader)

        this.core.marina = new Player(this.ModLoader.emulator, 0);
        this.core.game = new Game(this.ModLoader.emulator)
        this.core.save = new Save(this.ModLoader.emulator)
    }

    @onTick()
    onTick(frame: number) {
        let i = 0
        let packets: Packet[] = []

        // Assuming that all client changes are safe enough; with safety on the server
        if (!this.core.save.gold_gems.equals(this.last_gold_gems)) {
            packets.push(new GoldGemsPacket(this.core.save.gold_gems, this.ModLoader.clientLobby))
            this.last_gold_gems = this.core.save.gold_gems
        }

        if (!this.core.save.unlocked_levels.equals(this.last_unlocked_levels)) {
            packets.push(new UnlockedLevelsPacket(this.core.save.unlocked_levels, this.ModLoader.clientLobby))
            this.last_unlocked_levels = this.core.save.unlocked_levels
        }

        if (!this.core.save.best_times.equals(this.last_best_times)) {
            packets.push(new BestTimesPacket(this.core.save.best_times, this.ModLoader.clientLobby))
            this.last_best_times = this.core.save.best_times
        }

        if (this.core.game.in_cutscene == 0 && this.core.game.is_paused == 0) {
            if (frame % 3 == 0) {

                // If moving, update position, always update velocity
                packets.push(new UpdatePlayerVelocityPacket(this.core.marina.velocity, this.ModLoader.clientLobby))
                if (this.core.marina.velocity.magnitude() != 0) packets.push(new UpdatePlayerPositionPacket(this.core.marina.real_pos, this.ModLoader.clientLobby))
            }
            if (frame % 6 == 0) {
                packets.push(new UpdatePlayerDataPacket(this.core.marina as unknown as Actor, this.ModLoader.clientLobby))
            }

            // Instantly update if changed direction or stopped/started moving
            if (
                this.last_velocity.minus(this.core.marina.velocity).normalized().dot(this.core.marina.velocity.normalized()) < 0 ||
                ((this.last_velocity.magnitude() != 0 && this.core.marina.velocity.magnitude() == 0) ||
                (this.last_velocity.magnitude() == 0 && this.core.marina.velocity.magnitude() != 0))
            ) {

                // Remove old packets so that we don't send more data than we need
                let bad_indexes: number[] = []
                for (i = 0; i < packets.length; i++) {
                    if (packets[i].packet_id == "mmo_cPos" || packets[i].packet_id == "mmo_cVel") {
                        bad_indexes.push(i)
                    }
                }

                for (i = 0; i < bad_indexes.length; i++) {
                    packets.slice(bad_indexes[i])
                }

                packets.push(new UpdatePlayerVelocityPacket(this.core.marina.velocity, this.ModLoader.clientLobby))
                packets.push(new UpdatePlayerPositionPacket(this.core.marina.real_pos, this.ModLoader.clientLobby))
            }
        }
        else if (this.core.game.in_cutscene || this.core.game.is_paused) {
            this.puppet_overlord.freeAllPuppets()
        }

        let delta_pos, extrap_pos, nf
        for (i = 0; i < ACTOR_LIST_NUM_GENERATED; i++) {
            if (this.puppet_overlord.puppets[i].in_use && this.puppet_overlord.puppets[i].actor.health > 0) {

                // An idea to turn the player into Teran and guess animations omegalul
                // Quick Logic doesn't work, will have to actually consider how this should function
                /*if (frame % 5 == 0) {
                    // Update and guess sprite
                    this.puppet_overlord.puppets[i].actor.current_sprite = 0x68
                    this.puppet_overlord.puppets[i].actor.mode = 0x00011103
                    this.puppet_overlord.puppets[i].actor.current_sprite_index++

                    // Grounded, probably idle
                    if (this.puppet_overlord.puppets[i].actor.air_ground_state == 0 || this.puppet_overlord.puppets[i].actor.air_ground_state == 7) {
                        this.puppet_overlord.puppets[i].actor.idle_time += 1
                        this.puppet_overlord.puppets[i].actor.current_sprite_index = this.puppet_overlord.puppets[i].actor.idle_time % 3
                        if (this.puppet_overlord.puppets[i].actor.idle_time > 240) {
                            this.puppet_overlord.puppets[i].actor.current_sprite_index = 0xE1 + (this.puppet_overlord.puppets[i].actor.idle_time % 9)
                        }
                    }
                    // In the air
                    if (this.puppet_overlord.puppets[i].actor.air_ground_state == 4) {
                        // The player probably jumped
                        if (this.puppet_overlord.puppets[i].actor.flags_2 != 0) {
                            if (this.puppet_overlord.puppets[i].actor.current_sprite_index < 0x2C || this.puppet_overlord.puppets[i].actor.current_sprite_index > 0x38) {
                                this.puppet_overlord.puppets[i].actor.current_sprite_index = 0x2C
                            }
                        }
                        // Freefall
                        else {
                            this.puppet_overlord.puppets[i].actor.current_sprite_index = 0x38
                        }
                    }

                    // Ducking
                    if ((this.puppet_overlord.puppets[i].actor.anim_flags & 0x00000003) == 0) { // Could probably just use this to tell us what animation to play
                        if (this.puppet_overlord.puppets[i].actor.current_sprite_index < 0xAA || this.puppet_overlord.puppets[i].actor.current_sprite_index > 0xAC) {
                            this.puppet_overlord.puppets[i].actor.current_sprite_index = 0xAA
                        }
                    }

                    // Running
                    if ((this.puppet_overlord.puppets[i].actor.anim_flags & 0x0000001D) == 0) {
                        if (this.puppet_overlord.puppets[i].actor.current_sprite_index < 0x81 || this.puppet_overlord.puppets[i].actor.current_sprite_index > 0x90) {
                            this.puppet_overlord.puppets[i].actor.current_sprite_index = 0x81
                        }
                    }

                    // Rolling
                    if ((this.puppet_overlord.puppets[i].actor.anim_flags & 0x00000063) == 0) {
                        if (this.puppet_overlord.puppets[i].actor.current_sprite_index < 0x38 || this.puppet_overlord.puppets[i].actor.current_sprite_index > 0x40) {
                            this.puppet_overlord.puppets[i].actor.current_sprite_index = 0x38
                        }
                    }

                    // Ooh-ouch!
                    if ((this.puppet_overlord.puppets[i].actor.anim_flags & 0x00000092) == 0 || (this.puppet_overlord.puppets[i].actor.anim_flags & 0x00000093) != 0) {
                        if (this.puppet_overlord.puppets[i].actor.current_sprite_index < 0x52 || this.puppet_overlord.puppets[i].actor.current_sprite_index > 0x5C) {
                            this.puppet_overlord.puppets[i].actor.current_sprite_index = 0x52
                        }
                    }
                }*/

                // Extrapolate puppet positions, save the network!
                let lv = new Vector2(this.puppet_overlord.puppets[i].last_vel.x, this.puppet_overlord.puppets[i].last_vel.y)
                if (lv.magnitude() == 0) {
                    this.puppet_overlord.puppets[i].actor.pos_2 = new Vector3(this.puppet_overlord.puppets[i].last_pos.x - this.core.marina.camera_pos_final.x, this.puppet_overlord.puppets[i].last_pos.y - this.core.marina.camera_pos_final.y, 0);
                    this.puppet_overlord.puppets[i].actor.velocity = new Vector2()
                }
                else {
                    extrap_pos = new Vector3(
                        this.puppet_overlord.puppets[i].last_pos.x + (lv.x * (frame - this.puppet_overlord.puppets[i].last_update)),
                        this.puppet_overlord.puppets[i].last_pos.y + (lv.y * (frame - this.puppet_overlord.puppets[i].last_update)),
                        0
                    )
                    delta_pos = new Vector3(extrap_pos.x - this.core.marina.camera_pos_final.x, extrap_pos.y - this.core.marina.camera_pos_final.y, 0);
                    this.puppet_overlord.puppets[i].actor.pos_2 = delta_pos
                    this.puppet_overlord.puppets[i].actor.velocity = new Vector2()
                }
            }
            else if (this.puppet_overlord.puppets[i].in_use && this.puppet_overlord.puppets[i].actor.health <= 0) {
                this.puppet_overlord.freePuppet(this.puppet_overlord.puppets[i].uuid)
            }
        }

        for (i = 0; i < packets.length; i++) {
            this.ModLoader.clientSide.sendPacket(packets[i])
        }

        this.last_velocity = this.core.marina.velocity
        this.last_player_state = this.ModLoader.emulator.rdramReadBuffer(ACTOR_LIST_POINTER, 0x198)
        this.last_frame = frame
    }

    @NetworkHandler('mmo_sGold')
    onGoldGemsPacket(packet: GoldGemsPacket) {
        this.core.save.gold_gems = packet.gold_gems
        this.last_gold_gems = packet.gold_gems
        this.ModLoader.logger.info("Gold Gems Update [mmo_sGold]: " + this.core.save.gold_gems.readBigUInt64BE(0).toString(16))
    }

    @NetworkHandler('mmo_sLevels')
    onUnlockedLevelsPacket(packet: UnlockedLevelsPacket) {
        this.core.save.unlocked_levels = packet.unlocked_levels
        this.last_unlocked_levels = packet.unlocked_levels
        this.ModLoader.logger.info("Unlocked Levels Update [mmo_sLevels]: " + this.core.save.unlocked_levels.readUInt32BE(0).toString(16))
    }

    @NetworkHandler('mmo_sTimes')
    onBestTimesPacket(packet: BestTimesPacket) {
        this.ModLoader.logger.info("Best Times Update [mmo_sTimes]")
        this.core.save.best_times = packet.best_times
        this.last_best_times = packet.best_times
    }

    @NetworkHandler('mmo_sPos')
    onPosPacket(packet: UpdatePlayerPositionPacket) {
        if (packet.player.uuid != this.ModLoader.me.uuid) {
            let player_puppet: Puppet | undefined = this.puppet_overlord.getPuppet(packet.player.uuid)
            if (player_puppet != null) {
                player_puppet.last_pos = packet.pos
                player_puppet.last_update = this.last_frame
            }
            else {
                let result = this.puppet_overlord.addPuppet(packet.player.uuid)
                this.ModLoader.logger.warn("Trying to make puppet for " + packet.player.uuid + "... " + `${(result) ? 'success' : 'fail'}`)
            }
        }
    }

    @NetworkHandler('mmo_sVel')
    onVelPacket(packet: UpdatePlayerVelocityPacket) {
        if (packet.player.uuid != this.ModLoader.me.uuid) {
            let player_puppet: Puppet | undefined = this.puppet_overlord.getPuppet(packet.player.uuid)
            if (player_puppet != null) {
                player_puppet.last_vel = packet.vel
                player_puppet.last_update = this.last_frame
            }
        }
    }

    @NetworkHandler('mmo_sPData')
    onPlayerData(packet: UpdatePlayerDataPacket) {
        if (packet.player.uuid != this.ModLoader.me.uuid) {
            let player_puppet: Puppet | undefined = this.puppet_overlord.getPuppet(packet.player.uuid)
            if (player_puppet) {
                player_puppet.actor.effect_flags = packet.effect_flags
                player_puppet.actor.air_ground_state = packet.air_ground_state
                player_puppet.actor.idle_time = packet.idle_time
            }
        }
    }
}

export default MischiefMakersClient

