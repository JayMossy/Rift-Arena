// src/js/core/engine.js
import { initInput } from "./input.js";

export function startEngine({ canvasId = "game", scene }) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) throw new Error(`Canvas #${canvasId} not found`);

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D context not available");

  // Optional: set a fixed resolution for now
  // (you can change this later)
  canvas.width = 900;
  canvas.height = 600;

  initInput(canvas);

  let last = performance.now();

  function frame(now) {
    // dt in seconds
    let dt = (now - last) / 1000;
    last = now;

    // Clamp dt to avoid giant physics jumps when tab is unfocused
    if (dt > 0.05) dt = 0.05;

    scene.update(dt, canvas);
    scene.render(ctx, canvas);

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);

  return { canvas, ctx };
}