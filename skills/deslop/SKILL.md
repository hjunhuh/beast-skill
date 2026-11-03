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

## Workflow

1. **Scan.** Run the checker on the text (it skips fenced code, inline code, URLs and block quotes):
   ```bash
   node <this skill>/scripts/slop-check.ts draft.md            # Node 22.18+ runs TypeScript directly
   cat draft.txt | node <this skill>/scripts/slop-check.ts -
   npx tsx <this skill>/scripts/slop-check.ts --json draft.md  # older Node
   ```
   Each hit prints `line:column severity rule "match" message. fix`, then a score in points per 100 words (high 3, medium 2, low 1): 2 or less is clean, 5 or less light, 10 or less noticeable, above 10 heavy. `--max-density N` exits 1 above N, which makes it usable as a pre-publish gate.
2. **Read it yourself.** The script catches surface patterns. You still have to catch the structural ones: a paragraph that restates the previous one, a list of three where only one item matters, a closing line that summarizes what was just said, praise with no evidence.
3. **Calibrate the voice.** If the user shared samples of their writing, match their sentence length, punctuation habits, contractions, register and how they open and close. If not, aim for a competent person explaining something to a colleague.
4. **Rewrite** using the moves below, working through high-severity hits first.
5. **Re-scan** and aim for "clean". If a hit is the right word in context (for example "robust" in statistics or "leverage" in finance), keep it.
6. **Deliver** the rewritten text. Unless the user asked for an explanation, do not append a list of what you changed; if they did, keep it to a few lines grouped by pattern.

<!-- slop-check-ignore-start -->

## Pattern catalog (English)

| Category | Pattern | Example | Rewrite move |
|---|---|---|---|
| Punctuation | Em dash or spaced en dash used as all-purpose glue | "The tool is fast — really fast." | Pick the real job: comma, period, colon or parentheses |
| Punctuation | Bold sprinkled through prose | "This is **critical** for **performance**." | Bold at most the one phrase a skimmer must not miss |
| Punctuation | Bullets that open with a bold label and a colon | "- **Speed:** It's fast." | Write sentences, or use a real table for reference data |
| Punctuation | Title Case Headings, emoji bullets, curly quotes in plain text | "## How To Get Started 🚀" | Sentence case, no emoji, straight quotes |
| Structure | "Not just X, but Y" / "It's not X. It's Y." / "This isn't about X. It's about Y." | "It's not a tool. It's a movement." | State Y. Keep X only if someone actually believed it |
| Structure | Question-and-reveal | "The result? A 40% drop." | "It dropped 40%." |
| Structure | "Here's the thing:" and "Let's dive in" setups | "Here's why: ..." | Start with the point |
| Structure | Rule of three as padding | "fast, reliable, and scalable" | Keep the item that is true and matters; prove it |
| Structure | Trailing -ing clause that editorializes | "..., highlighting its importance." | End at the fact; make the claim its own sentence with evidence, or drop it |
| Structure | "Serves as", "stands as", "boasts" | "The library serves as a bridge." | "is", "has", or the concrete verb |
| Structure | Stock transitions and summary closers | "Moreover,", "Furthermore,", "In conclusion," | Delete; sentence order already carries the logic |
| Structure | Hedge stacks | "may potentially help" | Hedge once, where the doubt is real |
| Structure | False range | "from startups to enterprises" | Name who it is actually for |
| Structure | Flat rhythm | eight sentences of 15 words each | Mix short and long |
| Vocabulary | Chatbot words | delve, tapestry, testament, pivotal, seamless, intricate, multifaceted, holistic, foster, underscore, showcase, elevate, empower, embark, vibrant, meticulous, paramount, realm, ever-evolving, game-changer | The plain word, or a description of the actual thing |
| Vocabulary | Stock phrases | "in today's fast-paced world", "plays a vital role", "it's worth noting", "unlock the power of", "whether you're a ..." | Delete, then say the specific thing |
| Vocabulary | Intensifiers | truly, genuinely, incredibly, deeply | Cut, or replace with the detail that makes it true |
| Chatbot voice | Openers and sign-offs | "Great question!", "Certainly!", "I hope this helps!", "Let me know if you have any questions" | Start with the answer; end on the last real point |
| Chatbot voice | Sycophancy | "You're absolutely right!", "That's a fantastic point" | Respond to the substance |
| Chatbot voice | Announcing structure | "Below is a comprehensive breakdown" | Just give the breakdown |
| Chatbot voice | AI self-reference | "As an AI language model", "as of my last update" | Remove; if a date matters, state the date |
| Content | Inflated significance and promotional tone | "a testament to the enduring power of", "stunning", "rich heritage" | Say what happened and let the reader judge |
| Content | Vague attribution | "Experts say", "Studies show" | Name the source or drop the claim |
| Content | Generic upbeat ending | "The future looks bright." | End on a concrete fact or next step |
