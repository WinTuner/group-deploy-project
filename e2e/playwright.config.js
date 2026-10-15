const { defineConfig } = require('@playwright/test');

// ยิงผ่าน nginx gateway ทางเดียว (default :80); เปลี่ยนผ่าน BASE_URL ได้
const BASE_URL = process.env.BASE_URL || 'http://localhost:80';

module.exports = defineConfig({
  testDir: '.',
  testMatch: '*.spec.js',
  timeout: 30000,
  retries: process.env.CI ? 2 : 0,
  use: { baseURL: BASE_URL },
});
