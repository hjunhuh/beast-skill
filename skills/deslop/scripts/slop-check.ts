/**
 * slop-check: flag chatbot tells in a text and score how heavy they are.
 *
 *   node scripts/slop-check.ts README.md docs/post.md
 *   cat draft.txt | node scripts/slop-check.ts -
 *   node scripts/slop-check.ts --json --lang ko draft.md
 *   node scripts/slop-check.ts --max-density 4 draft.md   # exit 1 above 4 points / 100 words
 *
 * Runs on Node 22.18+ directly (type stripping) or with `npx tsx`. No dependencies.
 * Fenced code, inline code, URLs, block quotes and anything between
 * <!-- slop-check-ignore-start --> and <!-- slop-check-ignore-end --> are skipped.
 */
import { readFileSync } from "node:fs";
import { RULES, SEVERITY_POINTS, type Category, type Lang, type Severity } from "./rules.ts";

export type Hit = {
  rule: string;
  category: Category;
  severity: Severity;
  line: number;
  column: number;
  match: string;
  message: string;
  fix: string;
};

export type Report = {
  words: number;
  points: number;
  /** Points per 100 words. */
  density: number;
  grade: "clean" | "light" | "noticeable" | "heavy";
  lang: "en" | "ko";
  hits: Hit[];
};

