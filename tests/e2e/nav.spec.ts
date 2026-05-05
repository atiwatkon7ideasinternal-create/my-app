import { test, expect } from "@playwright/test";

const links = [
  { href: "/", label: "ภาพรวม" },
  { href: "/products", label: "สินค้า" },
  { href: "/purchases", label: "ซื้อเข้า" },
  { href: "/sales", label: "ขายออก" },
  { href: "/fixed-costs", label: "ต้นทุนคงที่" },
  { href: "/variable-costs", label: "ต้นทุนแปรผัน" },
  { href: "/break-even", label: "จุดคุ้มทุน" },
];

test.describe("Navigation — ลิงก์ทุกหน้าใช้งานได้ + active state", () => {
  test("nav แสดงลิงก์ครบทุกอัน", async ({ page }) => {
    await page.goto("/");
    const nav = page.locator("nav");
    for (const l of links) {
      await expect(
        nav.getByRole("link", { name: new RegExp(l.label) })
      ).toBeVisible();
    }
  });

  test("คลิกแต่ละลิงก์แล้วไปถึงหน้าที่ถูกต้อง + active state ถูกไฮไลต์", async ({
    page,
  }) => {
    await page.goto("/");

    const nav = page.locator("nav");
    for (const l of links.slice(1)) {
      await nav.getByRole("link", { name: new RegExp(l.label) }).click();
      await expect(page).toHaveURL(l.href);
      // Active link ต้องมี class bg-white (จาก Nav.tsx)
      const activeLink = nav
        .locator(`a[href="${l.href}"]`)
        .filter({ hasText: l.label });
      await expect(activeLink.first()).toHaveClass(/bg-white/);
    }
  });

  test("Footer แสดงปี ค.ศ.", async ({ page }) => {
    await page.goto("/");
    const year = new Date().getFullYear();
    await expect(page.locator("footer")).toContainText(String(year));
  });
});
