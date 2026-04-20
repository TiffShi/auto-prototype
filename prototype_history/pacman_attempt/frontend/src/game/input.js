import { DIR } from './constants.js';

/**
 * Manages keyboard input with a buffered next-direction system.
 */
export function createInputHandler() {
  let bufferedDir = null;
  let currentDir = DIR.NONE;

  const keyMap = {
    ArrowUp:    DIR.UP,
    ArrowDown:  DIR.DOWN,
    ArrowLeft:  DIR.LEFT,
    ArrowRight: DIR.RIGHT,
    w: DIR.UP,
    s: DIR.DOWN,
    a: DIR.LEFT,
    d: DIR.RIGHT,
    W: DIR.UP,
    S: DIR.DOWN,
    A: DIR.LEFT,
    D: DIR.RIGHT,
  };

  function onKeyDown(e) {
    if (keyMap[e.key]) {
      e.preventDefault();
      bufferedDir = keyMap[e.key];
    }
  }

  function attach() {
    window.addEventListener('keydown', onKeyDown);
  }

  function detach() {
    window.removeEventListener('keydown', onKeyDown);
  }

  function consumeBuffer() {
    if (bufferedDir) {
      const dir = bufferedDir;
      bufferedDir = null;
      return dir;
    }
    return null;
  }

  function setCurrentDir(dir) {
    currentDir = dir;
  }

  function getCurrentDir() {
    return currentDir;
  }

  return { attach, detach, consumeBuffer, setCurrentDir, getCurrentDir };
}