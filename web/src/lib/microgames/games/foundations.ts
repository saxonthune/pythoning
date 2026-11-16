import type { Microgame } from "../contracts";
export function fieldSentence([name, type, value]: string[]): string {
  const displayValue = type === "str" ? JSON.parse(value) : value;
  return `The **${name}** property has type \`${type}\` with a default value of \`${displayValue}\`.`;
}

export const foundationalGames: Record<string, Microgame> = {
  classes: {
    name: "Classes",
    modes: { regular: "Regular Class", dataclass: "Data Class" },
    generate(mode, random = Math.random) {
      const pick = <T>(xs: T[]): T => xs[Math.floor(random() * xs.length)];
      const name = pick(["Dog", "Cat", "Pet"]);
      const fields = [
        ["name", "str", JSON.stringify(pick(["fido", "spot", "milo"]))],
        ["age", "int", String(pick([1, 3, 7]))],
        pick([
          ["weight", "float", "4.5"],
          ["vaccinated", "bool", "True"],
        ]),
      ];
      const data = mode === "dataclass";
      const solution =
        (data
          ? `from dataclasses import dataclass\n\n@dataclass\nclass ${name}:\n${fields.map(([n, t, v]) => `    ${n}: ${t} = ${v}`).join("\n")}`
          : `class ${name}:\n    def __init__(self, ${fields.map(([n, t, v]) => `${n}: ${t} = ${v}`).join(", ")}):\n${fields.map(([n]) => `        self.${n} = ${n}`).join("\n")}`) +
        `\n\npet = ${name}()`;
      const print = `print(${fields.map(([n]) => `pet.${n}`).join(", ")})`;
      return {
        prompt: `Define ${data ? "a data class" : "a regular class"} named ${name}. ${fields.map(fieldSentence).join(" ")} Include type annotations. Then create an instance named pet using the defaults.`,
        answer: solution + "\n" + print,
        blocks: [
          { kind: "editable", text: "\n\n", solution },
          { kind: "fixed", text: print },
        ],
        spec: {
          type: "classes",
          mode,
          name,
          fields: fields.map(([n, t, v]) => [
            n,
            t,
            t === "bool" ? v === "True" : JSON.parse(v),
          ]),
        },
      };
    },
  },
  comprehensions: {
    name: "List Comprehensions",
    modes: { map: "Square Each Number", filter: "Filter by Threshold" },
    generate(mode, random = Math.random) {
      const pick = <T>(xs: T[]): T => xs[Math.floor(random() * xs.length)];
      const values = Array.from(
        { length: 8 },
        () => Math.floor(random() * 21) - 10,
      );
      const threshold = pick([0, 2, 5]);
      const filtered = mode === "filter";
      const solution = filtered
        ? `result = [n for n in numbers if n > ${threshold}]`
        : "result = [n * n for n in numbers]";
      const setup = `numbers = ${JSON.stringify(values)}`;
      return {
        prompt:
          `Assign ` +
          "`result`" +
          ` using one list comprehension from ` +
          "`numbers`" +
          `: ${filtered ? `keep only numbers greater than ${threshold}` : "square every number"}. Preserve order.`,
        answer: setup + "\n" + solution + "\nprint(result)",
        blocks: [
          { kind: "fixed", text: setup },
          { kind: "editable", text: "\n\n", solution },
          { kind: "fixed", text: "print(result)" },
        ],
        spec: { type: "comprehensions", mode, values, threshold },
      };
    },
  },
};
