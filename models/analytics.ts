import { Product } from "./product";

export interface BreakEvenResult {
  product?: Product;
  fixed_cost?: number;
  total_fixed_cost?: number;
  variable_cost_per_unit: number;
  selling_price: number;
  contribution_margin_per_unit: number;
  contribution_margin_ratio?: number;
  break_even_units: number | null;
  break_even_revenue: number | null;
  warning?: string;
}

export interface Summary {
  units_sold: number;
  revenue: number;
  cogs: number;
  gross_profit: number;
  total_fixed_cost: number;
  total_extra_variable_cost: number;
  net_profit: number;
  status: string;
}
