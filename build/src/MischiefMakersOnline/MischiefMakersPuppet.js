"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const IActor_1 = require("./Core/MischiefMakers/API/IActor");
const Vector2_1 = __importDefault(require("./Math/Vector2"));
/*
 * Is this safe? Unlikely lul
 * Gotta find the method that generates these safely
*/
exports.ACTOR_LIST_STACK_OFFSET = IActor_1.SIZEOF_ACTOR * 1;
exports.ACTOR_LIST_NUM_GENERATED = 8;
class Puppet {
    constructor(emu, actor_index = 0, uuid = "") {
        this.in_use = 0;
        this.uuid = "";
        this.last_pos = new Vector2_1.default();
        this.last_vel = new Vector2_1.default();
        this.last_update = 0;
        this.in_use = 0;
        this.uuid = uuid;
        this.last_pos = new Vector2_1.default();
        this.last_vel = new Vector2_1.default();
        if (actor_index != 0)
            this.actor = new IActor_1.Actor(emu, actor_index);
    }
}
exports.Puppet = Puppet;
class PuppetOverlord {
    constructor(ModLoader) {
        this.ModLoader = ModLoader;
        this.puppets = new Array(exports.ACTOR_LIST_NUM_GENERATED);
        for (let i = 0; i < exports.ACTOR_LIST_NUM_GENERATED; i++) {
            this.puppets[i] = new Puppet(ModLoader.emulator);
        }
    }
    addPuppet(uuid) {
        let i;
        let no_puppet = 1;
        let free_slot = -1;
        let copy_data = Buffer.alloc(IActor_1.SIZEOF_ACTOR);
        for (i = 0; i < exports.ACTOR_LIST_NUM_GENERATED; i++) {
            if (this.puppets[i].in_use != 1)
                free_slot = i;
            if (this.puppets[i].uuid == uuid) {
                no_puppet = 0;
                break;
            }
        }
        if (no_puppet && free_slot != -1) {
            i = exports.ACTOR_LIST_STACK_OFFSET + (IActor_1.SIZEOF_ACTOR * free_slot);
            this.puppets[free_slot] = new Puppet(this.ModLoader.emulator, i / IActor_1.SIZEOF_ACTOR, uuid);
            this.puppets[free_slot].in_use = 1;
            // Copy and paste the player actor
            copy_data = this.ModLoader.emulator.rdramReadBuffer(IActor_1.ACTOR_LIST_POINTER, IActor_1.SIZEOF_ACTOR);
            this.ModLoader.emulator.rdramWriteBuffer(IActor_1.ACTOR_LIST_POINTER + i, copy_data);
            //0x0E, 0x0F, 0x18, 0x21, 0x2F, 0x56, 0x60, 0x61
            this.puppets[free_slot].actor.status = 0x0004;
            this.puppets[free_slot].actor.type = 0x0016;
            this.puppets[free_slot].actor.rgba = 0x082008D0;
            return 1;
        }
        return 0;
    }
    freePuppet(uuid) {
        let i;
        let actor_offset;
        let copy_data = Buffer.alloc(IActor_1.SIZEOF_ACTOR, 0);
        for (i = 0; i < exports.ACTOR_LIST_NUM_GENERATED; i++) {
            if (this.puppets[i].uuid == uuid) {
                // Clear the puppet and zero the actor
                actor_offset = exports.ACTOR_LIST_STACK_OFFSET + (IActor_1.SIZEOF_ACTOR * i);
                this.puppets[i] = new Puppet(this.ModLoader.emulator);
                this.ModLoader.emulator.rdramWriteBuffer(IActor_1.ACTOR_LIST_POINTER + actor_offset, copy_data);
                break;
            }
        }
    }
    freeAllPuppets() {
        let i;
        let actor_offset;
        let copy_data = Buffer.alloc(IActor_1.SIZEOF_ACTOR, 0);
        for (i = 0; i < exports.ACTOR_LIST_NUM_GENERATED; i++) {
            actor_offset = exports.ACTOR_LIST_STACK_OFFSET + (IActor_1.SIZEOF_ACTOR * i);
            this.puppets[i] = new Puppet(this.ModLoader.emulator);
            this.ModLoader.emulator.rdramWriteBuffer(IActor_1.ACTOR_LIST_POINTER + actor_offset, copy_data);
        }
    }
    getPuppet(uuid) {
        let i;
        for (i = 0; i < exports.ACTOR_LIST_NUM_GENERATED; i++) {
            if (this.puppets[i].uuid == uuid) {
                return this.puppets[i]; // Should be a reference
            }
        }
    }
}
exports.PuppetOverlord = PuppetOverlord;
exports.default = PuppetOverlord;
//# sourceMappingURL=MischiefMakersPuppet.js.map