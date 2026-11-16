import { test, expect } from '@playwright/test';
import { actions } from './actions';

test.beforeEach(async ({page}) => {
  page.on('pageerror', error => { throw error; });
});

test('new challenges reset assistance, document, cursor, and history', async ({page}) => {
  const a = actions(page); await a.load();
  await expect(page.locator('.cm-line').first()).toHaveClass(/cm-activeLine/);
  expect((await a.snapshot()).cursorLine).toBe(1);
  await a.fullHint(); await a.prefill();
  await page.locator('#skip-challenge').click();
  await expect(page.locator('#hint-toggle')).toHaveAttribute('aria-pressed','false');
  expect(await a.ghosts()).toEqual([]);
  expect((await a.snapshot()).cursorLine).toBe(1);
  const fresh = (await a.snapshot()).text;
  await a.key('ControlOrMeta+z');
  expect((await a.snapshot()).text).toBe(fresh);
  await expect(page.locator('#execution-status')).toHaveText('No executions yet.');
  await expect(page.locator('#next-round')).toBeDisabled();
});

for (const blur of [false, true]) {
  test(`line hint: type, select word, ${blur ? 'blur, ' : ''}correct mismatch, leave and return`, async ({page}) => {
    const a = actions(page); await a.load(); await a.cursor(2); await a.lineHint();
    expect(await a.ghosts()).toHaveLength(1);
    await a.type('result = '); expect((await a.ghosts())[0]).toMatch(/^\[/);
    await a.type('wrong'); expect(await a.ghosts()).toEqual([]);
    await a.selectWord('wrong'); expect((await a.snapshot()).selected).toBe('wrong');
    if (blur) {
      const selection = (await a.snapshot()).selection;
      await a.blur(); expect((await a.snapshot()).selection).toEqual(selection);
      // Restore the exact selection without a focus-driven cursor relocation.
      await a.select(selection.anchor, selection.head);
    }
    await a.key('Backspace'); expect(await a.ghosts()).toHaveLength(1);
    await a.key('ArrowDown'); expect(await a.ghosts()).toEqual([]);
    await a.key('ArrowUp'); expect(await a.ghosts()).toEqual([]);
  });
}

test('same-line selection and blur preserve a line hint; Enter and undo do not resurrect it', async ({page}) => {
  const a = actions(page); await a.load(); await a.cursor(2); await a.type('result');
  await a.lineHint(); await a.selectLine(2);
  expect((await a.snapshot()).selected).toBe('result'); expect(await a.ghosts()).toHaveLength(1);
  await a.blur(); expect(await a.ghosts()).toHaveLength(1);
  await a.cursor(2,6); await a.key('Enter'); expect(await a.ghosts()).toEqual([]);
  await a.key('ControlOrMeta+z'); expect(await a.ghosts()).toEqual([]);
});

test('full hint survives line movement, respects divergent lines, and toggles without editing', async ({page}) => {
  const a = actions(page); await a.load('classes-regular-abc'); await a.fullHint();
  const before = (await a.snapshot()).text;
  expect((await a.ghosts()).length).toBeGreaterThan(3);
  await a.cursor(1); await a.type('wrong');
  expect((await a.ghosts()).some(text=>text.startsWith('class '))).toBe(false);
  expect((await a.ghosts()).some(text=>text.includes('self.name'))).toBe(true);
  await a.cursor(2); await a.fullHint(); expect(await a.ghosts()).toEqual([]);
  expect((await a.snapshot()).text).toBe('wrong'+before);
});

test('line hint and full hint can overlap; leaving the line clears only the line hint', async ({page}) => {
  const a = actions(page); await a.load(); await a.cursor(2); await a.lineHint(); await a.fullHint();
  await a.cursor(3); await a.fullHint(); expect(await a.ghosts()).toEqual([]);
  await a.cursor(2); expect(await a.ghosts()).toEqual([]);
});

test('typing, deletion and paste cannot modify fixed code or remove the final editable line', async ({page}) => {
  const a = actions(page); await a.load(); const before = await a.snapshot();
  await a.cursor(1); await a.type('oops'); expect((await a.snapshot()).text).toBe(before.text);
  await a.key('ControlOrMeta+a'); await a.key('Backspace'); expect((await a.snapshot()).text).toBe(before.text);
  await a.type('replacement'); expect((await a.snapshot()).text).toBe(before.text);
  const from = before.text.indexOf('\n')+1, to = before.text.lastIndexOf('\n');
  await a.select(from,to); await a.key('Backspace');
  const minimum = (await a.snapshot()).text; expect(minimum.split('\n')).toHaveLength(3);
  await a.key('Backspace'); expect((await a.snapshot()).text).toBe(minimum);
  await a.cursor(2); await a.paste('result = []\n# second line');
  expect((await a.snapshot()).text).toContain('result = []\n# second line');
  await a.key('ControlOrMeta+z'); expect((await a.snapshot()).text).toBe(minimum);
  await a.key(process.platform === 'darwin' ? 'Meta+Shift+z' : 'Control+y'); expect((await a.snapshot()).text).toContain('# second line');
});

for (const theme of ['light','dark']) {
  test(`${theme}: native selection is visible, immutable gutter matches, no autocomplete`, async ({page}) => {
    const a = actions(page); await a.load();
    await page.evaluate(theme=>document.documentElement.dataset.theme=theme,theme);
    await a.cursor(2); await a.type('where'); await a.selectWord('where');
    expect((await a.snapshot()).selected).toBe('where');
    const selection = await page.locator('.cm-line').nth(1).evaluate(el=>getComputedStyle(el,'::selection').backgroundColor);
    const background = await page.locator('.cm-activeLine').evaluate(el=>getComputedStyle(el).backgroundColor);
    expect(selection).not.toBe('rgba(0, 0, 0, 0)'); expect(selection).not.toBe(background);
    const fixed = await page.locator('.cm-fixed-code').first().evaluate(el=>getComputedStyle(el).backgroundColor);
    expect(await page.locator('.cm-fixed-code-gutter').first().evaluate(el=>getComputedStyle(el).backgroundColor)).toBe(fixed);
    await a.key('ArrowRight'); await a.type('prin');
    await expect(page.locator('.cm-tooltip-autocomplete')).toHaveCount(0);
    await a.key('Enter'); expect((await a.snapshot()).cursorLine).toBe(3);
  });
}

test('header rows, configuration chevrons and Try Now work at a narrow width', async ({page}) => {
  const a = actions(page); await page.setViewportSize({width:390,height:844}); await a.load();
  await expect(page.locator('.help-row button')).toHaveText(['Line Hint','Full Hint','Prefill Solution']);
  await page.locator('#configuration-toggle').click();
  await page.getByRole('button',{name:'Collapse Strings',exact:true}).click();
  await expect(page.locator('#challenge-group-strings')).toBeHidden();
  await page.getByRole('button',{name:'Expand Strings',exact:true}).click();
  await page.getByRole('link',{name:'Try Now: Strip Whitespace',exact:true}).click();
  await expect(page).toHaveURL(/strings-strip-[a-z0-9]+$/);
  await expect(page.locator('#config-editor')).toBeHidden();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth > innerWidth)).toBe(false);
});
