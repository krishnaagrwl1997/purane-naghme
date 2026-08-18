"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { clamp } from "@/app/lib/format";

/* ===================================================================
   The tape-position scale — this is the seek bar.

   It is printed like a real counter scale: a tick every 30 seconds, a
   taller numbered tick every minute, and a red needle you drag.

   - onPointerDown, NOT onClick. A click only fires on pointer*up*, so
     press-and-drag would do nothing until you let go. Pointer capture
     keeps the drag tracking after the finger leaves the strip.
   - `touch-none` (touch-action: none) stops the browser stealing a
     horizontal drag as a scroll or a pull-to-refresh.
   =================================================================== */

type TapeScaleProps = {
  position: number;
  duration: number;
  disabled?: boolean;
  onSeek: (seconds: number) => void;
  label?: string;
  className?: string;
};

export default function TapeScale({
  position,
  duration,
  disabled = false,
  onSeek,
  label = "Tape position",
  className = "",
}: TapeScaleProps) {
  const stripRef = useRef<HTMLDivElement>(null);
  const [scrubbing, setScrubbing] = useState(false);
  const [dragValue, setDragValue] = useState(0);

  const usable = duration > 0 && !disabled;
  const shown = scrubbing ? dragValue : position;
  const pct = duration > 0 ? clamp(shown / duration, 0, 1) * 100 : 0;

  /* One tick per 30s, numbered every 60s. A 3:45 song therefore reads
     0 1 2 3, exactly like the counter on the real thing. */
  const ticks = useMemo(() => {
    const span = duration > 0 ? duration : 240;
    const out: { at: number; major: boolean; minute: number }[] = [];
    for (let seconds = 0; seconds <= span; seconds += 30) {
      out.push({
        at: (seconds / span) * 100,
        major: seconds % 60 === 0,
        minute: seconds / 60,
      });
    }
    return out;
  }, [duration]);

  const valueFromClientX = useCallback(
    (clientX: number) => {
      const box = stripRef.current?.getBoundingClientRect();
      if (!box || box.width === 0) return 0;
      return clamp((clientX - box.left) / box.width, 0, 1) * duration;
    },
    [duration],
  );

  return (
    <div
      ref={stripRef}
      className={`tape-scale deck-recess relative h-8 touch-none rounded-[3px] bg-[#ded2b0]/85 select-none ${
        usable ? "cursor-pointer" : "cursor-default opacity-60"
      } ${className}`}
      data-scrubbing={scrubbing ? "true" : "false"}
      role="slider"
      tabIndex={usable ? 0 : -1}
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={Math.round(duration)}
      aria-valuenow={Math.round(shown)}
      aria-disabled={!usable}
      onPointerDown={(event) => {
        if (!usable) return;
        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        setScrubbing(true);
        setDragValue(valueFromClientX(event.clientX));
      }}
      onPointerMove={(event) => {
        if (!scrubbing) return;
        setDragValue(valueFromClientX(event.clientX));
      }}
      onPointerUp={(event) => {
        if (!scrubbing) return;
        const next = valueFromClientX(event.clientX);
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.currentTarget.releasePointerCapture(event.pointerId);
        }
        setScrubbing(false);
        onSeek(next);
      }}
      onPointerCancel={() => setScrubbing(false)}
      onKeyDown={(event) => {
        if (!usable) return;
        const stepSeconds = event.shiftKey ? 30 : 5;
        if (event.key === "ArrowRight") {
          event.preventDefault();
          onSeek(clamp(position + stepSeconds, 0, duration));
        } else if (event.key === "ArrowLeft") {
          event.preventDefault();
          onSeek(clamp(position - stepSeconds, 0, duration));
        } else if (event.key === "Home") {
          event.preventDefault();
          onSeek(0);
        }
      }}
    >
      {/* printed scale */}
      <div className="pointer-events-none absolute inset-x-2 top-0 bottom-0">
        {ticks.map((tick, index) => (
          <span
            key={index}
            className={`absolute top-0 w-px bg-deck-ink/45 ${tick.major ? "h-2.5" : "h-1.5"}`}
            style={{ left: `${tick.at}%` }}
          />
        ))}
        {ticks
          .filter((tick) => tick.major)
          .map((tick, index) => (
            <span
              key={`n${index}`}
              className="font-cond absolute top-[9px] -translate-x-1/2 text-[9px] leading-none text-deck-dim"
              style={{ left: `${tick.at}%` }}
            >
              {tick.minute}
            </span>
          ))}
      </div>

      {/* travel line */}
      <div className="pointer-events-none absolute inset-x-2 bottom-[7px] h-px bg-deck-ink/25" />

      {/* the needle */}
      <div className="pointer-events-none absolute inset-x-2 top-0 bottom-0">
        <span
          className="scale-needle absolute top-[3px] bottom-[3px] w-[3px] rounded-[1px] bg-deck-red shadow-[0_0_6px_rgba(157,47,34,0.5)]"
          style={{ left: `${pct}%` }}
        />
      </div>
    </div>
  );
}
