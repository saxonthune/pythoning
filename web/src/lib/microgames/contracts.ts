import type { CodeBlock } from "../protected-code";
export interface Round {
  prompt: string;
  answer: string;
  blocks: CodeBlock[];
  spec: unknown;
}
export interface Microgame {
  name: string;
  modes: Record<string, string>;
  generate(mode: string, random?: () => number): Round;
}
export interface Task {
  prompt: string;
  setup?: string;
  solution: string;
  expected: Record<string, unknown>;
  output?: string;
  jsonExpected?: unknown;
  resultFrom?: { name: string; args: string[] };
  raises?: { name: string; args: unknown[]; error: "ValueError" }[];
  calls?: {
    name: string;
    args: unknown[];
    expected: unknown;
    dateArgs?: number[];
  }[];
}
export function taskRound(task: Task): Round {
  const output = task.output ?? "print(result)";
  const blocks: CodeBlock[] = [
    ...(task.setup ? [{ kind: "fixed" as const, text: task.setup }] : []),
    { kind: "editable", text: "\n\n", solution: task.solution },
    { kind: "fixed", text: output },
  ];
  return {
    prompt: task.prompt,
    answer: [task.setup, task.solution, output].filter(Boolean).join("\n"),
    blocks,
    spec: {
      type: "values",
      expected: task.expected,
      calls: task.calls ?? [],
      raises: task.raises ?? [],
      ...(task.resultFrom ? { resultFrom: task.resultFrom } : {}),
      ...(task.jsonExpected === undefined
        ? {}
        : { jsonExpected: task.jsonExpected }),
    },
  };
}
export function family(
  name: string,
  tasks: Record<
    string,
    { title: string; make: (random: () => number) => Task }
  >,
): Microgame {
  return {
    name,
    modes: Object.fromEntries(
      Object.entries(tasks).map(([id, task]) => [id, task.title]),
    ),
    generate(mode, random = Math.random) {
      const task = tasks[mode];
      if (!task) throw Error("Unknown challenge mode.");
      return taskRound(task.make(random));
    },
  };
}
export const pick = <T>(random: () => number, values: T[]): T =>
  values[Math.floor(random() * values.length)];
export const integer = (random: () => number, min = 2, max = 9) =>
  min + Math.floor(random() * (max - min + 1));
