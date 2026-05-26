-- Run this in your Supabase SQL Editor

-- 1. Create Tables
CREATE TABLE Users (
  id SERIAL PRIMARY KEY,
  userid VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Owners (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  contact VARCHAR(255),
  address VARCHAR(255),
  email VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Vehicles (
  id SERIAL PRIMARY KEY,
  plate_number VARCHAR(50) NOT NULL,
  make VARCHAR(100),
  model VARCHAR(100),
  color VARCHAR(50),
  year INT,
  owner_id INT REFERENCES Owners(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Stickers (
  id SERIAL PRIMARY KEY,
  vehicle_id INT REFERENCES Vehicles(id) ON DELETE SET NULL,
  sticker_number VARCHAR(100) NOT NULL,
  issue_date DATE,
  expiry_date DATE,
  status VARCHAR(20) DEFAULT 'active',
  notes TEXT,
  created_by INT REFERENCES Users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create Views for easy querying
CREATE OR REPLACE VIEW vw_stickers_details AS
SELECT 
  s.*, 
  v.plate_number, v.make, v.model, v.color, v.year,
  o.name AS owner_name, o.contact 
FROM Stickers s
LEFT JOIN Vehicles v ON s.vehicle_id = v.id
LEFT JOIN Owners o ON v.owner_id = o.id;

CREATE OR REPLACE VIEW vw_vehicles_details AS
SELECT 
  v.*, 
  o.name AS owner_name, o.contact 
FROM Vehicles v 
LEFT JOIN Owners o ON v.owner_id = o.id;
