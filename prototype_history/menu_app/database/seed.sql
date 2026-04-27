-- ============================================================
-- Idempotent seed data for Restaurant Menu Management
-- Safe to re-run: uses INSERT ... ON CONFLICT DO NOTHING
-- ============================================================

-- ------------------------------------------------------------
-- Seed owner user
-- Password: "password123" hashed with bcrypt (cost 12)
-- Hash generated offline; replace with a fresh hash if needed.
-- ------------------------------------------------------------
INSERT INTO users (id, email, hashed_password, created_at)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'owner@restaurant.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK8i',
    NOW()
)
ON CONFLICT (email) DO NOTHING;

-- ------------------------------------------------------------
-- Seed categories (owned by the seeded user)
-- ------------------------------------------------------------
INSERT INTO categories (id, name, sort_order, owner_id)
VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Starters',    1, '11111111-1111-1111-1111-111111111111'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Main Course',  2, '11111111-1111-1111-1111-111111111111'),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Pizzas',       3, '11111111-1111-1111-1111-111111111111'),
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Desserts',     4, '11111111-1111-1111-1111-111111111111'),
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Beverages',    5, '11111111-1111-1111-1111-111111111111')
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------
-- Seed menu items
-- ------------------------------------------------------------
INSERT INTO menu_items (id, category_id, name, description, price, image_url, is_available, sort_order)
VALUES
    -- Starters
    (
        'item0001-0000-0000-0000-000000000001',
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        'Bruschetta al Pomodoro',
        'Toasted bread topped with fresh tomatoes, garlic, basil, and extra-virgin olive oil.',
        7.50,
        NULL,
        TRUE,
        1
    ),
    (
        'item0001-0000-0000-0000-000000000002',
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        'Calamari Fritti',
        'Crispy fried squid rings served with marinara dipping sauce and a wedge of lemon.',
        11.00,
        NULL,
        TRUE,
        2
    ),
    (
        'item0001-0000-0000-0000-000000000003',
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        'Soup of the Day',
        'Ask your server for today''s freshly made soup, served with crusty bread.',
        6.00,
        NULL,
        FALSE,
        3
    ),

    -- Main Course
    (
        'item0002-0000-0000-0000-000000000001',
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        'Grilled Salmon',
        'Atlantic salmon fillet grilled to perfection, served with seasonal vegetables and lemon butter sauce.',
        22.50,
        NULL,
        TRUE,
        1
    ),
    (
        'item0002-0000-0000-0000-000000000002',
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        'Chicken Parmigiana',
        'Breaded chicken breast topped with tomato sauce and melted mozzarella, served with spaghetti.',
        18.00,
        NULL,
        TRUE,
        2
    ),
    (
        'item0002-0000-0000-0000-000000000003',
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        'Beef Tenderloin',
        '200g prime beef tenderloin cooked to your liking, served with roasted potatoes and red wine jus.',
        34.00,
        NULL,
        TRUE,
        3
    ),

    -- Pizzas
    (
        'item0003-0000-0000-0000-000000000001',
        'cccccccc-cccc-cccc-cccc-cccccccccccc',
        'Margherita',
        'Classic pizza with San Marzano tomato sauce, fresh mozzarella, and basil leaves.',
        13.00,
        NULL,
        TRUE,
        1
    ),
    (
        'item0003-0000-0000-0000-000000000002',
        'cccccccc-cccc-cccc-cccc-cccccccccccc',
        'Diavola',
        'Spicy salami, tomato sauce, mozzarella, and fresh chilli on a thin crust base.',
        15.50,
        NULL,
        TRUE,
        2
    ),

    -- Desserts
    (
        'item0004-0000-0000-0000-000000000001',
        'dddddddd-dddd-dddd-dddd-dddddddddddd',
        'Tiramisu',
        'Classic Italian dessert with espresso-soaked ladyfingers, mascarpone cream, and cocoa powder.',
        8.00,
        NULL,
        TRUE,
        1
    ),
    (
        'item0004-0000-0000-0000-000000000002',
        'dddddddd-dddd-dddd-dddd-dddddddddddd',
        'Panna Cotta',
        'Silky vanilla panna cotta served with a fresh berry coulis.',
        7.00,
        NULL,
        TRUE,
        2
    ),

    -- Beverages
    (
        'item0005-0000-0000-0000-000000000001',
        'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
        'Still Water (500ml)',
        'Chilled still mineral water.',
        2.50,
        NULL,
        TRUE,
        1
    ),
    (
        'item0005-0000-0000-0000-000000000002',
        'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
        'Fresh Orange Juice',
        'Freshly squeezed orange juice, served chilled.',
        4.50,
        NULL,
        TRUE,
        2
    ),
    (
        'item0005-0000-0000-0000-000000000003',
        'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
        'Espresso',
        'Single shot of our house-blend espresso.',
        3.00,
        NULL,
        TRUE,
        3
    )
ON CONFLICT (id) DO NOTHING;