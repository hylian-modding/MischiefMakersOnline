import IMemory from "modloader64_api/IMemory";

export const GAME_CONTEXT_POINTER = 0x800BC4C0

export interface IGame {
    stage_timer: number
    is_paused: number
    game_timer: number
    in_cutscene: number
    game_state: number /*
                0x00 = soft reset
                0x01 = intro splash
                0x02 = title screen
                0x03 = sound test
                0x04 = secret level select
                0x05 = loading
                0x06 = in level
                0x07 = fade out to death screen
                0x08 = intentional trap (This appears to be intended behaviour in this mode)
                0x09 = ??? (The instructions just after the trap)
                0x0A = demo mode
                0x0B = file select
                0x0C = stage transition
                0x0E = best times screen
                (See the proc at 0x800015F0)*/
    temp_state: number
    controller: number
    controller_pressed: number
    keybinds: Buffer // 0x38 size
    joy_x: number
    joy_y: number   
    current_scene: number
}

export class Game implements IGame {
    emulator!: IMemory

    constructor (emu: IMemory) {
        this.emulator = emu
    }

    get stage_timer() {
        return this.emulator.rdramRead16(GAME_CONTEXT_POINTER + 0x10)
    }

    get game_timer() {
        return this.emulator.rdramRead16(GAME_CONTEXT_POINTER + 0x14)
    }

    get is_paused() {
        return this.emulator.rdramRead16(GAME_CONTEXT_POINTER + 0x18)
    }

    get in_cutscene() {
        return this.emulator.rdramRead16(GAME_CONTEXT_POINTER + 0x1C)
    }

    get game_state() {
        return this.emulator.rdramRead16(GAME_CONTEXT_POINTER + 0x20)
    }

    get temp_state() {
        return this.emulator.rdramRead16(GAME_CONTEXT_POINTER + 0x24)
    }

    get controller() {
        return this.emulator.rdramRead16(GAME_CONTEXT_POINTER + 0x28)
    }

    get controller_pressed() {
        return this.emulator.rdramRead16(GAME_CONTEXT_POINTER + 0x2C)
    }

    get keybinds() {
        return this.emulator.rdramReadBuffer(GAME_CONTEXT_POINTER + 0x30, 0x38)
    }

    get joy_x() {
        return this.emulator.rdramRead16(GAME_CONTEXT_POINTER + 0x6C)
    }

    get joy_y() {
        return this.emulator.rdramRead16(GAME_CONTEXT_POINTER + 0x70)
    }

    get current_scene() {
        return this.emulator.rdramRead16(0x800D08D4)
    }
}

