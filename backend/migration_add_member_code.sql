-- Run this in your Supabase SQL Editor
-- This adds a member_code column to the owners table

ALTER TABLE owners ADD COLUMN IF NOT EXISTS member_code VARCHAR(50) UNIQUE;
