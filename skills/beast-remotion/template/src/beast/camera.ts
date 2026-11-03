import { Easing, interpolate, random } from "remotion";
import type { PresetConfig } from "./presets";
import type { CameraMove, Effect } from "./types";
import { toFrames } from "./time";

export type CameraTransform = {
  scale: number;
  x: number;
  y: number;
  rotate: number;
};

/** Zoom that belongs to a clip: a tighter crop or a slow push across the shot. */
export const clipCamera = (
  move: CameraMove | undefined,
  frameInClip: number,
  clipFrames: number,
  preset: PresetConfig,
): number => {
  switch (move) {
    case "punch-in":
      return preset.punchInClipScale;
    case "slow-push":
      return interpolate(frameInClip, [0, Math.max(1, clipFrames)], [1, 1 + preset.slowPushAmount], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
    case "none":
    case undefined:
      return 1;
  }
};

/**
 * A punch zooms in fast, holds, and eases back out at the end of its duration.
 * Returns the multiplier to apply on top of the clip scale.
 */
const punchScale = (frame: number, start: number, end: number, target: number, preset: PresetConfig) => {
  if (frame < start || frame > end) return 1;
  const inEnd = start + preset.punchInFrames;
  const outStart = Math.max(inEnd, end - preset.punchOutFrames);
  if (frame <= inEnd) {
    return interpolate(frame, [start, inEnd], [1, target], {
      easing: Easing.out(Easing.cubic),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  }
  if (frame < outStart) return target;
  return interpolate(frame, [outStart, end], [target, 1], {
    easing: Easing.inOut(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
};

/**
 * Shake decays linearly over its duration. Noise is seeded by frame so every
 * render of the same frame is identical, which Remotion requires.
 */
const shakeOffset = (frame: number, start: number, end: number, intensity: number) => {
  if (frame < start || frame >= end) return { x: 0, y: 0, rotate: 0 };
  const decay = interpolate(frame, [start, end], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const amp = intensity * decay;
  return {
    x: (random(`shake-x-${frame}`) * 2 - 1) * amp,
    y: (random(`shake-y-${frame}`) * 2 - 1) * amp,
    rotate: (random(`shake-r-${frame}`) * 2 - 1) * amp * 0.04,
  };
};

/** Combine every punch and shake active at this frame into one transform. */
export const effectsCamera = (
  frame: number,
  fps: number,
  effects: Effect[],
  preset: PresetConfig,
  heightScale: number,
): CameraTransform => {
  let scale = 1;
  let x = 0;
  let y = 0;
  let rotate = 0;
  for (const effect of effects) {
    if (effect.type === "punch") {
      const start = toFrames(effect.at, fps);
      const end = start + Math.max(preset.punchInFrames + 1, toFrames(effect.duration, fps));
      scale *= punchScale(frame, start, end, effect.scale ?? preset.punchScale, preset);
    }
    if (effect.type === "shake") {
      const start = toFrames(effect.at, fps);
      const end = start + Math.max(1, toFrames(effect.duration, fps));
      const offset = shakeOffset(frame, start, end, (effect.intensity ?? preset.shakeIntensity) * heightScale);
      x += offset.x;
      y += offset.y;
      rotate += offset.rotate;
    }
  }
  return { scale, x, y, rotate };
};

export const transformCss = (t: CameraTransform): string =>
  `translate(${t.x.toFixed(2)}px, ${t.y.toFixed(2)}px) rotate(${t.rotate.toFixed(3)}deg) scale(${t.scale.toFixed(4)})`;
