-- ============================================================
-- Starbucks-Like Drink Ordering App — Seed Data
-- Idempotent: safe to re-run on an existing database
-- ============================================================

-- ─── CATEGORIES ───────────────────────────────────────────────────────────────

INSERT INTO categories (name, display_order) VALUES
    ('Hot Coffees',   1),
    ('Cold Brews',    2),
    ('Teas',          3),
    ('Refreshers',    4),
    ('Frappuccinos',  5)
ON CONFLICT (name) DO NOTHING;

-- ─── USERS ────────────────────────────────────────────────────────────────────
-- Passwords are bcrypt hashes.
--   admin@starbucks.local  → admin123
--   alice@example.com      → password123
--   bob@example.com        → password123

INSERT INTO users (email, name, hashed_password, role) VALUES
    (
        'admin@starbucks.local',
        'Admin',
        '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK8i',
        'admin'
    ),
    (
        'alice@example.com',
        'Alice Johnson',
        '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.',
        'user'
    ),
    (
        'bob@example.com',
        'Bob Smith',
        '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.',
        'user'
    ),
    (
        'carol@example.com',
        'Carol White',
        '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.',
        'user'
    ),
    (
        'dave@example.com',
        'Dave Brown',
        '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.',
        'user'
    )
ON CONFLICT (email) DO NOTHING;

-- ─── MODIFIERS ────────────────────────────────────────────────────────────────
-- Use a temp table approach to make inserts idempotent by (name, type)

INSERT INTO modifiers (name, type, price_delta)
SELECT name, type::modifiertype, price_delta
FROM (VALUES
    -- Sizes
    ('Tall',           'size',  0.00),
    ('Grande',         'size',  0.50),
    ('Venti',          'size',  1.00),
    -- Milk types
    ('Whole Milk',     'milk',  0.00),
    ('Oat Milk',       'milk',  0.70),
    ('Almond Milk',    'milk',  0.70),
    ('Skim Milk',      'milk',  0.00),
    ('No Milk',        'milk',  0.00),
    -- Extras
    ('Extra Shot',     'extra', 0.80),
    ('Vanilla Syrup',  'extra', 0.50),
    ('Caramel Syrup',  'extra', 0.50),
    ('Hazelnut Syrup', 'extra', 0.50),
    ('Whipped Cream',  'extra', 0.00),
    ('Extra Foam',     'extra', 0.00),
    ('Light Ice',      'extra', 0.00),
    ('No Ice',         'extra', 0.00)
) AS v(name, type, price_delta)
WHERE NOT EXISTS (
    SELECT 1 FROM modifiers m
    WHERE m.name = v.name
      AND m.type = v.type::modifiertype
);

-- ─── DRINKS ───────────────────────────────────────────────────────────────────

INSERT INTO drinks (category_id, name, description, base_price, is_available)
SELECT c.id, v.name, v.description, v.base_price, TRUE
FROM (VALUES
    ('Hot Coffees',  'Caffè Americano',
        'Espresso shots topped with hot water to produce a light layer of crema.',
        3.45),
    ('Hot Coffees',  'Caffè Latte',
        'Rich, full-bodied espresso in steamed milk with a light layer of foam.',
        4.25),
    ('Hot Coffees',  'Cappuccino',
        'Dark, rich espresso lies in wait under a smoothed and stretched layer of deep foam.',
        4.25),
    ('Hot Coffees',  'Caramel Macchiato',
        'Freshly steamed milk with vanilla-flavored syrup marked with espresso and caramel drizzle.',
        5.25),
    ('Cold Brews',   'Cold Brew Coffee',
        'Handcrafted in small batches, slow-steeped in cool water for 20 hours.',
        4.45),
    ('Cold Brews',   'Vanilla Sweet Cream Cold Brew',
        'Our slow-steeped custom blend topped with a delicate float of house-made vanilla sweet cream.',
        5.25),
    ('Cold Brews',   'Salted Caramel Cream Cold Brew',
        'Our custom cold brew blend topped with a salted, rich caramel cream cold foam.',
        5.45),
    ('Teas',         'Chai Tea Latte',
        'Black tea infused with cinnamon, clove and other warming spices.',
        4.25),
    ('Teas',         'Matcha Tea Latte',
        'Smooth and creamy matcha sweetened just right and served with steamed milk.',
        4.75),
    ('Teas',         'London Fog Tea Latte',
        'Earl Grey tea infused with vanilla syrup and steamed milk.',
        4.75),
    ('Refreshers',   'Strawberry Açaí Refresher',
        'Sweet strawberry flavors accented by passion fruit and açaí notes.',
        4.45),
    ('Refreshers',   'Mango Dragonfruit Refresher',
        'Tropical flavors of mango and dragonfruit with a splash of coconut milk.',
        4.45),
    ('Frappuccinos', 'Caramel Frappuccino',
        'Caramel syrup meets coffee, milk and ice for a rendezvous in the blender.',
        5.25),
    ('Frappuccinos', 'Mocha Frappuccino',
        'Mocha sauce and Frappuccino® chips blended with milk and ice.',
        5.25),
    ('Frappuccinos', 'Java Chip Frappuccino',
        'Mocha sauce and Frappuccino® chips blended with milk and ice, topped with whipped cream.',
        5.45)
) AS v(category_name, name, description, base_price)
JOIN categories c ON c.name = v.category_name
WHERE NOT EXISTS (
    SELECT 1 FROM drinks d WHERE d.name = v.name
);

