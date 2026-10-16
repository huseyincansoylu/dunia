import { useId } from "react";
import { cn } from "@/lib/utils";

type DuniaMarkProps = React.ComponentProps<"svg"> & {
  /** Share of the world visited, 0–1. The wave rises with it. */
  level?: number;
};

/**
 * The "filling globe": a ring (the world) with a saffron wave rising inside it.
 * Colors come from the theme: ring = primary, wave = visited.
 */
export function DuniaMark({ level = 0.45, className, ...props }: DuniaMarkProps) {
  const clipId = useId();
  const clamped = Math.min(1, Math.max(0, level));
  const y = (53 - clamped * 42).toFixed(1);

  return (
    <svg
      viewBox="0 0 64 64"
      aria-hidden="true"
      className={cn("size-8 shrink-0", className)}
      {...props}
    >
      <defs>
        <clipPath id={clipId}>
          <circle cx="32" cy="32" r="21.5" />
        </clipPath>
      </defs>
      <circle
        cx="32"
        cy="32"
        r="27"
        fill="none"
        stroke="var(--primary)"
        strokeWidth="7"
      />
      <g clipPath={`url(#${clipId})`}>
        <path
          d={`M0 ${y}q8 -4.5 16 0t16 0t16 0t16 0V64H0Z`}
          fill="var(--visited)"
        />
      </g>
    </svg>
  );
}

type DuniaLogoProps = React.ComponentProps<"span"> & {
  level?: number;
};

/** Mark + "dunia" wordmark. Size it with a text-* class. */
export function DuniaLogo({ level, className, ...props }: DuniaLogoProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-[0.12em] font-heading text-2xl font-extrabold leading-none tracking-[-0.035em]",
        className
      )}
      {...props}
    >
      <DuniaMark level={level} className="size-[0.86em]" />
      dunia
    </span>
  );
}
