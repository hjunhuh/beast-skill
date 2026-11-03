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
