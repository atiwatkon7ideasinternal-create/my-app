import { APIRequestContext, expect, Page } from "@playwright/test";

export const BACKEND = process.env.BACKEND_URL || "http://localhost:5001";

/** Unique tag so tests don't collide with each other or with real data */
export const tag = (label: string) =>
  `[E2E-${label}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}]`;

export async function createProductViaAPI(
  request: APIRequestContext,
  input: {
    name: string;
    cost_price?: number;
    selling_price?: number;
    stock?: number;
    sku?: string;
  }
) {
  const res = await request.post(`${BACKEND}/products`, { data: input });
  expect(res.ok()).toBeTruthy();
  return res.json();
}

export async function createPurchaseViaAPI(
  request: APIRequestContext,
  input: { product_id: number; quantity: number; unit_cost: number }
) {
  const res = await request.post(`${BACKEND}/purchases`, { data: input });
  expect(res.ok()).toBeTruthy();
  return res.json();
}

export async function createSaleViaAPI(
  request: APIRequestContext,
  input: { product_id: number; quantity: number; unit_price: number }
) {
  const res = await request.post(`${BACKEND}/sales`, { data: input });
  expect(res.ok()).toBeTruthy();
  return res.json();
}

export async function createFixedCostViaAPI(
  request: APIRequestContext,
  input: { name: string; amount: number; period?: string }
) {
  const res = await request.post(`${BACKEND}/fixed-costs`, { data: input });
  expect(res.ok()).toBeTruthy();
  return res.json();
}

export async function createVariableCostViaAPI(
  request: APIRequestContext,
  input: {
    name: string;
    amount_per_unit: number;
    product_id?: number | null;
    note?: string;
  }
) {
  const res = await request.post(`${BACKEND}/variable-costs`, { data: input });
  expect(res.ok()).toBeTruthy();
  return res.json();
}

export async function getProductViaAPI(
  request: APIRequestContext,
  id: number
) {
  const res = await request.get(`${BACKEND}/products/${id}`);
  expect(res.ok()).toBeTruthy();
  return res.json();
}

/** Delete every record we created during a test, identified by its name tag.
 *  Order matters: sales/purchases first (they reference products). */
export async function cleanupByTag(
  request: APIRequestContext,
  tagStr: string
) {
  // 1. Delete sales/purchases whose product_name matches
  for (const ep of ["/sales", "/purchases"]) {
    const r = await request.get(`${BACKEND}${ep}`);
    if (!r.ok()) continue;
    const rows: Array<{ id: number; product_name?: string }> = await r.json();
    for (const row of rows) {
      if ((row.product_name || "").includes(tagStr)) {
        await request.delete(`${BACKEND}${ep}/${row.id}`);
      }
    }
  }
  // 2. Then delete the named records (products/costs)
  for (const ep of ["/products", "/fixed-costs", "/variable-costs"]) {
    const r = await request.get(`${BACKEND}${ep}`);
    if (!r.ok()) continue;
    const rows: Array<{ id: number; name?: string }> = await r.json();
    for (const row of rows) {
      if ((row.name || "").includes(tagStr)) {
        await request.delete(`${BACKEND}${ep}/${row.id}`);
      }
    }
  }
}

/** Wait for a row containing the given text to appear/disappear */
export async function expectRowVisible(page: Page, text: string) {
  await expect(page.locator("tr", { hasText: text })).toBeVisible();
}
