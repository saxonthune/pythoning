# Microgames

```yaml rhidoc-feature
prefix: MG
name: Microgames
description: >-
  Users keep their Python writing skills sharp through randomized microgames.
```

## Glossary

- **MGTERM1.** [p] **Config Code** — The URL component encoding a Microgames configuration in /microgames/config-code/round-code.
- **MGTERM2.** [p] **Round Code** — The URL component encoding a specific Microgames round beneath its Config Code in /microgames/config-code/round-code.

## Requirements

- **MG1.** [p] Microgames help users stay sharp at writing Python, with DSA practice handled by the existing problem flow.
- **MG2.** [p] Microgames support adding different problem types through configuration.
- **MG3.** [p] A class-definition microgame has configurable class requirements covering different field types.
- **MG4.** [p] A class-definition microgame supports regular Python classes and data classes.
- **MG5.** [p] A list-comprehension microgame shows a randomly generated list and asks the user to write the required comprehension.
- **MG6.** [p] Microgames use one configuration object rather than separate exercise and practice configurations.
- **MG7.** [p] A microgame configuration can be encoded in a URL route.
- **MG8.** [p] A specific game being played can be encoded in a further route beneath its configuration.
- **MG9.** [p] The Microgames code editor displays line numbers on its left side.
- **MG10.** [p] The Microgames input is visually recognizable as a mini IDE.
- **MG11.** [p] The initial Microgames feature does not require local storage features.
- **MG12.** [p] In the future, local storage history lets users view previous rounds.
- **MG13.** [p] In the future, users can share previous rounds from history.

- **MG14.** [p] One Microgames configuration can contain multiple game types.
- **MG15.** [p] One Microgames configuration can contain multiple configurations of the same game type.
- **MG16.** [p] Microgames configurations contain no arbitrary functions.
- **MG17.** [p] The engine system supports adding a flexible range of microgames.

- **MG18.** [p] Microgames block network access from user Python execution.
- **MG19.** [p] The /microgames/ route defaults to a canonical configuration.

- **MG20.** [p] The Microgames editor run button is labeled “Submit and Run”.
- **MG21.** [p] The “Submit and Run” button appears in the editor component header.
- **MG22.** [p] While a run is happening, Stop replaces “Submit and Run” in the same header position; Stop is hidden otherwise.

- **MG23.** [p] The Microgames components appear in this order: introduction or configuration, Round Details, challenge editor with Execution Details in its footer, Results.

- **MG24.** [p] The Editor Header includes “Prefill Solution” in its Help Row.

- **MG25.** [p] Pressing “Prefill Solution” fills the editor with the complete solution for debugging.

- **MG26.** [p] The full typing-hint button is labeled “Full Hint” and appears in the Help Row immediately to the left of “Prefill Solution”.
- **MG27.** [p] “Python Microgames” appears as a left-justified H3 heading at article body level.

## Microgame Config Editor

```yaml rhidoc-feature
prefix: MCE
name: Microgame Config Editor
description: >-
  Users choose which challenge types are enabled and save their Microgames configuration.
parent: MG
```

- **MCE1.** [p] A right-justified “Configuration” anchor replaces the Generic Instructions Blurb with the existing configuration editor when pressed.
- **MCE2.** [p] When expanded, the Microgame Config Editor shows a Challenge Types Tree, initially a hierarchical indented checklist with one checkbox per problem.
- **MCE3.** [p] A group checkbox enables or disables all of its child options without using a mixed-state indicator.
- **MCE4.** [p] While a group is unchecked, its child options retain their checked or unchecked values and are displayed with transparency in either state.
- **MCE5.** [p] When a group is checked again, its child options resume their retained states.
- **MCE6.** [p] Disabled child options cannot be toggled.
- **MCE7.** [p] Disabled child options are ignored when selecting challenges.
- **MCE8.** [p] After editing the Challenge Types Tree, the user can press “Save” to apply the configuration to the route or configuration state.
- **MCE9.** [p] A button to start a new round appears next to “Save”.

- **MCE10.** [p] The Microgames page does not show a Game dropdown alongside the Challenge Types Tree.

## Round Details

```yaml rhidoc-feature
prefix: MRD
name: Round Details
description: >-
  Users read the instructions for the specific microgame they are playing.
parent: MG
```

- **MRD1.** [p] The Round Details heading displays the specific game name rather than “Round”.
- **MRD2.** [p] Round Details does not contain a New Round button.

## Results

```yaml rhidoc-feature
prefix: MRS
name: Results
description: >-
  Users see whether they have beaten the challenge and move to another challenge.
parent: MG
```

