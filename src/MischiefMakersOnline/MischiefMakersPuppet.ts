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
export const ACTOR_LIST_SIZE: number = 0xC0


export class Puppet {
    uuid: string = ""
    user_ping: number[] = new Array(32);
    index: number = -1
    last_pos: Vector2 = new Vector2()
    last_vel: Vector2 = new Vector2()
    last_update: number = 0
    
    actor!: Actor

    constructor(emu: IMemory, actor_index: number = -1, uuid: string = "") {
        this.uuid = uuid;
        this.last_pos = new Vector2()
        this.last_vel = new Vector2()
        this.index = actor_index
        this.actor = new Actor(emu, actor_index)
        for (let i = 0; i < this.user_ping.length; i++) {
            this.user_ping[i] = 0
        }
    }

    getAveragePing(): number {
        let total = 0

        for (let i = 0; i < this.user_ping.length; i++) {
            total += this.user_ping[i]
        }

        return total / this.user_ping.length
    }

    pushNewPing(ms: number) {
        this.user_ping.splice(0)
        this.user_ping.push(ms)
    }
}

export class PuppetOverlord {
    ModLoader!: IModLoaderAPI;
    
    puppets: Puppet[];

    constructor(ModLoader: IModLoaderAPI) {
        this.ModLoader = ModLoader
        this.puppets = []
    }

    addPuppet(uuid: string) {
        let i
        let copy_data = Buffer.alloc(SIZEOF_ACTOR)
        let free_slot = 0
        let actor: Actor

        for (i = 0; i < this.puppets.length; i++) {
            if (this.puppets[i].uuid == uuid) return free_slot
        }

        for (i = 1; i < ACTOR_LIST_SIZE; i++) {
            actor = new Actor(this.ModLoader.emulator, i);
            if ((actor.mode & 2) == 0) {
                free_slot = i
                this.ModLoader.logger.info("Found free slot at " + i.toString())
                break
            }
        }

        if (free_slot > 0) {
            i = ACTOR_LIST_POINTER + (SIZEOF_ACTOR * free_slot)

            this.puppets.push(new Puppet(this.ModLoader.emulator, free_slot, uuid))

            // Copy and paste the player actor
            copy_data = this.ModLoader.emulator.rdramReadBuffer(ACTOR_LIST_POINTER, SIZEOF_ACTOR)
            this.ModLoader.emulator.rdramWriteBuffer(i, copy_data)
            
            //0x0E, 0x0F, 0x21, 0x60, 0x61
            this.puppets[this.puppets.length - 1].actor.status = 0x0000
            this.puppets[this.puppets.length - 1].actor.type = 0x0060
            this.puppets[this.puppets.length - 1].actor.rgba = 0x010801D0

            return free_slot
        }

        return free_slot
    }

    freePuppet(uuid: string) {
        let i
        let actor_offset
        let copy_data = Buffer.alloc(SIZEOF_ACTOR, 0)

        for (i = 0; i < this.puppets.length; i++) {
            if (this.puppets[i].uuid == uuid) {
                // Clear the puppet and zero the actor
                actor_offset = ACTOR_LIST_POINTER + (SIZEOF_ACTOR * this.puppets[i].index)
                this.ModLoader.emulator.rdramWriteBuffer(actor_offset, copy_data)
                this.puppets.splice(i)
                break
            }
        }
    }

    freeAllPuppets() {
        let i
        let actor_offset
        let copy_data = Buffer.alloc(SIZEOF_ACTOR, 0)

        for (i = 0; i < this.puppets.length; i++) {
            actor_offset = ACTOR_LIST_POINTER + (SIZEOF_ACTOR * this.puppets[i].index)
            this.ModLoader.emulator.rdramWriteBuffer(actor_offset, copy_data)
        }

        this.puppets = []
    }

    getPuppet(uuid: string) {
        let i
        for (i = 0; i < this.puppets.length; i++) {
            if (this.puppets[i].uuid == uuid) {
                return this.puppets[i] // Should be a reference
            }
        }
    }


}

export default PuppetOverlord
