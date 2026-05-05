export interface Sale {
  id: number;
  product_id: number;
  product_name?: string;
  quantity: number;
  unit_price: number;
  unit_cost: number;
  total: number;
  sold_at: string;
}
