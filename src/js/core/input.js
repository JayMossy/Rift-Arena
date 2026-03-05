// Keyboard / Mouse Input
export const input = {
  keys: Object.create(null),
  mouse: { x: 0, y: 0, down: false },

  isDown(code) {
    return !!this.keys[code];
  }
};

let initialized = false;

export function initInput(canvas) {
  if (initialized) return;
  initialized = true;

  // Keyboard
  window.addEventListener("keydown", (e) => {
    input.keys[e.code] = true;

    // prevent page scroll for common game keys
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(e.code)) {
      e.preventDefault();
    }
  }, { passive: false });

  window.addEventListener("keyup", (e) => {
    input.keys[e.code] = false;
  });

  // Mouse (relative to canvas)
  window.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    input.mouse.x = e.clientX - rect.left;
    input.mouse.y = e.clientY - rect.top;
  });

  window.addEventListener("mousedown", (e) => {
    if (e.button === 0) input.mouse.down = true; // left click only
  });

  window.addEventListener("mouseup", (e) => {
    if (e.button === 0) input.mouse.down = false;
  });

  // Safety: if mouse released outside window, don't get stuck "down"
  window.addEventListener("blur", () => {
    input.mouse.down = false;
    input.keys = Object.create(null);
  });
}