// src/js/systems/EnemySystem.js
import { Vec2 } from "../utils/Vec2.js";

/**
 * EnemySystem owns the enemy lifecycle:
 * - spawning
 * - updating movement / AI
 * - taking damage
 * - removing dead enemies
 * - rendering
 *
 * Why use a system instead of storing enemies loosely in the scene?
 * - Centralizes lifecycle rules
 * - Makes new enemy types easier later
 * - Keeps RunScene from becoming a giant "god file"
 */
export class EnemySystem {
  constructor() {
    /**
     * Active enemy instances currently in the room.
     * Each enemy is plain data + updated by this system.
     */
    this.enemies = [];

    /**
     * Enemy templates / definitions.
     *
     * Important:
     * These are NOT actual enemies.
     * These are reusable stat blueprints used by spawn().
     */
    this.enemyDefs = {
      seeker: {
        radius: 15,
        speed: 140,
        hp: 3
      }
    };
  }

  /**
   * Spawn an enemy instance from a named enemy definition.
   *
   * @param {string} type - Key in this.enemyDefs, such as "seeker"
   * @param {number} x - Spawn x position
   * @param {number} y - Spawn y position
   * @returns {object} The spawned enemy instance
   */
  spawn(type, x, y) {
    const def = this.enemyDefs[type];
    if (!def) {
      throw new Error(`Unknown enemy type: ${type}`);
    }

    const enemy = {
      type,
      pos: new Vec2(x, y),
      vel: new Vec2(0, 0),
      radius: def.radius,
      speed: def.speed,
      hp: def.hp,
      alive: true
    };

    this.enemies.push(enemy);
    return enemy;
  }

  /**
   * Apply damage to an enemy.
   *
   * Important:
   * We mark enemies dead here, but actual removal happens in update().
   * That keeps lifecycle handling in one place.
   *
   * @param {object} enemy - Enemy instance to damage
   * @param {number} dmg - Damage amount
   */
  takeDamage(enemy, dmg) {
    if (!enemy.alive) return;

    enemy.hp -= dmg;

    if (enemy.hp <= 0) {
      enemy.alive = false;
    }
  }

  /**
   * Update all enemies.
   *
   * Current AI:
   * - seeker enemies move directly toward the player at constant speed
   *
   * Notes:
   * - This is steering, not full acceleration-based physics
   * - Good enough for Enemy 01
   * - Easy to replace later with more advanced behavior
   *
   * @param {number} dt - Delta time in seconds
   * @param {object} player - Player entity, used as AI target
   * @param {HTMLCanvasElement} canvas - Arena bounds for simple clamping
   */
  update(dt, player, canvas) {
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];

      // Remove dead enemies cleanly during update.
      if (!e.alive) {
        this.enemies.splice(i, 1);
        continue;
      }

      // Direction from enemy to player
      const dir = player.pos.clone().sub(e.pos).normalize();

      // Constant-speed chase
      e.vel = dir.scale(e.speed);

      // Integrate position using velocity
      e.pos.add(e.vel.clone().scale(dt));

      // Keep enemy inside arena bounds
      const r = e.radius;
      e.pos.x = Math.max(r, Math.min(canvas.width - r, e.pos.x));
      e.pos.y = Math.max(r, Math.min(canvas.height - r, e.pos.y));
    }
  }

  /**
   * Render all active enemies.
   *
   * Visual note:
   * HP-based color makes damage more readable even before particles/juice exist.
   *
   * @param {CanvasRenderingContext2D} ctx
   */
  render(ctx) {
    for (const e of this.enemies) {
      ctx.fillStyle = e.hp >= 2 ? "#ff9933" : "#ff5533";

      ctx.beginPath();
      ctx.arc(e.pos.x, e.pos.y, e.radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}