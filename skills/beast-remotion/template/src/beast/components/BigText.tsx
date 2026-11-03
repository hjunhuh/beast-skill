import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { slam } from "../anim";
import { px } from "../theme";
import type { TextColor } from "../types";
import { OutlinedText } from "./OutlinedText";

/**
 * Full-screen statement text: "48 HOURS", "NOBODY FOR 20 MILES".
 * Slams in, holds dead center, then drops out fast so it never lingers.
 */
export const BigText: React.FC<{ text: string; color?: TextColor; durationInFrames: number }> = ({
  text,
  color = "white",
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const { height, width } = useVideoConfig();
  const { scale, opacity } = slam(frame);
  const out = interpolate(frame, [durationInFrames - 4, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const lines = text.split("\n");
  const longest = Math.max(...lines.map((l) => l.length));
  // Shrink long lines so they fit inside 88% of the width.
  const size = Math.min(px(190, height), (width * 0.88) / Math.max(1, longest * 0.62));
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        opacity: opacity * out,
        transform: `scale(${scale * (0.9 + 0.1 * out)})`,
      }}
    >
      {lines.map((line, i) => (
        <OutlinedText key={i} size={size} stroke={px(16, height)} color={color} glow={color !== "white"}>
          {line}
        </OutlinedText>
      ))}
    </AbsoluteFill>
  );
};
