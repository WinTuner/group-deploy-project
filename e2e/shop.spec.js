// E2E-02: โฟลว์ผู้ใช้จริงบน browser (ผ่าน gateway :80)
const { test, expect } = require('@playwright/test');

test('เปิดหน้าแรกเจอเว็บ', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/.*.+/);
});

test('login ด้วย admin/password123 แล้วเข้า dashboard', async ({ page }) => {
  await page.goto('/login');
  await page.fill('#username', 'admin');
  await page.fill('#password', 'password123');
  await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click();
  await expect(page.getByRole('status')).toContainText('✅', { timeout: 10000 });
  await page.waitForURL('**/dashboard', { timeout: 15000 });
});

test('login รหัสผิดโชว์ error', async ({ page }) => {
  await page.goto('/login');
  await page.fill('#username', 'admin');
  await page.fill('#password', 'wrong');
  await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click();
  await expect(page.getByRole('status')).toContainText('❌', { timeout: 10000 });
});

test('หน้า products โชว์สินค้า (รอ ISR ไม่เกิน ~40 วิ)', async ({ page }) => {
  await page.goto('/products');
  await expect(page.getByRole('heading', { name: 'รายการสินค้า' })).toBeVisible();
  // prerender ตอน build อาจ cache หน้าว่างไว้ รอ regenerate แล้วโหลดใหม่
  for (let i = 0; i < 3; i++) {
    if (await page.getByText('Keyboard').first().isVisible().catch(() => false)) break;
    await page.waitForTimeout(16000);
    await page.reload();
  }
  await expect(page.getByText('Keyboard').first()).toBeVisible({ timeout: 10000 });
});
