window.Flatlands = {
  version: 0.53,
  environment: () => ({
    touch_device: ("ontouchstart" in window)
  })
};
if (Flatlands.environment().touch_device) document.documentElement.classList.add("touch-device");