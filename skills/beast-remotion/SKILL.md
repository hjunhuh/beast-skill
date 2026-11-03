---
name: beast-remotion
description: Reference implementation of MrBeast-style YouTube editing in Remotion (React and TypeScript). Turns a beast-skill section map, a script or a transcript into a typed edit plan, checks the plan against the playbook's retention structure, and renders it with word-pop captions, punch zooms, camera shake, flashes, freeze frames, money counters, a challenge timer, day stamps, stair-stepping price tags, circle and arrow callouts, elimination stamps, name tags and license-free synthesized SFX. Use it whenever the user wants to edit, caption, animate or render a video in MrBeast or retention-editing style with code, mentions Remotion together with YouTube editing, captions, zooms or sound effects, or wants to turn a video plan into an actual render.
---

# beast-remotion

A working Remotion project lives in `template/`. It renders MrBeast-style retention editing from a single JSON-serializable **edit plan**, and ships a checker that tests the plan against the structure in the MrBeast production playbook (see the `beast-skill` skill). Your job is to turn what the user has (an idea, a section map, a script, footage, a transcript) into a plan, make the checker pass, and render.

"The same as MrBeast" means the same **editing grammar**: how captions pop, when zooms hit, what the graphics do, which sound lands on which beat, and where the re-engagements fall. It never means his brand. Do not put the MrBeast name, logo, face, voice or footage into a render, and do not make a video look like an official MrBeast upload. The template uses Montserrat Black (SIL Open Font License) for captions; MrBeast-style caption presets elsewhere are reported to use a font called CCSignLanguage, which you should only use if the user has a license for it.
