import { family, integer, pick } from "../contracts";
export const datetime = family("Datetime", {
  construct: {
    title: "Construct a Date",
    make: (r) => {
      const d = integer(r, 10, 25);
      return {
        prompt:
          "Construct a date from `year`, `month`, and `day`, assigning it to `result`.",
        setup: `from datetime import date\n\nyear = 2024\nmonth = 3\nday = ${d}`,
        solution: "result = date(year, month, day)",
        expected: { result: `2024-03-${d}` },
      };
    },
  },
  parse: {
    title: "Parse a Date",
    make: (r) => {
      const d = integer(r, 10, 25);
      return {
        prompt:
          "Parse `text` in year-month-day format into a datetime assigned to `result`.",
        setup: `from datetime import datetime\n\ntext = "2024-03-${d}"`,
        solution: 'result = datetime.strptime(text, "%Y-%m-%d")',
        expected: { result: `2024-03-${d}T00:00:00` },
      };
    },
  },
  format: {
    title: "Format a Date",
    make: (r) => {
      const d = integer(r, 10, 25);
      return {
        prompt:
          "Format `value` as day/month/year with two-digit day and month, assigning the string to `result`.",
        setup: `from datetime import date\n\nvalue = date(2024, 3, ${d})`,
        solution: 'result = value.strftime("%d/%m/%Y")',
        expected: { result: `${d}/03/2024` },
      };
    },
  },
  add: {
    title: "Add a Timedelta",
    make: (r) => {
      const n = integer(r);
      return {
        prompt:
          "Add `days` days to `start`, assigning the resulting date to `result`.",
        setup: `from datetime import date, timedelta\n\nstart = date(2024, 3, 10)\ndays = ${n}`,
        solution: "result = start + timedelta(days=days)",
        expected: { result: `2024-03-${10 + n}` },
      };
    },
  },
  subtract: {
    title: "Subtract Dates",
    make: (r) => {
      const n = integer(r);
      return {
        prompt:
          "Assign the number of whole days from `start` to `end` to `result`.",
        setup: `from datetime import date\n\nstart = date(2024, 3, 10)\nend = date(2024, 3, ${10 + n})`,
        solution: "result = (end - start).days",
        expected: { result: n },
      };
    },
  },
  compare: {
    title: "Compare Dates",
    make: (r) => {
      const d = pick(r, [8, 12]);
      return {
        prompt: "Assign whether `first` is earlier than `second` to `result`.",
        setup: `from datetime import date\n\nfirst = date(2024, 3, 10)\nsecond = date(2024, 3, ${d})`,
        solution: "result = first < second",
        expected: { result: d > 10 },
      };
    },
  },
  utc: {
    title: "Construct an Aware UTC Datetime",
    make: (r) => {
      const hour = integer(r, 10, 20);
      return {
        prompt:
          "Construct a timezone-aware UTC datetime from the supplied year, month, day, and hour. Assign it to `result`.",
        setup: `from datetime import datetime, timezone\n\nyear, month, day, hour = 2024, 3, 10, ${hour}`,
        solution:
          "result = datetime(year, month, day, hour, tzinfo=timezone.utc)",
        expected: { result: `2024-03-10T${hour}:00:00+00:00` },
      };
    },
  },
  due: {
    title: "Write a Due Date Function",
    make: (r) => {
      const n = integer(r);
      return {
        prompt:
          "Define `due_date(start, days)` to return the date that many days after start. Assign its result for the provided values to `result`.",
        setup: `from datetime import date, timedelta\n\nstart = date(2024, 3, 10)\ndays = ${n}`,
        solution:
          "def due_date(start, days):\n    return start + timedelta(days=days)\n\nresult = due_date(start, days)",
        expected: { result: `2024-03-${10 + n}` },
        calls: [
          {
            name: "due_date",
            args: ["2024-02-28", 2],
            dateArgs: [0],
            expected: "2024-03-01",
          },
          {
            name: "due_date",
            args: ["2024-12-31", 1],
            dateArgs: [0],
            expected: "2025-01-01",
          },
        ],
      };
    },
  },
});
export const argparse = family("Argparse", {
  positional: {
    title: "Add a Positional Argument",
    make: (r) => {
      const name = pick(r, ["Ada", "Lin"]);
      return {
        prompt: "Add a positional argument named **name** to `parser`.",
        setup: "import argparse\n\nparser = argparse.ArgumentParser()",
        solution: 'parser.add_argument("name")',
        expected: { result: name },
        output: `args = parser.parse_args(["${name}"])\nresult = args.name\nprint(result)`,
      };
    },
  },
  optional: {
    title: "Add an Optional Argument",
    make: (r) => {
      const name = pick(r, ["Ada", "Lin"]);
      return {
        prompt: "Add an optional string argument **--name** to `parser`.",
        setup: "import argparse\n\nparser = argparse.ArgumentParser()",
        solution: 'parser.add_argument("--name")',
        expected: { result: name },
        output: `args = parser.parse_args(["--name", "${name}"])\nresult = args.name\nprint(result)`,
      };
    },
  },
  integer: {
    title: "Parse an Integer Argument",
    make: (r) => {
      const n = integer(r);
      return {
        prompt:
          "Add the optional argument **--count** to `parser`, converting its value to an integer.",
        setup: "import argparse\n\nparser = argparse.ArgumentParser()",
        solution: 'parser.add_argument("--count", type=int)',
        expected: { result: n },
        output: `args = parser.parse_args(["--count", "${n}"])\nresult = args.count\nprint(result)`,
      };
    },
  },
  flag: {
    title: "Add a Boolean Flag",
    make: (r) => {
      const enabled = r() > 0.5;
      return {
        prompt:
          "Add the optional flag **--verbose** using store_true so it is true only when supplied.",
        setup: "import argparse\n\nparser = argparse.ArgumentParser()",
        solution: 'parser.add_argument("--verbose", action="store_true")',
        expected: { result: enabled },
        output: `args = parser.parse_args(${enabled ? '["--verbose"]' : "[]"})\nresult = args.verbose\nprint(result)`,
      };
    },
  },
  attributes: {
    title: "Read Parsed Attributes",
    make: (r) => {
      const n = integer(r);
      return {
        prompt: "Read **count** from the parsed `args` into `result`.",
        setup: `import argparse\n\nparser = argparse.ArgumentParser()\nparser.add_argument("--count", type=int)\nargs = parser.parse_args(["--count", "${n}"])`,
        solution: "result = args.count",
        expected: { result: n },
      };
    },
  },
  parser: {
    title: "Define and Use a Parser",
    make: (r) => {
      const n = integer(r);
      return {
        prompt:
          "Define `parse_options(argv)` to parse an optional integer **--count** defaulting to 1 and a **--verbose** store_true flag, returning the parsed Namespace. Parse `argv` into `args`, then assign `(args.count, args.verbose)` to `result`.",
        setup: `import argparse\n\nargv = ["--count", "${n}", "--verbose"]`,
        solution:
          'def parse_options(argv):\n    parser = argparse.ArgumentParser()\n    parser.add_argument("--count", type=int, default=1)\n    parser.add_argument("--verbose", action="store_true")\n    return parser.parse_args(argv)\n\nargs = parse_options(argv)\nresult = (args.count, args.verbose)',
        expected: { result: [n, true] },
        calls: [
          {
            name: "parse_options",
            args: [[]],
            expected: { count: 1, verbose: false },
          },
          {
            name: "parse_options",
            args: [["--count", "4"]],
            expected: { count: 4, verbose: false },
          },
        ],
      };
    },
  },
});
export const json = family("JSON", {
  loads: {
    title: "Decode JSON",
    make: (r) => {
      const n = integer(r);
      return {
        prompt: "Decode `text` into a Python object named `result`.",
        setup: `import json\n\ntext = '{"count": ${n}}'`,
        solution: "result = json.loads(text)",
        expected: { result: { count: n } },
      };
    },
  },
  dumps: {
    title: "Encode JSON",
    make: (r) => {
      const n = integer(r);
      return {
        prompt: "Encode `record` as JSON text assigned to `result`.",
        setup: `import json\n\nrecord = {"count": ${n}}`,
        solution: "result = json.dumps(record)",
        expected: {},
        output: "print(result)",
        jsonExpected: { count: n },
      };
    },
  },
  nested: {
    title: "Access Nested Data",
    make: (r) => {
      const name = pick(r, ["Ada", "Lin"]);
      return {
        prompt: "Read the nested user name from `data` into `result`.",
        setup: `data = {"user": {"name": "${name}"}}`,
        solution: 'result = data["user"]["name"]',
        expected: { result: name },
      };
    },
  },
  transform: {
    title: "Transform Decoded Records",
    make: (r) => {
      const n = integer(r);
      return {
        prompt:
          "Decode `text` and assign the sum of all record counts to `result`.",
        setup: `import json\n\ntext = '[{"count": ${n}}, {"count": 2}]'`,
        solution:
          'records = json.loads(text)\nresult = sum(record["count"] for record in records)',
        expected: { result: n + 2 },
      };
    },
  },
  pipeline: {
    title: "Decode, Transform, and Encode",
    make: (r) => {
      const n = integer(r);
      return {
        prompt:
          "Define `increment_json(text)` to decode a JSON object, increase **count** by one, and return the updated JSON text. Call it with `text` into `result`.",
        setup: `import json\n\ntext = '{"count": ${n}}'`,
        solution:
          'def increment_json(text):\n    record = json.loads(text)\n    record["count"] += 1\n    return json.dumps(record)\n\nresult = increment_json(text)',
        expected: {},
        jsonExpected: { count: n + 1 },
      };
    },
  },
});
export const exceptions = family("Exceptions", {
  raise: {
    title: "Raise ValueError",
    make: (r) => ({
      prompt:
        "Define `require_positive(value)` to raise ValueError for zero or negative values and return the value otherwise. Call it with `number` into `result`.",
      setup: `number = ${integer(r)}`,
      solution:
        'def require_positive(value):\n    if value <= 0:\n        raise ValueError("Must be positive")\n    return value\n\nresult = require_positive(number)',
      expected: {},
      resultFrom: { name: "require_positive", args: ["number"] },
      calls: [{ name: "require_positive", args: [3], expected: 3 }],
      raises: [
        { name: "require_positive", args: [0], error: "ValueError" },
        { name: "require_positive", args: [-2], error: "ValueError" },
      ],
    }),
  },
  catch: {
    title: "Catch an Expected Exception",
    make: (r) => {
      const text = pick(r, ["oops", "invalid"]);
      return {
        prompt:
          "Try to convert `text` to an integer in `result`. Catch ValueError and set `result` to 0.",
        setup: `text = "${text}"`,
        solution:
          "try:\n    result = int(text)\nexcept ValueError:\n    result = 0",
        expected: { result: 0 },
      };
    },
  },
  fallback: {
    title: "Return a Fallback",
    make: (r) => ({
      prompt:
        "Define `safe_int(text)` to return its integer value, or 0 when conversion raises ValueError. Assign `safe_int(text)` to `result`.",
      setup: `text = "${pick(r, ["oops", "42"])}"`,
      solution:
        "def safe_int(text):\n    try:\n        return int(text)\n    except ValueError:\n        return 0\n\nresult = safe_int(text)",
      expected: {},
      resultFrom: { name: "safe_int", args: ["text"] },
      calls: [
        { name: "safe_int", args: ["17"], expected: 17 },
        { name: "safe_int", args: ["bad"], expected: 0 },
      ],
    }),
  },
  validate: {
    title: "Validate Input",
    make: (r) => ({
      prompt:
        "Define `parse_age(text)` to convert text to an integer, raising ValueError if conversion fails or age is negative. Return the age otherwise and assign `parse_age(text)` to `result`.",
      setup: `text = "${integer(r)}"`,
      solution:
        'def parse_age(text):\n    age = int(text)\n    if age < 0:\n        raise ValueError("Age cannot be negative")\n    return age\n\nresult = parse_age(text)',
      expected: {},
      resultFrom: { name: "parse_age", args: ["text"] },
      calls: [
        { name: "parse_age", args: ["0"], expected: 0 },
        { name: "parse_age", args: ["21"], expected: 21 },
      ],
      raises: [
        { name: "parse_age", args: ["-1"], error: "ValueError" },
        { name: "parse_age", args: ["bad"], error: "ValueError" },
      ],
    }),
  },
});
export const containers = family("Standard Containers", {
  counter: {
    title: "Count With Counter",
    make: (r) => {
      const word = pick(r, ["cat", "dog"]);
      return {
        prompt:
          "Use Counter to count `words`, assigning the counts to `result`.",
        setup: `from collections import Counter\n\nwords = ["${word}", "owl", "${word}"]`,
        solution: "result = Counter(words)",
        expected: { result: { [word]: 2, owl: 1 } },
      };
    },
  },
  defaultdict: {
    title: "Group With Defaultdict",
    make: (r) => {
      const n = integer(r);
      return {
        prompt:
          "Use a defaultdict of lists named `result` to group each pair’s value under its key.",
        setup: `from collections import defaultdict\n\npairs = [("a", ${n}), ("b", 2), ("a", 3)]`,
        solution:
          "result = defaultdict(list)\nfor key, value in pairs:\n    result[key].append(value)",
        expected: { result: { a: [n, 3], b: [2] } },
      };
    },
  },
  deque: {
    title: "Append and Popleft",
    make: (r) => {
      const n = integer(r);
      return {
        prompt:
          "Append `item` to `queue`, then remove its leftmost item into `result`.",
        setup: `from collections import deque\n\nqueue = deque([1, 2])\nitem = ${n}`,
        solution: "queue.append(item)\nresult = queue.popleft()",
        expected: { result: 1, queue: [2, n] },
        output: "print(result, list(queue))",
      };
    },
  },
  group: {
    title: "Write a Grouping Function",
    make: (r) => ({
      prompt:
        "Define `group_pairs(pairs)` to return a dictionary grouping values into lists by their key, preserving value order. Call it with `pairs` into `result`.",
      setup: `pairs = [("a", ${integer(r)}), ("b", 2), ("a", 3)]`,
      solution:
        "def group_pairs(pairs):\n    result = {}\n    for key, value in pairs:\n        result.setdefault(key, []).append(value)\n    return result\n\nresult = group_pairs(pairs)",
      expected: {},
      resultFrom: { name: "group_pairs", args: ["pairs"] },
      calls: [
        {
          name: "group_pairs",
          args: [
            [
              ["x", 1],
              ["x", 2],
              ["y", 3],
            ],
          ],
          expected: { x: [1, 2], y: [3] },
        },
        { name: "group_pairs", args: [[]], expected: {} },
      ],
    }),
  },
  consume: {
    title: "Consume a Queue",
    make: (r) => {
      const n = integer(r);
      return {
        prompt:
          "Remove every item from the left of `queue`, appending each to the list `result` in order. Leave the queue empty.",
        setup: `from collections import deque\n\nqueue = deque([${n}, 2, 3])`,
        solution:
          "result = []\nwhile queue:\n    result.append(queue.popleft())",
        expected: { result: [n, 2, 3], queue: [] },
      };
    },
  },
});
