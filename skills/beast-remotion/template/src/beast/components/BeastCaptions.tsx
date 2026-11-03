import React, { useMemo } from "react";
import { AbsoluteFill, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { activeChunk, chunkCaptions, displayWord, toneColor } from "../captions";
import type { PresetConfig } from "../presets";
import { px } from "../theme";
import { toFrames } from "../time";
import type { CaptionMode, CaptionWord, Seconds } from "../types";
import { OutlinedText } from "./OutlinedText";

type Props = {
  words: CaptionWord[];
  mode: CaptionMode;
  keywords?: string[];
  preset: PresetConfig;
  /**
   * Time ranges where a full-screen statement (big text, elimination) owns the
   * frame. Captions step aside there instead of stacking under it.
   */
  quietRanges?: Array<[Seconds, Seconds]>;
};

/**
 * Word-pop captions.
 *
 * Each word springs from `captionFromScale` to 1 at its own start time, so a
 * two-word chunk lands as two quick hits rather than one block. Highlighted
 * words (money, numbers, keywords, danger words) get a color and a glow.
 */
export const BeastCaptions: React.FC<Props> = ({ words, mode, keywords, preset, quietRanges = [] }) => {
  const frame = useCurrentFrame();
  const { fps, height, width } = useVideoConfig();
  const chunks = useMemo(
    () =>
      chunkCaptions(words, {
        mode,
        wordsPerChunk: preset.wordsPerChunk,
        gapSeconds: preset.chunkGapSeconds,
        keywords,
      }),
    [words, mode, keywords, preset.wordsPerChunk, preset.chunkGapSeconds],
  );

  const time = frame / fps;
  if (quietRanges.some(([from, to]) => time >= from && time < to)) return null;
  const chunk = activeChunk(chunks, time);
  if (!chunk) return null;

  const size = px(mode === "keywords" ? preset.captionFontSize * 1.15 : preset.captionFontSize, height);
  const stroke = px(preset.captionStroke, height);

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: width * 0.06,
          right: width * 0.06,
          top: height * preset.captionY,
          transform: "translateY(-50%)",
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
          // The outline layer spills `stroke` px past each word, so add it to the gap.
          gap: `${size * 0.12}px ${size * 0.3 + stroke}px`,
        }}
      >
        {chunk.words.map((word, i) => {
          const startFrame = toFrames(word.start, fps);
          if (frame < startFrame) return null;
          const pop = spring({
            frame: frame - startFrame,
            fps,
            config: preset.captionSpring,
          });
          const scale = preset.captionFromScale + (1 - preset.captionFromScale) * pop;
          const tilt = preset.captionTilt === 0 ? 0 : (random(`tilt-${word.start}-${i}`) * 2 - 1) * preset.captionTilt;
          const color = toneColor(word.tone);
          return (
            <span
              key={`${word.start}-${i}`}
              style={{
                display: "inline-block",
                transform: `scale(${scale}) rotate(${tilt * (1 - pop * 0.6)}deg)`,
                transformOrigin: "50% 60%",
              }}
            >
              <OutlinedText size={size} stroke={stroke} color={color} glow={color !== "white"}>
                {displayWord(word.text)}
              </OutlinedText>
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
