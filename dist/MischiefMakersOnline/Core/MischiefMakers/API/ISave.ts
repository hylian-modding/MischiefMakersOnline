import IMemory from "modloader64_api/IMemory";

export const SAVE_CONTEXT_0_POINTER = 0x8016F540
export const SAVE_CONTEXT_1_POINTER = 0x800C2F18

export interface ISave {
    gold_gems: Buffer // 8 bytes
    unlocked_levels: Buffer // 4 bytes
    best_times: Buffer // 0x90 bytes
    current_scene: number
}

export class Save implements ISave {
    emulator!: IMemory

    constructor (emu: IMemory) {
        this.emulator = emu
    }

    get gold_gems() {
        return this.emulator.rdramReadBuffer(SAVE_CONTEXT_0_POINTER, 8)
    }

    get unlocked_levels() {
        return this.emulator.rdramReadBuffer(SAVE_CONTEXT_0_POINTER + 8, 4)
    }

    get best_times() {
        return this.emulator.rdramReadBuffer(SAVE_CONTEXT_1_POINTER, 0x90)
    }

    get current_scene() {
        return 1 // TODO
    }

    set gold_gems(value: Buffer) {
        this.emulator.rdramWriteBuffer(SAVE_CONTEXT_0_POINTER, value)
    }

    set unlocked_levels(value: Buffer) {
        this.emulator.rdramWriteBuffer(SAVE_CONTEXT_0_POINTER + 8, value)
    }

    set best_times(value: Buffer) {
        this.emulator.rdramWriteBuffer(SAVE_CONTEXT_1_POINTER, value)
    }
}


