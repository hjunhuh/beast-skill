import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

/** One-frame-bright flash that decays over a few frames. Used to hide hard cuts. */
export const Flash: React.FC<{ color?: string; durationInFrames: number }> = ({ color = "white", durationInFrames }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, durationInFrames], [0.95, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return <AbsoluteFill style={{ backgroundColor: color, opacity }} />;
};
