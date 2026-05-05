import { test, expect } from "@playwright/test";
import {
  tag,
  cleanupByTag,
  createProductViaAPI,
  createVariableCostViaAPI,
} from "./helpers";

test.describe("ต้นทุนแปรผัน — CRUD + product binding", () => {
  const t = tag("VC");

  test.afterAll(async ({ request }) => {
    await cleanupByTag(request, t);
  });

  test("Heading + ฟอร์ม", async ({ page }) => {
    await page.goto("/variable-costs");
    await expect(
      page.getByRole("heading", { name: "ต้นทุนแปรผัน", level: 1 })
    ).toBeVisible();
    await expect(page.getByPlaceholder("เช่น ค่าส่งพัสดุ")).toBeVisible();
  });

  test("เพิ่มแบบไม่ผูกสินค้า (ใช้กับทุกสินค้า) → badge สีม่วง", async ({
    page,
  }) => {
    const name = `${t} ค่าส่งทั่วไป`;
    await page.goto("/variable-costs");
    await page.getByPlaceholder("เช่น ค่าส่งพัสดุ").fill(name);
    await page.locator('input[name="amount_per_unit"]').fill("12");
    // เลือก default = ใช้กับทุกสินค้า (ไม่ต้องเปลี่ยน)
    await page.getByRole("button", { name: /บันทึก/ }).click();

    const row = page.locator("tr", { hasText: name });
    await expect(row).toBeVisible();
    await expect(row).toContainText("฿12");
    // badge สีม่วงเฉพาะ "ทุกสินค้า"
    await expect(row.locator(".bg-violet-100")).toContainText("ทุกสินค้า");
  });

  test("เพิ่มแบบผูกกับสินค้า → badge แสดงชื่อสินค้า", async ({
    page,
    request,
  }) => {
    const product = await createProductViaAPI(request, {
      name: `${t} สินค้าผูก-vc`,
      cost_price: 1,
      selling_price: 2,
      stock: 0,
    });

    const name = `${t} ค่าส่งเฉพาะสินค้า`;
    await page.goto("/variable-costs");
    await page.getByPlaceholder("เช่น ค่าส่งพัสดุ").fill(name);
    await page.locator('input[name="amount_per_unit"]').fill("7.5");
    await page
      .locator('select[name="product_id"]')
      .selectOption(String(product.id));
    await page.getByRole("button", { name: /บันทึก/ }).click();

    const row = page.locator("tr", { hasText: name });
    await expect(row).toBeVisible();
    await expect(row).toContainText("฿7.50");
    await expect(row).toContainText(`${t} สินค้าผูก-vc`);
    // badge ไม่ใช่สีม่วงเพราะผูกสินค้าจริง
    await expect(row.locator(".bg-slate-100")).toBeVisible();
  });

  test("ลบรายการ → หายจากตาราง", async ({ page, request }) => {
    const name = `${t} ของจะลบ`;
    await createVariableCostViaAPI(request, { name, amount_per_unit: 1 });
    await page.goto("/variable-costs");
    const row = page.locator("tr", { hasText: name });
    await expect(row).toBeVisible();
    await row.getByRole("button", { name: "ลบ" }).click();
    await expect(row).toHaveCount(0);
  });
});
