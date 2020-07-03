"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const NetworkHandler_1 = require("modloader64_api/NetworkHandler");
const MischiefMakers_1 = require("./Core/MischiefMakers/MischiefMakers");
const PluginLifecycle_1 = require("modloader64_api/PluginLifecycle");
const ModLoaderAPIInjector_1 = require("modloader64_api/ModLoaderAPIInjector");
const IActor_1 = require("./Core/MischiefMakers/API/IActor");
const MischiefMakersPacketTypes_1 = require("./MischiefMakersPacketTypes");
const ISave_1 = require("./Core/MischiefMakers/API/ISave");
const MischiefMakersPuppet_1 = __importStar(require("./MischiefMakersPuppet"));
const IGame_1 = require("./Core/MischiefMakers/API/IGame");
const Vector3_1 = __importDefault(require("modloader64_api/math/Vector3"));
const Vector2_1 = __importDefault(require("./Core/MischiefMakers/Math/Vector2"));
const DT = 1 / 60;
class MischiefMakersClient {
    constructor() {
        this.core = new MischiefMakers_1.MischiefMakers();
    }
    preinit() { }
    init() { }
    postinit() {
        this.last_player_state = Buffer.alloc(0x198);
        this.last_gold_gems = Buffer.alloc(8);
        this.last_unlocked_levels = Buffer.alloc(4);
        this.last_best_times = Buffer.alloc(0x90);
        this.last_velocity = new Vector2_1.default();
        this.last_frame = 0;
        this.puppet_overlord = new MischiefMakersPuppet_1.default(this.ModLoader);
        this.core.marina = new IActor_1.Player(this.ModLoader.emulator, 0);
        this.core.game = new IGame_1.Game(this.ModLoader.emulator);
        this.core.save = new ISave_1.Save(this.ModLoader.emulator);
    }
    onTick(frame) {
        let i = 0;
        let packets = [];
        // Assuming that all client changes are safe enough; with safety on the server
        if (!this.core.save.gold_gems.equals(this.last_gold_gems)) {
            packets.push(new MischiefMakersPacketTypes_1.GoldGemsPacket(this.core.save.gold_gems, this.ModLoader.clientLobby));
            this.last_gold_gems = this.core.save.gold_gems;
        }
        if (!this.core.save.unlocked_levels.equals(this.last_unlocked_levels)) {
            packets.push(new MischiefMakersPacketTypes_1.UnlockedLevelsPacket(this.core.save.unlocked_levels, this.ModLoader.clientLobby));
            this.last_unlocked_levels = this.core.save.unlocked_levels;
        }
        if (!this.core.save.best_times.equals(this.last_best_times)) {
            packets.push(new MischiefMakersPacketTypes_1.BestTimesPacket(this.core.save.best_times, this.ModLoader.clientLobby));
            this.last_best_times = this.core.save.best_times;
        }
        if (this.core.game.in_cutscene == 0 && this.core.game.is_paused == 0) {
            if (frame % 3 == 0) {
                // If moving, update position, always update velocity
                packets.push(new MischiefMakersPacketTypes_1.UpdatePlayerVelocityPacket(this.core.marina.velocity, this.ModLoader.clientLobby));
                if (this.core.marina.velocity.magnitude() != 0)
                    packets.push(new MischiefMakersPacketTypes_1.UpdatePlayerPositionPacket(this.core.marina.real_pos, this.ModLoader.clientLobby));
            }
            else if (frame % 6 == 0) {
                packets.push(new MischiefMakersPacketTypes_1.UpdatePlayerDataPacket(this.core.marina, this.ModLoader.clientLobby));
            }
            // Instantly update if changed direction or stopped/started moving
            if (this.last_velocity.minus(this.core.marina.velocity).normalized().dot(this.core.marina.velocity.normalized()) < 0 ||
                ((this.last_velocity.magnitude() != 0 && this.core.marina.velocity.magnitude() == 0) ||
                    (this.last_velocity.magnitude() == 0 && this.core.marina.velocity.magnitude() != 0))) {
                // Remove old packets so that we don't send more data than we need
                let bad_indexes = [];
                for (i = 0; i < packets.length; i++) {
                    if (packets[i].packet_id == "mmo_cPos" || packets[i].packet_id == "mmo_cVel") {
                        bad_indexes.push(i);
                    }
                }
                for (i = 0; i < bad_indexes.length; i++) {
                    packets.slice(bad_indexes[i]);
                }
                packets.push(new MischiefMakersPacketTypes_1.UpdatePlayerVelocityPacket(this.core.marina.velocity, this.ModLoader.clientLobby));
                packets.push(new MischiefMakersPacketTypes_1.UpdatePlayerPositionPacket(this.core.marina.real_pos, this.ModLoader.clientLobby));
            }
        }
        else if (this.core.game.in_cutscene || this.core.game.is_paused) {
            this.puppet_overlord.freeAllPuppets();
        }
        let delta_pos, extrap_pos, nf;
        for (i = 0; i < MischiefMakersPuppet_1.ACTOR_LIST_NUM_GENERATED; i++) {
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
                let lv = new Vector2_1.default(this.puppet_overlord.puppets[i].last_vel.x, this.puppet_overlord.puppets[i].last_vel.y);
                if (lv.magnitude() != 0) {
                    extrap_pos = new Vector3_1.default(this.puppet_overlord.puppets[i].last_pos.x + (lv.x * (frame - this.puppet_overlord.puppets[i].last_update)), this.puppet_overlord.puppets[i].last_pos.y + (lv.y * (frame - this.puppet_overlord.puppets[i].last_update)), 0);
                    delta_pos = new Vector3_1.default(extrap_pos.x - this.core.marina.camera_pos_final.x, extrap_pos.y - this.core.marina.camera_pos_final.y, 0);
                    this.puppet_overlord.puppets[i].actor.pos_2 = delta_pos;
                    this.puppet_overlord.puppets[i].actor.velocity = new Vector2_1.default();
                }
            }
            else if (this.puppet_overlord.puppets[i].in_use && this.puppet_overlord.puppets[i].actor.health <= 0) {
                this.puppet_overlord.freePuppet(this.puppet_overlord.puppets[i].uuid);
            }
        }
        for (i = 0; i < packets.length; i++) {
            this.ModLoader.clientSide.sendPacket(packets[i]);
        }
        this.last_velocity = this.core.marina.velocity;
        this.last_player_state = this.ModLoader.emulator.rdramReadBuffer(IActor_1.ACTOR_LIST_POINTER, 0x198);
        this.last_frame = frame;
    }
    onGoldGemsPacket(packet) {
        this.core.save.gold_gems = packet.gold_gems;
        this.last_gold_gems = packet.gold_gems;
        this.ModLoader.logger.info("Gold Gems Update [mmo_sGold]: " + this.core.save.gold_gems.readBigUInt64BE(0).toString(16));
    }
    onUnlockedLevelsPacket(packet) {
        this.core.save.unlocked_levels = packet.unlocked_levels;
        this.last_unlocked_levels = packet.unlocked_levels;
        this.ModLoader.logger.info("Unlocked Levels Update [mmo_sLevels]: " + this.core.save.unlocked_levels.readUInt32BE(0).toString(16));
    }
    onBestTimesPacket(packet) {
        this.ModLoader.logger.info("Best Times Update [mmo_sTimes]");
        this.core.save.best_times = packet.best_times;
        this.last_best_times = packet.best_times;
    }
    onPosPacket(packet) {
        if (packet.player.uuid != this.ModLoader.me.uuid) {
            let player_puppet = this.puppet_overlord.getPuppet(packet.player.uuid);
            if (player_puppet != null) {
                player_puppet.last_pos = packet.pos;
                player_puppet.last_update = this.last_frame;
            }
            else {
                let result = this.puppet_overlord.addPuppet(packet.player.uuid);
                this.ModLoader.logger.warn("Trying to make puppet for " + packet.player.uuid + "... " + `${(result) ? 'success' : 'fail'}`);
            }
        }
    }
    onVelPacket(packet) {
        if (packet.player.uuid != this.ModLoader.me.uuid) {
            let player_puppet = this.puppet_overlord.getPuppet(packet.player.uuid);
            if (player_puppet != null) {
                player_puppet.last_vel = packet.vel;
                player_puppet.last_update = this.last_frame;
            }
        }
    }
    onPlayerData(packet) {
        if (packet.player.uuid != this.ModLoader.me.uuid) {
            let player_puppet = this.puppet_overlord.getPuppet(packet.player.uuid);
            if (player_puppet != null) {
                this.ModLoader.logger.info(packet.player.uuid + "\'s data update [mmo_sPData]");
                player_puppet.actor.mode = packet.mode;
                player_puppet.actor.flags_0 = packet.flags_0;
                player_puppet.actor.effect_flags = packet.effect_flags;
                player_puppet.actor.flags_1 = packet.flags_1;
                player_puppet.actor.air_ground_state = packet.air_ground_state;
                player_puppet.actor.idle_time = packet.idle_time;
                player_puppet.actor.anim_flags = packet.anim_flags;
                //player_puppet.actor.flags_2 = packet.flags_2
            }
        }
    }
}
__decorate([
    ModLoaderAPIInjector_1.ModLoaderAPIInject()
], MischiefMakersClient.prototype, "ModLoader", void 0);
__decorate([
    PluginLifecycle_1.Preinit()
], MischiefMakersClient.prototype, "preinit", null);
__decorate([
    PluginLifecycle_1.Init()
], MischiefMakersClient.prototype, "init", null);
__decorate([
    PluginLifecycle_1.Postinit()
], MischiefMakersClient.prototype, "postinit", null);
__decorate([
    PluginLifecycle_1.onTick()
], MischiefMakersClient.prototype, "onTick", null);
__decorate([
    NetworkHandler_1.NetworkHandler('mmo_sGold')
], MischiefMakersClient.prototype, "onGoldGemsPacket", null);
__decorate([
    NetworkHandler_1.NetworkHandler('mmo_sLevels')
], MischiefMakersClient.prototype, "onUnlockedLevelsPacket", null);
__decorate([
    NetworkHandler_1.NetworkHandler('mmo_sTimes')
], MischiefMakersClient.prototype, "onBestTimesPacket", null);
__decorate([
    NetworkHandler_1.NetworkHandler('mmo_sPos')
], MischiefMakersClient.prototype, "onPosPacket", null);
__decorate([
    NetworkHandler_1.NetworkHandler('mmo_sVel')
], MischiefMakersClient.prototype, "onVelPacket", null);
__decorate([
    NetworkHandler_1.NetworkHandler('mmo_sPData')
], MischiefMakersClient.prototype, "onPlayerData", null);
exports.default = MischiefMakersClient;
//# sourceMappingURL=MischiefMakersClient.js.map