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
const MischiefMakers_1 = require("./Core/MischiefMakers/MischiefMakers");
const MischiefMakersClient_1 = __importDefault(require("./MischiefMakersClient"));
const MischiefMakersServer_1 = __importDefault(require("./MischiefMakersServer"));
class MischiefMakersOnline {
    constructor() {
        this.ModLoader = {};
        this.name = "MischiefMakersOnline";
        this.core = new MischiefMakers_1.MischiefMakers();
    }
    sendPacketToPlayersInScene(packet) {
        if (this.server !== undefined) {
            this.server.sendPacketToPlayersInScene(packet);
        }
    }
    preinit() { }
    init() { }
    postinit() { }
    onTick(frame) { }
    onClient_InjectFinished(evt) { }
}
__decorate([
    SidedProxy_1.SidedProxy(0 /* CLIENT */, MischiefMakersClient_1.default)
], MischiefMakersOnline.prototype, "client", void 0);
__decorate([
    SidedProxy_1.SidedProxy(1 /* SERVER */, MischiefMakersServer_1.default)
], MischiefMakersOnline.prototype, "server", void 0);
__decorate([
    EventHandler_1.EventHandler(EventHandler_1.EventsClient.ON_INJECT_FINISHED)
], MischiefMakersOnline.prototype, "onClient_InjectFinished", null);
exports.MischiefMakersOnline = MischiefMakersOnline;
module.exports = MischiefMakersOnline;
exports.default = MischiefMakersOnline;
//# sourceMappingURL=MischiefMakersOnline.js.map