---
name: deslop
description: Finds and removes the tells that make text read as written by Claude or another chatbot (em dashes, "it's not X, it's Y" reveals, rule-of-three padding, delve and tapestry vocabulary, chatbot openers and sign-offs, bold-label bullet lists, hedge stacks, Korean translationese and stock endings) and rewrites the text in a plain, specific human voice without changing its meaning. Use it whenever the user asks to make writing sound less like AI or less like Claude, more human or more natural, to deslop, humanize or remove the AI voice, or before publishing a README, post, email, script, caption, description or doc that Claude drafted, in English or Korean.
---

# deslop

Readers now recognize chatbot prose on sight, and once they do, they stop trusting it. This skill removes the patterns that give it away and replaces them with plain, specific writing. The goal is good writing that sounds like a particular person. It is not a tool for passing AI detectors, and you should never claim that a rewrite will.

## Where this comes from

The pattern list draws on three public sources, restated in our own words and extended with Korean patterns:

- **Wikipedia: Signs of AI writing** (WikiProject AI Cleanup). Editors' field guide: inflated significance, promotional wording, editorial asides, stock transitions, essay-style conclusions, title case headings, pasted chatbot phrases, knowledge-cutoff disclaimers. Its key caveat applies here too: people write this way as well, so look for clusters, not single hits.
- **blader/humanizer.** A Claude skill built on that guide (29 patterns across content, language, style, communication and filler), with voice calibration from the user's own samples.
- **hardikpandya/stop-slop.** Splits banned phrases from banned structures and scores prose on directness, rhythm, trust, authenticity and density.

## Ground rules

1. **Never change what the text says.** Facts, numbers, names, quotes, links, code and technical terms stay exactly as they are. You are editing voice, not content.
2. **Clusters, not single hits.** One em dash in a long essay is fine. Five per paragraph is a signature. Fix the pattern that repeats.
3. **Do not swap one tic for another.** Replacing every em dash with a colon, or turning every sentence into a three-word fragment, is just a new tell. Vary.
4. **Do not fake humanity.** No invented anecdotes, fake typos, forced slang or made-up opinions. Specific beats casual.
5. **Respect the user's own voice and preferences.** If they gave writing samples or style rules (for example "no em dashes, no middle dots"), those win over this list.
6. **Leave quoted material alone,** including quotes of other people's AI-sounding text.
