// src/js/systems/BulletSystem.js
import { Vec2 } from "../utils/Vec2.js";

/**
 * BulletSystem owns the full bullet lifecycle:
 * - spawning bullets
 * - updating bullet movement
 * - handling bullet lifetime
 * - removing bullets when they expire or leave the arena
 * - rendering bullets
 *
 * Why a system?
 * - Bullets are short-lived entities with predictable lifecycle
 * - Centralizing bullet behavior keeps RunScene cleaner
 * - Makes later upgrades easier (piercing, spread, crits, homing, etc.)
 */
export class BulletSystem {
  constructor() {
    /**
     * Active bullet instances.
     * Each bullet is a plain data object.
     */
    this.bullets = [];
  }

  /**
   * Reduce the player's cooldown timer over time.
   *
   * Important:
   * cooldown belongs to the player because firing rate is a player stat.
   * The BulletSystem just helps manage the timer each frame.
   *
   * @param {object} player - The player entity
   * @param {number} dt - Delta time in seconds
   */
  tickCooldown(player, dt) {
    player.cooldown = Math.max(0, player.cooldown - dt);
  }

  /**
   * Attempt to fire a bullet.
   *
   * Fires only if:
   * - mouse button is currently down
   * - player's cooldown has reached 0
   *
   * @param {object} player - Player entity with aimAngle, fireRate, bulletSpeed, cooldown
   * @param {boolean} mouseDown - Whether the fire input is currently active
   */
  tryShoot(player, mouseDown) {
    if (!mouseDown) return;
    if (player.cooldown > 0) return;

    // Reset cooldown based on shots per second.
    // Example: fireRate = 10 -> one shot every 0.1 seconds
    player.cooldown = 1 / player.fireRate;

    // Build a unit direction vector from the player's current aim angle.
    const dir = new Vec2(
      Math.cos(player.aimAngle),
      Math.sin(player.aimAngle)
    );

    // Spawn slightly in front of the player so bullets do not begin inside the player body.
    const muzzleOffset = player.size * 0.7;
    const spawnPos = player.pos.clone().add(dir.clone().scale(muzzleOffset));

    const bullet = {
      pos: spawnPos,
      vel: dir.scale(player.bulletSpeed),
      radius: 4,
      life: 1.5
    };

    this.bullets.push(bullet);
  }

  /**
   * Update every active bullet.
   *
   * Responsibilities:
   * - move bullet using velocity
   * - reduce lifetime
   * - remove bullets when expired or offscreen
   *
   * @param {number} dt - Delta time in seconds
   * @param {HTMLCanvasElement} canvas - Used for offscreen bounds checking
   */
  update(dt, canvas) {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];

      // Integrate position from velocity
      b.pos.add(b.vel.clone().scale(dt));

      // Countdown lifespan
      b.life -= dt;

      // Remove bullets that go offscreen or expire
      const r = b.radius;
      const offscreen =
        b.pos.x < -r ||
        b.pos.x > canvas.width + r ||
        b.pos.y < -r ||
        b.pos.y > canvas.height + r;

      if (b.life <= 0 || offscreen) {
        this.bullets.splice(i, 1);
      }
    }
  }

  /**
   * Remove a bullet by index.
   *
   * This is used when a bullet collides with an enemy and should be consumed.
   *
   * @param {number} index - Bullet array index to remove
   */
  consumeBulletAt(index) {
    this.bullets.splice(index, 1);
  }

  /**
   * Render all active bullets.
   *
   * @param {CanvasRenderingContext2D} ctx
   */
  render(ctx) {
    ctx.fillStyle = "#66e0ff";

    for (const b of this.bullets) {
      ctx.beginPath();
      ctx.arc(b.pos.x, b.pos.y, b.radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}