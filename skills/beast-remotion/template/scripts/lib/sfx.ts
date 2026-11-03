import type { BuiltInSfx } from "../../src/beast/types";
import { buffer, highpass, lowpass, mix, noise, normalize, SAMPLE_RATE } from "./wav";

const TAU = Math.PI * 2;

const envelope = (t: number, attack: number, decayTau: number) =>
  t < attack ? t / attack : Math.exp(-(t - attack) / decayTau);

/** Sine whose frequency follows `freqAt`; phase is integrated so sweeps stay smooth. */
const sweep = (seconds: number, freqAt: (t: number) => number, ampAt: (t: number) => number) => {
  const out = buffer(seconds);
  let phase = 0;
  for (let i = 0; i < out.length; i++) {
    const t = i / SAMPLE_RATE;
    phase += (TAU * freqAt(t)) / SAMPLE_RATE;
    out[i] = Math.sin(phase) * ampAt(t);
  }
  return out;
};

const whiteNoise = (seconds: number, seed: number) => {
  const rand = noise(seed);
  return buffer(seconds).map(() => rand());
};

const bell = (seconds: number, partials: Array<[number, number]>, tau: number, delay = 0) => {
  const out = buffer(seconds);
  for (let i = 0; i < out.length; i++) {
    const t = i / SAMPLE_RATE - delay;
    if (t < 0) continue;
    let v = 0;
    for (const [freq, amp] of partials) v += Math.sin(TAU * freq * t) * amp;
    out[i] = v * envelope(t, 0.002, tau);
  }
  return out;
};

export const SYNTHS: Record<BuiltInSfx, () => Float32Array> = {
  /** Air moving past: filtered noise whose brightness swells and falls. */
  whoosh: () => {
    const d = 0.55;
    const n = whiteNoise(d, 11);
    const filtered = lowpass(n, (t) => 300 + 5200 * Math.sin(Math.PI * Math.min(1, t / d)));
    return normalize(filtered.map((v, i) => v * Math.sin(Math.PI * Math.min(1, i / SAMPLE_RATE / d)) ** 1.5));
  },
  /** Bubbly pop for captions and tags: an upward chirp with a click on top. */
  pop: () =>
    normalize(
      mix(
        [sweep(0.12, (t) => 280 + 5200 * t, (t) => envelope(t, 0.003, 0.035)), 1],
        [highpass(whiteNoise(0.01, 3), 2000), 0.25],
      ),
    ),
  /** Bright "correct" ding with a long tail. */
  ding: () => normalize(bell(1.1, [[1760, 1], [3520, 0.35], [5280, 0.15]], 0.32)),
  /** Sub-bass hit for big text and reveals. */
  boom: () => {
    const body = sweep(1.4, (t) => 38 + 70 * Math.exp(-t / 0.08), (t) => envelope(t, 0.004, 0.42));
    const thump = lowpass(whiteNoise(0.12, 7), () => 900).map((v, i) => v * Math.exp(-i / SAMPLE_RATE / 0.025));
    return normalize(mix([body, 1], [thump, 0.6]));
  },
  /** Register "cha-ching": a noisy shuffle, then two metallic hits. */
  cash: () => {
    const shuffle = highpass(whiteNoise(0.09, 5), 3000).map((v, i) => v * Math.exp(-i / SAMPLE_RATE / 0.03));
    const partials: Array<[number, number]> = [
      [2637, 1],
      [3951, 0.6],
      [5274, 0.4],
      [6645, 0.25],
    ];
    return normalize(mix([shuffle, 0.5], [bell(0.8, partials, 0.12, 0.04), 0.8], [bell(0.8, partials, 0.22, 0.13), 1]));
  },
  /** Tension riser that cuts off right before a reveal. */
  riser: () => {
    const d = 1.6;
    const n = lowpass(whiteNoise(d, 19), (t) => 200 + 7800 * (t / d) ** 2);
    const tone = sweep(d, (t) => 180 + 900 * (t / d) ** 2, (t) => (t / d) ** 2);
    const shaped = mix([n, 1], [tone, 0.35]).map((v, i) => v * Math.min(1, (i / SAMPLE_RATE / d) ** 1.4));
    return normalize(shaped);
  },
  /** Counter tick. */
  tick: () => normalize(mix([bell(0.05, [[2200, 1]], 0.008), 1], [highpass(whiteNoise(0.006, 2), 4000), 0.4])),
  /** Game-show buzzer for failures and eliminations. */
  buzzer: () => {
    const d = 0.7;
    const out = buffer(d);
    for (let i = 0; i < out.length; i++) {
      const t = i / SAMPLE_RATE;
      const square = Math.sign(Math.sin(TAU * 146 * t)) + 0.7 * Math.sign(Math.sin(TAU * 151 * t));
      const env = t < 0.01 ? t / 0.01 : t > d - 0.08 ? (d - t) / 0.08 : 1;
      out[i] = square * env;
    }
    return normalize(lowpass(out, () => 2400), 0.8);
  },
};
