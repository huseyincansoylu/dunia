/** Shared by the database schema and the browser. */
export const VISIT_STATUSES = ["visited", "want", "lived"] as const;
export type VisitStatus = (typeof VISIT_STATUSES)[number];

/** Statuses that count toward someone's number. "want" is the wishlist. */
export const COUNTED_STATUSES: readonly VisitStatus[] = ["visited", "lived"];
export const isCounted = (status: VisitStatus) => COUNTED_STATUSES.includes(status);

export const NOTE_MAX_LENGTH = 500;
export const YEAR_MIN = 1900;
