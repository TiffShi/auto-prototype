import {
  TILE_SIZE, TILE, COLORS, COLS, ROWS,
  CANVAS_WIDTH, CANVAS_HEIGHT,
} from './constants.js';
import { getTile } from './map.js';

/**
 * Draws the entire game frame.
 */
export function render(ctx, state) {
  const { tiles, player, ghosts, score, lives, level, ghostCombo, flashMessage } = state;

  // Clear
  ctx.fillStyle = COLORS.BACKGROUND;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  drawMaze(ctx, tiles);
  drawPellets(ctx, tiles);
  drawGhosts(ctx, ghosts);
  drawPlayer(ctx, player);

  if (flashMessage) {
    drawFlashMessage(ctx, flashMessage);
  }
}

// ─── Maze ────────────────────────────────────────────────────────────────────

function drawMaze(ctx, tiles) {
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const t = tiles[row][col];
      if (t === TILE.WALL) {
        drawWallTile(ctx, col, row, tiles);
      }
    }
  }
}

function drawWallTile(ctx, col, row, tiles) {
  const x = col * TILE_SIZE;
  const y = row * TILE_SIZE;
  const s = TILE_SIZE;

  ctx.fillStyle = COLORS.WALL;
  ctx.fillRect(x, y, s, s);

  // Draw rounded wall borders for a classic look
  ctx.strokeStyle = COLORS.WALL_BORDER;
  ctx.lineWidth = 1.5;

  // Check neighbors
  const top    = getTile(tiles, col, row - 1) === TILE.WALL;
  const bottom = getTile(tiles, col, row + 1) === TILE.WALL;
  const left   = getTile(tiles, col - 1, row) === TILE.WALL;
  const right  = getTile(tiles, col + 1, row) === TILE.WALL;

  const inset = 2;
  ctx.beginPath();

  if (!top)    { ctx.moveTo(x + inset, y + inset); ctx.lineTo(x + s - inset, y + inset); }
  if (!bottom) { ctx.moveTo(x + inset, y + s - inset); ctx.lineTo(x + s - inset, y + s - inset); }
  if (!left)   { ctx.moveTo(x + inset, y + inset); ctx.lineTo(x + inset, y + s - inset); }
  if (!right)  { ctx.moveTo(x + s - inset, y + inset); ctx.lineTo(x + s - inset, y + s - inset); }

  ctx.stroke();
}

// ─── Pellets ─────────────────────────────────────────────────────────────────

function drawPellets(ctx, tiles) {
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const t = tiles[row][col];
      const cx = col * TILE_SIZE + TILE_SIZE / 2;
      const cy = row * TILE_SIZE + TILE_SIZE / 2;

      if (t === TILE.PELLET) {
        ctx.fillStyle = COLORS.PELLET;
        ctx.beginPath();
        ctx.arc(cx, cy, 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (t === TILE.POWER_PELLET) {
        // Pulsing power pellet
        const pulse = 0.5 + 0.5 * Math.sin(Date.now() / 200);
        const r = 4 + pulse * 2;
        ctx.fillStyle = COLORS.POWER_PELLET;
        ctx.shadowColor = COLORS.POWER_PELLET;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }
  }
}

// ─── Ghosts ──────────────────────────────────────────────────────────────────

function drawGhosts(ctx, ghosts) {
  for (const ghost of ghosts) {
    drawGhost(ctx, ghost);
  }
}

function drawGhost(ctx, ghost) {
  const x = ghost.x;
  const y = ghost.y;
  const r = TILE_SIZE / 2 - 1;

  if (ghost.state === 'house' || ghost.state === 'exiting') {
    // Draw normally but slightly transparent
    ctx.globalAlpha = 0.7;
  }

  if (ghost.state === 'eaten') {
    // Draw only eyes
    drawGhostEyes(ctx, x, y, ghost.dirName);
    ctx.globalAlpha = 1;
    return;
  }

  let bodyColor;
  if (ghost.state === 'frightened') {
    if (ghost.frightenedFlash) {
      bodyColor = ghost.animFrame === 0 ? COLORS.GHOST_FRIGHTENED : COLORS.GHOST_FRIGHTENED_FLASH;
    } else {
      bodyColor = COLORS.GHOST_FRIGHTENED;
    }
  } else {
    bodyColor = COLORS[`GHOST_${ghost.name.toUpperCase()}`] || '#FF0000';
  }

  // Body
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  // Top arc
  ctx.arc(x, y - r * 0.1, r, Math.PI, 0, false);
  // Right side down
  ctx.lineTo(x + r, y + r);
  // Wavy bottom
  const waves = 3;
  const waveW = (r * 2) / waves;
  for (let i = waves; i >= 0; i--) {
    const wx = x + r - i * waveW;
    const wy = y + r - (i % 2 === 0 ? r * 0.3 : 0);
    ctx.lineTo(wx, wy);
  }
  ctx.lineTo(x - r, y + r);
  ctx.closePath();
  ctx.fill();

  // Eyes (only when not frightened)
  if (ghost.state !== 'frightened') {
    drawGhostEyes(ctx, x, y, ghost.dirName);
  } else {
    // Frightened face
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(x - r * 0.3, y - r * 0.1, r * 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + r * 0.3, y - r * 0.1, r * 0.2, 0, Math.PI * 2);
    ctx.fill();
    // Wavy mouth
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x - r * 0.5, y + r * 0.3);
    for (let i = 0; i <= 4; i++) {
      const mx = x - r * 0.5 + i * (r * 0.25);
      const my = y + r * 0.3 + (i % 2 === 0 ? r * 0.15 : -r * 0.15);
      ctx.lineTo(mx, my);
    }
    ctx.stroke();
  }

  ctx.globalAlpha = 1;
}

