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
    this.spawnTimer = 0;
  }

  update(dt, canvas) {
    
    const p = this.player;
    
    // 1) Build input direction vector
    const dir = new Vec2(0, 0);
    if (input.isDown("KeyW")) dir.y -= 1;
    if (input.isDown("KeyS")) dir.y += 1;
    if (input.isDown("KeyA")) dir.x -= 1;
    if (input.isDown("KeyD")) dir.x += 1;

    // 2) Normalize so diagonals aren't faster
    dir.normalize();

    // 3) Acceleration -> velocity
    // vel += dir * accel * dt
    p.vel.add(dir.scale(p.accel * dt));

    // 4) Drag (damping) on velocity
    const damp = Math.max(0, 1 - p.drag * dt);
    p.vel.scale(damp);

    // 5) Clamp velocity to max speed
    p.vel.clampLen(p.maxSpeed);

    // 6) Integrate position using velocity
    p.pos.add(p.vel.clone().scale(dt));

    // 7) Clamp to canvas bounds + zero velocity on axis collision
    const half = p.size / 2;

    const oldX = p.pos.x;
    const oldY = p.pos.y;

    p.pos.x = Math.max(half, Math.min(canvas.width - half, p.pos.x));
    p.pos.y = Math.max(half, Math.min(canvas.height - half, p.pos.y));

    if (p.pos.x !== oldX) p.vel.x = 0;
    if (p.pos.y !== oldY) p.vel.y = 0;

    // Aim: point toward mouse
    const dx = input.mouse.x - p.pos.x;
    const dy = input.mouse.y - p.pos.y;
    p.aimAngle = Math.atan2(dy, dx);

    // Spawn a seeker every 2 seconds (temporary test)
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawnTimer = 2;

      // spawn at a random edge so it feels like an arena wave
      const side = Math.floor(Math.random() * 4);
      const margin = 20;

      let x, y;
      if (side === 0) { x = margin; y = Math.random() * canvas.height; }                 // left
      else if (side === 1) { x = canvas.width - margin; y = Math.random() * canvas.height; } // right
      else if (side === 2) { x = Math.random() * canvas.width; y = margin; }            // top
      else { x = Math.random() * canvas.width; y = canvas.height - margin; }            // bottom

      this.enemies.spawn("seeker", x, y);
    }

    // Update enemies (seeking player)
    this.enemies.update(dt, this.player, canvas);


    // Bullets: cooldown + firing + simulation
    this.bullets.tickCooldown(p, dt);
    this.bullets.tryShoot(p, input.mouse.down);
    this.bullets.update(dt, canvas);


    // Bullet -> Enemy collisions
    const bullets = this.bullets.bullets;
    const enemies = this.enemies.enemies;

    for (let bi = bullets.length - 1; bi >= 0; bi--) {
      const b = bullets[bi];
      let hit = false;

      for (let ei = enemies.length - 1; ei >= 0; ei--) {
        const e = enemies[ei];

        if (circlesOverlap(b.pos.x, b.pos.y, b.radius, e.pos.x, e.pos.y, e.radius)) {
          // damage enemy
          this.enemies.takeDamage(e, 1);

          // consume bullet (no piercing yet)
          this.bullets.consumeBulletAt(bi);

          hit = true;
          break;
        }
      }

      if (hit) continue;
    }

    // Enemy -> Player collision (temporary: reset player to center)
    for (const e of this.enemies.enemies) {
      if (circlesOverlap(p.pos.x, p.pos.y, p.size / 2, e.pos.x, e.pos.y, e.radius)) {
        // Temporary response: reset player position & stop motion
        p.pos.x = canvas.width / 2;
        p.pos.y = canvas.height / 2;
        p.vel.x = 0;
        p.vel.y = 0;
        break;
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
    ctx.fillRect(p.pos.x - p.size / 2, p.pos.y - p.size / 2, p.size, p.size);

    // Aim line (direction indicator)
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
  }
}