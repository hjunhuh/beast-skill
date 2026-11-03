import React from "react";
import {
  AbsoluteFill,
  Freeze,
  Img,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { clipCamera, effectsCamera, transformCss } from "../camera";
import type { PresetConfig } from "../presets";
import { clipStarts, toFrames } from "../time";
import type { Clip, Effect } from "../types";
import { PlaceholderShot } from "./PlaceholderShot";

const resolveSrc = (src: string) => (/^https?:\/\//.test(src) ? src : staticFile(src));

const ClipLayer: React.FC<{ clip: Clip; index: number; preset: PresetConfig }> = ({ clip, index, preset }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const clipFrames = toFrames(clip.duration, fps);
  const scale = clipCamera(clip.camera, frame, clipFrames, preset);
  const source = clip.source;
  return (
    <AbsoluteFill style={{ transform: `scale(${scale})`, overflow: "hidden" }}>
      {source.kind === "video" ? (
        <OffthreadVideo
          src={resolveSrc(source.src)}
          trimBefore={toFrames(source.trimStart ?? 0, fps)}
          muted={source.muted}
          volume={source.volume ?? 1}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : source.kind === "image" ? (
        <Img src={resolveSrc(source.src)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        <PlaceholderShot label={source.label} index={index} hue={source.hue} />
      )}
    </AbsoluteFill>
  );
};

/**
 * The picture track: clips laid back to back (jump cuts), wrapped in one
 * camera layer that applies punches and shakes, and one Freeze that holds the
 * picture during freeze effects.
 */
export const Footage: React.FC<{ clips: Clip[]; effects: Effect[]; preset: PresetConfig }> = ({
  clips,
  effects,
  preset,
}) => {
  const frame = useCurrentFrame();
  const { fps, height } = useVideoConfig();
  const starts = clipStarts(clips);
  const camera = effectsCamera(frame, fps, effects, preset, height / 1080);

  const freeze = effects.find(
    (e) => e.type === "freeze" && frame >= toFrames(e.at, fps) && frame < toFrames(e.at + e.duration, fps),
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "black", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: transformCss(camera) }}>
        <Freeze frame={freeze ? toFrames(freeze.at, fps) : 0} active={Boolean(freeze)}>
          {clips.map((clip, i) => (
            <Sequence
              key={clip.id ?? i}
              from={toFrames(starts[i], fps)}
              durationInFrames={Math.max(1, toFrames(clip.duration, fps))}
              premountFor={Math.round(fps)}
              name={clip.source.kind === "placeholder" ? clip.source.label : clip.id ?? `Clip ${i + 1}`}
            >
              <ClipLayer clip={clip} index={i} preset={preset} />
            </Sequence>
          ))}
        </Freeze>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
