import { test, expect } from '@playwright/test';
import { installCloneApiMocks } from './fixtures/mockApi';

test.describe('Search', () => {
  test.beforeEach(async ({ page }) => {
    await installCloneApiMocks(page);
  });

  test('searches songs and albums, shows empty state, and clears query', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: 'Search' }).click();
    await expect(page).toHaveURL(/\/search$/);

    const searchInput = page.getByPlaceholder('Search songs, artists, albums…');
    await searchInput.fill('Night');

    await expect(page.getByRole('heading', { name: 'Songs' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Albums' })).toBeVisible();
    await expect(page.getByText('Night Drive')).toBeVisible();

    await searchInput.fill('NoSuchTrackXYZ');
    await expect(page.getByText('No results for "NoSuchTrackXYZ"')).toBeVisible();

    // Clear button appears next to input when query is non-empty
    await searchInput.locator('..').locator('button').click();
    await expect(searchInput).toHaveValue('');
    await expect(page.getByRole('heading', { name: 'Songs' })).toHaveCount(0);
  });
});
