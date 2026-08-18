"use client";

import type { RefObject } from "react";
import type { Track } from "@/app/lib/tracks";

/* ===================================================================
   The cassette inlay: a tape window with the live video in it, and the
   printed J-card text underneath.

   The window is a plain reserved box — the iframe is a fixed-position
   layer parked exactly over it (see VideoStage). Nothing is drawn on
   top of the video: no chips, no scrims, no overlays. The player's own
   controls, and the Skip Ad button, have to stay reachable.

   No YouTube thumbnails are downloaded or re-hosted. The video IS the
   artwork, at 16:9, which is also the shape it is served in — cropping
   a 16:9 still into a square throws away the sides and then crops it
   again.
   =================================================================== */
export default function Inlay({
  slotRef,
  track,
  compact = false,
}: {
  slotRef: RefObject<HTMLDivElement | null>;
  track: Track;
  compact?: boolean;
}) {
  return (
    <div className="flex flex-col">
      {/* tape window */}
      <div className="deck-recess rounded-[5px] border border-deck-edge/60 bg-black/85 p-[3px]">
        <div ref={slotRef} className="aspect-video w-full rounded-[3px] bg-black" />
      </div>

      {/* printed inlay */}
      <div className={`mt-2 min-w-0 ${compact ? "" : "px-0.5"}`}>
        <div className="flex items-center gap-1.5">
          <span className="font-cond rounded-[2px] bg-deck-ink px-1.5 py-[1px] text-[8.5px] leading-[1.5] tracking-[0.16em] text-deck-hi uppercase">
            {track.film}
          </span>
          <span className="font-cond text-[8.5px] tracking-[0.18em] text-deck-dim">
            {track.year}
          </span>
        </div>

        <p
          className="font-deva mt-1 truncate text-[15px] leading-tight text-deck-red"
          lang="hi"
        >
          {track.titleHi}
        </p>

        <p className="truncate text-[12px] leading-tight text-deck-ink italic">
          {track.title}
        </p>

        <p className="font-cond mt-0.5 truncate text-[9.5px] tracking-[0.12em] text-deck-dim uppercase">
          {track.artist}
        </p>
      </div>
    </div>
  );
}
