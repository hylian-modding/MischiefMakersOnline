import { EventHandler, EventsServer, EventServerJoined, EventServerLeft, bus } from 'modloader64_api/EventHandler';
import { ParentReference, SidedProxy, ProxySide } from 'modloader64_api/SidedProxy/SidedProxy';
import { ModLoaderAPIInject } from 'modloader64_api/ModLoaderAPIInjector';
import { IModLoaderAPI, ModLoaderEvents } from 'modloader64_api/IModLoaderAPI';
import { IPacketHeader, ServerNetworkHandler } from 'modloader64_api/NetworkHandler';
import MischiefMakersOnline from './MischiefMakersOnline';
import MischiefMakersOnlineStorage from './MischiefMakersOnlineStorage';
import { GoldGemsPacket, UnlockedLevelsPacket, BestTimesPacket, CurrentStagePacket, UpdatePlayerPositionPacket, UpdatePlayerRGBAPacket, UpdatePlayerVelocityPacket, UpdatePlayerDataPacket } from './MischiefMakersPacketTypes'

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
    }

    @EventHandler(EventsServer.ON_LOBBY_LEAVE)
    onLobbyLeftServer(evt: EventServerLeft) {
        let storage: MischiefMakersOnlineStorage = this.ModLoader.lobbyManager.getLobbyStorage(evt.lobby, this.parent)

        if (storage == null) return

        delete storage.players[evt.player.uuid]
        delete storage.networkPlayerInstances[evt.player.uuid]
    }


    sendPacketToPlayersInScene(packet: IPacketHeader) {
        try {
            let storage: MischiefMakersOnlineStorage = this.ModLoader.lobbyManager.getLobbyStorage(packet.lobby, this.parent)

            if (storage === null) return

            //TODO: Fix the current scene check
            Object.keys(storage.players).forEach((key: string) => {
                this.ModLoader.serverSide.sendPacketToSpecificPlayer(packet, storage.networkPlayerInstances[key])
            })
        } catch(err) {}
    }


    // Progress Syncing

    // Gold Gems
    @ServerNetworkHandler('mmo_cGold')
    onSyncGoldGemsServer(packet: GoldGemsPacket) {
        try {
            let storage: MischiefMakersOnlineStorage = this.ModLoader.lobbyManager.getLobbyStorage(packet.lobby, this.parent)

            if (storage === null) return

            for (let i = 0; i < 8; i++) {
                storage.gold_gems[i] |= packet.gold_gems[i]
            }

            this.sendPacketToPlayersInScene(new GoldGemsPacket(storage.gold_gems, packet.lobby, 1))

            this.ModLoader.logger.info("got mmo_cGold: " + storage.gold_gems.readBigUInt64BE(0).toString(16))
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
                this.sendPacketToPlayersInScene(new UnlockedLevelsPacket(storage.unlocked_levels, packet.lobby, 1))
            }

            

            this.ModLoader.logger.info("got mmo_cLevels: " + storage.unlocked_levels.readInt32BE(0).toString(16))
        }
        catch (err) {}
    }

    @ServerNetworkHandler('mmo_cTimes')
    onSyncBestTimesServer(packet: BestTimesPacket) {
        try {
            let storage: MischiefMakersOnlineStorage = this.ModLoader.lobbyManager.getLobbyStorage(packet.lobby, this.parent)

            if (storage === null) return

            storage.best_times = packet.best_times
            this.sendPacketToPlayersInScene(new BestTimesPacket(storage.best_times, packet.lobby, 1))

            this.ModLoader.logger.info("got mmo_cTimes")
        }
        catch (err) {}
    }

    @ServerNetworkHandler('mmo_cStage')
    onUpdateCurrentStageServer(packet: CurrentStagePacket) {}

    @ServerNetworkHandler('mmo_cPos')
    onUpdateCurrentPositionServer(packet: UpdatePlayerPositionPacket) {
        packet.packet_id = "mmo_sPos"
        this.sendPacketToPlayersInScene(packet);
    }

    @ServerNetworkHandler('mmo_cVel')
    onUpdateCurrentVelocityServer(packet: UpdatePlayerVelocityPacket) {
        packet.packet_id = "mmo_sVel"
        this.sendPacketToPlayersInScene(packet);
    }

    @ServerNetworkHandler('mmo_cRGBA')
    onUpdateCurrentRGBAServer(packet: UpdatePlayerRGBAPacket) {}

    @ServerNetworkHandler('mmo_cPData')
    onUpdatePlayerDataServer(packet: UpdatePlayerDataPacket) {
        packet.packet_id = "mmo_sPData"
        this.sendPacketToPlayersInScene(packet);
    }


}

export default MischiefMakersServer

