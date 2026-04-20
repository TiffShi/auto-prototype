import {
  TILE_SIZE, DIR, DIR_NAMES, GHOST_BASE_SPEED, FRIGHTENED_SPEED,
  FRIGHTENED_DURATION, FRIGHTENED_FLASH_START, SCATTER_TARGETS,
  GHOST_HOUSE_EXIT, GHOST_STARTS, GHOST_MODE_TIMINGS, COLS, ROWS, TILE
} from './constants.js';
import { getTile, isPassableForGhost } from './map.js';

const OPPOSITE = {
  UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT',
};

function dirFromName(name) {
  return DIR[name];
}

function tileCenter(col, row) {
  return {
    x: col * TILE_SIZE + TILE_SIZE / 2,
    y: row * TILE_SIZE + TILE_SIZE / 2,
  };
}

function dist2(ax, ay, bx, by) {
  return (ax - bx) ** 2 + (ay - by) ** 2;
}

function getTileCoord(px, py) {
  return {
    col: Math.floor(px / TILE_SIZE),
    row: Math.floor(py / TILE_SIZE),
  };
}

/**
 * Creates a ghost entity.
 * @param {string} name - 'blinky' | 'pinky' | 'inky' | 'clyde'
 */
export function createGhost(name) {
  const start = GHOST_STARTS[name];
  const center = tileCenter(start.x, start.y);
  return {
    name,
    x: center.x,
    y: center.y,
    dir: DIR.UP,
    dirName: 'UP',
    // AI state: 'house' | 'exiting' | 'scatter' | 'chase' | 'frightened' | 'eaten'
    state: name === 'blinky' ? 'scatter' : 'house',
    modeTimer: 0,
    modeIndex: 0,
    frightenedTimer: 0,
    frightenedFlash: false,
    // For house exit logic
    houseTimer: name === 'blinky' ? 0 : (name === 'pinky' ? 2000 : name === 'inky' ? 5000 : 8000),
    exitTarget: tileCenter(GHOST_HOUSE_EXIT.x, GHOST_HOUSE_EXIT.y),
    // Eaten (eyes only) return target
    eatenTarget: tileCenter(GHOST_HOUSE_EXIT.x, GHOST_HOUSE_EXIT.y),
    speed: GHOST_BASE_SPEED,
    // For rendering
    animFrame: 0,
    animTimer: 0,
    ghostsEatenCombo: 0,
  };
}

/**
 * Resets a ghost to its starting state.
 */
export function resetGhost(ghost) {
  const start = GHOST_STARTS[ghost.name];
  const center = tileCenter(start.x, start.y);
  ghost.x = center.x;
  ghost.y = center.y;
  ghost.dir = DIR.UP;
  ghost.dirName = 'UP';
  ghost.state = ghost.name === 'blinky' ? 'scatter' : 'house';
  ghost.modeTimer = 0;
  ghost.modeIndex = 0;
  ghost.frightenedTimer = 0;
  ghost.frightenedFlash = false;
  ghost.houseTimer = ghost.name === 'blinky' ? 0
    : ghost.name === 'pinky' ? 2000
    : ghost.name === 'inky' ? 5000 : 8000;
}

/**
 * Triggers frightened state on all ghosts.
 */
export function frightenGhosts(ghosts) {
  ghosts.forEach(g => {
    if (g.state !== 'eaten' && g.state !== 'house' && g.state !== 'exiting') {
      g.state = 'frightened';
      g.frightenedTimer = FRIGHTENED_DURATION;
      g.frightenedFlash = false;
      // Reverse direction
      const opp = OPPOSITE[g.dirName];
      if (opp) {
        g.dirName = opp;
        g.dir = DIR[opp];
      }
    }
  });
}

/**
 * Checks if a ghost is at (or very near) a tile center.
 */
function atTileCenter(ghost) {
  const col = Math.floor(ghost.x / TILE_SIZE);
  const row = Math.floor(ghost.y / TILE_SIZE);
  const cx = col * TILE_SIZE + TILE_SIZE / 2;
  const cy = row * TILE_SIZE + TILE_SIZE / 2;
  return Math.abs(ghost.x - cx) < 1.5 && Math.abs(ghost.y - cy) < 1.5;
}

/**
 * Snaps ghost to tile center.
 */
function snapGhost(ghost) {
  const col = Math.floor(ghost.x / TILE_SIZE);
  const row = Math.floor(ghost.y / TILE_SIZE);
  ghost.x = col * TILE_SIZE + TILE_SIZE / 2;
  ghost.y = row * TILE_SIZE + TILE_SIZE / 2;
}

