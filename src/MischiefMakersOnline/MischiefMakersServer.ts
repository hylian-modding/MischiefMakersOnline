import { EventHandler, EventsServer, EventServerJoined, EventServerLeft, bus } from 'modloader64_api/EventHandler';
import { ParentReference, SidedProxy, ProxySide } from 'modloader64_api/SidedProxy/SidedProxy';
import { ModLoaderAPIInject } from 'modloader64_api/ModLoaderAPIInjector';
import { IModLoaderAPI, ModLoaderEvents } from 'modloader64_api/IModLoaderAPI';
import { IPacketHeader, ServerNetworkHandler, INetworkPlayer } from 'modloader64_api/NetworkHandler';
import MischiefMakersOnline from './MischiefMakersOnline';
import MischiefMakersOnlineStorage from './MischiefMakersOnlineStorage';
import { GoldGemsPacket, UnlockedLevelsPacket, BestTimesPacket, UpdatePlayerPositionPacket, UpdatePlayerRGBAPacket, UpdatePlayerVelocityPacket, UpdatePlayerDataPacket, PingServerPacket, SceneChangePacket, UpdatePlayerScalePacket, SceneUpdatePacket } from './MischiefMakersPacketTypes'
import { Packet } from 'modloader64_api/ModLoaderDefaultImpls';
import { throws } from 'assert';
import { SceneActorUpdate } from './Core/MischiefMakers/API/IActor';

class MischiefMakersServer {
    @ModLoaderAPIInject() ModLoader!: IModLoaderAPI;

    @ParentReference() parent!: MischiefMakersOnline

    @EventHandler(EventsServer.ON_LOBBY_CREATE)
    onLobbyCreated(lobby: string) {
        try { this.ModLoader.lobbyManager.createLobbyStorage(lobby, this.parent, new MischiefMakersOnlineStorage()); }
        catch(err) { this.ModLoader.logger.error("Failed to create lobby: " + err) }
    }

    @EventHandler(EventsServer.ON_LOBBY_JOIN)
    onLobbyJoinedServer(evt: EventServerJoined) {
        let storage: MischiefMakersOnlineStorage = this.ModLoader.lobbyManager.getLobbyStorage(evt.lobby, this.parent)

        if (storage === null) return

        storage.players[evt.player.uuid] = -1
        storage.networkPlayerInstances[evt.player.uuid] = evt.player
        storage.scenes[evt.player.uuid] = 0
        storage.scene_data[evt.lobby] = []
    }

    @EventHandler(EventsServer.ON_LOBBY_LEAVE)
    onLobbyLeftServer(evt: EventServerLeft) {
        let storage: MischiefMakersOnlineStorage = this.ModLoader.lobbyManager.getLobbyStorage(evt.lobby, this.parent)

        if (storage == null) return

        delete storage.players[evt.player.uuid]
        delete storage.networkPlayerInstances[evt.player.uuid]
        delete storage.scenes[evt.player.uuid]
        delete storage.scene_data[evt.lobby]
    }


    sendPacketToAllPlayers(packet: IPacketHeader) {
        try {
            let storage: MischiefMakersOnlineStorage = this.ModLoader.lobbyManager.getLobbyStorage(packet.lobby, this.parent)

            if (storage === null) return

            Object.keys(storage.players).forEach((key: string) => {
                this.ModLoader.serverSide.sendPacketToSpecificPlayer(packet, storage.networkPlayerInstances[key])
            })
        } catch(err) {}
    }

    sendPacketToAllPlayersExceptSender(packet: IPacketHeader) {
        try {
            let storage: MischiefMakersOnlineStorage = this.ModLoader.lobbyManager.getLobbyStorage(packet.lobby, this.parent)

            if (storage === null) return

            Object.keys(storage.players).forEach((key: string) => {
                if ((storage.networkPlayerInstances[key] as unknown as INetworkPlayer).uuid != packet.player.uuid) {
                    this.ModLoader.serverSide.sendPacketToSpecificPlayer(packet, storage.networkPlayerInstances[key])
                }
            })
        } catch(err) {}
    }

