import { fetchAPI } from "@/lib/api";
import { Purchase } from "@/models/purchase";

export async function getPurchases(): Promise<Purchase[]> {
  try {
    return await fetchAPI<Purchase[]>("/purchases");
  } catch (e) {
    console.error("getPurchases:", e);
    return [];
  }
}

export async function createPurchase(input: {
  product_id: number;
  quantity: number;
  unit_cost: number;
}): Promise<Purchase> {
  return fetchAPI<Purchase>("/purchases", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function deletePurchase(id: number) {
  return fetchAPI<{ deleted: number }>(`/purchases/${id}`, {
    method: "DELETE",
  });
}
