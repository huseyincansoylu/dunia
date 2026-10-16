"use client";

import { useEffect, useRef, useState } from "react";
import { checkUsername } from "@/app/auth/actions";
import { Input } from "@/components/ui/input";
import { normalizeUsername, USERNAME_MAX, usernameProblem } from "@/lib/username";
import { cn } from "@/lib/utils";

type Status =
  | { kind: "idle" }
  | { kind: "checking" }
  | { kind: "ok"; message: string }
  | { kind: "problem"; message: string };

/**
 * Username input with a live availability check below it.
 * `error` comes from the server after submit and wins until the value changes.
 */
export function UsernameField({ defaultValue = "", error }: { defaultValue?: string; error?: string }) {
  const [value, setValue] = useState(defaultValue);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const latest = useRef(0);

  useEffect(() => {
    const username = normalizeUsername(value);
    if (!username) return;
    const id = ++latest.current;
    const timer = setTimeout(async () => {
      const problem = usernameProblem(username);
      if (problem) return setStatus({ kind: "problem", message: problem });
      setStatus({ kind: "checking" });
      try {
        const result = await checkUsername(username);
        if (id !== latest.current) return; // A newer keystroke is being checked.
        setStatus(result.available ? { kind: "ok", message: result.message } : { kind: "problem", message: result.message });
      } catch {
        if (id === latest.current) setStatus({ kind: "idle" });
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [value]);

  // A server error is about the submitted value; once the user edits it, live checks take over.
  const serverError = error && normalizeUsername(value) === normalizeUsername(defaultValue) ? error : undefined;
  const shown = serverError ? { kind: "problem" as const, message: serverError } : status;
  const describedBy = shown.kind === "idle" ? undefined : "username-status";

  return (
    <div className="grid gap-2">
      <label htmlFor="username" className="text-sm font-medium">
        Username
      </label>
      <Input
        id="username"
        name="username"
        value={value}
        onChange={(e) => {
          // Show the username as it will be saved: no leading @, lowercase, no spaces.
          const next = e.target.value.replace(/^@/, "").replace(/\s/g, "").toLowerCase();
          setValue(next);
          if (!normalizeUsername(next)) setStatus({ kind: "idle" });
        }}
        // Not "username": password managers should save the email as the sign-in name.
        autoComplete="off"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        maxLength={USERNAME_MAX + 1}
        required
        aria-invalid={shown.kind === "problem" || undefined}
        aria-describedby={describedBy}
        className="h-11 rounded-xl text-base"
      />
      {shown.kind !== "idle" && (
        <p
          id="username-status"
          role="status"
          aria-live="polite"
          className={cn("text-sm", shown.kind === "problem" ? "text-destructive" : "text-muted-foreground")}
        >
          {shown.kind === "checking" ? "Checking…" : shown.message}
        </p>
      )}
    </div>
  );
}
