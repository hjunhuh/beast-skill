import type { CaptionMode, Preset } from "./types";

/**
 * Every number the renderer and the plan checker use lives here, so a channel
 * can tune its own house style in one place.
 *
 * Sourced values:
 * - cutsPerMinute: Tubefilter counted 38 cuts in one minute of a 2023 MrBeast
 *   video and 23 in a 2024 one. The ranges are built around those two counts.
 * - maxShotSeconds (classic): a former editor described an older video in which
 *   no single shot lasted more than five seconds (Passionfruit).
 * - wordsPerChunk (classic): MrBeast-style captions are usually two words per line.
 *
 * Everything else (spring constants, zoom scales, pixel sizes) is a starting
 * point tuned by eye at 1920x1080 and 30 fps, not a value from the playbook.
 */
export type PresetConfig = {
  captionMode: CaptionMode;
  wordsPerChunk: number;
  /** Max silence inside one caption chunk before it splits. */
  chunkGapSeconds: number;
  /** Font size at 1080p. Scales with the composition height. */
  captionFontSize: number;
  /** Vertical center of the caption line, 0 = top, 1 = bottom. */
  captionY: number;
  /** Outline width at 1080p. */
  captionStroke: number;
  /** Max random tilt per word, in degrees. */
  captionTilt: number;
  /** Spring for each word popping in. */
  captionSpring: { damping: number; stiffness: number; mass: number };
  /** Scale a word starts from before it springs to 1. */
  captionFromScale: number;

  /** Default scale for a punch effect and its timing in frames. */
  punchScale: number;
  punchInFrames: number;
  punchOutFrames: number;
  /** Scale used for clips marked camera: "punch-in". */
  punchInClipScale: number;
  /** Total zoom across a clip marked camera: "slow-push". */
  slowPushAmount: number;

  /** Shake amplitude in px at 1080p. */
  shakeIntensity: number;
  flashFrames: number;

  sfxVolume: number;

  /** Plan checker thresholds. */
  cutsPerMinute: { min: number; max: number };
  maxShotSeconds: number;
  /** Back half shots may run this much longer than maxShotSeconds. */
  backHalfShotFactor: number;
  /** Max seconds between the payoff and the last frame. */
  payoffToEndMaxSeconds: number;
};

export const PRESETS: Record<Preset, PresetConfig> = {
  classic: {
    captionMode: "chunks",
    wordsPerChunk: 2,
    chunkGapSeconds: 0.35,
    captionFontSize: 118,
    captionY: 0.74,
    captionStroke: 13,
    captionTilt: 4,
    captionSpring: { damping: 9, stiffness: 240, mass: 0.55 },
    captionFromScale: 0.45,

    punchScale: 1.16,
    punchInFrames: 3,
    punchOutFrames: 6,
    punchInClipScale: 1.22,
    slowPushAmount: 0.06,

    shakeIntensity: 22,
    flashFrames: 4,

    sfxVolume: 0.85,

    cutsPerMinute: { min: 24, max: 45 },
    maxShotSeconds: 5,
    backHalfShotFactor: 1.5,
    payoffToEndMaxSeconds: 4,
  },
  modern: {
    captionMode: "keywords",
    wordsPerChunk: 3,
    chunkGapSeconds: 0.45,
    captionFontSize: 92,
    captionY: 0.8,
    captionStroke: 10,
    captionTilt: 0,
    captionSpring: { damping: 16, stiffness: 190, mass: 0.7 },
    captionFromScale: 0.75,

    punchScale: 1.08,
    punchInFrames: 6,
    punchOutFrames: 10,
    punchInClipScale: 1.15,
    slowPushAmount: 0.05,

    shakeIntensity: 11,
    flashFrames: 3,

    sfxVolume: 0.6,

    cutsPerMinute: { min: 15, max: 30 },
    maxShotSeconds: 9,
    backHalfShotFactor: 1.6,
    payoffToEndMaxSeconds: 8,
  },
};

export const getPreset = (preset: Preset): PresetConfig => PRESETS[preset];
