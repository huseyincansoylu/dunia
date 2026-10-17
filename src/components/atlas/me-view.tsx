"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { ChevronRightIcon } from "lucide-react";
import { deleteMyAccount, saveDisplayName, savePublic } from "@/app/atlas/me/actions";
import { ThemeSegmented } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { DISPLAY_NAME_MAX_LENGTH } from "@/lib/username";
import { cn } from "@/lib/utils";

type MeViewProps = {
  username: string;
  displayName: string | null;
  isPublic: boolean;
  /** Counted countries (visited and lived). */
  countries: number;
  /** "October 2026" */
  since: string;
  /** Masked, e.g. e•••@gmail.com */
  email: string;
};

const card = "overflow-hidden rounded-[20px] border bg-card";
const row = "flex min-h-[54px] items-center justify-between gap-3 border-b px-4 text-[15px] last:border-b-0";

/** The Me tab: who you are, who sees your page, how the app looks, and the account itself. */
export function MeView({ username, displayName: initialName, isPublic: initialPublic, countries, since, email }: MeViewProps) {
  const [displayName, setDisplayName] = useState(initialName);
  const [isPublic, setIsPublic] = useState(initialPublic);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const name = displayName ?? username;

  const togglePublic = async () => {
    const next = !isPublic;
    setIsPublic(next);
    setError(null);
    const result = await savePublic(next);
    if (!result.ok) {
      setIsPublic(!next);
      setError(result.error);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-[18px]">
      <section className="flex items-center gap-3.5">
        <span
          aria-hidden="true"
          className="grid size-[60px] shrink-0 place-items-center rounded-full bg-primary font-heading text-[26px] font-extrabold text-primary-foreground uppercase"
        >
          {name[0]}
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="truncate font-heading text-xl font-extrabold">{name}</span>
          <span className="text-sm text-muted-foreground">
            {countries} {countries === 1 ? "country" : "countries"} · since {since}
          </span>
        </div>
        <Button variant="outline" className="h-9 rounded-[10px] px-3.5" onClick={() => setEditing(true)}>
          Edit
        </Button>
      </section>

      <section aria-label="Your page" className={card}>
        <div className={row}>
          <span>Username</span>
          <Link href={`/${username}`} className="min-w-0 truncate font-mono text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:underline">
            dunia/{username}
          </Link>
        </div>
        <div className={cn(row, "min-h-[62px]")}>
          <span className="flex flex-col gap-0.5">
            <span>Public page</span>
            <span className="text-xs text-muted-foreground">
              {isPublic ? "Anyone with your link can see your map" : "Only you can see your map"}
            </span>
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={isPublic}
            aria-label="Public page"
            onClick={() => void togglePublic()}
            className={cn(
              "flex h-[26px] w-11 shrink-0 rounded-full p-[3px] transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              isPublic ? "justify-end bg-primary" : "justify-start bg-land"
            )}
          >
            <span className="size-5 rounded-full bg-white shadow-sm" />
          </button>
        </div>
      </section>

      <section aria-label="Appearance" className={cn(card, "flex flex-col gap-2.5 px-4 py-3.5")}>
        <span className="text-[15px]">Theme</span>
        <ThemeSegmented />
      </section>

      <section aria-label="Account" className={card}>
        <div className={row}>
          <span>Email</span>
          <span className="min-w-0 truncate text-sm text-muted-foreground">{email}</span>
        </div>
        <Link href="/reset-password" className={cn(row, "outline-none hover:bg-secondary focus-visible:bg-secondary")}>
          Change password
          <ChevronRightIcon className="size-4 text-muted-foreground" aria-hidden="true" />
        </Link>
        <form action="/auth/signout" method="post" className="contents">
          <button type="submit" className={cn(row, "w-full text-left outline-none hover:bg-secondary focus-visible:bg-secondary")}>
            Sign out
            <ChevronRightIcon className="size-4 text-muted-foreground" aria-hidden="true" />
          </button>
        </form>
      </section>

      <p role="status" aria-live="polite" className="text-center text-sm text-destructive empty:hidden">
        {error}
      </p>

      <button
        type="button"
        onClick={() => setDeleting(true)}
        className="mt-auto h-11 rounded-xl text-[15px] font-medium text-destructive outline-none hover:bg-destructive/10 focus-visible:ring-3 focus-visible:ring-destructive/40"
      >
        Delete account
      </button>

      <Sheet open={editing} onOpenChange={setEditing}>
        <SheetContent side="bottom" showCloseButton={false} className="mx-auto max-w-lg gap-0 rounded-t-3xl p-0">
          {editing && (
            <NameForm
              initial={displayName ?? ""}
              username={username}
              onDone={(saved) => {
                setDisplayName(saved);
                setEditing(false);
              }}
              onCancel={() => setEditing(false)}
            />
          )}
        </SheetContent>
      </Sheet>

      <Sheet open={deleting} onOpenChange={setDeleting}>
        <SheetContent side="bottom" showCloseButton={false} className="mx-auto max-w-lg gap-0 rounded-t-3xl p-0">
          {deleting && <DeleteForm username={username} countries={countries} onCancel={() => setDeleting(false)} />}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function NameForm({
  initial,
  username,
  onDone,
  onCancel,
}: {
  initial: string;
  username: string;
  onDone: (saved: string | null) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState(initial);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const id = useId();

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setPending(true);
    setError(null);
    const result = await saveDisplayName(value);
    setPending(false);
    if (result.ok) onDone(value.trim().replace(/\s+/g, " ") || null);
    else setError(result.error);
  };

  return (
    <form onSubmit={(e) => void submit(e)} className="flex flex-col gap-4 px-5 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
      <div className="flex flex-col gap-1">
        <SheetTitle className="font-heading text-xl font-extrabold">Your name</SheetTitle>
        <SheetDescription>Shown on your page above @{username}. Leave it empty to show only your username.</SheetDescription>
      </div>
      <label htmlFor={id} className="sr-only">
        Name
      </label>
      <Input
        id={id}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        maxLength={DISPLAY_NAME_MAX_LENGTH}
        autoComplete="name"
        placeholder={username}
        className="h-12 rounded-xl text-base"
        aria-invalid={!!error}
      />
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <div className="flex gap-2">
        <Button type="button" variant="outline" className="h-12 flex-1 rounded-xl" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="h-12 flex-1 rounded-xl" disabled={pending}>
          {pending ? "Saving…" : "Save"}
        </Button>
      </div>
    </form>
  );
}

function DeleteForm({ username, countries, onCancel }: { username: string; countries: number; onCancel: () => void }) {
  const [value, setValue] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const id = useId();
  const matches = value.trim().toLowerCase() === username;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!matches) return;
    setPending(true);
    setError(null);
    // On success the action signs out and redirects, so only a failure comes back.
    const result = await deleteMyAccount(value);
    setPending(false);
    if (!result.ok) setError(result.error);
  };

  return (
    <form onSubmit={(e) => void submit(e)} className="flex flex-col gap-4 px-5 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
      <div className="flex flex-col gap-1">
        <SheetTitle className="font-heading text-xl font-extrabold">Delete your account?</SheetTitle>
        <SheetDescription>
          Your map{countries > 0 ? ` and its ${countries} ${countries === 1 ? "country" : "countries"}` : ""}, your wishlist and
          dunia/{username} are deleted for good. This can&apos;t be undone.
        </SheetDescription>
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor={id} className="text-sm">
          Type <span className="font-mono font-medium">{username}</span> to confirm
        </label>
        <Input
          id={id}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          className="h-12 rounded-xl font-mono text-base"
          aria-invalid={!!error}
        />
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <div className="flex gap-2">
        <Button type="button" variant="outline" className="h-12 flex-1 rounded-xl" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="destructive" className="h-12 flex-1 rounded-xl" disabled={!matches || pending}>
          {pending ? "Deleting…" : "Delete account"}
        </Button>
      </div>
    </form>
  );
}
