# Microgame Catalog

Implemented from the small-task and blank-editor columns of the retained
[scaffolding proposal](../.luminous/artifacts/microgames-scaffolding/design.md).
The catalog contains 83 variants. Every variant is included in the default configuration;
custom configurations keep their own selections.

| Family | Challenges |
| --- | --- |
| Classes | Regular Class; Data Class; Construct an Instance; Call a Method; Change an Attribute; Implement a Method With Self; Use Dataclass Defaults; Define a Class and Use Two Instances |
| List Comprehensions | Square Each Number; Filter by Threshold |
| Dictionaries | Lookup With a Default; Assign a Value; Remove a Key; Iterate Items; Increment a Count; Write a Word Counter |
| Lists and Stacks | Index an Item; Slice a List; Append an Item; Extend a List; Pop the Last Item; Push and Pop; Replace an Item; Write a Stack Function |
| Sorting | Sort a Copy; Sort in Place; Sort Descending; Sort With a Key; Sort Records by a Field; Sort by Two Fields |
| Sets | Check Membership; Add an Item; Discard an Item; Find Shared Items; Find the Difference; Remove Duplicates; Write a Shared IDs Function |
| Functions and Calls | Define and Return; Call With Positional Arguments; Call With Keyword Arguments; Define a Default Argument; Unpack Arguments |
| Strings | Split a String; Join Strings; Strip Whitespace; Replace Text; Format an F-String; Normalize Case; Parse a Delimited Record |
| Iteration | Enumerate Items; Zip Two Lists; Unpack a Pair; Accumulate a Total; Return Early; Write a Loop Transformation |
| Datetime | Construct a Date; Parse a Date; Format a Date; Add a Timedelta; Subtract Dates; Compare Dates; Construct an Aware UTC Datetime; Write a Due Date Function |
| Argparse | Add a Positional Argument; Add an Optional Argument; Parse an Integer Argument; Add a Boolean Flag; Read Parsed Attributes; Define and Use a Parser |
| JSON | Decode JSON; Encode JSON; Access Nested Data; Transform Decoded Records; Decode, Transform, and Encode |
| Exceptions | Raise ValueError; Catch an Expected Exception; Return a Fallback; Validate Input |
| Standard Containers | Count With Counter; Group With Defaultdict; Append and Popleft; Write a Grouping Function; Consume a Queue |

## Adding a Challenge

1. Add a trusted task generator to a family in `web/src/lib/microgames/games/`.
   Each variant declares a title, description, fixed setup, reference solution,
   expected outcomes, and fixed output ending in print. A task can also declare
   extra function-call cases, expected ValueErrors, or expected decoded JSON.
2. The shared task builder in `microgames/contracts.ts` creates the round's
   fixed/editable blocks. For other document shapes, supply a Round directly.
3. Register a new family in `microgames.ts`. Its modes automatically populate
   the default config, Challenge Types Tree, title lookup, and URL allowlist.
   Keep existing IDs and generation semantics stable for replayed links.
4. Run `npm --prefix web test` and `npm --prefix web run build`.

## Checking

The Python checker compares values and mutations, normalizing tuples, sets,
dates, datetimes, Counters, defaultdicts, deques, and argparse Namespaces for
comparison. Function tasks also use additional inputs where supplied. JSON tasks
compare decoded values so whitespace and key ordering do not require one exact
serialization. Unknown checker IDs fail explicitly. Reference solutions supply
hints; user source is never compared with the reference text.

The URL contains game/mode identifiers and a deterministic seed, never task
functions, Python templates, imports, or executable validation code. The static
registry is the allowlist. Configs are bounded to 128 entries and encoded codes
to 16 KiB to accommodate the complete catalog, retaining nesting and field
validation. Worker network restrictions and resource limits are unchanged.

## Verification

The catalog test generates every variant with five seeds, checks reference
solutions in Python, checks wrong outcomes, tests deterministic replay and URL
validation, and verifies fixed print blocks and three-line editable sections.
Browser runtime checks separately exercise the self-hosted Pyodide sandbox.
