import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const origin = process.argv[2];
if (!origin) throw Error('Usage: node web/tests/production-routes.mjs <site-origin>');
const {version} = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
// Exercise actual Pages routing, not Astro's separate development middleware.
for (const path of ['/', '/microgames/', '/microgames/strings-strip-abc', '/microgames/classes-regular-abc']) {
  let failure;
  for (let attempt = 0; attempt < 12; attempt++) {
    try {
      const response = await fetch(new URL(path, origin), {headers: {'Cache-Control':'no-cache'}, signal: AbortSignal.timeout(10_000)});
      assert.equal(response.status, 200, `${path}: HTTP status`);
      const html = await response.text();
      assert.ok(html.includes(`v${version}`), `${path}: release version`);
      if (path.startsWith('/microgames/')) assert.ok(html.includes('id="round-heading"'), `${path}: Microgames document, not homepage fallback`);
      failure = undefined; break;
    } catch (error) {failure = error; await new Promise(resolve => setTimeout(resolve, 2000));}
  }
  if (failure) throw failure;
  console.log(`Verified ${path} (v${version})`);
}
