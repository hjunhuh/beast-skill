<h1 align="center">🎬 beast-skill</h1>

<p align="center">
  <b>MrBeast's internal production playbook, turned into a Claude skill.</b><br>
  Plan, package, structure, edit and diagnose your YouTube videos minute by minute.
</p>

<p align="center">
  <a href="https://github.com/hjunhuh/beast-skill/stargazers"><img src="https://img.shields.io/github/stars/hjunhuh/beast-skill?style=flat&color=yellow" alt="Stars"></a>
  <a href="https://github.com/hjunhuh/beast-skill/commits/main"><img src="https://img.shields.io/github/last-commit/hjunhuh/beast-skill?color=green" alt="Last commit"></a>
  <img src="https://img.shields.io/badge/Claude-Skill-D97757?logo=anthropic&logoColor=white" alt="Claude Skill">
  <img src="https://img.shields.io/badge/YouTube-long--form-FF0000?logo=youtube&logoColor=white" alt="YouTube long-form">
  <img src="https://img.shields.io/badge/based_on-36--page_playbook-black" alt="Based on a 36-page playbook">
  <img src="https://img.shields.io/badge/modes-6-blueviolet" alt="6 modes">
</p>

<p align="center">
  <a href="#-install">Install</a> |
  <a href="#-see-it-work">Demo</a> |
  <a href="#-the-retention-architecture">Retention architecture</a> |
  <a href="#-six-modes">Six modes</a> |
  <a href="#-faq">FAQ</a>
</p>

---

## 💀 The first minute is where videos die

In one MrBeast video, **21 million of the 60 million people who clicked were gone within the first minute.** The playbook calls that *above average*.

In 2024, the onboarding document MrBeast wrote for new hires at his production company became public. It explains how the most-subscribed channel on YouTube plans, structures and edits every video: packaging first, the first minute obsessed over, re-engagements at minutes 3 and 6, a back half that never signals the end, and an ending that cuts the moment the payoff lands.

**beast-skill turns that playbook into a working process Claude runs on your videos.** Give it an idea, a script, a cut or a retention graph, and it returns timecoded, metric-backed deliverables you can hand straight to your editor.

## ⚡ Install

**Claude Code** (personal skills folder):

```bash
git clone https://github.com/hjunhuh/beast-skill ~/.claude/skills/beast-skill
```

**Other Claude surfaces:** add this folder (it only needs `SKILL.md`) as a custom skill.

That's it. No need to name the skill: it triggers whenever you talk about YouTube ideas, titles, thumbnails, structure, edits or retention.

## 👀 See it work

> **You:** I run a 50K-subscriber camping channel. Next video: "48 hours on a deserted island with $10." About 15 minutes. Give me titles, a thumbnail, a minute-by-minute structure and a brief for my editor.

**beast-skill** (excerpt from a real test run, translated):

| Timecode | Section | Scene | Why |
|---|---|---|---|
| 0:00-0:10 | First minute | Drone pulls back as the boat leaves the host on the island | Confirms the title promise in frame one |
| 0:10-0:30 | First minute | Host holds up one plastic bag: "This is everything. $10." Receipt on screen | Thumbnail element + kills the "what about the boat?" doubt |
| 0:40-0:55 | First minute | 3 most dramatic moments, 2 to 4 seconds each, no outcomes shown | Front-loading |
| 1:00-3:27 | Day one | Unpacking, island lap, first shelter as a time-lapse | Crazy progression |
| **~3:27** | **Re-engagement 1** *(scaled)* | Sunset drone pull-out to open ocean, then a star time-lapse | "Only this channel" isolation shot |
| **~6:54** | **Re-engagement 2** *(scaled)* | "A tarp won't survive tonight. I'm building a house from washed-up trash." | Pulls viewers into the back half |
| ~10:30 | Mid-point payoff | Drone reveal of the finished shelter, same angle as the thumbnail | Pays off the thumbnail promise |
| 14:20-15:00 | Ending | Boat arrives at 48:00, first bite of hot noodles, **cut** | Abrupt ending after the payoff |

Plus title candidates ranked by intensity, two thumbnail options, a critical components table with stop criteria for safety, a first-minute script, and a copy-ready editor brief where every note has a timecode, a section and a reason tied to CTR, AVD or AVP.

## 📈 The retention architecture

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

## 🧰 Six modes

| Bring this | Mode | Get this |
|---|---|---|
| 💡 An idea | **A. Packaging-first planning** | Title candidates by intensity, thumbnail composition, more extreme versions of the idea, a wow factor, a critical components table |
| 📝 A plan or script | **B. Minute-by-minute map** | A timecoded section map, a first-minute script, two re-engagement devices |
| ✂️ A cut or an edit request | **C. Edit notes** | Notes with timecode, section, instruction and the metric it protects |
| 📉 A retention graph | **D. Retention diagnosis** | Every drop matched to what was on screen, plus fixes for the next video |
| 🤝 A sponsor | **E. Sponsor integration** | 2 to 3 ways to make the brand deal part of the story |
| 📅 A shoot | **F. Production operations** | A countdown schedule from D-45, bottleneck owners, daily check-ins |

## 🔥 What's baked in

- **Packaging first.** Titles and thumbnails are decided before the shoot, because they define what the first minute has to deliver.
- **"Ketchup, not front yard."** Same effort, more extreme topic. "I survived" beats "I spent".
- **Thumbnail-video match.** A yellow bouncy castle in the thumbnail means a yellow bouncy castle in the video. Every thumbnail element becomes a critical component.
- **The wow factor.** One moment no other creator could pull off, scaled to your budget: access, expertise and effort instead of cranes.
- **Creativity saves money.** A year of Doritos beats a $20,000 prize, and costs $1,825.
- **Consultants are cheat codes.** Call whoever did it before you.
- **Formats.** Last to Leave, Stair Stepping, Chase, and why you never run the same one back to back.
- **Brand deals are content.** No more retention craters at the sponsor read.
- **The ops layer.** Name your bottlenecks, video everything, say the negatives, keep a backup day.

## 🛡️ What we left out on purpose

- **Hyper-fast retention editing as a default.** MrBeast himself said in March 2024 that he slowed his videos down and added breathers. beast-skill keeps the structure and sets pacing by story.
- **"No doesn't mean no."** Clear refusals, filming permits and likeness rights are respected. The skill only suggests politely asking for alternatives.
- **All-nighters and employee tiers.** Not production advice.
- **Unverified rules stated as fact.** Permits, drones and similar rules are listed as things to verify.

## ❓ FAQ

**Is this official?**
No. It is an unofficial project with no affiliation to MrBeast or Beast Industries, and it does not contain the original document. The principles are restated as procedures.

**Does it work for Shorts?**
Only partly. The playbook covers long-form. For Shorts, the skill applies the packaging-match and abrupt-ending principles and skips the minute map.

**Does it work in my language?**
Yes. The skill replies in the language you write in.

**I'm a solo creator with no budget. Is this for me?**
Yes. Every principle is scaled to your channel. MrBeast's numbers are shown as references, never as targets.
