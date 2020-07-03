import { IMischiefMakersCore, MischiefMakers } from './Core/MischiefMakers/MischiefMakers'
import { Player, Actor, ACTOR_LIST_POINTER, SIZEOF_ACTOR } from './Core/MischiefMakers/API/IActor';
import { IModLoaderAPI, ModLoaderEvents } from 'modloader64_api/IModLoaderAPI';
import IMemory from 'modloader64_api/IMemory';
import Vector3 from 'modloader64_api/math/Vector3';
import Vector2 from './Math/Vector2';

/*
 * Is this safe? Unlikely lul
 * Gotta find the method that generates these safely
*/
export const ACTOR_LIST_STACK_OFFSET: number = SIZEOF_ACTOR * 1
export const ACTOR_LIST_NUM_GENERATED: number = 8

export class Puppet {
    in_use = 0
    uuid: string = ""
    last_pos: Vector2 = new Vector2()
    last_vel: Vector2 = new Vector2()
    last_update: number = 0
    actor!: Actor

    constructor(emu: IMemory, actor_index = 0, uuid: string = "") {
        this.in_use = 0;
        this.uuid = uuid;
        this.last_pos = new Vector2()
        this.last_vel = new Vector2()

        if (actor_index != 0) this.actor = new Actor(emu, actor_index)
    }
}

export class PuppetOverlord {
    ModLoader!: IModLoaderAPI;
    
    puppets: Puppet[];

    constructor(ModLoader: IModLoaderAPI) {
        this.ModLoader = ModLoader
        this.puppets = new Array(ACTOR_LIST_NUM_GENERATED)

        for (let i = 0; i < ACTOR_LIST_NUM_GENERATED; i++) {
            this.puppets[i] = new Puppet(ModLoader.emulator)
        }
    }

    addPuppet(uuid: string) {
        let i
        let no_puppet = 1
        let free_slot = -1
        let copy_data = Buffer.alloc(SIZEOF_ACTOR)

        for (i = 0; i < ACTOR_LIST_NUM_GENERATED; i++) {
            if (this.puppets[i].in_use != 1) free_slot = i
            if (this.puppets[i].uuid == uuid) {
                no_puppet = 0
                break
            }
        }

        if (no_puppet && free_slot != -1) {
            i = ACTOR_LIST_STACK_OFFSET + (SIZEOF_ACTOR * free_slot)
            this.puppets[free_slot] = new Puppet(this.ModLoader.emulator, i / SIZEOF_ACTOR, uuid)
            this.puppets[free_slot].in_use = 1

            // Copy and paste the player actor
            copy_data = this.ModLoader.emulator.rdramReadBuffer(ACTOR_LIST_POINTER, SIZEOF_ACTOR)
            this.ModLoader.emulator.rdramWriteBuffer(ACTOR_LIST_POINTER + i, copy_data)
            //0x0E, 0x0F, 0x18, 0x21, 0x2F, 0x56, 0x60, 0x61
            this.puppets[free_slot].actor.status = 0x0004
            this.puppets[free_slot].actor.type = 0x0016
            this.puppets[free_slot].actor.rgba = 0x082008D0

            return 1
        }

        return 0
    }

    freePuppet(uuid: string) {
        let i
        let actor_offset
        let copy_data = Buffer.alloc(SIZEOF_ACTOR, 0)

        for (i = 0; i < ACTOR_LIST_NUM_GENERATED; i++) {
            if (this.puppets[i].uuid == uuid) {
                // Clear the puppet and zero the actor
                actor_offset = ACTOR_LIST_STACK_OFFSET + (SIZEOF_ACTOR * i)
                this.puppets[i] = new Puppet(this.ModLoader.emulator)
                this.ModLoader.emulator.rdramWriteBuffer(ACTOR_LIST_POINTER + actor_offset, copy_data)
                break
            }
        }
    }

    freeAllPuppets() {
        let i
        let actor_offset
        let copy_data = Buffer.alloc(SIZEOF_ACTOR, 0)
        for (i = 0; i < ACTOR_LIST_NUM_GENERATED; i++) {
            actor_offset = ACTOR_LIST_STACK_OFFSET + (SIZEOF_ACTOR * i)
            this.puppets[i] = new Puppet(this.ModLoader.emulator)
            this.ModLoader.emulator.rdramWriteBuffer(ACTOR_LIST_POINTER + actor_offset, copy_data)
        }

    }

    getPuppet(uuid: string) {
        let i
        for (i = 0; i < ACTOR_LIST_NUM_GENERATED; i++) {
            if (this.puppets[i].uuid == uuid) {
                return this.puppets[i] // Should be a reference
            }
        }
    }


}

export default PuppetOverlord
