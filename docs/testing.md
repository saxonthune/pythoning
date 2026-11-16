# Testing

Run the full PR check from the repository root:

```sh
npm --prefix web ci
cd web && npx playwright install chromium && cd ..
npm --prefix web run test:all
```

Python 3 and Node 22.18+ are required. The catalog checks invoke `python`.
On a Linux CI host, install the browser's system dependencies using
`npx playwright install --with-deps chromium` from `web`.

## Three Layers

| Layer | Command from repository root | Coverage |
| --- | --- | --- |
| CodeMirror state | `npm --prefix web run test:state` | Real EditorState, protected ranges, minimum editable lines, multiple changes, undo |
| Browser integration | `npm --prefix web run test:editor` | Real Astro page, CodeMirror view, extension, help controls, selection, focus, clipboard events, styling, configuration and challenge changes |
| Execution smoke | `npm --prefix web run test:execution` | Real Pyodide workers, output, success, Python failure, Stop, edit locking, timeout and cleanup |

`npm --prefix web test` runs state and catalog checks. The catalog adds deterministic
round/URL checks and executes 415 reference solutions through the Python checker.
`test:all` runs those tests, the production build, then both browser projects.
The execution deadline test deliberately waits approximately 30 seconds.

Playwright starts its own Astro server on `127.0.0.1:14321`, without taking over the
normal development server. It uses the actual application page, not a mocked
CodeMirror or a simulated DOM. Browser tests currently target Chromium; they do
not establish Firefox or WebKit compatibility. Optional `CHROMIUM_PATH` selects an
existing local Chromium executable; CI installs Playwright's matching browser.

CI runs `test:all` on pull requests and pushes to main. It uploads the HTML report,
traces, and failure screenshots if the check fails. Reports live under
`web/playwright-report/` and `web/test-results/`, both gitignored. From `web`, use
`npx playwright show-report` or `npx playwright test --debug --project=editor`
to inspect failures. Automatic retries are disabled so intermittent failures
remain visible.

## Editor Actions and Expected Behavior

The action library is `web/tests/browser/actions.ts`. It supplies challenge load,
cursor positioning, range/word/line selection, typing, key presses, multiline
paste, blur, Line Hint, Full Hint, Prefill Solution, and state/decorations reads.
Typing and keyboard commands use browser input; logical cursor/range placement
uses the real CodeMirror API. Word selection uses a real double-click, line
selection uses keyboard commands, and paste dispatches a clipboard event without
requiring the host operating system's clipboard. Observation imports CodeMirror
in the test page and finds its actual view; there are no production test globals.

Tests are short action traces with assertions between actions. They distinguish
text selection, active-line highlighting, and ghost decorations. User-established
rules include immutable code preservation, minimum one-line editable sections,
clearing Line Hint when the cursor changes line, and resetting editor state for a
new challenge. Other combinations currently characterize the implementation:

| Sequence | Current expected outcome |
| --- | --- |
| Line Hint → matching prefix | Remaining suffix is visible; document contains only typed text |
| Line Hint → mismatch → delete mismatch | Suffix reappears on the same line |
| Line Hint → same-line selection → blur | Selection and hint state survive |
| Line Hint → Enter → undo | Cleared hint does not reappear |
| Line Hint + Full Hint → leave line → turn Full Hint off | Neither hint remains |
| Full Hint → divergent text on one line | Other lines retain their hints |
| Select across immutable code → delete/type | Whole edit is rejected |
| Delete editable contents → Backspace | Immutable separator remains; one editable line remains |
| Paste multiple lines → undo → redo | Fixed code and editable boundaries remain intact |
| New challenge after hints/prefill | Hints, history, cursor, document, output, and completion reset |

These characterizations make behavior reviewable; they do not imply that every
unsettled interaction has been approved as a product requirement. Multiple
cursors, IME composition, native clipboard permissions, drag/drop, and exhaustive
random state-machine sequences are not yet covered. Add a focused regression
trace for each reported bug before expanding into generated sequences. A future
state model should distinguish document, selection, focus, assistance, execution,
and completion state rather than combining them into a single enum.
