import { Easing, interpolate, spring } from "remotion";

/**
 * Shared entrance and exit curves for overlays. Every overlay is rendered
 * inside its own <Sequence>, so `frame` starts at 0 when the overlay appears.
 */
export const enterExit = (
  frame: number,
  fps: number,
  durationInFrames: number,
  options: { exitFrames?: number; damping?: number; stiffness?: number; mass?: number } = {},
) => {
  const exitFrames = options.exitFrames ?? 5;
  const enter = spring({
    frame,
    fps,
    config: {
      damping: options.damping ?? 11,
      stiffness: options.stiffness ?? 220,
      mass: options.mass ?? 0.6,
    },
  });
  const exit = interpolate(frame, [durationInFrames - exitFrames, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.cubic),
  });
  return { enter, exit };
};

/**
 * A "slam": the element starts oversized and transparent, then lands at 1.
 * Reads as a hit on the beat, which is why big text and stamps use it.
 */
export const slam = (frame: number, landFrames = 5, fromScale = 1.9) => {
  const t = interpolate(frame, [0, landFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const settle = interpolate(frame, [landFrames, landFrames + 3, landFrames + 6], [1, 0.96, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return {
    scale: (fromScale + (1 - fromScale) * t) * settle,
    opacity: t,
  };
};
