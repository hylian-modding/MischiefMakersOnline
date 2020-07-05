import { InjectCore } from 'modloader64_api/CoreInjection';
import { bus, EventHandler, EventsClient } from 'modloader64_api/EventHandler';
import { INetworkPlayer, LobbyData, NetworkHandler } from 'modloader64_api/NetworkHandler';
import { IMischiefMakersCore, MischiefMakers } from './Core/MischiefMakers/MischiefMakers'
import { Init, Preinit, Postinit, onTick } from 'modloader64_api/PluginLifecycle';
import { IModLoaderAPI, ModLoaderEvents } from 'modloader64_api/IModLoaderAPI';
import { ModLoaderAPIInject } from 'modloader64_api/ModLoaderAPIInjector';
import { Player, Actor, ACTOR_LIST_POINTER } from './Core/MischiefMakers/API/IActor';
import { UpdatePlayerPositionPacket, GoldGemsPacket, UnlockedLevelsPacket, BestTimesPacket, UpdatePlayerVelocityPacket, UpdatePlayerDataPacket, PingServerPacket, PlayerPingPacket, SceneChangePacket, UpdatePlayerScalePacket } from './MischiefMakersPacketTypes';
import { Save } from './Core/MischiefMakers/API/ISave';
import { PuppetOverlord, Puppet } from './MischiefMakersPuppet';
import { Game } from './Core/MischiefMakers/API/IGame';
import Vector3 from 'modloader64_api/math/Vector3';
import Vector2 from './Core/MischiefMakers/Math/Vector2';
import { Packet } from 'modloader64_api/ModLoaderDefaultImpls';

const DT: number = 1 / 60

class MischiefMakersClient {
    last_gold_gems!: Buffer
    last_unlocked_levels!: Buffer
    last_best_times!: Buffer

    last_velocity!: Vector2

    last_scale_0!: Vector2
    last_scale_1!: Vector2
    last_scale_XY!: number

    last_scene!: number
    last_frame!: number
    last_ping!: number

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
        this.last_gold_gems = Buffer.alloc(8)
        this.last_unlocked_levels = Buffer.alloc(4)
        this.last_best_times = Buffer.alloc(0x90)
        this.last_velocity = new Vector2()
        this.last_scale_0 = new Vector2(1, 1)
        this.last_scale_1 = new Vector2(1, 1)
        this.last_scale_XY = 1
        this.last_scene = 0
        this.last_frame = 0
        this.last_ping = 0

        this.puppet_overlord = new PuppetOverlord(this.ModLoader)

