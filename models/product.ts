export interface Product {
  id: number;
  name: string;
  sku: string | null;
  cost_price: number;
  selling_price: number;
  stock: number;
  created_at: string;
}
