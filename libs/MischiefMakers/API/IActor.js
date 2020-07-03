"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Vector3_1 = __importDefault(require("modloader64_api/math/Vector3"));
const Vector2_1 = __importDefault(require("../Math/Vector2"));
exports.ACTOR_LIST_POINTER = 0x800ED000;
exports.GLOBAL_CONTEXT_POINTER = 0x800BC4C0;
exports.SIZEOF_ACTOR = 0x198;
exports.ACTORO_POS0 = 0x18;
exports.ACTORO_POS1 = 0x58;
exports.ACTORO_MODE = 0x80;
exports.ACTORO_SPRITE = 0x84;
exports.ACTORO_POS2 = 0x88;
exports.ACTORO_RFLAGS = 0x94;
exports.ACTORO_FLAGS0 = 0x98;
exports.ACTORO_RGBA = 0x9C;
exports.ACTORO_EFFECT = 0xA0;
exports.ACTORO_SCALE0 = 0xB4;
exports.ACTORO_POS3 = 0xC8;
exports.ACTORO_POS4 = 0xCC;
exports.ACTORO_STATUS = 0xD0;
exports.ACTORO_TYPE = 0xD2;
exports.ACTORO_FLAGS1 = 0xD8;
exports.ACTORO_HEALTH = 0xE0;
exports.ACTORO_DQUEUE = 0xE2;
exports.ACTORO_VEL = 0xEC;
exports.ACTORO_SCALEXY = 0x120;
exports.ACTORO_SCALE1 = 0x124;
exports.ACTORO_AGS = 0x12C;
exports.ACTORO_IDLE = 0x150;
exports.ACTORO_ANIMFLAGS = 0x170;
exports.ACTORO_FLAGS2 = 0x17C;
class Actor {
    constructor(emu, idx = 0, use_pointer = 0) {
        this.emulator = emu;
        this.index = idx;
    }
    get pos_0() {
        let addr = exports.ACTOR_LIST_POINTER + (this.index * exports.SIZEOF_ACTOR) + exports.ACTORO_POS0;
        return new Vector3_1.default(this.emulator.rdramRead16(addr), this.emulator.rdramRead16(addr + 4), this.emulator.rdramRead32(addr + 8));
    }
    get pos_1() {
        let addr = exports.ACTOR_LIST_POINTER + (this.index * exports.SIZEOF_ACTOR) + exports.ACTORO_POS1;
        return new Vector3_1.default(this.emulator.rdramRead16(addr), this.emulator.rdramRead16(addr + 4), this.emulator.rdramRead32(addr + 8));
    }
    get mode() {
        return this.emulator.rdramRead32(exports.ACTOR_LIST_POINTER + (this.index * exports.SIZEOF_ACTOR) + exports.ACTORO_MODE);
    }
    get current_sprite() {
        return this.emulator.rdramRead16(exports.ACTOR_LIST_POINTER + (this.index * exports.SIZEOF_ACTOR) + exports.ACTORO_SPRITE);
    }
    get pos_2() {
        let addr = exports.ACTOR_LIST_POINTER + (this.index * exports.SIZEOF_ACTOR) + exports.ACTORO_POS2;
        return new Vector3_1.default(this.emulator.rdramRead16(addr), this.emulator.rdramRead16(addr + 4), this.emulator.rdramRead16(addr + 8));
    }
    get render_flags() {
        return this.emulator.rdramRead16(exports.ACTOR_LIST_POINTER + (this.index * exports.SIZEOF_ACTOR) + exports.ACTORO_RFLAGS);
    }
    get flags_0() {
        return this.emulator.rdramRead32(exports.ACTOR_LIST_POINTER + (this.index * exports.SIZEOF_ACTOR) + exports.ACTORO_FLAGS0);
    }
    get rgba() {
        return this.emulator.rdramRead32(exports.ACTOR_LIST_POINTER + (this.index * exports.SIZEOF_ACTOR) + exports.ACTORO_RGBA);
    }
    get effect_flags() {
        return this.emulator.rdramRead32(exports.ACTOR_LIST_POINTER + (this.index * exports.SIZEOF_ACTOR) + exports.ACTORO_EFFECT);
    }
    get scale_0() {
        let addr = exports.ACTOR_LIST_POINTER + (this.index * exports.SIZEOF_ACTOR) + exports.ACTORO_SCALE0;
        return new Vector2_1.default(this.emulator.rdramReadF32(addr), this.emulator.rdramReadF32(addr + 4));
    }
    get pos_3() {
        let addr = exports.ACTOR_LIST_POINTER + (this.index * exports.SIZEOF_ACTOR) + exports.ACTORO_POS3;
        return new Vector2_1.default(this.emulator.rdramRead16(addr), this.emulator.rdramRead16(addr + 2));
    }
    get pos_4() {
        let addr = exports.ACTOR_LIST_POINTER + (this.index * exports.SIZEOF_ACTOR) + exports.ACTORO_POS4;
        return new Vector2_1.default(this.emulator.rdramRead16(addr), this.emulator.rdramRead16(addr + 2));
    }
    get status() {
        return this.emulator.rdramRead16(exports.ACTOR_LIST_POINTER + (this.index * exports.SIZEOF_ACTOR) + exports.ACTORO_STATUS);
    }
    get type() {
        return this.emulator.rdramRead16(exports.ACTOR_LIST_POINTER + (this.index * exports.SIZEOF_ACTOR) + exports.ACTORO_TYPE);
    }
    get flags_1() {
        return this.emulator.rdramRead32(exports.ACTOR_LIST_POINTER + (this.index * exports.SIZEOF_ACTOR) + exports.ACTORO_FLAGS1);
    }
    get health() {
        return this.emulator.rdramRead16(exports.ACTOR_LIST_POINTER + (this.index * exports.SIZEOF_ACTOR) + exports.ACTORO_HEALTH);
    }
    get damage_queue() {
        return this.emulator.rdramRead16(exports.ACTOR_LIST_POINTER + (this.index * exports.SIZEOF_ACTOR) + exports.ACTORO_DQUEUE);
    }
    get velocity() {
        let addr = exports.ACTOR_LIST_POINTER + (this.index * exports.SIZEOF_ACTOR) + exports.ACTORO_VEL;
        return new Vector2_1.default(this.emulator.rdramRead16(addr), this.emulator.rdramRead16(addr + 4));
    }
    get scaleXY() {
        return this.emulator.rdramReadF32(exports.ACTOR_LIST_POINTER + (this.index * exports.SIZEOF_ACTOR) + exports.ACTORO_SCALEXY);
    }
    get scale_1() {
        let addr = exports.ACTOR_LIST_POINTER + (this.index * exports.SIZEOF_ACTOR) + exports.ACTORO_SCALE1;
        return new Vector2_1.default(this.emulator.rdramReadF32(addr), this.emulator.rdramReadF32(addr + 4));
    }
    get air_ground_state() {
        return this.emulator.rdramRead16(exports.ACTOR_LIST_POINTER + (this.index * exports.SIZEOF_ACTOR) + exports.ACTORO_AGS);
    }
    get idle_time() {
        return this.emulator.rdramRead32(exports.ACTOR_LIST_POINTER + (this.index * exports.SIZEOF_ACTOR) + exports.ACTORO_IDLE);
    }
    get anim_flags() {
        return this.emulator.rdramRead32(exports.ACTOR_LIST_POINTER + (this.index * exports.SIZEOF_ACTOR) + exports.ACTORO_ANIMFLAGS);
    }
    get flags_2() {
        return this.emulator.rdramRead32(exports.ACTOR_LIST_POINTER + (this.index * exports.SIZEOF_ACTOR) + exports.ACTORO_FLAGS2);
    }
    set pos_0(value) {
        let addr = exports.ACTOR_LIST_POINTER + (this.index * exports.SIZEOF_ACTOR) + 0x18;
        this.emulator.rdramWrite16(addr, value.x);
        this.emulator.rdramWrite16(addr + 4, value.y);
        this.emulator.rdramWrite32(addr + 8, value.z);
    }
    set pos_1(value) {
        let addr = exports.ACTOR_LIST_POINTER + (this.index * exports.SIZEOF_ACTOR) + 0x58;
        this.emulator.rdramWrite16(addr, value.x);
        this.emulator.rdramWrite16(addr + 4, value.y);
        this.emulator.rdramWrite32(addr + 8, value.z);
    }
    set mode(value) {
        this.emulator.rdramWrite32(exports.ACTOR_LIST_POINTER + (this.index * exports.SIZEOF_ACTOR) + 0x80, value);
    }
    set current_sprite(value) {
        this.emulator.rdramWrite16(exports.ACTOR_LIST_POINTER + (this.index * exports.SIZEOF_ACTOR) + 0x84, value);
    }
    set pos_2(value) {
        let addr = exports.ACTOR_LIST_POINTER + (this.index * exports.SIZEOF_ACTOR) + 0x88;
        this.emulator.rdramWrite16(addr, value.x);
        this.emulator.rdramWrite16(addr + 4, value.y);
        this.emulator.rdramWrite16(addr + 8, value.z);
    }
    set render_flags(value) {
        this.emulator.rdramWrite16(exports.ACTOR_LIST_POINTER + (this.index * exports.SIZEOF_ACTOR) + 0x94, value);
    }
    set flags_0(value) {
        this.emulator.rdramWrite32(exports.ACTOR_LIST_POINTER + (this.index * exports.SIZEOF_ACTOR) + 0x98, value);
    }
    set rgba(value) {
        this.emulator.rdramWrite32(exports.ACTOR_LIST_POINTER + (this.index * exports.SIZEOF_ACTOR) + 0x9C, value);
    }
    set effect_flags(value) {
        this.emulator.rdramWrite32(exports.ACTOR_LIST_POINTER + (this.index * exports.SIZEOF_ACTOR) + 0xA0, value);
    }
    set scale_0(value) {
        let addr = exports.ACTOR_LIST_POINTER + (this.index * exports.SIZEOF_ACTOR) + 0xB4;
        this.emulator.rdramWriteF32(addr, value.x);
        this.emulator.rdramWriteF32(addr + 4, value.y);
    }
    set pos_3(value) {
        let addr = exports.ACTOR_LIST_POINTER + (this.index * exports.SIZEOF_ACTOR) + 0xC8;
        this.emulator.rdramWrite16(addr, value.x);
        this.emulator.rdramWrite16(addr + 2, value.y);
    }
    set pos_4(value) {
        let addr = exports.ACTOR_LIST_POINTER + (this.index * exports.SIZEOF_ACTOR) + 0xCC;
        this.emulator.rdramWrite16(addr, value.x);
        this.emulator.rdramWrite16(addr + 2, value.y);
    }
    set status(value) {
        this.emulator.rdramWrite16(exports.ACTOR_LIST_POINTER + (this.index * exports.SIZEOF_ACTOR) + 0xD0, value);
    }
    set type(value) {
        this.emulator.rdramWrite16(exports.ACTOR_LIST_POINTER + (this.index * exports.SIZEOF_ACTOR) + 0xD2, value);
    }
    set flags_1(value) {
        this.emulator.rdramWrite32(exports.ACTOR_LIST_POINTER + (this.index * exports.SIZEOF_ACTOR) + 0xD8, value);
    }
    set health(value) {
        this.emulator.rdramWrite16(exports.ACTOR_LIST_POINTER + (this.index * exports.SIZEOF_ACTOR) + 0xE0, value);
    }
    set damage_queue(value) {
        this.emulator.rdramWrite16(exports.ACTOR_LIST_POINTER + (this.index * exports.SIZEOF_ACTOR) + 0xE2, value);
    }
    set velocity(value) {
        let addr = exports.ACTOR_LIST_POINTER + (this.index * exports.SIZEOF_ACTOR) + 0xEC;
        this.emulator.rdramWrite16(addr, value.x);
        this.emulator.rdramWrite16(addr + 4, value.x);
    }
    set scaleXY(value) {
        this.emulator.rdramWriteF32(exports.ACTOR_LIST_POINTER + (this.index * exports.SIZEOF_ACTOR) + 0x120, value);
    }
    set scale_1(value) {
        let addr = exports.ACTOR_LIST_POINTER + (this.index * exports.SIZEOF_ACTOR) + 0x124;
        this.emulator.rdramWriteF32(addr, value.x);
        this.emulator.rdramWriteF32(addr + 4, value.y);
    }
    set air_ground_state(value) {
        this.emulator.rdramWrite16(exports.ACTOR_LIST_POINTER + (this.index * exports.SIZEOF_ACTOR) + 0x12C, value);
    }
    set idle_time(value) {
        this.emulator.rdramWrite32(exports.ACTOR_LIST_POINTER + (this.index * exports.SIZEOF_ACTOR) + 0x150, value);
    }
    set anim_flags(value) {
        this.emulator.rdramWrite32(exports.ACTOR_LIST_POINTER + (this.index * exports.SIZEOF_ACTOR) + 0x170, value);
    }
    set flags_2(value) {
        this.emulator.rdramWrite32(exports.ACTOR_LIST_POINTER + (this.index * exports.SIZEOF_ACTOR) + 0x17C, value);
    }
}
exports.Actor = Actor;
class Player extends Actor {
    get camera_pos() {
        let addr = exports.GLOBAL_CONTEXT_POINTER + 0x80;
        return new Vector2_1.default(this.emulator.rdramRead16(addr), this.emulator.rdramRead16(addr + 8));
    }
    get real_pos() {
        let addr = exports.GLOBAL_CONTEXT_POINTER + 0x80;
        return new Vector2_1.default(this.emulator.rdramRead16(addr), this.emulator.rdramRead16(addr + 4));
    }
    set camera_pos(value) {
        let addr = exports.GLOBAL_CONTEXT_POINTER + 0x80;
        this.emulator.rdramWrite16(addr, value.x);
        this.emulator.rdramWrite16(addr + 8, value.y);
    }
    set real_pos(value) {
        let addr = exports.GLOBAL_CONTEXT_POINTER + 0x108;
        this.emulator.rdramWrite16(addr, value.x);
        this.emulator.rdramWrite16(addr + 4, value.y);
    }
}
exports.Player = Player;
//# sourceMappingURL=IActor.js.map