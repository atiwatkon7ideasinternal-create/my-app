import { test, expect } from "@playwright/test";
import {
  tag,
  cleanupByTag,
  createProductViaAPI,
  createPurchaseViaAPI,
  getProductViaAPI,
} from "./helpers";

test.describe("หน้าซื้อเข้า — บันทึกซื้อ + เพิ่มสต็อก", () => {
  const t = tag("PURCH");
  let productId: number;
  const productName = `${t} วัตถุดิบ-A`;

  test.beforeAll(async ({ request }) => {
    const p = await createProductViaAPI(request, {
      name: productName,
      cost_price: 30,
      selling_price: 50,
      stock: 5,
    });
    productId = p.id;
  });

  test.afterAll(async ({ request }) => {
    await cleanupByTag(request, t);
  });

  test("Heading + 2 stat cards", async ({ page }) => {
    await page.goto("/purchases");
    await expect(
      page.getByRole("heading", { name: /บันทึกการซื้อสินค้าเข้า/ })
    ).toBeVisible();
    await expect(page.getByText("รายการซื้อทั้งหมด")).toBeVisible();
    await expect(page.getByText("เงินที่ใช้ซื้อสินค้ารวม")).toBeVisible();
  });

  test("ซื้อเข้า 10 ชิ้น × 25 บาท → สต็อกเพิ่ม 10, total = 250, cost_price อัปเดต", async ({
    page,
    request,
  }) => {
    const before = await getProductViaAPI(request, productId);

    await page.goto("/purchases");
    await page
      .locator('select[name="product_id"]')
      .selectOption(String(productId));
    await page.locator('input[name="quantity"]').fill("10");
    await page.locator('input[name="unit_cost"]').fill("25");
    await page.getByRole("button", { name: /บันทึกซื้อเข้า/ }).click();

    // row appears
    const row = page.locator("tr", { hasText: productName }).first();
    await expect(row).toBeVisible();
    await expect(row).toContainText("฿250"); // total = 10 * 25
    await expect(row).toContainText("฿25"); // unit cost

    // backend: stock += 10, cost_price = 25 (ตาม logic ของ purchase route)
    const after = await getProductViaAPI(request, productId);
    expect(after.stock).toBe(before.stock + 10);
    expect(after.cost_price).toBe(25);
  });

  test("ลบรายการซื้อ → สต็อกลดกลับ", async ({ page, request }) => {
    // สร้างของใหม่เพื่อแยกออกจากของอื่น
    const product = await createProductViaAPI(request, {
      name: `${t} reverse-purchase`,
      cost_price: 5,
      selling_price: 10,
      stock: 0,
    });
    await createPurchaseViaAPI(request, {
      product_id: product.id,
      quantity: 8,
      unit_cost: 5,
    });
    let p = await getProductViaAPI(request, product.id);
    expect(p.stock).toBe(8);

    await page.goto("/purchases");
    const row = page
      .locator("tr", { hasText: `${t} reverse-purchase` })
      .first();
    await row.getByRole("button", { name: "ลบ" }).click();
    await expect(row).toHaveCount(0);

    p = await getProductViaAPI(request, product.id);
    expect(p.stock).toBe(0);
  });

  test("ฟอร์มซื้อต้อง require ทุกช่อง (HTML5 validation)", async ({ page }) => {
    await page.goto("/purchases");
    const qty = page.locator('input[name="quantity"]');
    const cost = page.locator('input[name="unit_cost"]');
    await expect(qty).toHaveAttribute("required", "");
    await expect(cost).toHaveAttribute("required", "");
  });
});
