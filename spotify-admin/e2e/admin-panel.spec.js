import { test, expect } from '@playwright/test';
import { createMockJwt, installAdminApiMocks } from './fixtures/mockAdminApi';

const DUMMY_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  'base64'
);
const DUMMY_MP3 = Buffer.from('ID3dummy-mp3-data');

test.describe('Admin panel guard and catalog management', () => {
  test('enforces ADMIN role, rejects expired JWTs, and allows admin1 login', async ({ page }) => {
    await installAdminApiMocks(page);

    // Pre-seed an expired ADMIN token in localStorage
    const expiredJwt = createMockJwt('admin1', 'ADMIN', -600);
    await page.addInitScript((token) => {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({ username: 'admin1', email: 'admin1@gmail.com', role: 'ADMIN' }));
    }, expiredJwt);

    await page.goto('/admin');

    // Expired token must be cleared so login screen renders
    await expect(page.getByRole('heading', { name: 'Admin Panel Login' })).toBeVisible();

    // Non-admin user should be rejected with access denied message
    await page.getByPlaceholder('Admin Username').fill('listener1');
    await page.getByPlaceholder('Password').fill('Password123');
    await page.getByRole('button', { name: 'Log In' }).click();
    await expect(page.getByText('Access denied. You do not have ADMIN privileges.')).toBeVisible();

    // Valid ADMIN user logs in cleanly
    await page.getByPlaceholder('Admin Username').fill('admin1');
    await page.getByPlaceholder('Password').fill('admin1');
    await page.getByRole('button', { name: 'Log In' }).click();

    await expect(page.getByText('Admin Panel', { exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Add Song' })).toBeVisible();
  });

  test('validates missing files, adds and deletes songs and albums, and handles 401 expiry', async ({ page }) => {
    const { setForceUnauthorizedNext } = await installAdminApiMocks(page);

    await page.goto('/admin');
    await page.getByPlaceholder('Admin Username').fill('admin1');
    await page.getByPlaceholder('Password').fill('admin1');
    await page.getByRole('button', { name: 'Log In' }).click();

    await expect(page.getByText('Admin Panel', { exact: true })).toBeVisible();

    // Fill text inputs without selecting audio/image files -> client validation blocks submit
    await page.locator('input[placeholder="Type here"]').nth(0).fill('Uploaded Admin Track');
    await page.locator('input[placeholder="Type here"]').nth(1).fill('Admin Artist');
    await page.locator('input[type="date"]').fill('2026-03-01');
    await page.locator('input[placeholder="Type here"]').nth(2).fill('Uploaded from Playwright');
    await page.getByRole('button', { name: 'ADD' }).click();

    await expect(page.getByText('Please select both a song audio file and a cover image.')).toBeVisible();

    // Attach audio + image and submit
    await page.locator('#song').setInputFiles({ name: 'track.mp3', mimeType: 'audio/mpeg', buffer: DUMMY_MP3 });
    await page.locator('#image').setInputFiles({ name: 'cover.png', mimeType: 'image/png', buffer: DUMMY_PNG });
    await page.getByRole('button', { name: 'ADD' }).click();

    await expect(page.getByText('Song Added')).toBeVisible();

    // Verify new song appears in List Songs and delete it
    await page.getByRole('link', { name: 'List Songs' }).click();
    await expect(page).toHaveURL(/\/admin\/list-songs$/);
    await expect(page.getByText('Uploaded Admin Track')).toBeVisible();

    const uploadedRow = page.locator('div', { hasText: 'Uploaded Admin Track' }).filter({ hasText: 'Admin Artist' }).last();
    await uploadedRow.getByText('x', { exact: true }).click();
    await expect(page.getByText('Song Remove')).toBeVisible();
    await expect(page.getByText('Uploaded Admin Track')).toHaveCount(0);

    // Add Album and delete it in List Album
    await page.getByRole('link', { name: 'Add Album' }).click();
    await expect(page).toHaveURL(/\/admin\/add-album$/);
    await page.locator('#image').setInputFiles({ name: 'album.png', mimeType: 'image/png', buffer: DUMMY_PNG });
    await page.locator('input[placeholder="Type here"]').nth(0).fill('Uploaded Album');
    await page.locator('input[placeholder="Type here"]').nth(1).fill('Uploaded album desc');
    await page.locator('input[placeholder="Type here"]').nth(2).fill('None');
    await page.locator('input[type="date"]').fill('2026-03-01');
    await page.getByRole('button', { name: 'ADD' }).click();

    await expect(page.getByText('Album Added')).toBeVisible();

    await page.getByRole('link', { name: 'List Album' }).click();
    await expect(page).toHaveURL(/\/admin\/list-albums$/);
    await expect(page.getByText('Uploaded Album', { exact: true })).toBeVisible();

    const albumRow = page.locator('div', { hasText: 'Uploaded Album' }).filter({ hasText: 'Uploaded album desc' }).last();
    await albumRow.getByText('x', { exact: true }).click();
    await expect(page.getByText('Album and its songs removed')).toBeVisible();
    await expect(page.getByText('Uploaded Album', { exact: true })).toHaveCount(0);

    // Simulate backend 401 on next delete -> AdminGuard clears session & returns to login form
    setForceUnauthorizedNext(true);
    const seedAlbumRow = page.locator('div', { hasText: 'Seed Album' }).filter({ hasText: 'Initial album' }).last();
    await seedAlbumRow.getByText('x', { exact: true }).click();

    await expect(page.getByRole('heading', { name: 'Admin Panel Login' })).toBeVisible();
    await expect(page.getByText('Your session expired or is unauthorized. Please log in again.')).toBeVisible();
  });
});
