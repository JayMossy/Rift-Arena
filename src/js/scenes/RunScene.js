// src/js/scenes/RunScene.js
import { input } from "../core/input.js";
import { createPlayer } from "../entities/Player.js";
import { Vec2 } from "../utils/Vec2.js";
import { BulletSystem } from "../systems/BulletSystem.js";
import { EnemySystem } from "../systems/EnemySystem.js";
import { circlesOverlap } from "../utils/collision.js";

/**
 * RunScene is the active gameplay scene.
 *
 * Responsibilities:
 * - player movement and aiming
 * - bullet updates
 * - enemy updates
 * - room loop / spawning state
 * - combat collisions
 * - render gameplay + HUD
 *
 * Why keep this scene fairly explicit right now?
 * - You are still learning core game loop structure
 * - Explicit flow is easier to debug and reason about
 * - We can split more into systems later once the loop is stable
 */
export class RunScene {
  constructor() {
    // Core entities / systems
    this.player = createPlayer(450, 300);
    this.bullets = new BulletSystem();
    this.enemies = new EnemySystem();

    // -----------------------------
    // Room state
    // -----------------------------
    this.roomNumber = 1;

    // Total enemies this room should spawn before the room can be cleared.
    this.enemiesToSpawn = this.roomNumber * 4;

    // Count of how many enemies have actually been spawned so far this room.
    this.enemiesSpawned = 0;

    // Spawn timing
    this.spawnTimer = 0;
    this.spawnInterval = 2;

    // Room clear / transition timing
    this.roomClear = false;
    this.roomClearDelay = 2;
    this.roomClearTimer = 0;
  }

  /**
   * Main per-frame update.
   *
   * @param {number} dt - Delta time in seconds.
   * Important: dt should already be clamped by the engine to avoid giant jumps.
   *
   * @param {HTMLCanvasElement} canvas - Used for bounds and spawn positioning
   */
  update(dt, canvas) {
    const p = this.player;

    // -----------------------------
    // Player timers
    // -----------------------------
    if (p.invulnTime > 0) {
      p.invulnTime -= dt;
      if (p.invulnTime < 0) {
        p.invulnTime = 0;
      }
    }

    // -----------------------------
    // Player movement input
    // -----------------------------
    const dir = new Vec2(0, 0);

    if (input.isDown("KeyW")) dir.y -= 1;
    if (input.isDown("KeyS")) dir.y += 1;
    if (input.isDown("KeyA")) dir.x -= 1;
    if (input.isDown("KeyD")) dir.x += 1;

    // Normalize so diagonals are not faster than straight movement.
    dir.normalize();

    // -----------------------------
    // Player physics
    // -----------------------------
    // Acceleration feeds into velocity
    p.vel.add(dir.scale(p.accel * dt));

    // Damping / drag reduces velocity over time.
    // Important:
    // This formula assumes drag values tuned for a dt-scaled damping model.
    const damp = Math.max(0, 1 - p.drag * dt);
    p.vel.scale(damp);

    // Enforce max movement speed
    p.vel.clampLen(p.maxSpeed);

    // Position integrates from velocity
    p.pos.add(p.vel.clone().scale(dt));

    // Arena bounds + velocity cancellation on collision axis
    const half = p.size / 2;
    const oldX = p.pos.x;
    const oldY = p.pos.y;

    p.pos.x = Math.max(half, Math.min(canvas.width - half, p.pos.x));
    p.pos.y = Math.max(half, Math.min(canvas.height - half, p.pos.y));

    if (p.pos.x !== oldX) p.vel.x = 0;
    if (p.pos.y !== oldY) p.vel.y = 0;

    // -----------------------------
    // Aim
    // -----------------------------
    // atan2 handles all quadrants correctly.
    const dx = input.mouse.x - p.pos.x;
    const dy = input.mouse.y - p.pos.y;
    p.aimAngle = Math.atan2(dy, dx);

    // -----------------------------
    // Room spawning
    // -----------------------------
    // Only spawn while the room is active.
    if (!this.roomClear) {
      this.spawnTimer -= dt;

      if (
        this.spawnTimer <= 0 &&
        this.enemiesSpawned < this.enemiesToSpawn
      ) {
        this.spawnTimer = this.spawnInterval;

        // Spawn at a random edge of the arena.
        const side = Math.floor(Math.random() * 4);
        const margin = 20;

        let x, y;

        if (side === 0) {
          x = margin;
          y = Math.random() * canvas.height;
        } else if (side === 1) {
          x = canvas.width - margin;
          y = Math.random() * canvas.height;
        } else if (side === 2) {
          x = Math.random() * canvas.width;
          y = margin;
        } else {
          x = Math.random() * canvas.width;
          y = canvas.height - margin;
        }

        this.enemies.spawn("seeker", x, y);
        this.enemiesSpawned++;
      }
    }

    // -----------------------------
    // Systems update
    // -----------------------------
    this.enemies.update(dt, p, canvas);

    this.bullets.tickCooldown(p, dt);
    this.bullets.tryShoot(p, input.mouse.down);
    this.bullets.update(dt, canvas);

    // -----------------------------
    // Bullet -> Enemy collisions
    // -----------------------------
    const bullets = this.bullets.bullets;
    const enemies = this.enemies.enemies;

    for (let bi = bullets.length - 1; bi >= 0; bi--) {
      const b = bullets[bi];
      let hit = false;

      for (let ei = enemies.length - 1; ei >= 0; ei--) {
        const e = enemies[ei];

        if (
          circlesOverlap(
            b.pos.x,
            b.pos.y,
            b.radius,
            e.pos.x,
            e.pos.y,
            e.radius
          )
        ) {
          this.enemies.takeDamage(e, 1);
          this.bullets.consumeBulletAt(bi);

          hit = true;
          break;
        }
      }

      if (hit) continue;
    }

    // -----------------------------
    // Enemy -> Player collisions
    // -----------------------------
    for (const e of this.enemies.enemies) {
      if (
        circlesOverlap(
          p.pos.x,
          p.pos.y,
          p.size / 2,
          e.pos.x,
          e.pos.y,
          e.radius
        )
      ) {
        // Only take damage if not in invulnerability window.
        if (p.invulnTime <= 0) {
          p.hp -= 1;
          p.invulnTime = p.invulnDuration;

          // Knock player away from the enemy.
          // Important:
          // normalize() gives only direction; knockStrength gives magnitude.
          const knockDir = p.pos.clone().sub(e.pos).normalize();
          const knockStrength = 280;
          p.vel.add(knockDir.scale(knockStrength));
        }

        break;
      }
    }

    // -----------------------------
    // Player death / run reset
    // -----------------------------
    if (p.hp <= 0) {
      // Reset player state
      p.hp = p.maxHp;
      p.pos.set(canvas.width / 2, canvas.height / 2);
      p.vel.set(0, 0);
      p.invulnTime = 0;
      p.cooldown = 0;

      // Reset room state
      this.roomNumber = 1;
      this.enemiesToSpawn = this.roomNumber * 4;
      this.enemiesSpawned = 0;
      this.spawnTimer = 0;
      this.roomClear = false;
      this.roomClearTimer = 0;

      // Clear active combat entities
      this.enemies.enemies = [];
      this.bullets.bullets = [];
    }

    // -----------------------------
    // Room clear detection
    // -----------------------------
    // A room is only clear when:
    // 1) all enemies for the room have been spawned
    // 2) no enemies remain alive
    if (
      !this.roomClear &&
      this.enemiesSpawned >= this.enemiesToSpawn &&
      this.enemies.enemies.length === 0
    ) {
      this.roomClear = true;
      this.roomClearTimer = this.roomClearDelay;
    }

    // -----------------------------
    // Room transition
    // -----------------------------
    if (this.roomClear) {
      this.roomClearTimer -= dt;

      if (this.roomClearTimer <= 0) {
        this.roomNumber++;

        // Basic difficulty scaling:
        // more enemies each room
        this.enemiesToSpawn = this.roomNumber * 4;
        this.enemiesSpawned = 0;

        this.roomClear = false;
        this.roomClearTimer = 0;
        this.spawnTimer = 0;
      }
    }
  }

