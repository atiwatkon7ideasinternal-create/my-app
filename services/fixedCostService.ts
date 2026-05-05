import { fetchAPI } from "@/lib/api";
import { FixedCost } from "@/models/fixedCost";

export async function getFixedCosts(): Promise<FixedCost[]> {
  try {
    return await fetchAPI<FixedCost[]>("/fixed-costs");
  } catch (e) {
    console.error("getFixedCosts:", e);
    return [];
  }
}

export async function createFixedCost(input: {
  name: string;
  amount: number;
  period?: string;
  note?: string;
}) {
  return fetchAPI<FixedCost>("/fixed-costs", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function deleteFixedCost(id: number) {
  return fetchAPI<{ deleted: number }>(`/fixed-costs/${id}`, {
    method: "DELETE",
  });
}
