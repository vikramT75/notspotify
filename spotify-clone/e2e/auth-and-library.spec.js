import { test, expect } from '@playwright/test';
import { installCloneApiMocks } from './fixtures/mockApi';

test.describe('Authentication, liked songs, and playlists', () => {
  test.beforeEach(async ({ page }) => {
    await installCloneApiMocks(page);
  });

  test('validates phone-like passwords on signup and switches to login after registration', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: 'Sign up' }).click();
    await expect(page.getByRole('heading', { name: 'Sign up to start listening' })).toBeVisible();

    await page.locator('form input[type="email"]').fill('newuser@example.com');
    await page.locator('form input[type="text"]').fill('newuser');
    await page.locator('form input[type="password"]').fill('9876543210');
    await page.locator('form button[type="submit"]').click();

    await expect(page.getByText('Password cannot contain a phone number.')).toBeVisible();

    await page.locator('form input[type="password"]').fill('SafePass123');
    await page.locator('form button[type="submit"]').click();

    await expect(page.getByRole('heading', { name: 'Log in to NotSpotify' })).toBeVisible();
    await expect(page.getByText('Signup successful! Please log in.')).toBeVisible();
  });

  test('supports login, liking songs, creating and managing playlists, and logout', async ({ page }) => {
    await page.goto('/');

    // Log in via modal (AuthContext triggers window.location.reload())
    await page.getByRole('button', { name: 'Log in' }).click();
    await page.locator('form input[type="text"]').fill('listener1');
    await page.locator('form input[type="password"]').fill('Password123');
    await Promise.all([
      page.waitForEvent('load'),
      page.locator('form button[type="submit"]').click(),
    ]);

    await expect(page.getByText('listener1')).toBeVisible();
    await expect(page.getByRole('button', { name: /Liked Songs/i })).toBeVisible();

    // Like first song and verify in /liked-songs
    await Promise.all([
      page.waitForResponse((res) => res.url().includes('/api/user/like-song') && res.status() === 200),
      page.getByRole('button', { name: 'Like', exact: true }).first().click(),
    ]);
    await expect(page.getByRole('button', { name: 'Unlike', exact: true }).first()).toBeVisible();

    await page.getByRole('button', { name: /Liked Songs/i }).click();
    await expect(page).toHaveURL(/\/liked-songs$/);
    await expect(page.getByText('Midnight Signal').first()).toBeVisible();

    // Unlike song
    await Promise.all([
      page.waitForResponse((res) => res.url().includes('/api/user/unlike-song') && res.status() === 200),
      page.getByRole('button', { name: 'Unlike', exact: true }).first().click(),
    ]);
    await expect(page.getByText('No liked songs yet.')).toBeVisible();

    // Create a playlist via window.prompt dialog
    page.once('dialog', (dialog) => dialog.accept('Workout Mix'));
    await page.getByRole('button', { name: 'Home' }).click();
    await page.locator('button[title="New playlist"]').click();
    await expect(page.getByRole('button', { name: /Workout Mix/i })).toBeVisible();

    // Add active track to the playlist from Player bar
    await page.getByRole('button', { name: 'Add to playlist' }).click();
    await page.locator('div.absolute button', { hasText: 'Workout Mix' }).click();

    // Open playlist page and verify track is listed, then remove it
    await page.getByRole('button', { name: /Workout Mix/i }).click();
    await expect(page).toHaveURL(/\/playlist\/playlist-1$/);
    await expect(page.getByText('Midnight Signal').first()).toBeVisible();

    await page.getByRole('button', { name: 'Remove' }).first().click({ force: true });
    await expect(page.getByText('This playlist is empty.')).toBeVisible();

    // Log out and verify localStorage session is cleared
    await page.locator('div.cursor-pointer', { hasText: 'listener1' }).click();
    await Promise.all([
      page.waitForEvent('load'),
      page.getByRole('button', { name: 'Log out' }).click(),
    ]);

    const storedToken = await page.evaluate(() => localStorage.getItem('token'));
    expect(storedToken).toBeNull();
    await expect(page.getByRole('button', { name: 'Log in' })).toBeVisible();
  });
});