        this.core.marina = new Player(this.ModLoader.emulator, 0);
        this.core.game = new Game(this.ModLoader.emulator)
        this.core.save = new Save(this.ModLoader.emulator)
    }

    @onTick()
    onTick(frame: number) {
        let i = 0
        let packets: Packet[] = []

        if (!this.core.save.gold_gems.equals(this.last_gold_gems)) packets.push(new GoldGemsPacket(this.core.save.gold_gems, this.ModLoader.clientLobby))
        if (!this.core.save.unlocked_levels.equals(this.last_unlocked_levels)) packets.push(new UnlockedLevelsPacket(this.core.save.unlocked_levels, this.ModLoader.clientLobby))
        if (!this.core.save.best_times.equals(this.last_best_times)) packets.push(new BestTimesPacket(this.core.save.best_times, this.ModLoader.clientLobby))
        if (this.last_scene != this.core.game.current_scene) packets.push(new SceneChangePacket(this.last_scene, this.ModLoader.clientLobby))

        if (this.arePuppetsSafe()) {
            if (frame % 3 == 0) {
                // If moving, update position, update velocity on change
                if (this.core.marina.velocity != this.last_velocity) packets.push(new UpdatePlayerVelocityPacket(this.core.marina.velocity, this.ModLoader.clientLobby))
                if (this.core.marina.velocity.magnitude() != 0 || (this.core.marina.mode & 0x0A000000) != 0) packets.push(new UpdatePlayerPositionPacket(this.core.marina.real_pos, this.ModLoader.clientLobby))

                if (this.core.marina.scale_0 != this.last_scale_0 || this.core.marina.scale_1 != this.last_scale_1 || this.core.marina.scaleXY != this.last_scale_XY) {
                    packets.push(new UpdatePlayerScalePacket(this.core.marina as unknown as Actor, this.ModLoader.clientLobby))
                }
            }


            if (frame % 5 == 0) {
                packets.push(new UpdatePlayerDataPacket(this.core.marina as unknown as Actor, this.ModLoader.clientLobby))
            }
            if (frame % 60 == 0) {
                // Every second, update pos and vel
                packets.push(new UpdatePlayerVelocityPacket(this.core.marina.velocity, this.ModLoader.clientLobby))
                packets.push(new UpdatePlayerPositionPacket(this.core.marina.real_pos, this.ModLoader.clientLobby))
                packets.push(new PingServerPacket(new Date(), this.ModLoader.clientLobby))
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
        else if (this.puppet_overlord.puppets.length > 0) {
            this.puppet_overlord.freeAllPuppets()
        }

        let delta_pos, extrap_pos, latency_frames, lv
        for (i = 0; i < this.puppet_overlord.puppets.length; i++) {
            // Extrapolate puppet positions, save the network!
            lv = new Vector2(this.puppet_overlord.puppets[i].last_vel.x, this.puppet_overlord.puppets[i].last_vel.y)
            if (lv.magnitude() == 0) {
                delta_pos = new Vector3(this.puppet_overlord.puppets[i].last_pos.x - this.core.marina.camera_pos_final.x, this.puppet_overlord.puppets[i].last_pos.y - this.core.marina.camera_pos_final.y, 0);
                this.puppet_overlord.puppets[i].actor.pos_0 = delta_pos
                this.puppet_overlord.puppets[i].actor.pos_1 = delta_pos
                this.puppet_overlord.puppets[i].actor.pos_2 = delta_pos
                this.puppet_overlord.puppets[i].actor.pos_3 = delta_pos
                this.puppet_overlord.puppets[i].actor.pos_4 = delta_pos
                this.puppet_overlord.puppets[i].actor.velocity = new Vector2()
            }
            else {
                latency_frames = Math.floor((this.puppet_overlord.puppets[i].getAveragePing() * 1000) / 16)
                extrap_pos = new Vector3(
                    this.puppet_overlord.puppets[i].last_pos.x + (lv.x * ((frame - this.puppet_overlord.puppets[i].last_update) + latency_frames)),
                    this.puppet_overlord.puppets[i].last_pos.y + (lv.y * ((frame - this.puppet_overlord.puppets[i].last_update) + latency_frames)),
                    0
                )

                delta_pos = new Vector3(extrap_pos.x - this.core.marina.camera_pos_final.x, extrap_pos.y - this.core.marina.camera_pos_final.y, 0);
                this.puppet_overlord.puppets[i].actor.pos_0 = delta_pos
                this.puppet_overlord.puppets[i].actor.pos_1 = delta_pos
                this.puppet_overlord.puppets[i].actor.pos_2 = delta_pos
                this.puppet_overlord.puppets[i].actor.pos_3 = delta_pos
                this.puppet_overlord.puppets[i].actor.pos_4 = delta_pos
                this.puppet_overlord.puppets[i].actor.velocity = new Vector2()
            }
        }

        for (i = 0; i < packets.length; i++) {
            this.ModLoader.clientSide.sendPacket(packets[i])
        }

        this.last_gold_gems = this.core.save.gold_gems
        this.last_unlocked_levels = this.core.save.unlocked_levels
        this.last_best_times = this.core.save.best_times
        this.last_velocity = this.core.marina.velocity
        this.last_scale_0 = this.core.marina.scale_0
        this.last_scale_1 = this.core.marina.scale_1
        this.last_scale_XY = this.core.marina.scaleXY
        this.last_scene = this.core.game.current_scene
        this.last_frame = frame
    }

    arePuppetsSafe(): boolean {
        return (!this.core.game.in_cutscene && !this.core.game.is_paused && this.core.game.game_state == 6)
    }

    makePuppet(uuid: string): number {
        let result = 0
        if (this.arePuppetsSafe()) {
            result = this.puppet_overlord.addPuppet(uuid)
            this.ModLoader.logger.warn("Trying to make puppet for " + uuid + "... " + `${(result) ? 'success' : 'fail'}`)
        }

        return result
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
        let player_puppet: Puppet | undefined = this.puppet_overlord.getPuppet(packet.player.uuid)
        if (player_puppet) {
            player_puppet.last_pos = packet.pos
            player_puppet.last_update = this.last_frame
        }
        else this.makePuppet(packet.player.uuid)
    }

    @NetworkHandler('mmo_sVel')
    onVelPacket(packet: UpdatePlayerVelocityPacket) {
        let player_puppet: Puppet | undefined = this.puppet_overlord.getPuppet(packet.player.uuid)
        if (player_puppet) {
            player_puppet.last_vel = packet.vel
            player_puppet.last_update = this.last_frame
        }
        else this.makePuppet(packet.player.uuid)
    }

    @NetworkHandler('mmo_sPData')
    onPlayerData(packet: UpdatePlayerDataPacket) {
        let player_puppet: Puppet | undefined = this.puppet_overlord.getPuppet(packet.player.uuid)
        if (player_puppet) {
            player_puppet.actor.mode = packet.mode
            player_puppet.actor.effect_flags = packet.effect_flags
            player_puppet.actor.air_ground_state = packet.air_ground_state
            player_puppet.actor.idle_time = packet.idle_time
        }
        else this.makePuppet(packet.player.uuid)
    }

    @NetworkHandler('mmo_sPScale')
    onPlayerScale(packet: UpdatePlayerScalePacket) {
        let player_puppet: Puppet | undefined = this.puppet_overlord.getPuppet(packet.player.uuid)
        if (player_puppet) {
            player_puppet.actor.scaleXY = packet.scaleXY
            player_puppet.actor.scale_0 = packet.scale_0
            player_puppet.actor.scale_1 = packet.scale_1
        }
        else this.makePuppet(packet.player.uuid)
    }

    @NetworkHandler('mmo_sPing')
    onPing(packet: PingServerPacket) {
        let time = new Date()
        this.last_ping = (time.valueOf() - packet.time_sent) / 1000
        this.ModLoader.clientSide.sendPacket(new PlayerPingPacket(this.last_ping, this.ModLoader.clientLobby))
    }

    @NetworkHandler('mmo_sPPing')
    onPlayerPing(packet: PlayerPingPacket) {
        let player_puppet: Puppet | undefined = this.puppet_overlord.getPuppet(packet.player.uuid)
        if (player_puppet) player_puppet.pushNewPing(packet.ping)
        else this.makePuppet(packet.player.uuid)
    }

    @NetworkHandler('mmo_sScene')
    onSceneChange(packet: SceneChangePacket) {
        if (packet.scene != this.last_scene) this.puppet_overlord.freePuppet(packet.player.uuid)
        else this.makePuppet(packet.player.uuid)
    }
}

export default MischiefMakersClient

