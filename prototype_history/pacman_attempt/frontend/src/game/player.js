import { TILE_SIZE, DIR, PLAYER_START, BASE_SPEED, TILE, COLS } from './constants.js';
import { getTile, isPassable } from './map.js';

/**
 * Creates and manages the Pac-Man player entity.
 */
export function createPlayer() {
  return {
    // Pixel position (center of tile)
    x: PLAYER_START.x * TILE_SIZE + TILE_SIZE / 2,
    y: PLAYER_START.y * TILE_SIZE + TILE_SIZE / 2,
    // Current movement direction
    dir: DIR.NONE,
    // Queued next direction
    nextDir: DIR.NONE,
    // Animation
    mouthAngle: 0.25, // fraction of PI (0=closed, 0.25=open)
    mouthOpen: true,
    animTimer: 0,
    ANIM_SPEED: 8, // mouth cycles per second
    // State
    alive: true,
    deathTimer: 0,
    DEATH_DURATION: 1200,
    speed: BASE_SPEED,
  };
}

/**
 * Resets player to start position.
 */
export function resetPlayer(player) {
  player.x = PLAYER_START.x * TILE_SIZE + TILE_SIZE / 2;
  player.y = PLAYER_START.y * TILE_SIZE + TILE_SIZE / 2;
  player.dir = DIR.NONE;
  player.nextDir = DIR.NONE;
  player.alive = true;
  player.deathTimer = 0;
  player.mouthAngle = 0.25;
  player.mouthOpen = true;
  player.animTimer = 0;
}

/**
 * Returns the tile column/row the player's center is in.
 */
export function getPlayerTile(player) {
  return {
    col: Math.floor(player.x / TILE_SIZE),
    row: Math.floor(player.y / TILE_SIZE),
  };
}

/**
 * Checks if the player can move in a given direction from their current position.
 */
function canMove(player, dir, tiles) {
  if (dir === DIR.NONE) return false;

  const radius = TILE_SIZE / 2 - 1;
  // Project center forward by radius in the desired direction
  const nx = player.x + dir.x * (radius + 1);
  const ny = player.y + dir.y * (radius + 1);

  // Check the tile at the projected position
  const col = Math.floor(nx / TILE_SIZE);
  const row = Math.floor(ny / TILE_SIZE);

  return isPassable(tiles, col, row);
}

/**
 * Snaps the player to the center of their current tile axis perpendicular to movement.
 */
function snapToGrid(player, dir) {
  if (dir.x !== 0) {
    // Moving horizontally — snap Y
    const tileRow = Math.round(player.y / TILE_SIZE);
    player.y = tileRow * TILE_SIZE + TILE_SIZE / 2;
  } else if (dir.y !== 0) {
    // Moving vertically — snap X
    const tileCol = Math.round(player.x / TILE_SIZE);
    player.x = tileCol * TILE_SIZE + TILE_SIZE / 2;
  }
}

/**
 * Updates player position and animation each frame.
 * @param {Object} player
 * @param {Object} inputDir - buffered direction from input handler
 * @param {Array} tiles - current map tiles
 * @param {number} dt - delta time in seconds
 * @param {number} speedMultiplier
 */
export function updatePlayer(player, inputDir, tiles, dt, speedMultiplier = 1) {
  if (!player.alive) {
    player.deathTimer += dt * 1000;
    return;
  }

  const speed = player.speed * speedMultiplier;

  // Try to apply buffered direction
  if (inputDir && inputDir !== DIR.NONE) {
    player.nextDir = inputDir;
  }

  // Try to turn to nextDir if near tile center
  if (player.nextDir && player.nextDir !== DIR.NONE) {
    // Snap to grid before turning
    const testPlayer = { x: player.x, y: player.y };
    snapToGrid(testPlayer, player.nextDir);
    if (canMove(testPlayer, player.nextDir, tiles)) {
      player.dir = player.nextDir;
      player.nextDir = DIR.NONE;
      snapToGrid(player, player.dir);
    }
  }

  // Move in current direction
  if (player.dir && player.dir !== DIR.NONE && canMove(player, player.dir, tiles)) {
    player.x += player.dir.x * speed * dt;
    player.y += player.dir.y * speed * dt;
  } else if (player.dir && player.dir !== DIR.NONE) {
    // Hit a wall — snap to tile center
    snapToGrid(player, player.dir);
    player.dir = DIR.NONE;
  }

  // Tunnel wrap-around
  const maxX = COLS * TILE_SIZE;
  if (player.x < 0) player.x = maxX - 1;
  if (player.x >= maxX) player.x = 1;

  // Animate mouth
  player.animTimer += dt;
  const animPeriod = 1 / player.ANIM_SPEED;
  if (player.animTimer >= animPeriod) {
    player.animTimer -= animPeriod;
    player.mouthOpen = !player.mouthOpen;
  }
  // Smooth mouth angle
  const targetAngle = player.mouthOpen ? 0.25 : 0.02;
  player.mouthAngle += (targetAngle - player.mouthAngle) * Math.min(1, dt * 20);
}