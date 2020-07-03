import Vector3 from 'modloader64_api/math/Vector3'
import Vector2 from '../Math/Vector2'
import IMemory from 'modloader64_api/IMemory'

export const ACTOR_LIST_POINTER: number = 0x800ED000
export const GLOBAL_CONTEXT_POINTER: number = 0x800BC4C0
export const SIZEOF_ACTOR = 0x198

export const ACTORO_POS0 = 0x18
export const ACTORO_POS1 = 0x58
export const ACTORO_MODE = 0x80
export const ACTORO_SPRITE = 0x84
export const ACTORO_POS2 = 0x88
export const ACTORO_RFLAGS = 0x94
export const ACTORO_FLAGS0 = 0x98
export const ACTORO_RGBA = 0x9C
export const ACTORO_EFFECT = 0xA0
export const ACTORO_SCALE0 = 0xB4
export const ACTORO_POS3 = 0xC8
export const ACTORO_POS4 = 0xCC
export const ACTORO_STATUS = 0xD0
export const ACTORO_TYPE = 0xD2
export const ACTORO_FLAGS1 = 0xD8
export const ACTORO_HEALTH = 0xE0
export const ACTORO_DQUEUE = 0xE2
export const ACTORO_VEL = 0xEC
export const ACTORO_SCALEXY = 0x120
export const ACTORO_SCALE1 = 0x124
export const ACTORO_AGS = 0x12C
export const ACTORO_IDLE = 0x150
export const ACTORO_ANIMFLAGS = 0x170
export const ACTORO_FLAGS2 = 0x17C


export interface IActor {
    pos_0: Vector3 // short, short, int
    pos_1: Vector3 // short, short, int
    mode: number // u32
    current_sprite: number // short; first half is sprite, second is frame index
    pos_2: Vector3 // short, padding (2), short, padding (2), short
    render_flags: number // u16
    flags_0: number // u32
    rgba: number // u8[4]
    effect_flags: number // u32
    scale_0: Vector2 // float[2]
    pos_3: Vector2 // short, short
    pos_4: Vector2 // short, short
    status: number // short
    type: number // short
    flags_1: number // u32
    health: number // short
    damage_queue: number // short
    velocity: Vector2 // short, padding (2), short, padding (2)
    scaleXY: number // float
    scale_1: Vector2 // float[2]
    air_ground_state: number // short
    idle_time: number // u32
    anim_flags: number // u32
    flags_2: number // u32
}

export interface IPlayer extends IActor {
    camera_pos: Vector2
    real_pos: Vector2
}

export class Actor implements IActor {
    emulator!: IMemory

    index: number // Actor index on actor list

    constructor (emu: IMemory, idx: number = 0, use_pointer: number = 0) {
        this.emulator = emu
        this.index = idx
    }

    get pos_0() {
        let addr = ACTOR_LIST_POINTER + (this.index * SIZEOF_ACTOR) + ACTORO_POS0
        return new Vector3(this.emulator.rdramRead16(addr),
            this.emulator.rdramRead16(addr + 4),
            this.emulator.rdramRead32(addr + 8))
    }

    get pos_1() {
        let addr = ACTOR_LIST_POINTER + (this.index * SIZEOF_ACTOR) + ACTORO_POS1
        return new Vector3(this.emulator.rdramRead16(addr),
            this.emulator.rdramRead16(addr + 4),
            this.emulator.rdramRead32(addr + 8))
    }

    get mode() {
        return this.emulator.rdramRead32(ACTOR_LIST_POINTER + (this.index * SIZEOF_ACTOR) + ACTORO_MODE)
    }

    get current_sprite() {
        return this.emulator.rdramRead16(ACTOR_LIST_POINTER + (this.index * SIZEOF_ACTOR) + ACTORO_SPRITE)
    }

    get pos_2() {
        let addr = ACTOR_LIST_POINTER + (this.index * SIZEOF_ACTOR) + ACTORO_POS2
        return new Vector3(this.emulator.rdramRead16(addr),
            this.emulator.rdramRead16(addr + 4),
            this.emulator.rdramRead16(addr + 8))
    }
    
    get render_flags() {
        return this.emulator.rdramRead16(ACTOR_LIST_POINTER + (this.index * SIZEOF_ACTOR) + ACTORO_RFLAGS)
    }

    get flags_0() {
        return this.emulator.rdramRead32(ACTOR_LIST_POINTER + (this.index * SIZEOF_ACTOR) + ACTORO_FLAGS0)
    }

    get rgba() {
        return this.emulator.rdramRead32(ACTOR_LIST_POINTER + (this.index * SIZEOF_ACTOR) + ACTORO_RGBA)
    }

    get effect_flags() {
        return this.emulator.rdramRead32(ACTOR_LIST_POINTER + (this.index * SIZEOF_ACTOR) + ACTORO_EFFECT)
    }

