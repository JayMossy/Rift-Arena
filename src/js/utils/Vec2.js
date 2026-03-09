// src/js/utils/Vec2.js

/**
 * Vec2 = 2D vector utility class.
 *
 * Why this exists:
 * - Positions, velocities, directions, and knockback are all 2D vectors
 * - Centralizing vector math avoids repeated low-level math everywhere
 * - Makes physics and AI code much more readable
 *
 * Important design choice:
 * Methods mutate the current vector and return `this`.
 * This makes game code concise and chainable.
 */
export class Vec2 {
  /**
   * @param {number} x - Horizontal component
   * @param {number} y - Vertical component
   */
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  /**
   * Set both components directly.
   *
   * Useful for resets / respawns.
   *
   * @param {number} x
   * @param {number} y
   * @returns {Vec2}
   */
  set(x, y) {
    this.x = x;
    this.y = y;
    return this;
  }

  /**
   * Return a new Vec2 with the same values.
   *
   * Important:
   * Use clone() when you need a temporary vector and do NOT want to mutate the original.
   *
   * @returns {Vec2}
   */
  clone() {
    return new Vec2(this.x, this.y);
  }

  /**
   * Add another vector to this one.
   *
   * @param {Vec2} v
   * @returns {Vec2}
   */
  add(v) {
    this.x += v.x;
    this.y += v.y;
    return this;
  }

  /**
   * Subtract another vector from this one.
   *
   * @param {Vec2} v
   * @returns {Vec2}
   */
  sub(v) {
    this.x -= v.x;
    this.y -= v.y;
    return this;
  }

  /**
   * Multiply both components by a scalar value.
   *
   * @param {number} s - Scalar multiplier
   * @returns {Vec2}
   */
  scale(s) {
    this.x *= s;
    this.y *= s;
    return this;
  }

  /**
   * Vector length / magnitude.
   *
   * Formula:
   * sqrt(x^2 + y^2)
   *
   * @returns {number}
   */
  len() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  /**
   * Normalize the vector to length 1 while preserving direction.
   *
   * Important:
   * If the vector length is 0, do nothing to avoid division by 0.
   *
   * @returns {Vec2}
   */
  normalize() {
    const length = this.len();

    if (length > 0) {
      this.x /= length;
      this.y /= length;
    }

    return this;
  }

  /**
   * Clamp this vector's magnitude to a maximum length.
   *
   * Useful for:
   * - speed caps
   * - force caps
   * - recoil or knockback limits
   *
   * @param {number} max - Maximum allowed vector length
   * @returns {Vec2}
   */
  clampLen(max) {
    const length = this.len();

    if (length > max && length > 0) {
      const scale = max / length;
      this.x *= scale;
      this.y *= scale;
    }

    return this;
  }
}