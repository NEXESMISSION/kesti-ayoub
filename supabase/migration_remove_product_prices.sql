-- Migration: Remove cost_price and selling_price from products table
-- These fields are no longer used in the UI, but we'll keep them in the database
-- for backward compatibility. If you want to remove them completely, run this script.

-- Option 1: Keep columns but make them optional (recommended for backward compatibility)
-- This allows existing data to remain intact
ALTER TABLE products 
  ALTER COLUMN cost_price DROP NOT NULL,
  ALTER COLUMN selling_price DROP NOT NULL;

-- Set default values to 0 for any NULL values
UPDATE products 
SET cost_price = 0 WHERE cost_price IS NULL;
UPDATE products 
SET selling_price = 0 WHERE selling_price IS NULL;

-- Option 2: Completely remove the columns (uncomment if you want to remove them)
-- WARNING: This will permanently delete the cost_price and selling_price data
-- Make sure you have a backup before running this!

-- ALTER TABLE products 
--   DROP COLUMN IF EXISTS cost_price,
--   DROP COLUMN IF errEXISTS selling_price;

-- Note: The application code now sets these to 0 when creating products,
-- so they won't be used but won't cause errors either.

