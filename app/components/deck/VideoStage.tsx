"use client";

import type { RefObject } from "react";

export type StageRect = { left: number; top: number; width: number; height: number };

/* ===================================================================
   The one and only YouTube surface.

   Why it is a single fixed-position layer instead of just sitting
   inside the deck:

   - The brief calls for TWO separate layouts (`hidden sm:flex` and
     `sm:hidden`), so there are two tape-window slots in the DOM at
     once. An iframe can only live in one of them.
   - Moving an <iframe> between parents reloads it and playback stops
     dead. So the iframe never moves. It is mounted once, here, and this
     layer is positioned over whichever slot is currently visible,
     re-measured whenever the layout changes.

   It is never hidden, never 1px, never opacity-0, and it is always a
   full 16:9 at the deck's own scale. That is both a YouTube Developer
   Policy requirement (no background-only players, no separating the
   audio from the video) and the only way the "Skip Ad" button is
   reachable — it lives inside this player.
   =================================================================== */

type VideoStageProps = {
  hostRef: RefObject<HTMLDivElement | null>;
  rect: StageRect | null;
  needsVideoId: boolean;
  notice: string | null;
};

export default function VideoStage({
  hostRef,
  rect,
  needsVideoId,
  notice,
}: VideoStageProps) {
  return (
    <div
      aria-hidden={rect ? undefined : true}
      className="fixed z-40 overflow-hidden bg-black"
      style={{
        left: rect?.left ?? 0,
        top: rect?.top ?? 0,
        width: rect?.width ?? 0,
        height: rect?.height ?? 0,
        opacity: rect ? 1 : 0,
        borderRadius: 3,
        transition: "opacity 220ms linear",
        willChange: "left, top, width, height",
      }}
    >
      <div ref={hostRef} className="yt-host absolute inset-0" />

      {needsVideoId ? (
        <div className="absolute inset-0 grid place-items-center bg-black/85 px-3 text-center">
          <p className="text-[11px] leading-snug text-white/70">
            Add a videoId in <code className="font-mono">app/lib/tracks.ts</code>
          </p>
        </div>
      ) : null}

      {notice ? (
        <div className="absolute inset-x-0 bottom-0 bg-black/75 px-2 py-1 text-center text-[10px] leading-snug text-accent-soft">
          {notice}
        </div>
      ) : null}
    </div>
  );
}
