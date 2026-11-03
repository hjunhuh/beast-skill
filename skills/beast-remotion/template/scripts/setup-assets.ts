/**
 * Prepares public/ so renders work offline:
 * 1. copies Montserrat 800/900 from @fontsource/montserrat into public/fonts
 * 2. synthesizes the built-in SFX into public/sfx
 */
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { BUILT_IN_SFX } from "../src/beast/types";
import { SYNTHS } from "./lib/sfx";
import { encodeWav } from "./lib/wav";

const root = resolve(__dirname, "..");
const fontsOut = join(root, "public", "fonts");
const sfxOut = join(root, "public", "sfx");
mkdirSync(fontsOut, { recursive: true });
mkdirSync(sfxOut, { recursive: true });

for (const weight of [800, 900]) {
  const file = `montserrat-latin-${weight}-normal.woff2`;
  const from = join(root, "node_modules", "@fontsource", "montserrat", "files", file);
  if (!existsSync(from)) {
    console.warn(`missing ${from}; run npm install first`);
    continue;
  }
  copyFileSync(from, join(fontsOut, file));
}
console.log(`fonts  -> ${fontsOut}`);

for (const name of BUILT_IN_SFX) {
  writeFileSync(join(sfxOut, `${name}.wav`), encodeWav(SYNTHS[name]()));
}
console.log(`sfx    -> ${sfxOut} (${BUILT_IN_SFX.join(", ")})`);
