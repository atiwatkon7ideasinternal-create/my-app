import { fetchAPI } from "@/lib/api";
import { Sale } from "@/models/sale";

export async function getSales(): Promise<Sale[]> {
  try {
    return await fetchAPI<Sale[]>("/sales");
  } catch (e) {
    console.error("getSales:", e);
    return [];
  }
}

export async function createSale(input: {
  product_id: number;
  quantity: number;
  unit_price: number;
}): Promise<Sale & { profit: number }> {
  return fetchAPI<Sale & { profit: number }>("/sales", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function deleteSale(id: number) {
  return fetchAPI<{ deleted: number }>(`/sales/${id}`, {
    method: "DELETE",
  });
}
