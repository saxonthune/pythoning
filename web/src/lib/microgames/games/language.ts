import { family, integer, pick } from "../contracts";
export const functions = family("Functions and Calls", {
  define: {
    title: "Define and Return",
    make: (r) => {
      const n = integer(r);
      return {
        prompt:
          "Define `double(value)` to return twice its input. Call it with `number` and assign the return value to `result`.",
        setup: `number = ${n}`,
        solution:
          "def double(value):\n    return value * 2\n\nresult = double(number)",
        expected: { result: n * 2 },
        calls: [
          { name: "double", args: [0], expected: 0 },
          { name: "double", args: [-3], expected: -6 },
        ],
      };
    },
  },
  positional: {
    title: "Call With Positional Arguments",
    make: (r) => {
      const n = integer(r);
      return {
        prompt:
          "Call `add` with `number` and 3 as positional arguments. Assign the returned value to `result`.",
        setup: `def add(left, right):\n    return left + right\n\nnumber = ${n}`,
        solution: "result = add(number, 3)",
        expected: { result: n + 3 },
      };
    },
  },
  keyword: {
    title: "Call With Keyword Arguments",
    make: (r) => {
      const name = pick(r, ["Ada", "Lin", "Maya"]);
      return {
        prompt:
          "Call `greet` with the keyword argument **name** set to `person`. Assign its return value to `result`.",
        setup: `def greet(*, name):\n    return "Hello, " + name\n\nperson = "${name}"`,
        solution: "result = greet(name=person)",
        expected: { result: "Hello, " + name },
      };
    },
  },
  defaults: {
    title: "Define a Default Argument",
    make: (r) => {
      const n = integer(r);
      return {
        prompt:
          "Define `scale(value, factor=2)` to multiply value by factor. Call it with `number` using its default factor and assign the return value to `result`.",
        setup: `number = ${n}`,
        solution:
          "def scale(value, factor=2):\n    return value * factor\n\nresult = scale(number)",
        expected: { result: n * 2 },
        calls: [
          { name: "scale", args: [3], expected: 6 },
          { name: "scale", args: [3, 4], expected: 12 },
        ],
      };
    },
  },
  unpack: {
    title: "Unpack Arguments",
    make: (r) => {
      const n = integer(r);
      return {
        prompt:
          "Unpack `args` into a call to `add` and assign its return value to `result`.",
        setup: `def add(left, right):\n    return left + right\n\nargs = (${n}, 3)`,
        solution: "result = add(*args)",
        expected: { result: n + 3 },
      };
    },
  },
});
export const objects = family("Object Use", {
  construct: {
    title: "Construct an Instance",
    make: (r) => {
      const name = pick(r, ["Ada", "Lin", "Maya"]);
      return {
        prompt:
          "Create a `Person` instance named `person` using `name`. Assign its name attribute to `result`.",
        setup: `class Person:\n    def __init__(self, name):\n        self.name = name\n\nname = "${name}"`,
        solution: "person = Person(name)\nresult = person.name",
        expected: { result: name },
      };
    },
  },
  call: {
    title: "Call a Method",
    make: (r) => {
      const n = integer(r);
      return {
        prompt:
          "Call `counter.increment()` and assign the returned count to `result`.",
        setup: `class Counter:\n    def __init__(self, count):\n        self.count = count\n    def increment(self):\n        self.count += 1\n        return self.count\n\ncounter = Counter(${n})`,
        solution: "result = counter.increment()",
        expected: { result: n + 1 },
      };
    },
  },
  mutate: {
    title: "Change an Attribute",
    make: (r) => {
      const n = integer(r);
      return {
        prompt: `Set **age** on \`person\` to \`${n}\`, then assign the updated age to \`result\`.`,
        setup: "class Person:\n    age = 0\n\nperson = Person()",
        solution: `person.age = ${n}\nresult = person.age`,
        expected: { result: n },
      };
    },
  },
  self: {
    title: "Implement a Method With Self",
    make: (r) => {
      const n = integer(r);
      return {
        prompt:
          "Complete `Counter.increment` so it increases the instance count by one and returns the new count.",
        setup:
          "class Counter:\n    def __init__(self, count):\n        self.count = count\n\n    def increment(self):",
        solution: "        self.count += 1\n        return self.count",
        expected: { result: n + 1 },
        output: `counter = Counter(${n})\nresult = counter.increment()\nprint(result)`,
      };
    },
  },
  "dataclass-default": {
    title: "Use Dataclass Defaults",
    make: (r) => {
      const n = integer(r);
      return {
        prompt:
          "Create a `Product` named `product` with the supplied name and default quantity. Assign its quantity to `result`.",
        setup: `from dataclasses import dataclass\n\n@dataclass\nclass Product:\n    name: str\n    quantity: int = ${n}\n\nname = "book"`,
        solution: "product = Product(name)\nresult = product.quantity",
        expected: { result: n },
      };
    },
  },
  "two-instances": {
    title: "Define a Class and Use Two Instances",
    make: (r) => {
      const n = integer(r);
      return {
        prompt:
          "Define `Counter` with an initializer accepting **count** and an `increment` method that adds one and returns the new count. Create `first` and `second` using the provided starting counts. Increment only `first`, then assign both counts as a tuple to `result`.",
        setup: `first_start = ${n}\nsecond_start = ${n + 4}`,
        solution:
          "class Counter:\n    def __init__(self, count):\n        self.count = count\n    def increment(self):\n        self.count += 1\n        return self.count\n\nfirst = Counter(first_start)\nsecond = Counter(second_start)\nfirst.increment()\nresult = (first.count, second.count)",
        expected: { result: [n + 1, n + 4] },
      };
    },
  },
});
export const strings = family("Strings", {
  split: {
    title: "Split a String",
    make: (r) => {
      const word = pick(r, ["cat", "dog", "fox"]);
      return {
        prompt: "Split `text` on commas into `result`.",
        setup: `text = "${word},owl,bee"`,
        solution: 'result = text.split(",")',
        expected: { result: [word, "owl", "bee"] },
      };
    },
  },
  join: {
    title: "Join Strings",
    make: (r) => {
      const word = pick(r, ["cat", "dog", "fox"]);
      return {
        prompt: "Join `words` with a single space between words into `result`.",
        setup: `words = ["${word}", "owl", "bee"]`,
        solution: 'result = " ".join(words)',
        expected: { result: word + " owl bee" },
      };
    },
  },
  strip: {
    title: "Strip Whitespace",
    make: (r) => {
      const word = pick(r, ["hello", "python", "practice"]);
      return {
        prompt:
          "Remove leading and trailing whitespace from `text`, assigning the cleaned string to `result`.",
        setup: `text = "  ${word}  "`,
        solution: "result = text.strip()",
        expected: { result: word },
      };
    },
  },
  replace: {
    title: "Replace Text",
    make: (r) => {
      const word = pick(r, ["dog", "fox"]);
      return {
        prompt: `Replace every occurrence of cat in \`text\` with \`${word}\`, assigning the new string to \`result\`.`,
        setup: 'text = "cat and cat"',
        solution: `result = text.replace("cat", "${word}")`,
        expected: { result: `${word} and ${word}` },
      };
    },
  },
  fstring: {
    title: "Format an F-String",
    make: (r) => {
      const n = integer(r);
      return {
        prompt:
          "Assign `result` the string “Ada has N books”, where N is the value of `count`, using an f-string.",
        setup: `name = "Ada"\ncount = ${n}`,
        solution: 'result = f"{name} has {count} books"',
        expected: { result: `Ada has ${n} books` },
      };
    },
  },
  normalize: {
    title: "Normalize Case",
    make: (r) => {
      const word = pick(r, ["PYTHON", "Hello", "Practice"]);
      return {
        prompt: "Convert `text` to lowercase and assign it to `result`.",
        setup: `text = "${word}"`,
        solution: "result = text.lower()",
        expected: { result: word.toLowerCase() },
      };
    },
  },
  parse: {
    title: "Parse a Delimited Record",
    make: (r) => {
      const n = integer(r);
      return {
        prompt:
          "Define `parse_record(text)` to parse a comma-separated name and integer age into a dictionary with keys **name** and **age**. Parse `text` into `result`.",
        setup: `text = "Ada,${n}"`,
        solution:
          'def parse_record(text):\n    name, age = text.split(",")\n    return {"name": name, "age": int(age)}\n\nresult = parse_record(text)',
        expected: { result: { name: "Ada", age: n } },
        calls: [
          {
            name: "parse_record",
            args: ["Lin,20"],
            expected: { name: "Lin", age: 20 },
          },
        ],
      };
    },
  },
});
export const iteration = family("Iteration", {
  enumerate: {
    title: "Enumerate Items",
    make: (r) => {
      const word = pick(r, ["cat", "dog"]);
      return {
        prompt:
          "Assign a list of index/item pairs for `words` to `result`, with indices starting at 0.",
        setup: `words = ["${word}", "owl"]`,
        solution: "result = list(enumerate(words))",
        expected: {
          result: [
            [0, word],
            [1, "owl"],
          ],
        },
      };
    },
  },
  zip: {
    title: "Zip Two Lists",
    make: (r) => {
      const n = integer(r);
      return {
        prompt:
          "Pair each name with its score into a list assigned to `result`.",
        setup: `names = ["Ada", "Lin"]\nscores = [${n}, ${n + 1}]`,
        solution: "result = list(zip(names, scores))",
        expected: {
          result: [
            ["Ada", n],
            ["Lin", n + 1],
          ],
        },
      };
    },
  },
  unpack: {
    title: "Unpack a Pair",
    make: (r) => {
      const n = integer(r);
      return {
        prompt: "Unpack `pair` into `name` and `age`.",
        setup: `pair = ("Ada", ${n})`,
        solution: "name, age = pair",
        expected: { name: "Ada", age: n },
        output: "print(name, age)",
      };
    },
  },
  accumulate: {
    title: "Accumulate a Total",
    make: (r) => {
      const n = integer(r);
      return {
        prompt: "Use a loop to add every value in `values` into `result`.",
        setup: `values = [${n}, 2, 3]`,
        solution: "result = 0\nfor value in values:\n    result += value",
        expected: { result: n + 5 },
      };
    },
  },
  early: {
    title: "Return Early",
    make: (r) => {
      const n = integer(r);
      return {
        prompt:
          "Define `first_positive(values)` to return the first value greater than zero, or None if there is none. Call it with `values` into `result`.",
        setup: `values = [-1, 0, ${n}, 20]`,
        solution:
          "def first_positive(values):\n    for value in values:\n        if value > 0:\n            return value\n    return None\n\nresult = first_positive(values)",
        expected: { result: n },
        calls: [
          { name: "first_positive", args: [[-2, 0]], expected: null },
          { name: "first_positive", args: [[3, 5]], expected: 3 },
        ],
      };
    },
  },
  transform: {
    title: "Write a Loop Transformation",
    make: (r) => {
      const n = integer(r);
      return {
        prompt:
          "Define `double_all(values)` using a loop to return a new list with each value doubled. Assign the transformed `values` to `result`.",
        setup: `values = [${n}, 0, -1]`,
        solution:
          "def double_all(values):\n    result = []\n    for value in values:\n        result.append(value * 2)\n    return result\n\nresult = double_all(values)",
        expected: { result: [n * 2, 0, -2] },
        calls: [
          { name: "double_all", args: [[]], expected: [] },
          { name: "double_all", args: [[2, -3]], expected: [4, -6] },
        ],
      };
    },
  },
});
