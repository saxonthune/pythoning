import {
  activeEntries,
  canonical,
  decode,
  encode,
  validateConfig,
  validateRound,
  type Config,
  type Entry,
  type RoundCode,
} from "./microgame-config";

function challengeName(entry: Entry): string {
  if (entry.type === "classes") return `classes-${entry.mode}`;
  if (entry.type === "comprehensions")
    return entry.mode === "map"
      ? "comprehensions-square"
      : "comprehensions-filter";
  return `${entry.type}-${entry.mode}`;
}
function entryName(config: Config, index: number): string {
  const entry = config.games[index];
  const occurrence = config.games
    .slice(0, index)
    .filter(
      (other) => other.type === entry.type && other.mode === entry.mode,
    ).length;
  return challengeName(entry) + (occurrence ? `-${occurrence + 1}` : "");
}
export function roundUrl(config: Config, round: RoundCode): string {
  const query =
    JSON.stringify(config) === JSON.stringify(canonical)
      ? ""
      : `?config=${encode(config)}`;
  return `/microgames/${entryName(config, round.entry)}-${round.seed.toString(36)}${query}`;
}
export function readMicrogameUrl(url: URL): {
  config: Config;
  round?: RoundCode;
} {
  const parts = url.pathname.split("/").filter(Boolean);
  if (parts[0] !== "microgames" || parts.length > 3)
    throw Error("Invalid route.");
  // Existing nested links remain readable and are rewritten into the new shape.
  if (parts.length === 3) {
    const config = validateConfig(decode(parts[1]));
    return { config, round: validateRound(decode(parts[2]), config) };
  }
  const codes = url.searchParams.getAll("config");
  if (codes.length > 1) throw Error("Invalid configuration.");
  const config = codes.length ? validateConfig(decode(codes[0])) : canonical;
  if (!parts[1]) return { config };
  const match = /^([a-z][a-z0-9-]*)-([0-9a-z]{1,7})$/.exec(parts[1]);
  if (!match) throw Error("Invalid challenge code.");
  const entry = activeEntries(config).find(
    (i) => entryName(config, i) === match[1],
  );
  if (entry === undefined) throw Error("Unknown or disabled challenge.");
  const seed = Number.parseInt(match[2], 36);
  if (seed.toString(36) !== match[2]) throw Error("Invalid seed.");
  return { config, round: validateRound({ version: 1, entry, seed }, config) };
}