- **MRS1.** [p] Results provides a visually distinct completed state.
- **MRS3.** [p] Results contains a “Next Round” button that is disabled until the user beats the challenge.
- **MRS4.** [p] Before the user beats the challenge, an anchor labeled “skip this challenge” lets the user move to the next challenge.
- **MRS5.** [p] When the user beats the challenge, the “skip this challenge” anchor disappears.

- **MRS6.** [p] Results does not display a “Results” label.
- **MRS7.** [p] Until the challenge is beaten, the left side of Results displays “Challenge Incomplete.”.
- **MRS8.** [p] When the challenge is beaten, the left side of Results displays “Success! 🎉”.
- **MRS9.** [p] Results does not display execution-related “Running...” status.

- **MRS10.** [p] Changing Results to its completed state does not change its background, border, or text colors.

## Execution Details

```yaml rhidoc-feature
prefix: MED
name: Execution Details
description: >-
  Users can inspect execution details separately from the challenge result.
parent: MG
```

- **MED1.** [p] Execution Details replaces the previous “Round complete…” output component.

- **MED3.** [p] Execution Details is a footer of the challenge editor, not an expandable component.
- **MED4.** [p] Before any execution, the editor footer displays faint italic “No executions yet.” text.
- **MED5.** [p] Execution-related “Running...” status appears in Execution Details rather than Results.

- **MED6.** [p] Execution Details displays its execution status in the editor footer, with a stack trace in a nested box underneath when execution fails.

## Generic Instructions Blurb

```yaml rhidoc-feature
prefix: GIB
name: Generic Instructions Blurb
description: >-
  Users read a short explanation of Microgames before playing or opening configuration.
parent: MG
```

- **GIB1.** [p] The Generic Instructions Blurb provides a short explanation in place of the former large page title.
- **GIB2.** [p] Opening Configuration replaces the Generic Instructions Blurb with the configuration editor.

- **MCE11.** [p] Only the configuration editor has a bordered container; the Microgames title, Configuration anchor, and blurb sit directly at article body level.
- **MED7.** [p] After a successful execution, the footer status reads “Execution succeeded”.
- **MED8.** [p] After a failed execution, the footer status reads “Execution failure”.
- **MG28.** [p] Microgames uses alternating background colors by containment rather than a different background for each card.

## Protected Challenge Code

```yaml rhidoc-feature
prefix: PCC
name: Protected Challenge Code
description: >-
  Users complete editable Python sections while provided inputs and output code remain intact.
parent: MG
```

- **PCC1.** [p] A challenge declares alternating immutable code blocks and editable sections in the editor.
- **PCC2.** [p] Each editable section initially contains three lines and cannot be reduced below one line.
- **PCC3.** [p] List-comprehension input definitions appear as immutable editor code rather than in the Challenge Description.
- **PCC4.** [p] Every current challenge ends with immutable code that prints its output.
- **MED9.** [p] Printed challenge output appears in the execution footer’s nested output box.
- **MRD3.** [p] The Challenge Description describes what the code should do; provided code definitions belong in the editor.

- **PCC5.** [p] Immutable-line styling extends through the line-number gutter.
- **MG29.** [p] Microgames disables IntelliSense/autocomplete suggestions and their acceptance key bindings.

## Editor

```yaml rhidoc-feature
prefix: MGE
name: Editor
description: >-
  Users write Python solutions and access help and execution controls.
parent: MG
```

### Editor Header

```yaml rhidoc-feature
prefix: EH
name: Editor Header
description: >-
  Users access help separately from execution controls above their code.
parent: MGE
```

- **EH1.** [p] The Editor Header contains a Help Row first and an Execution Row second.
- **EH2.** [p] The Help Row has left-justified buttons in this order: “Line Hint”, “Full Hint”, “Prefill Solution”.
- **EH3.** [p] The Execution Row contains the existing tab component and run button.

### Line Hint

```yaml rhidoc-feature
prefix: LH
name: Line Hint
description: >-
  Users request a ghost hint for only their current cursor line.
parent: MGE
```

- **LH1.** [p] Pressing “Line Hint” displays a ghost hint on the current cursor line.
- **LH2.** [p] When the cursor changes lines, its Line Hint disappears and does not return when the cursor returns to that line.

- **MCE12.** [p] Every non-leaf item in the Challenge Types Tree has an expand/collapse chevron to its left.
- **MCE13.** [p] Every leaf item has a right-justified “Try Now” anchor.
- **MCE14.** [p] Pressing “Try Now” chooses a random seed for that challenge, reloads the page, and closes configuration.

- **MGE1.** [p] When a new challenge loads, the first editor line is active and highlighted even if it is immutable.
- **MGE2.** [p] Loading a new challenge resets editor state, including turning off Full Hint.
