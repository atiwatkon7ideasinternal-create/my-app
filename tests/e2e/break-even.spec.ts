import { test, expect } from "@playwright/test";
import {
  tag,
  cleanupByTag,
  createProductViaAPI,
  createFixedCostViaAPI,
  createVariableCostViaAPI,
} from "./helpers";

test.describe("จุดคุ้มทุน — calculator + chart", () => {
  const t = tag("BEP");

  test.afterAll(async ({ request }) => {
    await cleanupByTag(request, t);
  });

  test("Header แสดงสูตรและต้นทุนคงที่รวมในระบบ", async ({ page }) => {
    await page.goto("/break-even");
    await expect(page.getByRole("heading", { name: /จุดคุ้มทุน/ })).toBeVisible();
    await expect(page.getByText("ต้นทุนคงที่รวมในระบบ")).toBeVisible();
  });

  test("โหมดที่ 2 (กำหนดเอง): FC=10000 VC=50 Price=100 → BEP=200, ฿20,000 + SVG", async ({
    page,
  }) => {
    await page.goto("/break-even");
    const customForm = page.locator("form").nth(1);
    await customForm.locator('input[name="fixed_cost"]').fill("10000");
    await customForm.locator('input[name="variable_cost_per_unit"]').fill("50");
    await customForm.locator('input[name="selling_price"]').fill("100");
    await customForm.getByRole("button", { name: /คำนวณ/ }).click();

    // Big result cards
    await expect(
      page.locator(".text-4xl").filter({ hasText: "200" })
    ).toBeVisible();
    await expect(
      page.locator(".text-4xl").filter({ hasText: "฿20,000" })
    ).toBeVisible();
    await expect(page.getByText(/50\.00%/).first()).toBeVisible();

    // SVG + BEP marker (purple circle)
    const svg = page.locator('svg[role="img"][aria-label="Break-even chart"]');
    await expect(svg).toBeVisible();
    await expect(svg.locator('circle[r="7"]')).toHaveCount(1);

    // Profit polygon (green gradient) + Loss polygon (red gradient) ต้องมีอย่างละ 1
    await expect(svg.locator('polygon[fill="url(#profitGrad)"]')).toHaveCount(1);
    await expect(svg.locator('polygon[fill="url(#lossGrad)"]')).toHaveCount(1);
  });

  test("Warning: ราคาขาย ≤ ต้นทุนแปรผัน → ไม่มี BEP marker + แสดง warning", async ({
    page,
  }) => {
    await page.goto("/break-even");
    const customForm = page.locator("form").nth(1);
    await customForm.locator('input[name="fixed_cost"]').fill("5000");
    await customForm.locator('input[name="variable_cost_per_unit"]').fill("100");
    await customForm.locator('input[name="selling_price"]').fill("80"); // ขาย < ทุนแปรผัน
    await customForm.getByRole("button", { name: /คำนวณ/ }).click();

    await expect(page.getByText(/ไม่สามารถคุ้มทุน/)).toBeVisible();
    // chart ก็ต้องไม่มี BEP marker
    const svg = page.locator('svg[role="img"][aria-label="Break-even chart"]');
    if ((await svg.count()) > 0) {
      await expect(svg.locator('circle[r="7"]')).toHaveCount(0);
    }
  });

  test("โหมดที่ 1 (เลือกสินค้า): ใช้ค่าจริง + รวม variable cost ที่ผูกกับสินค้า", async ({
    page,
    request,
  }) => {
    const product = await createProductViaAPI(request, {
      name: `${t} BEP-product`,
      cost_price: 40,
      selling_price: 100,
      stock: 0,
    });
    await createFixedCostViaAPI(request, {
      name: `${t} ค่าเช่า`,
      amount: 6000,
    });
    await createVariableCostViaAPI(request, {
      name: `${t} ค่าส่ง`,
      amount_per_unit: 10,
      product_id: product.id,
    });

    await page.goto("/break-even");
    const productForm = page.locator("form").first();
    await productForm
      .locator('select[name="productId"]')
      .selectOption(String(product.id));
    await productForm.getByRole("button", { name: /คำนวณ/ }).click();

    // ราคาขาย/หน่วย ในผลลัพธ์ต้อง = ฿100 (อ่านจากสินค้าจริง)
    const sellingBox = page
      .locator(".bg-sky-50")
      .filter({ hasText: "ราคาขาย/หน่วย" });
    await expect(sellingBox).toContainText("฿100");

    // VC ต่อหน่วย ≥ 50 (40 cost + 10 product-VC + อาจมี global VC อื่นด้วย)
    const vcBox = page
      .locator(".bg-amber-50")
      .filter({ hasText: "ต้นทุนแปรผัน/หน่วย" });
    const vcText = await vcBox.textContent();
    const vcNum = Number((vcText || "").replace(/[^\d.]/g, ""));
    expect(vcNum).toBeGreaterThanOrEqual(50);

    // ผลลัพธ์ต้องมี BEP card
    const bepCard = page
      .getByText(/ต้องขายให้ได้/)
      .locator("..")
      .first();
    await expect(bepCard).toContainText(/หน่วย/);
  });

  test("Custom mode pre-fill: fixed_cost ใช้ค่ารวมจาก fixed_costs ในระบบเป็น default", async ({
    page,
    request,
  }) => {
    // เพิ่ม fixed cost ที่ขนาดใหญ่พอจะแยกแยะออก
    const uniqueAmount = 12345;
    await createFixedCostViaAPI(request, {
      name: `${t} ค่าเช่า-prefill-${uniqueAmount}`,
      amount: uniqueAmount,
    });

    await page.goto("/break-even");
    const customForm = page.locator("form").nth(1);
    const fcInput = customForm.locator('input[name="fixed_cost"]');
    const value = await fcInput.inputValue();
    expect(Number(value)).toBeGreaterThanOrEqual(uniqueAmount);
  });
});
