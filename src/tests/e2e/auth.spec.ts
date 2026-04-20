import { test, expect } from '@playwright/test';

test.describe('认证流程', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test.describe('用户注册', () => {
    test('注册新用户成功', async ({ page }) => {
      await page.getByRole('link', { name: /去注册/i }).click();
      await page.getByPlaceholder('用户名').fill('testuser');
      await page.getByPlaceholder('密码').fill('password123');
      await page.getByRole('button', { name: '创建账号' }).click();

      await expect(page).toHaveURL('/');
    });

    test('注册时显示昵称输入框', async ({ page }) => {
      await page.getByRole('link', { name: /去注册/i }).click();
      await expect(page.getByPlaceholder('昵称')).toBeVisible();
    });
  });

  test.describe('用户登录', () => {
    test('使用正确凭据登录', async ({ page }) => {
      await page.getByPlaceholder('用户名').fill('testuser');
      await page.getByPlaceholder('密码').fill('password123');
      await page.getByRole('button', { name: '登录' }).click();

      await expect(page).toHaveURL('/');
    });

    test('登录失败显示错误提示', async ({ page }) => {
      await page.getByPlaceholder('用户名').fill('wronguser');
      await page.getByPlaceholder('密码').fill('wrongpassword');
      await page.getByRole('button', { name: '登录' }).click();

      await expect(page.locator('p.text-red-500')).toBeVisible();
    });
  });

  test.describe('路由保护', () => {
    test('未登录访问保护页面重定向到登录页', async ({ page }) => {
      await page.goto('/profile');
      await expect(page).toHaveURL(/\/login.*from=.*profile/);
    });

    test('未登录访问笔记页重定向到登录页', async ({ page }) => {
      await page.goto('/notes');
      await expect(page).toHaveURL(/\/login.*from=.*notes/);
    });

    test('未登录访问收藏页重定向到登录页', async ({ page }) => {
      await page.goto('/favorites');
      await expect(page).toHaveURL(/\/login.*from=.*favorites/);
    });
  });

  test.describe('切换登录/注册', () => {
    test('从登录切换到注册', async ({ page }) => {
      await page.getByRole('link', { name: /去注册/i }).click();
      await expect(page.getByText('创建账号')).toBeVisible();
      await expect(page.getByPlaceholder('昵称')).toBeVisible();
    });

    test('从注册切换回登录', async ({ page }) => {
      await page.getByRole('link', { name: /去注册/i }).click();
      await page.getByRole('link', { name: /去登录/i }).click();
      await expect(page.getByText('欢迎回来')).toBeVisible();
      await expect(page.getByPlaceholder('昵称')).not.toBeVisible();
    });
  });
});