function drawGhostEyes(ctx, x, y, dirName) {
  const r = TILE_SIZE / 2 - 1;
  const eyeR = r * 0.28;
  const pupilR = eyeR * 0.55;

  const lx = x - r * 0.35;
  const rx = x + r * 0.35;
  const ey = y - r * 0.15;

  // White of eyes
  ctx.fillStyle = COLORS.GHOST_EYES;
  ctx.beginPath(); ctx.arc(lx, ey, eyeR, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(rx, ey, eyeR, 0, Math.PI * 2); ctx.fill();

  // Pupils — offset by direction
  const dirOffset = {
    UP:    { dx: 0,    dy: -eyeR * 0.5 },
    DOWN:  { dx: 0,    dy:  eyeR * 0.5 },
    LEFT:  { dx: -eyeR * 0.5, dy: 0 },
    RIGHT: { dx:  eyeR * 0.5, dy: 0 },
  };
  const off = dirOffset[dirName] || { dx: 0, dy: 0 };

  ctx.fillStyle = COLORS.GHOST_PUPILS;
  ctx.beginPath(); ctx.arc(lx + off.dx, ey + off.dy, pupilR, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(rx + off.dx, ey + off.dy, pupilR, 0, Math.PI * 2); ctx.fill();
}

// ─── Player ──────────────────────────────────────────────────────────────────

export function drawPlayer(ctx, player) {
  if (!player.alive && player.deathTimer > player.DEATH_DURATION) return;

  const x = player.x;
  const y = player.y;
  const r = TILE_SIZE / 2 - 1;

  if (!player.alive) {
    // Death animation — shrinking
    const progress = Math.min(1, player.deathTimer / player.DEATH_DURATION);
    const deathR = r * (1 - progress);
    if (deathR <= 0) return;
    ctx.fillStyle = COLORS.PLAYER;
    ctx.beginPath();
    ctx.arc(x, y, deathR, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  // Determine rotation angle based on direction
  const rotations = {
    RIGHT: 0,
    DOWN:  Math.PI / 2,
    LEFT:  Math.PI,
    UP:    -Math.PI / 2,
  };
  const dirName = Object.entries({ UP: { x: 0, y: -1 }, DOWN: { x: 0, y: 1 }, LEFT: { x: -1, y: 0 }, RIGHT: { x: 1, y: 0 } })
    .find(([, d]) => d.x === player.dir.x && d.y === player.dir.y)?.[0] || 'RIGHT';
  const rotation = rotations[dirName] ?? 0;

  const mouthRad = player.mouthAngle * Math.PI;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);

  ctx.fillStyle = COLORS.PLAYER;
  ctx.shadowColor = COLORS.PLAYER;
  ctx.shadowBlur = 6;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.arc(0, 0, r, mouthRad, Math.PI * 2 - mouthRad);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.restore();
}

// ─── Flash Message ───────────────────────────────────────────────────────────

function drawFlashMessage(ctx, flashMessage) {
  const { text, x, y, alpha } = flashMessage;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = COLORS.SCORE_TEXT;
  ctx.font = 'bold 14px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(text, x, y);
  ctx.restore();
}