import { getPreset } from "./presets";
import { clipStarts, formatTimecode, planDuration } from "./time";
import { BUILT_IN_SFX, type EditPlan, type MarkerKind, type Seconds } from "./types";

/**
 * Where the playbook's retention structure lands for a video of a given length.
 *
 * The playbook describes a 13-minute average with re-engagements around minute 3
 * and minute 6. For other lengths this scales by ratio (3/13 = 0.23, 6/13 = 0.46).
 * Under 8 minutes the beast-skill rule applies instead: the promise is confirmed
 * early (10 to 45 s), and the two re-engagements sit at the quarter and half marks.
 */
export type RetentionTargets = {
  duration: Seconds;
  hookEnd: Seconds;
  reengage1: Seconds;
  reengage2: Seconds;
  backHalfStart: Seconds;
  tolerance: Seconds;
  isShortForm: boolean;
};

export const retentionTargets = (duration: Seconds): RetentionTargets => {
  const under8 = duration < 8 * 60;
  const hookEnd = under8 ? clamp(duration * 0.125, 10, 45) : 60;
  const reengage1 = under8 ? duration * 0.25 : duration * 0.23;
  const reengage2 = under8 ? duration * 0.5 : duration * 0.46;
  return {
    duration,
    hookEnd,
    reengage1,
    reengage2,
    backHalfStart: reengage2,
    tolerance: Math.max(3, duration * 0.03),
    isShortForm: duration <= 70,
  };
};

/** Section name for a point in time, shown by the studio guide. */
export const sectionAt = (time: Seconds, t: RetentionTargets): string => {
  if (time < t.hookEnd) return "FIRST MINUTE: confirm the thumbnail";
  if (time < t.reengage1 - t.tolerance) return "PROGRESSION: show, don't tell";
  if (time <= t.reengage1 + t.tolerance) return "RE-ENGAGEMENT 1";
  if (time < t.reengage2 - t.tolerance) return "SIMPLE + EXCITING: fast scene changes";
  if (time <= t.reengage2 + t.tolerance) return "RE-ENGAGEMENT 2";
  return "BACK HALF: never signal the end";
};

export type Severity = "pass" | "warn" | "fail";

export type CheckResult = {
  severity: Severity;
  rule: string;
  message: string;
  at?: Seconds;
};

const END_SIGNALS = [
  "finally",
  "to wrap up",
  "wrap this up",
  "in conclusion",
  "that's it for",
  "before we end",
  "last but not least",
  "마지막으로",
  "정리하자면",
  "끝으로",
];

const LATE_ASKS = ["subscribe", "like and", "comment below", "구독", "좋아요"];

const SLOW_OPENERS = ["welcome back", "hey guys", "what's up guys", "before we start", "intro", "안녕하세요 여러분"];

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

const markerAt = (plan: EditPlan, kind: MarkerKind) => plan.markers.find((m) => m.kind === kind);

