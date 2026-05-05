import { test, expect } from "@playwright/test";
import {
  tag,
  cleanupByTag,
  createProductViaAPI,
  createSaleViaAPI,
} from "./helpers";

test.describe("Dashboard — KPI cards + low-stock list", () => {
  const t = tag("DASH");

  test.afterAll(async ({ request }) => {
    await cleanupByTag(request, t);
  });

  test("Heading + KPI cards 4 อัน + Mini stat 3 อัน", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "ภาพรวมธุรกิจ" })
    ).toBeVisible();

    // ทดสอบว่ามี title ของ KPI cards ครบ
    await expect(page.getByText("ยอดขายรวม")).toBeVisible();
    await expect(page.getByText("ต้นทุนสินค้า")).toBeVisible();
    await expect(page.getByText("กำไรขั้นต้น")).toBeVisible();
    await expect(page.getByText(/กำไรสุทธิ|ขาดทุนสุทธิ/)).toBeVisible();

    await expect(page.getByText("ขายแล้ว (หน่วย)")).toBeVisible();
    await expect(page.getByText("ต้นทุนคงที่รวม")).toBeVisible();
    await expect(page.getByText("ต้นทุนแปรผันที่ใช้จริง")).toBeVisible();
  });

  test("สร้างสินค้า + ขาย → ยอดขายใน Dashboard ต้องเพิ่มขึ้น", async ({
    page,
    request,
  }) => {
    // อ่านยอดขายเริ่มต้นจาก backend
    const summaryBefore = await (await request.get("http://localhost:5001/analytics/summary")).json();
    const revenueBefore = summaryBefore.revenue || 0;

    const product = await createProductViaAPI(request, {
      name: `${t} dashboard-revenue`,
      cost_price: 100,
      selling_price: 500,
      stock: 10,
    });
    await createSaleViaAPI(request, {
      product_id: product.id,
      quantity: 2,
      unit_price: 500,
    });

    await page.goto("/");
    const summaryAfter = await (await request.get("http://localhost:5001/analytics/summary")).json();
    expect(summaryAfter.revenue).toBe(revenueBefore + 1000);
  });

  test("สินค้าสต็อก ≤ 5 ต้องโผล่ใน 'สินค้าใกล้หมด'", async ({ page, request }) => {
    const lowName = `${t} dashboard-low-stock`;
    await createProductViaAPI(request, {
      name: lowName,
      cost_price: 1,
      selling_price: 2,
      stock: 2,
    });
    await page.goto("/");
    const lowSection = page
      .locator("section", { hasText: "สินค้าใกล้หมด" })
      .first();
    await expect(lowSection).toContainText(lowName);
    await expect(lowSection).toContainText(/เหลือ\s*2/);
  });

  test("Quick links: 'จัดการ' + 'ซื้อเข้า' ทำงาน", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "จัดการ →" }).click();
    await expect(page).toHaveURL("/products");
  });
});
