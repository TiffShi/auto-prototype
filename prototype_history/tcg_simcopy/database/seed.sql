-- ============================================================
-- Trading Card Game — Seed Data
-- Idempotent: uses INSERT ... ON CONFLICT DO NOTHING
-- ============================================================

-- ============================================================
-- USERS  (passwords are bcrypt hashes of "password123")
-- ============================================================
INSERT INTO users (username, password_hash, created_at) VALUES
    ('dragonmaster',  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK8i', NOW()),
    ('shadowmage',    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK8i', NOW()),
    ('ironclad',      '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK8i', NOW()),
    ('frostweaver',   '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK8i', NOW()),
    ('stormcaller',   '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK8i', NOW())
ON CONFLICT (username) DO NOTHING;

-- ============================================================
-- CARDS
-- Note: image_key will be populated by the card_seeder service
--       at runtime; we seed with empty string here.
-- ============================================================
INSERT INTO cards (name, attack, defense, cost, type, effect_text, image_key, rarity) VALUES
    -- Creatures
    ('Fire Drake',        4, 2, 3, 'creature', 'A fierce dragon that breathes fire.',       '', 'rare'),
    ('Shield Guardian',   1, 6, 3, 'creature', 'A stalwart defender of the realm.',         '', 'uncommon'),
    ('Forest Wolf',       2, 2, 1, 'creature', 'Swift and cunning predator.',               '', 'common'),
    ('Stone Golem',       3, 5, 4, 'creature', 'An ancient construct of living rock.',      '', 'uncommon'),
    ('Shadow Rogue',      3, 1, 2, 'creature', 'Strikes from the darkness.',               '', 'common'),
    ('Sea Serpent',       5, 3, 5, 'creature', 'Terror of the deep seas.',                 '', 'rare'),
    ('Goblin Scout',      1, 1, 1, 'creature', 'Small but numerous.',                      '', 'common'),
    ('Iron Knight',       2, 4, 3, 'creature', 'Clad in impenetrable armor.',              '', 'uncommon'),
    ('Thunder Eagle',     4, 2, 4, 'creature', 'Strikes with lightning speed.',            '', 'rare'),
    ('Arcane Familiar',   1, 2, 1, 'creature', 'A magical companion.',                     '', 'common'),
    ('Lava Titan',        6, 4, 6, 'creature', 'Born from volcanic fury.',                 '', 'legendary'),
    ('Frost Witch',       2, 3, 3, 'creature', 'Commands the power of ice.',               '', 'uncommon'),
    ('Plague Rat',        1, 1, 1, 'creature', 'Spreads disease and chaos.',               '', 'common'),
    ('Celestial Dragon',  7, 5, 8, 'creature', 'The mightiest of all dragons.',            '', 'legendary'),
    ('Swamp Troll',       3, 3, 3, 'creature', 'Regenerates from wounds.',                 '', 'common'),
    -- Spells
    ('Fireball',          0, 0, 2, 'spell',    'Deal 3 damage to target.',                 '', 'common'),
    ('Lightning Bolt',    0, 0, 1, 'spell',    'Deal 2 damage to target.',                 '', 'common'),
    ('Healing Light',     0, 0, 2, 'spell',    'Heal 4 HP to yourself.',                   '', 'uncommon'),
    ('Arcane Draw',       0, 0, 1, 'spell',    'Draw 2 cards.',                            '', 'uncommon'),
    ('Meteor Strike',     0, 0, 4, 'spell',    'Deal 6 damage to target.',                 '', 'rare'),
    ('Minor Heal',        0, 0, 1, 'spell',    'Heal 2 HP to yourself.',                   '', 'common'),
    ('Blizzard',          0, 0, 3, 'spell',    'Deal 4 damage to target.',                 '', 'rare'),
    ('Fortune''s Gift',   0, 0, 2, 'spell',    'Draw 3 cards.',                            '', 'rare'),
    ('Divine Shield',     0, 0, 3, 'spell',    'Heal 6 HP to yourself.',                   '', 'rare'),
    ('Chaos Bolt',        0, 0, 2, 'spell',    'Deal 2 damage to target.',                 '', 'common')
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- DECKS  (two decks per seed user — dragonmaster & shadowmage)
-- We use a CTE to look up user IDs by username so the seed
-- remains correct regardless of which SERIAL values were assigned.
-- ============================================================
WITH u AS (
    SELECT id, username FROM users
    WHERE username IN ('dragonmaster', 'shadowmage', 'ironclad')
)
INSERT INTO decks (user_id, name, created_at)
SELECT u.id, d.name, NOW()
FROM (VALUES
    ('dragonmaster', 'Dragon Fire Deck'),
    ('dragonmaster', 'Aggro Rush'),
    ('shadowmage',   'Shadow Control'),
    ('shadowmage',   'Spell Surge'),
    ('ironclad',     'Iron Defense')
) AS d(username, name)
JOIN u ON u.username = d.username
ON CONFLICT DO NOTHING;

-- ============================================================
-- DECK_CARDS
-- Build valid 20-card decks using card names (resolved to IDs).
-- Each deck gets a mix of creatures and spells totalling >= 20.
-- ============================================================

-- Helper: resolve card IDs once
WITH
card_ids AS (
    SELECT id, name FROM cards
),
deck_ids AS (
    SELECT d.id AS deck_id, d.name AS deck_name, u.username
    FROM decks d
    JOIN users u ON u.id = d.user_id
),

-- Dragon Fire Deck  (dragonmaster) — heavy creatures + burn spells
dragon_fire AS (
    SELECT di.deck_id, ci.id AS card_id, qty
    FROM deck_ids di
    CROSS JOIN (VALUES
        ('Fire Drake',      3),
        ('Sea Serpent',     2),
        ('Lava Titan',      1),
        ('Thunder Eagle',   2),
        ('Stone Golem',     2),
        ('Swamp Troll',     2),
        ('Fireball',        3),
        ('Lightning Bolt',  3),
        ('Meteor Strike',   2)
    ) AS c(cname, qty)
    JOIN card_ids ci ON ci.name = c.cname
    WHERE di.deck_name = 'Dragon Fire Deck' AND di.username = 'dragonmaster'
),

-- Aggro Rush  (dragonmaster) — cheap fast creatures
aggro_rush AS (
    SELECT di.deck_id, ci.id AS card_id, qty
    FROM deck_ids di
    CROSS JOIN (VALUES
        ('Goblin Scout',    4),
        ('Forest Wolf',     4),
        ('Shadow Rogue',    4),
        ('Arcane Familiar', 3),
        ('Plague Rat',      3),
        ('Lightning Bolt',  2)
    ) AS c(cname, qty)
    JOIN card_ids ci ON ci.name = c.cname
    WHERE di.deck_name = 'Aggro Rush' AND di.username = 'dragonmaster'
),

-- Shadow Control  (shadowmage) — removal + big threats
shadow_control AS (
    SELECT di.deck_id, ci.id AS card_id, qty
    FROM deck_ids di
    CROSS JOIN (VALUES
        ('Shadow Rogue',    3),
        ('Frost Witch',     3),
        ('Celestial Dragon',1),
        ('Shield Guardian', 2),
        ('Iron Knight',     2),
        ('Fireball',        3),
        ('Blizzard',        2),
        ('Chaos Bolt',      2),
        ('Arcane Draw',     2)
    ) AS c(cname, qty)
    JOIN card_ids ci ON ci.name = c.cname
    WHERE di.deck_name = 'Shadow Control' AND di.username = 'shadowmage'
),

-- Spell Surge  (shadowmage) — spell-heavy with card draw
spell_surge AS (
    SELECT di.deck_id, ci.id AS card_id, qty
    FROM deck_ids di
    CROSS JOIN (VALUES
        ('Arcane Familiar', 4),
        ('Frost Witch',     2),
        ('Fireball',        3),
        ('Lightning Bolt',  3),
        ('Arcane Draw',     3),
        ('Fortune''s Gift', 2),
        ('Minor Heal',      2),
        ('Chaos Bolt',      1)
    ) AS c(cname, qty)
    JOIN card_ids ci ON ci.name = c.cname
    WHERE di.deck_name = 'Spell Surge' AND di.username = 'shadowmage'
),

-- Iron Defense  (ironclad) — tanky creatures + heals
iron_defense AS (
    SELECT di.deck_id, ci.id AS card_id, qty
    FROM deck_ids di
    CROSS JOIN (VALUES
        ('Shield Guardian', 4),
        ('Stone Golem',     4),
        ('Iron Knight',     4),
        ('Swamp Troll',     3),
        ('Healing Light',   3),
        ('Divine Shield',   2)
    ) AS c(cname, qty)
    JOIN card_ids ci ON ci.name = c.cname
    WHERE di.deck_name = 'Iron Defense' AND di.username = 'ironclad'
),

all_entries AS (
    SELECT * FROM dragon_fire
    UNION ALL SELECT * FROM aggro_rush
    UNION ALL SELECT * FROM shadow_control
    UNION ALL SELECT * FROM spell_surge
    UNION ALL SELECT * FROM iron_defense
)
INSERT INTO deck_cards (deck_id, card_id, quantity)
SELECT deck_id, card_id, qty FROM all_entries
ON CONFLICT (deck_id, card_id) DO NOTHING;

-- ============================================================
-- GAME_ROOMS  (one finished sample game, one waiting room)
-- ============================================================
WITH
u AS (SELECT id, username FROM users WHERE username IN ('dragonmaster','shadowmage','ironclad')),
d AS (SELECT id, name, user_id FROM decks)
INSERT INTO game_rooms (room_code, player1_id, player2_id, player1_deck_id, player2_deck_id, status, created_at)
SELECT
    'DEMO01',
    p1.id,
    p2.id,
    (SELECT d.id FROM d JOIN u pu ON pu.id = d.user_id WHERE pu.username = 'dragonmaster' AND d.name = 'Dragon Fire Deck' LIMIT 1),
    (SELECT d.id FROM d JOIN u pu ON pu.id = d.user_id WHERE pu.username = 'shadowmage'   AND d.name = 'Shadow Control'    LIMIT 1),
    'finished',
    NOW() - INTERVAL '2 hours'
FROM u p1, u p2
WHERE p1.username = 'dragonmaster' AND p2.username = 'shadowmage'
ON CONFLICT (room_code) DO NOTHING;

WITH
u AS (SELECT id, username FROM users WHERE username IN ('ironclad')),
d AS (SELECT id, name, user_id FROM decks)
INSERT INTO game_rooms (room_code, player1_id, player2_id, player1_deck_id, player2_deck_id, status, created_at)
SELECT
    'WAIT01',
    p1.id,
    NULL,
    (SELECT d.id FROM d JOIN u pu ON pu.id = d.user_id WHERE pu.username = 'ironclad' AND d.name = 'Iron Defense' LIMIT 1),
    NULL,
    'waiting',
    NOW() - INTERVAL '5 minutes'
FROM u p1
WHERE p1.username = 'ironclad'
ON CONFLICT (room_code) DO NOTHING;

-- ============================================================
-- GAME_HISTORY  (record for the finished demo game)
-- ============================================================
WITH
room  AS (SELECT id FROM game_rooms WHERE room_code = 'DEMO01'),
winner AS (SELECT id FROM users WHERE username = 'dragonmaster')
INSERT INTO game_history (room_id, winner_id, turns_played, ended_at)
SELECT room.id, winner.id, 14, NOW() - INTERVAL '1 hour 45 minutes'
FROM room, winner
ON CONFLICT DO NOTHING;