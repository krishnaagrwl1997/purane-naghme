import localFont from "next/font/local";

/* ===================================================================
   Fonts are SELF-HOSTED, not fetched from Google at build time.

   `next/font/google` reaches out to fonts.googleapis.com during
   `next build`. That turns every build — CI, a plane, a corporate
   proxy — into a network gamble, and a failed fetch is a hard build
   error, not a fallback. The woff2 files live in app/fonts/ instead
   (they came from the @fontsource packages, same files Google serves).

   `next/font/local` ships with Next, so this adds no dependency.
   Subsets are split so a Latin-only visitor never downloads the
   Devanagari block.
   =================================================================== */

/* Poster Devanagari for the masthead. */
export const display = localFont({
  src: [
    { path: "./fonts/yatra-one-devanagari-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/yatra-one-latin-400-normal.woff2", weight: "400", style: "normal" },
  ],
  variable: "--font-yatra",
  display: "swap",
  fallback: ["ui-serif", "Georgia", "serif"],
});

/* Printed-inlay Devanagari for the cassette J-card. */
export const devanagari = localFont({
  src: [
    { path: "./fonts/tiro-devanagari-hindi-devanagari-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/tiro-devanagari-hindi-latin-400-normal.woff2", weight: "400", style: "normal" },
  ],
  variable: "--font-tiro",
  display: "swap",
  fallback: ["ui-serif", "Georgia", "serif"],
});

/* The handwritten "here's how I made this!" note. */
export const hand = localFont({
  src: [
    { path: "./fonts/caveat-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/caveat-latin-600-normal.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-caveat",
  display: "swap",
  fallback: ["ui-serif", "cursive"],
});

/* Silk-screened hi-fi lettering on the deck. */
export const condensed = localFont({
  src: [
    { path: "./fonts/barlow-condensed-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/barlow-condensed-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "./fonts/barlow-condensed-latin-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-barlow",
  display: "swap",
  fallback: ["Arial Narrow", "ui-sans-serif", "sans-serif"],
});

export const FONT_VARS = `${display.variable} ${devanagari.variable} ${hand.variable} ${condensed.variable}`;
