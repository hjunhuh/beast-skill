import assert from "node:assert/strict";
import { test } from "node:test";
import { chunkCaptions, classifyWord, spreadWords } from "../src/beast/captions";
import { checkPlan, retentionTargets } from "../src/beast/retention";
import { formatClock, planDuration } from "../src/beast/time";
import type { EditPlan } from "../src/beast/types";
import { demoPlan } from "../src/demo/demoPlan";
import { encodeWav } from "./lib/wav";
import { SYNTHS } from "./lib/sfx";

test("13-minute video lands re-engagements near minute 3 and minute 6", () => {
  const t = retentionTargets(13 * 60);
  assert.equal(t.hookEnd, 60);
  assert.ok(Math.abs(t.reengage1 - 180) < 2);
  assert.ok(Math.abs(t.reengage2 - 360) < 2);
});

test("15-minute video scales to about 3:27 and 6:54", () => {
  const t = retentionTargets(15 * 60);
  assert.equal(Math.round(t.reengage1), 207);
  assert.equal(Math.round(t.reengage2), 414);
});

test("classifies money, numbers, keywords and danger words", () => {
  const keywords = new Set(["TRASH"]);
  assert.equal(classifyWord("$10,000", keywords), "money");
  assert.equal(classifyWord("48", keywords), "number");
  assert.equal(classifyWord("trash!", keywords), "keyword");
  assert.equal(classifyWord("ELIMINATED", keywords), "danger");
  assert.equal(classifyWord("boat", keywords), "plain");
});

test("chunks two words at a time and splits on sentence ends", () => {
  const words = spreadWords("I SURVIVED. 100 DAYS IN A CIRCLE", 0, 3);
  const chunks = chunkCaptions(words, { mode: "chunks", wordsPerChunk: 2, gapSeconds: 0.35 });
  assert.deepEqual(
    chunks.map((c) => c.words.map((w) => w.text).join(" ")),
    ["I SURVIVED.", "100 DAYS", "IN A", "CIRCLE"],
  );
  // Continuous speech: each chunk holds until the next starts.
  for (let i = 0; i < chunks.length - 1; i++) assert.equal(chunks[i].end, chunks[i + 1].start);
});

test("keyword mode only keeps highlighted words", () => {
  const words = spreadWords("I HAVE $10 AND 48 HOURS", 0, 2);
  const chunks = chunkCaptions(words, { mode: "keywords", wordsPerChunk: 3, gapSeconds: 0.4 });
  assert.deepEqual(chunks.map((c) => c.words[0].text), ["$10", "48"]);
});

test("demo plan passes every structural check", () => {
  const results = checkPlan(demoPlan);
  const failures = results.filter((r) => r.severity === "fail");
  assert.deepEqual(failures, []);
  assert.ok(Math.abs(planDuration(demoPlan) - 88) < 0.01);
});

test("missing thumbnail element and late subscribe ask are caught", () => {
  const plan: EditPlan = {
    ...demoPlan,
    thumbnailPromise: [...demoPlan.thumbnailPromise, "golden key"],
    captions: [...demoPlan.captions, { text: "subscribe", start: 87.2, end: 87.6 }],
  };
  const results = checkPlan(plan);
  assert.ok(results.some((r) => r.severity === "fail" && r.message.includes("golden key")));
  assert.ok(results.some((r) => r.rule === "ending" && r.message.includes("subscribe")));
});

test("timer clock formatting", () => {
  assert.equal(formatClock(48 * 3600), "48:00:00");
  assert.equal(formatClock(65), "01:05");
});

test("every built-in SFX synthesizes to a valid, non-silent WAV", () => {
  for (const [name, synth] of Object.entries(SYNTHS)) {
    const samples = synth();
    const peak = samples.reduce((m, v) => Math.max(m, Math.abs(v)), 0);
    assert.ok(peak > 0.3 && peak <= 1, `${name} peak ${peak}`);
    const wav = encodeWav(samples);
    assert.equal(wav.toString("ascii", 0, 4), "RIFF");
    assert.equal(wav.length, 44 + samples.length * 2);
  }
});
