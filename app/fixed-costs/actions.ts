"use server";

import { revalidatePath } from "next/cache";
import {
  createFixedCost,
  deleteFixedCost,
} from "@/services/fixedCostService";

export async function addFixedCostAction(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const amount = Number(formData.get("amount") || 0);
  if (!name || isNaN(amount)) throw new Error("ข้อมูลไม่ครบ");
  await createFixedCost({
    name,
    amount,
    period: String(formData.get("period") || "monthly"),
    note: String(formData.get("note") || "") || undefined,
  });
  revalidatePath("/fixed-costs");
  revalidatePath("/break-even");
  revalidatePath("/");
}

export async function deleteFixedCostAction(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!id) return;
  await deleteFixedCost(id);
  revalidatePath("/fixed-costs");
  revalidatePath("/break-even");
  revalidatePath("/");
}
