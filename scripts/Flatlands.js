// This object helps to control the app and get information about the current state.
const Flatlands = new class Flatlands {
  // constructor() {
  //   Object.defineProperty(Object.getPrototypeOf(this),Symbol.toStringTag,{ value: this.constructor.name });
  // }
  version = 0.55;
  environment = {
    get touchDevice() {
      return ("ontouchstart" in window || navigator.maxTouchPoints > 0);
    }
  }
  serviceWorker = {
    get supported() {
      return ("serviceWorker" in navigator);
    },
    register() {
      if (!this.supported) return false;
      return navigator.serviceWorker.register("service-worker.js");
    }
  }
}

// Object.freeze(Flatlands);

window.Flatlands = Flatlands;

export default Flatlands;