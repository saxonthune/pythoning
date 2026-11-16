import {
  canonical,
  validateConfig,
  type Config,
  type Entry,
} from "./microgame-config";
import { microgames } from "./microgames";
import { roundUrl } from "./microgame-route";

// Parent enablement is independent of each child's remembered selection.
export function mountConfigEditor(
  initial: Config,
  save: (config: Config) => void,
) {
  let savedConfig = initial;
  let running = false;
  const links: {link: HTMLAnchorElement; parent: HTMLInputElement}[] = [];
  const tree = document.querySelector<HTMLElement>("#challenge-types-tree")!;
  const fields = document.querySelector<HTMLFieldSetElement>("#config-fields")!;
  const error = document.querySelector<HTMLElement>("#config-error")!;
  const entries: Entry[] = initial.games.map((entry) => ({ ...entry }));
  for (const entry of canonical.games) {
    if (
      !entries.some(
        (candidate) =>
          candidate.type === entry.type && candidate.mode === entry.mode,
      )
    )
      entries.push({ ...entry, enabled: false });
  }
  const disabled = new Set(initial.disabledGroups ?? []);
  const roots = document.createElement("ul");
  for (const type of Object.keys(microgames) as (keyof typeof microgames)[]) {
    const group = document.createElement("li");
    const row = document.createElement('div'); row.className = 'tree-row';
    const chevron = document.createElement('button'); chevron.type = 'button'; chevron.className = 'tree-chevron';
    chevron.textContent = '▾'; chevron.setAttribute('aria-expanded', 'true'); chevron.setAttribute('aria-label', `Collapse ${microgames[type].name}`);
    const label = document.createElement("label");
    const parent = document.createElement("input");
    parent.type = "checkbox";
    parent.checked = !disabled.has(type);
    label.append(parent, microgames[type].name);
    const children = document.createElement("ul");
    children.className = "group-children";
    children.id = `challenge-group-${type}`;
    chevron.setAttribute('aria-controls', children.id);
    chevron.addEventListener('click', () => {
      children.hidden = !children.hidden;
      chevron.textContent = children.hidden ? '▸' : '▾';
      chevron.setAttribute('aria-expanded', String(!children.hidden));
      chevron.setAttribute('aria-label', `${children.hidden ? 'Expand' : 'Collapse'} ${microgames[type].name}`);
    });
    const inputs: HTMLInputElement[] = [];
    entries.forEach((entry, i) => {
      if (entry.type !== type) return;
      const item = document.createElement("li");
      const childLabel = document.createElement("label");
      const child = document.createElement("input");
      child.type = "checkbox";
      child.checked = entry.enabled !== false;
      child.addEventListener("change", () => {
        entries[i].enabled = child.checked;
        error.hidden = true;
      });
      // Repeated entries remain distinct and retain their own checked state.
      const suffix = entries
        .slice(0, i)
        .filter(
          (other) => other.type === type && other.mode === entry.mode,
        ).length;
      childLabel.append(
        child,
        `${microgames[type].modes[entry.mode]}${suffix ? ` (${suffix + 1})` : ""}`,
      );
      item.className = 'tree-row';
      const link = document.createElement('a'); link.className = 'try-now'; link.textContent = 'Try Now';
      link.setAttribute('aria-label', `Try Now: ${microgames[type].modes[entry.mode]}`);
      const destination = () => {
        // Preview this leaf from the saved configuration, without saving drafts.
        const games = savedConfig.games.map(game => ({...game}));
        const matches = games.flatMap((game, index) => game.type === type && game.mode === entry.mode ? [index] : []);
        let index = matches[suffix];
        if (index === undefined) { index = games.length; games.push({...entry}); }
        if (games[index].enabled === false) games[index].enabled = true;
        const config = validateConfig({...savedConfig, games, ...(savedConfig.disabledGroups === undefined ? {} : {disabledGroups: savedConfig.disabledGroups.filter(group => group !== type)})});
        return roundUrl(config, {version: 1, entry: index, seed: crypto.getRandomValues(new Uint32Array(1))[0]});
      };
      link.href = destination();
      link.addEventListener('click', event => {
        if (running || !parent.checked) {event.preventDefault(); return;}
        link.href = destination();
      });
      links.push({link, parent});
      item.append(childLabel, link);
      children.append(item);
      inputs.push(child);
    });
    const update = () => {
      children.setAttribute("aria-disabled", String(!parent.checked));
      links.filter(item => item.parent === parent).forEach(({link}) => {
        link.setAttribute('aria-disabled', String(running || !parent.checked));
        link.tabIndex = running || !parent.checked ? -1 : 0;
      });
      inputs.forEach((child) => {
        child.disabled = !parent.checked;
      });
    };
    parent.addEventListener("change", () => {
      if (parent.checked) disabled.delete(type);
      else disabled.add(type);
      update();
      error.hidden = true;
    });
    update();
    row.append(chevron, label);
    group.append(row, children);
    roots.append(group);
  }
  tree.replaceChildren(roots);
  document.querySelector("#save-config")!.addEventListener("click", () => {
    try {
      const config = validateConfig({
        version: 1,
        games: entries.map((entry) => ({ ...entry })),
        disabledGroups: [...disabled],
      });
      save(config);
      savedConfig = config;
      error.hidden = true;
    } catch (e) {
      error.textContent = e instanceof Error ? e.message : String(e);
      error.hidden = false;
    }
  });
  return {
    setRunning: (value: boolean) => {
      running = value;
      fields.disabled = running;
      links.forEach(({link, parent}) => {
        link.setAttribute('aria-disabled', String(running || !parent.checked));
        link.tabIndex = running || !parent.checked ? -1 : 0;
      });
    },
  };
}
