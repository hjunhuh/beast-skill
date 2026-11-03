import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { enterExit } from "../anim";
import { formatAmount } from "../time";
import { COLORS, FONT_FAMILY, px } from "../theme";
import type { TextColor } from "../types";
import { OutlinedText } from "./OutlinedText";

type Props = {
  from: number;
  to: number;
  prefix?: string;
  suffix?: string;
  label?: string;
  color?: TextColor;
  durationInFrames: number;
};

/**
 * Money / quantity counter. Counts up over the first 65% of its time with an
 * ease-out so the last digits settle, then holds the final value. Pair it with
 * "tick" SFX while counting and "cash" when it lands.
 */
export const Counter: React.FC<Props> = ({ from, to, prefix = "$", suffix = "", label, color = "green", durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps, height } = useVideoConfig();
  const { enter, exit } = enterExit(frame, fps, durationInFrames);
  const countEnd = Math.max(2, Math.round(durationInFrames * 0.65));
  const value = interpolate(frame, [2, countEnd], [from, to], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const landed = frame >= countEnd;
  const bump = landed ? interpolate(frame, [countEnd, countEnd + 4, countEnd + 8], [1, 1.12, 1], { extrapolateRight: "clamp" }) : 1;
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: height * 0.07 }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          transform: `translateY(${(1 - enter) * -height * 0.15}px) scale(${bump})`,
          opacity: exit,
        }}
      >
        {label ? (
          <div
            style={{
              fontFamily: FONT_FAMILY,
              fontWeight: 900,
              fontSize: px(40, height),
              color: "black",
              background: COLORS.yellow,
              padding: `${px(6, height)}px ${px(18, height)}px`,
              borderRadius: px(10, height),
              marginBottom: px(10, height),
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            {label}
          </div>
        ) : null}
        <OutlinedText size={px(150, height)} stroke={px(15, height)} color={color} glow>
          {`${prefix}${formatAmount(value)}${suffix}`}
        </OutlinedText>
      </div>
    </AbsoluteFill>
  );
};
