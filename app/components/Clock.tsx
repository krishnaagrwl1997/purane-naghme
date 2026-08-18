"use client";

import { useEffect, useMemo, useState } from "react";

/* Built once, not per tick — constructing Intl.DateTimeFormat is the
   expensive half of formatting. */
function makeFormatter() {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

type Parts = { hour: string; minute: string; dayPeriod: string };

function readParts(formatter: Intl.DateTimeFormat, date: Date): Parts {
  const parts = formatter.formatToParts(date);
  const find = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";
  return {
    hour: find("hour"),
    minute: find("minute"),
    dayPeriod: find("dayPeriod").toLowerCase().replace(/\s|\./g, ""),
  };
}

export default function Clock() {
  const formatter = useMemo(makeFormatter, []);
  // Null on the server: IST "now" at request time would not match the
  // client's first paint and React would flag a hydration mismatch.
  const [parts, setParts] = useState<Parts | null>(null);

  useEffect(() => {
    const tick = () => setParts(readParts(formatter, new Date()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [formatter]);

  return (
    <p
      className="pointer-events-auto flex items-baseline gap-1.5 text-[12.5px] tabular-nums text-white/60 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]"
      suppressHydrationWarning
    >
      {parts ? (
        <>
          <span className="font-semibold text-white/90">
            {parts.hour}
            {/* the second hand of a clock with no second hand */}
            <span className="animate-blink px-px">:</span>
            {parts.minute}
          </span>
          <span className="text-[10px] tracking-widest uppercase">{parts.dayPeriod}</span>
          <span className="text-[10px] tracking-[0.18em] text-white/35 uppercase">IST</span>
        </>
      ) : (
        <span className="font-semibold text-white/30">--:--</span>
      )}
    </p>
  );
}
