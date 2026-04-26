-- ============================================================
-- Kanban App — Seed Data (idempotent via ON CONFLICT DO NOTHING)
-- ============================================================

-- ── Users ─────────────────────────────────────────────────────────────────────
-- Passwords are bcrypt hashes of "password123"
INSERT INTO users (id, email, hashed_password, created_at)
VALUES
    ('a0000000-0000-0000-0000-000000000001',
     'alice@example.com',
     '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK8i',
     '2024-01-01 09:00:00+00'),
    ('a0000000-0000-0000-0000-000000000002',
     'bob@example.com',
     '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK8i',
     '2024-01-02 10:00:00+00'),
    ('a0000000-0000-0000-0000-000000000003',
     'carol@example.com',
     '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK8i',
     '2024-01-03 11:00:00+00')
ON CONFLICT (email) DO NOTHING;

-- ── Boards ────────────────────────────────────────────────────────────────────
INSERT INTO boards (id, owner_id, title, description, created_at)
VALUES
    ('b0000000-0000-0000-0000-000000000001',
     'a0000000-0000-0000-0000-000000000001',
     'Product Roadmap',
     'High-level feature planning for Q1–Q2',
     '2024-01-05 09:00:00+00'),
    ('b0000000-0000-0000-0000-000000000002',
     'a0000000-0000-0000-0000-000000000001',
     'Sprint 12',
     'Two-week sprint board for the engineering team',
     '2024-01-06 09:00:00+00'),
    ('b0000000-0000-0000-0000-000000000003',
     'a0000000-0000-0000-0000-000000000002',
     'Marketing Campaigns',
     'Track campaign tasks and deliverables',
     '2024-01-07 10:00:00+00')
ON CONFLICT (id) DO NOTHING;

-- ── Columns ───────────────────────────────────────────────────────────────────
INSERT INTO columns (id, board_id, title, "order", created_at)
VALUES
    -- Product Roadmap columns
    ('c0000000-0000-0000-0000-000000000001',
     'b0000000-0000-0000-0000-000000000001', 'Backlog',      0,    '2024-01-05 09:05:00+00'),
    ('c0000000-0000-0000-0000-000000000002',
     'b0000000-0000-0000-0000-000000000001', 'In Progress',  1000, '2024-01-05 09:06:00+00'),
    ('c0000000-0000-0000-0000-000000000003',
     'b0000000-0000-0000-0000-000000000001', 'Review',       2000, '2024-01-05 09:07:00+00'),
    ('c0000000-0000-0000-0000-000000000004',
     'b0000000-0000-0000-0000-000000000001', 'Done',         3000, '2024-01-05 09:08:00+00'),

    -- Sprint 12 columns
    ('c0000000-0000-0000-0000-000000000005',
     'b0000000-0000-0000-0000-000000000002', 'To Do',        0,    '2024-01-06 09:05:00+00'),
    ('c0000000-0000-0000-0000-000000000006',
     'b0000000-0000-0000-0000-000000000002', 'In Progress',  1000, '2024-01-06 09:06:00+00'),
    ('c0000000-0000-0000-0000-000000000007',
     'b0000000-0000-0000-0000-000000000002', 'Done',         2000, '2024-01-06 09:07:00+00'),

    -- Marketing Campaigns columns
    ('c0000000-0000-0000-0000-000000000008',
     'b0000000-0000-0000-0000-000000000003', 'Ideas',        0,    '2024-01-07 10:05:00+00'),
    ('c0000000-0000-0000-0000-000000000009',
     'b0000000-0000-0000-0000-000000000003', 'In Flight',    1000, '2024-01-07 10:06:00+00'),
    ('c0000000-0000-0000-0000-000000000010',
     'b0000000-0000-0000-0000-000000000003', 'Completed',    2000, '2024-01-07 10:07:00+00')
ON CONFLICT (id) DO NOTHING;

-- ── Cards ─────────────────────────────────────────────────────────────────────
INSERT INTO cards (id, column_id, title, description, due_date, priority, "order", created_at, updated_at)
VALUES
    -- Product Roadmap / Backlog
    ('d0000000-0000-0000-0000-000000000001',
     'c0000000-0000-0000-0000-000000000001',
     'User authentication flow',
     'Design and implement login, registration, and JWT refresh.',
     '2024-02-15', 'high', 0, '2024-01-05 10:00:00+00', '2024-01-05 10:00:00+00'),

    ('d0000000-0000-0000-0000-000000000002',
     'c0000000-0000-0000-0000-000000000001',
     'Dark mode support',
     'Add a theme toggle and persist preference in localStorage.',
     '2024-03-01', 'low', 1000, '2024-01-05 10:05:00+00', '2024-01-05 10:05:00+00'),

    -- Product Roadmap / In Progress
    ('d0000000-0000-0000-0000-000000000003',
     'c0000000-0000-0000-0000-000000000002',
     'Kanban drag-and-drop',
     'Integrate @dnd-kit for column and card reordering.',
     '2024-01-31', 'high', 0, '2024-01-10 09:00:00+00', '2024-01-12 14:00:00+00'),

    ('d0000000-0000-0000-0000-000000000004',
     'c0000000-0000-0000-0000-000000000002',
     'REST API for boards',
     'CRUD endpoints for boards, columns, and cards.',
     '2024-01-28', 'medium', 1000, '2024-01-10 09:30:00+00', '2024-01-11 11:00:00+00'),

    -- Product Roadmap / Review
    ('d0000000-0000-0000-0000-000000000005',
     'c0000000-0000-0000-0000-000000000003',
     'Database schema design',
     'Finalize ERD and write Alembic migration scripts.',
     '2024-01-20', 'high', 0, '2024-01-08 08:00:00+00', '2024-01-15 16:00:00+00'),

    -- Product Roadmap / Done
    ('d0000000-0000-0000-0000-000000000006',
     'c0000000-0000-0000-0000-000000000004',
     'Project scaffolding',
     'Set up monorepo, Docker Compose, and CI pipeline.',
     '2024-01-10', 'medium', 0, '2024-01-03 08:00:00+00', '2024-01-10 17:00:00+00'),

    -- Sprint 12 / To Do
    ('d0000000-0000-0000-0000-000000000007',
     'c0000000-0000-0000-0000-000000000005',
     'Write unit tests for auth service',
     'Cover register, login, and token validation paths.',
     '2024-02-05', 'medium', 0, '2024-01-06 10:00:00+00', '2024-01-06 10:00:00+00'),

    ('d0000000-0000-0000-0000-000000000008',
     'c0000000-0000-0000-0000-000000000005',
     'Add card priority badges',
     'Display colour-coded badges (low/medium/high) on each card.',
     '2024-02-07', 'low', 1000, '2024-01-06 10:10:00+00', '2024-01-06 10:10:00+00'),

    -- Sprint 12 / In Progress
    ('d0000000-0000-0000-0000-000000000009',
     'c0000000-0000-0000-0000-000000000006',
     'Card detail modal',
     'Implement modal for editing title, description, due date, and priority.',
     '2024-02-03', 'high', 0, '2024-01-06 11:00:00+00', '2024-01-13 09:00:00+00'),

    -- Marketing / Ideas
    ('d0000000-0000-0000-0000-000000000010',
     'c0000000-0000-0000-0000-000000000008',
     'Q1 email newsletter',
     'Draft content and design for the quarterly newsletter.',
     '2024-02-20', 'medium', 0, '2024-01-07 11:00:00+00', '2024-01-07 11:00:00+00')
ON CONFLICT (id) DO NOTHING;