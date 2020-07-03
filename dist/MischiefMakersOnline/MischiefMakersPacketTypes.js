"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ModLoaderDefaultImpls_1 = require("modloader64_api/ModLoaderDefaultImpls");
class GoldGemsPacket extends ModLoaderDefaultImpls_1.Packet {
    constructor(gems, lobby, is_server = 0) {
        super(`mmo_${(is_server) ? 's' : 'c'}Gold`, "mmo", lobby, false);
        this.gold_gems = gems;
    }
}
exports.GoldGemsPacket = GoldGemsPacket;
class UnlockedLevelsPacket extends ModLoaderDefaultImpls_1.Packet {
    constructor(levels, lobby, is_server = 0) {
        super(`mmo_${(is_server) ? 's' : 'c'}Levels`, "mmo", lobby, false);
        this.unlocked_levels = levels;
    }
}
exports.UnlockedLevelsPacket = UnlockedLevelsPacket;
class BestTimesPacket extends ModLoaderDefaultImpls_1.Packet {
    constructor(times, lobby, is_server = 0) {
        super(`mmo_${(is_server) ? 's' : 'c'}Times`, "mmo", lobby, false);
        this.best_times = times;
    }
}
exports.BestTimesPacket = BestTimesPacket;
class CurrentStagePacket extends ModLoaderDefaultImpls_1.Packet {
    constructor(stage, lobby, is_server = 0) {
        super(`mmo_${(is_server) ? 's' : 'c'}Stage`, "mmo", lobby, false);
        this.current_stage = stage;
    }
}
exports.CurrentStagePacket = CurrentStagePacket;
class UpdatePlayerPositionPacket extends ModLoaderDefaultImpls_1.Packet {
    constructor(lhs, lobby, is_server = 0) {
        super(`mmo_${(is_server) ? 's' : 'c'}Pos`, "mmo", lobby, false);
        this.pos = lhs;
    }
}
exports.UpdatePlayerPositionPacket = UpdatePlayerPositionPacket;
class UpdatePlayerVelocityPacket extends ModLoaderDefaultImpls_1.Packet {
    constructor(lhs, lobby, is_server = 0) {
        super(`mmo_${(is_server) ? 's' : 'c'}Vel`, "mmo", lobby, false);
        this.vel = lhs;
    }
}
exports.UpdatePlayerVelocityPacket = UpdatePlayerVelocityPacket;
class UpdatePlayerRGBAPacket extends ModLoaderDefaultImpls_1.Packet {
    constructor(lhs, lobby, is_server = 0) {
        super(`mmo_${(is_server) ? 's' : 'c'}RGBA`, "mmo", lobby, false);
        this.rgba = lhs;
    }
}
exports.UpdatePlayerRGBAPacket = UpdatePlayerRGBAPacket;
class UpdatePlayerDataPacket extends ModLoaderDefaultImpls_1.Packet {
    //flags_2: number
    constructor(lhs, lobby, is_server = 0) {
        super(`mmo_${(is_server) ? 's' : 'c'}PData`, "mmo", lobby, false);
        this.mode = lhs.mode;
        this.flags_0 = lhs.flags_0;
        this.effect_flags = lhs.effect_flags;
        this.flags_1 = lhs.flags_1;
        this.health = lhs.health;
        this.air_ground_state = lhs.air_ground_state;
        this.idle_time = lhs.idle_time;
        this.anim_flags = lhs.anim_flags;
        //this.flags_2 = lhs.flags_2
    }
}
exports.UpdatePlayerDataPacket = UpdatePlayerDataPacket;
//# sourceMappingURL=MischiefMakersPacketTypes.js.map