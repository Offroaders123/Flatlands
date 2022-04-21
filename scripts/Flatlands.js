// This object helps with app configuration, and to get information about the current state of the app.
const Flatlands = new class Flatlands {
  version = 0.70;
  environment = {
    get touchDevice() {
      return ("ontouchstart" in window || navigator.maxTouchPoints > 0);
    }
  }
  appearance = {
    get touch() {
      return document.documentElement.classList.contains("touch");
    },
    set touch(value) {
      if (typeof value !== "boolean") return;
      if (this.touch === value) return;
      const method = (value === true) ? "add" : "remove";
      document.documentElement.classList[method]("touch");
    }
  }
  serviceWorker = {
    get supported() {
      return ("serviceWorker" in navigator);
    },
    async register() {
      if (!this.supported) return false;
      try {
        return await navigator.serviceWorker.register("service-worker.js");
      } catch (error) {
        console.error(error);
        return false;
      }
    }
  }
  debug = {
    frames: 0,
    droppedFrames: 0
  }
}

// Set a custom string tag label for the Flatlands object
Object.defineProperty(Object.getPrototypeOf(Flatlands),Symbol.toStringTag,{ value: Flatlands.constructor.name });

// Expose the Flatlands object in the global window object, which helps with debugging
window.Flatlands = Flatlands;

export default Flatlands;