// src/js/systems/BulletSystem.js
import { Vec2 } from "../utils/Vec2.js";

export class BulletSystem {
  constructor() {
    this.bullets = [];
  }

  // Call every frame to reduce cooldown timer
  tickCooldown(player, dt) {
    player.cooldown = Math.max(0, player.cooldown - dt);
  }

  // Attempt to shoot if mouse is down and cooldown allows it
  tryShoot(player, mouseDown) {
    if (!mouseDown) return;
    if (player.cooldown > 0) return;

    // Reset cooldown based on fireRate (shots per second)
    player.cooldown = 1 / player.fireRate;

    // Direction from aimAngle
    const dir = new Vec2(Math.cos(player.aimAngle), Math.sin(player.aimAngle));

    // Spawn slightly in front of player so bullets don't start inside them
    const muzzleOffset = player.size * 0.7;
    const spawnPos = player.pos.clone().add(dir.clone().scale(muzzleOffset));

    const bullet = {
      pos: spawnPos,
      vel: dir.scale(player.bulletSpeed), // velocity vector
      radius: 4,
      life: 1.5 // seconds, safety despawn
    };

    this.bullets.push(bullet);
  }

  update(dt, canvas) {
    // Update bullets and remove dead ones
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];

      // Integrate position
      b.pos.add(b.vel.clone().scale(dt));

      // Lifetime
      b.life -= dt;

      // Offscreen kill (plus a buffer)
      const r = b.radius;
      const offscreen =
        b.pos.x < -r || b.pos.x > canvas.width + r ||
        b.pos.y < -r || b.pos.y > canvas.height + r;

      if (b.life <= 0 || offscreen) {
        this.bullets.splice(i, 1);
      }
    }
  }

  render(ctx) {
    ctx.fillStyle = "cyan";
    for (const b of this.bullets) {
      // Simple circle
      ctx.beginPath();
      ctx.arc(b.pos.x, b.pos.y, b.radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}