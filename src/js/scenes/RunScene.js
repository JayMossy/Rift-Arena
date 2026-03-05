// src/js/scenes/RunScene.js
import { input } from "../core/input.js";
import { createPlayer } from "../entities/Player.js";
import { Vec2 } from "../utils/Vec2.js";
import { BulletSystem } from "../systems/BulletSystem.js";

export class RunScene {
  constructor() {
    this.player = createPlayer(450, 300);
    this.bullets = new BulletSystem();
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

    // Bullets: cooldown + firing + simulation
    this.bullets.tickCooldown(p, dt);
    this.bullets.tryShoot(p, input.mouse.down);
    this.bullets.update(dt, canvas);
  }

  render(ctx, canvas) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background
    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

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