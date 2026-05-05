import { fetchAPI } from "@/lib/api";
import { VariableCost } from "@/models/variableCost";

export async function getVariableCosts(productId?: number): Promise<VariableCost[]> {
  try {
    const qs = productId ? `?product_id=${productId}` : "";
    return await fetchAPI<VariableCost[]>(`/variable-costs${qs}`);
  } catch (e) {
    console.error("getVariableCosts:", e);
    return [];
  }
}

export async function createVariableCost(input: {
  name: string;
  amount_per_unit: number;
  product_id?: number | null;
  note?: string;
}) {
  return fetchAPI<VariableCost>("/variable-costs", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function deleteVariableCost(id: number) {
  return fetchAPI<{ deleted: number }>(`/variable-costs/${id}`, {
    method: "DELETE",
  });
}
