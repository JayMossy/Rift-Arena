// src/js/utils/Vec2.js
export class Vec2 {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  clone() {
    return new Vec2(this.x, this.y);
  }

  set(x, y) {
    this.x = x;
    this.y = y;
    return this;
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

  len() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  normalize() {
    const length = this.len();
    if (length > 0) {
      this.x /= length;
      this.y /= length;
    }
    return this;
  }

  clampLen(max) {
    const length = this.len();
    if (length > max && length > 0) {
      const s = max / length;
      this.x *= s;
      this.y *= s;
    }
    return this;
  }
}