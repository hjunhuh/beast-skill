import React from "react";
import { AbsoluteFill, getRemotionEnvironment } from "remotion";
import { BeastCaptions } from "./components/BeastCaptions";
import { Footage } from "./components/Footage";
import { Flashes, Overlays } from "./components/Overlays";
import { RetentionGuide } from "./components/RetentionGuide";
import { SoundTrack } from "./components/SoundTrack";
import { ensureFonts } from "./fonts";
import { getPreset } from "./presets";
import { planDuration } from "./time";
import type { EditPlan } from "./types";

export type BeastVideoProps = {
  plan: EditPlan;
  /** Show the retention guide. Defaults to on in the Studio, off in renders. */
  showGuides?: boolean;
};

ensureFonts();

/**
 * Layer order, bottom to top:
 * footage (with camera punches, shakes, freezes) -> overlays -> captions ->
 * flashes -> studio guide. Sound is not visual and sits alongside.
 */
export const BeastVideo: React.FC<BeastVideoProps> = ({ plan, showGuides }) => {
  const preset = getPreset(plan.preset);
  const guides = showGuides ?? getRemotionEnvironment().isStudio;
  const quietRanges = plan.overlays
    .filter((o) => o.type === "big-text" || o.type === "eliminated")
    .map((o): [number, number] => [o.at, o.at + o.duration]);
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <Footage clips={plan.clips} effects={plan.effects} preset={preset} />
      <Overlays overlays={plan.overlays} />
      <BeastCaptions
        words={plan.captions}
        mode={plan.captionMode ?? preset.captionMode}
        keywords={plan.keywords}
        preset={preset}
        quietRanges={quietRanges}
      />
      <Flashes effects={plan.effects} preset={preset} />
      <SoundTrack sfx={plan.sfx} music={plan.music} captions={plan.captions} preset={preset} />
      {guides ? <RetentionGuide duration={planDuration(plan)} markers={plan.markers} /> : null}
    </AbsoluteFill>
  );
};
