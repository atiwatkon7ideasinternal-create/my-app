import { test, expect } from "@playwright/test";
import {
  tag,
  cleanupByTag,
  createProductViaAPI,
  createFixedCostViaAPI,
} from "./helpers";

test.describe("Break-even calculator + chart", () => {
  const t = tag("BEP");

  test.afterAll(async ({ request }) => {
    await cleanupByTag(request, t);
  });

  test("โหมดที่ 2 (กำหนดเอง): FC=10000, VC=50, Price=100 → BEP=200 หน่วย, ฿20,000 + แสดง SVG", async ({
    page,
  }) => {
    await page.goto("/break-even");

    // Fill custom mode form (2nd form on page)
    const customForm = page.locator("form").nth(1);
    await customForm.locator('input[name="fixed_cost"]').fill("10000");
    await customForm.locator('input[name="variable_cost_per_unit"]').fill("50");
    await customForm.locator('input[name="selling_price"]').fill("100");
    await customForm.getByRole("button", { name: /คำนวณ/ }).click();

    // Result: BEP = 10000 / (100-50) = 200 units, revenue = 20000
    // Use the big result card (.text-4xl) to avoid matching the SVG tooltip too
    const unitsCard = page.locator(".text-4xl").filter({ hasText: "200" });
    await expect(unitsCard).toBeVisible();
    const revenueCard = page.locator(".text-4xl").filter({ hasText: "฿20,000" });
    await expect(revenueCard).toBeVisible();

    // CMR = 50/100 = 50.00%
    await expect(page.getByText(/50\.00%/).first()).toBeVisible();

    // The SVG chart is rendered
    const svg = page.locator('svg[role="img"][aria-label="Break-even chart"]');
    await expect(svg).toBeVisible();

    // BEP marker (purple circle radius 7) should exist
    const bepMarker = svg.locator('circle[r="7"]');
    await expect(bepMarker).toHaveCount(1);
  });

  test("โหมดที่ 1 (เลือกสินค้า): ใช้ค่าจริงจากระบบ", async ({ page, request }) => {
    // Setup: 1 product + fixed cost
    const product = await createProductViaAPI(request, {
      name: `${t} สินค้า BEP`,
      cost_price: 40,
      selling_price: 100,
      stock: 0,
    });
    await createFixedCostViaAPI(request, {
      name: `${t} ค่าเช่าทดสอบ`,
      amount: 6000,
    });

    await page.goto("/break-even");

    // Pick the product we just created (by id)
    const productForm = page.locator("form").first();
    await productForm
      .locator('select[name="productId"]')
      .selectOption(String(product.id));
    await productForm.getByRole("button", { name: /คำนวณ/ }).click();

    // BEP units = totalFixed / (100 - 40) = totalFixed / 60
    // We can't predict exact value because other fixed costs may exist in db,
    // but at minimum the BEP card must render with a number > 0
    const bepCard = page.getByText(/ต้องขายให้ได้/).locator("..");
    await expect(bepCard).toBeVisible();
    await expect(bepCard).toContainText(/\d/);
  });
});
