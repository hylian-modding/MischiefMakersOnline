"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Vector2 {
    constructor(_x = 0, _y = 0) {
        this.x = 0;
        this.y = 0;
        _x = isNaN(_x) ? 0 : _x;
        _y = isNaN(_y) ? 0 : _y;
        this.x = _x;
        this.y = _y;
    }
    plus(rhs) {
        return new Vector2(this.x + rhs.x, this.y + rhs.y);
    }
    minus(rhs) {
        return new Vector2(this.x - rhs.x, this.y - rhs.y);
    }
    multiply(rhs) {
        return new Vector2(this.x * rhs.x, this.y * rhs.y);
    }
    multiplyN(rhs) {
        return new Vector2(this.x * rhs, this.y * rhs);
    }
    divide(rhs) {
        return new Vector2(this.x / rhs.x, this.y / rhs.y);
    }
    divideN(rhs) {
        return new Vector2(this.x / rhs, this.y / rhs);
    }
    magnitude() {
        return Math.pow(this.x * this.x + this.y * this.y, 0.5);
    }
    inverse() {
        return this.multiplyN(-1);
    }
    dot(rhs) {
        return this.x * rhs.x
            + this.y * rhs.y;
    }
    normalized() {
        let mag = this.magnitude();
        if (mag == 0)
            return new Vector2();
        return this.divideN(mag);
    }
    toString() {
        return "(" + this.x.toString() + ", " + this.y.toString() + ")";
    }
    isNaN() {
        return !(this.x === this.x && this.y === this.y);
    }
    getNaNs() {
        return (!(this.x === this.x) ? "x " : "") + (!(this.y === this.y) ? "y " : "");
    }
}
exports.default = Vector2;
//# sourceMappingURL=Vector2.js.map