import type { Microgame } from "./microgames/contracts";
import { foundationalGames } from "./microgames/games/foundations";
import {
  dictionaries,
  lists,
  sorting,
  sets,
} from "./microgames/games/collections";
import {
  functions,
  objects,
  strings,
  iteration,
} from "./microgames/games/language";
import {
  datetime,
  argparse,
  json,
  exceptions,
  containers,
} from "./microgames/games/standard-library";
export type { Round, Microgame } from "./microgames/contracts";
export { fieldSentence } from "./microgames/games/foundations";
// Trusted, statically imported definitions only. URL configuration selects keys;
// it cannot provide templates, functions, imports, or executable checker code.
export const microgames: Record<string, Microgame> = {
  ...foundationalGames,
  classes: {
    name: 'Classes',
    modes: {...foundationalGames.classes.modes, ...objects.modes},
    generate(mode, random) {
      return Object.hasOwn(objects.modes, mode)
        ? objects.generate(mode, random)
        : foundationalGames.classes.generate(mode, random);
    },
  },
  dictionaries,
  lists,
  sorting,
  sets,
  functions,
  strings,
  iteration,
  datetime,
  argparse,
  json,
  exceptions,
  containers,
};
export function challengeTitle(type: string, mode: string): string {
  const game = microgames[type as keyof typeof microgames];
  if (!game || !Object.hasOwn(game.modes, mode))
    throw Error("Unknown game or setting.");
  return `${game.name}: ${game.modes[mode]}`;
}
