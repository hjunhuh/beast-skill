import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { slam } from "../anim";
import { COLORS, FONT_FAMILY, px } from "../theme";

/**
 * "DAY 2" chapter stamp. Slams in tilted at the top right, the way crazy
 * progression is marked when several days pass inside the first minutes.
 */
export const DayStamp: React.FC<{ day: number; total?: number; durationInFrames: number }> = ({
  day,
  total,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const { height, width } = useVideoConfig();
  const { scale, opacity } = slam(frame, 4, 2.2);
  const out = interpolate(frame, [durationInFrames - 5, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          right: width * 0.05,
          top: height * 0.07,
          transform: `rotate(-6deg) scale(${scale})`,
          opacity: opacity * out,
          background: COLORS.yellow,
          color: "black",
          border: `${px(8, height)}px solid black`,
          borderRadius: px(18, height),
          padding: `${px(8, height)}px ${px(34, height)}px`,
          fontFamily: FONT_FAMILY,
          fontWeight: 900,
          fontSize: px(96, height),
          lineHeight: 1,
          boxShadow: `0 ${px(10, height)}px 0 rgba(0,0,0,0.5)`,
        }}
      >
        DAY {day}
        {total ? <span style={{ fontSize: px(48, height), opacity: 0.7 }}>/{total}</span> : null}
      </div>
    </AbsoluteFill>
  );
};
