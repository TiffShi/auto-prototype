-- Ride-Sharing Simulator — Seed Data
-- Idempotent: uses INSERT ... ON CONFLICT DO NOTHING with explicit UUIDs.
-- All UUIDs are fixed so re-running this file is safe.

INSERT INTO trips (
    id,
    status,
    pickup_lat,
    pickup_lng,
    dropoff_lat,
    dropoff_lng,
    driver_origin_lat,
    driver_origin_lng,
    created_at,
    updated_at
) VALUES
-- 1: Completed trip — central London
(
    '11111111-1111-1111-1111-111111111111',
    'COMPLETED',
    51.5074,  -0.1278,
    51.5155,  -0.0922,
    51.5200,  -0.1350,
    NOW() - INTERVAL '2 hours',
    NOW() - INTERVAL '2 hours' + INTERVAL '15 minutes'
),
-- 2: Completed trip — Shoreditch to Canary Wharf
(
    '22222222-2222-2222-2222-222222222222',
    'COMPLETED',
    51.5227,  -0.0731,
    51.5054,  -0.0235,
    51.5300,  -0.0800,
    NOW() - INTERVAL '90 minutes',
    NOW() - INTERVAL '90 minutes' + INTERVAL '12 minutes'
),
-- 3: Completed trip — Waterloo to Greenwich
(
    '33333333-3333-3333-3333-333333333333',
    'COMPLETED',
    51.5036,  -0.1143,
    51.4826,  -0.0077,
    51.5100,  -0.1200,
    NOW() - INTERVAL '60 minutes',
    NOW() - INTERVAL '60 minutes' + INTERVAL '20 minutes'
),
-- 4: Completed trip — King's Cross to Brixton
(
    '44444444-4444-4444-4444-444444444444',
    'COMPLETED',
    51.5308,  -0.1238,
    51.4613,  -0.1156,
    51.5400,  -0.1100,
    NOW() - INTERVAL '45 minutes',
    NOW() - INTERVAL '45 minutes' + INTERVAL '18 minutes'
),
-- 5: Completed trip — Paddington to Liverpool Street
(
    '55555555-5555-5555-5555-555555555555',
    'COMPLETED',
    51.5154,  -0.1755,
    51.5178,  -0.0823,
    51.5050,  -0.1800,
    NOW() - INTERVAL '30 minutes',
    NOW() - INTERVAL '30 minutes' + INTERVAL '14 minutes'
),
-- 6: Completed trip — Hammersmith to London Bridge
(
    '66666666-6666-6666-6666-666666666666',
    'COMPLETED',
    51.4927,  -0.2239,
    51.5055,  -0.0865,
    51.5000,  -0.2300,
    NOW() - INTERVAL '20 minutes',
    NOW() - INTERVAL '20 minutes' + INTERVAL '22 minutes'
),
-- 7: Completed trip — Camden to Elephant & Castle
(
    '77777777-7777-7777-7777-777777777777',
    'COMPLETED',
    51.5390,  -0.1426,
    51.4958,  -0.1002,
    51.5450,  -0.1500,
    NOW() - INTERVAL '15 minutes',
    NOW() - INTERVAL '15 minutes' + INTERVAL '16 minutes'
),
-- 8: Completed trip — Notting Hill to Bermondsey
(
    '88888888-8888-8888-8888-888888888888',
    'COMPLETED',
    51.5085,  -0.1960,
    51.4995,  -0.0630,
    51.5150,  -0.2000,
    NOW() - INTERVAL '10 minutes',
    NOW() - INTERVAL '10 minutes' + INTERVAL '19 minutes'
)
ON CONFLICT (id) DO NOTHING;