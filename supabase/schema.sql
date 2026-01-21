-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(100),
  cost_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  selling_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sales table
CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  sale_price DECIMAL(10, 2) NOT NULL,
  payment_type VARCHAR(20) NOT NULL CHECK (payment_type IN ('cash', 'credit')),
  customer_name VARCHAR(255),
  sale_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Expenses table
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(50),
  expense_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Credits table (for both receivables and payables)
CREATE TABLE credits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  person_name VARCHAR(255) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('owed_to_me', 'i_owe')),
  amount DECIMAL(10, 2) NOT NULL,
  remaining_balance DECIMAL(10, 2) NOT NULL,
  related_sale_id UUID REFERENCES sales(id) ON DELETE SET NULL,
  related_expense_id UUID REFERENCES expenses(id) ON DELETE SET NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'partially_paid', 'settled')),
  due_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Credit payments table (for partial payments)
CREATE TABLE credit_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  credit_id UUID NOT NULL REFERENCES credits(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_products_user_id ON products(user_id);
CREATE INDEX idx_sales_user_id ON sales(user_id);
CREATE INDEX idx_sales_product_id ON sales(product_id);
CREATE INDEX idx_sales_date ON sales(sale_date);
CREATE INDEX idx_expenses_user_id ON expenses(user_id);
CREATE INDEX idx_expenses_date ON expenses(expense_date);
CREATE INDEX idx_credits_user_id ON credits(user_id);
CREATE INDEX idx_credits_type ON credits(type);
CREATE INDEX idx_credits_status ON credits(status);
CREATE INDEX idx_credit_payments_credit_id ON credit_payments(credit_id);
CREATE INDEX idx_credit_payments_user_id ON credit_payments(user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to automatically update updated_at
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sales_updated_at BEFORE UPDATE ON sales
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_credits_updated_at BEFORE UPDATE ON credits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update stock quantity when a sale is made
CREATE OR REPLACE FUNCTION update_product_stock()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products
  SET stock_quantity = stock_quantity - NEW.quantity
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update stock on sale
CREATE TRIGGER update_stock_on_sale AFTER INSERT ON sales
  FOR EACH ROW EXECUTE FUNCTION update_product_stock();

-- Function to update credit balance when payment is made
CREATE OR REPLACE FUNCTION update_credit_balance()
RETURNS TRIGGER AS $$
DECLARE
  new_balance DECIMAL(10, 2);
BEGIN
  SELECT remaining_balance - NEW.amount INTO new_balance
  FROM credits
  WHERE id = NEW.credit_id;
  
  IF new_balance <= 0 THEN
    UPDATE credits
    SET remaining_balance = 0,
        status = 'settled'
    WHERE id = NEW.credit_id;
  ELSE
    UPDATE credits
    SET remaining_balance = new_balance,
        status = CASE 
          WHEN new_balance < (SELECT amount FROM credits WHERE id = NEW.credit_id) 
          THEN 'partially_paid' 
          ELSE 'open' 
        END
    WHERE id = NEW.credit_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update credit balance on payment
CREATE TRIGGER update_credit_on_payment AFTER INSERT ON credit_payments
  FOR EACH ROW EXECUTE FUNCTION update_credit_balance();

