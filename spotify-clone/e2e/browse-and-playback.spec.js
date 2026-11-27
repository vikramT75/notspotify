import { test, expect } from '@playwright/test';
import { installCloneApiMocks } from './fixtures/mockApi';

test.describe('Browse and audio playback', () => {
  test.beforeEach(async ({ page }) => {
    await installCloneApiMocks(page);
  });

  test('renders albums and songs on home and prunes stale recently played tracks', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        'recentSongs',
        JSON.stringify([
          {
            _id: 'deleted-song-id',
            name: 'Invincible',
            artistName: 'DEAF KEV',
            image: '/next.svg',
            file: '/song1.mp3',
          },
        ])
      );
    });

    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'Charts' })).toBeVisible();
    await expect(page.getByRole('heading', { name: "Today's Hits" })).toBeVisible();
    await expect(page.getByText('Night Drive')).toBeVisible();
    await expect(page.getByText('Midnight Signal').first()).toBeVisible();

    // Deleted / stale track from localStorage should be pruned instead of rendering unplayable card
    await expect(page.getByText('Invincible')).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Recently Played' })).toHaveCount(0);
  });

  test('navigates to album and artist detail pages', async ({ page }) => {
    await page.goto('/');

    await page.getByText('Night Drive').click();
    await expect(page).toHaveURL(/\/album\/album-1$/);
    await expect(page.getByRole('heading', { name: 'Night Drive' })).toBeVisible();
    await expect(page.getByText('Midnight Signal').first()).toBeVisible();
    await expect(page.getByText('Neon Horizon')).toBeVisible();

    await page.getByRole('button', { name: 'Home' }).click();
    await expect(page).toHaveURL(/\/$/);

    await page.getByText('Neon Pulse').first().click();
    await expect(page).toHaveURL(/\/artist\/Neon%20Pulse$/);
    await expect(page.getByRole('heading', { name: 'Neon Pulse' })).toBeVisible();
    await expect(page.getByText('Midnight Signal').first()).toBeVisible();
    await expect(page.getByText('Starlight Drift')).toBeVisible();
  });

  test('plays tracks, records recentSongs, and switches with next and previous controls', async ({ page }) => {
    await page.goto('/');

    const audio = page.locator('audio');
    await expect(audio).toHaveAttribute('src', '/song1.mp3');

    await page.getByText('Midnight Signal').first().click();
    await expect(audio).toHaveAttribute('src', '/song1.mp3');

    const recent = await page.evaluate(() => JSON.parse(localStorage.getItem('recentSongs') || '[]'));
    expect(recent.length).toBeGreaterThan(0);
    expect(recent[0].name).toBe('Midnight Signal');

    await page.getByRole('button', { name: 'Next' }).click();
    await expect(audio).toHaveAttribute('src', '/song2.mp3');
    await expect(page.locator('p', { hasText: 'Neon Horizon' }).last()).toBeVisible();

    await page.getByRole('button', { name: 'Previous' }).click();
    await expect(audio).toHaveAttribute('src', '/song1.mp3');
  });
});
