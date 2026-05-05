import { APIRequestContext, expect } from "@playwright/test";

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

export async function createFixedCostViaAPI(
  request: APIRequestContext,
  input: { name: string; amount: number; period?: string }
) {
  const res = await request.post(`${BACKEND}/fixed-costs`, { data: input });
  expect(res.ok()).toBeTruthy();
  return res.json();
}

/** Delete every record we created during a test, identified by its name tag */
export async function cleanupByTag(
  request: APIRequestContext,
  tagStr: string
) {
  const endpoints: Array<{ list: string; del: string; field?: string }> = [
    { list: "/sales", del: "/sales" },
    { list: "/purchases", del: "/purchases" },
    { list: "/products", del: "/products", field: "name" },
    { list: "/fixed-costs", del: "/fixed-costs", field: "name" },
    { list: "/variable-costs", del: "/variable-costs", field: "name" },
  ];

  for (const ep of endpoints) {
    const r = await request.get(`${BACKEND}${ep.list}`);
    if (!r.ok()) continue;
    const rows: Array<{ id: number; name?: string; product_name?: string }> =
      await r.json();
    for (const row of rows) {
      const matchField =
        (ep.field === "name" ? row.name : row.product_name) || row.name || "";
      if (matchField.includes(tagStr)) {
        await request.delete(`${BACKEND}${ep.del}/${row.id}`);
      }
    }
  }
}
