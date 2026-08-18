import { SITE } from "@/app/lib/site";

/* The masthead. Painted-poster Devanagari: an ivory face over stacked
   maroon offsets, the way a hand-lettered film hoarding sits on a wall. */
export default function Title() {
  return (
    <h1
      className="font-display text-center text-[#f4e6c9] select-none"
      style={{
        /* min(vw, vh) so the masthead also gets out of the way on short
           landscape phones instead of shoving the deck off-screen. */
        fontSize: "clamp(2.75rem, min(10.5vw, 13vh), 8.5rem)",
        /* Devanagari carries matras above the line and conjuncts below it.
           Sub-1 leading looks tight in Latin and collides in Devanagari —
           नग़्मे's nukta ran straight into पुराने's descenders at 0.88. */
        lineHeight: 1.16,
        textShadow:
          "0 1px 0 #8e3324, 0 3px 0 #7a2a1d, 0 5px 0 #5f2016, 0 14px 30px rgba(0,0,0,0.55)",
      }}
      lang="hi"
    >
      <span className="sr-only">{SITE.titleRoman} — </span>
      {SITE.titleLines.map((line, index) => (
        <span key={index} className="block">
          {line}
        </span>
      ))}
    </h1>
  );
}
