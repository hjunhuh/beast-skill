import React from "react";
import { Html5Audio, Sequence, staticFile, useVideoConfig } from "remotion";
import { isSpeaking } from "../captions";
import type { PresetConfig } from "../presets";
import { toFrames } from "../time";
import { BUILT_IN_SFX, type CaptionWord, type MusicBed, type SfxCue } from "../types";

const resolve = (src: string) => (/^https?:\/\//.test(src) ? src : staticFile(src));

const sfxPath = (name: string) =>
  (BUILT_IN_SFX as readonly string[]).includes(name) ? `sfx/${name}.wav` : name;

/**
 * SFX cues plus an optional music bed that ducks under speech.
 * Built-in SFX are synthesized by `npm run assets` into public/sfx.
 */
export const SoundTrack: React.FC<{
  sfx: SfxCue[];
  music?: MusicBed;
  captions: CaptionWord[];
  preset: PresetConfig;
}> = ({ sfx, music, captions, preset }) => {
  const { fps } = useVideoConfig();
  const musicStart = toFrames(music?.startAt ?? 0, fps);
  return (
    <>
      {sfx.map((cue, i) => (
        <Sequence key={i} from={toFrames(cue.at, fps)} name={`sfx ${cue.name}`} layout="none">
          <Html5Audio src={resolve(sfxPath(cue.name))} volume={cue.volume ?? preset.sfxVolume} />
        </Sequence>
      ))}
      {music ? (
        <Sequence from={musicStart} name="music" layout="none">
          <Html5Audio
            src={resolve(music.src)}
            loop
            volume={(f) => {
              const time = (f + musicStart) / fps;
              return isSpeaking(captions, time) ? music.duckTo ?? 0.08 : music.volume ?? 0.22;
            }}
          />
        </Sequence>
      ) : null}
    </>
  );
};
