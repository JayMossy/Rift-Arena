// src/js/core/input.js

/**
 * Centralized input state.
 *
 * Why keep input in one shared module?
 * - Prevents multiple files from attaching duplicate listeners
 * - Makes input readable from any scene/system
 * - Keeps browser event logic separated from gameplay logic
 *
 * Current responsibilities:
 * - keyboard state
 * - mouse position (relative to canvas)
 * - mouse button state
 */
export const input = {
  /**
   * Keyboard state map.
   * Example:
   * input.keys["KeyW"] === true when W is currently held down
   */
  keys: Object.create(null),

  /**
   * Mouse state tracked relative to the game canvas.
   */
  mouse: {
    x: 0,
    y: 0,
    down: false
  },

  /**
   * Check whether a keyboard key is currently pressed.
   *
   * Important:
   * We use event.code rather than event.key so controls stay
   * more consistent across keyboard layouts.
   *
   * @param {string} code - KeyboardEvent.code value, e.g. "KeyW", "Space"
   * @returns {boolean}
   */
  isDown(code) {
    return !!this.keys[code];
  }
};

// Prevent attaching listeners multiple times if initInput is called again.
let initialized = false;

/**
 * Initialize all input listeners.
 *
 * Why require the canvas?
 * - Mouse coordinates need to be converted from browser window space
 *   into canvas-local space
 *
 * Important:
 * This should be called once by the engine during startup.
 *
 * @param {HTMLCanvasElement} canvas - The main game canvas
 */
export function initInput(canvas) {
  if (initialized) return;
  initialized = true;

  // -----------------------------
  // Keyboard
  // -----------------------------
  window.addEventListener(
    "keydown",
    (e) => {
      input.keys[e.code] = true;

      // Prevent browser scrolling for common game keys
      if (
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(e.code)
      ) {
        e.preventDefault();
      }
    },
    { passive: false }
  );

  window.addEventListener("keyup", (e) => {
    input.keys[e.code] = false;
  });

  // -----------------------------
  // Mouse movement
  // -----------------------------
  window.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();

    // Convert screen-space mouse position into canvas-local coordinates
    input.mouse.x = e.clientX - rect.left;
    input.mouse.y = e.clientY - rect.top;
  });

  // -----------------------------
  // Mouse buttons
  // -----------------------------
  window.addEventListener("mousedown", (e) => {
    // Only track left mouse button for firing right now
    if (e.button === 0) {
      input.mouse.down = true;
    }
  });

  window.addEventListener("mouseup", (e) => {
    if (e.button === 0) {
      input.mouse.down = false;
    }
  });

  // -----------------------------
  // Safety reset
  // -----------------------------
  // If browser focus is lost while holding keys or mouse,
  // clear state so the game does not get "stuck moving/shooting".
  window.addEventListener("blur", () => {
    input.mouse.down = false;
    input.keys = Object.create(null);
  });
}