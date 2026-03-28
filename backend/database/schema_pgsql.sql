-- ============================================================
-- Teacher Portal Database Schema — PostgreSQL
-- Compatible with: PostgreSQL 12+
-- ============================================================

CREATE DATABASE teacher_portal
    WITH ENCODING 'UTF8'
    LC_COLLATE = 'en_US.UTF-8'
    LC_CTYPE   = 'en_US.UTF-8';

\c teacher_portal;

-- ============================================================
-- Table: auth_user
-- ============================================================
CREATE TABLE IF NOT EXISTS auth_user (
    id          SERIAL PRIMARY KEY,
    email       VARCHAR(180) NOT NULL UNIQUE,
    first_name  VARCHAR(100) NOT NULL,
    last_name   VARCHAR(100) NOT NULL,
    password    VARCHAR(255) NOT NULL,
    phone       VARCHAR(20)  DEFAULT NULL,
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_auth_user_email ON auth_user(email);

-- ============================================================
-- Table: teachers
-- ============================================================
CREATE TYPE gender_enum AS ENUM ('male', 'female', 'other');

CREATE TABLE IF NOT EXISTS teachers (
    id               SERIAL PRIMARY KEY,
    user_id          INT          NOT NULL UNIQUE,
    university_name  VARCHAR(255) NOT NULL,
    gender           gender_enum  NOT NULL,
    year_joined      SMALLINT     NOT NULL,
    subject          VARCHAR(150) DEFAULT NULL,
    bio              TEXT         DEFAULT NULL,
    created_at       TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP    NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_teachers_user
        FOREIGN KEY (user_id) REFERENCES auth_user(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE INDEX idx_teachers_user_id ON teachers(user_id);

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_auth_user_updated_at
    BEFORE UPDATE ON auth_user
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trg_teachers_updated_at
    BEFORE UPDATE ON teachers
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- ============================================================
-- Seed Data (passwords = bcrypt of "password123")
-- ============================================================
INSERT INTO auth_user (email, first_name, last_name, password, phone) VALUES
('alice@university.edu',  'Alice',   'Johnson',  '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '+1-555-0101'),
('bob@university.edu',    'Bob',     'Williams', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '+1-555-0102'),
('carol@university.edu',  'Carol',   'Martinez', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '+1-555-0103');

INSERT INTO teachers (user_id, university_name, gender, year_joined, subject, bio) VALUES
(1, 'MIT',      'female', 2018, 'Computer Science', 'Specializes in distributed systems.'),
(2, 'Stanford', 'male',   2015, 'Mathematics',      'Research in algebraic topology.'),
(3, 'Harvard',  'female', 2020, 'Physics',          'Expert in quantum mechanics.');
