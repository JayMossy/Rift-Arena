// src/js/main.js
import { startEngine } from "./core/engine.js";
import { RunScene } from "./scenes/RunScene.js";

const scene = new RunScene();
startEngine({ canvasId: "game", scene });