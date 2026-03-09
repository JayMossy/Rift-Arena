// src/js/core/engine.js
import { initInput } from "./input.js";

/**
 * Start the main game engine loop.
 *
 * Responsibilities:
 * - find the canvas
 * - create the rendering context
 * - initialize input
 * - run requestAnimationFrame loop
 * - compute delta time
 * - call active scene update() and render()
 *
 * Why keep the engine generic?
 * - scenes should not care how the browser loop works
 * - engine should not care what specific game is being played
 *
 * @param {object} options
 * @param {string} options.canvasId - HTML id of the canvas element
 * @param {object} options.scene - Scene object with update(dt, canvas) and render(ctx, canvas)
 * @returns {{canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D}}
 */
export function startEngine({ canvasId = "game", scene }) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) {
    throw new Error(`Canvas #${canvasId} not found`);
  }

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("2D context not available");
  }

  // Fixed prototype resolution for now.
  // This keeps gameplay predictable while learning.
  canvas.width = 900;
  canvas.height = 600;

  // Input needs the canvas so mouse coordinates can be converted correctly.
  initInput(canvas);

  let last = performance.now();

  /**
   * Main animation frame callback.
   *
   * @param {number} now - High-resolution timestamp from requestAnimationFrame
   */
  function frame(now) {
    // Convert milliseconds to seconds
    let dt = (now - last) / 1000;
    last = now;

    // Clamp dt so the game does not explode after tab switches / lag spikes.
    if (dt > 0.05) {
      dt = 0.05;
    }

    scene.update(dt, canvas);
    scene.render(ctx, canvas);

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);

  return { canvas, ctx };
}