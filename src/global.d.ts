declare global {
  interface Array<T extends string> {
    includes(searchElement: string, fromIndex?: number): searchElement is T;
  }

  interface Document {
    webkitExitFullscreen: Document["exitFullscreen"];
    webkitFullscreenElement: Document["fullscreenElement"];
    webkitFullscreenEnabled: Document["fullscreenEnabled"];
  }

  interface Element {
    webkitRequestFullscreen: Element["requestFullscreen"];
  }
}

export {};