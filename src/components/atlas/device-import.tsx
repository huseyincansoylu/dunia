"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { importCountries } from "@/app/atlas/actions";
import { getCountry } from "@/data/countries";
import { Button } from "@/components/ui/button";

/** Where the map was kept before accounts existed. */
const LEGACY_KEY = "dunia:atlas:v1";

function readLegacy(): string | null {
  try {
    return localStorage.getItem(LEGACY_KEY);
  } catch {
    return null;
  }
}

function clearLegacy() {
  try {
    localStorage.removeItem(LEGACY_KEY);
  } catch {
    // Storage unavailable: nothing to clear.
  }
}

const noSubscribe = () => () => {};

/**
 * Offers to move countries marked on this device (before signing in) into
 * the account. Hidden when there's nothing new to add.
 */
export function DeviceImport({
  visited,
  onImported,
}: {
  visited: ReadonlySet<string>;
  onImported: (codes: string[]) => void;
}) {
  const raw = useSyncExternalStore(noSubscribe, readLegacy, () => null);
  const [done, setDone] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const codes = useMemo(() => {
    if (!raw) return [];
    try {
      const list = (JSON.parse(raw) as { visited?: unknown }).visited;
      if (!Array.isArray(list)) return [];
      return [...new Set(list.map((c) => getCountry(String(c))?.iso2).filter((c): c is string => !!c))];
    } catch {
      return [];
    }
  }, [raw]);
  const fresh = codes.filter((c) => !visited.has(c));

  if (done || fresh.length === 0) return null;

  const add = async () => {
    setPending(true);
    setError(null);
    const result = await importCountries(fresh).catch(() => ({ ok: false as const, error: "Couldn't add those countries. Try again." }));
    setPending(false);
    if (!result.ok) return setError(result.error);
    onImported(fresh);
    clearLegacy();
    setDone(true);
  };

  const discard = () => {
    clearLegacy();
    setDone(true);
  };

  const n = fresh.length;
  return (
    <section
      aria-label="Countries saved on this device"
      className="grid gap-3 rounded-2xl border bg-card p-4 sm:flex sm:items-center sm:justify-between"
    >
      <div className="grid gap-1">
        <p className="font-medium">
          You marked {n} {n === 1 ? "country" : "countries"} on this device before signing in.
        </p>
        <p className="text-sm text-muted-foreground">
          {error ?? "Add them to your account so they're saved everywhere."}
        </p>
      </div>
      <div className="flex shrink-0 gap-2">
        <Button variant="ghost" className="h-9 rounded-xl px-3" onClick={discard} disabled={pending}>
          Discard
        </Button>
        <Button className="h-9 rounded-xl px-3" onClick={add} disabled={pending}>
          {pending ? "Adding…" : `Add ${n} ${n === 1 ? "country" : "countries"}`}
        </Button>
      </div>
    </section>
  );
}
