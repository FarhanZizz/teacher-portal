-- ============================================================
-- Teacher Portal Database Schema
-- Compatible with: MySQL 5.7+ / MariaDB 10.3+
-- ============================================================

CREATE DATABASE IF NOT EXISTS teacher_portal
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE teacher_portal;

-- ============================================================
-- Table: auth_user
-- Stores basic authentication and identity data
-- ============================================================
CREATE TABLE IF NOT EXISTS auth_user (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email       VARCHAR(180) NOT NULL UNIQUE,
    first_name  VARCHAR(100) NOT NULL,
    last_name   VARCHAR(100) NOT NULL,
    password    VARCHAR(255) NOT NULL,
    phone       VARCHAR(20)  DEFAULT NULL,
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Table: teachers
-- Extended teacher profile — 1-1 with auth_user via user_id FK
-- ============================================================
CREATE TABLE IF NOT EXISTS teachers (
    id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id          INT UNSIGNED NOT NULL UNIQUE,     -- enforces 1-1
    university_name  VARCHAR(255) NOT NULL,
    gender           ENUM('male','female','other') NOT NULL,
    year_joined      YEAR        NOT NULL,
    subject          VARCHAR(150) DEFAULT NULL,
    bio              TEXT         DEFAULT NULL,
    created_at       DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_teachers_user
        FOREIGN KEY (user_id) REFERENCES auth_user(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Seed: Sample data for development
-- Passwords are bcrypt hashes of "password123"
-- ============================================================
INSERT INTO auth_user (email, first_name, last_name, password, phone) VALUES
('alice@university.edu',  'Alice',   'Johnson',  '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '+1-555-0101'),
('bob@university.edu',    'Bob',     'Williams', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '+1-555-0102'),
('carol@university.edu',  'Carol',   'Martinez', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '+1-555-0103'),
('david@university.edu',  'David',   'Brown',    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '+1-555-0104'),
('emma@university.edu',   'Emma',    'Davis',    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '+1-555-0105');

INSERT INTO teachers (user_id, university_name, gender, year_joined, subject, bio) VALUES
(1, 'MIT',              'female', 2018, 'Computer Science', 'Specializes in distributed systems and cloud computing.'),
(2, 'Stanford',         'male',   2015, 'Mathematics',      'Research focused on algebraic topology and number theory.'),
(3, 'Harvard',          'female', 2020, 'Physics',          'Expert in quantum mechanics and particle physics.'),
(4, 'Oxford',           'male',   2017, 'Chemistry',        'Focuses on organic synthesis and pharmaceutical research.'),
(5, 'UC Berkeley',      'female', 2019, 'Biology',          'Specializes in genomics and CRISPR gene editing.');
