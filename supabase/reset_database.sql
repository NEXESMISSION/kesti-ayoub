-- ============================================
-- Reset Database - Keep Users Only
-- ============================================
-- WARNING: This will delete ALL data from all tables
-- but will keep user accounts in auth.users
-- ============================================

-- Disable triggers temporarily to avoid issues
SET session_replication_role = 'replica';

-- Delete all data from tables (in reverse order of dependencies)
-- Start with tables that have foreign keys pointing to them

-- 1. Delete all credit payments
DELETE FROM credit_payments;

-- 2. Delete all credits
DELETE FROM credits;

-- 3. Delete all expenses
DELETE FROM expenses;

-- 4. Delete all sales
DELETE FROM sales;

-- 5. Delete all products
DELETE FROM products;

-- Re-enable triggers
SET session_replication_role = 'origin';

-- Reset sequences if any (for auto-incrementing IDs, though we use UUIDs)
-- Note: Since we use UUIDs, sequences might not be needed, but included for completeness

-- Verify deletion (optional - uncomment to check)
-- SELECT 
--   (SELECT COUNT(*) FROM products) as products_count,
--   (SELECT COUNT(*) FROM sales) as sales_count,
--   (SELECT COUNT(*) FROM expenses) as expenses_count,
--   (SELECT COUNT(*) FROM credits) as credits_count,
--   (SELECT COUNT(*) FROM credit_payments) as payments_count;

-- ============================================
-- Database Reset Complete
-- All data deleted except user accounts
-- ============================================