    sendPacketToPlayersInScene(packet: IPacketHeader) {
        try {
            let storage: MischiefMakersOnlineStorage = this.ModLoader.lobbyManager.getLobbyStorage(packet.lobby, this.parent)

            if (storage === null) return

            Object.keys(storage.players).forEach((key: string) => {
                if (storage.scenes[packet.player.uuid] == storage.scenes[(storage.networkPlayerInstances[key] as unknown as INetworkPlayer).uuid]) {
                    this.ModLoader.serverSide.sendPacketToSpecificPlayer(packet, storage.networkPlayerInstances[key])
                }
            })
        } catch(err) {}
    }

    sendPacketToPlayersInSceneExceptSender(packet: IPacketHeader) {
        try {
            let storage: MischiefMakersOnlineStorage = this.ModLoader.lobbyManager.getLobbyStorage(packet.lobby, this.parent)

            if (storage === null) return

            Object.keys(storage.players).forEach((key: string) => {
                if (storage.scenes[packet.player.uuid][0] == storage.scenes[(storage.networkPlayerInstances[key] as unknown as INetworkPlayer).uuid][0]) {
                    if ((storage.networkPlayerInstances[key] as unknown as INetworkPlayer).uuid != packet.player.uuid) {
                        this.ModLoader.serverSide.sendPacketToSpecificPlayer(packet, storage.networkPlayerInstances[key])
                    }
                }
            })
        } catch(err) {}
    }


    // Progress Syncing

    @ServerNetworkHandler('mmo_cGold')
    onSyncGoldGemsServer(packet: GoldGemsPacket) {
        try {
            let storage: MischiefMakersOnlineStorage = this.ModLoader.lobbyManager.getLobbyStorage(packet.lobby, this.parent)

            if (storage === null) return

            for (let i = 0; i < 8; i++) {
                storage.gold_gems[i] |= packet.gold_gems[i]
            }

            this.sendPacketToAllPlayers(new GoldGemsPacket(storage.gold_gems, packet.lobby, 1))
        }
        catch (err) {}
    }

    @ServerNetworkHandler('mmo_cLevels')
    onSyncLevelStatusServer(packet: UnlockedLevelsPacket) {
        try {
            let storage: MischiefMakersOnlineStorage = this.ModLoader.lobbyManager.getLobbyStorage(packet.lobby, this.parent)

            if (storage === null) return

            /*for (let i = 0; i < 4; i++) {
                storage.unlocked_levels[i] |= packet.unlocked_levels[i]
            }*/

            if (storage.unlocked_levels.readInt32BE(0) < packet.unlocked_levels.readInt32BE(0))
            {
                storage.unlocked_levels = packet.unlocked_levels
                this.sendPacketToAllPlayers(new UnlockedLevelsPacket(storage.unlocked_levels, packet.lobby, 1))
            }
        }
        catch (err) {}
    }

    @ServerNetworkHandler('mmo_cTimes')
    onSyncBestTimesServer(packet: BestTimesPacket) {
        try {
            let storage: MischiefMakersOnlineStorage = this.ModLoader.lobbyManager.getLobbyStorage(packet.lobby, this.parent)

            if (storage === null) return

            storage.best_times = packet.best_times
            this.sendPacketToAllPlayers(new BestTimesPacket(storage.best_times, packet.lobby, 1))
        }
        catch (err) {}
    }

    @ServerNetworkHandler('mmo_cPos')
    onUpdateCurrentPositionServer(packet: UpdatePlayerPositionPacket) {
        packet.packet_id = "mmo_sPos"
        this.sendPacketToPlayersInSceneExceptSender(packet)
    }

    @ServerNetworkHandler('mmo_cVel')
    onUpdateCurrentVelocityServer(packet: UpdatePlayerVelocityPacket) {
        packet.packet_id = "mmo_sVel"
        this.sendPacketToPlayersInSceneExceptSender(packet)
    }

    @ServerNetworkHandler('mmo_cRGBA')
    onUpdateCurrentRGBAServer(packet: UpdatePlayerRGBAPacket) {}

