// src/js/utils/Vec2.js
export class Vec2 {
    constructor(x = 0, y =0) {
        this.x = x;
        this.y = y;
    }
    len() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    normalize() {
        let length = this.len();
        if (length > 0) {
            this.x /= length;
            this.y /= length;
        }
        return this;
    }
    clone() {
        return new Vec2(this.x, this.y);
    }
    add(v) {
        this.x += v.x;
        this.y += v.y;
        return this;
    }
    sub(v) {
        this.x -= v.x;
        this.y -= v.y;
        return this;
    }
    scale(s) {
        this.x *= s;
        this.y *= s;
        return this;
    }
}