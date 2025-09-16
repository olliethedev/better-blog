import { expect, test } from '@playwright/test'

// These tests assume the server is started by the setup projects with baseURL set per project
// nextjs-memory -> http://localhost:3001
// nextjs-sql-pg  -> http://localhost:3002

// Helper: ensure no error dialog or error text appears on the page
async function expectNoClientError(page: import('@playwright/test').Page) {
  // Playwright will fail on console errors only if we assert; here we scan common error selectors/texts
  const errorLocators = [
    page.getByText(/application error|a client-side exception has occurred/i),
    page.locator('[data-nextjs-error]'),
  ];
  for (const l of errorLocators) {
    await expect(l).toHaveCount(0);
  }
}

test.describe('Blog routes render', () => {
  test('home (/posts) renders', async ({ page, baseURL }) => {
    await page.goto('/posts');
    await expect(page.getByRole('heading', { name: /blog posts/i })).toBeVisible();
    await expectNoClientError(page);
  });

  test('tag page (/posts/tag/react) renders', async ({ page }) => {
    await page.goto('/posts/tag/react');
    await expect(page.getByRole('heading', { name: /posts: react/i })).toBeVisible();
    await expectNoClientError(page);
  });

  test('drafts page (/posts/drafts) renders', async ({ page }) => {
    await page.goto('/posts/drafts');
    await expect(page.getByRole('heading', { name: /draft posts|my drafts/i })).toBeVisible();
    await expectNoClientError(page);
  });

  test('new post page (/posts/new) renders', async ({ page }) => {
    await page.goto('/posts/new');
    await expect(page.getByRole('heading', { name: /add new post|create new post/i })).toBeVisible();
    await expectNoClientError(page);
  });

  test('post page (/posts/hello-world) renders', async ({ page }) => {
    // Memory provider seeds a post with slug 'hello-world'
    await page.goto('/posts/hello-world');
    // Title may vary; assert absence of not-found fallback and presence of content wrapper
    await expect(page.getByText(/the post you are looking for does not exist/i)).toHaveCount(0);
    // Assert some common content elements
    await expect(page.locator('.prose')).toHaveCount(1);
    await expectNoClientError(page);
  });

  test('edit page (/posts/hello-world/edit) renders', async ({ page }) => {
    await page.goto('/posts/hello-world/edit');
    await expect(page.getByRole('heading', { name: /edit post|editing:/i })).toBeVisible();
    await expectNoClientError(page);
  });
});
