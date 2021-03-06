import Vector3 from 'modloader64_api/math/Vector3'
import Vector2 from '../Math/Vector2'
import IMemory from 'modloader64_api/IMemory'
import { stat } from 'fs'

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
    current_sprite: number // spritesheet
    current_sprite_index: number // sprite index
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
    velocity: Vector2 // short, padding (2), short, padding (2), short, padding (2) <- Should we include the Z value?
    scaleXY: number // float
    scale_1: Vector2 // float[2]
    air_ground_state: number // short
    idle_time: number // u32
    anim_flags: number // u32
    flags_2: number // u32
}

export interface IPlayer extends IActor {
    camera_pos: Vector2 // Raw position of the camera
    camera_pos_final: Vector2 // Final position of the camera (after it has been smoothed)
    real_pos: Vector2
}

export class Actor implements IActor {
    emulator!: IMemory

    index: number // Actor index on actor list

    constructor (emu: IMemory, idx: number = 0) {
        this.emulator = emu
        this.index = idx
    }

    get pos_0() {
        let addr = ACTOR_LIST_POINTER + (this.index * SIZEOF_ACTOR) + ACTORO_POS0
        return new Vector3(this.emulator.rdramReadS16(addr),
            this.emulator.rdramReadS16(addr + 4),
            this.emulator.rdramReadS32(addr + 8))
    }

    get pos_1() {
        let addr = ACTOR_LIST_POINTER + (this.index * SIZEOF_ACTOR) + ACTORO_POS1
        return new Vector3(this.emulator.rdramReadS16(addr),
            this.emulator.rdramReadS16(addr + 4),
            this.emulator.rdramReadS32(addr + 8))
    }

    get mode() {
        return this.emulator.rdramRead32(ACTOR_LIST_POINTER + (this.index * SIZEOF_ACTOR) + ACTORO_MODE)
    }

    get current_sprite() {
        return this.emulator.rdramRead8(ACTOR_LIST_POINTER + (this.index * SIZEOF_ACTOR) + ACTORO_SPRITE)
    }

    get current_sprite_index() {
        return this.emulator.rdramRead8(ACTOR_LIST_POINTER + (this.index * SIZEOF_ACTOR) + ACTORO_SPRITE + 1)
    }

    get pos_2() {
        let addr = ACTOR_LIST_POINTER + (this.index * SIZEOF_ACTOR) + ACTORO_POS2
        return new Vector3(this.emulator.rdramReadS16(addr),
            this.emulator.rdramReadS16(addr + 4),
            this.emulator.rdramReadS16(addr + 8))
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
        return new Vector2(this.emulator.rdramReadS16(addr), this.emulator.rdramReadS16(addr + 2))
    }

    get pos_4() {
        let addr = ACTOR_LIST_POINTER + (this.index * SIZEOF_ACTOR) + ACTORO_POS4
        return new Vector2(this.emulator.rdramReadS16(addr), this.emulator.rdramReadS16(addr + 2))
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
        return new Vector2(this.emulator.rdramReadS16(addr), this.emulator.rdramReadS16(addr + 4))
        //return new Vector2(this.emulator.rdramReadS32(addr), this.emulator.rdramReadS32(addr + 4))
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

    get is_alive(): boolean {
        return (this.mode & 2) != 0
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
        this.emulator.rdramWrite8(ACTOR_LIST_POINTER + (this.index * SIZEOF_ACTOR) + 0x84, value)
    }

    set current_sprite_index(value: number) {
        this.emulator.rdramWrite8(ACTOR_LIST_POINTER + (this.index * SIZEOF_ACTOR) + 0x85, value)
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
        /*this.emulator.rdramWrite32(addr, value.x)
        this.emulator.rdramWrite32(addr + 4, value.x)*/
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
        return new Vector2(this.emulator.rdramReadS16(addr), this.emulator.rdramReadS16(addr + 4))
    }

    get camera_pos_final() {
        let addr = GLOBAL_CONTEXT_POINTER + 0x90
        return new Vector2(this.emulator.rdramReadS16(addr), this.emulator.rdramReadS16(addr + 4))
    }

    get real_pos() {
        let addr = GLOBAL_CONTEXT_POINTER + 0x108
        return new Vector2(this.emulator.rdramReadS16(addr), this.emulator.rdramReadS16(addr + 4))
    }

    set camera_pos(value: Vector2) {
        let addr = GLOBAL_CONTEXT_POINTER + 0x80
        this.emulator.rdramWrite16(addr, value.x)
        this.emulator.rdramWrite16(addr + 4, value.y)
    }

    set camera_pos_final(value: Vector2) {
        let addr = GLOBAL_CONTEXT_POINTER + 0x90
        this.emulator.rdramWrite16(addr, value.x)
        this.emulator.rdramWrite16(addr + 4, value.y)
    }

    set real_pos(value: Vector2) {
        let addr = GLOBAL_CONTEXT_POINTER + 0x108
        this.emulator.rdramWrite16(addr, value.x)
        this.emulator.rdramWrite16(addr + 4, value.y)
    }
}

export class SceneActorUpdate {
    index: number
    real_pos_0: Vector3
    real_pos_1: Vector3
    mode: number
    sprite: number
    real_pos_2: Vector3
    real_pos_3: Vector2
    real_pos_4: Vector2
    type: number
    health: number
    velocity: Vector2
    ags: number
    time: number

