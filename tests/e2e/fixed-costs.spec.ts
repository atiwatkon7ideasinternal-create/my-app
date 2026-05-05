import { test, expect } from "@playwright/test";
import { tag, cleanupByTag, createFixedCostViaAPI } from "./helpers";

test.describe("ต้นทุนคงที่ — CRUD + total", () => {
  const t = tag("FC");

  test.afterAll(async ({ request }) => {
    await cleanupByTag(request, t);
  });

  test("Heading + ฟอร์ม + total card", async ({ page }) => {
    await page.goto("/fixed-costs");
    await expect(
      page.getByRole("heading", { name: "ต้นทุนคงที่", level: 1 })
    ).toBeVisible();
    await expect(page.getByText("ต้นทุนคงที่รวมทั้งหมด")).toBeVisible();
    await expect(page.getByPlaceholder("เช่น ค่าเช่าร้าน")).toBeVisible();
  });

  test("เพิ่มต้นทุนใหม่ → ปรากฏในตาราง + total เพิ่มขึ้น", async ({
    page,
    request,
  }) => {
    // อ่าน total ก่อน
    const before = await (
      await request.get("http://localhost:5001/fixed-costs")
    ).json();
    const totalBefore = before.reduce(
      (s: number, c: { amount: number }) => s + c.amount,
      0
    );

    const name = `${t} ค่าเช่าใหม่`;
    await page.goto("/fixed-costs");
    await page.getByPlaceholder("เช่น ค่าเช่าร้าน").fill(name);
    await page.locator('input[name="amount"]').fill("8500");
    await page.locator('select[name="period"]').selectOption("monthly");
    await page.getByRole("button", { name: /บันทึก/ }).click();

    const row = page.locator("tr", { hasText: name });
    await expect(row).toBeVisible();
    await expect(row).toContainText("฿8,500");
    await expect(row).toContainText("รายเดือน");

    // อ่าน total หลังเพิ่ม
    const after = await (
      await request.get("http://localhost:5001/fixed-costs")
    ).json();
    const totalAfter = after.reduce(
      (s: number, c: { amount: number }) => s + c.amount,
      0
    );
    expect(totalAfter).toBe(totalBefore + 8500);
  });

  test("Period dropdown มีครบ 4 ตัวเลือก", async ({ page }) => {
    await page.goto("/fixed-costs");
    const select = page.locator('select[name="period"]');
    const options = await select.locator("option").allTextContents();
    expect(options).toEqual(
      expect.arrayContaining(["รายเดือน", "รายปี", "รายสัปดาห์", "ครั้งเดียว"])
    );
  });

  test("ลบรายการ → หายจากตาราง", async ({ page, request }) => {
    const name = `${t} ของจะลบ`;
    await createFixedCostViaAPI(request, { name, amount: 100 });
    await page.goto("/fixed-costs");
    const row = page.locator("tr", { hasText: name });
    await expect(row).toBeVisible();
    await row.getByRole("button", { name: "ลบ" }).click();
    await expect(row).toHaveCount(0);
  });
});
