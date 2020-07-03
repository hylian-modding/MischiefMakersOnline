"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SAVE_CONTEXT_0_POINTER = 0x8016F540;
exports.SAVE_CONTEXT_1_POINTER = 0x800C2F18;
class Save {
    constructor(emu) {
        this.emulator = emu;
    }
    get gold_gems() {
        return this.emulator.rdramReadBuffer(exports.SAVE_CONTEXT_0_POINTER, 8);
    }
    get unlocked_levels() {
        return this.emulator.rdramReadBuffer(exports.SAVE_CONTEXT_0_POINTER + 8, 4);
    }
    get best_times() {
        return this.emulator.rdramReadBuffer(exports.SAVE_CONTEXT_1_POINTER, 0x90);
    }
    get current_scene() {
        return 1; // TODO
    }
    set gold_gems(value) {
        this.emulator.rdramWriteBuffer(exports.SAVE_CONTEXT_0_POINTER, value);
    }
    set unlocked_levels(value) {
        this.emulator.rdramWriteBuffer(exports.SAVE_CONTEXT_0_POINTER + 8, value);
    }
    set best_times(value) {
        this.emulator.rdramWriteBuffer(exports.SAVE_CONTEXT_1_POINTER, value);
    }
}
exports.Save = Save;
//# sourceMappingURL=ISave.js.map