/**
 * Chooses the best direction toward a target tile, avoiding reversals and walls.
 */
function chooseDirection(ghost, targetCol, targetRow, tiles, allowReverse = false) {
  const { col, row } = getTileCoord(ghost.x, ghost.y);
  const opposite = OPPOSITE[ghost.dirName];

  const candidates = DIR_NAMES.filter(name => {
    if (!allowReverse && name === opposite) return false;
    const d = DIR[name];
    const nc = col + d.x;
    const nr = row + d.y;
    if (nr < 0 || nr >= ROWS) return false;
    const t = getTile(tiles, nc, nr);
    // Ghosts cannot enter ghost house unless exiting/eaten
    if (t === TILE.GHOST_HOUSE && ghost.state !== 'eaten') return false;
    return isPassableForGhost(tiles, nc, nr);
  });

  if (candidates.length === 0) {
    // Allow reverse as fallback
    return ghost.dirName;
  }

  // Pick direction that minimizes distance to target
  let best = candidates[0];
  let bestDist = Infinity;
  for (const name of candidates) {
    const d = DIR[name];
    const nc = col + d.x;
    const nr = row + d.y;
    const cx = nc * TILE_SIZE + TILE_SIZE / 2;
    const cy = nr * TILE_SIZE + TILE_SIZE / 2;
    const dd = dist2(cx, cy, targetCol * TILE_SIZE + TILE_SIZE / 2, targetRow * TILE_SIZE + TILE_SIZE / 2);
    if (dd < bestDist) {
      bestDist = dd;
      best = name;
    }
  }
  return best;
}

/**
 * Chooses a random valid direction (for frightened state).
 */
