// src/js/systems/EnemySystem.js
import { Vec2 } from "../utils/Vec2.js";

export class EnemySystem {
  constructor() {
    this.enemies = [];

    // Templates (stats only). No position here.
    this.enemyDefs = {
      seeker: { radius: 13, speed: 140, hp: 3 }
    };
  }

  spawn(type, x, y) {
    const def = this.enemyDefs[type];
    if (!def) throw new Error(`Unknown enemy type: ${type}`);

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

  takeDamage(enemy, dmg) {
    if (!enemy.alive) return;
    enemy.hp -= dmg;
    if (enemy.hp <= 0) enemy.alive = false;
  }

  update(dt, player, canvas) {
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];

      // Remove dead enemies
      if (!e.alive) {
        this.enemies.splice(i, 1);
        continue;
      }

      // Seek behavior: move toward player
      const dir = player.pos.clone().sub(e.pos).normalize(); // direction to player
      e.vel = dir.scale(e.speed);                            // constant-speed steering
      e.pos.add(e.vel.clone().scale(dt));                    // integrate

      // Optional: keep enemies inside the arena (simple clamp)
      const r = e.radius;
      e.pos.x = Math.max(r, Math.min(canvas.width - r, e.pos.x));
      e.pos.y = Math.max(r, Math.min(canvas.height - r, e.pos.y));
    }
  }

  render(ctx) {
    for (const e of this.enemies) {
      ctx.fillStyle = e.hp >= 2 ? "orange" : "red";
      ctx.beginPath();
      ctx.arc(e.pos.x, e.pos.y, e.radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}