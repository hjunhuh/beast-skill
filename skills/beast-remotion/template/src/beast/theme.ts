import type { TextColor } from "./types";

/** Brand-neutral palette in the spirit of high-energy YouTube graphics. */
export const COLORS: Record<TextColor, string> = {
  white: "#FFFFFF",
  yellow: "#FFE11A",
  green: "#2EF05A",
  red: "#FF2D2D",
};

export const INK = "#000000";

/** Glow used behind highlighted words and counters. */
export const GLOW: Record<TextColor, string> = {
  white: "0 0 0 rgba(0,0,0,0)",
  yellow: "0 0 28px rgba(255, 225, 26, 0.55)",
  green: "0 0 30px rgba(46, 240, 90, 0.6)",
  red: "0 0 30px rgba(255, 45, 45, 0.6)",
};

/**
 * Montserrat (SIL Open Font License) is loaded from public/fonts by
 * `npm run assets`. The fallbacks keep renders readable if it is missing.
 */
export const FONT_FAMILY = "Montserrat, 'Arial Black', Impact, sans-serif";

/** Scale a value designed at 1080p to the current composition height. */
export const px = (valueAt1080: number, height: number): number =>
  (valueAt1080 * height) / 1080;
