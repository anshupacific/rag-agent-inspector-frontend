/** Display helpers used across the app. */

export function formatNumber(value: number | null | undefined): string {
  return typeof value === "number" ? value.toLocaleString("en-US") : "unknown";
}

export function formatDuration(ms: number): string {
  return ms < 1000 ? `${ms} ms` : `${(ms / 1000).toFixed(1)} s`;
}

/** Evaluator scores are whole numbers on most scales; show a decimal only when there is one. */
export function formatScore(score: number): string {
  return Number.isInteger(score) ? String(score) : score.toFixed(1);
}

export function plural(count: number, word: string): string {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}
