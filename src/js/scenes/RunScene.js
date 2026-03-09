// src/js/scenes/RunScene.js
import { input } from "../core/input.js";
import { createPlayer } from "../entities/Player.js";
import { Vec2 } from "../utils/Vec2.js";
import { BulletSystem } from "../systems/BulletSystem.js";
import { EnemySystem } from "../systems/EnemySystem.js";
import { circlesOverlap } from "../utils/collision.js";

export class RunScene {
  constructor() {
    this.player = createPlayer(450, 300);
    this.bullets = new BulletSystem();
    this.enemies = new EnemySystem();

    // Room state
    this.roomNumber = 1;
    this.enemiesToSpawn = this.roomNumber * 4;
    this.enemiesSpawned = 0;
    this.spawnTimer = 0;
    this.spawnInterval = 2;

    this.roomClear = false;
    this.roomClearDelay = 2;
    this.roomClearTimer = 0;
  }

  update(dt, canvas) {
    const p = this.player;

    // -----------------------------
    // Player movement
    // -----------------------------
    const dir = new Vec2(0, 0);
    if (input.isDown("KeyW")) dir.y -= 1;
    if (input.isDown("KeyS")) dir.y += 1;
    if (input.isDown("KeyA")) dir.x -= 1;
    if (input.isDown("KeyD")) dir.x += 1;

    dir.normalize();

    // Acceleration -> velocity
    p.vel.add(dir.scale(p.accel * dt));

    // Drag / damping
    const damp = Math.max(0, 1 - p.drag * dt);
    p.vel.scale(damp);

    // Clamp max speed
    p.vel.clampLen(p.maxSpeed);

    // Integrate position
    p.pos.add(p.vel.clone().scale(dt));

    // Clamp player to arena bounds
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
    const dx = input.mouse.x - p.pos.x;
    const dy = input.mouse.y - p.pos.y;
    p.aimAngle = Math.atan2(dy, dx);

    // -----------------------------
    // Room spawning logic
    // -----------------------------
    if (!this.roomClear) {
      this.spawnTimer -= dt;

      if (
        this.spawnTimer <= 0 &&
        this.enemiesSpawned < this.enemiesToSpawn
      ) {
        this.spawnTimer = this.spawnInterval;

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
    // Update enemies
    // -----------------------------
    this.enemies.update(dt, p, canvas);

    // -----------------------------
    // Bullets
    // -----------------------------
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
            b.pos.x, b.pos.y, b.radius,
            e.pos.x, e.pos.y, e.radius
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
    // Temporary response: reset player
    // -----------------------------
    for (const e of this.enemies.enemies) {
      if (
        circlesOverlap(
          p.pos.x, p.pos.y, p.size / 2,
          e.pos.x, e.pos.y, e.radius
        )
      ) {
        p.pos.x = canvas.width / 2;
        p.pos.y = canvas.height / 2;
        p.vel.x = 0;
        p.vel.y = 0;
        break;
      }
    }

    // -----------------------------
    // Room clear detection
    // Room clears only when:
    // 1) all enemies have been spawned
    // 2) all enemies are dead
    // -----------------------------
    if (
      !this.roomClear &&
      this.enemiesSpawned >= this.enemiesToSpawn &&
      this.enemies.enemies.length === 0
    ) {
      this.roomClear = true;
      this.roomClearTimer = this.roomClearDelay;
    }

    // -----------------------------
    // Room transition countdown
    // -----------------------------
    if (this.roomClear) {
      this.roomClearTimer -= dt;

      if (this.roomClearTimer <= 0) {
        this.roomNumber++;
        this.enemiesToSpawn = this.roomNumber * 4;
        this.enemiesSpawned = 0;
        this.roomClear = false;
        this.spawnTimer = 0;
      }
    }
  }

  render(ctx, canvas) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background
    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Enemies
    this.enemies.render(ctx);

    // Bullets
    this.bullets.render(ctx);

    // Player
    const p = this.player;
    ctx.fillStyle = "red";
    ctx.fillRect(
      p.pos.x - p.size / 2,
      p.pos.y - p.size / 2,
      p.size,
      p.size
    );

    // Aim line
    const aimLen = p.size * 1.2;
    const ax = p.pos.x + Math.cos(p.aimAngle) * aimLen;
    const ay = p.pos.y + Math.sin(p.aimAngle) * aimLen;

    ctx.strokeStyle = "yellow";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(p.pos.x, p.pos.y);
    ctx.lineTo(ax, ay);
    ctx.stroke();

    // Debug: mouse dot
    ctx.fillStyle = "white";
    ctx.fillRect(input.mouse.x - 2, input.mouse.y - 2, 4, 4);

    // -----------------------------
    // UI / Room debug text
    // -----------------------------
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText(`Room: ${this.roomNumber}`, 20, 30);
    ctx.fillText(`To Spawn: ${this.enemiesToSpawn - this.enemiesSpawned}`, 20, 55);
    ctx.fillText(`Alive: ${this.enemies.enemies.length}`, 20, 80);

    if (this.roomClear) {
      ctx.fillStyle = "lime";
      ctx.font = "28px Arial";
      ctx.fillText("ROOM CLEAR", canvas.width / 2 - 95, 40);
    }
  }
}