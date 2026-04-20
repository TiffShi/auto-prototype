import { createMap, countPellets } from './map.js';
import { createPlayer, updatePlayer, resetPlayer, getPlayerTile } from './player.js';
import { createGhost, updateGhost, resetGhost, frightenGhosts } from './ghost.js';
import { checkPelletPickup, checkGhostCollision } from './collision.js';
import { render } from './renderer.js';
import { createInputHandler } from './input.js';
import { POINTS, TILE_SIZE } from './constants.js';

/**
 * Creates and manages the entire game engine.
 * @param {HTMLCanvasElement} canvas
 * @param {Object} options
 * @param {number} options.startLevel
 * @param {Function} options.onScoreUpdate
 * @param {Function} options.onLivesUpdate
 * @param {Function} options.onLevelUpdate
 * @param {Function} options.onGameOver
 * @param {Function} options.onVictory
 */
export function createEngine(canvas, options) {
  const ctx = canvas.getContext('2d');
  const {
    startLevel = 1,
    onScoreUpdate,
    onLivesUpdate,
    onLevelUpdate,
    onGameOver,
    onVictory,
  } = options;

  // ── State ──────────────────────────────────────────────────────────────────
  let score = 0;
  let lives = 3;
  let level = startLevel;
  let running = false;
  let paused = false;
  let rafId = null;
  let lastTime = null;

  // Ghost combo (for eating multiple ghosts per power pellet)
  let ghostCombo = 0;

  // Flash messages (score popups)
  let flashMessage = null;
  let flashTimer = 0;

  // Respawn delay
  let respawnTimer = 0;
  const RESPAWN_DELAY = 1500;
  let respawning = false;

  // ── Map & Entities ─────────────────────────────────────────────────────────
  let mapState = createMap();
  let tiles = mapState.tiles;
  let totalPellets = mapState.totalPellets;
  let pelletsEaten = 0;

  const player = createPlayer();
  const ghosts = [
    createGhost('blinky'),
    createGhost('pinky'),
    createGhost('inky'),
    createGhost('clyde'),
  ];

  const input = createInputHandler();

  // ── Speed multiplier based on level ───────────────────────────────────────
  function getSpeedMultiplier() {
    return 1 + (level - 1) * 0.1;
  }

  // ── Reset for new life ────────────────────────────────────────────────────
  function resetEntities() {
    resetPlayer(player);
    ghosts.forEach(resetGhost);
    ghostCombo = 0;
  }

  // ── Reset for new level ───────────────────────────────────────────────────
  function resetLevel() {
    mapState = createMap();
    tiles = mapState.tiles;
    totalPellets = mapState.totalPellets;
    pelletsEaten = 0;
    resetEntities();
  }

  // ── Flash message helper ──────────────────────────────────────────────────
  function showFlash(text, x, y) {
    flashMessage = { text, x, y, alpha: 1 };
    flashTimer = 800;
  }

  // ── Main update ───────────────────────────────────────────────────────────
  function update(dt) {
    if (respawning) {
      respawnTimer -= dt * 1000;
      if (respawnTimer <= 0) {
        respawning = false;
        resetEntities();
      }
      // Still render during respawn
      renderFrame();
      return;
    }

    const speedMult = getSpeedMultiplier();

    // Input
    const inputDir = input.consumeBuffer();

    // Update player
    updatePlayer(player, inputDir, tiles, dt, speedMult);

    // Update ghosts
    for (const ghost of ghosts) {
      updateGhost(ghost, player, ghosts, tiles, dt, speedMult);
    }

    // Pellet pickup
    if (player.alive) {
      const pickup = checkPelletPickup(player, tiles);
      if (pickup) {
        score += pickup.points;
        pelletsEaten++;
        onScoreUpdate?.(score);

        if (pickup.powerPellet) {
          frightenGhosts(ghosts);
          ghostCombo = 0;
          showFlash(`+${pickup.points}`, player.x, player.y - 20);
        }

        // Check win condition
        if (pelletsEaten >= totalPellets) {
          running = false;
          onVictory?.(score, level);
          return;
        }
      }
    }

    // Ghost collision
    if (player.alive) {
      const collisions = checkGhostCollision(player, ghosts);
      for (const { ghost, eaten } of collisions) {
        if (eaten) {
          ghost.state = 'eaten';
          ghostCombo++;
          const pts = POINTS.GHOST_BASE * Math.pow(2, ghostCombo - 1);
          score += pts;
          onScoreUpdate?.(score);
          showFlash(`+${pts}`, ghost.x, ghost.y - 20);
        } else {
          // Player dies
          player.alive = false;
          lives--;
          onLivesUpdate?.(lives);

          if (lives <= 0) {
            running = false;
            renderFrame();
            setTimeout(() => onGameOver?.(score, level), 1200);
            return;
          } else {
            respawning = true;
            respawnTimer = RESPAWN_DELAY;
          }
        }
      }
    }

    // Flash message timer
    if (flashMessage) {
      flashTimer -= dt * 1000;
      flashMessage.alpha = Math.max(0, flashTimer / 800);
      flashMessage.y -= 20 * dt;
      if (flashTimer <= 0) flashMessage = null;
    }

    renderFrame();
  }

  // ── Render ────────────────────────────────────────────────────────────────
  function renderFrame() {
    render(ctx, {
      tiles,
      player,
      ghosts,
      score,
      lives,
      level,
      ghostCombo,
      flashMessage,
    });
  }

  // ── Game loop ─────────────────────────────────────────────────────────────
  function loop(timestamp) {
    if (!running) return;
    if (paused) {
      rafId = requestAnimationFrame(loop);
      return;
    }

    if (lastTime === null) lastTime = timestamp;
    const dt = Math.min((timestamp - lastTime) / 1000, 0.05); // cap at 50ms
    lastTime = timestamp;

    update(dt);

    rafId = requestAnimationFrame(loop);
  }

  // ── Public API ────────────────────────────────────────────────────────────
  function start() {
    if (running) return;
    resetLevel();
    level = startLevel;
    onLevelUpdate?.(level);
    onScoreUpdate?.(score);
    onLivesUpdate?.(lives);
    input.attach();
    running = true;
    lastTime = null;
    rafId = requestAnimationFrame(loop);
  }

  function pause() {
    paused = true;
  }

  function resume() {
    paused = false;
    lastTime = null;
  }

  function stop() {
    running = false;
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    input.detach();
  }

  function isPaused() {
    return paused;
  }

  return { start, pause, resume, stop, isPaused };
}