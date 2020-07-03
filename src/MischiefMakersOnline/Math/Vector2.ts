class Vector2 {
    public x: number = 0;
    public y: number = 0;

    public constructor(_x: number = 0, _y: number = 0){
        _x = isNaN(_x) ? 0 : _x;
        _y = isNaN(_y) ? 0 : _y;
        this.x = _x;
        this.y = _y;
    }

    plus(rhs: Vector2) : Vector2 {
        return new Vector2(
            this.x + rhs.x,
            this.y + rhs.y,
        );
    }

    minus(rhs: Vector2) : Vector2 {
        return new Vector2(
            this.x - rhs.x,
            this.y - rhs.y,
        );
    }

    multiply(rhs: Vector2) : Vector2 {
        return new Vector2(
            this.x * rhs.x,
            this.y * rhs.y,
        );
    }

    multiplyN(rhs: number) : Vector2 {
        return new Vector2(
            this.x * rhs,
            this.y * rhs,
        );
    }

    divide(rhs: Vector2) : Vector2 {
        return new Vector2(
            this.x / rhs.x,
            this.y / rhs.y,
        );
    }

    divideN(rhs: number) : Vector2 {
        return new Vector2(
            this.x / rhs,
            this.y / rhs,
        );
    }

    magnitude() : number {
        return Math.pow(this.x * this.x + this.y * this.y, 0.5);
    }

    inverse() : Vector2 {
        return this.multiplyN(-1);
    }

    dot(rhs: Vector2) : number {
        return this.x * rhs.x
            + this.y * rhs.y
    }

    normalized() : Vector2 {
        let mag = this.magnitude();
        if (mag == 0) return new Vector2();
        return this.divideN(mag);
    }

    toString() : string {
        return "(" + this.x.toString() + ", " + this.y.toString() + ")";
    }

    isNaN() : boolean {
        return !(this.x===this.x && this.y===this.y);
    }

    getNaNs() : string {
        return (!(this.x===this.x) ? "x " : "") + (!(this.y===this.y) ? "y " : "");
    }


}

export default Vector2;

