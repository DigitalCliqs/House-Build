import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

// Mobile compatibility patch for Three.js PointerLockControls.
// On touch/coarse-pointer devices, pointer lock is replaced with a virtual
// locked state. Existing WASD movement code therefore continues to work,
// while the mobile touch layer sends synthetic mousemove deltas for looking.
const coarse = matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0;

if (coarse && !PointerLockControls.prototype.__houseMobilePatched) {
  const desktopLock = PointerLockControls.prototype.lock;
  const desktopUnlock = PointerLockControls.prototype.unlock;

  PointerLockControls.prototype.lock = function () {
    window.__HOUSE_POINTER_CONTROLS__ = this;
    this.isLocked = true;
    this.dispatchEvent?.({ type: 'lock' });
  };

  PointerLockControls.prototype.unlock = function () {
    this.isLocked = false;
    this.dispatchEvent?.({ type: 'unlock' });
  };

  PointerLockControls.prototype.__houseDesktopLock = desktopLock;
  PointerLockControls.prototype.__houseDesktopUnlock = desktopUnlock;
  PointerLockControls.prototype.__houseMobilePatched = true;
}

window.__HOUSE_IS_MOBILE__ = coarse;
