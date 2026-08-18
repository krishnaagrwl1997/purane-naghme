"use client";

/* Four mechanical keys, like a real deck: REW, PLAY, PAUSE, FF.
   PLAY stays latched down while the tape is running. */

const KEY =
  "deck-key grid place-items-center rounded-[5px] border border-deck-edge/45 " +
  "text-deck-ink/85 transition-[transform,box-shadow] duration-75 " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

function Rew() {
  return (
    <svg viewBox="0 0 24 14" className="h-[9px] w-4" fill="currentColor" aria-hidden="true">
      <path d="M11.4 1.6a.7.7 0 0 0-1.1-.6l-8 5.4a.7.7 0 0 0 0 1.2l8 5.4a.7.7 0 0 0 1.1-.6V1.6Z" />
      <path d="M22.4 1.6a.7.7 0 0 0-1.1-.6l-8 5.4a.7.7 0 0 0 0 1.2l8 5.4a.7.7 0 0 0 1.1-.6V1.6Z" />
    </svg>
  );
}

function Ff() {
  return (
    <svg viewBox="0 0 24 14" className="h-[9px] w-4" fill="currentColor" aria-hidden="true">
      <path d="M1.6 1.6a.7.7 0 0 1 1.1-.6l8 5.4a.7.7 0 0 1 0 1.2l-8 5.4a.7.7 0 0 1-1.1-.6V1.6Z" />
      <path d="M12.6 1.6a.7.7 0 0 1 1.1-.6l8 5.4a.7.7 0 0 1 0 1.2l-8 5.4a.7.7 0 0 1-1.1-.6V1.6Z" />
    </svg>
  );
}

function Play() {
  return (
    <svg viewBox="0 0 14 14" className="h-[10px] w-[10px]" fill="currentColor" aria-hidden="true">
      <path d="M2.4 1.2a.7.7 0 0 1 1.06-.6l9 5.8a.7.7 0 0 1 0 1.2l-9 5.8a.7.7 0 0 1-1.06-.6V1.2Z" />
    </svg>
  );
}

function Pause() {
  return (
    <svg viewBox="0 0 14 14" className="h-[10px] w-[10px]" fill="currentColor" aria-hidden="true">
      <rect x="2" y="1" width="3.6" height="12" rx="0.6" />
      <rect x="8.4" y="1" width="3.6" height="12" rx="0.6" />
    </svg>
  );
}

export default function TransportKeys({
  isPlaying,
  canPlay,
  onPrev,
  onNext,
  onPlay,
  onPause,
  variant,
}: {
  isPlaying: boolean;
  canPlay: boolean;
  onPrev: () => void;
  onNext: () => void;
  onPlay: () => void;
  onPause: () => void;
  variant: "desktop" | "mobile";
}) {
  // 44px minimum touch target on mobile.
  const height = variant === "mobile" ? "h-11" : "h-8";

  return (
    <div className={`grid grid-cols-4 gap-1.5 ${variant === "mobile" ? "gap-2" : ""}`}>
      <button type="button" className={`${KEY} ${height}`} onClick={onPrev} aria-label="Previous track">
        <Rew />
      </button>

      <button
        type="button"
        className={`${KEY} ${height} ${isPlaying ? "text-deck-red" : ""}`}
        data-down={isPlaying ? "true" : "false"}
        onClick={onPlay}
        disabled={!canPlay}
        aria-label="Play"
        aria-pressed={isPlaying}
      >
        <Play />
      </button>

      <button
        type="button"
        className={`${KEY} ${height}`}
        data-down={!isPlaying && canPlay ? "true" : "false"}
        onClick={onPause}
        disabled={!canPlay}
        aria-label="Pause"
        aria-pressed={!isPlaying}
      >
        <Pause />
      </button>

      <button type="button" className={`${KEY} ${height}`} onClick={onNext} aria-label="Next track">
        <Ff />
      </button>
    </div>
  );
}
