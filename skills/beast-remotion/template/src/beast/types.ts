/**
 * The edit plan is the contract between planning (the beast-skill section map)
 * and rendering. Every time value is in seconds from the start of the video so
 * that a plan can be written by hand, by Claude, or exported from a transcript.
 */

export type Seconds = number;

/**
 * classic: 2019 to 2023 retention editing. Two-word captions on every line,
 *          hard punch zooms, short shots, loud SFX.
 * modern:  2024 onward. Story first, breathers between scenes, captions only on
 *          keywords, softer zooms, longer shots.
 */
export type Preset = "classic" | "modern";

export type ClipSource =
  | {
      kind: "video";
      /** Path inside public/ (for staticFile) or an absolute https URL. */
      src: string;
      /** Seconds to skip at the start of the source file. */
      trimStart?: Seconds;
      muted?: boolean;
      /** 0 to 1. Defaults to 1. */
      volume?: number;
    }
  | { kind: "image"; src: string }
  | {
      kind: "placeholder";
      /** Describes the shot that will replace this placeholder. */
      label: string;
      /** 0 to 360. Picks the background color so neighboring shots differ. */
      hue?: number;
    };

/**
 * none:     the frame as shot.
 * slow-push: a gentle 6% zoom across the clip (keeps static shots alive).
 * punch-in: the clip is shown at a tighter crop, like a second camera angle.
 */
export type CameraMove = "none" | "slow-push" | "punch-in";

export type Clip = {
  id?: string;
  source: ClipSource;
  duration: Seconds;
  camera?: CameraMove;
  /** Thumbnail promise elements visible in this clip (checked by the planner). */
  promise?: string[];
};

export type CaptionWord = {
  text: string;
  start: Seconds;
  end: Seconds;
};

/**
 * chunks:   every spoken word, grouped into short chunks (classic default).
 * keywords: only money, numbers and listed keywords pop on screen (modern default).
 * off:      no captions.
 */
export type CaptionMode = "chunks" | "keywords" | "off";

export const BUILT_IN_SFX = [
  "whoosh",
  "pop",
  "ding",
  "boom",
  "cash",
  "riser",
  "tick",
  "buzzer",
] as const;
export type BuiltInSfx = (typeof BUILT_IN_SFX)[number];

export type SfxCue = {
  at: Seconds;
  /** A built-in name, or a path inside public/ such as "sfx/custom/laugh.mp3". */
  name: BuiltInSfx | (string & {});
  /** 0 to 1. Defaults to the preset's SFX volume. */
  volume?: number;
};

export type MusicBed = {
  /** Path inside public/ or an https URL. Bring your own licensed track. */
  src: string;
  /** Volume when nobody is talking. Defaults to 0.22. */
  volume?: number;
  /** Volume under speech. Defaults to 0.08. */
  duckTo?: number;
  /** Seconds into the video where the bed starts. Defaults to 0. */
  startAt?: Seconds;
};

export type MarkerKind =
  | "hook-end"
  | "reengage-1"
  | "reengage-2"
  | "midpoint-payoff"
  | "payoff"
  | "end-signal";

export type Marker = {
  at: Seconds;
  kind: MarkerKind;
  note?: string;
};

type OverlayBase = {
  at: Seconds;
  duration: Seconds;
  /** Thumbnail promise elements this overlay shows (checked by the planner). */
  promise?: string[];
};

export type TextColor = "white" | "yellow" | "green" | "red";

export type Overlay =
  | (OverlayBase & { type: "big-text"; text: string; color?: TextColor })
  | (OverlayBase & {
      type: "counter";
      from: number;
      to: number;
      prefix?: string;
      suffix?: string;
      label?: string;
      color?: TextColor;
    })
  | (OverlayBase & {
      type: "timer";
      /** In-world seconds shown when the overlay appears, e.g. 48 * 3600. */
      startSeconds: number;
      direction: "down" | "up";
      /** In-world seconds that pass per second of video. 1 = real time. */
      rate?: number;
      label?: string;
    })
  | (OverlayBase & { type: "day"; day: number; total?: number })
  | (OverlayBase & {
      type: "price-tag";
      amount: number;
      label: string;
      currency?: string;
    })
  | (OverlayBase & {
      type: "circle";
      /** Center, as a fraction of the frame (0 to 1). */
      x: number;
      y: number;
      /** Radius as a fraction of the frame height. */
      radius: number;
    })
  | (OverlayBase & {
      type: "arrow";
      /** The point the arrow tip touches, as a fraction of the frame. */
      x: number;
      y: number;
      from?: "left" | "right";
      text?: string;
    })
  | (OverlayBase & { type: "eliminated"; name: string })
  | (OverlayBase & {
      type: "name-tag";
      name: string;
      number?: number;
      side?: "left" | "right";
    });

export type Effect =
  | { type: "flash"; at: Seconds; color?: string }
  | { type: "shake"; at: Seconds; duration: Seconds; intensity?: number }
  | { type: "punch"; at: Seconds; duration: Seconds; scale?: number }
  | { type: "freeze"; at: Seconds; duration: Seconds };

export type EditPlan = {
  title: string;
  preset: Preset;
  fps: number;
  width: number;
  height: number;
  /** Everything the thumbnail shows. Each must appear before the hook ends. */
  thumbnailPromise: string[];
  clips: Clip[];
  captions: CaptionWord[];
  captionMode?: CaptionMode;
  /** Words that always get the highlight color (case-insensitive). */
  keywords?: string[];
  overlays: Overlay[];
  effects: Effect[];
  sfx: SfxCue[];
  music?: MusicBed;
  markers: Marker[];
};
