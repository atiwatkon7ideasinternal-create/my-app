"use server";

import { revalidatePath } from "next/cache";
import { createSale, deleteSale } from "@/services/saleService";

export async function addSaleAction(formData: FormData) {
  const product_id = Number(formData.get("product_id"));
  const quantity = Number(formData.get("quantity"));
  const unit_price = Number(formData.get("unit_price"));
  if (!product_id || !quantity || isNaN(unit_price)) {
    throw new Error("ข้อมูลไม่ครบ");
  }
  await createSale({ product_id, quantity, unit_price });
  revalidatePath("/sales");
  revalidatePath("/products");
  revalidatePath("/");
}

export async function deleteSaleAction(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!id) return;
  await deleteSale(id);
  revalidatePath("/sales");
  revalidatePath("/products");
  revalidatePath("/");
}
