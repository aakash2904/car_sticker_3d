-- Run this in your Supabase SQL Editor from TOP to BOTTOM

-- 1. Create Tables (Using lowercase to avoid Postgres case-sensitivity issues)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  userid VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE owners (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  contact VARCHAR(255),
  address VARCHAR(255),
  email VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE vehicles (
  id SERIAL PRIMARY KEY,
  plate_number VARCHAR(50) NOT NULL,
  make VARCHAR(100),
  model VARCHAR(100),
  color VARCHAR(50),
  year INT,
  owner_id INT REFERENCES owners(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE stickers (
  id SERIAL PRIMARY KEY,
  vehicle_id INT REFERENCES vehicles(id) ON DELETE SET NULL,
  sticker_number VARCHAR(100) NOT NULL,
  issue_date DATE,
  expiry_date DATE,
  status VARCHAR(20) DEFAULT 'active',
  notes TEXT,
  created_by INT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create Views for easy querying
CREATE OR REPLACE VIEW vw_stickers_details AS
SELECT 
  s.*, 
  v.plate_number, v.make, v.model, v.color, v.year,
  o.name AS owner_name, o.contact 
FROM stickers s
LEFT JOIN vehicles v ON s.vehicle_id = v.id
LEFT JOIN owners o ON v.owner_id = o.id;

CREATE OR REPLACE VIEW vw_vehicles_details AS
SELECT 
  v.*, 
  o.name AS owner_name, o.contact 
FROM vehicles v 
LEFT JOIN owners o ON v.owner_id = o.id;
