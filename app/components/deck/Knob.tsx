"use client";

import { useCallback, useRef } from "react";
import { clamp } from "@/app/lib/format";

/* Knobs sweep 270°, from 7 o'clock to 5 o'clock, like every hi-fi ever. */
const SWEEP = 270;
const MIN_ANGLE = -135;

function angleFor(value01: number) {
  return MIN_ANGLE + clamp(value01, 0, 1) * SWEEP;
}

type KnobProps = {
  label: string;
  /** 0..1 */
  value: number;
  size: number;
  /** omit to render a read-only indicator dial (not focusable, aria-hidden) */
  onChange?: (value01: number) => void;
  ariaLabel?: string;
  formatValue?: (value01: number) => string;
};

export default function Knob({
  label,
  value,
  size,
  onChange,
  ariaLabel,
  formatValue,
}: KnobProps) {
  const knobRef = useRef<HTMLDivElement>(null);
  const interactive = typeof onChange === "function";

  const valueFromPointer = useCallback((clientX: number, clientY: number) => {
    const box = knobRef.current?.getBoundingClientRect();
    if (!box) return 0;
    const dx = clientX - (box.left + box.width / 2);
    const dy = clientY - (box.top + box.height / 2);
    // 0° points up; clockwise positive.
    const degrees = (Math.atan2(dx, -dy) * 180) / Math.PI;
    return clamp((degrees - MIN_ANGLE) / SWEEP, 0, 1);
  }, []);

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        ref={knobRef}
        role={interactive ? "slider" : undefined}
        aria-hidden={interactive ? undefined : true}
        aria-label={interactive ? (ariaLabel ?? label) : undefined}
        aria-valuemin={interactive ? 0 : undefined}
        aria-valuemax={interactive ? 100 : undefined}
        aria-valuenow={interactive ? Math.round(value * 100) : undefined}
        aria-valuetext={interactive && formatValue ? formatValue(value) : undefined}
        tabIndex={interactive ? 0 : -1}
        className={`relative rounded-full ring-1 ring-deck-edge/70 outline-none ${
          interactive
            ? "cursor-grab touch-none active:cursor-grabbing focus-visible:ring-2 focus-visible:ring-accent"
            : "cursor-default"
        }`}
        style={{
          width: size,
          height: size,
          backgroundImage:
            "linear-gradient(to bottom, #f6efdb 0%, #e2d6b4 45%, #bfae88 100%)",
          boxShadow:
            "0 3px 6px -1px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.9), inset 0 -3px 6px rgba(0,0,0,0.12)",
        }}
        onPointerDown={
          interactive
            ? (event) => {
                event.preventDefault();
                event.currentTarget.setPointerCapture(event.pointerId);
                onChange?.(valueFromPointer(event.clientX, event.clientY));
              }
            : undefined
        }
        onPointerMove={
          interactive
            ? (event) => {
                if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
                onChange?.(valueFromPointer(event.clientX, event.clientY));
              }
            : undefined
        }
        onPointerUp={
          interactive
            ? (event) => {
                if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                  event.currentTarget.releasePointerCapture(event.pointerId);
                }
              }
            : undefined
        }
        onKeyDown={
          interactive
            ? (event) => {
                const stepValue = event.shiftKey ? 0.2 : 0.05;
                if (event.key === "ArrowUp" || event.key === "ArrowRight") {
                  event.preventDefault();
                  onChange?.(clamp(value + stepValue, 0, 1));
                } else if (event.key === "ArrowDown" || event.key === "ArrowLeft") {
                  event.preventDefault();
                  onChange?.(clamp(value - stepValue, 0, 1));
                }
              }
            : undefined
        }
      >
        {/* the pointer line, cut into the cap */}
        <span
          className="absolute inset-0 grid place-items-start justify-center"
          style={{ transform: `rotate(${angleFor(value)}deg)` }}
        >
          <span
            className="mt-[9%] block w-[2px] rounded-full bg-deck-ink/80"
            style={{ height: `${size * 0.3}px` }}
          />
        </span>
        {/* a dished centre */}
        <span className="pointer-events-none absolute inset-[26%] rounded-full bg-black/5 shadow-[inset_0_1px_2px_rgba(0,0,0,0.18)]" />
      </div>
      <span className="font-cond text-[8.5px] leading-none tracking-[0.22em] text-deck-dim">
        {label}
      </span>
    </div>
  );
}