    get scale_0() {
        let addr = ACTOR_LIST_POINTER + (this.index * SIZEOF_ACTOR) + ACTORO_SCALE0
        return new Vector2(this.emulator.rdramReadF32(addr), this.emulator.rdramReadF32(addr + 4))
    }

    get pos_3() {
        let addr = ACTOR_LIST_POINTER + (this.index * SIZEOF_ACTOR) + ACTORO_POS3
        return new Vector2(this.emulator.rdramRead16(addr), this.emulator.rdramRead16(addr + 2))
    }

    get pos_4() {
        let addr = ACTOR_LIST_POINTER + (this.index * SIZEOF_ACTOR) + ACTORO_POS4
        return new Vector2(this.emulator.rdramRead16(addr), this.emulator.rdramRead16(addr + 2))
    }

    get status() {
        return this.emulator.rdramRead16(ACTOR_LIST_POINTER + (this.index * SIZEOF_ACTOR) + ACTORO_STATUS)
    }

    get type() {
        return this.emulator.rdramRead16(ACTOR_LIST_POINTER + (this.index * SIZEOF_ACTOR) + ACTORO_TYPE)
    }

    get flags_1() {
        return this.emulator.rdramRead32(ACTOR_LIST_POINTER + (this.index * SIZEOF_ACTOR) + ACTORO_FLAGS1)
    }

    get health() {
        return this.emulator.rdramRead16(ACTOR_LIST_POINTER + (this.index * SIZEOF_ACTOR) + ACTORO_HEALTH)
    }

    get damage_queue() {
        return this.emulator.rdramRead16(ACTOR_LIST_POINTER + (this.index * SIZEOF_ACTOR) + ACTORO_DQUEUE)
    }

    get velocity() {
        let addr = ACTOR_LIST_POINTER + (this.index * SIZEOF_ACTOR) + ACTORO_VEL
        return new Vector2(this.emulator.rdramRead16(addr), this.emulator.rdramRead16(addr + 4))
    }

    get scaleXY() {
        return this.emulator.rdramReadF32(ACTOR_LIST_POINTER + (this.index * SIZEOF_ACTOR) + ACTORO_SCALEXY)
    }

    get scale_1() {
        let addr = ACTOR_LIST_POINTER + (this.index * SIZEOF_ACTOR) + ACTORO_SCALE1
        return new Vector2(this.emulator.rdramReadF32(addr), this.emulator.rdramReadF32(addr + 4))
    }

    get air_ground_state() {
        return this.emulator.rdramRead16(ACTOR_LIST_POINTER + (this.index * SIZEOF_ACTOR) + ACTORO_AGS)
    }

    get idle_time() {
        return this.emulator.rdramRead32(ACTOR_LIST_POINTER + (this.index * SIZEOF_ACTOR) + ACTORO_IDLE)
    }

    get anim_flags() {
        return this.emulator.rdramRead32(ACTOR_LIST_POINTER + (this.index * SIZEOF_ACTOR) + ACTORO_ANIMFLAGS)
    }

    get flags_2() {
        return this.emulator.rdramRead32(ACTOR_LIST_POINTER + (this.index * SIZEOF_ACTOR) + ACTORO_FLAGS2)
    }



    set pos_0(value: Vector3) {
        let addr = ACTOR_LIST_POINTER + (this.index * SIZEOF_ACTOR) + 0x18
        this.emulator.rdramWrite16(addr, value.x)
        this.emulator.rdramWrite16(addr + 4, value.y)
        this.emulator.rdramWrite32(addr + 8, value.z)
    }
    
    set pos_1(value: Vector3) {
        let addr = ACTOR_LIST_POINTER + (this.index * SIZEOF_ACTOR) + 0x58
        this.emulator.rdramWrite16(addr, value.x)
        this.emulator.rdramWrite16(addr + 4, value.y)
        this.emulator.rdramWrite32(addr + 8, value.z)
    }
    
    set mode(value: number) {
        this.emulator.rdramWrite32(ACTOR_LIST_POINTER + (this.index * SIZEOF_ACTOR) + 0x80, value)
    }
    
    set current_sprite(value: number) {
        this.emulator.rdramWrite16(ACTOR_LIST_POINTER + (this.index * SIZEOF_ACTOR) + 0x84, value)
    }
    
    set pos_2(value: Vector3) {
        let addr = ACTOR_LIST_POINTER + (this.index * SIZEOF_ACTOR) + 0x88
        this.emulator.rdramWrite16(addr, value.x)
        this.emulator.rdramWrite16(addr + 4, value.y)
        this.emulator.rdramWrite16(addr + 8, value.z)
    }
    
    set render_flags(value: number) {
        this.emulator.rdramWrite16(ACTOR_LIST_POINTER + (this.index * SIZEOF_ACTOR) + 0x94, value)
    }
    