-- ─── DRINK_MODIFIERS — attach all modifiers to every drink ────────────────────

INSERT INTO drink_modifiers (drink_id, modifier_id)
SELECT d.id, m.id
FROM drinks d
CROSS JOIN modifiers m
ON CONFLICT (drink_id, modifier_id) DO NOTHING;

-- ─── SAMPLE ORDERS ────────────────────────────────────────────────────────────
-- Two completed orders for alice, one pending for bob

-- Order 1: Alice — completed
WITH new_order AS (
    INSERT INTO orders (user_id, status, total_price, created_at, updated_at)
    SELECT u.id, 'completed'::orderstatus, 9.70,
           now() - INTERVAL '2 days', now() - INTERVAL '2 days'
    FROM users u WHERE u.email = 'alice@example.com'
    AND NOT EXISTS (
        SELECT 1 FROM orders o
        JOIN users u2 ON o.user_id = u2.id
        WHERE u2.email = 'alice@example.com'
          AND o.status = 'completed'
          AND o.total_price = 9.70
    )
    RETURNING id
),
item1 AS (
    INSERT INTO order_items (order_id, drink_id, quantity, unit_price, customization_notes)
    SELECT new_order.id, d.id, 1, 4.25, '{"size": "Grande", "milk": "Oat Milk"}'::json
    FROM new_order, drinks d WHERE d.name = 'Caffè Latte'
    RETURNING id
),
item2 AS (
    INSERT INTO order_items (order_id, drink_id, quantity, unit_price, customization_notes)
    SELECT new_order.id, d.id, 1, 5.45, '{"size": "Venti", "extras": ["Whipped Cream"]}'::json
    FROM new_order, drinks d WHERE d.name = 'Java Chip Frappuccino'
    RETURNING id
)
INSERT INTO order_item_modifiers (order_item_id, modifier_id)
SELECT item1.id, m.id FROM item1, modifiers m WHERE m.name = 'Grande'
UNION ALL
SELECT item1.id, m.id FROM item1, modifiers m WHERE m.name = 'Oat Milk'
UNION ALL
SELECT item2.id, m.id FROM item2, modifiers m WHERE m.name = 'Venti'
UNION ALL
SELECT item2.id, m.id FROM item2, modifiers m WHERE m.name = 'Whipped Cream';

-- Order 2: Alice — completed (older)
WITH new_order AS (
    INSERT INTO orders (user_id, status, total_price, created_at, updated_at)
    SELECT u.id, 'completed'::orderstatus, 4.45,
           now() - INTERVAL '5 days', now() - INTERVAL '5 days'
    FROM users u WHERE u.email = 'alice@example.com'
    AND NOT EXISTS (
        SELECT 1 FROM orders o
        JOIN users u2 ON o.user_id = u2.id
        WHERE u2.email = 'alice@example.com'
          AND o.status = 'completed'
          AND o.total_price = 4.45
    )
    RETURNING id
),
item1 AS (
    INSERT INTO order_items (order_id, drink_id, quantity, unit_price, customization_notes)
    SELECT new_order.id, d.id, 1, 4.45, '{"size": "Tall"}'::json
    FROM new_order, drinks d WHERE d.name = 'Cold Brew Coffee'
    RETURNING id
)
INSERT INTO order_item_modifiers (order_item_id, modifier_id)
SELECT item1.id, m.id FROM item1, modifiers m WHERE m.name = 'Tall';

-- Order 3: Bob — pending
WITH new_order AS (
    INSERT INTO orders (user_id, status, total_price, created_at, updated_at)
    SELECT u.id, 'pending'::orderstatus, 10.00,
           now(), now()
    FROM users u WHERE u.email = 'bob@example.com'
    AND NOT EXISTS (
        SELECT 1 FROM orders o
        JOIN users u2 ON o.user_id = u2.id
        WHERE u2.email = 'bob@example.com'
          AND o.status = 'pending'
    )
    RETURNING id
),
item1 AS (
    INSERT INTO order_items (order_id, drink_id, quantity, unit_price, customization_notes)
    SELECT new_order.id, d.id, 2, 5.00,
           '{"size": "Grande", "milk": "Almond Milk", "extras": ["Extra Shot"]}'::json
    FROM new_order, drinks d WHERE d.name = 'Caramel Frappuccino'
    RETURNING id
)
INSERT INTO order_item_modifiers (order_item_id, modifier_id)
SELECT item1.id, m.id FROM item1, modifiers m WHERE m.name = 'Grande'
UNION ALL
SELECT item1.id, m.id FROM item1, modifiers m WHERE m.name = 'Almond Milk'
UNION ALL
SELECT item1.id, m.id FROM item1, modifiers m WHERE m.name = 'Extra Shot';