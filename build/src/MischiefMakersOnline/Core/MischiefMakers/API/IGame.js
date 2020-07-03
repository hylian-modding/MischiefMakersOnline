"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GAME_CONTEXT_POINTER = 0x800BC4C0;
class Game {
    constructor(emu) {
        this.emulator = emu;
    }
    get stage_timer() {
        return this.emulator.rdramRead16(exports.GAME_CONTEXT_POINTER + 0x10);
    }
    get game_timer() {
        return this.emulator.rdramRead16(exports.GAME_CONTEXT_POINTER + 0x14);
    }
    get is_paused() {
        return this.emulator.rdramRead16(exports.GAME_CONTEXT_POINTER + 0x18);
    }
    get in_cutscene() {
        return this.emulator.rdramRead16(exports.GAME_CONTEXT_POINTER + 0x1C);
    }
    get game_state() {
        return this.emulator.rdramRead16(exports.GAME_CONTEXT_POINTER + 0x20);
    }
    get temp_state() {
        return this.emulator.rdramRead16(exports.GAME_CONTEXT_POINTER + 0x24);
    }
    get controller() {
        return this.emulator.rdramRead16(exports.GAME_CONTEXT_POINTER + 0x28);
    }
    get controller_pressed() {
        return this.emulator.rdramRead16(exports.GAME_CONTEXT_POINTER + 0x2C);
    }
    get keybinds() {
        return this.emulator.rdramReadBuffer(exports.GAME_CONTEXT_POINTER + 0x30, 0x38);
    }
    get joy_x() {
        return this.emulator.rdramRead16(exports.GAME_CONTEXT_POINTER + 0x6C);
    }
    get joy_y() {
        return this.emulator.rdramRead16(exports.GAME_CONTEXT_POINTER + 0x70);
    }
}
exports.Game = Game;
//# sourceMappingURL=IGame.js.map