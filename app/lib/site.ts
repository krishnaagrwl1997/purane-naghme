/* Edit these five things; everything else follows. */

export const SITE = {
  /** the masthead, split across two lines */
  titleLines: ["पुराने", "नग़्मे"],
  titleRoman: "Purane Naghme",
  tagline: "Old songs, playing on a quiet afternoon.",

  /** Footer credit. Set href to "" and the name renders as plain text. */
  credit: {
    name: "Krishna Agarwal",
    href: "https://agarwalkrishna.framer.website/",
  },

  /** the handwritten note above the deck. Set href to "" to hide it. */
  howIMadeThis: {
    label: "about these songs",
    href: "/about",
  },

  /** Top-right links. An entry with an empty href simply doesn't render —
      so you can leave a slot here ready and fill it in later, without
      shipping an icon that goes nowhere. */
  links: [
    { label: "Instagram", href: "", icon: "instagram" as const },
    { label: "X", href: "", icon: "x" as const },
  ],

  /** silk-screened on the deck */
  deck: {
    brand: "SOOR TAAL",
    model: "STEREO CASSETTE RECORDER · MODEL 65",
  },
};
