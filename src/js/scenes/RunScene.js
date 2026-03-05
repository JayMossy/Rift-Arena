// src/js/scenes/RunScene.js
import { input } from "../core/input.js";
import { player } from "../entities/Player.js";

export class RunScene {

  update(dt, canvas) {
    const p = player;

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

    p.x += mx * p.speed * dt;
    p.y += my * p.speed * dt;

    // clamp to canvas bounds
    const half = p.size / 2;
    p.x = Math.max(half, Math.min(canvas.width - half, p.x));
    p.y = Math.max(half, Math.min(canvas.height - half, p.y));
  }

  render(ctx, canvas) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // background
    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // player
    const p = player;
    ctx.fillStyle = "lime";
    ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    

    // debug: mouse dot
    ctx.fillRect(input.mouse.x - 2, input.mouse.y - 2, 4, 4);
  }
}