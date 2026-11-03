import React from "react";
import { Composition, type CalculateMetadataFunction } from "remotion";
import { BeastVideo, type BeastVideoProps } from "./beast/BeastVideo";
import { planDuration } from "./beast/time";
import type { EditPlan } from "./beast/types";
import { demoPlan } from "./demo/demoPlan";

/** Size and length come from the plan, so `--props` can drive any video. */
const fromPlan: CalculateMetadataFunction<BeastVideoProps> = ({ props }) => ({
  durationInFrames: Math.max(1, Math.round(planDuration(props.plan) * props.plan.fps)),
  fps: props.plan.fps,
  width: props.plan.width,
  height: props.plan.height,
});

const emptyPlan: EditPlan = {
  title: "Pass a plan with --props",
  preset: "classic",
  fps: 30,
  width: 1920,
  height: 1080,
  thumbnailPromise: [],
  clips: [{ source: { kind: "placeholder", label: "Render with --props=path/to/props.json" }, duration: 3 }],
  captions: [],
  overlays: [],
  effects: [],
  sfx: [],
  markers: [],
};

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="BeastDemo"
      component={BeastVideo}
      defaultProps={{ plan: demoPlan } satisfies BeastVideoProps}
      calculateMetadata={fromPlan}
      durationInFrames={1}
      fps={30}
      width={1920}
      height={1080}
    />
    <Composition
      id="BeastVideo"
      component={BeastVideo}
      defaultProps={{ plan: emptyPlan } satisfies BeastVideoProps}
      calculateMetadata={fromPlan}
      durationInFrames={1}
      fps={30}
      width={1920}
      height={1080}
    />
  </>
);
