// src/js/main.js
import { startEngine } from "./core/engine.js";
import { RunScene } from "./scenes/RunScene.js";

/**
 * Main entry point for the project.
 *
 * Why keep this file small?
 * - main.js should be the clean starting point for the game
 * - Avoid putting game logic here
 * - It should mostly wire together engine + starting scene
 */

// Create the first active scene
const scene = new RunScene();

// Start the engine with the given canvas id and scene
startEngine({
  canvasId: "game",
  scene
});