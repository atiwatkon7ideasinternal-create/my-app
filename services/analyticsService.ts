import { fetchAPI } from "@/lib/api";
import { BreakEvenResult, Summary } from "@/models/analytics";

export async function getBreakEvenForProduct(
  productId: number
): Promise<BreakEvenResult | null> {
  try {
    return await fetchAPI<BreakEvenResult>(`/analytics/break-even/${productId}`);
  } catch (e) {
    console.error("getBreakEvenForProduct:", e);
    return null;
  }
}

export async function calculateBreakEven(input: {
  fixed_cost: number;
  variable_cost_per_unit: number;
  selling_price: number;
}): Promise<BreakEvenResult> {
  return fetchAPI<BreakEvenResult>("/analytics/break-even", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function getSummary(): Promise<Summary | null> {
  try {
    return await fetchAPI<Summary>("/analytics/summary");
  } catch (e) {
    console.error("getSummary:", e);
    return null;
  }
}
