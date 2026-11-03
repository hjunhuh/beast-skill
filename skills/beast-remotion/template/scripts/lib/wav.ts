/**
 * Tiny dependency-free synth for the built-in SFX. Everything is generated from
 * math, so the sounds ship with no licensing questions.
 */

export const SAMPLE_RATE = 44100;

/** Deterministic noise so every `npm run assets` produces identical files. */
export const noise = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296 * 2 - 1;
  };
};

export const buffer = (seconds: number) => new Float32Array(Math.round(seconds * SAMPLE_RATE));

/** One-pole low-pass whose cutoff can change per sample. */
export const lowpass = (input: Float32Array, cutoffAt: (t: number) => number): Float32Array => {
  const out = new Float32Array(input.length);
  let y = 0;
  for (let i = 0; i < input.length; i++) {
    const fc = cutoffAt(i / SAMPLE_RATE);
    const alpha = 1 - Math.exp((-2 * Math.PI * fc) / SAMPLE_RATE);
    y += alpha * (input[i] - y);
    out[i] = y;
  }
  return out;
};

export const highpass = (input: Float32Array, cutoff: number): Float32Array => {
  const low = lowpass(input, () => cutoff);
  return input.map((v, i) => v - low[i]);
};

export const mix = (...layers: Array<[Float32Array, number]>): Float32Array => {
  const length = Math.max(...layers.map(([l]) => l.length));
  const out = new Float32Array(length);
  for (const [layer, gain] of layers) {
    for (let i = 0; i < layer.length; i++) out[i] += layer[i] * gain;
  }
  return out;
};

/** Scale so the loudest sample sits at `peak`, then soft-clip. */
export const normalize = (input: Float32Array, peak = 0.89): Float32Array => {
  let max = 0;
  for (const v of input) max = Math.max(max, Math.abs(v));
  const gain = max > 0 ? peak / max : 1;
  return input.map((v) => Math.tanh(v * gain * 1.1) / Math.tanh(1.1));
};

/** Encode mono float samples as a 16-bit PCM WAV file. */
export const encodeWav = (samples: Float32Array, sampleRate = SAMPLE_RATE): Buffer => {
  const dataBytes = samples.length * 2;
  const out = Buffer.alloc(44 + dataBytes);
  out.write("RIFF", 0);
  out.writeUInt32LE(36 + dataBytes, 4);
  out.write("WAVE", 8);
  out.write("fmt ", 12);
  out.writeUInt32LE(16, 16); // PCM chunk size
  out.writeUInt16LE(1, 20); // PCM format
  out.writeUInt16LE(1, 22); // mono
  out.writeUInt32LE(sampleRate, 24);
  out.writeUInt32LE(sampleRate * 2, 28); // byte rate
  out.writeUInt16LE(2, 32); // block align
  out.writeUInt16LE(16, 34); // bits per sample
  out.write("data", 36);
  out.writeUInt32LE(dataBytes, 40);
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    out.writeInt16LE(Math.round(s * 32767), 44 + i * 2);
  }
  return out;
};