    @ServerNetworkHandler('mmo_cPData')
    onUpdatePlayerDataServer(packet: UpdatePlayerDataPacket) {
        packet.packet_id = "mmo_sPData"
        this.sendPacketToPlayersInSceneExceptSender(packet)
    }

    @ServerNetworkHandler('mmo_cPScale')
    onPlayerScale(packet: UpdatePlayerScalePacket) {
        packet.packet_id = "mmo_sPScale"
        this.sendPacketToPlayersInSceneExceptSender(packet)
    }

    @ServerNetworkHandler('mmo_cPing')
    onPing(packet: PingServerPacket) {
        packet.packet_id = "mmo_sPing"
        this.ModLoader.serverSide.sendPacketToSpecificPlayer(packet, packet.player)
    }

    @ServerNetworkHandler('mmo_cPPing')
    onPlayerPing(packet: PingServerPacket) {
        packet.packet_id = "mmo_sPPing"
        this.sendPacketToPlayersInSceneExceptSender(packet)
    }

    @ServerNetworkHandler('mmo_cScene')
    onSceneChange(packet: SceneChangePacket) {
        let storage: MischiefMakersOnlineStorage = this.ModLoader.lobbyManager.getLobbyStorage(packet.lobby, this.parent)
        if (storage === null) return

        let num_in_last_scene = 0
        let num_in_new_scene = 0
        Object.keys(storage.players).forEach((key: string) => {
            if ((storage.networkPlayerInstances[key] as unknown as INetworkPlayer).uuid != packet.player.uuid) {
                if (storage.scenes[(storage.networkPlayerInstances[key] as unknown as INetworkPlayer).uuid] == storage.scenes[packet.player.uuid]) num_in_last_scene++
                if (storage.scenes[(storage.networkPlayerInstances[key] as unknown as INetworkPlayer).uuid] == packet.scene) num_in_new_scene++
            }
        })

        storage.scenes[packet.player.uuid] = packet.scene
        packet.packet_id = "mmo_sScene"

        if (num_in_last_scene == 0) storage.scene_data[packet.lobby][storage.scenes[packet.player.uuid]] = []
        if (!storage.scene_data[packet.lobby][packet.scene] || num_in_new_scene == 0) storage.scene_data[packet.lobby][packet.scene] = []

        if (num_in_new_scene > 0) {
            this.ModLoader.serverSide.sendPacketToSpecificPlayer(new SceneUpdatePacket(storage.scene_data[packet.lobby][packet.scene], packet.scene, packet.lobby, 1), packet.player)
        }

        this.sendPacketToAllPlayersExceptSender(packet)
        this.ModLoader.logger.info("Player " + packet.player.nickname + " [" + packet.player.uuid + "] moved to scene " + packet.scene)
    }

    @ServerNetworkHandler('mmo_cSceneU')
    onSceneUpdate(packet: SceneUpdatePacket) {
        let storage: MischiefMakersOnlineStorage = this.ModLoader.lobbyManager.getLobbyStorage(packet.lobby, this.parent)
        if (storage === null) return

        if (storage.scene_data[packet.lobby][packet.scene]) {
            let index_0, index_1

            for (index_0 = 0; index_0 < packet.update_data.length; index_0++) {
                let actor_found = false
                let this_actor_index = packet.update_data[index_0].index

                for (index_1 = 0; index_1 < storage.scene_data[packet.lobby][packet.scene].length; index_1++) {
                    let scene_actor_index = (storage.scene_data[packet.lobby][packet.scene][index_1] as SceneActorUpdate).index

                    if (scene_actor_index == this_actor_index) {
                        actor_found = true
                        storage.scene_data[packet.lobby][packet.scene][index_1] = packet.update_data[index_0]
                        break
                    }
                }

                if (!actor_found) {
                    storage.scene_data[packet.lobby][packet.scene].push(packet.update_data[index_0])
                }
            }

            packet.packet_id = "mmo_sSceneU"
            packet.update_data = storage.scene_data[packet.lobby][packet.scene]
            this.sendPacketToPlayersInSceneExceptSender(packet)
        }
    }
}

export default MischiefMakersServer

