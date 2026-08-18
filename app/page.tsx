import Clock from "./components/Clock";
import Deck from "./components/Deck";
import HowIMadeThis from "./components/HowIMadeThis";
import OnlineCount from "./components/OnlineCount";
import SocialLinks from "./components/SocialLinks";
import Title from "./components/Title";
import { SITE } from "./lib/site";

export default function Home() {
  return (
    <main className="relative flex min-h-dvh flex-1 flex-col items-center justify-between overflow-x-hidden">
      {/* 1 — the scene. Fixed, so it never scrolls or rubber-bands on iOS. */}
      <div className="hero-bg fixed inset-0 -z-20 bg-cover bg-center" aria-hidden="true">
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/80" />
      </div>

      {/* 2 — grain, over the scene and under everything else. */}
      <div className="grain fixed inset-0 -z-10" aria-hidden="true" />

      {/* 3 — the top row. pointer-events-none on the rail so the dead space
             between the three items never eats a tap meant for the scene. */}
      <div className="safe-top safe-x pointer-events-none fixed inset-x-0 top-0 z-20 grid grid-cols-[1fr_auto_1fr] items-start gap-2 sm:gap-3">
        <div className="justify-self-start">
          <Clock />
        </div>
        <div className="justify-self-center">
          <OnlineCount />
        </div>
        <div className="justify-self-end">
          <SocialLinks />
        </div>
      </div>

      {/* 4 — the masthead, floating in the middle of the street. */}
      <div className="flex w-full flex-1 items-center justify-center px-4 pt-14 pb-2">
        <Title />
      </div>

      {/* 5 — the deck. */}
      <div className="safe-bottom safe-x z-30 flex w-full flex-col items-center">
        <div className="w-full max-w-[680px]">
          <div className="mb-2 flex justify-start pl-3">
            <HowIMadeThis />
          </div>
          <Deck />
          <p className="mt-3 text-center text-[11.5px] text-white/45 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
            Made with <span className="text-[#e0574c]">♥</span> by {SITE.credit}
          </p>
        </div>
      </div>
    </main>
  );
}
