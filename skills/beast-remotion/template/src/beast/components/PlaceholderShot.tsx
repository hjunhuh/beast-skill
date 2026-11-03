import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT_FAMILY, px } from "../theme";

type Props = {
  label: string;
  index: number;
  hue?: number;
};

/**
 * Stand-in for footage that has not been shot yet. It moves (so punches and
 * shakes are visible) and names the shot, so a plan can be reviewed as a
 * moving storyboard before anyone picks up a camera.
 */
export const PlaceholderShot: React.FC<Props> = ({ label, index, hue }) => {
  const frame = useCurrentFrame();
  const { height, width } = useVideoConfig();
  const h = hue ?? (index * 47) % 360;
  const stripe = px(80, height);
  const offset = (frame * 3) % (stripe * 2);
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 30% 30%, hsl(${h} 70% 46%), hsl(${(h + 40) % 360} 65% 18%))`,
        overflow: "hidden",
      }}
    >
      <AbsoluteFill
        style={{
          backgroundImage: `repeating-linear-gradient(135deg, rgba(255,255,255,0.06) 0 ${stripe}px, rgba(0,0,0,0) ${stripe}px ${stripe * 2}px)`,
          backgroundPosition: `${offset}px 0`,
        }}
      />
      {/* Bottom-left, below the caption line, so HUDs and counters stay readable. */}
      <div
        style={{
          position: "absolute",
          left: width * 0.08,
          right: width * 0.08,
          bottom: height * 0.1,
          fontFamily: FONT_FAMILY,
          color: "rgba(255,255,255,0.9)",
        }}
      >
        <div
          style={{
            fontWeight: 800,
            fontSize: px(24, height),
            letterSpacing: "0.08em",
            opacity: 0.75,
            textTransform: "uppercase",
          }}
        >
          Shot {String(index + 1).padStart(2, "0")} / replace with footage
        </div>
        <div style={{ fontWeight: 800, fontSize: px(38, height), lineHeight: 1.15 }}>{label}</div>
      </div>
    </AbsoluteFill>
  );
};
