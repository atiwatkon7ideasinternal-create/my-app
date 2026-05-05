"use server";

import { revalidatePath } from "next/cache";
import {
  createVariableCost,
  deleteVariableCost,
} from "@/services/variableCostService";

export async function addVariableCostAction(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const amount_per_unit = Number(formData.get("amount_per_unit") || 0);
  const productRaw = String(formData.get("product_id") || "");
  const product_id = productRaw ? Number(productRaw) : null;
  if (!name || isNaN(amount_per_unit)) throw new Error("ข้อมูลไม่ครบ");

  await createVariableCost({
    name,
    amount_per_unit,
    product_id,
    note: String(formData.get("note") || "") || undefined,
  });
  revalidatePath("/variable-costs");
  revalidatePath("/break-even");
  revalidatePath("/");
}

export async function deleteVariableCostAction(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!id) return;
  await deleteVariableCost(id);
  revalidatePath("/variable-costs");
  revalidatePath("/break-even");
  revalidatePath("/");
}
