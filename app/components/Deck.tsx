"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { track as analytics } from "@vercel/analytics";

import { TAPES, isPlayable, type Track } from "@/app/lib/tracks";
import { SITE } from "@/app/lib/site";
import { clamp } from "@/app/lib/format";
import {
  YT_STATE,
  describeYouTubeError,
  loadYouTubeApi,
  type YTPlayer,
} from "@/app/lib/youtube";

import Inlay from "./deck/Inlay";
import Knob from "./deck/Knob";
import TapeScale from "./deck/TapeScale";
import TapeSelector from "./deck/TapeSelector";
import TransportKeys from "./deck/TransportKeys";
import VideoStage, { type StageRect } from "./deck/VideoStage";
import Window from "./deck/Window";

/* ===================================================================
   EVERY sub-component here lives at module scope — in its own file
   above, or as a top-level `function` below. None are declared inside
   <Deck />.

   That is not a style preference. Declared inside the parent, a
   component gets a new function identity on every render; React treats
   it as a different component type, unmounts the subtree and mounts a
   fresh one. With a progress tick running four times a second, every
   CSS animation in the deck would restart from zero four times a
   second — and, far worse, the YouTube iframe would be torn down and
   rebuilt, so the music would stop.
   =================================================================== */

const PROGRESS_INTERVAL_MS = 250;

function visible(element: HTMLElement | null): HTMLElement | null {
  // `hidden` / `sm:hidden` resolve to display:none, which nulls offsetParent.
  return element && element.offsetParent !== null ? element : null;
}

function sameRect(a: StageRect | null, b: StageRect | null): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return (
    Math.abs(a.left - b.left) < 0.5 &&
    Math.abs(a.top - b.top) < 0.5 &&
    Math.abs(a.width - b.width) < 0.5 &&
    Math.abs(a.height - b.height) < 0.5
  );
}

/* --- module-scope pieces -------------------------------------------- */

