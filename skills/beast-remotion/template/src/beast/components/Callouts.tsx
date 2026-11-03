import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, px } from "../theme";
import { OutlinedText } from "./OutlinedText";

/** Red hand-drawn style circle that draws itself around a point of interest. */
export const CircleCallout: React.FC<{ x: number; y: number; radius: number; durationInFrames: number }> = ({
  x,
  y,
  radius,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const r = radius * height;
  const cx = x * width;
  const cy = y * height;
  const circumference = 2 * Math.PI * r;
  const draw = interpolate(frame, [0, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const out = interpolate(frame, [durationInFrames - 4, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const stroke = px(12, height);
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <svg width={width} height={height}>
        <ellipse
          cx={cx}
          cy={cy}
          rx={r * 1.08}
          ry={r}
          fill="none"
          stroke="black"
          strokeWidth={stroke * 1.8}
          strokeDasharray={circumference * 1.05}
          strokeDashoffset={circumference * 1.05 * (1 - draw)}
          transform={`rotate(-12 ${cx} ${cy})`}
          strokeLinecap="round"
        />
        <ellipse
          cx={cx}
          cy={cy}
          rx={r * 1.08}
          ry={r}
          fill="none"
          stroke={COLORS.red}
          strokeWidth={stroke}
          strokeDasharray={circumference * 1.05}
          strokeDashoffset={circumference * 1.05 * (1 - draw)}
          transform={`rotate(-12 ${cx} ${cy})`}
          strokeLinecap="round"
        />
      </svg>
    </AbsoluteFill>
  );
};

/** Arrow that slides in from the side and bobs at its target, with an optional label. */
export const ArrowCallout: React.FC<{
  x: number;
  y: number;
  from?: "left" | "right";
  text?: string;
  durationInFrames: number;
}> = ({ x, y, from = "left", text, durationInFrames }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const dir = from === "left" ? -1 : 1;
  const slide = interpolate(frame, [0, 6], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.back(1.6)),
  });
  const bob = Math.sin(frame / 3) * px(8, height);
  const out = interpolate(frame, [durationInFrames - 4, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const len = px(220, height);
  const head = px(70, height);
  const thick = px(34, height);
  const tipX = x * width + dir * (slide * width * 0.4 + bob);
  const tipY = y * height;
  // Arrow drawn pointing right, then mirrored when it comes from the right.
  const path = `M ${-len} ${-thick / 2} L ${-head} ${-thick / 2} L ${-head} ${-head * 0.6} L 0 0 L ${-head} ${head * 0.6} L ${-head} ${thick / 2} L ${-len} ${thick / 2} Z`;
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <svg width={width} height={height}>
        <g transform={`translate(${tipX} ${tipY}) scale(${from === "left" ? 1 : -1} 1)`}>
          <path d={path} fill="black" stroke="black" strokeWidth={px(14, height)} strokeLinejoin="round" />
          <path d={path} fill={COLORS.red} />
        </g>
      </svg>
      {text ? (
        <div
          style={{
            position: "absolute",
            left: tipX + (from === "left" ? -len - px(20, height) : len + px(20, height)),
            top: tipY,
            transform: `translate(${from === "left" ? "-100%" : "0"}, -50%)`,
          }}
        >
          <OutlinedText size={px(64, height)} stroke={px(9, height)} color="yellow">
            {text}
          </OutlinedText>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
