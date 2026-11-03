import type { Clip, EditPlan, Seconds } from "./types";

export const toFrames = (seconds: Seconds, fps: number): number =>
  Math.round(seconds * fps);

export const toSeconds = (frames: number, fps: number): Seconds => frames / fps;

/** Total length of the plan: clips are laid back to back like jump cuts. */
export const planDuration = (plan: Pick<EditPlan, "clips">): Seconds =>
  plan.clips.reduce((sum, clip) => sum + clip.duration, 0);

/** Start time of every clip, in seconds. */
export const clipStarts = (clips: Clip[]): Seconds[] => {
  const starts: Seconds[] = [];
  let cursor = 0;
  for (const clip of clips) {
    starts.push(cursor);
    cursor += clip.duration;
  }
  return starts;
};

/** 83.4 -> "1:23.4", used in checker reports and the studio guide. */
export const formatTimecode = (seconds: Seconds): string => {
  const sign = seconds < 0 ? "-" : "";
  const s = Math.abs(seconds);
  const minutes = Math.floor(s / 60);
  const rest = s - minutes * 60;
  const whole = Math.floor(rest);
  const tenth = Math.floor((rest - whole) * 10);
  return `${sign}${minutes}:${String(whole).padStart(2, "0")}.${tenth}`;
};

/** 172800 -> "48:00:00", used by the timer HUD. */
export const formatClock = (totalSeconds: number): string => {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const mm = String(m).padStart(2, "0");
  const ss = String(sec).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
};

/** 12500 -> "12,500". Integers only, the way money counters read on screen. */
export const formatAmount = (value: number): string =>
  Math.round(value).toLocaleString("en-US");
