<h1 align="center">🎬 beast-skill</h1>

<p align="center">
  <b>MrBeast's internal production playbook => Claude skills</b><br>
</p>

<p align="center">
  <a href="https://github.com/hjunhuh/beast-skill/stargazers"><img src="https://img.shields.io/github/stars/hjunhuh/beast-skill?style=flat&color=yellow" alt="Stars"></a>
  <a href="https://github.com/hjunhuh/beast-skill/actions/workflows/ci.yml"><img src="https://github.com/hjunhuh/beast-skill/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <a href="https://github.com/hjunhuh/beast-skill/commits/main"><img src="https://img.shields.io/github/last-commit/hjunhuh/beast-skill?color=green" alt="Last commit"></a>
  <img src="https://img.shields.io/badge/Claude-Plugin-D97757?logo=anthropic&logoColor=white" alt="Claude plugin">
  <img src="https://img.shields.io/badge/Remotion-4-0B84F3?logo=react&logoColor=white" alt="Remotion 4">
  <img src="https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white" alt="TypeScript strict">
  <img src="https://img.shields.io/badge/YouTube-long--form-FF0000?logo=youtube&logoColor=white" alt="YouTube long-form">
</p>

<p align="center">
  <a href="#install">Install</a> |
  <a href="#three-skills">Skills</a> |
  <a href="#beast-remotion-render-the-edit">beast-remotion</a> |
  <a href="#deslop-kill-the-ai-voice">deslop</a>
</p>

<p align="center">
  <img src="assets/demo.gif" alt="beast-remotion demo: word-pop captions, money counter, price tags, day stamps and a challenge timer" width="720">
  <br><sub>The template's 88-second demo plan, rendered as is. Every shot is a placeholder that names the footage it stands for.</sub>
</p>

---

In one MrBeast video, **21 million of the 60 million people who clicked were gone within the first minute.** His playbook calls that *above average*.

In 2024 the onboarding document MrBeast wrote for new hires at his production company became public. It explains how the most-subscribed channel on YouTube plans, structures and edits every video: packaging first, an obsessive first minute, re-engagements at minutes 3 and 6, a back half that never signals the end, and an ending that cuts the moment the payoff lands.

This repo turns that playbook into three Claude skills that plan the video, render the edit and clean up the words around it.

## Install

**All three skills as a Claude Code plugin:**

```text
/plugin marketplace add hjunhuh/beast-skill
/plugin install beast-skill@beast-skill
```

**One skill at a time** (personal skills folder):

```bash
git clone https://github.com/hjunhuh/beast-skill
cp -r beast-skill/skills/beast-remotion ~/.claude/skills/   # or beast-skill, deslop
```

## Three skills

| Skill | What it does | Try saying |
|---|---|---|
| [**beast-skill**](skills/beast-skill/SKILL.md) | Plans and diagnoses long-form videos with the playbook: titles and thumbnails first, a minute-by-minute map, editor briefs, retention diagnosis, sponsor integration, shoot logistics | "48 hours on a deserted island with $10, 15 minutes. Titles, thumbnail, structure and an editor brief." |
| [**beast-remotion**](skills/beast-remotion/SKILL.md) | A working Remotion + TypeScript project that renders that plan as a MrBeast-style edit, with a checker that fails the plan when the structure is wrong | "Turn this section map into a Remotion edit with captions and SFX, classic style." |
| [**deslop**](skills/deslop/SKILL.md) | Finds and rewrites chatbot tells in English and Korean, with a zero-dependency TypeScript checker | "Deslop this README before I post it." |

## The retention architecture

The playbook's prototype is built on MrBeast's average video length of 13 minutes 37 seconds:

```
0:00      1:00               3:00                 6:00                          END
 |  HOOK   |  CRAZY            |  RE-ENGAGE #1      |  RE-ENGAGE #2               |
 |  match  |  PROGRESSION      |  simple, exciting, |  back half: long            |  ABRUPT
 |  the    |  show, don't tell |  fast scene        |  explanations live here,    |  ENDING
 |  thumb  |                   |  changes           |  never signal the end       |
```

Not making a 13-minute video? beast-skill scales it for you:

| Your length | Re-engagement 1 | Re-engagement 2 |
|---|---|---|
| 8 min | ~1:50 | ~3:41 |
| 10 min | ~2:18 | ~4:36 |
| 15 min | ~3:27 | ~6:54 |
| 20 min | ~4:36 | ~9:12 |

*Formula: length x 0.23 and length x 0.46. Scaled values are always labeled as the skill's adaptation, not the playbook's text.*

## Six modes

| Bring this | Mode | Get this |
|---|---|---|
| 💡 An idea | **A. Packaging-first planning** | Title candidates by intensity, thumbnail composition, more extreme versions of the idea, a wow factor, a critical components table |
| 📝 A plan or script | **B. Minute-by-minute map** | A timecoded section map, a first-minute script, two re-engagement devices |
| ✂️ A cut or an edit request | **C. Edit notes** | Notes with timecode, section, instruction and the metric it protects |
| 📉 A retention graph | **D. Retention diagnosis** | Every drop matched to what was on screen, plus fixes for the next video |
| 🤝 A sponsor | **E. Sponsor integration** | 2 to 3 ways to make the brand deal part of the story |
| 📅 A shoot | **F. Production operations** | A countdown schedule from D-45, bottleneck owners, daily check-ins |

## What's baked in

- **Packaging first.** Titles and thumbnails are decided before the shoot, because they define what the first minute has to deliver.
- **"Ketchup, not front yard."** Same effort, more extreme topic. "I survived" beats "I spent".
- **Thumbnail-video match.** A yellow bouncy castle in the thumbnail means a yellow bouncy castle in the video. Every thumbnail element becomes a critical component.
- **The wow factor.** One moment no other creator could pull off, scaled to your budget: access, expertise and effort instead of cranes.
- **Creativity saves money.** A year of Doritos beats a $20,000 prize, and costs $1,825.
- **Consultants are cheat codes.** Call whoever did it before you.
- **Formats.** Last to Leave, Stair Stepping, Chase, and why you never run the same one back to back.
- **Brand deals are content.** No more retention craters at the sponsor read.
- **The ops layer.** Name your bottlenecks, video everything, say the negatives, keep a backup day.


## Sources

- *How to Succeed in MrBeast Production* (36 pages, written by Jimmy Donaldson). Made public in August and September 2024. According to Passionfruit, two former MrBeast producers confirmed its authenticity.
- Change in editing pace: Donaldson's public statement in March 2024, reported by The Washington Post.
