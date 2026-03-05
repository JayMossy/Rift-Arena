import { Vec2 } from "../utils/Vec2.js";

export function createPlayer(x, y) {
    return {
        pos: new Vec2(x, y),
        vel: new Vec2(0, 0),
        size: 20,
        accel: 1000,
        drag: 0.8,
        maxSpeed: 300,
        aimAngle: 0
    };
}

// Player.js should export a function like:

// createPlayer(x, y)

// Return a player object containing:

// position (pos) and velocity (vel) (Vec2)

// size

// movement stats: accel, drag, maxSpeed

// aiming: aimAngle (number)

