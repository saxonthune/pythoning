import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createServer } from "vite";
import { fileURLToPath } from "node:url";

const server = await createServer({
  root: fileURLToPath(new URL("..", import.meta.url)),
  configFile: false,
  server: { middlewareMode: true },
  appType: "custom",
});
try {
  const { microgames } = await server.ssrLoadModule("/src/lib/microgames.ts");
  const { canonical, seeded, validateConfig, encode, decode } =
    await server.ssrLoadModule("/src/lib/microgame-config.ts");
  const { roundUrl, readMicrogameUrl } = await server.ssrLoadModule(
    "/src/lib/microgame-route.ts",
  );
  const { roundDocument } = await server.ssrLoadModule(
    "/src/lib/protected-code.ts",
  );
  const rounds = [];
  test("every registered variant is seeded, has editable lines and fixed printed output, and replays from its route", () => {
    for (const [entry, config] of canonical.games.entries()) {
      const game = microgames[config.type];
      for (const seed of [0, 1, 42, 3456, 4294967295]) {
        const round = game.generate(config.mode, seeded(seed));
        assert.deepEqual(round, game.generate(config.mode, seeded(seed)));
        assert.equal(roundDocument(round.blocks, true).doc, round.answer);
        for (const block of round.blocks.filter((b) => b.kind === "editable"))
          assert.equal(block.text.split("\n").length, 3);
        const last = round.blocks.at(-1);
        assert.equal(last.kind, "fixed");
        assert.match(last.text, /print\(/);
        assert.deepEqual(
          readMicrogameUrl(
            new URL(
              roundUrl(canonical, { version: 1, entry, seed }),
              "http://localhost",
            ),
          ).round,
          { version: 1, entry, seed },
        );
        rounds.push({ name: config.type + ":" + config.mode, ...round });
      }
    }
    console.log(
      `${canonical.games.length} variants; ${rounds.length} seeded rounds`,
    );
  });
  test("config remains an allowlist and the complete catalog fits the bounded URL codec", () => {
    assert.deepEqual(validateConfig(decode(encode(canonical))), canonical);
    for (const entry of [
      { type: "__proto__", mode: "x" },
      { type: "classes", mode: "constructor" },
      { type: "strings", mode: "split", setup: "import os" },
    ]) {
      assert.throws(() => validateConfig({ version: 1, games: [entry] }));
    }
    const custom = {
      ...canonical,
      games: [...canonical.games, { type: "strings", mode: "strip" }],
    };
    const round = { version: 1, entry: custom.games.length - 1, seed: 123 };
    assert.deepEqual(
      readMicrogameUrl(new URL(roundUrl(custom, round), "http://localhost")),
      { config: custom, round },
    );
  });
  test("every reference solution passes Python checks, prints output, and rejects invalid outcomes", () => {
    const result = spawnSync(
      "python",
      [
        "-c",
        `
import json, sys, io, contextlib, runpy
checker = runpy.run_path('public/microgame-checker.py')['check_round']
rounds = json.load(sys.stdin)
for round in rounds:
    ns = {'__name__': '__main__'}
    try:
        with contextlib.redirect_stdout(io.StringIO()) as out:
            exec(compile(round['answer'], '<answer>', 'exec'), ns)
            checker(round['spec'], ns, round['answer'])
        assert out.getvalue().strip(), 'No output'
    except BaseException as error:
        raise AssertionError(round['name'] + ': ' + str(error)) from error
# A wrong result or a broken function must fail, not merely execute successfully.
for round in rounds:
    spec = round['spec']
    if spec['type'] != 'values': continue
    ns = {'__name__': '__main__'}
    with contextlib.redirect_stdout(io.StringIO()): exec(round['answer'], ns)
    for name in spec.get('expected', {}): ns[name] = object()
    for case in spec.get('calls', []): ns[case['name']] = lambda *args: object()
    for case in spec.get('raises', []): ns[case['name']] = lambda *args: None
    if 'jsonExpected' in spec: ns['result'] = '{}'
    try: checker(spec, ns, round['answer'])
    except (AssertionError, TypeError, ValueError): pass
    else: raise AssertionError('Accepted invalid outcome: ' + round['name'])
print(str(len(rounds)) + ' reference solutions passed')
`,
      ],
      {
        input: JSON.stringify(rounds),
        encoding: "utf8",
        cwd: fileURLToPath(new URL("..", import.meta.url)),
      },
    );
    assert.equal(result.status, 0, result.stderr);
    console.log(result.stdout.trim());
  });
} finally {
  await server.close();
}
