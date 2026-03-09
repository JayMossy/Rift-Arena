// src/js/utils/collision.js

/**
 * Check whether two circles overlap.
 *
 * Why circles?
 * - Very cheap collision math
 * - Good fit for top-down arena games
 * - Easier than rectangle collision for bullets/enemies/player bodies
 *
 * Uses squared distance instead of actual distance:
 * - avoids expensive sqrt()
 * - standard optimization for collision checks
 *
 * @param {number} ax - Circle A center x
 * @param {number} ay - Circle A center y
 * @param {number} ar - Circle A radius
 * @param {number} bx - Circle B center x
 * @param {number} by - Circle B center y
 * @param {number} br - Circle B radius
 * @returns {boolean} True if circles overlap or touch
 */
export function circlesOverlap(ax, ay, ar, bx, by, br) {
  const dx = ax - bx;
  const dy = ay - by;
  const r = ar + br;

  return dx * dx + dy * dy <= r * r;
}