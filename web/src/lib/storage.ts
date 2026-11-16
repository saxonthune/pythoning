const SOL_PREFIX = 'solution:';
// No longer written. Older builds stored a skeleton hash here to drive a
// "skeleton changed" banner; clearing still removes it so old keys drain away.
const LEGACY_HASH_PREFIX = 'skeleton_hash:';

// localStorage can throw (private mode, blocked cookies) or be absent during SSR;
// every access is guarded so a failure just falls back to the skeleton.
export function loadSolution(id: string, skeleton: string): string {
  try {
    return localStorage.getItem(SOL_PREFIX + id) ?? skeleton;
  } catch {
    return skeleton;
  }
}

export function saveSolution(
  id: string,
  code: string,
  skeleton: string,
): void {
  const key = id;
  try {
    // Don't persist an untouched skeleton (trailing whitespace aside) — keeps
    // storage clean so an editor holding only the skeleton leaves no trace.
    if (code.trimEnd() === skeleton.trimEnd()) {
      localStorage.removeItem(SOL_PREFIX + key);
      localStorage.removeItem(LEGACY_HASH_PREFIX + key);
      return;
    }
    localStorage.setItem(SOL_PREFIX + key, code);
  } catch {
    /* storage unavailable — nothing to persist */
  }
}

export function clearSolution(id: string): void {
  const key = id;
  try {
    localStorage.removeItem(SOL_PREFIX + key);
    localStorage.removeItem(LEGACY_HASH_PREFIX + key);
  } catch {
    /* storage unavailable */
  }
}

export function clearAllSolutions(): number {
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k.startsWith(SOL_PREFIX) || k.startsWith(LEGACY_HASH_PREFIX))) {
        keys.push(k);
      }
    }
    keys.forEach((k) => localStorage.removeItem(k));
    return keys.length;
  } catch {
    return 0;
  }
}

export function debounce<A extends unknown[]>(
  fn: (...args: A) => void,
  ms: number,
): (...args: A) => void {
  let t: ReturnType<typeof setTimeout> | null = null;
  return (...args: A) => {
    if (t) clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}
