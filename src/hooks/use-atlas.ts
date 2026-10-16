"use client";

import { useCallback, useSyncExternalStore } from "react";
import { COUNTRY_LISTS, DEFAULT_LIST, getCountry, type CountryList } from "@/data/countries";

/**
 * The user's atlas, kept in localStorage until accounts exist.
 * Bump the key's version if the stored shape changes.
 */
const STORAGE_KEY = "dunia:atlas:v1";

export type Atlas = {
  visited: string[];
  list: CountryList;
};

const EMPTY: Atlas = { visited: [], list: DEFAULT_LIST };

const listeners = new Set<() => void>();
let cachedRaw: string | null = null;
let cached: Atlas = EMPTY;

function read(): Atlas {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    return cached;
  }
  if (raw === cachedRaw) return cached;
  cachedRaw = raw;
  cached = parse(raw);
  return cached;
}

function parse(raw: string | null): Atlas {
  if (!raw) return EMPTY;
  try {
    const value = JSON.parse(raw) as Partial<Atlas>;
    return {
      visited: Array.isArray(value.visited) ? value.visited.filter((c) => getCountry(c)) : [],
      list: COUNTRY_LISTS.includes(value.list as CountryList) ? (value.list as CountryList) : DEFAULT_LIST,
    };
  } catch {
    return EMPTY;
  }
}

function write(next: Atlas) {
  cached = next;
  try {
    cachedRaw = JSON.stringify(next);
    localStorage.setItem(STORAGE_KEY, cachedRaw);
  } catch {
    // Storage unavailable (private mode, quota): keep the in-memory copy for this visit.
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // Keep other tabs in sync.
  const onStorage = (e: StorageEvent) => e.key === STORAGE_KEY && listener();
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useAtlas() {
  const atlas = useSyncExternalStore(subscribe, read, () => EMPTY);

  const toggle = useCallback((iso2: string) => {
    const current = read();
    const visited = current.visited.includes(iso2)
      ? current.visited.filter((c) => c !== iso2)
      : [...current.visited, iso2];
    write({ ...current, visited });
  }, []);

  const setList = useCallback((list: CountryList) => {
    write({ ...read(), list });
  }, []);

  return { ...atlas, toggle, setList };
}
