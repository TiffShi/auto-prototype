-- Hospital Simulator Seed Data
-- Idempotent: uses INSERT ... ON CONFLICT DO NOTHING with stable UUIDs

-- ─────────────────────────────────────────────
-- HOSPITALS
-- ─────────────────────────────────────────────

INSERT INTO hospitals (id, name, budget, day, speed_multiplier, is_paused, created_at)
VALUES
    ('a0000000-0000-0000-0000-000000000001', 'City General Hospital',   485000.00, 3, 1.0, FALSE, NOW() - INTERVAL '2 days'),
    ('a0000000-0000-0000-0000-000000000002', 'St. Mary Medical Center', 612000.00, 1, 1.0, FALSE, NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────
-- DEPARTMENTS  (5 per hospital)
-- ─────────────────────────────────────────────

INSERT INTO departments (id, hospital_id, name, type, bed_capacity, current_occupancy, upgrade_level)
VALUES
    -- City General Hospital
    ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Emergency Room',        'ER',       20, 8,  2),
    ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Intensive Care Unit',   'ICU',      10, 4,  1),
    ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'General Ward',          'GENERAL',  30, 12, 1),
    ('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'Surgery',               'SURGERY',   8,  2, 1),
    ('b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'Pharmacy',              'PHARMACY',  0,  0, 1),
    -- St. Mary Medical Center
    ('b0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000002', 'Emergency Room',        'ER',       20, 5,  1),
    ('b0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000002', 'Intensive Care Unit',   'ICU',      10, 2,  1),
    ('b0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000002', 'General Ward',          'GENERAL',  30, 7,  1),
    ('b0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000002', 'Surgery',               'SURGERY',   8,  1, 1),
    ('b0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000002', 'Pharmacy',              'PHARMACY',  0,  0, 1)
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────
-- PATIENTS  (8 for hospital 1, 5 for hospital 2)
-- ─────────────────────────────────────────────

INSERT INTO patients (id, hospital_id, department_id, name, age, condition, severity, status,
                      admitted_at, discharged_at, treatment_cost, ticks_in_treatment, required_ticks)
VALUES
    -- City General — active patients
    ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001',
     'b0000000-0000-0000-0000-000000000001', 'Margaret Thompson', 67, 'Heart Attack',    'CRITICAL', 'IN_TREATMENT',
     NOW() - INTERVAL '3 hours',  NULL,  32500.00, 3, 10),

    ('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001',
     'b0000000-0000-0000-0000-000000000002', 'James Holloway',    54, 'Sepsis',          'CRITICAL', 'IN_TREATMENT',
     NOW() - INTERVAL '5 hours',  NULL,  47200.00, 5, 12),

    ('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001',
     'b0000000-0000-0000-0000-000000000001', 'Sofia Ramirez',     34, 'Appendicitis',    'MEDIUM',   'IN_TREATMENT',
     NOW() - INTERVAL '2 hours',  NULL,   6800.00, 2, 6),

    ('c0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001',
     'b0000000-0000-0000-0000-000000000003', 'David Chen',        28, 'Fractured Arm',   'MEDIUM',   'IN_TREATMENT',
     NOW() - INTERVAL '1 hour',   NULL,   4200.00, 1, 5),

    ('c0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001',
     NULL,                                  'Emily Watson',      19, 'Mild Fever',       'LOW',      'WAITING',
     NOW() - INTERVAL '30 minutes', NULL,    750.00, 0, 2),

    ('c0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001',
     NULL,                                  'Robert Kim',        45, 'Chest Pain',       'MEDIUM',   'WAITING',
     NOW() - INTERVAL '45 minutes', NULL,   5500.00, 0, 4),

    -- City General — discharged
    ('c0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001',
     'b0000000-0000-0000-0000-000000000003', 'Linda Park',        72, 'Pneumonia',       'MEDIUM',   'DISCHARGED',
     NOW() - INTERVAL '2 days',   NOW() - INTERVAL '6 hours', 8900.00, 8, 8),

    ('c0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001',
     'b0000000-0000-0000-0000-000000000001', 'Carlos Mendez',     38, 'Sprained Ankle',  'LOW',      'DISCHARGED',
     NOW() - INTERVAL '1 day',    NOW() - INTERVAL '12 hours', 900.00, 3, 3),

    -- St. Mary — active patients
    ('c0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000002',
     'b0000000-0000-0000-0000-000000000006', 'Patricia Moore',    61, 'Stroke',          'CRITICAL', 'IN_TREATMENT',
     NOW() - INTERVAL '4 hours',  NULL,  41000.00, 4, 11),

    ('c0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000002',
     'b0000000-0000-0000-0000-000000000008', 'Thomas Wright',     29, 'Kidney Stones',   'MEDIUM',   'IN_TREATMENT',
     NOW() - INTERVAL '2 hours',  NULL,   7100.00, 2, 7),

    ('c0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000002',
     NULL,                                  'Angela Foster',     52, 'Allergic Reaction','LOW',      'WAITING',
     NOW() - INTERVAL '20 minutes', NULL,  1200.00, 0, 2),

    ('c0000000-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000002',
     NULL,                                  'Kevin Nguyen',      41, 'Asthma Attack',   'MEDIUM',   'WAITING',
     NOW() - INTERVAL '1 hour',   NULL,   4800.00, 0, 5),

    ('c0000000-0000-0000-0000-000000000013', 'a0000000-0000-0000-0000-000000000002',
     'b0000000-0000-0000-0000-000000000007', 'Sandra Lee',        78, 'Respiratory Failure','CRITICAL','IN_TREATMENT',
     NOW() - INTERVAL '6 hours',  NULL,  38500.00, 6, 14)
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────
-- STAFF  (8 for hospital 1, 6 for hospital 2)
-- ─────────────────────────────────────────────

INSERT INTO staff (id, hospital_id, department_id, name, role, skill_level, fatigue, salary, shift, is_available)
VALUES
    -- City General Hospital
    ('d0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001',
     'b0000000-0000-0000-0000-000000000001', 'Dr. Alan Grant',      'DOCTOR',     8, 35, 12800.00, 'DAY',   TRUE),
    ('d0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001',
     'b0000000-0000-0000-0000-000000000002', 'Dr. Sarah Connor',    'DOCTOR',     9, 20, 14400.00, 'DAY',   TRUE),
    ('d0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001',
     'b0000000-0000-0000-0000-000000000004', 'Dr. Marcus Webb',     'SURGEON',    7, 50, 19200.00, 'DAY',   TRUE),
    ('d0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001',
     'b0000000-0000-0000-0000-000000000001', 'Nurse Rachel Green',  'NURSE',      6, 60, 6400.00,  'DAY',   TRUE),
    ('d0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001',
     'b0000000-0000-0000-0000-000000000003', 'Nurse Tom Bradley',   'NURSE',      5, 25, 5600.00,  'NIGHT', TRUE),
    ('d0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001',
     'b0000000-0000-0000-0000-000000000005', 'Dr. Lisa Patel',      'PHARMACIST', 7, 10, 8400.00,  'DAY',   TRUE),
    ('d0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001',
     NULL,                                  'John Stevens',        'ADMIN',      4, 5,  4200.00,  'DAY',   TRUE),
    ('d0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001',
     'b0000000-0000-0000-0000-000000000002', 'Nurse Diana Prince',  'NURSE',      8, 75, 7200.00,  'NIGHT', FALSE),

    -- St. Mary Medical Center
    ('d0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000002',
     'b0000000-0000-0000-0000-000000000006', 'Dr. Henry Mills',     'DOCTOR',     7, 30, 12000.00, 'DAY',   TRUE),
    ('d0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000002',
     'b0000000-0000-0000-0000-000000000007', 'Dr. Olivia Stone',    'DOCTOR',     9, 15, 14400.00, 'DAY',   TRUE),
    ('d0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000002',
     'b0000000-0000-0000-0000-000000000009', 'Dr. Nathan Cross',    'SURGEON',    8, 40, 20800.00, 'DAY',   TRUE),
    ('d0000000-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000002',
     'b0000000-0000-0000-0000-000000000006', 'Nurse Amy Turner',    'NURSE',      6, 20, 6400.00,  'DAY',   TRUE),
    ('d0000000-0000-0000-0000-000000000013', 'a0000000-0000-0000-0000-000000000002',
     'b0000000-0000-0000-0000-000000000010', 'Dr. Raj Sharma',      'PHARMACIST', 6, 10, 7600.00,  'DAY',   TRUE),
    ('d0000000-0000-0000-0000-000000000014', 'a0000000-0000-0000-0000-000000000002',
     NULL,                                  'Claire Novak',        'ADMIN',      5, 0,  4600.00,  'DAY',   TRUE)
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────
-- INVENTORY  (9 items per hospital)
-- ─────────────────────────────────────────────

INSERT INTO inventory (id, hospital_id, item_name, category, quantity, unit_cost, reorder_threshold)
VALUES
    -- City General Hospital
    ('e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Antibiotics',     'MEDICINE',   85,  15.00, 20),
    ('e0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Painkillers',     'MEDICINE',  130,   8.00, 30),
    ('e0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'IV Fluids',       'MEDICINE',   60,  12.00, 20),
    ('e0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'Surgical Gloves', 'SUPPLIES',  420,   2.00, 100),
    ('e0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'Syringes',        'SUPPLIES',  275,   1.50, 50),
    ('e0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'Bandages',        'SUPPLIES',  180,   3.00, 40),
    ('e0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', 'Defibrillator',   'EQUIPMENT',   3, 5000.00, 1),
    ('e0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001', 'Ventilator',      'EQUIPMENT',   4, 8000.00, 2),
    ('e0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000001', 'X-Ray Machine',   'EQUIPMENT',   2,15000.00, 1),

    -- St. Mary Medical Center
    ('e0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000002', 'Antibiotics',     'MEDICINE',  100,  15.00, 20),
    ('e0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000002', 'Painkillers',     'MEDICINE',  150,   8.00, 30),
    ('e0000000-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000002', 'IV Fluids',       'MEDICINE',   80,  12.00, 20),
    ('e0000000-0000-0000-0000-000000000013', 'a0000000-0000-0000-0000-000000000002', 'Surgical Gloves', 'SUPPLIES',  500,   2.00, 100),
    ('e0000000-0000-0000-0000-000000000014', 'a0000000-0000-0000-0000-000000000002', 'Syringes',        'SUPPLIES',  300,   1.50, 50),
    ('e0000000-0000-0000-0000-000000000015', 'a0000000-0000-0000-0000-000000000002', 'Bandages',        'SUPPLIES',  200,   3.00, 40),
    ('e0000000-0000-0000-0000-000000000016', 'a0000000-0000-0000-0000-000000000002', 'Defibrillator',   'EQUIPMENT',   2, 5000.00, 1),
    ('e0000000-0000-0000-0000-000000000017', 'a0000000-0000-0000-0000-000000000002', 'Ventilator',      'EQUIPMENT',   5, 8000.00, 2),
    ('e0000000-0000-0000-0000-000000000018', 'a0000000-0000-0000-0000-000000000002', 'X-Ray Machine',   'EQUIPMENT',   2,15000.00, 1)
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────
-- FINANCIAL TRANSACTIONS  (6 per hospital)
-- ─────────────────────────────────────────────

INSERT INTO financial_transactions (id, hospital_id, type, amount, description, created_at)
VALUES
    -- City General Hospital
    ('f0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001',
     'REVENUE',  8900.00, 'Treatment: Linda Park (Pneumonia)',                NOW() - INTERVAL '6 hours'),
    ('f0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001',
     'REVENUE',   900.00, 'Treatment: Carlos Mendez (Sprained Ankle)',        NOW() - INTERVAL '12 hours'),
    ('f0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001',
     'EXPENSE', 25000.00, 'Upgraded Emergency Room to level 2',               NOW() - INTERVAL '1 day'),
    ('f0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001',
     'EXPENSE',  6400.00, 'Hiring cost: Nurse Rachel Green (NURSE)',          NOW() - INTERVAL '2 days'),
    ('f0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001',
     'EXPENSE',  1200.00, 'Purchased 100x Antibiotics',                       NOW() - INTERVAL '2 days'),
    ('f0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001',
     'EXPENSE',   450.00, 'Staff salary (per tick)',                          NOW() - INTERVAL '3 hours'),

    -- St. Mary Medical Center
    ('f0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000002',
     'REVENUE', 12000.00, 'Treatment: George Harris (Cardiac Arrest)',        NOW() - INTERVAL '8 hours'),
    ('f0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000002',
     'REVENUE',  3500.00, 'Treatment: Maria Santos (Concussion)',             NOW() - INTERVAL '10 hours'),
    ('f0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000002',
     'EXPENSE',  7200.00, 'Hiring cost: Dr. Nathan Cross (SURGEON)',          NOW() - INTERVAL '1 day'),
    ('f0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000002',
     'EXPENSE',  1500.00, 'Purchased 150x Painkillers',                       NOW() - INTERVAL '1 day'),
    ('f0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000002',
     'EXPENSE',   960.00, 'Purchased 80x IV Fluids',                          NOW() - INTERVAL '2 days'),
    ('f0000000-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000002',
     'EXPENSE',   380.00, 'Staff salary (per tick)',                          NOW() - INTERVAL '2 hours')
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────
-- EVENTS  (6 per hospital)
-- ─────────────────────────────────────────────

INSERT INTO events (id, hospital_id, event_type, description, severity, created_at)
VALUES
    -- City General Hospital
    ('e1000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001',
     'PATIENT_CRITICAL',
     'Patient Margaret Thompson is in critical condition and requires immediate attention.',
     'CRITICAL', NOW() - INTERVAL '3 hours'),

    ('e1000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001',
     'LOW_STOCK',
     'Low stock alert: IV Fluids has only 60 units remaining.',
     'WARNING',  NOW() - INTERVAL '1 hour'),

    ('e1000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001',
     'EQUIPMENT_FAILURE',
     'A critical piece of equipment has malfunctioned and requires immediate repair.',
     'WARNING',  NOW() - INTERVAL '5 hours'),

    ('e1000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001',
     'INSPECTION_PASSED',
     'The hospital passed its quarterly health inspection with flying colors.',
     'INFO',     NOW() - INTERVAL '1 day'),

    ('e1000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001',
     'STAFF_ILLNESS',
     'A staff member has fallen ill and is unavailable for their shift.',
     'WARNING',  NOW() - INTERVAL '2 hours'),

    ('e1000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001',
     'DONATION_RECEIVED',
     'The hospital received a generous donation from a local benefactor.',
     'INFO',     NOW() - INTERVAL '2 days'),

    -- St. Mary Medical Center
    ('e1000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000002',
     'PATIENT_CRITICAL',
     'Patient Sandra Lee is in critical condition and requires immediate attention.',
     'CRITICAL', NOW() - INTERVAL '6 hours'),

    ('e1000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000002',
     'DISEASE_OUTBREAK',
     'A disease outbreak has been reported in the city. Expect increased patient arrivals.',
     'CRITICAL', NOW() - INTERVAL '4 hours'),

    ('e1000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000002',
     'LOW_STOCK',
     'Low stock alert: Defibrillator has only 2 units remaining.',
     'WARNING',  NOW() - INTERVAL '30 minutes'),

    ('e1000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000002',
     'POWER_OUTAGE',
     'A brief power outage affected non-critical systems. Backup generators activated.',
     'WARNING',  NOW() - INTERVAL '3 hours'),

    ('e1000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000002',
     'INSPECTION_PASSED',
     'The hospital passed its quarterly health inspection with flying colors.',
     'INFO',     NOW() - INTERVAL '1 day'),

    ('e1000000-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000002',
     'DONATION_RECEIVED',
     'The hospital received a generous donation from a local benefactor.',
     'INFO',     NOW() - INTERVAL '12 hours')
ON CONFLICT (id) DO NOTHING;