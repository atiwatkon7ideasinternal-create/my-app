"use server";

import { revalidatePath } from "next/cache";
import {
  createProduct,
  deleteProduct,
  updateProduct,
} from "@/services/productService";

export async function addProductAction(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  if (!name) throw new Error("กรุณาระบุชื่อสินค้า");

  await createProduct({
    name,
    sku: String(formData.get("sku") || "") || undefined,
    cost_price: Number(formData.get("cost_price") || 0),
    selling_price: Number(formData.get("selling_price") || 0),
    stock: Number(formData.get("stock") || 0),
  });
  revalidatePath("/products");
  revalidatePath("/");
}

export async function updateProductAction(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!id) throw new Error("missing id");

  await updateProduct(id, {
    name: String(formData.get("name") || "") || undefined,
    sku: String(formData.get("sku") || "") || undefined,
    cost_price: Number(formData.get("cost_price") || 0),
    selling_price: Number(formData.get("selling_price") || 0),
  });
  revalidatePath("/products");
}

export async function deleteProductAction(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!id) return;
  await deleteProduct(id);
  revalidatePath("/products");
  revalidatePath("/");
}
