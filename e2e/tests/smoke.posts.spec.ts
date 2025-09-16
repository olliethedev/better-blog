import { expect, test } from '@playwright/test';

test('posts page renders', async ({ page }) => {
  await page.goto('/posts');
  await expect(page.getByRole('heading', { name: /blog posts/i })).toBeVisible();
});