function chooseRandomDirection(ghost, tiles) {
  const { col, row } = getTileCoord(ghost.x, ghost.y);
  const opposite = OPPOSITE[ghost.dirName];

  const candidates = DIR_NAMES.filter(name => {
    if (name === opposite) return false;
    const d = DIR[name];
    const nc = col + d.x;
    const nr = row + d.y;
    if (nr < 0 || nr >= ROWS) return false;
    const t = getTile(tiles, nc, nr);
    if (t === TILE.GHOST_HOUSE) return false;
    return isPassableForGhost(tiles, nc, nr);
  });

  if (candidates.length === 0) return ghost.dirName;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

/**
 * Computes the chase target tile for each ghost.
 */
function getChaseTarget(ghost, player, ghosts) {
  const pc = Math.floor(player.x / TILE_SIZE);
  const pr = Math.floor(player.y / TILE_SIZE);

  switch (ghost.name) {
    case 'blinky':
      // Directly targets player
      return { col: pc, row: pr };

    case 'pinky': {
      // Targets 4 tiles ahead of player
      const ahead = 4;
      return {
        col: pc + player.dir.x * ahead,
        row: pr + player.dir.y * ahead,
      };
    }

    case 'inky': {
      // Uses blinky's position + vector trick
      const blinky = ghosts.find(g => g.name === 'blinky');
      const ahead2Col = pc + player.dir.x * 2;
      const ahead2Row = pr + player.dir.y * 2;
      if (blinky) {
        const bc = Math.floor(blinky.x / TILE_SIZE);
        const br = Math.floor(blinky.y / TILE_SIZE);
        return {
          col: ahead2Col + (ahead2Col - bc),
          row: ahead2Row + (ahead2Row - br),
        };
      }
      return { col: ahead2Col, row: ahead2Row };
    }

    case 'clyde': {
      // Chases if far, scatters if close
      const dist = Math.sqrt(dist2(ghost.x, ghost.y, player.x, player.y));
      if (dist > 8 * TILE_SIZE) {
        return { col: pc, row: pr };
      }
      return SCATTER_TARGETS.clyde;
    }

    default:
      return { col: pc, row: pr };
  }
}

/**
 * Updates a single ghost's AI and movement.
 */
export function updateGhost(ghost, player, ghosts, tiles, dt, speedMultiplier = 1) {
  const dtMs = dt * 1000;

  // --- House logic ---
  if (ghost.state === 'house') {
    ghost.houseTimer -= dtMs;
    if (ghost.houseTimer <= 0) {
      ghost.state = 'exiting';
    }
    // Bounce up/down in house
    ghost.y += ghost.dir.y * GHOST_BASE_SPEED * 0.5 * dt;
    const start = GHOST_STARTS[ghost.name];
    const minY = (start.y - 0.5) * TILE_SIZE + TILE_SIZE / 2;
    const maxY = (start.y + 0.5) * TILE_SIZE + TILE_SIZE / 2;
    if (ghost.y <= minY) { ghost.dir = DIR.DOWN; ghost.dirName = 'DOWN'; }
    if (ghost.y >= maxY) { ghost.dir = DIR.UP; ghost.dirName = 'UP'; }
    return;
  }

  // --- Exiting house ---
  if (ghost.state === 'exiting') {
    const exitX = GHOST_HOUSE_EXIT.x * TILE_SIZE + TILE_SIZE / 2;
    const exitY = GHOST_HOUSE_EXIT.y * TILE_SIZE + TILE_SIZE / 2;
    const dx = exitX - ghost.x;
    const dy = exitY - ghost.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 2) {
      ghost.x = exitX;
      ghost.y = exitY;
      ghost.state = 'scatter';
      ghost.modeTimer = 0;
      ghost.modeIndex = 0;
    } else {
      const speed = GHOST_BASE_SPEED * 0.7;
      ghost.x += (dx / dist) * speed * dt;
      ghost.y += (dy / dist) * speed * dt;
    }
    return;
  }

  // --- Frightened ---
  if (ghost.state === 'frightened') {
    ghost.frightenedTimer -= dtMs;
    ghost.frightenedFlash = ghost.frightenedTimer <= FRIGHTENED_FLASH_START;
    if (ghost.frightenedTimer <= 0) {
      ghost.state = 'scatter';
      ghost.frightenedTimer = 0;
    }
  }

  // --- Scatter/Chase mode cycling ---
  if (ghost.state === 'scatter' || ghost.state === 'chase') {
    ghost.modeTimer += dtMs;
    const currentMode = GHOST_MODE_TIMINGS[ghost.modeIndex];
    if (currentMode && ghost.modeTimer >= currentMode.duration) {
      ghost.modeTimer = 0;
      ghost.modeIndex = Math.min(ghost.modeIndex + 1, GHOST_MODE_TIMINGS.length - 1);
      const newMode = GHOST_MODE_TIMINGS[ghost.modeIndex];
      ghost.state = newMode.mode;
      // Reverse direction on mode switch
      const opp = OPPOSITE[ghost.dirName];
      if (opp) {
        ghost.dirName = opp;
        ghost.dir = DIR[opp];
      }
    }
  }

  // --- Movement ---
  const speed = ghost.state === 'frightened'
    ? FRIGHTENED_SPEED * speedMultiplier
    : ghost.state === 'eaten'
    ? GHOST_BASE_SPEED * 2 * speedMultiplier
    : GHOST_BASE_SPEED * speedMultiplier;

  // Move ghost
  ghost.x += ghost.dir.x * speed * dt;
  ghost.y += ghost.dir.y * speed * dt;

  // Tunnel wrap
  const maxX = COLS * TILE_SIZE;
  if (ghost.x < 0) ghost.x = maxX - 1;
  if (ghost.x >= maxX) ghost.x = 1;

  // At tile center — choose new direction
  if (atTileCenter(ghost)) {
    snapGhost(ghost);
    const { col, row } = getTileCoord(ghost.x, ghost.y);

    let newDirName;
    if (ghost.state === 'frightened') {
      newDirName = chooseRandomDirection(ghost, tiles);
    } else if (ghost.state === 'eaten') {
      // Head back to ghost house
      newDirName = chooseDirection(ghost, GHOST_HOUSE_EXIT.x, GHOST_HOUSE_EXIT.y, tiles, false);
      // Check if reached house
      if (col === GHOST_HOUSE_EXIT.x && row === GHOST_HOUSE_EXIT.y) {
        ghost.state = 'scatter';
        ghost.modeTimer = 0;
      }
    } else if (ghost.state === 'scatter') {
      const target = SCATTER_TARGETS[ghost.name];
      newDirName = chooseDirection(ghost, target.x, target.y, tiles, false);
    } else {
      // chase
      const target = getChaseTarget(ghost, player, ghosts);
      newDirName = chooseDirection(ghost, target.col, target.row, tiles, false);
    }

    ghost.dirName = newDirName;
    ghost.dir = DIR[newDirName];
  }

  // Animation
  ghost.animTimer += dt;
  if (ghost.animTimer > 0.2) {
    ghost.animTimer = 0;
    ghost.animFrame = (ghost.animFrame + 1) % 2;
  }
}