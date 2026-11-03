/**
 * Check an edit plan against the playbook's retention structure.
 *
 *   npm run check -- plans/my-video.json   # a plan, or {"plan": {...}} props file
 *   npm run check:demo                     # the built-in demo plan
 *
 * Exits with code 1 if any check fails, so it can gate a render in CI.
 */
import { readFileSync } from "node:fs";
import { checkPlan, summarize, type Severity } from "../src/beast/retention";
import type { EditPlan } from "../src/beast/types";
import { demoPlan } from "../src/demo/demoPlan";

const arg = process.argv[2];
if (!arg) {
  console.error("usage: npm run check -- <plan.json> | npm run check:demo");
  process.exit(2);
}

const load = (path: string): EditPlan => {
  const json = JSON.parse(readFileSync(path, "utf8"));
  return (json.plan ?? json) as EditPlan;
};

const plan = arg === "--demo" ? demoPlan : load(arg);
const results = checkPlan(plan);
const icon: Record<Severity, string> = { pass: "PASS", warn: "WARN", fail: "FAIL" };

console.log(`\n${plan.title} (${plan.preset})\n`);
for (const r of results) {
  console.log(`${icon[r.severity]}  [${r.rule}] ${r.message}`);
}
const s = summarize(results);
console.log(`\n${s.pass} passed, ${s.warn} warnings, ${s.fail} failed\n`);
process.exit(s.fail > 0 ? 1 : 0);
