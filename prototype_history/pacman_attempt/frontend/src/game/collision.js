import { TILE_SIZE, TILE, POINTS } from './constants.js';
import { getTile, setTile } from './map.js';
import { frightenGhosts } from './ghost.js';

/**
 * Checks pellet pickup and returns points earned.
 * Modifies tiles in place.
 */
export function checkPelletPickup(player, tiles) {
  const col = Math.floor(player.x / TILE_SIZE);
  const row = Math.floor(player.y / TILE_SIZE);

  const tile = getTile(tiles, col, row);

  if (tile === TILE.PELLET) {
    setTile(tiles, col, row, TILE.EMPTY);
    return { points: POINTS.PELLET, powerPellet: false };
  }

  if (tile === TILE.POWER_PELLET) {
    setTile(tiles, col, row, TILE.EMPTY);
    return { points: POINTS.POWER_PELLET, powerPellet: true };
  }

  return null;
}

/**
 * Checks collision between player and each ghost.
 * Returns array of results: { ghost, eaten: bool }
 */
export function checkGhostCollision(player, ghosts) {
  const results = [];
  const hitRadius = TILE_SIZE * 0.75;

  for (const ghost of ghosts) {
    if (ghost.state === 'eaten' || ghost.state === 'house' || ghost.state === 'exiting') {
      continue;
    }

    const dx = player.x - ghost.x;
    const dy = player.y - ghost.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < hitRadius) {
      if (ghost.state === 'frightened') {
        results.push({ ghost, eaten: true });
      } else {
        results.push({ ghost, eaten: false });
      }
    }
  }

  return results;
}