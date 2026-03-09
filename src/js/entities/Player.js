// src/js/entities/Player.js
import { Vec2 } from "../utils/Vec2.js";

/**
 * Create a player entity.
 *
 * Why a factory function instead of a hard-coded object?
 * - Lets us create/reset a player cleanly
 * - Keeps construction logic in one place
 * - Makes future spawning/checkpoint systems easier
 *
 * @param {number} x - Starting x position in world/canvas space
 * @param {number} y - Starting y position in world/canvas space
 * @returns {object} Player state object
 */
export function createPlayer(x, y) {
  return {
    // Core transform / motion state
    pos: new Vec2(x, y),
    vel: new Vec2(0, 0),

    // Current visual size.
    // We are still using size for rendering + collision radius approximation.
    size: 20,

    // Movement tuning:
    // accel = how quickly the player gains speed
    // drag = how quickly velocity is damped each frame
    // maxSpeed = hard cap so velocity does not grow forever
    accel: 1000,
    drag: 8,
    maxSpeed: 300,

    // Combat / aiming
    aimAngle: 0,
    fireRate: 10,       // bullets per second
    bulletSpeed: 650,   // pixels per second
    cooldown: 0,        // internal fire timer; do not set manually in normal play

    // Survivability
    hp: 5,
    maxHp: 5,

    // Invulnerability window after taking a hit.
    // invulnTime counts down during update().
    invulnTime: 0,
    invulnDuration: 0.75
  };
}