/** Lowercase transcript with word start times, for phrase searches. */
const transcriptIndex = (plan: EditPlan) => {
  const words = [...plan.captions].sort((a, b) => a.start - b.start);
  return {
    find(phrase: string): Seconds[] {
      const target = phrase.toLowerCase().split(/\s+/);
      const hits: Seconds[] = [];
      for (let i = 0; i + target.length <= words.length; i++) {
        let ok = true;
        for (let j = 0; j < target.length; j++) {
          const w = words[i + j].text.toLowerCase().replace(/[^\p{L}\p{N}']/gu, "");
          if (!w.startsWith(target[j].replace(/[^\p{L}\p{N}']/gu, ""))) {
            ok = false;
            break;
          }
        }
        if (ok) hits.push(words[i].start);
      }
      return hits;
    },
  };
};

/**
 * Check an edit plan against the playbook structure and the preset's pacing.
 * fail = the structure is broken; warn = worth a second look; pass = fine.
 */
export const checkPlan = (plan: EditPlan): CheckResult[] => {
  const out: CheckResult[] = [];
  const add = (severity: Severity, rule: string, message: string, at?: Seconds) =>
    out.push({ severity, rule, message, at });

  const preset = getPreset(plan.preset);
  const duration = planDuration(plan);
  if (plan.clips.length === 0 || duration <= 0) {
    add("fail", "clips", "The plan has no clips.");
    return out;
  }
  const t = retentionTargets(duration);
  const starts = clipStarts(plan.clips);
  const text = transcriptIndex(plan);

  add(
    "pass",
    "targets",
    `Length ${formatTimecode(duration)}. Hook ends by ${formatTimecode(t.hookEnd)}, re-engagement 1 near ${formatTimecode(
      t.reengage1,
    )}, re-engagement 2 near ${formatTimecode(t.reengage2)} (tolerance ±${t.tolerance.toFixed(1)} s).`,
  );

  if (t.isShortForm) {
    add(
      "warn",
      "short-form",
      "70 s or shorter. The playbook covers long-form; only the promise and ending checks are meaningful here.",
    );
  }

  // 1. Thumbnail promise must be visible before the hook ends.
  const promiseDeadline = t.hookEnd + t.tolerance;
  for (const element of plan.thumbnailPromise) {
    const key = element.toLowerCase();
    const inClips = plan.clips.some(
      (clip, i) => starts[i] < promiseDeadline && (clip.promise ?? []).some((p) => p.toLowerCase() === key),
    );
    const inOverlays = plan.overlays.some(
      (o) => o.at < promiseDeadline && (o.promise ?? []).some((p) => p.toLowerCase() === key),
    );
    if (inClips || inOverlays) {
      add("pass", "promise", `Thumbnail element "${element}" appears before ${formatTimecode(promiseDeadline)}.`);
    } else {
      add(
        "fail",
        "promise",
        `Thumbnail element "${element}" never appears before ${formatTimecode(promiseDeadline)}. Viewers who clicked for it will leave.`,
      );
    }
  }

  // 2. Slow openers in the first seconds.
  for (const phrase of SLOW_OPENERS) {
    for (const at of text.find(phrase)) {
      if (at < 10) add("warn", "hook", `"${phrase}" at ${formatTimecode(at)} delays the promise. Open on the payoff of the title instead.`, at);
    }
  }

  // 3. Hook marker.
  const hook = markerAt(plan, "hook-end");
  if (!hook) add("warn", "hook", "No hook-end marker. Mark where the promise is fully confirmed.");
  else if (hook.at > t.hookEnd + t.tolerance)
    add("warn", "hook", `Hook ends at ${formatTimecode(hook.at)}, later than the ${formatTimecode(t.hookEnd)} target.`, hook.at);
  else add("pass", "hook", `Hook ends at ${formatTimecode(hook.at)}.`, hook.at);

  // 4. Re-engagements.
  const re: Array<[MarkerKind, Seconds, string]> = [
    ["reengage-1", t.reengage1, "re-engagement 1"],
    ["reengage-2", t.reengage2, "re-engagement 2"],
  ];
  for (const [kind, target, label] of re) {
    const m = markerAt(plan, kind);
    if (!m) {
      add("fail", "reengage", `No ${label} marker. Plan a spectacle near ${formatTimecode(target)}.`);
      continue;
    }
    const delta = m.at - target;
    if (Math.abs(delta) <= t.tolerance) add("pass", "reengage", `${label} at ${formatTimecode(m.at)} (target ${formatTimecode(target)}).`, m.at);
    else
      add(
        "warn",
        "reengage",
        `${label} at ${formatTimecode(m.at)} is ${Math.abs(delta).toFixed(1)} s ${delta > 0 ? "late" : "early"} (target ${formatTimecode(target)}).`,
        m.at,
      );
  }

  // 5. Shot length.
  plan.clips.forEach((clip, i) => {
    const inBackHalf = starts[i] >= t.backHalfStart;
    const limit = preset.maxShotSeconds * (inBackHalf ? preset.backHalfShotFactor : 1);
    if (clip.duration > limit) {
      add(
        "warn",
        "shot-length",
        `Shot ${i + 1} runs ${clip.duration.toFixed(1)} s (limit ${limit.toFixed(1)} s for ${plan.preset}${inBackHalf ? ", back half" : ""}). Cut it or cover it with B-roll.`,
        starts[i],
      );
    }
  });

  // 6. Cuts per minute before re-engagement 1 (where pacing matters most).
  const window = Math.max(10, t.reengage1);
  const cutsInWindow = starts.filter((s) => s > 0 && s < window).length;
  const cpm = (cutsInWindow / window) * 60;
  const { min, max } = preset.cutsPerMinute;
  if (cpm < min)
    add("warn", "pacing", `${cpm.toFixed(0)} cuts/min before re-engagement 1, below the ${plan.preset} range of ${min} to ${max}.`);
  else if (cpm > max)
    add("warn", "pacing", `${cpm.toFixed(0)} cuts/min before re-engagement 1, above the ${plan.preset} range of ${min} to ${max}. Let scenes breathe.`);
  else add("pass", "pacing", `${cpm.toFixed(0)} cuts/min before re-engagement 1 (${plan.preset} range ${min} to ${max}).`);

  // 7. End signals before the payoff.
  const payoff = markerAt(plan, "payoff");
  const payoffAt = payoff?.at ?? duration;
  for (const phrase of END_SIGNALS) {
    for (const at of text.find(phrase)) {
      if (at < payoffAt) add("warn", "end-signal", `"${phrase}" at ${formatTimecode(at)} tells viewers the video is ending.`, at);
    }
  }
  for (const m of plan.markers.filter((m) => m.kind === "end-signal")) {
    add("warn", "end-signal", `End-signal marker at ${formatTimecode(m.at)}${m.note ? `: ${m.note}` : ""}.`, m.at);
  }

  // 8. Payoff and abrupt ending.
  if (!payoff) add("fail", "ending", "No payoff marker. The video needs a payoff before it ends.");
  else {
    const tail = duration - payoff.at;
    if (tail > preset.payoffToEndMaxSeconds)
      add(
        "warn",
        "ending",
        `${tail.toFixed(1)} s between the payoff and the last frame (max ${preset.payoffToEndMaxSeconds} s for ${plan.preset}). End abruptly.`,
        payoff.at,
      );
    else add("pass", "ending", `Ends ${tail.toFixed(1)} s after the payoff.`, payoff.at);
    for (const phrase of LATE_ASKS) {
      for (const at of text.find(phrase)) {
        if (at > payoff.at) add("warn", "ending", `"${phrase}" after the payoff at ${formatTimecode(at)} drags the ending.`, at);
      }
    }
  }

  // 9. Dead air in the hook: caption gaps with nothing else happening.
  const words = [...plan.captions].sort((a, b) => a.start - b.start);
  for (let i = 1; i < words.length; i++) {
    const gapStart = words[i - 1].end;
    const gapEnd = words[i].start;
    if (gapEnd > t.hookEnd) break;
    if (gapEnd - gapStart < 2) continue;
    const covered =
      plan.overlays.some((o) => o.at < gapEnd && o.at + o.duration > gapStart) ||
      plan.effects.some((e) => e.at >= gapStart && e.at <= gapEnd) ||
      plan.sfx.some((s) => s.at >= gapStart && s.at <= gapEnd) ||
      starts.some((s) => s > gapStart && s < gapEnd);
    if (!covered)
      add("warn", "dead-air", `${(gapEnd - gapStart).toFixed(1)} s of silence with nothing on screen at ${formatTimecode(gapStart)}.`, gapStart);
  }

  // 10. Timing sanity.
  for (const o of plan.overlays) {
    if (o.at < 0 || o.at + o.duration > duration + 0.01)
      add("fail", "timing", `${o.type} overlay at ${formatTimecode(o.at)} runs past the end of the video.`, o.at);
  }
  for (const e of plan.effects) {
    if (e.at < 0 || e.at > duration) add("fail", "timing", `${e.type} effect at ${formatTimecode(e.at)} is outside the video.`, e.at);
  }
  for (const s of plan.sfx) {
    const builtIn = (BUILT_IN_SFX as readonly string[]).includes(s.name);
    if (!builtIn && !/\.(wav|mp3|m4a|aac|ogg)$/i.test(s.name))
      add("fail", "sfx", `SFX "${s.name}" is neither built in nor an audio file path.`, s.at);
  }

  return out;
};

export const summarize = (results: CheckResult[]) => ({
  pass: results.filter((r) => r.severity === "pass").length,
  warn: results.filter((r) => r.severity === "warn").length,
  fail: results.filter((r) => r.severity === "fail").length,
});
