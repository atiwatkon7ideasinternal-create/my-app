export interface Purchase {
  id: number;
  product_id: number;
  product_name?: string;
  quantity: number;
  unit_cost: number;
  total: number;
  purchased_at: string;
}
