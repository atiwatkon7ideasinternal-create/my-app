import { test, expect } from "@playwright/test";
import { tag, cleanupByTag } from "./helpers";

test.describe("Products page", () => {
  const t = tag("PROD");
  const productName = `${t} เสื้อยืดทดสอบ`;

  test.afterAll(async ({ request }) => {
    await cleanupByTag(request, t);
  });

  test("เพิ่มสินค้าใหม่ผ่านฟอร์ม → ปรากฏในตาราง", async ({ page }) => {
    await page.goto("/products");
    await expect(
      page.getByRole("heading", { name: "จัดการสินค้า" })
    ).toBeVisible();

    await page.getByPlaceholder("เช่น เสื้อยืด").fill(productName);
    await page.getByPlaceholder("SKU-001").fill(`${t}-SKU`);
    await page.locator('input[name="cost_price"]').fill("100");
    await page.locator('input[name="selling_price"]').fill("250");
    await page.locator('input[name="stock"]').fill("20");

    await page.getByRole("button", { name: /บันทึกสินค้า/ }).click();

    // After server action + revalidate, page re-renders with the new row
    const row = page.locator("tr", { hasText: productName });
    await expect(row).toBeVisible();
    await expect(row).toContainText("฿100"); // cost
    await expect(row).toContainText("฿250"); // selling
    // margin = 150 (60%)
    await expect(row).toContainText(/60%/);
  });

  test("ลบสินค้า → หายจากตาราง", async ({ page }) => {
    await page.goto("/products");
    const row = page.locator("tr", { hasText: productName });
    await expect(row).toBeVisible();

    await row.getByRole("button", { name: "ลบ" }).click();
    await expect(row).toHaveCount(0);
  });
});
