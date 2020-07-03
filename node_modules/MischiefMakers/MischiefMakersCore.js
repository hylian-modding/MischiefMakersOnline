"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ISave_1 = require("./API/ISave");
const IActor_1 = require("./API/IActor");
class MischiefMakers {
    preinit() {
        this.ModLoader.logger.info("TEST0");
    }
    init() {
        this.ModLoader.logger.info("TEST1");
    }
    postinit() {
        this.ModLoader.logger.info("TEST2");
        this.marina = new IActor_1.Player(this.ModLoader.emulator, 0);
        this.save = new ISave_1.Save(this.ModLoader.emulator);
    }
    onTick() { }
}
exports.MischiefMakers = MischiefMakers;
//# sourceMappingURL=MischiefMakersCore.js.map