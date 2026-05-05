import { test, expect } from "@playwright/test";
import { tag, cleanupByTag, createProductViaAPI } from "./helpers";

test.describe("Sales flow — stock decreases, profit calculated", () => {
  const t = tag("SALE");
  const productName = `${t} กระเป๋าทดสอบ`;
  let productId: number;

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

  test("ขายสินค้า → สต็อกลด + กำไรถูกต้อง + ปรากฏใน Dashboard", async ({
    page,
  }) => {
    await page.goto("/sales");

    await page
      .locator('select[name="product_id"]')
      .selectOption(String(productId));
    await page.locator('input[name="quantity"]').fill("3");
    await page.locator('input[name="unit_price"]').fill("250");
    await page.getByRole("button", { name: /บันทึกขาย/ }).click();

    // Sales row appears with correct profit: (250 - 100) * 3 = 450
    const row = page.locator("tr", { hasText: productName }).first();
    await expect(row).toBeVisible();
    await expect(row).toContainText("฿450"); // profit cell
    await expect(row).toContainText("฿750"); // total = 250*3

    // Stock should now be 10 - 3 = 7 — verify on products page
    await page.goto("/products");
    const productRow = page.locator("tr", { hasText: productName });
    await expect(productRow).toContainText(/^.*7.*$/);
  });

  test("ขายเกินสต็อก → backend ปฏิเสธ ฟอร์มไม่บันทึก", async ({ page }) => {
    await page.goto("/sales");

    await page
      .locator('select[name="product_id"]')
      .selectOption(String(productId));
    // มีของ 7 ขอขาย 999
    await page.locator('input[name="quantity"]').fill("999");
    await page.locator('input[name="unit_price"]').fill("250");

    // Server action จะโยน Error → Next.js แสดง error overlay (dev) หรือ error page
    // เราแค่ตรวจว่าไม่มีรายการขายจำนวน 999 ในตาราง
    await page
      .getByRole("button", { name: /บันทึกขาย/ })
      .click()
      .catch(() => {});

    // Wait briefly then assert no row with quantity 999 for our product
    await page.waitForTimeout(800);
    const badRow = page.locator("tr", { hasText: productName }).filter({
      hasText: " 999 ",
    });
    expect(await badRow.count()).toBe(0);
  });
});
