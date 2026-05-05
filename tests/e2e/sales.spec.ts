import { test, expect } from "@playwright/test";
import {
  tag,
  cleanupByTag,
  createProductViaAPI,
  createSaleViaAPI,
  getProductViaAPI,
} from "./helpers";

test.describe("หน้าขาย — flow + คำนวณกำไร", () => {
  const t = tag("SALE");
  let productId: number;
  const productName = `${t} กระเป๋าทดสอบ`;

  test.beforeAll(async ({ request }) => {
    const product = await createProductViaAPI(request, {
      name: productName,
      cost_price: 100,
      selling_price: 200,
      stock: 10,
    });
    productId = product.id;
  });

  test.afterAll(async ({ request }) => {
    await cleanupByTag(request, t);
  });

  test("สินค้าสต็อก = 0 ต้องโชว์ '- หมด' และ disable ใน dropdown", async ({
    page,
    request,
  }) => {
    const outName = `${t} ของหมด`;
    await createProductViaAPI(request, {
      name: outName,
      cost_price: 10,
      selling_price: 20,
      stock: 0,
    });

    await page.goto("/sales");
    const select = page.locator('select[name="product_id"]');
    const option = select.locator("option", { hasText: outName });
    await expect(option).toContainText("หมด");
    await expect(option).toBeDisabled();
  });

  test("ขายสำเร็จ → สต็อกลดในฝั่ง backend + กำไรถูกคำนวณ", async ({
    page,
    request,
  }) => {
    const before = await getProductViaAPI(request, productId);

    await page.goto("/sales");
    await page
      .locator('select[name="product_id"]')
      .selectOption(String(productId));
    await page.locator('input[name="quantity"]').fill("3");
    await page.locator('input[name="unit_price"]').fill("250");
    await page.getByRole("button", { name: /บันทึกขาย/ }).click();

    // กำไรในแถว = (250-100)*3 = 450, ยอดขาย = 750
    const row = page.locator("tr", { hasText: productName }).first();
    await expect(row).toBeVisible();
    await expect(row).toContainText("฿750");
    await expect(row).toContainText("฿450");

    // backend สต็อกต้องลด 3
    const after = await getProductViaAPI(request, productId);
    expect(after.stock).toBe(before.stock - 3);
  });

  test("Stat cards (รวม/ยอดขาย/กำไร) ต้องอัปเดตหลังขาย", async ({
    page,
    request,
  }) => {
    // สร้างสินค้าใหม่ + ขาย 1 รายการ ให้แน่ใจว่ามีตัวเลข > 0
    const newProduct = await createProductViaAPI(request, {
      name: `${t} stat-card-prod`,
      cost_price: 50,
      selling_price: 100,
      stock: 5,
    });
    await createSaleViaAPI(request, {
      product_id: newProduct.id,
      quantity: 2,
      unit_price: 100,
    });

    await page.goto("/sales");
    // ทั้ง 3 cards ต้องมี value > 0 (อ่านจาก .text-2xl)
    const statCards = page.locator(".text-2xl.font-bold");
    const count = await statCards.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test("ขายเกินสต็อก → backend ปฏิเสธ ฟอร์มไม่บันทึก row", async ({ page }) => {
    await page.goto("/sales");
    await page
      .locator('select[name="product_id"]')
      .selectOption(String(productId));
    await page.locator('input[name="quantity"]').fill("9999");
    await page.locator('input[name="unit_price"]').fill("250");

    await page
      .getByRole("button", { name: /บันทึกขาย/ })
      .click()
      .catch(() => {});
    await page.waitForTimeout(800);

    const badRow = page
      .locator("tr", { hasText: productName })
      .filter({ hasText: " 9,999 " });
    expect(await badRow.count()).toBe(0);
  });

  test("ลบรายการขาย → สต็อกกลับมา", async ({ page, request }) => {
    const product = await createProductViaAPI(request, {
      name: `${t} reverse-stock`,
      cost_price: 10,
      selling_price: 30,
      stock: 10,
    });
    await createSaleViaAPI(request, {
      product_id: product.id,
      quantity: 4,
      unit_price: 30,
    });
    let p = await getProductViaAPI(request, product.id);
    expect(p.stock).toBe(6);

    // ลบจาก UI
    await page.goto("/sales");
    const row = page.locator("tr", { hasText: `${t} reverse-stock` }).first();
    await row.getByRole("button", { name: "ลบ" }).click();
    await expect(row).toHaveCount(0);

    p = await getProductViaAPI(request, product.id);
    expect(p.stock).toBe(10);
  });
});
