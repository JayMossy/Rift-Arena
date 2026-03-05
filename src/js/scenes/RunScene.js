// src/js/scenes/RunScene.js
import { input } from "../core/input.js";
import { createPlayer } from "../entities/Player.js";
import { Vec2 } from "../utils/Vec2.js";

export class RunScene {
  constructor() {
    this.player = createPlayer(450, 300);
  }

  update(dt, canvas) {

// build an input direction vector from WASD

// normalize it (so diagonal isn’t faster)

// apply acceleration: vel += dir * accel * dt

// apply drag: vel *= (1 - drag * dt) (or similar)

// clamp speed to maxSpeed

// integrate position: pos += vel * dt

// clamp to canvas bounds (and zero velocity when hitting walls)

    // use imported player and input objects to update player movement based on WASD keys
    // you can use the Vec2 class for vector math if you want, but it’s not required

    const p = this.player;
    
    // build an input direction vector from WASD
    let mx = 0;
    let my = 0;
    if (input.isDown("KeyW")) my -= 1;
    if (input.isDown("KeyS")) my += 1;
    if (input.isDown("KeyA")) mx -= 1;
    if (input.isDown("KeyD")) mx += 1;

    // normalize diagonal
    if (mx !== 0 && my !== 0) {
      const inv = 1 / Math.sqrt(2);
      mx *= inv;
      my *= inv;
    }
    // build an input direction vector from WASD
    // apply acceleration: vel += dir * accel * dt
    p.vel.x += mx * p.accel * dt;
    p.vel.y += my * p.accel * dt;
    
    // apply drag: vel *= (1 - drag * dt) (or similar)
    const damp = Math.max(0, 1 - p.drag * dt);
    p.vel.x *= damp;
    p.vel.y *= damp;

    // clamp speed to maxSpeed
    const speed = Math.sqrt(p.vel.x * p.vel.x + p.vel.y * p.vel.y);
    if (speed > p.maxSpeed) {
      const scale = p.maxSpeed / speed;
      p.vel.x *= scale;
      p.vel.y *= scale;
    }

    // integrate position: pos += vel * dt
    p.pos.x += p.vel.x * dt;
    p.pos.y += p.vel.y * dt;

    // clamp to canvas bounds
    const half = p.size / 2;
    p.pos.x = Math.max(half, Math.min(canvas.width - half, p.pos.x));
    p.pos.y = Math.max(half, Math.min(canvas.height - half, p.pos.y));
    if (p.pos.x === half || p.pos.x === canvas.width - half) p.vel.x = 0;
    if (p.pos.y === half || p.pos.y === canvas.height - half) p.vel.y = 0;
  }

  render(ctx, canvas) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // background
    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // player (as a square for now)
    // color is red
    const p = this.player;
    ctx.fillStyle = "red";
    ctx.fillRect(p.pos.x - p.size / 2, p.pos.y - p.size / 2, p.size, p.size);
    

    // debug: mouse dot
    ctx.fillRect(input.mouse.x - 2, input.mouse.y - 2, 4, 4);
  }
}