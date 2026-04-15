"use strict";

require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 8080;

// ---------------------------------------------------------------------------
// In-memory store
// ---------------------------------------------------------------------------
let leaderboard = [];

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
    optionsSuccessStatus: 200,
  })
);

app.use(express.json());

// ---------------------------------------------------------------------------
// Helper — validate submission payload
// ---------------------------------------------------------------------------
function validateSubmission(body) {
  const { teamName, points } = body || {};

  if (
    !teamName ||
    typeof teamName !== "string" ||
    teamName.trim().length === 0
  ) {
    return { valid: false, message: "teamName and points are required" };
  }

  if (points === undefined || points === null) {
    return { valid: false, message: "teamName and points are required" };
  }

  const numericPoints = Number(points);

  if (!Number.isFinite(numericPoints)) {
    return {
      valid: false,
      message: "points must be a finite number",
    };
  }

  return {
    valid: true,
    teamName: teamName.trim(),
    points: numericPoints,
  };
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

/**
 * GET /api/leaderboard
 * Returns all teams sorted by score descending with 1-indexed rank.
 */
app.get("/api/leaderboard", (req, res) => {
  const sorted = [...leaderboard]
    .sort((a, b) => b.points - a.points)
    .map((entry, index) => ({
      teamName: entry.teamName,
      points: entry.points,
      rank: index + 1,
    }));

  return res.status(200).json({ leaderboard: sorted });
});

/**
 * POST /api/submit
 * Accepts { teamName: string, points: number }.
 * Upserts the team entry (case-insensitive match on teamName).
 */
app.post("/api/submit", (req, res) => {
  const validation = validateSubmission(req.body);

  if (!validation.valid) {
    return res.status(400).json({
      success: false,
      message: validation.message,
    });
  }

  const { teamName, points } = validation;

  // Case-insensitive duplicate check
  const existingIndex = leaderboard.findIndex(
    (entry) => entry.teamName.toLowerCase() === teamName.toLowerCase()
  );

  if (existingIndex !== -1) {
    // Update existing team — preserve original casing from first submission
    leaderboard[existingIndex].points = points;
  } else {
    // New team entry
    leaderboard.push({ teamName, points });
  }

  return res.status(200).json({
    success: true,
    message: `Score submitted for ${teamName}`,
  });
});

// ---------------------------------------------------------------------------
// 404 catch-all for unmatched routes
// ---------------------------------------------------------------------------
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ---------------------------------------------------------------------------
// Global error handler
// ---------------------------------------------------------------------------
app.use((err, req, res, next) => {
  console.error("[Error]", err);
  res.status(500).json({ success: false, message: "Internal server error" });
});

// ---------------------------------------------------------------------------
// Start server
// ---------------------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`CTF Leaderboard backend running on http://localhost:${PORT}`);
});

module.exports = app;