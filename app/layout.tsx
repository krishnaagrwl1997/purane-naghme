import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { FONT_VARS } from "./fonts";
import { SITE } from "./lib/site";
import "./globals.css";

export const metadata: Metadata = {
  title: `${SITE.titleLines.join(" ")} — ${SITE.titleRoman}`,
  description: SITE.tagline,
};

export const viewport: Viewport = {
  // Lets the scene run under the notch and the home indicator; the
  // safe-area insets in globals.css keep the controls clear of them.
  viewportFit: "cover",
  themeColor: "#241d16",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={FONT_VARS}>
      <head>
        {/* The deck pulls its iframe from here the moment someone presses play. */}
        <link rel="preconnect" href="https://www.youtube-nocookie.com" />
        <link rel="preconnect" href="https://www.youtube.com" />
        <link
          rel="preload"
          as="image"
          href="/bg/scene-wide.png"
          media="(orientation: landscape)"
        />
        <link
          rel="preload"
          as="image"
          href="/bg/scene-tall.png"
          media="(orientation: portrait)"
        />
      </head>
      <body className="flex min-h-dvh flex-col antialiased">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
