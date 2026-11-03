import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { enterExit } from "../anim";
import { COLORS, FONT_FAMILY, px } from "../theme";

/** Contestant tag: a numbered badge plus a name, sliding in from the side. */
export const NameTag: React.FC<{
  name: string;
  number?: number;
  side?: "left" | "right";
  durationInFrames: number;
}> = ({ name, number, side = "left", durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const { enter, exit } = enterExit(frame, fps, durationInFrames, { damping: 14 });
  const dir = side === "left" ? -1 : 1;
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          [side]: width * 0.04,
          bottom: height * 0.36,
          display: "flex",
          flexDirection: side === "left" ? "row" : "row-reverse",
          alignItems: "stretch",
          transform: `translateX(${interpolate(enter, [0, 1], [dir * width * 0.4, 0])}px)`,
          opacity: exit,
          boxShadow: `0 ${px(8, height)}px 0 rgba(0,0,0,0.45)`,
        }}
      >
        {number !== undefined ? (
          <div
            style={{
              background: COLORS.yellow,
              color: "black",
              fontFamily: FONT_FAMILY,
              fontWeight: 900,
              fontSize: px(54, height),
              padding: `${px(6, height)}px ${px(18, height)}px`,
              display: "flex",
              alignItems: "center",
            }}
          >
            #{number}
          </div>
        ) : null}
        <div
          style={{
            background: "black",
            color: "white",
            fontFamily: FONT_FAMILY,
            fontWeight: 900,
            fontSize: px(54, height),
            padding: `${px(6, height)}px ${px(26, height)}px`,
            textTransform: "uppercase",
          }}
        >
          {name}
        </div>
      </div>
    </AbsoluteFill>
  );
};
