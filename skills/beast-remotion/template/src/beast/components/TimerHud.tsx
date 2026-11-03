import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { enterExit } from "../anim";
import { formatClock } from "../time";
import { COLORS, FONT_FAMILY, px } from "../theme";

type Props = {
  startSeconds: number;
  direction: "down" | "up";
  rate?: number;
  label?: string;
  durationInFrames: number;
};

/**
 * Corner clock for time-bound challenges. `rate` maps video time to in-world
 * time, so a 48-hour challenge can count down over a 15-minute video. In the
 * last 10% of a countdown it turns red and pulses.
 */
export const TimerHud: React.FC<Props> = ({ startSeconds, direction, rate = 1, label, durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps, height, width } = useVideoConfig();
  const { enter, exit } = enterExit(frame, fps, durationInFrames, { damping: 16 });
  const elapsed = (frame / fps) * rate;
  const value = direction === "down" ? startSeconds - elapsed : startSeconds + elapsed;
  const urgent = direction === "down" && value <= startSeconds * 0.1;
  const pulse = urgent ? 1 + 0.06 * Math.sin((frame / fps) * Math.PI * 4) : 1;
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: width * 0.03,
          top: height * 0.04,
          display: "flex",
          alignItems: "center",
          gap: px(14, height),
          padding: `${px(10, height)}px ${px(22, height)}px`,
          borderRadius: px(16, height),
          background: urgent ? COLORS.red : "rgba(0,0,0,0.72)",
          border: `${px(4, height)}px solid ${urgent ? "white" : COLORS.yellow}`,
          transform: `translateX(${interpolate(enter, [0, 1], [-width * 0.25, 0])}px) scale(${pulse})`,
          transformOrigin: "left center",
          opacity: exit,
        }}
      >
        <span
          style={{
            fontFamily: FONT_FAMILY,
            fontWeight: 900,
            fontSize: px(58, height),
            color: "white",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {formatClock(value)}
        </span>
        {label ? (
          <span
            style={{
              fontFamily: FONT_FAMILY,
              fontWeight: 800,
              fontSize: px(28, height),
              color: urgent ? "white" : COLORS.yellow,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            {label}
          </span>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
