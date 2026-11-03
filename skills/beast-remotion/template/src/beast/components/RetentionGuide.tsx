import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { retentionTargets, sectionAt } from "../retention";
import { FONT_FAMILY, px } from "../theme";
import { formatTimecode } from "../time";
import type { Marker } from "../types";

/**
 * Studio-only guide: the current playbook section and a progress bar with the
 * re-engagement targets (yellow) and your plan's markers (white). It answers
 * "which minute am I working on?" for whoever is editing.
 */
export const RetentionGuide: React.FC<{ duration: number; markers: Marker[] }> = ({ duration, markers }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = retentionTargets(duration);
  const time = frame / fps;
  const barW = width * 0.6;
  const tick = (at: number, color: string, tall: boolean, key: string) => (
    <div
      key={key}
      style={{
        position: "absolute",
        left: (at / duration) * barW - 2,
        top: tall ? -px(10, height) : -px(4, height),
        width: 4,
        height: tall ? px(28, height) : px(16, height),
        background: color,
      }}
    />
  );
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: (width - barW) / 2,
          bottom: height * 0.03,
          width: barW,
          fontFamily: FONT_FAMILY,
          color: "white",
        }}
      >
        <div style={{ fontSize: px(22, height), fontWeight: 800, marginBottom: px(10, height), textShadow: "0 2px 4px black" }}>
          {formatTimecode(time)} / {sectionAt(time, t)}
        </div>
        <div style={{ position: "relative", height: px(8, height), background: "rgba(255,255,255,0.25)" }}>
          <div style={{ width: `${(time / duration) * 100}%`, height: "100%", background: "white" }} />
          {tick(t.hookEnd, "#2EF05A", true, "hook")}
          {tick(t.reengage1, "#FFE11A", true, "r1")}
          {tick(t.reengage2, "#FFE11A", true, "r2")}
          {markers.map((m, i) => tick(m.at, "white", false, `m${i}`))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
