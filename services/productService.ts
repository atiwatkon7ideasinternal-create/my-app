import { fetchAPI } from "@/lib/api";
import { Product } from "@/models/product";

export async function getProducts(): Promise<Product[]> {
  try {
    return await fetchAPI<Product[]>("/products");
  } catch (e) {
    console.error("getProducts:", e);
    return [];
  }
}

export async function getProduct(id: number): Promise<Product | null> {
  try {
    return await fetchAPI<Product>(`/products/${id}`);
  } catch (e) {
    console.error("getProduct:", e);
    return null;
  }
}

export async function createProduct(input: {
  name: string;
  sku?: string;
  cost_price?: number;
  selling_price?: number;
  stock?: number;
}): Promise<Product> {
  return fetchAPI<Product>("/products", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateProduct(
  id: number,
  input: Partial<Omit<Product, "id" | "created_at">>
): Promise<{ updated: number }> {
  return fetchAPI<{ updated: number }>(`/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export async function deleteProduct(id: number): Promise<{ deleted: number }> {
  return fetchAPI<{ deleted: number }>(`/products/${id}`, {
    method: "DELETE",
  });
}
