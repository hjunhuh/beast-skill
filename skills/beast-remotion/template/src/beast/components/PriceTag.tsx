import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { formatAmount } from "../time";
import { COLORS, FONT_FAMILY, px } from "../theme";

/**
 * Hanging price tag for stair stepping ($1, $10, $50 ... world record).
 * Swings in from the top and settles with a little pendulum motion.
 */
export const PriceTag: React.FC<{
  amount: number;
  label: string;
  currency?: string;
  durationInFrames: number;
  /** Stagger index, so consecutive tags sit side by side. */
  slot?: number;
}> = ({ amount, label, currency = "$", durationInFrames, slot = 0 }) => {
  const frame = useCurrentFrame();
  const { fps, height, width } = useVideoConfig();
  const drop = spring({ frame, fps, config: { damping: 10, stiffness: 140, mass: 0.8 } });
  const swing = Math.sin(frame / 5) * 7 * Math.exp(-frame / 18);
  const out = interpolate(frame, [durationInFrames - 5, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const x = width * (0.08 + (slot % 4) * 0.22);
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: x,
          top: interpolate(drop, [0, 1], [-height * 0.35, height * 0.1]),
          transform: `rotate(${-6 + swing}deg)`,
          transformOrigin: "50% -40px",
          opacity: out,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          background: "white",
          border: `${px(6, height)}px solid black`,
          borderRadius: px(20, height),
          padding: `${px(18, height)}px ${px(30, height)}px ${px(14, height)}px`,
          boxShadow: `0 ${px(12, height)}px 0 rgba(0,0,0,0.45)`,
          minWidth: width * 0.16,
        }}
      >
        <div
          style={{
            width: px(26, height),
            height: px(26, height),
            borderRadius: "50%",
            border: `${px(5, height)}px solid black`,
            marginBottom: px(8, height),
          }}
        />
        <div
          style={{
            fontFamily: FONT_FAMILY,
            fontWeight: 900,
            fontSize: px(84, height),
            color: COLORS.green,
            WebkitTextStroke: `${px(3, height)}px black`,
            lineHeight: 1,
          }}
        >
          {currency}
          {formatAmount(amount)}
        </div>
        <div
          style={{
            fontFamily: FONT_FAMILY,
            fontWeight: 800,
            fontSize: px(34, height),
            color: "black",
            textTransform: "uppercase",
            marginTop: px(6, height),
          }}
        >
          {label}
        </div>
      </div>
    </AbsoluteFill>
  );
};
