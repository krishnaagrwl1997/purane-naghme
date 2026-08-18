"use client";

import { useEffect, useState } from "react";

/* ===================================================================
   Listener count.

   There is no backend here, so this is a SIMULATED figure — a slow
   random walk around a baseline that dips overnight in IST. It is
   atmosphere, not analytics.

   To make it real: replace the effect with a poll of your own endpoint
   (or a WebSocket) and delete `simulate`. Nothing else reads this.
   =================================================================== */

const BASELINE = 240;

function simulate(previous: number | null): number {
  const istHour = Number(
    new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "numeric",
      hour12: false,
    }).format(new Date()),
  );
  // Quiet at 4am, busiest around 9pm.
  const curve = 0.45 + 0.55 * Math.sin(((istHour - 4) / 24) * Math.PI * 2 - Math.PI / 2);
  const target = Math.round(BASELINE * Math.max(0.25, curve));
  if (previous === null) return target + Math.round((Math.random() - 0.5) * 12);
  const drift = Math.round((target - previous) * 0.25 + (Math.random() - 0.5) * 7);
  return Math.max(12, previous + drift);
}

export default function OnlineCount() {
  // null on the server — a client-only figure would otherwise trip a
  // hydration mismatch on every load.
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    setCount((previous) => simulate(previous));
    const id = window.setInterval(() => setCount((previous) => simulate(previous)), 9000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <p
      className="pointer-events-auto flex items-center gap-2 text-[12.5px] text-white/60 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]"
      suppressHydrationWarning
    >
      <span className="relative flex h-[7px] w-[7px]" aria-hidden="true">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
        <span className="relative inline-flex h-[7px] w-[7px] rounded-full bg-emerald-400" />
      </span>
      <span>
        <span className="font-semibold text-white/90 tabular-nums">
          {count === null ? "—" : count.toLocaleString("en-IN")}
        </span>{" "}
        online
      </span>
    </p>
  );
}
