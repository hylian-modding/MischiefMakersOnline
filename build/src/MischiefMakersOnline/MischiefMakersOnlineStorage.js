"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class MischiefMakersOnlineSaveStorage {
    constructor() {
        this.gold_gems = Buffer.alloc(8);
        this.unlocked_levels = Buffer.alloc(4);
        this.best_times = Buffer.alloc(0x90);
    }
}
class MischiefMakersOnlineStorage extends MischiefMakersOnlineSaveStorage {
    constructor() {
        super();
        this.networkPlayerInstances = {};
        this.players = {};
    }
}
exports.MischiefMakersOnlineStorage = MischiefMakersOnlineStorage;
exports.default = MischiefMakersOnlineStorage;
//# sourceMappingURL=MischiefMakersOnlineStorage.js.map