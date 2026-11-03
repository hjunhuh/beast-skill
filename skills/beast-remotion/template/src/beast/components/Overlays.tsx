import React from "react";
import { Sequence, useVideoConfig } from "remotion";
import type { PresetConfig } from "../presets";
import { toFrames } from "../time";
import type { Effect, Overlay } from "../types";
import { BigText } from "./BigText";
import { ArrowCallout, CircleCallout } from "./Callouts";
import { Counter } from "./Counter";
import { DayStamp } from "./DayStamp";
import { Eliminated } from "./Eliminated";
import { Flash } from "./Flash";
import { NameTag } from "./NameTag";
import { PriceTag } from "./PriceTag";
import { TimerHud } from "./TimerHud";

const renderOverlay = (overlay: Overlay, durationInFrames: number, slot: number): React.ReactNode => {
  switch (overlay.type) {
    case "big-text":
      return <BigText text={overlay.text} color={overlay.color} durationInFrames={durationInFrames} />;
    case "counter":
      return (
        <Counter
          from={overlay.from}
          to={overlay.to}
          prefix={overlay.prefix}
          suffix={overlay.suffix}
          label={overlay.label}
          color={overlay.color}
          durationInFrames={durationInFrames}
        />
      );
    case "timer":
      return (
        <TimerHud
          startSeconds={overlay.startSeconds}
          direction={overlay.direction}
          rate={overlay.rate}
          label={overlay.label}
          durationInFrames={durationInFrames}
        />
      );
    case "day":
      return <DayStamp day={overlay.day} total={overlay.total} durationInFrames={durationInFrames} />;
    case "price-tag":
      return (
        <PriceTag
          amount={overlay.amount}
          label={overlay.label}
          currency={overlay.currency}
          durationInFrames={durationInFrames}
          slot={slot}
        />
      );
    case "circle":
      return <CircleCallout x={overlay.x} y={overlay.y} radius={overlay.radius} durationInFrames={durationInFrames} />;
    case "arrow":
      return (
        <ArrowCallout x={overlay.x} y={overlay.y} from={overlay.from} text={overlay.text} durationInFrames={durationInFrames} />
      );
    case "eliminated":
      return <Eliminated name={overlay.name} durationInFrames={durationInFrames} />;
    case "name-tag":
      return <NameTag name={overlay.name} number={overlay.number} side={overlay.side} durationInFrames={durationInFrames} />;
  }
};

/** Consecutive price tags that overlap in time sit side by side instead of stacking. */
const priceTagSlots = (overlays: Overlay[]): Map<Overlay, number> => {
  const slots = new Map<Overlay, number>();
  const tags = overlays.filter((o) => o.type === "price-tag").sort((a, b) => a.at - b.at);
  tags.forEach((tag, i) => {
    let slot = 0;
    for (let j = 0; j < i; j++) {
      const prev = tags[j];
      if (prev.at + prev.duration > tag.at) slot = Math.max(slot, (slots.get(prev) ?? 0) + 1);
    }
    slots.set(tag, slot);
  });
  return slots;
};

export const Overlays: React.FC<{ overlays: Overlay[] }> = ({ overlays }) => {
  const { fps } = useVideoConfig();
  const slots = priceTagSlots(overlays);
  return (
    <>
      {overlays.map((overlay, i) => {
        const durationInFrames = Math.max(2, toFrames(overlay.duration, fps));
        return (
          <Sequence key={i} from={toFrames(overlay.at, fps)} durationInFrames={durationInFrames} name={`${overlay.type} ${i + 1}`}>
            {renderOverlay(overlay, durationInFrames, slots.get(overlay) ?? 0)}
          </Sequence>
        );
      })}
    </>
  );
};

/** Flashes sit above everything, including captions. */
export const Flashes: React.FC<{ effects: Effect[]; preset: PresetConfig }> = ({ effects, preset }) => {
  const { fps } = useVideoConfig();
  return (
    <>
      {effects.map((effect, i) =>
        effect.type === "flash" ? (
          <Sequence key={i} from={toFrames(effect.at, fps)} durationInFrames={preset.flashFrames} name={`flash ${i + 1}`}>
            <Flash color={effect.color} durationInFrames={preset.flashFrames} />
          </Sequence>
        ) : null,
      )}
    </>
  );
};
