---
name: beast-remotion
description: Reference implementation of MrBeast-style YouTube editing in Remotion (React and TypeScript). Turns a beast-skill section map, a script or a transcript into a typed edit plan, checks the plan against the playbook's retention structure, and renders it with word-pop captions, punch zooms, camera shake, flashes, freeze frames, money counters, a challenge timer, day stamps, stair-stepping price tags, circle and arrow callouts, elimination stamps, name tags and license-free synthesized SFX. Use it whenever the user wants to edit, caption, animate or render a video in MrBeast or retention-editing style with code, mentions Remotion together with YouTube editing, captions, zooms or sound effects, or wants to turn a video plan into an actual render.
---

# beast-remotion

A working Remotion project lives in `template/`. It renders MrBeast-style retention editing from a single JSON-serializable **edit plan**, and ships a checker that tests the plan against the structure in the MrBeast production playbook (see the `beast-skill` skill). Your job is to turn what the user has (an idea, a section map, a script, footage, a transcript) into a plan, make the checker pass, and render.

"The same as MrBeast" means the same **editing grammar**: how captions pop, when zooms hit, what the graphics do, which sound lands on which beat, and where the re-engagements fall. It never means his brand. Do not put the MrBeast name, logo, face, voice or footage into a render, and do not make a video look like an official MrBeast upload. The template uses Montserrat Black (SIL Open Font License) for captions; MrBeast-style caption presets elsewhere are reported to use a font called CCSignLanguage, which you should only use if the user has a license for it.

## What is in template/

```
template/
  package.json            scripts: assets, dev, check, check:demo, plan:demo, render, render:demo, still:demo, typecheck, test
  remotion.config.ts      JPEG frames at quality 92, overwrite on
  src/
    index.ts, Root.tsx    compositions "BeastDemo" (demo plan) and "BeastVideo" (plan from --props)
    beast/
      types.ts            the EditPlan contract: clips, captions, overlays, effects, sfx, music, markers
      presets.ts          every number for "classic" and "modern" in one place
      retention.ts        retentionTargets(), sectionAt(), checkPlan()
      captions.ts         classifyWord(), chunkCaptions(), spreadWords(), displayWord()
      camera.ts           clip camera moves, punch and shake math
      anim.ts             shared enter/exit and "slam" curves
      fonts.ts            loads Montserrat from public/fonts before the first frame
      BeastVideo.tsx      layer stack: footage, overlays, captions, flashes, sound, studio guide
      components/         BeastCaptions, Footage, PlaceholderShot, BigText, Counter, TimerHud,
                          DayStamp, PriceTag, Callouts (circle, arrow), Eliminated, NameTag,
                          Flash, Overlays, SoundTrack, RetentionGuide, OutlinedText
    demo/demoPlan.ts      88-second "48 Hours On A Deserted Island With $10" built from placeholders
  scripts/
    setup-assets.ts       copies fonts into public/fonts and synthesizes SFX into public/sfx
    check-plan.ts         CLI for checkPlan(); exits 1 on any FAIL
    export-demo-plan.ts   prints the demo as a props file to start from
    lib/wav.ts, lib/sfx.ts  dependency-free WAV synth for whoosh, pop, ding, boom, cash, riser, tick, buzzer
    beast.test.ts         node:test suite (targets, captions, checker, SFX)
```

Read `template/src/beast/types.ts` before writing a plan; it documents every field.

## Workflow

1. **Get the plan right first.** If the user has no section map, run the `beast-skill` workflow (packaging first, then the minute-by-minute map). From it you need: total length, preset, the thumbnail promise elements, and the timecodes for the hook end, both re-engagements, any midpoint payoff and the final payoff.
2. **Set up the project.**
   ```bash
   cp -r <this skill>/template ./my-video && cd my-video
   npm install
   npm run assets        # fonts + SFX into public/ (dev and render run this too)
   ```
   Put footage in `public/footage/` and reference it as `footage/name.mp4`.
3. **Write the plan.** Either a TypeScript file modeled on `src/demo/demoPlan.ts` (best when Claude is writing it: typed, and `clipStarts()` lets overlays reference clip starts), or JSON via `npm run plan:demo > plans/my-video.json` and edit. Use the mapping table below.
4. **Add captions.** Word-level timestamps give the real pop rhythm (see "Captions from a transcript"). With only a script, `spreadWords(line, start, end)` spreads a line across its time range.
5. **Check.** `npm run check -- plans/my-video.json` (or `npm run check:demo`). Fix every FAIL. For each WARN, fix it or tell the user why it is intentional.
6. **Preview.** `npm run dev` opens Remotion Studio. The guide bar at the bottom shows the current playbook section, the hook and re-engagement targets (green and yellow ticks) and the plan's markers (white ticks). It is hidden in renders unless `showGuides: true`.
7. **Render.** `npm run render -- out/my-video.mp4 --props=plans/my-video.json`. A props file is `{"plan": {...}}`.
8. **Report** the checker summary, the preset, and anything you could not do (for example missing footage left as placeholders).

Placeholders are a feature: a plan made entirely of `{ kind: "placeholder", label }` clips renders as a moving storyboard, so the structure can be reviewed before anything is shot.
