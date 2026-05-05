export interface VariableCost {
  id: number;
  name: string;
  amount_per_unit: number;
  product_id: number | null;
  note: string | null;
  created_at: string;
}
