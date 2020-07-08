import { InjectCore } from 'modloader64_api/CoreInjection';
import { bus, EventHandler, EventsClient } from 'modloader64_api/EventHandler';
import { INetworkPlayer, LobbyData, NetworkHandler } from 'modloader64_api/NetworkHandler';
import { IMischiefMakersCore, MischiefMakers } from './Core/MischiefMakers/MischiefMakers'
import { Init, Preinit, Postinit, onTick } from 'modloader64_api/PluginLifecycle';
import { IModLoaderAPI, ModLoaderEvents } from 'modloader64_api/IModLoaderAPI';
import { ModLoaderAPIInject } from 'modloader64_api/ModLoaderAPIInjector';
import { Player, Actor, ACTOR_LIST_POINTER, SceneActor, SIZEOF_ACTOR, SceneActorUpdate } from './Core/MischiefMakers/API/IActor';
import { UpdatePlayerPositionPacket, GoldGemsPacket, UnlockedLevelsPacket, BestTimesPacket, UpdatePlayerVelocityPacket, UpdatePlayerDataPacket, PingServerPacket, PlayerPingPacket, SceneChangePacket, UpdatePlayerScalePacket, SceneUpdatePacket } from './MischiefMakersPacketTypes';
import { Save } from './Core/MischiefMakers/API/ISave';
import { PuppetOverlord, Puppet, ACTOR_LIST_SIZE } from './MischiefMakersPuppet';
import { Game, SCENE_NAMES } from './Core/MischiefMakers/API/IGame';
import Vector3 from 'modloader64_api/math/Vector3';
import Vector2 from './Core/MischiefMakers/Math/Vector2';
import { Packet } from 'modloader64_api/ModLoaderDefaultImpls';
import { throws } from 'assert';
import { DiscordStatus } from 'modloader64_api/Discord';
import { stat } from 'fs';

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
    last_game_state!: number
    last_frame!: number
    last_ping!: number

    scene_sync!: boolean
    scene_actors!: SceneActor[]

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
        this.last_scene = -1
        this.last_game_state = -1
        this.last_frame = 0
        this.last_ping = 0

        this.scene_sync = false
        this.scene_actors = new Array(0x40)

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
        if (this.last_scene != this.core.game.current_scene) {

            if (this.scene_sync) {
                for (i = 1; i < 0x40; i++) {
                    this.scene_actors[i] = new SceneActor(this.ModLoader.emulator, i)
                }
            }

            packets.push(new SceneChangePacket(this.last_scene, this.ModLoader.clientLobby))
        }

        if (this.last_scene != this.core.game.current_scene || this.last_game_state != this.core.game.game_state) {
            let scene_identifier
            let gm = this.core.game.game_state

            if (gm == 0) scene_identifier = "Booting the Game"
            else if (gm == 1) scene_identifier = "Watching the Logos"
            else if (gm == 2) scene_identifier = "Title Screen"
            else if (gm == 3) scene_identifier = "Probably Cheating 🤔"
            else if (gm == 4) scene_identifier = "Definitley Cheating 🤔"
            else if (gm == 5) scene_identifier = "Loading " + SCENE_NAMES[this.core.game.current_scene]
            else if (gm == 6 && this.core.game.in_cutscene || (this.core.game.current_scene == 0x0059 || this.core.game.current_scene == 0x005F || this.core.game.current_scene == 0x0060 || this.core.game.current_scene == 0x0065)) {
                scene_identifier = SCENE_NAMES[this.core.game.current_scene]
            }
            else if (gm == 7) scene_identifier = "Staring at Death Screen"
            else if (gm == 8 || gm == 9) scene_identifier = "Crashed the Game lol"
            else if (gm == 10) scene_identifier = "DEMO: " + SCENE_NAMES[this.core.game.current_scene]
            else if (gm == 11) scene_identifier = "Selecting File"
            else if (gm == 12) scene_identifier = SCENE_NAMES[0x0065] + ", HP: " + this.core.marina.health
            else if (gm == 14) scene_identifier = "Looking at Best Times"

            if (scene_identifier == null) scene_identifier = "Cutscene or Unknown Scene"

            let status = new DiscordStatus("Mischief Makers Online", scene_identifier)
            status.partyId = this.ModLoader.clientLobby
            status.partyMax = 64
            status.partySize = this.puppet_overlord.puppets.length
            status.smallImageKey = "mischief"
            this.ModLoader.gui.setDiscordStatus(status)
        }

        if (this.arePuppetsSafe() && this.core.game.stage_timer > 30) {

            if (frame % 3 == 0) {
                // If moving, update position, update velocity on change
                if (this.core.marina.velocity != this.last_velocity) packets.push(new UpdatePlayerVelocityPacket(this.core.marina.velocity, this.ModLoader.clientLobby))
                if (this.core.marina.velocity.magnitude() != 0 || (this.core.marina.mode & 0x0A000000) != 0) packets.push(new UpdatePlayerPositionPacket(new Vector3(this.core.marina.real_pos.x, this.core.marina.real_pos.y, this.core.marina.pos_2.z), this.ModLoader.clientLobby))

                if (this.core.marina.scale_0 != this.last_scale_0 || this.core.marina.scale_1 != this.last_scale_1 || this.core.marina.scaleXY != this.last_scale_XY) {
                    packets.push(new UpdatePlayerScalePacket(this.core.marina as unknown as Actor, this.ModLoader.clientLobby))
                }

                /* FIXME: This is absolutely busted
                 * No, seriously
                 *  - Actor positions will always attenuate between clients because the AI is client-sided
                 *    So for AI actors, thier pos / vel will result in a jittery mess and sometimes even cause them to fly to the moon (see Wormin' Up)
                 *  - For some reason syncing mode leads to a emulator crash
                 *  - Syncing status causes bugs when another client grabs an actor (which will always be the case unless the scene sync isn't even running because there is only one player)
                 *  - Some special effects don't die
                 *  - Sometimes switching zones in a level will cause the actors from the previous zone to warp to the left-or-right side of the screen (They're probably supposed to unload)
                 *  - Sometimes the end-of-level star doesn't even appear (see any boss that has an end-of-level-star spawn once they are defeated)
                 *  - Sometimes random actors from scenes past become alive
                 *  - Probably a lot more lul
                 * To get this working I might have to have a special case for certain categories of actors, and to omit more than just puppet actors.
                */
                if (this.scene_sync) { // TODO: Add this to a config... should I even?
                    let updated_actors: SceneActorUpdate[] = []
                    for (i = 1; i < 0x40; i++) {
                        if (!this.puppet_overlord.isIndexPuppet(i)) {
                            this.scene_actors[i].update(this.core.marina.camera_pos_final)
                            if (this.scene_actors[i].changed) {
                                this.scene_actors[i].changed = false
                                updated_actors.push(this.scene_actors[i].getPacketData())
                            }
                        }
                    }

                    if (updated_actors.length > 0) {
                        packets.push(new SceneUpdatePacket(updated_actors, this.core.game.current_scene, this.ModLoader.clientLobby))
                    }
                }
            }


            if (frame % 5 == 0) {
                packets.push(new UpdatePlayerDataPacket(this.core.marina as unknown as Actor, this.ModLoader.clientLobby))
            }
            if (frame % 60 == 0) {
                // Every second, update pos and vel
                packets.push(new UpdatePlayerVelocityPacket(this.core.marina.velocity, this.ModLoader.clientLobby))
                packets.push(new UpdatePlayerPositionPacket(new Vector3(this.core.marina.real_pos.x, this.core.marina.real_pos.y, this.core.marina.pos_2.z), this.ModLoader.clientLobby))
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
                packets.push(new UpdatePlayerPositionPacket(new Vector3(this.core.marina.real_pos.x, this.core.marina.real_pos.y, this.core.marina.pos_2.z), this.ModLoader.clientLobby))
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
        this.last_game_state = this.core.game.game_state
        this.last_frame = frame
    }

    arePuppetsSafe(): boolean {
        return (!this.core.game.in_cutscene && !this.core.game.is_paused && this.core.game.game_state == 6 && this.core.game.stage_timer > 30)
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

    @NetworkHandler('mmo_sSceneU')
    onSceneUpdate(packet: SceneUpdatePacket) {
        if (this.arePuppetsSafe() && packet.scene == this.last_scene) {
            let index_0

            for (index_0 = 0; index_0 < packet.update_data.length; index_0++) {
                if (!this.puppet_overlord.isIndexPuppet(packet.update_data[index_0].index)) {
                    this.scene_actors[packet.update_data[index_0].index].setDataFromPacket(packet.update_data[index_0], this.core.marina.camera_pos_final)
                }
            }
        }
    }
}

export default MischiefMakersClient

