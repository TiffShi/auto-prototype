'use strict';

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads', 'drawings');
const METADATA_FILE = path.join(__dirname, '..', 'uploads', 'metadata.json');

/**
 * Load metadata store from disk, or return empty array if not found.
 */
function loadMetadata() {
  try {
    if (!fs.existsSync(METADATA_FILE)) {
      return [];
    }
    const raw = fs.readFileSync(METADATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load metadata:', err.message);
    return [];
  }
}

/**
 * Persist metadata store to disk.
 */
function saveMetadata(metadata) {
  try {
    fs.writeFileSync(METADATA_FILE, JSON.stringify(metadata, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to save metadata:', err.message);
    throw new Error('Could not persist metadata');
  }
}

/**
 * POST /api/drawings
 * Body: { imageData: <base64 PNG string>, name?: string }
 */
async function saveDrawing(req, res, next) {
  try {
    const { imageData, name } = req.body;

    if (!imageData) {
      return res.status(400).json({ error: 'imageData is required' });
    }

    // Strip the data URL prefix if present
    const base64Data = imageData.replace(/^data:image\/png;base64,/, '');

    if (!base64Data || base64Data.trim() === '') {
      return res.status(400).json({ error: 'imageData is empty or invalid' });
    }

    const id = uuidv4();
    const filename = `${id}.png`;
    const filePath = path.join(UPLOADS_DIR, filename);

    // Write PNG file to disk
    fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));

    const metadata = loadMetadata();
    const entry = {
      id,
      filename,
      name: name || `Drawing ${metadata.length + 1}`,
      createdAt: new Date().toISOString(),
      url: `/uploads/drawings/${filename}`
    };

    metadata.push(entry);
    saveMetadata(metadata);

    return res.status(201).json({
      message: 'Drawing saved successfully',
      drawing: entry
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/drawings
 * Returns list of all saved drawing metadata entries.
 */
async function listDrawings(req, res, next) {
  try {
    const metadata = loadMetadata();
    // Return newest first
    const sorted = [...metadata].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    return res.status(200).json({ drawings: sorted });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/drawings/:id
 * Returns the PNG file for a specific drawing.
 */
async function getDrawing(req, res, next) {
  try {
    const { id } = req.params;
    const metadata = loadMetadata();
    const entry = metadata.find((d) => d.id === id);

    if (!entry) {
      return res.status(404).json({ error: 'Drawing not found' });
    }

    const filePath = path.join(UPLOADS_DIR, entry.filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Drawing file not found on disk' });
    }

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `inline; filename="${entry.filename}"`);
    return res.sendFile(filePath);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/drawings/:id
 * Removes a drawing file and its metadata entry.
 */
async function deleteDrawing(req, res, next) {
  try {
    const { id } = req.params;
    const metadata = loadMetadata();
    const index = metadata.findIndex((d) => d.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Drawing not found' });
    }

    const entry = metadata[index];
    const filePath = path.join(UPLOADS_DIR, entry.filename);

    // Remove file from disk if it exists
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Remove from metadata
    metadata.splice(index, 1);
    saveMetadata(metadata);

    return res.status(200).json({ message: 'Drawing deleted successfully', id });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  saveDrawing,
  listDrawings,
  getDrawing,
  deleteDrawing
};