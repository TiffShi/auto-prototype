'use strict';

const express = require('express');
const router = express.Router();
const drawingsController = require('../controllers/drawingsController');

// POST /api/drawings — Save a new drawing
router.post('/', drawingsController.saveDrawing);

// GET /api/drawings — List all saved drawings metadata
router.get('/', drawingsController.listDrawings);

// GET /api/drawings/:id — Get a specific drawing by ID
router.get('/:id', drawingsController.getDrawing);

// DELETE /api/drawings/:id — Delete a specific drawing
router.delete('/:id', drawingsController.deleteDrawing);

module.exports = router;