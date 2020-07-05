import { EventHandler, EventsServer, EventServerJoined, EventServerLeft, bus } from 'modloader64_api/EventHandler';
import { ParentReference, SidedProxy, ProxySide } from 'modloader64_api/SidedProxy/SidedProxy';
import { ModLoaderAPIInject } from 'modloader64_api/ModLoaderAPIInjector';
import { IModLoaderAPI, ModLoaderEvents } from 'modloader64_api/IModLoaderAPI';
import { IPacketHeader, ServerNetworkHandler, INetworkPlayer } from 'modloader64_api/NetworkHandler';
import MischiefMakersOnline from './MischiefMakersOnline';
import MischiefMakersOnlineStorage from './MischiefMakersOnlineStorage';
import { GoldGemsPacket, UnlockedLevelsPacket, BestTimesPacket, UpdatePlayerPositionPacket, UpdatePlayerRGBAPacket, UpdatePlayerVelocityPacket, UpdatePlayerDataPacket, PingServerPacket, SceneChangePacket, UpdatePlayerScalePacket } from './MischiefMakersPacketTypes'

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
    }

    @EventHandler(EventsServer.ON_LOBBY_LEAVE)
    onLobbyLeftServer(evt: EventServerLeft) {
        let storage: MischiefMakersOnlineStorage = this.ModLoader.lobbyManager.getLobbyStorage(evt.lobby, this.parent)

        if (storage == null) return

        delete storage.players[evt.player.uuid]
        delete storage.networkPlayerInstances[evt.player.uuid]
        delete storage.scenes[evt.player.uuid]
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
                if (storage.scenes[packet.player.uuid] == storage.scenes[(storage.networkPlayerInstances[key] as unknown as INetworkPlayer).uuid]) {
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
        storage.scenes[packet.player.uuid] = packet.scene
        packet.packet_id = "mmo_sScene"
        this.sendPacketToAllPlayersExceptSender(packet)
        this.ModLoader.logger.info("Player " + packet.player.nickname + " [" + packet.player.uuid + "] moved to scene " + packet.scene)
    }


}

export default MischiefMakersServer

