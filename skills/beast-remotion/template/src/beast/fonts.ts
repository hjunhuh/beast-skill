import { continueRender, delayRender, staticFile } from "remotion";

let started = false;

/**
 * Load Montserrat 800/900 from public/fonts before the first frame renders.
 * `npm run assets` copies the files there from @fontsource/montserrat, so
 * rendering never depends on a font CDN. If the files are missing, the render
 * continues with the fallback fonts instead of hanging.
 */
export const ensureFonts = () => {
  if (started || typeof document === "undefined") return;
  started = true;
  const handle = delayRender("Loading Montserrat");
  const faces = [
    new FontFace("Montserrat", `url(${staticFile("fonts/montserrat-latin-900-normal.woff2")}) format('woff2')`, {
      weight: "900",
    }),
    new FontFace("Montserrat", `url(${staticFile("fonts/montserrat-latin-800-normal.woff2")}) format('woff2')`, {
      weight: "800",
    }),
  ];
  Promise.all(faces.map((f) => f.load()))
    .then((loaded) => loaded.forEach((f) => document.fonts.add(f)))
    .catch((err) => {
      console.warn("Montserrat not found in public/fonts; run `npm run assets`. Using fallback fonts.", err);
    })
    .finally(() => continueRender(handle));
};
