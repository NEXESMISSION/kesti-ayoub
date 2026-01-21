export interface Product {
  id: string
  user_id: string
  name: string
  sku?: string
  cost_price: number
  selling_price: number
  stock_quantity: number
  created_at: string
  updated_at: string
}

export interface Sale {
  id: string
  user_id: string
  product_id: string
  quantity: number
  sale_price: number
  payment_type: 'cash' | 'credit'
  customer_name?: string
  sale_date: string
  created_at: string
  updated_at: string
  product?: Product
}

export interface Expense {
  id: string
  user_id: string
  title: string
  category: string
  amount: number
  payment_method?: string
  expense_date: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface Credit {
  id: string
  user_id: string
  person_name: string
  type: 'owed_to_me' | 'i_owe'
  amount: number
  remaining_balance: number
  related_sale_id?: string
  related_expense_id?: string
  status: 'open' | 'partially_paid' | 'settled'
  due_date?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface CreditPayment {
  id: string
  user_id: string
  credit_id: string
  amount: number
  payment_date: string
  notes?: string
  created_at: string
}

export interface FinanceSummary {
  totalSales: number
  totalExpenses: number
  netProfit: number
  outstandingReceivables: number
  outstandingPayables: number
  cashFlow: number
}