function BrandStrip({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex items-baseline gap-2 border-t border-deck-edge/35 pt-1.5 ${className}`}
    >
      <span className="font-cond text-[15px] leading-none font-bold tracking-[0.02em] text-deck-ink">
        {SITE.deck.brand}
      </span>
      <span className="font-cond truncate text-[8.5px] leading-none tracking-[0.2em] text-deck-dim">
        {SITE.deck.model}
      </span>
    </div>
  );
}

/* The silk-screened plate below the readout: which cassette is in, and a
   stamped speaker grille to fill the deck face. */
function TapePlate({ name, tagline }: { name: string; tagline: string }) {
  return (
    <div className="flex items-center justify-between gap-3 px-0.5">
      <div className="min-w-0">
        <p className="font-cond truncate text-[11px] leading-tight tracking-[0.22em] text-deck-ink uppercase">
          {name}
        </p>
        <p className="font-cond truncate text-[8.5px] leading-tight tracking-[0.16em] text-deck-dim">
          {tagline}
        </p>
      </div>
      <span
        aria-hidden="true"
        className="deck-recess h-6 w-24 shrink-0 rounded-[2px]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, rgba(67,57,31,0.28) 0 1px, rgba(255,255,255,0.35) 1px 4px)",
        }}
      />
    </div>
  );
}

function DeckShell({
  shellRef,
  className = "",
  children,
}: {
  shellRef?: RefObject<HTMLDivElement | null>;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      ref={shellRef}
      className={`deck-shell rounded-[16px] border border-deck-edge/60 p-2.5 ${className}`}
    >
      <div className="rounded-[11px] border border-white/25 p-2.5">{children}</div>
    </div>
  );
}

/* --- the deck -------------------------------------------------------- */

export default function Deck() {
  const [tapeIndex, setTapeIndex] = useState(0);
  const [trackIndex, setTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [reportedDuration, setReportedDuration] = useState(0);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [volume, setVolume] = useState(0.8);
  const [rect, setRect] = useState<StageRect | null>(null);

  const playerRef = useRef<YTPlayer | null>(null);
  const hostRef = useRef<HTMLDivElement | null>(null);
  const pendingPlayRef = useRef(false);
  const autoplayNextRef = useRef(false);
  const errorStreakRef = useRef(0);

  const desktopSlotRef = useRef<HTMLDivElement | null>(null);
  const mobileSlotRef = useRef<HTMLDivElement | null>(null);
  const desktopShellRef = useRef<HTMLDivElement | null>(null);
  const mobileShellRef = useRef<HTMLDivElement | null>(null);

  const tape = TAPES[tapeIndex];
  const currentTrack: Track = tape.tracks[trackIndex];
  const playable = isPlayable(currentTrack);
  const duration = reportedDuration > 0 ? reportedDuration : currentTrack.duration;

  const trackTotal = tape.tracks.length;

  /* --- navigation --------------------------------------------------- */

  const goToTrack = useCallback(
    (next: number, autoplay: boolean) => {
      const count = TAPES[tapeIndex].tracks.length;
      autoplayNextRef.current = autoplay;
      setPosition(0);
      setReportedDuration(0);
      setTrackIndex(((next % count) + count) % count);
    },
    [tapeIndex],
  );

  const step = useCallback(
    (delta: number, autoplay: boolean) => goToTrack(trackIndex + delta, autoplay),
    [goToTrack, trackIndex],
  );

  const selectTape = useCallback(
    (index: number) => {
      if (index === tapeIndex) return;
      autoplayNextRef.current = isPlaying;
      setPosition(0);
      setReportedDuration(0);
      setNotice(null);
      errorStreakRef.current = 0;
      setTapeIndex(index);
      setTrackIndex(0); // a new cassette always starts at track 1
    },
    [isPlaying, tapeIndex],
  );

  /* Refs so the once-only YouTube callbacks can read fresh state without
     rebuilding the player on every render. */
  const currentTrackRef = useRef(currentTrack);
  const tapeIndexRef = useRef(tapeIndex);
  const stepRef = useRef(step);
  useEffect(() => {
    currentTrackRef.current = currentTrack;
    tapeIndexRef.current = tapeIndex;
    stepRef.current = step;
  });

  /* onReady only ever runs once, so it reads the volume through a ref. */
  const volumeRef = useRef(volume);
  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);

  /* --- the engine --------------------------------------------------- */

  useEffect(() => {
    let cancelled = false;

    loadYouTubeApi()
      .then((YT) => {
        if (cancelled || !hostRef.current || playerRef.current) return;

        // Hand YouTube a div React does not own. YT.Player REPLACES the
        // element it is given, and React throws on unmount if that
        // element was one of its own children.
        const target = document.createElement("div");
        hostRef.current.appendChild(target);

        playerRef.current = new YT.Player(target, {
          host: "https://www.youtube-nocookie.com",
          playerVars: {
            playsinline: 1, // iOS: don't hijack the screen
            rel: 0,
            modestbranding: 1,
            controls: 1, // keep YouTube's controls — including Skip Ad
            origin: window.location.origin,
          },
          events: {
            onReady: (event) => {
              if (cancelled) return;
              event.target.setVolume(Math.round(volumeRef.current * 100));
              setReady(true);
            },
            onStateChange: (event) => {
              if (cancelled) return;
              const player = event.target;
              switch (event.data) {
                case YT_STATE.PLAYING: {
                  errorStreakRef.current = 0;
                  setIsPlaying(true);
                  setNotice(null);
                  const reported = player.getDuration();
                  setReportedDuration(reported > 0 ? reported : 0);
                  break;
                }
                case YT_STATE.PAUSED:
                  setIsPlaying(false);
                  break;
                case YT_STATE.ENDED:
                  setIsPlaying(false);
                  stepRef.current(1, true);
                  break;
                case YT_STATE.CUED:
                  setIsPlaying(false);
                  setReportedDuration(player.getDuration() || 0);
                  break;
                default:
                  break;
              }
            },
            onError: (event) => {
              if (cancelled) return;

              /* Videos get deleted, go private, or have embedding switched
                 off long after you ship. Don't strand the listener on a
                 dead track: report it and move on. */
              const failing = currentTrackRef.current;
              const reason = describeYouTubeError(event.data);
              analytics("youtube_player_error", {
                code: event.data,
                reason,
                videoId: failing.videoId,
                trackId: failing.id,
                title: failing.title,
                channel: failing.channel,
              });

              errorStreakRef.current += 1;
              const total = TAPES[tapeIndexRef.current].tracks.length;
              if (errorStreakRef.current >= total) {
                setIsPlaying(false);
                setNotice("Every track on this tape failed to load.");
                return;
              }
              setNotice(`Skipped “${failing.title}” — ${reason.replace(/-/g, " ")}`);
              stepRef.current(1, true);
            },
          },
        });
      })
      .catch(() => {
        if (!cancelled) setNotice("Couldn't reach YouTube. Check your connection.");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  /* Load / cue whenever the selection changes. */
  useEffect(() => {
    const player = playerRef.current;
    if (!ready || !player) return;

    if (!isPlayable(currentTrack)) {
      player.stopVideo();
      setIsPlaying(false);
      return;
    }

    const shouldPlay = autoplayNextRef.current || pendingPlayRef.current;
    autoplayNextRef.current = false;
    pendingPlayRef.current = false;

    if (shouldPlay) player.loadVideoById(currentTrack.videoId);
    else player.cueVideoById(currentTrack.videoId);
  }, [ready, currentTrack]);

  /* Progress. Polled — the IFrame API has no timeupdate event. */
  useEffect(() => {
    if (!isPlaying) return;
    const id = window.setInterval(() => {
      const player = playerRef.current;
      if (!player) return;
      setPosition(player.getCurrentTime() || 0);
      const reported = player.getDuration();
      if (reported > 0) setReportedDuration(reported);
    }, PROGRESS_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [isPlaying]);

  /* --- controls ----------------------------------------------------- */

  const play = useCallback(() => {
    const player = playerRef.current;
    /* Never gated behind a readiness/canplay event. On iOS Safari
       `canplay` does not fire until after a user gesture, so a button
       that waits for it is dead forever. The gesture IS the cue; if the
       API hasn't landed we just remember the intent. */
    if (!player || !ready) {
      pendingPlayRef.current = true;
      return;
    }
    player.playVideo();
  }, [ready]);

  const pause = useCallback(() => {
    pendingPlayRef.current = false;
    playerRef.current?.pauseVideo();
  }, []);

  const seek = useCallback((seconds: number) => {
    setPosition(seconds);
    playerRef.current?.seekTo(seconds, true);
  }, []);

  const changeVolume = useCallback((value01: number) => {
    const next = clamp(value01, 0, 1);
    setVolume(next);
    playerRef.current?.setVolume(Math.round(next * 100));
  }, []);

  /* --- keep the video layer glued to the visible tape window --------- */

  const measure = useCallback(() => {
    const slot = visible(desktopSlotRef.current) ?? visible(mobileSlotRef.current);
    if (!slot) return;
    const box = slot.getBoundingClientRect();
    const next: StageRect = {
      left: box.left,
      top: box.top,
      width: box.width,
      height: box.height,
    };
    setRect((previous) => (sameRect(previous, next) ? previous : next));
  }, []);

  useEffect(() => {
    measure();

    const observer = new ResizeObserver(() => measure());
    for (const node of [
      desktopShellRef.current,
      mobileShellRef.current,
      document.documentElement,
    ]) {
      if (node) observer.observe(node);
    }

    window.addEventListener("resize", measure);
    window.addEventListener("orientationchange", measure);
    window.addEventListener("scroll", measure, { passive: true });
    // The shell also reflows when the title text changes, and again once
    // the webfonts settle.
    const timer = window.setTimeout(measure, 500);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("orientationchange", measure);
      window.removeEventListener("scroll", measure);
      window.clearTimeout(timer);
    };
  }, [measure, currentTrack, tapeIndex]);

  const tuneValue = useMemo(
    () => (duration > 0 ? clamp(position / duration, 0, 1) : 0),
    [position, duration],
  );

  /* --- render ------------------------------------------------------- */

  return (
    <>
      <VideoStage
        hostRef={hostRef}
        rect={rect}
        needsVideoId={!playable}
        notice={notice}
      />

      {/* ================= DESKTOP: the deck, laid out wide ============ */}
      <DeckShell shellRef={desktopShellRef} className="hidden w-full sm:block">
        <div className="flex gap-3">
          <div className="w-[45%] shrink-0">
            <Inlay slotRef={desktopSlotRef} track={currentTrack} />
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <TapeScale
              position={position}
              duration={duration}
              disabled={!playable}
              onSeek={seek}
              label={`Tape position — ${currentTrack.title}`}
            />
            <Window
              tapeKey={tape.key}
              trackNumber={trackIndex + 1}
              trackTotal={trackTotal}
              position={position}
              duration={duration}
            />
            <TapePlate name={tape.name} tagline={tape.tagline} />

            <div className="mt-auto flex items-end justify-between gap-2 pt-1">
              <Knob
                label="VOLUME"
                ariaLabel="Volume"
                value={volume}
                size={40}
                onChange={changeVolume}
                formatValue={(value) => `${Math.round(value * 100)} percent`}
              />
              <TapeSelector tapes={TAPES} activeIndex={tapeIndex} onSelect={selectTape} />
              {/* TUNE is an indicator, not a control: it tracks how far
                  through the side you are. Not focusable, aria-hidden. */}
              <Knob label="TUNE" value={tuneValue} size={54} />
            </div>
          </div>
        </div>

        <div className="mt-2.5 flex items-end gap-3">
          <div className="w-[45%] shrink-0">
            <TransportKeys
              variant="desktop"
              isPlaying={isPlaying}
              canPlay={playable}
              onPrev={() => step(-1, isPlaying)}
              onNext={() => step(1, isPlaying)}
              onPlay={play}
              onPause={pause}
            />
          </div>
          <BrandStrip className="min-w-0 flex-1" />
        </div>
      </DeckShell>

      {/* ================= MOBILE: the same deck, stacked ============== */}
      <DeckShell shellRef={mobileShellRef} className="w-full sm:hidden">
        <Inlay slotRef={mobileSlotRef} track={currentTrack} compact />

        <div className="mt-2.5 flex flex-col gap-2">
          <TapeScale
            position={position}
            duration={duration}
            disabled={!playable}
            onSeek={seek}
            label={`Tape position — ${currentTrack.title}`}
          />
          <Window
            tapeKey={tape.key}
            trackNumber={trackIndex + 1}
            trackTotal={trackTotal}
            position={position}
            duration={duration}
          />
          <TransportKeys
            variant="mobile"
            isPlaying={isPlaying}
            canPlay={playable}
            onPrev={() => step(-1, isPlaying)}
            onNext={() => step(1, isPlaying)}
            onPlay={play}
            onPause={pause}
          />

          <div className="flex items-end justify-between gap-2">
            <Knob
              label="VOLUME"
              ariaLabel="Volume"
              value={volume}
              size={38}
              onChange={changeVolume}
              formatValue={(value) => `${Math.round(value * 100)} percent`}
            />
            <TapeSelector tapes={TAPES} activeIndex={tapeIndex} onSelect={selectTape} />
            <Knob label="TUNE" value={tuneValue} size={44} />
          </div>

          <BrandStrip />
        </div>
      </DeckShell>
    </>
  );
}
