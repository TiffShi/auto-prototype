// Tile dimensions
export const TILE_SIZE = 16;
export const COLS = 28;
export const ROWS = 31;

export const CANVAS_WIDTH = TILE_SIZE * COLS;   // 448
export const CANVAS_HEIGHT = TILE_SIZE * ROWS;  // 496

// Tile types
export const TILE = {
  EMPTY: 0,
  WALL: 1,
  PELLET: 2,
  POWER_PELLET: 3,
  GHOST_HOUSE: 4,
  TUNNEL: 5,
};

// Colors
export const COLORS = {
  BACKGROUND: '#000000',
  WALL: '#1a1aff',
  WALL_BORDER: '#0000cc',
  PELLET: '#ffb8ae',
  POWER_PELLET: '#ffb8ae',
  PLAYER: '#FFD700',
  GHOST_BLINKY: '#FF0000',
  GHOST_PINKY: '#FFB8FF',
  GHOST_INKY: '#00FFFF',
  GHOST_CLYDE: '#FFB852',
  GHOST_FRIGHTENED: '#0000CC',
  GHOST_FRIGHTENED_FLASH: '#FFFFFF',
  GHOST_EYES: '#FFFFFF',
  GHOST_PUPILS: '#0000CC',
  TEXT: '#FFFFFF',
  SCORE_TEXT: '#FFD700',
  LIVES_COLOR: '#FFD700',
  HUD_BG: '#000000',
};

// Points
export const POINTS = {
  PELLET: 10,
  POWER_PELLET: 50,
  GHOST_BASE: 200,
};

// Speed (pixels per second)
export const BASE_SPEED = 90;
export const GHOST_BASE_SPEED = 75;
export const FRIGHTENED_SPEED = 50;

// Frightened duration in ms
export const FRIGHTENED_DURATION = 8000;
export const FRIGHTENED_FLASH_START = 2000; // flash when 2s remain

// Ghost modes timing (ms) — scatter/chase cycles
export const GHOST_MODE_TIMINGS = [
  { mode: 'scatter', duration: 7000 },
  { mode: 'chase', duration: 20000 },
  { mode: 'scatter', duration: 7000 },
  { mode: 'chase', duration: 20000 },
  { mode: 'scatter', duration: 5000 },
  { mode: 'chase', duration: 20000 },
  { mode: 'scatter', duration: 5000 },
  { mode: 'chase', duration: Infinity },
];

// Ghost scatter targets (tile coordinates)
export const SCATTER_TARGETS = {
  blinky: { x: 25, y: 0 },
  pinky:  { x: 2,  y: 0 },
  inky:   { x: 27, y: 30 },
  clyde:  { x: 0,  y: 30 },
};

// Ghost house exit tile
export const GHOST_HOUSE_EXIT = { x: 14, y: 11 };

// Player start position (tile)
export const PLAYER_START = { x: 14, y: 23 };

// Ghost start positions (tile)
export const GHOST_STARTS = {
  blinky: { x: 14, y: 11 },
  pinky:  { x: 14, y: 14 },
  inky:   { x: 12, y: 14 },
  clyde:  { x: 16, y: 14 },
};

// Directions
export const DIR = {
  UP:    { x: 0,  y: -1 },
  DOWN:  { x: 0,  y: 1  },
  LEFT:  { x: -1, y: 0  },
  RIGHT: { x: 1,  y: 0  },
  NONE:  { x: 0,  y: 0  },
};

export const DIR_NAMES = ['UP', 'DOWN', 'LEFT', 'RIGHT'];