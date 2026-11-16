import { family, integer, pick } from "../contracts";
export const dictionaries = family("Dictionaries", {
  lookup: {
    title: "Lookup With a Default",
    make: (r) => {
      const age = integer(r);
      const present = r() > 0.5;
      return {
        prompt:
          "Assign `result` from the age in `profile`, using 0 when the key is missing.",
        setup: `profile = ${present ? `{"name": "Maya", "age": ${age}}` : '{"name": "Maya"}'}`,
        solution: 'result = profile.get("age", 0)',
        expected: { result: present ? age : 0 },
      };
    },
  },
  assign: {
    title: "Assign a Value",
    make: (r) => {
      const n = integer(r);
      return {
        prompt: `Set the **count** in \`stock\` to \`${n}\`.`,
        setup: 'stock = {"count": 0}',
        solution: `stock["count"] = ${n}`,
        expected: { stock: { count: n } },
        output: "print(stock)",
      };
    },
  },
  remove: {
    title: "Remove a Key",
    make: (r) => {
      const n = integer(r);
      return {
        prompt:
          "Remove **temp** from `record` and assign its value to `result`.",
        setup: `record = {"temp": ${n}, "keep": 1}`,
        solution: 'result = record.pop("temp")',
        expected: { result: n, record: { keep: 1 } },
        output: "print(result, record)",
      };
    },
  },
  items: {
    title: "Iterate Items",
    make: (r) => {
      const n = integer(r);
      return {
        prompt:
          "Assign `result` a list of key/value pairs from `scores`, in insertion order.",
        setup: `scores = {"Ada": ${n}, "Lin": ${n + 1}}`,
        solution: "result = list(scores.items())",
        expected: {
          result: [
            ["Ada", n],
            ["Lin", n + 1],
          ],
        },
      };
    },
  },
  increment: {
    title: "Increment a Count",
    make: (r) => {
      const n = integer(r);
      return {
        prompt: "Increase the **cat** count by one, using 0 if it is missing.",
        setup: `counts = {"cat": ${n}}`,
        solution: 'counts["cat"] = counts.get("cat", 0) + 1',
        expected: { counts: { cat: n + 1 } },
        output: "print(counts)",
      };
    },
  },
  "word-count": {
    title: "Write a Word Counter",
    make: (r) => ({
      prompt:
        "Define `count_words(words)` to return a dictionary counting each word. Assign the count of `words` to `result`.",
      setup: `words = ["cat", "dog", "cat", "${pick(r, ["cat", "dog"])}"]`,
      solution:
        "def count_words(words):\n    counts = {}\n    for word in words:\n        counts[word] = counts.get(word, 0) + 1\n    return counts\n\nresult = count_words(words)",
      expected: {},
      resultFrom: { name: "count_words", args: ["words"] },
      calls: [
        {
          name: "count_words",
          args: [["a", "b", "a"]],
          expected: { a: 2, b: 1 },
        },
        { name: "count_words", args: [[]], expected: {} },
      ],
    }),
  },
});
export const lists = family("Lists and Stacks", {
  index: {
    title: "Index an Item",
    make: (r) => {
      const a = integer(r),
        b = integer(r);
      return {
        prompt: "Assign the second item of `values` to `result`.",
        setup: `values = [${a}, ${b}, ${a + 1}]`,
        solution: "result = values[1]",
        expected: { result: b },
      };
    },
  },
  slice: {
    title: "Slice a List",
    make: (r) => {
      const n = integer(r);
      return {
        prompt:
          "Assign the first two items of `values` to `result` using a slice.",
        setup: `values = [${n}, ${n + 1}, ${n + 2}, ${n + 3}]`,
        solution: "result = values[:2]",
        expected: { result: [n, n + 1] },
      };
    },
  },
  append: {
    title: "Append an Item",
    make: (r) => {
      const n = integer(r);
      return {
        prompt: `Append \`${n}\` to \`values\`.`,
        setup: "values = [1, 2]",
        solution: `values.append(${n})`,
        expected: { values: [1, 2, n] },
        output: "print(values)",
      };
    },
  },
  extend: {
    title: "Extend a List",
    make: (r) => {
      const n = integer(r);
      return {
        prompt: "Extend `values` with every item from `extra`.",
        setup: `values = [1, 2]\nextra = [${n}, ${n + 1}]`,
        solution: "values.extend(extra)",
        expected: { values: [1, 2, n, n + 1] },
        output: "print(values)",
      };
    },
  },
  pop: {
    title: "Pop the Last Item",
    make: (r) => {
      const n = integer(r);
      return {
        prompt: "Remove the last item from `values` and assign it to `result`.",
        setup: `values = [1, 2, ${n}]`,
        solution: "result = values.pop()",
        expected: { result: n, values: [1, 2] },
      };
    },
  },
  stack: {
    title: "Push and Pop",
    make: (r) => {
      const n = integer(r);
      return {
        prompt: "Push `item` onto `stack`, then pop it into `result`.",
        setup: `stack = [1, 2]\nitem = ${n}`,
        solution: "stack.append(item)\nresult = stack.pop()",
        expected: { result: n, stack: [1, 2] },
      };
    },
  },
  replace: {
    title: "Replace an Item",
    make: (r) => {
      const n = integer(r);
      return {
        prompt: `Replace the second item in \`values\` with \`${n}\`.`,
        setup: "values = [1, 0, 3]",
        solution: `values[1] = ${n}`,
        expected: { values: [1, n, 3] },
        output: "print(values)",
      };
    },
  },
  "stack-function": {
    title: "Write a Stack Function",
    make: (r) => ({
      prompt:
        "Define `push_pop(stack, item)` to push and then pop the item, returning the popped value and leaving the original stack intact. Assign its return value to `result`.",
      setup: `stack = [1, 2]\nitem = ${integer(r)}`,
      solution:
        "def push_pop(stack, item):\n    stack.append(item)\n    return stack.pop()\n\nresult = push_pop(stack, item)",
      expected: { stack: [1, 2] },
      calls: [
        { name: "push_pop", args: [[], 7], expected: 7 },
        { name: "push_pop", args: [[1], 4], expected: 4 },
      ],
    }),
  },
});
export const sorting = family("Sorting", {
  copy: {
    title: "Sort a Copy",
    make: (r) => {
      const n = integer(r);
      return {
        prompt:
          "Assign an ascending sorted copy of `values` to `result`. Keep `values` unchanged.",
        setup: `values = [${n + 2}, ${n}, ${n + 1}]`,
        solution: "result = sorted(values)",
        expected: { values: [n + 2, n, n + 1], result: [n, n + 1, n + 2] },
      };
    },
  },
  inplace: {
    title: "Sort in Place",
    make: (r) => {
      const n = integer(r);
      return {
        prompt: "Sort `values` in ascending order in place.",
        setup: `values = [${n + 2}, ${n}, ${n + 1}]`,
        solution: "values.sort()",
        expected: { values: [n, n + 1, n + 2] },
        output: "print(values)",
      };
    },
  },
  reverse: {
    title: "Sort Descending",
    make: (r) => {
      const n = integer(r);
      return {
        prompt: "Assign a descending sorted copy of `values` to `result`.",
        setup: `values = [${n}, ${n + 2}, ${n + 1}]`,
        solution: "result = sorted(values, reverse=True)",
        expected: { result: [n + 2, n + 1, n] },
      };
    },
  },
  key: {
    title: "Sort With a Key",
    make: (r) => {
      const word = pick(r, ["pineapple", "watermelon"]);
      return {
        prompt: "Sort `words` by length into `result`, shortest first.",
        setup: `words = ["${word}", "cat", "pear"]`,
        solution: "result = sorted(words, key=len)",
        expected: { result: ["cat", "pear", word] },
      };
    },
  },
  records: {
    title: "Sort Records by a Field",
    make: (r) => {
      const n = integer(r);
      return {
        prompt: "Sort `people` by **age** into `result`, youngest first.",
        setup: `people = [{"name": "Ada", "age": ${n + 2}}, {"name": "Lin", "age": ${n}}]`,
        solution: 'result = sorted(people, key=lambda person: person["age"])',
        expected: {
          result: [
            { name: "Lin", age: n },
            { name: "Ada", age: n + 2 },
          ],
        },
      };
    },
  },
  "two-fields": {
    title: "Sort by Two Fields",
    make: (r) => ({
      prompt:
        "Define `sort_people(people)` to return a new list sorted by age, then name, both ascending. Assign the sorted `people` to `result`.",
      setup: `people = [{"name": "Zoe", "age": ${integer(r)}}, {"name": "Ada", "age": 1}]`,
      solution:
        'def sort_people(people):\n    return sorted(people, key=lambda p: (p["age"], p["name"]))\n\nresult = sort_people(people)',
      expected: {},
      calls: [
        {
          name: "sort_people",
          args: [
            [
              { name: "Z", age: 2 },
              { name: "B", age: 1 },
              { name: "A", age: 1 },
            ],
          ],
          expected: [
            { name: "A", age: 1 },
            { name: "B", age: 1 },
            { name: "Z", age: 2 },
          ],
        },
        { name: "sort_people", args: [[]], expected: [] },
      ],
    }),
  },
});
export const sets = family("Sets", {
  membership: {
    title: "Check Membership",
    make: (r) => {
      const n = integer(r);
      return {
        prompt: "Assign whether `target` belongs to `ids` to `result`.",
        setup: `ids = {1, 3, 5}\ntarget = ${n}`,
        solution: "result = target in ids",
        expected: { result: [1, 3, 5].includes(n) },
      };
    },
  },
  add: {
    title: "Add an Item",
    make: (r) => {
      const n = integer(r, 4, 9);
      return {
        prompt: "Add `item` to `ids`.",
        setup: `ids = {1, 2}\nitem = ${n}`,
        solution: "ids.add(item)",
        expected: { ids: [1, 2, n] },
        output: "print(sorted(ids))",
      };
    },
  },
  discard: {
    title: "Discard an Item",
    make: (r) => {
      const n = pick(r, [2, 7]);
      return {
        prompt:
          "Remove `item` from `ids` if present, without raising an error if absent.",
        setup: `ids = {1, 2, 3}\nitem = ${n}`,
        solution: "ids.discard(item)",
        expected: { ids: n === 2 ? [1, 3] : [1, 2, 3] },
        output: "print(sorted(ids))",
      };
    },
  },
  intersection: {
    title: "Find Shared Items",
    make: (r) => {
      const n = integer(r);
      return {
        prompt:
          "Assign the set of items shared by `left` and `right` to `result`.",
        setup: `left = {1, ${n}}\nright = {${n}, 20}`,
        solution: "result = left & right",
        expected: { result: [n] },
        output: "print(sorted(result))",
      };
    },
  },
  difference: {
    title: "Find the Difference",
    make: (r) => {
      const n = integer(r);
      return {
        prompt: "Assign items in `left` but not `right` to `result` as a set.",
        setup: `left = {1, ${n}}\nright = {${n}, 20}`,
        solution: "result = left - right",
        expected: { result: [1] },
        output: "print(sorted(result))",
      };
    },
  },
  deduplicate: {
    title: "Remove Duplicates",
    make: (r) => {
      const n = integer(r);
      return {
        prompt: "Assign the unique items of `values` to `result` as a set.",
        setup: `values = [1, ${n}, 1, ${n}]`,
        solution: "result = set(values)",
        expected: { result: [1, n] },
        output: "print(sorted(result))",
      };
    },
  },
  "shared-function": {
    title: "Write a Shared IDs Function",
    make: (r) => ({
      prompt:
        "Define `shared_ids(left, right)` to return the set of shared IDs. Assign its result for the provided lists to `result`.",
      setup: `left = [1, ${integer(r)}]\nright = [1, 20]`,
      solution:
        "def shared_ids(left, right):\n    return set(left) & set(right)\n\nresult = shared_ids(left, right)",
      expected: {},
      resultFrom: { name: "shared_ids", args: ["left", "right"] },
      calls: [
        {
          name: "shared_ids",
          args: [
            [1, 2],
            [2, 3],
          ],
          expected: [2],
        },
        { name: "shared_ids", args: [[], [1]], expected: [] },
      ],
      output: "print(sorted(result))",
    }),
  },
});
