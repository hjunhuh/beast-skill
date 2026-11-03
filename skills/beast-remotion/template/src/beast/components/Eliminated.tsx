import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { slam } from "../anim";
import { COLORS, FONT_FAMILY, px } from "../theme";

/**
 * Elimination beat: the picture underneath goes grayscale with a red tint
 * (via backdrop-filter, so it works on any footage), then a stamp slams in.
 */
export const Eliminated: React.FC<{ name: string; durationInFrames: number }> = ({ name, durationInFrames }) => {
  const frame = useCurrentFrame();
  const { height } = useVideoConfig();
  const tint = interpolate(frame, [0, 3], [0, 1], { extrapolateRight: "clamp" });
  const out = interpolate(frame, [durationInFrames - 5, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const { scale, opacity } = slam(Math.max(0, frame - 3), 4, 2.4);
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <AbsoluteFill
        style={{
          backdropFilter: `grayscale(${tint}) contrast(1.15)`,
          WebkitBackdropFilter: `grayscale(${tint}) contrast(1.15)`,
          backgroundColor: `rgba(255, 30, 30, ${0.18 * tint})`,
        }}
      />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div
          style={{
            transform: `rotate(-8deg) scale(${scale})`,
            opacity,
            border: `${px(14, height)}px solid ${COLORS.red}`,
            borderRadius: px(18, height),
            padding: `${px(10, height)}px ${px(40, height)}px`,
            textAlign: "center",
            background: "rgba(0,0,0,0.35)",
          }}
        >
          <div
            style={{
              fontFamily: FONT_FAMILY,
              fontWeight: 900,
              fontSize: px(150, height),
              color: COLORS.red,
              lineHeight: 1,
              letterSpacing: "0.02em",
            }}
          >
            ELIMINATED
          </div>
          <div
            style={{
              fontFamily: FONT_FAMILY,
              fontWeight: 900,
              fontSize: px(60, height),
              color: "white",
              textTransform: "uppercase",
            }}
          >
            {name}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
