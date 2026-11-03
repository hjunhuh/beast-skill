import type { CaptionMode, CaptionWord, Seconds, TextColor } from "./types";

export type Tone = "plain" | "money" | "number" | "keyword" | "danger";

export type ChunkWord = CaptionWord & { tone: Tone };

export type CaptionChunk = {
  words: ChunkWord[];
  start: Seconds;
  /** When the chunk leaves the screen. */
  end: Seconds;
};

const DANGER_WORDS = new Set([
  "ELIMINATED",
  "LOSE",
  "LOST",
  "FAIL",
  "FAILED",
  "COLLAPSED",
  "DEAD",
  "OUT",
  "NEVER",
]);

const normalize = (word: string): string =>
  word.toUpperCase().replace(/[^\p{L}\p{N}$₩€£]/gu, "");

/** Decide which color family a spoken word gets. */
export const classifyWord = (text: string, keywords: Set<string>): Tone => {
  const w = normalize(text);
  if (w.length === 0) return "plain";
  if (/^[$₩€£]/.test(w) || /(DOLLARS?|WON|원)$/.test(w)) return "money";
  if (/\d/.test(w)) return "number";
  if (keywords.has(w)) return "keyword";
  if (DANGER_WORDS.has(w)) return "danger";
  return "plain";
};

export const toneColor = (tone: Tone): TextColor => {
  switch (tone) {
    case "money":
      return "green";
    case "number":
      return "yellow";
    case "keyword":
      return "yellow";
    case "danger":
      return "red";
    case "plain":
      return "white";
  }
};

const endsSentence = (text: string): boolean => /[.!?…]$/.test(text.trim());

/**
 * On-screen form of a word: commas, periods and colons are dropped (they read
 * as noise at this size); ! and ? stay because they carry tone.
 */
export const displayWord = (text: string): string => text.replace(/[.,;:…]+$/u, "").replace(/^["'“‘]+|["'”’]+$/gu, "");

/**
 * Group word-level timestamps into on-screen chunks.
 *
 * A chunk closes when it reaches `wordsPerChunk`, when a sentence ends, or when
 * the speaker pauses longer than `gapSeconds`. Each chunk stays up until the
 * next one starts (or 0.25 s after its last word), so there is no flicker
 * between chunks during continuous speech.
 */
export const chunkCaptions = (
  words: CaptionWord[],
  options: {
    mode: CaptionMode;
    wordsPerChunk: number;
    gapSeconds: number;
    keywords?: string[];
  },
): CaptionChunk[] => {
  if (options.mode === "off") return [];
  const keywordSet = new Set((options.keywords ?? []).map(normalize));
  const sorted = [...words].sort((a, b) => a.start - b.start);
  const tagged: ChunkWord[] = sorted.map((w) => ({
    ...w,
    tone: classifyWord(w.text, keywordSet),
  }));

  // Keyword mode: each highlighted word becomes its own one-word chunk.
  if (options.mode === "keywords") {
    return tagged
      .filter((w) => w.tone !== "plain")
      .map((w) => ({ words: [w], start: w.start, end: Math.max(w.end, w.start + 0.6) }));
  }

  const chunks: CaptionChunk[] = [];
  let current: ChunkWord[] = [];
  const flush = () => {
    if (current.length === 0) return;
    const first = current[0];
    const last = current[current.length - 1];
    chunks.push({ words: current, start: first.start, end: last.end + 0.25 });
    current = [];
  };

  for (let i = 0; i < tagged.length; i++) {
    const word = tagged[i];
    const prev = current[current.length - 1];
    if (prev && word.start - prev.end > options.gapSeconds) flush();
    current.push(word);
    if (current.length >= options.wordsPerChunk || endsSentence(word.text)) flush();
  }
  flush();

  // Hold each chunk until the next begins when speech is continuous.
  for (let i = 0; i < chunks.length - 1; i++) {
    const next = chunks[i + 1];
    if (next.start - chunks[i].end < options.gapSeconds) chunks[i].end = next.start;
  }
  return chunks;
};

export const activeChunk = (
  chunks: CaptionChunk[],
  time: Seconds,
): CaptionChunk | null => {
  for (const chunk of chunks) {
    if (time >= chunk.start && time < chunk.end) return chunk;
  }
  return null;
};

/** True while someone is talking. Used to duck the music bed. */
export const isSpeaking = (words: CaptionWord[], time: Seconds, pad = 0.15): boolean =>
  words.some((w) => time >= w.start - pad && time <= w.end + pad);

/**
 * Spread a line evenly across a time range when you only have line-level
 * timing (for example from a script). Longer words get proportionally more time.
 */
export const spreadWords = (line: string, start: Seconds, end: Seconds): CaptionWord[] => {
  const parts = line.split(/\s+/).filter(Boolean);
  const weights = parts.map((p) => Math.max(2, p.length));
  const total = weights.reduce((a, b) => a + b, 0);
  const span = end - start;
  const out: CaptionWord[] = [];
  let cursor = start;
  parts.forEach((text, i) => {
    const length = (weights[i] / total) * span;
    out.push({ text, start: cursor, end: cursor + length });
    cursor += length;
  });
  return out;
};
