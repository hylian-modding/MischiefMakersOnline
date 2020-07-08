import { IMischiefMakersCore, MischiefMakers } from './Core/MischiefMakers/MischiefMakers'
import { Player, Actor, ACTOR_LIST_POINTER, SIZEOF_ACTOR } from './Core/MischiefMakers/API/IActor';
import { IModLoaderAPI, ModLoaderEvents } from 'modloader64_api/IModLoaderAPI';
import IMemory from 'modloader64_api/IMemory';
import Vector3 from 'modloader64_api/math/Vector3';
import Vector2 from './Math/Vector2';

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
        this.last_pos = new Vector3()
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
            if (i > 0x2d) { // 0x10 - 0x2d are used for particles, let's just skip that whole chunk for now
                actor = new Actor(this.ModLoader.emulator, i);
                if (!actor.is_alive) {
                    free_slot = i
                    this.ModLoader.logger.info("Found free slot at " + i.toString())
                    break
                }
            }
        }

        if (free_slot > 0) {
            i = ACTOR_LIST_POINTER + (SIZEOF_ACTOR * free_slot)

            let marina: Player = new Player(this.ModLoader.emulator, 0)

            this.puppets.push(new Puppet(this.ModLoader.emulator, free_slot, uuid))

            // Copy and paste the player actor
            copy_data = this.ModLoader.emulator.rdramReadBuffer(ACTOR_LIST_POINTER, SIZEOF_ACTOR)
            this.ModLoader.emulator.rdramWriteBuffer(i, copy_data)

            // For the most part, mimicking the game's behaviour when constructing an actor at X index (0x8001E250)
            let type = 0x002E
            let mode = this.ModLoader.emulator.rdramRead32(0x800C7DC8 + (type * 4))
            let uptr = 0x800C7FBC + (type * 4)

            //0x0E, 0x0F, 0x21, 0x60, 0x61
            this.puppets[this.puppets.length - 1].actor.type = type // afterimage uses 2E
            this.puppets[this.puppets.length - 1].actor.mode = mode
            this.ModLoader.emulator.rdramWrite32(i + 0xE8, uptr)

            this.puppets[this.puppets.length - 1].actor.scale_0 = new Vector2(1, 1)
            this.ModLoader.emulator.rdramWrite32(i + 0x14C, 0)
            this.ModLoader.emulator.rdramWrite32(i + 0x148, 0)
            this.ModLoader.emulator.rdramWrite32(i + 0x144, 0)
            this.ModLoader.emulator.rdramWrite32(i + 0x140, 0)
            this.ModLoader.emulator.rdramWrite32(i + 0x13C, 0)
            this.ModLoader.emulator.rdramWrite32(i + 0x138, 0)
            this.ModLoader.emulator.rdramWrite32(i + 0x134, 0)
            this.ModLoader.emulator.rdramWrite32(i + 0x130, 0)
            this.puppets[this.puppets.length - 1].actor.air_ground_state = 0
            this.puppets[this.puppets.length - 1].actor.scale_1 = new Vector2(0, 0)
            this.ModLoader.emulator.rdramWrite32(i + 0x11C, 0)
            this.ModLoader.emulator.rdramWrite32(i + 0x118, 0)
            this.ModLoader.emulator.rdramWrite32(i + 0x114, 0)
            this.ModLoader.emulator.rdramWrite32(i + 0x110, 0)
            this.ModLoader.emulator.rdramWrite8(i + 0x9C + 3, 0xFF) // RGBA + 3 (alpha)
            this.ModLoader.emulator.rdramWrite16(i + 0xE6, 1)
            this.ModLoader.emulator.rdramWrite8(i + 0xDE, 1)
            this.ModLoader.emulator.rdramWrite32(i + 0xC4, 0)
            this.ModLoader.emulator.rdramWrite32(i + 0xC0, 0)
            this.ModLoader.emulator.rdramWrite32(i + 0xBC, 0)
            this.ModLoader.emulator.rdramWrite16(i + 0xD6, 0)
            this.ModLoader.emulator.rdramWrite16(i + 0xD4, 0)
            this.puppets[this.puppets.length - 1].actor.status = 0x0000
            this.puppets[this.puppets.length - 1].actor.pos_4 =  new Vector2()
            this.puppets[this.puppets.length - 1].actor.pos_3 = new Vector2()
            this.ModLoader.emulator.rdramWrite32(i + 0x190, 0)
            this.ModLoader.emulator.rdramWrite32(i + 0x18C, 0)
            this.ModLoader.emulator.rdramWrite32(i + 0x188, 0)
            this.ModLoader.emulator.rdramWrite32(i + 0x184, 0)
            this.ModLoader.emulator.rdramWrite32(i + 0x180, 0)
            this.ModLoader.emulator.rdramWrite32(i + 0x17C, 0)
            this.ModLoader.emulator.rdramWrite32(i + 0x178, 0)
            this.ModLoader.emulator.rdramWrite32(i + 0x174, 0)
            this.puppets[this.puppets.length - 1].actor.anim_flags = 0
            this.ModLoader.emulator.rdramWrite32(i + 0x16C, 0)
            this.ModLoader.emulator.rdramWrite32(i + 0x168, 0)
            this.ModLoader.emulator.rdramWrite32(i + 0x164, 0)
            this.ModLoader.emulator.rdramWrite32(i + 0x160, 0)
            this.ModLoader.emulator.rdramWrite32(i + 0x15C, 0)
            this.ModLoader.emulator.rdramWrite32(i + 0x158, 0)
            this.ModLoader.emulator.rdramWrite32(i + 0x154, 0)
            this.puppets[this.puppets.length - 1].actor.idle_time = 0
            this.ModLoader.emulator.rdramWrite32(i + 0x10C, 0)
            this.ModLoader.emulator.rdramWrite32(i + 0x108, 0)
            this.ModLoader.emulator.rdramWrite32(i + 0x104, 0)
            this.ModLoader.emulator.rdramWrite32(i + 0x100, 0)
            this.ModLoader.emulator.rdramWrite32(i + 0xFC, 0)
            this.ModLoader.emulator.rdramWrite32(i + 0xF8, 0)
            this.puppets[this.puppets.length - 1].actor.velocity = new Vector2()
            this.ModLoader.emulator.rdramWrite16(i + 0xE2, 0)
            this.ModLoader.emulator.rdramWrite8(i + 0xDF, 0)
            this.ModLoader.emulator.rdramWrite8(i + 0xDD, 0)
            this.ModLoader.emulator.rdramWrite8(i + 0xDC, 0)
            this.ModLoader.emulator.rdramWrite8(i + 0xDB, 0)
            this.ModLoader.emulator.rdramWrite8(i + 0xDA, 0)
            this.ModLoader.emulator.rdramWrite32(i + 0x98, 0)
            this.puppets[this.puppets.length - 1].actor.effect_flags = 0
            this.puppets[this.puppets.length - 1].actor.rgba = 0x010801D0

            this.puppets[this.puppets.length - 1].actor.render_flags |= marina.render_flags & 0x160 | 0x800
            this.puppets[this.puppets.length - 1].actor.mode |= marina.mode & 0x28 | 0x80800000
            this.puppets[this.puppets.length - 1].actor.idle_time = 0xF
            this.puppets[this.puppets.length - 1].actor.render_flags |= 0x10
            this.ModLoader.emulator.rdramWrite32(i + 0x14C, free_slot)
            this.puppets[this.puppets.length - 1].actor.status = 1
            this.puppets[this.puppets.length - 1].actor.type = 0x60

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

    isIndexPuppet(index: number): boolean {
        for (let i = 0; i < this.puppets.length; i++) {
            if (this.puppets[i].index == index) return true
        }

        return false
    }


}

export default PuppetOverlord
