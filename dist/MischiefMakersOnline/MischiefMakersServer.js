"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const EventHandler_1 = require("modloader64_api/EventHandler");
const SidedProxy_1 = require("modloader64_api/SidedProxy/SidedProxy");
const ModLoaderAPIInjector_1 = require("modloader64_api/ModLoaderAPIInjector");
const NetworkHandler_1 = require("modloader64_api/NetworkHandler");
const MischiefMakersOnlineStorage_1 = __importDefault(require("./MischiefMakersOnlineStorage"));
const MischiefMakersPacketTypes_1 = require("./MischiefMakersPacketTypes");
class MischiefMakersServer {
    onLobbyCreated(lobby) {
        try {
            this.ModLoader.lobbyManager.createLobbyStorage(lobby, this.parent, new MischiefMakersOnlineStorage_1.default());
        }
        catch (err) {
            this.ModLoader.logger.error("Failed to create lobby: " + err);
        }
    }
    onLobbyJoinedServer(evt) {
        let storage = this.ModLoader.lobbyManager.getLobbyStorage(evt.lobby, this.parent);
        if (storage === null)
            return;
        storage.players[evt.player.uuid] = -1;
        storage.networkPlayerInstances[evt.player.uuid] = evt.player;
    }
    onLobbyLeftServer(evt) {
        let storage = this.ModLoader.lobbyManager.getLobbyStorage(evt.lobby, this.parent);
        if (storage == null)
            return;
        delete storage.players[evt.player.uuid];
        delete storage.networkPlayerInstances[evt.player.uuid];
    }
    sendPacketToPlayersInScene(packet) {
        try {
            let storage = this.ModLoader.lobbyManager.getLobbyStorage(packet.lobby, this.parent);
            if (storage === null)
                return;
            //TODO: Fix the current scene check
            Object.keys(storage.players).forEach((key) => {
                this.ModLoader.serverSide.sendPacketToSpecificPlayer(packet, storage.networkPlayerInstances[key]);
            });
        }
        catch (err) { }
    }
    // Progress Syncing
    // Gold Gems
    onSyncGoldGemsServer(packet) {
        try {
            let storage = this.ModLoader.lobbyManager.getLobbyStorage(packet.lobby, this.parent);
            if (storage === null)
                return;
            for (let i = 0; i < 8; i++) {
                storage.gold_gems[i] |= packet.gold_gems[i];
            }
            this.sendPacketToPlayersInScene(new MischiefMakersPacketTypes_1.GoldGemsPacket(storage.gold_gems, packet.lobby, 1));
            this.ModLoader.logger.info("got mmo_cGold: " + storage.gold_gems.readBigUInt64BE(0).toString(16));
        }
        catch (err) { }
    }
    onSyncLevelStatusServer(packet) {
        try {
            let storage = this.ModLoader.lobbyManager.getLobbyStorage(packet.lobby, this.parent);
            if (storage === null)
                return;
            /*for (let i = 0; i < 4; i++) {
                storage.unlocked_levels[i] |= packet.unlocked_levels[i]
            }*/
            if (storage.unlocked_levels.readInt32BE(0) < packet.unlocked_levels.readInt32BE(0)) {
                storage.unlocked_levels = packet.unlocked_levels;
                this.sendPacketToPlayersInScene(new MischiefMakersPacketTypes_1.UnlockedLevelsPacket(storage.unlocked_levels, packet.lobby, 1));
            }
            this.ModLoader.logger.info("got mmo_cLevels: " + storage.unlocked_levels.readInt32BE(0).toString(16));
        }
        catch (err) { }
    }
    onSyncBestTimesServer(packet) {
        try {
            let storage = this.ModLoader.lobbyManager.getLobbyStorage(packet.lobby, this.parent);
            if (storage === null)
                return;
            storage.best_times = packet.best_times;
            this.sendPacketToPlayersInScene(new MischiefMakersPacketTypes_1.BestTimesPacket(storage.best_times, packet.lobby, 1));
            this.ModLoader.logger.info("got mmo_cTimes");
        }
        catch (err) { }
    }
    onUpdateCurrentStageServer(packet) { }
    onUpdateCurrentPositionServer(packet) {
        packet.packet_id = "mmo_sPos";
        this.sendPacketToPlayersInScene(packet);
    }
    onUpdateCurrentVelocityServer(packet) {
        packet.packet_id = "mmo_sVel";
        this.sendPacketToPlayersInScene(packet);
    }
    onUpdateCurrentRGBAServer(packet) { }
    onUpdatePlayerDataServer(packet) {
        packet.packet_id = "mmo_sPData";
        this.sendPacketToPlayersInScene(packet);
        this.ModLoader.logger.info("got mmo_cPData");
    }
}
__decorate([
    ModLoaderAPIInjector_1.ModLoaderAPIInject()
], MischiefMakersServer.prototype, "ModLoader", void 0);
__decorate([
    SidedProxy_1.ParentReference()
], MischiefMakersServer.prototype, "parent", void 0);
__decorate([
    EventHandler_1.EventHandler(EventHandler_1.EventsServer.ON_LOBBY_CREATE)
], MischiefMakersServer.prototype, "onLobbyCreated", null);
__decorate([
    EventHandler_1.EventHandler(EventHandler_1.EventsServer.ON_LOBBY_JOIN)
], MischiefMakersServer.prototype, "onLobbyJoinedServer", null);
__decorate([
    EventHandler_1.EventHandler(EventHandler_1.EventsServer.ON_LOBBY_LEAVE)
], MischiefMakersServer.prototype, "onLobbyLeftServer", null);
__decorate([
    NetworkHandler_1.ServerNetworkHandler('mmo_cGold')
], MischiefMakersServer.prototype, "onSyncGoldGemsServer", null);
__decorate([
    NetworkHandler_1.ServerNetworkHandler('mmo_cLevels')
], MischiefMakersServer.prototype, "onSyncLevelStatusServer", null);
__decorate([
    NetworkHandler_1.ServerNetworkHandler('mmo_cTimes')
], MischiefMakersServer.prototype, "onSyncBestTimesServer", null);
__decorate([
    NetworkHandler_1.ServerNetworkHandler('mmo_cStage')
], MischiefMakersServer.prototype, "onUpdateCurrentStageServer", null);
__decorate([
    NetworkHandler_1.ServerNetworkHandler('mmo_cPos')
], MischiefMakersServer.prototype, "onUpdateCurrentPositionServer", null);
__decorate([
    NetworkHandler_1.ServerNetworkHandler('mmo_cVel')
], MischiefMakersServer.prototype, "onUpdateCurrentVelocityServer", null);
__decorate([
    NetworkHandler_1.ServerNetworkHandler('mmo_cRGBA')
], MischiefMakersServer.prototype, "onUpdateCurrentRGBAServer", null);
__decorate([
    NetworkHandler_1.ServerNetworkHandler('mmo_cPData')
], MischiefMakersServer.prototype, "onUpdatePlayerDataServer", null);
exports.default = MischiefMakersServer;
//# sourceMappingURL=MischiefMakersServer.js.map