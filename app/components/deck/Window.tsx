"use client";

import { formatTime } from "@/app/lib/format";

/* The little dark readout under the scale: which side and track is
   loaded, the four-digit mechanical counter, and the time. */
export default function Window({
  tapeKey,
  trackNumber,
  trackTotal,
  position,
  duration,
}: {
  tapeKey: string;
  trackNumber: number;
  trackTotal: number;
  position: number;
  duration: number;
}) {
  /* Real tape counters don't measure seconds — they count revolutions of
     the take-up spool, roughly 1.7 per second on a C-60. It drifts from
     the timecode, which is exactly right. */
  const counter = String(Math.floor(position * 1.7) % 10000).padStart(4, "0");

  return (
    <div className="deck-recess flex items-center justify-between rounded-[3px] bg-window px-2.5 py-1.5">
      <span className="font-cond text-[10px] tracking-[0.14em] text-window-ink/75 tabular-nums">
        {tapeKey}·{trackNumber}/{trackTotal}
      </span>
      <span className="font-cond text-[12px] leading-none tracking-[0.3em] text-window-ink tabular-nums">
        {counter}
      </span>
      <span className="font-cond text-[10px] tracking-[0.1em] text-window-ink/75 tabular-nums">
        {formatTime(position)} / {formatTime(duration)}
      </span>
    </div>
  );
}
