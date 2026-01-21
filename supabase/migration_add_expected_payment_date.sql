-- Migration: Add expected_payment_date field to credits table
-- This field is for tracking when you expect to receive payment (for receivables)

-- Add the new column
ALTER TABLE credits 
  ADD COLUMN IF NOT EXISTS expected_payment_date TIMESTAMP WITH TIME ZONE;

-- Add a comment to explain the field
COMMENT ON COLUMN credits.expected_payment_date IS 'Expected date when payment will be received (for receivables - owed_to_me)';

-- Create an index for better query performance
CREATE INDEX IF NOT EXISTS idx_credits_expected_payment_date ON credits(expected_payment_date) WHERE expected_payment_date IS NOT NULL;

a