  /**
   * Main per-frame render.
   *
   * @param {CanvasRenderingContext2D} ctx
   * @param {HTMLCanvasElement} canvas
   */
  render(ctx, canvas) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // -----------------------------
    // Background
    // -----------------------------
    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // -----------------------------
    // Enemies + bullets
    // -----------------------------
    this.enemies.render(ctx);
    this.bullets.render(ctx);

    // -----------------------------
    // Player
    // -----------------------------
    const p = this.player;

    // Flash while invulnerable for feedback
    const flashing =
      p.invulnTime > 0 && Math.floor(p.invulnTime * 12) % 2 === 0;

    ctx.fillStyle = flashing ? "#ffaaaa" : "#ff4444";
    ctx.beginPath();
    ctx.arc(p.pos.x, p.pos.y, p.size / 2, 0, Math.PI * 2);
    ctx.fill();

    // -----------------------------
    // Aim line
    // -----------------------------
    const aimLen = p.size * 1.2;
    const ax = p.pos.x + Math.cos(p.aimAngle) * aimLen;
    const ay = p.pos.y + Math.sin(p.aimAngle) * aimLen;

    ctx.strokeStyle = "#ffe066";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(p.pos.x, p.pos.y);
    ctx.lineTo(ax, ay);
    ctx.stroke();

    // -----------------------------
    // Debug mouse dot
    // -----------------------------
    ctx.fillStyle = "white";
    ctx.fillRect(input.mouse.x - 2, input.mouse.y - 2, 4, 4);

    // -----------------------------
    // HUD / debug info
    // -----------------------------
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText(`Room: ${this.roomNumber}`, 20, 30);
    ctx.fillText(`To Spawn: ${this.enemiesToSpawn - this.enemiesSpawned}`, 20, 55);
    ctx.fillText(`Alive: ${this.enemies.enemies.length}`, 20, 80);
    ctx.fillText(`HP: ${p.hp}/${p.maxHp}`, 20, 105);

    if (this.roomClear) {
      ctx.fillStyle = "lime";
      ctx.font = "28px Arial";
      ctx.fillText("ROOM CLEAR", canvas.width / 2 - 95, 40);
    }
  }
}