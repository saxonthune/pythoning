import { expect, type Page } from '@playwright/test';

// Observe the actual CodeMirror view, without adding test globals to the app.
async function editor(page: Page, operation: string, args: any = {}) {
  return page.evaluate(async ({operation, args}) => {
    const {EditorView} = await import(/* @vite-ignore */ '/node_modules/codemirror/dist/index.js');
    const view = EditorView.findFromDOM(document.querySelector('.cm-editor')!)!;
    const doc = view.state.doc;
    switch (operation) {
      case 'cursor': {
        const pos = doc.line(args.line).from + args.column;
        view.dispatch({selection: {anchor: pos}, scrollIntoView: true}); view.focus(); break;
      }
      case 'select': view.dispatch({selection: {anchor: args.from, head: args.to}}); view.focus(); break;
      case 'word': {
        const from = doc.toString().indexOf(args.word);
        if (from < 0) throw Error(`Missing word: ${args.word}`);
        const rect = view.coordsAtPos(from + Math.floor(args.word.length / 2))!;
        return {x: rect.left + 1, y: (rect.top + rect.bottom) / 2};
      }
      case 'snapshot': return {
        text: doc.toString(),
        lines: doc.lines,
        selection: {anchor: view.state.selection.main.anchor, head: view.state.selection.main.head},
        selected: doc.sliceString(view.state.selection.main.from, view.state.selection.main.to),
        cursorLine: doc.lineAt(view.state.selection.main.head).number,
        focused: view.hasFocus,
      };
    }
  }, {operation, args});
}
export function actions(page: Page) {
  return {
    async load(slug = 'comprehensions-filter-abc') {
      await page.goto(`/microgames/${slug}`);
      await expect(page.locator('.cm-editor')).toBeVisible();
      await expect(page.locator('#round-heading')).not.toBeEmpty();
    },
    cursor: (line: number, column = 0) => editor(page, 'cursor', {line, column}),
    select: (from: number, to: number) => editor(page, 'select', {from, to}),
    async selectWord(word: string) {
      const point = await editor(page, 'word', {word});
      await page.mouse.dblclick(point.x, point.y);
    },
    async selectLine(line: number) {
      await editor(page, 'cursor', {line, column: 0});
      await page.keyboard.press('Home'); await page.keyboard.press('Shift+End');
    },
    type: (text: string) => page.keyboard.insertText(text),
    key: (key: string) => page.keyboard.press(key),
    async paste(text: string) {
      // A real paste event follows the same CM input path without OS clipboard dependencies.
      await page.locator('.cm-content').evaluate((element, text) => {
        const data = new DataTransfer(); data.setData('text/plain', text);
        element.dispatchEvent(new ClipboardEvent('paste', {clipboardData: data, bubbles: true, cancelable: true}));
      }, text);
    },
    lineHint: () => page.locator('#line-hint').click(),
    fullHint: () => page.locator('#hint-toggle').click(),
    prefill: () => page.locator('#prefill-solution').click(),
    blur: () => page.locator('#configuration-toggle').focus(),
    snapshot: () => editor(page, 'snapshot'),
    ghosts: () => page.locator('.typing-ghost').allTextContents(),
  };
}
