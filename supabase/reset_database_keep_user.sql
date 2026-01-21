-- ============================================
-- Reset Database - Keep Users Only
-- إعادة تعيين قاعدة البيانات - الاحتفاظ بالمستخدمين فقط
-- ============================================
-- WARNING: This will delete ALL data from all tables
-- but will keep user accounts in auth.users
-- 
-- تحذير: هذا سيحذف جميع البيانات من جميع الجداول
-- لكنه سيبقي حسابات المستخدمين في auth.users
-- ============================================

BEGIN;

-- Disable triggers temporarily to avoid foreign key constraint issues
SET session_replication_role = 'replica';

-- Delete all data from tables (in reverse order of dependencies)
-- Start with tables that have foreign keys pointing to them

-- 1. Delete all credit payments (has FK to credits)
TRUNCATE TABLE credit_payments CASCADE;

-- 2. Delete all credits (has FK to sales/expenses)
TRUNCATE TABLE credits CASCADE;

-- 3. Delete all expenses
TRUNCATE TABLE expenses CASCADE;

-- 4. Delete all sales (has FK to products)
TRUNCATE TABLE sales CASCADE;

-- 5. Delete all products
TRUNCATE TABLE products CASCADE;

-- Re-enable triggers
SET session_replication_role = 'origin';

-- Verify deletion
DO $$
DECLARE
  products_count INTEGER;
  sales_count INTEGER;
  expenses_count INTEGER;
  credits_count INTEGER;
  payments_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO products_count FROM products;
  SELECT COUNT(*) INTO sales_count FROM sales;
  SELECT COUNT(*) INTO expenses_count FROM expenses;
  SELECT COUNT(*) INTO credits_count FROM credits;
  SELECT COUNT(*) INTO payments_count FROM credit_payments;
  
  RAISE NOTICE 'Database reset complete:';
  RAISE NOTICE 'Products: %', products_count;
  RAISE NOTICE 'Sales: %', sales_count;
  RAISE NOTICE 'Expenses: %', expenses_count;
  RAISE NOTICE 'Credits: %', credits_count;
  RAISE NOTICE 'Credit Payments: %', payments_count;
  RAISE NOTICE 'All tables are now empty. User accounts are preserved.';
END $$;

COMMIT;

-- ============================================
-- Database Reset Complete
-- All data deleted except user accounts
-- ============================================
-- 
-- تم إعادة تعيين قاعدة البيانات بنجاح
-- تم حذف جميع البيانات باستثناء حسابات المستخدمين
-- ============================================

