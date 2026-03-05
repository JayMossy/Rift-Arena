// Creates the scene and starts the game
import { startEngine } from "./core/engine.js";
import { RunScene } from "./scenes/RunScene.js";

const scene = new RunScene();
startEngine({ canvasId: "game", scene });