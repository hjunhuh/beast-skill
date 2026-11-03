import assert from "node:assert/strict";
import { test } from "node:test";
import { check, detectLang, maskIgnored } from "./slop-check.ts";

const rules = (text: string, lang?: "en" | "ko") => check(text, { lang }).hits.map((h) => h.rule);

test("flags em dashes and the not-X-but-Y contrast", () => {
  const ids = rules("This isn't just a tool — it's a whole new way of working.");
  assert.ok(ids.includes("em-dash"));
  assert.ok(ids.includes("its-not-its") || ids.includes("not-x-but-y"));
});

test("flags chatbot openers, closers and stock words", () => {
  const ids = rules("Great question! Let's dive in. This pivotal tapestry plays a vital role. I hope this helps!");
  for (const id of ["chatbot-opener", "lets-dive", "ai-words", "ai-words-high", "stock-phrase", "happy-to-help"]) {
    assert.ok(ids.includes(id), `expected ${id} in ${ids.join(", ")}`);
  }
});

test("flags inline bold-label bullets", () => {
  const ids = rules("- **Speed:** it is fast\n- **Cost:** it is cheap\n");
  assert.equal(ids.filter((id) => id === "inline-header-bullet").length, 2);
});

test("ignores fenced code, inline code and URLs", () => {
  const text = "Plain sentence.\n\n```ts\n// delve — tapestry\n```\n\nRun `leverage --robust` at https://example.com/delve now.";
  assert.deepEqual(rules(text, "en"), []);
  assert.equal(maskIgnored(text).length, text.length);
});

test("ignore markers hide deliberate examples", () => {
  const text = "Real prose here.\n<!-- slop-check-ignore-start -->\nGreat question! Let's delve in.\n<!-- slop-check-ignore-end -->\nMore prose.";
  assert.deepEqual(rules(text, "en"), []);
});

test("Korean translationese and chatbot closers", () => {
  const text = "이번 글에서는 리텐션에 대해 알아보겠습니다. 편집을 함에 있어서 다양한 방법이 존재합니다. 도움이 되셨길 바랍니다.";
  assert.equal(detectLang(text), "ko");
  const ids = rules(text);
  for (const id of ["ko-alabogetseumnida", "ko-eisseo", "ko-vague-words", "ko-closer"]) {
    assert.ok(ids.includes(id), `expected ${id} in ${ids.join(", ")}`);
  }
});

test("plain human text scores clean", () => {
  const text =
    "We shot the island video in two days. The tarp blew off on the first night, so we rebuilt the shelter from buoys we found on the beach. " +
    "It held. The boat came back at hour 48 and the emergency box was still sealed.";
  const report = check(text);
  assert.equal(report.grade, "clean", JSON.stringify(report.hits));
});

test("dense slop grades heavy", () => {
  const text =
    "In today's fast-paced world, content is not just entertainment — it's a testament to creativity. " +
    "Moreover, creators delve into a rich tapestry of formats, highlighting their vibrant, seamless, and holistic vision.";
  assert.equal(check(text).grade, "heavy");
});
