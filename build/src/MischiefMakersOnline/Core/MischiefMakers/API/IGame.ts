import IMemory from "modloader64_api/IMemory";

export const GAME_CONTEXT_POINTER = 0x800BC4C0

export interface IGame {
    stage_timer: number
    is_paused: number
    game_timer: number
    in_cutscene: number
    game_state: number
    temp_state: number
    controller: number
    controller_pressed: number
    keybinds: Buffer // 0x38 size
    joy_x: number
    joy_y: number   
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
}

