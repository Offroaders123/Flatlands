export default class Flatlands {
  static version = "v0.14.1";

  static environment = {
    get touchDevice(): boolean {
      return "ontouchstart" in window || navigator.maxTouchPoints > 0;
    }
  }

  static appearance = {
    get touch(): boolean {
      return document.documentElement.classList.contains("touch");
    },

    set touch(value: boolean) {
      if (typeof value !== "boolean") return;
      if (Flatlands.appearance.touch === value) return;

      if (value){
        document.documentElement.classList.add("touch");
      } else {
        document.documentElement.classList.remove("touch");
      }
    }
  }

  static serviceWorker = {
    get supported(): boolean {
      return "serviceWorker" in navigator;
    },

    async register(): Promise<boolean> {
      if (!Flatlands.serviceWorker.supported) return false;

      try {
        await navigator.serviceWorker.register("service-worker.js");
        return true;
      } catch (error){
        console.error(error);
        return false;
      }
    }
  }

  static debug = {
    frames: 0,
    droppedFrames: 0
  }
}