    // This is a sin
    constructor(index: number, pos_0: Vector3, pos_1: Vector3, pos_2: Vector3, pos_3: Vector2, pos_4: Vector2, vel: Vector2, type: number, mode: number, health: number, sprite: number, ags: number) {
        this.index = index
        this.real_pos_0 = pos_0
        this.real_pos_1 = pos_1
        this.real_pos_2 = pos_2
        this.real_pos_3 = pos_3
        this.real_pos_4 = pos_4
        this.velocity = vel
        this.type = type
        this.mode = mode
        this.health = health
        this.sprite = sprite
        this.ags = ags
        this.time = new Date().valueOf()
    }
}

export class SceneActor extends Actor {
    last_real_pos_0: Vector3
    last_real_pos_1: Vector3
    last_real_pos_2: Vector3
    last_real_pos_3: Vector2
    last_real_pos_4: Vector2
    last_vel: Vector2
    last_type: number
    last_mode: number
    last_health: number
    last_update: number
    changed: boolean

    constructor(emulator: IMemory, index: number) {
        super(emulator, index)

        this.last_real_pos_0 = new Vector3()
        this.last_real_pos_1 = new Vector3()
        this.last_real_pos_2 = new Vector3()
        this.last_real_pos_3 = new Vector2()
        this.last_real_pos_4 = new Vector2()
        this.last_vel = this.velocity
        this.last_type = this.type
        this.last_mode = this.mode
        this.last_health = this.health
        this.last_update = 0
        this.changed = false
    }

    update(camera_pos: Vector2) {
        let real_pos_0 = new Vector3(camera_pos.x + this.pos_0.x, camera_pos.y + this.pos_0.y, this.pos_0.z)
        let real_pos_1 = new Vector3(camera_pos.x + this.pos_1.x, camera_pos.y + this.pos_1.y, this.pos_1.z)
        let real_pos_2 = new Vector3(camera_pos.x + this.pos_2.x, camera_pos.y + this.pos_2.y, this.pos_2.z)
        let real_pos_3 = new Vector2(camera_pos.x + this.pos_3.x, camera_pos.y + this.pos_3.y)
        let real_pos_4 = new Vector2(camera_pos.x + this.pos_4.x, camera_pos.y + this.pos_4.y)
        let vel = this.velocity
        let type = this.type
        let mode = this.mode
        let health = this.health

        if (real_pos_2 != this.last_real_pos_2 || vel != this.last_vel  || type != this.last_type || mode != this.last_mode || health != this.last_health) {
            this.changed = true
        }

        this.last_real_pos_0 = real_pos_0
        this.last_real_pos_1 = real_pos_1
        this.last_real_pos_2 = real_pos_2
        this.last_real_pos_3 = real_pos_3
        this.last_real_pos_4 = real_pos_4
        this.last_vel = vel
        this.last_type = type
        this.last_mode = mode
        this.last_health = health
    }

    getPacketData(): SceneActorUpdate {
        return new SceneActorUpdate(this.index,
            this.last_real_pos_0, this.last_real_pos_1, this.last_real_pos_2, this.last_real_pos_3, this.last_real_pos_4, this.last_vel,
            this.last_type, this.last_mode, this.last_health, this.current_sprite, this.air_ground_state)
    }

    setDataFromPacket(update: SceneActorUpdate, camera_pos: Vector2): void {
        if (this.last_update < update.time) {
            let pos_0 = new Vector3(update.real_pos_0.x - camera_pos.x, update.real_pos_0.y - camera_pos.y, update.real_pos_0.z)
            let pos_1 = new Vector3(update.real_pos_1.x - camera_pos.x, update.real_pos_1.y - camera_pos.y, update.real_pos_1.z)
            let pos_2 = new Vector3(update.real_pos_2.x - camera_pos.x, update.real_pos_2.y - camera_pos.y, update.real_pos_2.z)
            let pos_3 = new Vector2(update.real_pos_3.x - camera_pos.x, update.real_pos_3.y - camera_pos.y)
            let pos_4 = new Vector2(update.real_pos_4.x - camera_pos.x, update.real_pos_4.y - camera_pos.y)

            this.velocity = update.velocity
            this.current_sprite = update.sprite

            this.last_real_pos_0 = update.real_pos_0
            this.last_real_pos_1 = update.real_pos_1
            this.last_real_pos_2 = update.real_pos_2
            this.last_real_pos_3 = update.real_pos_3
            this.last_real_pos_4 = update.real_pos_4
            this.pos_0 = pos_0
            this.pos_1 = pos_1
            this.pos_2 = pos_2
            this.pos_3 = pos_3
            this.pos_4 = pos_4
            this.air_ground_state = update.ags

            this.last_vel = this.velocity
            this.last_type = this.type
            this.last_health = this.health
            this.changed = false

            if ((update.mode & 2) == 0) this.mode = update.mode
            this.last_update = new Date().valueOf()
        }

        this.type = update.type
        this.health = update.health
    }


}

export default IActor