/** Blank out everything we should not judge, keeping offsets and newlines. */
export const maskIgnored = (text: string): string => {
  const blank = (s: string) => s.replace(/[^\n]/g, " ");
  return text
    .replace(/<!--\s*slop-check-ignore-start\s*-->[\s\S]*?<!--\s*slop-check-ignore-end\s*-->/g, blank)
    .replace(/^(```|~~~)[^\n]*\n[\s\S]*?^\1[^\n]*$/gm, blank)
    .replace(/`[^`\n]+`/g, blank)
    .replace(/https?:\/\/\S+/g, blank)
    .replace(/^>.*$/gm, blank)
    .replace(/<!--[\s\S]*?-->/g, blank);
};

export const detectLang = (text: string): "en" | "ko" => {
  const hangul = (text.match(/[가-힣]/g) ?? []).length;
  const latin = (text.match(/[A-Za-z]/g) ?? []).length;
  return hangul * 2 > latin ? "ko" : "en";
};

const countWords = (text: string): number => text.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;

const lineCol = (text: string, index: number) => {
  let line = 1;
  let last = -1;
  for (let i = 0; i < index; i++) {
    if (text.charCodeAt(i) === 10) {
      line++;
      last = i;
    }
  }
  return { line, column: index - last };
};

const sentences = (text: string): string[] =>
  text
    .split(/(?<=[.!?])\s+|\n{2,}/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !/^[#|>\-*\d]/.test(s));

/** Checks that need counting rather than a single regex. */
const statisticalHits = (masked: string, words: number, lang: "en" | "ko"): Hit[] => {
  const hits: Hit[] = [];
  const at = (rule: string, severity: Severity, category: Category, message: string, fix: string): Hit => ({
    rule,
    category,
    severity,
    line: 1,
    column: 1,
    match: "",
    message,
    fix,
  });

  const bold = (masked.match(/\*\*[^*\n]+\*\*/g) ?? []).length;
  if (words >= 80 && (bold / words) * 100 > 2.5) {
    hits.push(
      at("bold-density", "medium", "punctuation", `${bold} bold spans in ${words} words`, "Keep bold for the one phrase a skimmer must not miss."),
    );
  }

  const sents = sentences(masked);
  if (sents.length >= 8) {
    const lengths = sents.map((s) => countWords(s));
    const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    const sd = Math.sqrt(lengths.reduce((a, b) => a + (b - mean) ** 2, 0) / lengths.length);
    if (mean > 0 && sd / mean < 0.3) {
      hits.push(
        at("flat-rhythm", "low", "structure", `Sentence lengths barely vary (mean ${mean.toFixed(1)} words, sd ${sd.toFixed(1)})`, "Mix short and long sentences."),
      );
    }
    if (lang === "ko") {
      const nida = sents.filter((s) => /니다[.!?]?$/.test(s)).length;
      if (nida / sents.length > 0.85) {
        hits.push(
          at("ko-monotone-ending", "low", "structure", `문장 ${sents.length}개 중 ${nida}개가 '~니다'로 끝남`, "어미를 섞거나 문장을 합치세요."),
        );
      }
    }
  }

  const headings = masked.match(/^#{1,6} .+$/gm) ?? [];
  const small = /^(?:a|an|the|and|or|but|of|to|in|on|for|with|at|by|from|is)$/i;
  const titleCase = headings.filter((h) => {
    const ws = h.replace(/^#+\s*/, "").split(/\s+/).filter((w) => /^[A-Za-z]/.test(w));
    if (ws.length < 4) return false;
    const capitalSmall = ws.slice(1).some((w) => small.test(w) && /^[A-Z]/.test(w));
    const mostlyCaps = ws.filter((w) => /^[A-Z]/.test(w)).length / ws.length > 0.8;
    return capitalSmall && mostlyCaps;
  });
  if (lang === "en" && titleCase.length > 0) {
    hits.push(at("title-case-heading", "low", "punctuation", `${titleCase.length} Title Case heading(s)`, "Use sentence case for headings."));
  }
  return hits;
};

export const check = (text: string, options: { lang?: "en" | "ko" | "auto" } = {}): Report => {
  const masked = maskIgnored(text);
  const lang = !options.lang || options.lang === "auto" ? detectLang(masked) : options.lang;
  const words = Math.max(1, countWords(masked));
  const active = RULES.filter((rule) => rule.lang === "any" || rule.lang === lang);
  const hits: Hit[] = [];

  for (const rule of active) {
    const re = new RegExp(rule.pattern.source, rule.pattern.flags.includes("g") ? rule.pattern.flags : `${rule.pattern.flags}g`);
    for (const m of masked.matchAll(re)) {
      const index = (m.index ?? 0) + (m[0].length - m[0].trimStart().length);
      const { line, column } = lineCol(masked, index);
      hits.push({
        rule: rule.id,
        category: rule.category,
        severity: rule.severity,
        line,
        column,
        match: m[0].trim().slice(0, 80),
        message: rule.message,
        fix: rule.fix,
      });
    }
  }
  hits.push(...statisticalHits(masked, words, lang));
  hits.sort((a, b) => a.line - b.line || a.column - b.column);

  const points = hits.reduce((sum, h) => sum + SEVERITY_POINTS[h.severity], 0);
  const density = (points / words) * 100;
  const grade = density <= 2 ? "clean" : density <= 5 ? "light" : density <= 10 ? "noticeable" : "heavy";
  return { words, points, density, grade, lang, hits };
};

const formatReport = (name: string, report: Report): string => {
  const lines = report.hits.map(
    (h) => `${name}:${h.line}:${h.column}  ${h.severity.padEnd(6)} ${h.rule.padEnd(22)} ${h.match ? `"${h.match}"  ` : ""}${h.message}. ${h.fix}`,
  );
  lines.push(
    `\n${name}: ${report.hits.length} hits, ${report.points} points in ${report.words} words = ${report.density.toFixed(1)} per 100 words (${report.grade}, ${report.lang})`,
  );
  return lines.join("\n");
};

const main = () => {
  const args = process.argv.slice(2);
  const json = args.includes("--json");
  const langIndex = args.indexOf("--lang");
  const lang = (langIndex >= 0 ? args[langIndex + 1] : "auto") as "en" | "ko" | "auto";
  const maxIndex = args.indexOf("--max-density");
  const max = maxIndex >= 0 ? Number(args[maxIndex + 1]) : Number.POSITIVE_INFINITY;
  const skip = new Set([langIndex + 1, maxIndex + 1].filter((i) => i > 0));
  const files = args.filter((a, i) => !a.startsWith("--") && !skip.has(i));
  if (files.length === 0) {
    console.error("usage: node scripts/slop-check.ts [--json] [--lang en|ko] [--max-density N] <file ...|->");
    process.exit(2);
  }
  let worst = 0;
  const out: Array<{ file: string } & Report> = [];
  for (const file of files) {
    const text = readFileSync(file === "-" ? 0 : file, "utf8");
    const report = check(text, { lang });
    worst = Math.max(worst, report.density);
    if (json) out.push({ file, ...report });
    else console.log(formatReport(file === "-" ? "stdin" : file, report));
  }
  if (json) console.log(JSON.stringify(out, null, 2));
  process.exit(worst > max ? 1 : 0);
};

if (process.argv[1] && /slop-check\.ts$/.test(process.argv[1])) main();

export type { Lang };
