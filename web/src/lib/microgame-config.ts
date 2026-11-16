import { microgames } from "./microgames";
export interface Entry {
  type: string;
  mode: string;
  enabled?: boolean;
}
export interface Config {
  version: 1;
  games: Entry[];
  disabledGroups?: string[];
}
export interface RoundCode {
  version: 1;
  entry: number;
  seed: number;
}
export const canonical: Config = {
  version: 1,
  games: Object.entries(microgames).flatMap(([type, game]) =>
    Object.keys(game.modes).map((mode) => ({ type, mode })),
  ),
};
function object(v: unknown, keys: string[]): Record<string, unknown> {
  if (
    !v ||
    typeof v !== "object" ||
    Array.isArray(v) ||
    Object.keys(v).some((k) => !keys.includes(k))
  )
    throw Error("Invalid code fields.");
  return v as Record<string, unknown>;
}
export function validateConfig(value: unknown): Config {
  const v = object(value, ["version", "games", "disabledGroups"]);
  if (
    v.version !== 1 ||
    !Array.isArray(v.games) ||
    !v.games.length ||
    v.games.length > 128
  )
    throw Error("Unsupported configuration.");
  if (
    v.disabledGroups !== undefined &&
    (!Array.isArray(v.disabledGroups) ||
      v.disabledGroups.some(
        (t) => typeof t !== "string" || !Object.hasOwn(microgames, t),
      ))
  )
    throw Error("Unknown group.");
  const config: Config = {
    version: 1,
    ...(v.disabledGroups === undefined
      ? {}
      : { disabledGroups: [...new Set(v.disabledGroups as Entry["type"][])] }),
    games: v.games.map((x) => {
      const e = object(x, ["type", "mode", "enabled"]);
      if (e.enabled !== undefined && typeof e.enabled !== "boolean")
        throw Error("Invalid challenge selection.");
      const selection = e.enabled === undefined ? {} : { enabled: e.enabled };
      if (
        typeof e.type === "string" &&
        typeof e.mode === "string" &&
        Object.hasOwn(microgames, e.type)
      ) {
        const game = microgames[e.type as keyof typeof microgames];
        if (Object.hasOwn(game.modes, e.mode))
          return { type: e.type, mode: e.mode, ...selection };
      }
      throw Error("Unknown game or setting.");
    }),
  };
  if (!activeEntries(config).length)
    throw Error("Select at least one challenge type.");
  return config;
}
export function activeEntries(config: Config): number[] {
  return config.games.flatMap((entry, i) =>
    entry.enabled !== false && !config.disabledGroups?.includes(entry.type)
      ? [i]
      : [],
  );
}
export function validateRound(value: unknown, config: Config): RoundCode {
  const v = object(value, ["version", "entry", "seed"]);
  if (
    v.version !== 1 ||
    !Number.isInteger(v.entry) ||
    Number(v.entry) < 0 ||
    Number(v.entry) >= config.games.length ||
    !Number.isInteger(v.seed) ||
    Number(v.seed) < 0 ||
    Number(v.seed) > 4294967295
  )
    throw Error("Invalid round.");
  if (!activeEntries(config).includes(Number(v.entry)))
    throw Error("Round challenge is disabled.");
  return { version: 1, entry: Number(v.entry), seed: Number(v.seed) };
}
export function encode(value: Config | RoundCode): string {
  return btoa(JSON.stringify(value))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/, "");
}
export function decode(code: string): unknown {
  if (!code.length || code.length > 16384 || !/^[A-Za-z0-9_-]+$/.test(code))
    throw Error("Invalid URL code.");
  const text = atob(code.replaceAll("-", "+").replaceAll("_", "/"));
  // Reject pathological nesting before JSON.parse.
  let depth = 0,
    quoted = false,
    escaped = false;
  for (const c of text) {
    if (quoted) {
      if (escaped) escaped = false;
      else if (c === "\\") escaped = true;
      else if (c === '"') quoted = false;
    } else if (c === '"') quoted = true;
    else if (c === "{" || c === "[") {
      if (++depth > 8) throw Error("Code is too deeply nested.");
    } else if (c === "}" || c === "]") depth--;
  }
  return JSON.parse(text);
}
export function seeded(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
