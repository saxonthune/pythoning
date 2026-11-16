import { test, expect } from '@playwright/test';
import { actions } from './actions';

test.beforeEach(async ({page}) => {
  page.on('pageerror', error => {throw error;});
});

test('Submit executes the real document, shows output, passes, and resets on Next Round', async ({page}) => {
  const a = actions(page); await a.load(); await a.prefill();
  await page.locator('#check-round').click();
  await expect(page.locator('#stop-round')).toBeVisible();
  await expect(page.locator('#execution-status')).toHaveText('Running…');
  await expect(page.locator('#result-label')).toHaveText('Challenge Incomplete.');
  await expect(page.locator('#execution-status')).toHaveText('Execution succeeded', {timeout:40_000});
  await expect(page.locator('#micro-output')).not.toBeEmpty();
  await expect(page.locator('#result-label')).toHaveText('Success! 🎉');
  await expect(page.locator('#skip-challenge')).toBeHidden();
  await page.locator('#next-round').click();
  await expect(page.locator('#execution-status')).toHaveText('No executions yet.');
  await expect(page.locator('#micro-output')).toBeEmpty();
  await expect(page.locator('#next-round')).toBeDisabled();
});

test('a Python failure shows a trace in execution details and leaves the challenge incomplete', async ({page}) => {
  const a = actions(page); await a.load(); await a.cursor(2); await a.type('result = 1 / 0');
  await page.locator('#check-round').click();
  await expect(page.locator('#execution-status')).toHaveText('Execution failure', {timeout:40_000});
  await expect(page.locator('#micro-output')).toContainText('ZeroDivisionError');
  await expect(page.locator('#result-label')).toHaveText('Challenge Incomplete.');
  await expect(page.locator('#next-round')).toBeDisabled();
  await expect(page.locator('#check-round')).toBeVisible();
});

test('Stop cancels a real worker; editing is blocked while running and works afterward', async ({page}) => {
  const a = actions(page); await a.load(); await a.cursor(2); await a.type('while True:\n    pass');
  const before = (await a.snapshot()).text;
  const worker = page.waitForEvent('worker');
  await page.locator('#check-round').click(); await worker;
  await page.locator('.cm-content').click(); await a.type('oops');
  expect((await a.snapshot()).text).toBe(before);
  await expect(page.locator('#prefill-solution')).toBeDisabled();
  await page.locator('#stop-round').click();
  await expect(page.locator('#micro-output')).toContainText('Execution stopped.');
  await expect(page.locator('#stop-round')).toBeHidden();
  await expect(page.locator('iframe')).toHaveCount(0);
  await a.cursor(2); await a.type('# edited\n');
  expect((await a.snapshot()).text).toContain('# edited');
});

test('the real execution deadline terminates a nonreturning worker', async ({page}) => {
  const a = actions(page); await a.load(); await a.cursor(2); await a.type('while True:\n    pass');
  await page.locator('#check-round').click();
  await expect(page.locator('#micro-output')).toContainText('Execution timed out.', {timeout:40_000});
  await expect(page.locator('#check-round')).toBeVisible();
  await expect(page.locator('iframe')).toHaveCount(0);
});
