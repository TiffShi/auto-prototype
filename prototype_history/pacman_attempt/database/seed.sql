-- Pac-Man Leaderboard Seed Data
-- Idempotent: uses a temporary staging approach to avoid duplicate inserts.
-- Safe to re-run on a live database without creating duplicate rows.

-- Insert sample leaderboard entries only if the table is empty,
-- or use ON CONFLICT DO NOTHING on a unique business key.
-- Since (name, score, level) has no unique constraint, we guard by
-- checking for exact duplicates via a NOT EXISTS subquery.

INSERT INTO scores (name, score, level, created_at)
SELECT * FROM (VALUES
    ('BLINKY_SLAYER',  98750, 5, '2024-03-15 14:22:10'::TIMESTAMP),
    ('PacQueen',       87400, 4, '2024-03-14 09:11:45'::TIMESTAMP),
    ('GhostMuncher',   76200, 4, '2024-03-13 20:05:33'::TIMESTAMP),
    ('DotEater99',     65100, 3, '2024-03-12 17:44:21'::TIMESTAMP),
    ('PelletKing',     54800, 3, '2024-03-11 12:30:00'::TIMESTAMP),
    ('WakkaWakka',     43500, 2, '2024-03-10 08:15:55'::TIMESTAMP),
    ('InkyDodger',     32200, 2, '2024-03-09 22:07:18'::TIMESTAMP),
    ('PinkySlayer',    21000, 1, '2024-03-08 16:50:42'::TIMESTAMP),
    ('ClydeFear',      12750, 1, '2024-03-07 11:25:09'::TIMESTAMP),
    ('NewPlayer',       5000, 1, '2024-03-06 19:03:37'::TIMESTAMP)
) AS v(name, score, level, created_at)
WHERE NOT EXISTS (
    SELECT 1 FROM scores
    WHERE scores.name  = v.name
      AND scores.score = v.score
      AND scores.level = v.level
);