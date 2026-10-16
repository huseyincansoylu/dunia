"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

// next-themes renders an inline <script> that applies the saved theme before first paint.
// It runs from the server HTML; when React renders it again in the browser, React 19 warns
// about script tags in components. Marking it non-executable on the client silences that
// without changing behavior (the element already suppresses hydration warnings).
const scriptProps = { type: typeof window === "undefined" ? "text/javascript" : "text/plain" } as const;

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider scriptProps={scriptProps} {...props}>
      {children}
    </NextThemesProvider>
  );
}
