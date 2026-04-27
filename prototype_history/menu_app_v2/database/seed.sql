-- ============================================================
-- Restaurant Menu Management — Seed Data
-- Idempotent: uses INSERT ... ON CONFLICT DO NOTHING
-- ============================================================

-- ------------------------------------------------------------
-- Users (restaurant owners)
-- Passwords are bcrypt hashes of "password123"
-- ------------------------------------------------------------
INSERT INTO users (id, email, hashed_password, restaurant_name, created_at)
VALUES
    (1, 'mario@bellanapoli.com',
     '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4oZ3Q5XKWG',
     'Bella Napoli',
     NOW()),
    (2, 'chef@sakurasushi.com',
     '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4oZ3Q5XKWG',
     'Sakura Sushi Bar',
     NOW()),
    (3, 'owner@burgerhouse.com',
     '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4oZ3Q5XKWG',
     'The Burger House',
     NOW())
ON CONFLICT (email) DO NOTHING;

-- Keep sequences in sync after explicit ID inserts
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

-- ------------------------------------------------------------
-- Categories
-- ------------------------------------------------------------
INSERT INTO categories (id, owner_id, name, description, sort_order, is_published, created_at, updated_at)
VALUES
    -- Bella Napoli
    (1,  1, 'Antipasti',  'Italian starters and appetizers',          0, TRUE, NOW(), NOW()),
    (2,  1, 'Pizze',      'Wood-fired Neapolitan pizzas',             1, TRUE, NOW(), NOW()),
    (3,  1, 'Dolci',      'Traditional Italian desserts',             2, TRUE, NOW(), NOW()),
    -- Sakura Sushi Bar
    (4,  2, 'Starters',   'Light bites to begin your meal',           0, TRUE, NOW(), NOW()),
    (5,  2, 'Nigiri',     'Hand-pressed sushi with premium fish',     1, TRUE, NOW(), NOW()),
    (6,  2, 'Maki Rolls', 'Classic and specialty rolls',              2, TRUE, NOW(), NOW()),
    -- The Burger House
    (7,  3, 'Burgers',    'Handcrafted smash burgers',                0, TRUE, NOW(), NOW()),
    (8,  3, 'Sides',      'Fries, onion rings, and more',             1, TRUE, NOW(), NOW()),
    (9,  3, 'Drinks',     'Shakes, sodas, and craft beers',           2, FALSE, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories));

-- ------------------------------------------------------------
-- Items
-- ------------------------------------------------------------
INSERT INTO items (id, category_id, name, description, price, image_url, is_available, sort_order, created_at, updated_at)
VALUES
    -- Antipasti (category 1)
    (1,  1, 'Bruschetta al Pomodoro',
     'Toasted bread topped with fresh tomatoes, garlic, and basil',
     7.50,  NULL, TRUE, 0, NOW(), NOW()),
    (2,  1, 'Burrata con Prosciutto',
     'Creamy burrata cheese served with Parma ham and rocket',
     13.00, NULL, TRUE, 1, NOW(), NOW()),

    -- Pizze (category 2)
    (3,  2, 'Margherita',
     'San Marzano tomato, fior di latte mozzarella, fresh basil, extra-virgin olive oil',
     12.00, NULL, TRUE, 0, NOW(), NOW()),
    (4,  2, 'Diavola',
     'Spicy Calabrian salami, tomato, mozzarella, chilli flakes',
     14.50, NULL, TRUE, 1, NOW(), NOW()),
    (5,  2, 'Quattro Formaggi',
     'Mozzarella, gorgonzola, taleggio, and parmigiano',
     15.00, NULL, TRUE, 2, NOW(), NOW()),

    -- Dolci (category 3)
    (6,  3, 'Tiramisù',
     'Classic espresso-soaked ladyfingers with mascarpone cream',
     7.00,  NULL, TRUE, 0, NOW(), NOW()),
    (7,  3, 'Panna Cotta',
     'Vanilla panna cotta with wild berry coulis',
     6.50,  NULL, TRUE, 1, NOW(), NOW()),

    -- Starters (category 4)
    (8,  4, 'Edamame',
     'Steamed salted soy beans',
     4.50,  NULL, TRUE, 0, NOW(), NOW()),
    (9,  4, 'Gyoza (6 pcs)',
     'Pan-fried pork and cabbage dumplings with ponzu dipping sauce',
     8.00,  NULL, TRUE, 1, NOW(), NOW()),

    -- Nigiri (category 5)
    (10, 5, 'Salmon Nigiri (2 pcs)',
     'Hand-pressed sushi rice topped with fresh Atlantic salmon',
     6.00,  NULL, TRUE, 0, NOW(), NOW()),
    (11, 5, 'Tuna Nigiri (2 pcs)',
     'Hand-pressed sushi rice topped with bluefin tuna',
     7.50,  NULL, TRUE, 1, NOW(), NOW()),
    (12, 5, 'Yellowtail Nigiri (2 pcs)',
     'Hand-pressed sushi rice topped with hamachi',
     7.00,  NULL, TRUE, 2, NOW(), NOW()),

    -- Maki Rolls (category 6)
    (13, 6, 'California Roll (8 pcs)',
     'Crab, avocado, cucumber, tobiko',
     9.50,  NULL, TRUE, 0, NOW(), NOW()),
    (14, 6, 'Spicy Tuna Roll (8 pcs)',
     'Tuna, spicy mayo, cucumber, sesame seeds',
     11.00, NULL, TRUE, 1, NOW(), NOW()),

    -- Burgers (category 7)
    (15, 7, 'Classic Smash Burger',
     'Double smash patty, American cheese, pickles, mustard, ketchup, brioche bun',
     12.50, NULL, TRUE, 0, NOW(), NOW()),
    (16, 7, 'BBQ Bacon Burger',
     'Smash patty, streaky bacon, BBQ sauce, cheddar, crispy onions',
     14.00, NULL, TRUE, 1, NOW(), NOW()),
    (17, 7, 'Mushroom Swiss Burger',
     'Smash patty, sautéed mushrooms, Swiss cheese, garlic aioli',
     13.50, NULL, TRUE, 2, NOW(), NOW()),

    -- Sides (category 8)
    (18, 8, 'Crispy Fries',
     'Double-fried golden fries with house seasoning',
     4.00,  NULL, TRUE, 0, NOW(), NOW()),
    (19, 8, 'Onion Rings',
     'Beer-battered onion rings with chipotle dip',
     5.00,  NULL, TRUE, 1, NOW(), NOW()),
    (20, 8, 'Coleslaw',
     'Creamy house-made coleslaw',
     3.00,  NULL, TRUE, 2, NOW(), NOW()),

    -- Drinks (category 9 — unpublished)
    (21, 9, 'Vanilla Milkshake',
     'Thick hand-spun vanilla milkshake',
     5.50,  NULL, TRUE, 0, NOW(), NOW()),
    (22, 9, 'Craft Lager',
     'Local craft lager on draught — 500 ml',
     6.00,  NULL, TRUE, 1, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

SELECT setval('items_id_seq', (SELECT MAX(id) FROM items));