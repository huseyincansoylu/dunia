/** Country counts worth celebrating. The last one is every country. */
export const MILESTONES = [5, 10, 25, 50, 75, 100, 125, 150, 175, 197] as const;

const HEADLINES: Record<number, string> = {
  5: "Off to a good start.",
  10: "Double digits.",
  25: "A traveler, officially.",
  50: "A quarter of the world, seen.",
  75: "More than a third of the world.",
  100: "Over half the world.",
  125: "Most of the world, seen.",
  150: "Three quarters of the world.",
  175: "Almost everywhere.",
  197: "Every country on Earth.",
};

export const milestoneHeadline = (m: number) => HEADLINES[m] ?? `${m} countries.`;

/** The milestone reached by going from `before` to `after` countries, if any. */
export function crossedMilestone(before: number, after: number): number | null {
  return [...MILESTONES].reverse().find((m) => before < m && after >= m) ?? null;
}

export const nextMilestone = (count: number) => MILESTONES.find((m) => m > count) ?? null;
