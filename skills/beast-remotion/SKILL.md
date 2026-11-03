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

## Section map to plan

| beast-skill section map | Edit plan |
|---|---|
| Thumbnail elements | `thumbnailPromise: [...]`, plus `promise: [...]` on the clip or overlay where each appears. The checker fails if one is missing before the hook ends |
| End of the first minute (promise confirmed) | `markers: { kind: "hook-end" }` |
| Front-loaded preview of the best moments | three 1 s placeholder or footage clips, a `flash` and a `whoosh` on each cut, outcomes not shown |
| Re-engagement 1 and 2 | `markers: { kind: "reengage-1" }` and `"reengage-2"` at the beat, plus the recipe below |
| Crazy progression | `day` stamps, a running `timer`, short clips |
| Midpoint payoff (long videos) | `markers: { kind: "midpoint-payoff" }` |
| Final payoff | `markers: { kind: "payoff" }`; the video should end within `payoffToEndMaxSeconds` |
| Each scene row | one or more `clips` (jump cuts are clips back to back) |

## Presets

Pick **modern** by default for new uploads; pick **classic** when the user asks for retention editing as it looked in 2019 to 2023. In March 2024 MrBeast said he had slowed his videos down, focused on story and stopped yelling as much; Tubefilter counted 38 cuts in one minute of a 2023 video and 23 in a 2024 one. The checker's pacing ranges are built around those two counts.

All values are at 1920x1080 and 30 fps and scale with the composition height. Values marked "sourced" come from reporting; the rest are starting points tuned by eye and live in `presets.ts`.

| Setting | classic | modern | |
|---|---|---|---|
| Caption mode | `chunks` (every word) | `keywords` (money, numbers, keywords only) | |
| Words per chunk | 2 | 3 | sourced (classic) |
| Caption size / stroke | 118 px / 13 px | 92 px / 10 px | |
| Caption line height | 74% down | 80% down | |
| Word pop | spring damping 9, stiffness 240, mass 0.55, from 0.45 scale, up to ±4° tilt | damping 16, stiffness 190, mass 0.7, from 0.75, no tilt | |
| Punch effect | 1.16x, in 3 frames, out 6 frames | 1.08x, in 6, out 10 | |
| Clip `punch-in` crop | 1.22x | 1.15x | |
| Clip `slow-push` | +6% across the clip | +5% | |
| Shake | 22 px, linear decay | 11 px | |
| Flash | 4 frames | 3 frames | |
| SFX volume | 0.85 | 0.6 | |
| Cuts per minute before re-engagement 1 | 24 to 45 | 15 to 30 | sourced (38 and 23) |
| Longest shot | 5 s (7.5 s in the back half) | 9 s (14.4 s in the back half) | sourced (classic) |
| Payoff to last frame | 4 s or less | 8 s or less | |

## Overlay catalog

All overlays take `at` and `duration` in seconds. Pair them with SFX as listed; the SFX are separate cues so you control the exact frame.

| type | Use it for | Key fields | Typical duration | SFX |
|---|---|---|---|---|
| `big-text` | One-line statements at the hook and re-engagements ("48 HOURS", "NOBODY FOR 20 MILES"). Captions step aside while it is up. `\n` breaks lines | `text`, `color` | 0.9 to 1.5 s | `boom` (plus `whoosh` just before) |
| `counter` | Money and quantities. Counts with ease-out over the first 65%, then bumps | `from`, `to`, `prefix` ("$"), `suffix`, `label`, `color` | 2 to 2.5 s | `tick` at start, `cash` at 65% |
| `timer` | Time-bound challenges. Turns red and pulses in the last 10% of a countdown | `startSeconds`, `direction`, `rate` (in-world seconds per video second), `label` | the whole challenge | none |
| `day` | Chapter stamps that make progression visible | `day`, `total` | 1.4 to 1.6 s | `boom` |
| `price-tag` | Stair stepping. Overlapping tags line up side by side | `amount`, `label`, `currency` | stagger 0.6 s apart | `pop` per tag |
| `circle` | Point at the critical detail (draws itself in 8 frames) | `x`, `y` (0 to 1), `radius` (fraction of height) | about 2 s | `ding` |
| `arrow` | Same, with a label ("SAVE THIS") | `x`, `y`, `from`, `text` | about 2 s | `ding` or `pop` |
| `eliminated` | Elimination beats. Grayscale and red tint on the picture, then a stamp | `name` | 1.5 to 2 s | `buzzer` |
| `name-tag` | First appearance of each person | `name`, `number`, `side` | about 2 s | `pop` |

| effect | Use it for | Key fields |
|---|---|---|
| `punch` | Reveals, punchlines, reactions. In classic, about one every 3 s at most; in modern, only on real hits | `at`, `duration`, `scale` |
| `shake` | Impacts, wind, collapses | `at`, `duration`, `intensity` |
| `flash` | Hiding hard cuts in preview montages, marking a re-engagement | `at`, `color` |
| `freeze` | Holding a frame under a statement. The source keeps running underneath, so freeze on silent moments or mute the clip | `at`, `duration` |

Built-in SFX: `whoosh`, `pop`, `ding`, `boom`, `cash`, `riser`, `tick`, `buzzer`. Anything else is a path inside `public/` (for example `sfx/custom/laugh.mp3`). Music is `music: { src, volume, duckTo }` and ducks automatically while a caption word is being spoken. The user must bring a licensed track.

## Beat recipes

These are the combinations that read as "MrBeast editing". Times are relative to the beat.

| Beat | Recipe |
|---|---|
| Cold open (first 3 s) | Title `big-text` at +0.1 s for 0.9 s, `punch` at +0.1 s, `whoosh` at +0.05 s and `boom` at +0.15 s, on a shot that already shows the thumbnail's main element |
| Promise and stakes | `counter` for the money, `name-tag` for the person, every thumbnail element on screen and tagged with `promise` |
| Preview montage (end of the hook) | Three 1 s clips of the best moments, `flash` and `whoosh` on each cut; never show the outcome |
| Crazy progression | `day` stamp with `boom` at each new day, `timer` running from the end of the hook, clips of 2.5 to 3.5 s |
| Re-engagement | `riser` starting 1.5 s before; on the beat `boom`, `punch` and a `big-text`, on a `slow-push` spectacle shot. Put the `reengage-*` marker on the beat |
| Stair stepping | `price-tag` every 0.6 s with a `pop` each; the final step gets `big-text` and `boom` |
| Failure or collapse | `shake` (0.9 s, intensity 30), `buzzer`, red `big-text`, then a 0.8 s `freeze` |
| Elimination | `buzzer` and `eliminated` for 1.8 s with a short `shake` |
| Payoff and ending | `punch` and `ding` on the reaction, then cut. No outro and no subscribe ask after the payoff |
