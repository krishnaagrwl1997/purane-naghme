"use client";

import type { Tape } from "@/app/lib/tracks";

/* The TAPE bank: A / B / C, one per playlist. Selecting a tape always
   starts it at track 1 — you just put a different cassette in. */
export default function TapeSelector({
  tapes,
  activeIndex,
  onSelect,
}: {
  tapes: Tape[];
  activeIndex: number;
  onSelect: (index: number) => void;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div role="tablist" aria-label="Tape" className="flex items-end gap-1">
        {tapes.map((tape, index) => {
          const active = index === activeIndex;
          return (
            <button
              key={tape.id}
              type="button"
              role="tab"
              aria-selected={active}
              aria-label={`Tape ${tape.key} — ${tape.name}`}
              title={`${tape.name} · ${tape.tagline}`}
              onClick={() => onSelect(index)}
              data-down={active ? "true" : "false"}
              className={
                "deck-key font-cond h-8 w-7 rounded-[4px] border border-deck-edge/45 " +
                "text-[12px] leading-none font-semibold tracking-wide transition-[transform,box-shadow] duration-75 " +
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent " +
                (active ? "text-deck-red" : "text-deck-ink/70")
              }
            >
              {tape.key}
            </button>
          );
        })}

        {/* the little slide switch — decorative, like the one on the real unit */}
        <span
          aria-hidden="true"
          className="deck-recess ml-1 h-8 w-2.5 rounded-[3px] bg-[#cbbd99]"
        >
          <span className="mt-[3px] ml-[1px] block h-3 w-[8px] rounded-[2px] bg-[#8f8265] shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]" />
        </span>
      </div>
      <span className="font-cond text-[8.5px] leading-none tracking-[0.22em] text-deck-dim">
        TAPE
      </span>
    </div>
  );
}