    set flags_0(value: number) {
        this.emulator.rdramWrite32(ACTOR_LIST_POINTER + (this.index * SIZEOF_ACTOR) + 0x98, value)
    }
    
    set rgba(value: number) {
        this.emulator.rdramWrite32(ACTOR_LIST_POINTER + (this.index * SIZEOF_ACTOR) + 0x9C, value)
    }
    
    set effect_flags(value: number) {
        this.emulator.rdramWrite32(ACTOR_LIST_POINTER + (this.index * SIZEOF_ACTOR) + 0xA0, value)
    }
    
    set scale_0(value: Vector2) {
        let addr = ACTOR_LIST_POINTER + (this.index * SIZEOF_ACTOR) + 0xB4
        this.emulator.rdramWriteF32(addr, value.x)
        this.emulator.rdramWriteF32(addr + 4, value.y)
    }
    
    set pos_3(value: Vector2) {
        let addr = ACTOR_LIST_POINTER + (this.index * SIZEOF_ACTOR) + 0xC8
        this.emulator.rdramWrite16(addr, value.x)
        this.emulator.rdramWrite16(addr + 2, value.y)
    }
    
    set pos_4(value: Vector2) {
        let addr = ACTOR_LIST_POINTER + (this.index * SIZEOF_ACTOR) + 0xCC
        this.emulator.rdramWrite16(addr, value.x)
        this.emulator.rdramWrite16(addr + 2, value.y)
    }
    
    set status(value: number) {
        this.emulator.rdramWrite16(ACTOR_LIST_POINTER + (this.index * SIZEOF_ACTOR) + 0xD0, value)
    }
    
    set type(value: number) {
        this.emulator.rdramWrite16(ACTOR_LIST_POINTER + (this.index * SIZEOF_ACTOR) + 0xD2, value)
    }
    
    set flags_1(value: number) {
        this.emulator.rdramWrite32(ACTOR_LIST_POINTER + (this.index * SIZEOF_ACTOR) + 0xD8, value)
    }
    
    set health(value: number) {
        this.emulator.rdramWrite16(ACTOR_LIST_POINTER + (this.index * SIZEOF_ACTOR) + 0xE0, value)
    }
    
    set damage_queue(value: number) {
        this.emulator.rdramWrite16(ACTOR_LIST_POINTER + (this.index * SIZEOF_ACTOR) + 0xE2, value)
    }
    
    set velocity(value: Vector2) {
        let addr = ACTOR_LIST_POINTER + (this.index * SIZEOF_ACTOR) + 0xEC
        this.emulator.rdramWrite16(addr, value.x)
        this.emulator.rdramWrite16(addr + 4, value.x)
    }
    
    set scaleXY(value: number) {
        this.emulator.rdramWriteF32(ACTOR_LIST_POINTER + (this.index * SIZEOF_ACTOR) + 0x120, value)
    }
    
    set scale_1(value: Vector2) {
        let addr = ACTOR_LIST_POINTER + (this.index * SIZEOF_ACTOR) + 0x124
        this.emulator.rdramWriteF32(addr, value.x)
        this.emulator.rdramWriteF32(addr + 4, value.y)
    }
    
    set air_ground_state(value: number) {
        this.emulator.rdramWrite16(ACTOR_LIST_POINTER + (this.index * SIZEOF_ACTOR) + 0x12C, value)
    }
    
    set idle_time(value: number) {
        this.emulator.rdramWrite32(ACTOR_LIST_POINTER + (this.index * SIZEOF_ACTOR) + 0x150, value)
    }
    
    set anim_flags(value: number) {
        this.emulator.rdramWrite32(ACTOR_LIST_POINTER + (this.index * SIZEOF_ACTOR) + 0x170, value)
    }
    
    set flags_2(value: number) {
        this.emulator.rdramWrite32(ACTOR_LIST_POINTER + (this.index * SIZEOF_ACTOR) + 0x17C, value)
    }
}

export class Player extends Actor implements IPlayer {
    get camera_pos() {
        let addr = GLOBAL_CONTEXT_POINTER + 0x80
        return new Vector2(this.emulator.rdramRead16(addr), this.emulator.rdramRead16(addr + 8))
    }

    get real_pos() {
        let addr = GLOBAL_CONTEXT_POINTER + 0x80
        return new Vector2(this.emulator.rdramRead16(addr), this.emulator.rdramRead16(addr + 4))
    }

    set camera_pos(value: Vector2) {
        let addr = GLOBAL_CONTEXT_POINTER + 0x80
        this.emulator.rdramWrite16(addr, value.x)
        this.emulator.rdramWrite16(addr + 8, value.y)
    }

    set real_pos(value: Vector2) {
        let addr = GLOBAL_CONTEXT_POINTER + 0x108
        this.emulator.rdramWrite16(addr, value.x)
        this.emulator.rdramWrite16(addr + 4, value.y)
    }
}

export default IActor


