# Microgames configuration and execution

Config Code and Round Code are untrusted data. Engine functions are shipped application code. A config contains a version and a list of game entries, including repeated entries for the same engine with different settings. The canonical config lives in `web/src/lib/microgame-config.ts`.

## URL boundary

`/microgames/<config-code>/<round-code>` encodes bounded base64url JSON. Decoding checks alphabet, encoded length and nesting before parsing. Strict validators reject unknown properties, versions, engines, modes, invalid entry references and seeds outside unsigned 32-bit range. Validated objects are reconstructed explicitly. There is no dynamic module lookup, merging into prototypes, or executable source in either code. A round contains an entry index and deterministic seed; generation behavior is versioned with the schema. Preserve version-1 generation semantics when introducing future changes.

## Engine boundary

Generation and answer hints are trusted TypeScript functions. Checkers are trusted Python. Round data is passed as JSON, never interpolated into executable checker source. Prompts and results are rendered as text. Shared URLs never execute an answer automatically. There is no configuration persistence or history yet.

## Execution boundary

Microgames run in a fresh blob worker inside an opaque-origin iframe sandboxed with only allow-scripts. The iframe CSP allows inline bootstrap, blob scripts/workers and WebAssembly compilation, but denies connections and other resources. Blob workers inherit that policy. Runtime assets are fetched by the application from pinned, self-hosted Pyodide 0.26.2 files, then passed as bytes. The worker's fetch adapter supplies only those in-memory files; imports are restricted to the two runtime scripts. Native network APIs remain subject to CSP, even if Python accesses JavaScript. The frame receives no application credentials or storage. Results travel over a dedicated MessageChannel, with bounded text fields; source length and output are bounded. Stop or a 30-second deadline removes the frame and its worker. Each check creates a new runtime. Browser memory allocation has no reliable hard quota.

The old DSA player still uses its separate existing Pyodide worker; these isolation changes apply to Microgames. Python checks provide educational feedback, not tamper-proof grading against a user intentionally manipulating the interpreter.

## Hosting

Cloudflare `_redirects` rewrites encoded microgame routes to the static player. Development uses an equivalent Vite rewrite. `_headers` disables referrer transmission, prevents MIME sniffing and limits framing/object sources. The runner's restrictive CSP is embedded directly in its sandbox document so local execution also gets network blocking. Self-hosted runtime files retain their upstream license. Revisit runtime updates deliberately and validate the sandbox bootstrap after changes.

## Typing hint

CodeMirror decorations display the reference answer as ghost text when enabled and each typed line is a prefix of its corresponding answer line. The decoration is absent from the document and therefore never submitted. A divergent line hides only its own hint; other lines retain theirs. Lines correspond by line number, and unwritten answer lines remain visual blocks. All answers remain valid candidates for checking. There is no accept-completion shortcut. The user types the answer. Refresh, toggling, new rounds and edits recompute the decoration.

## Validation performed

The production build passes. Headless Chromium exercised a correct class answer and comprehension answer, replay by URL reload, visual typing hints, and Stop during an infinite loop. A native `fetch('https://example.com')` attempted from a worker inside the sandbox failed under CSP. This tests the browser policy independently of Python's restricted JavaScript globals.

## Readable round URLs

Rounds use `/microgames/<challenge-name>-<base36-seed>`. The optional `?config=<Config Code>` carries custom configuration; defaults omit it. Challenge names resolve through the known game entries, including distinct occurrence suffixes for duplicate entries. Seeds must be canonical base36 uint32 values. Duplicate config query parameters, unknown names and disabled challenges are rejected. Existing nested Config Code/Round Code links decode and normalize to this route. New rounds preserve saved configuration, while Save preserves an enabled current round. No server-side short-link store is used.

## Protected editor documents

Trusted game generators declare ordered fixed/editable blocks in `Round.blocks`.
`protected-code.ts` builds one Python document and tracks its editable ranges with
a CodeMirror StateField. A transaction filter rejects changes outside those
ranges, including deletions across fixed-block separators. Editable ranges start
with three lines and can become empty text while retaining their one document
line. Decorations distinguish provided code. The runner executes the full editor
document, including fixed input and print blocks; it no longer injects `numbers`.
These editor protections guide practice, not a security boundary against someone
modifying application code in browser developer tools. Worker isolation remains
the execution security boundary.
