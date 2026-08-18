/* ===================================================================
   YouTube IFrame Player API loader.

   The API script may only be injected once per document, and it calls
   a single global `onYouTubeIframeAPIReady`. Everything below funnels
   through one shared promise so React Strict Mode's double-effect (and
   any future second consumer) can't inject it twice.
   =================================================================== */

export const YT_STATE = {
  UNSTARTED: -1,
  ENDED: 0,
  PLAYING: 1,
  PAUSED: 2,
  BUFFERING: 3,
  CUED: 5,
} as const;

export type YTPlayer = {
  playVideo(): void;
  pauseVideo(): void;
  stopVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  getCurrentTime(): number;
  getDuration(): number;
  getPlayerState(): number;
  setVolume(volume: number): void;
  getVolume(): number;
  mute(): void;
  unMute(): void;
  isMuted(): boolean;
  loadVideoById(videoId: string, startSeconds?: number): void;
  cueVideoById(videoId: string, startSeconds?: number): void;
  getIframe(): HTMLIFrameElement;
  destroy(): void;
};

type YTPlayerEvent = { target: YTPlayer; data: number };

type YTNamespace = {
  Player: new (
    element: HTMLElement | string,
    options: {
      videoId?: string;
      host?: string;
      playerVars?: Record<string, string | number>;
      events?: {
        onReady?: (event: { target: YTPlayer }) => void;
        onStateChange?: (event: YTPlayerEvent) => void;
        onError?: (event: YTPlayerEvent) => void;
      };
    },
  ) => YTPlayer;
};

declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let apiPromise: Promise<YTNamespace> | null = null;

export function loadYouTubeApi(): Promise<YTNamespace> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("YouTube API is browser-only"));
  }
  if (apiPromise) return apiPromise;

  apiPromise = new Promise<YTNamespace>((resolve, reject) => {
    if (window.YT?.Player) {
      resolve(window.YT);
      return;
    }

    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      if (window.YT?.Player) resolve(window.YT);
      else reject(new Error("YouTube API loaded without YT.Player"));
    };

    const existing = document.querySelector<HTMLScriptElement>(
      'script[src*="youtube.com/iframe_api"]',
    );
    if (existing) return; // already in flight; our callback will fire

    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    script.onerror = () => reject(new Error("Failed to load the YouTube IFrame API"));
    document.head.appendChild(script);
  });

  return apiPromise;
}

/** Human-readable reasons, for the analytics payload. */
export function describeYouTubeError(code: number): string {
  switch (code) {
    case 2:
      return "invalid-video-id";
    case 5:
      return "html5-player-error";
    case 100:
      return "video-removed-or-private";
    case 101:
    case 150:
      return "embedding-disabled-by-owner";
    default:
      return `unknown-${code}`;
  }
}
