import { test, expect } from "@playwright/test";
import { tag, cleanupByTag, createProductViaAPI } from "./helpers";

test.describe("หน้าสินค้า — CRUD + การแสดงผล", () => {
  const t = tag("PROD");

  test.afterAll(async ({ request }) => {
    await cleanupByTag(request, t);
  });

  test("หน้าโหลดได้และแสดง heading + ฟอร์มเพิ่มสินค้า", async ({ page }) => {
    await page.goto("/products");
    await expect(
      page.getByRole("heading", { name: "จัดการสินค้า" })
    ).toBeVisible();
    await expect(page.getByPlaceholder("เช่น เสื้อยืด")).toBeVisible();
    await expect(page.getByRole("button", { name: /บันทึกสินค้า/ })).toBeVisible();
  });

  test("เพิ่มสินค้าใหม่ → ปรากฏในตารางพร้อมราคา/สต็อก/มาร์จิน", async ({ page }) => {
    const productName = `${t} เสื้อยืด-A`;

    await page.goto("/products");
    await page.getByPlaceholder("เช่น เสื้อยืด").fill(productName);
    await page.getByPlaceholder("SKU-001").fill(`${t}-SKU-A`);
    await page.locator('input[name="cost_price"]').fill("100");
    await page.locator('input[name="selling_price"]').fill("250");
    await page.locator('input[name="stock"]').fill("20");
    await page.getByRole("button", { name: /บันทึกสินค้า/ }).click();

    const row = page.locator("tr", { hasText: productName });
    await expect(row).toBeVisible();
    await expect(row).toContainText(`${t}-SKU-A`);
    await expect(row).toContainText("฿100");
    await expect(row).toContainText("฿250");
    // margin = (250-100)/250 = 60%
    await expect(row).toContainText(/60\s*%/);
    // stock cell = 20 (filter to the .text-slate-700 span used for non-low stock)
    await expect(row.locator(".text-slate-700").first()).toHaveText("20");
  });

  test("Validation: ชื่อว่าง → ฟอร์มไม่ submit (HTML5 required)", async ({
    page,
  }) => {
    await page.goto("/products");
    const initialUrl = page.url();
    // เว้นชื่อ กรอกแค่ราคา
    await page.locator('input[name="cost_price"]').fill("50");
    await page.locator('input[name="selling_price"]').fill("80");
    await page.getByRole("button", { name: /บันทึกสินค้า/ }).click();
    // URL ไม่เปลี่ยน + name input ต้อง invalid
    await page.waitForTimeout(300);
    expect(page.url()).toBe(initialUrl);
    const validity = await page
      .getByPlaceholder("เช่น เสื้อยืด")
      .evaluate((el: HTMLInputElement) => el.validity.valueMissing);
    expect(validity).toBe(true);
  });

  test("สินค้าสต็อก ≤ 5 ต้องโชว์เป็นตัวเลขสีแดง (low stock indicator)", async ({
    page,
    request,
  }) => {
    const lowName = `${t} สต็อกใกล้หมด`;
    await createProductViaAPI(request, {
      name: lowName,
      cost_price: 10,
      selling_price: 30,
      stock: 3,
    });

    await page.goto("/products");
    const row = page.locator("tr", { hasText: lowName });
    const stockCell = row.locator(".text-rose-600");
    await expect(stockCell).toContainText(/\b3\b/);
  });

  test("ลบสินค้า → หายจากตาราง", async ({ page, request }) => {
    const delName = `${t} ของจะลบ`;
    await createProductViaAPI(request, {
      name: delName,
      cost_price: 1,
      selling_price: 2,
      stock: 1,
    });

    await page.goto("/products");
    const row = page.locator("tr", { hasText: delName });
    await expect(row).toBeVisible();
    await row.getByRole("button", { name: "ลบ" }).click();
    await expect(row).toHaveCount(0);
  });

  test("Margin เป็นลบ → badge แสดงสีแดง (selling < cost)", async ({
    page,
    request,
  }) => {
    const lossName = `${t} ขาดทุน`;
    await createProductViaAPI(request, {
      name: lossName,
      cost_price: 100,
      selling_price: 80, // ตั้งราคาขายต่ำกว่าทุน
      stock: 5,
    });
    await page.goto("/products");
    const row = page.locator("tr", { hasText: lossName });
    const marginBadge = row.locator(".bg-rose-50");
    await expect(marginBadge).toBeVisible();
    await expect(marginBadge).toContainText("-฿20");
  });
});
