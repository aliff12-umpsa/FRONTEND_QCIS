-- ==========================================
-- Group 5: Quality Control Inspection System
-- Complete Database Schema
-- ==========================================

-- 1️⃣ Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role VARCHAR(50) DEFAULT 'inspector', -- e.g., inspector, manager
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2️⃣ Products table
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,   -- product code
    category VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3️⃣ Inspection Records table
CREATE TABLE inspection_records (
    id SERIAL PRIMARY KEY,
    product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    inspector_id INT NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    inspection_date DATE NOT NULL DEFAULT CURRENT_DATE,
    result VARCHAR(10) NOT NULL,  -- 'Pass' or 'Fail'
    notes TEXT,
    photo_url VARCHAR(255),       -- optional image of defect
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4️⃣ Defects table
CREATE TABLE defects (
    id SERIAL PRIMARY KEY,
    inspection_id INT NOT NULL REFERENCES inspection_records(id) ON DELETE CASCADE,
    defect_type VARCHAR(100) NOT NULL,
    description TEXT,
    severity VARCHAR(50),          -- e.g., minor, major, critical
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5️⃣ Optional: Quality Reports table
CREATE TABLE quality_reports (
    id SERIAL PRIMARY KEY,
    report_date DATE NOT NULL DEFAULT CURRENT_DATE,
    total_inspections INT DEFAULT 0,
    pass_count INT DEFAULT 0,
    fail_count INT DEFAULT 0,
    defect_summary JSONB,          -- stores defect type counts
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- End of Database Schema
-- ==========================================
