import React from "react";
import { COLORS, FONT_FAMILY, GLOW, INK } from "../theme";
import type { TextColor } from "../types";

type Props = {
  children: string;
  size: number;
  stroke: number;
  color?: TextColor;
  glow?: boolean;
  weight?: 800 | 900;
  style?: React.CSSProperties;
};

/**
 * Thick-outlined caption text.
 *
 * -webkit-text-stroke draws half the stroke over the fill, which eats into
 * heavy letters. Rendering an outline layer underneath and the fill on top keeps
 * the full letter shape and gives the chunky sticker look.
 */
export const OutlinedText: React.FC<Props> = ({
  children,
  size,
  stroke,
  color = "white",
  glow = false,
  weight = 900,
  style,
}) => {
  const base: React.CSSProperties = {
    fontFamily: FONT_FAMILY,
    fontWeight: weight,
    fontSize: size,
    lineHeight: 1,
    letterSpacing: "-0.01em",
    textTransform: "uppercase",
    whiteSpace: "pre",
  };
  return (
    <span style={{ position: "relative", display: "inline-block", ...style }}>
      <span
        aria-hidden
        style={{
          ...base,
          position: "absolute",
          inset: 0,
          color: INK,
          WebkitTextStroke: `${stroke * 2}px ${INK}`,
          textShadow: `0 ${stroke * 0.7}px 0 ${INK}`,
        }}
      >
        {children}
      </span>
      <span
        style={{
          ...base,
          position: "relative",
          color: COLORS[color],
          textShadow: glow ? GLOW[color] : undefined,
        }}
      >
        {children}
      </span>
    </span>
  );
};
