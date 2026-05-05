"use server";

import { revalidatePath } from "next/cache";
import { createPurchase, deletePurchase } from "@/services/purchaseService";

export async function addPurchaseAction(formData: FormData) {
  const product_id = Number(formData.get("product_id"));
  const quantity = Number(formData.get("quantity"));
  const unit_cost = Number(formData.get("unit_cost"));
  if (!product_id || !quantity || isNaN(unit_cost)) {
    throw new Error("ข้อมูลไม่ครบ");
  }
  await createPurchase({ product_id, quantity, unit_cost });
  revalidatePath("/purchases");
  revalidatePath("/products");
  revalidatePath("/");
}

export async function deletePurchaseAction(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!id) return;
  await deletePurchase(id);
  revalidatePath("/purchases");
  revalidatePath("/products");
  revalidatePath("/");
}
