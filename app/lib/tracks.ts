/* ===================================================================
   THE ONLY FILE YOU EDIT TO CHANGE THE MUSIC.

   Adding a song is one line inside a tape's `tracks` array.

   ── Provenance ────────────────────────────────────────────────────
   Every videoId below was verified through YouTube's oEmbed endpoint
   before it was added, and every one resolves to the RIGHTS HOLDER'S
   OWN channel — Saregama (which owns most pre-1990 HMV Hindi film
   music), Shemaroo, YRF and Rajshri. No fan re-uploads, no lyric
   channels, no auto-generated "Topic" channels.

   These are still copyrighted recordings. Embedding a label's own
   upload is the licensed path — the label chose to allow embeds and
   gets the play — but you are the one publishing the site, so give the
   list a look before you ship it.

   ── Adding your own ───────────────────────────────────────────────
   Two checks before you paste an id:

     1. https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=<ID>&format=json
        Read `author_url`. If it is not the label / studio / artist,
        don't use it. An error response means private, deleted, or
        embedding switched off.
     2. https://www.youtube.com/embed/<ID> — does it play in a bare tab?

   `duration` is in SECONDS and only seeds the UI; the real runtime is
   read back from the player, so an approximation is fine.
   =================================================================== */

export type Track = {
  id: string;
  title: string;
  /** the same title in Devanagari — printed on the cassette inlay */
  titleHi: string;
  artist: string;
  film: string;
  year: number;
  /** seconds */
  duration: number;
  /** 11-character YouTube video id */
  videoId: string;
  /** the uploading channel, kept as an audit trail */
  channel: string;
};

export type Tape = {
  /** the letter silk-screened on the TAPE selector */
  key: "A" | "B" | "C";
  id: string;
  name: string;
  tagline: string;
  tracks: Track[];
};

export const PLACEHOLDER_ID = "PASTE_ID___";

/** Guards typos as much as placeholders — YouTube ids are always 11 chars. */
export function isPlayable(track: Track | undefined): boolean {
  if (!track) return false;
  return /^[a-zA-Z0-9_-]{11}$/.test(track.videoId) && track.videoId !== PLACEHOLDER_ID;
}

export const TAPES: Tape[] = [
  {
    key: "A",
    id: "sunehra",
    name: "Sunehra Daur",
    tagline: "1955–1968 · the golden years",
    tracks: [
      { id: "a1", title: "Mera Joota Hai Japani", titleHi: "मेरा जूता है जापानी", artist: "Mukesh", film: "Shree 420", year: 1955, duration: 270, videoId: "sJG6ZDzpoLY", channel: "Saregama — Old Hindi Songs" },
      { id: "a2", title: "Itna Na Mujhse Tu Pyar Badha", titleHi: "इतना ना मुझसे तू प्यार बढ़ा", artist: "Lata Mangeshkar, Talat Mahmood", film: "Chhaya", year: 1961, duration: 225, videoId: "PUBaJz8eoRk", channel: "Saregama — Old Hindi Songs" },
      { id: "a3", title: "Lag Ja Gale Se Phir", titleHi: "लग जा गले से फिर", artist: "Lata Mangeshkar", film: "Woh Kaun Thi", year: 1964, duration: 245, videoId: "fj4MnkljFXc", channel: "Saregama Music" },
      { id: "a4", title: "Baharon Phool Barsao", titleHi: "बहारों फूल बरसाओ", artist: "Mohammed Rafi", film: "Suraj", year: 1966, duration: 265, videoId: "U8XtQGLaUBE", channel: "Rajshri" },
      { id: "a5", title: "Likhe Jo Khat Tujhe", titleHi: "लिखे जो खत तुझे", artist: "Mohammed Rafi", film: "Kanyadaan", year: 1968, duration: 278, videoId: "jyYqrVfopxo", channel: "Saregama — Old Hindi Songs" },
    ],
  },
  {
    key: "B",
    id: "rangeen",
    name: "Rangeen Raatein",
    tagline: "1971–1976 · the seventies",
    tracks: [
      { id: "b1", title: "Zindagi Ek Safar Hai Suhana", titleHi: "ज़िंदगी एक सफ़र है सुहाना", artist: "Kishore Kumar", film: "Andaz", year: 1971, duration: 276, videoId: "LlvoY4v5zm0", channel: "Shemaroo Filmi Gaane" },
      { id: "b2", title: "Piya Tu Ab To Aaja", titleHi: "पिया तू अब तो आजा", artist: "Asha Bhosle", film: "Caravan", year: 1971, duration: 319, videoId: "kbMF2gkv_R8", channel: "Saregama — Old Hindi Songs" },
      { id: "b3", title: "Kabhi Kabhie Mere Dil Mein", titleHi: "कभी कभी मेरे दिल में", artist: "Mukesh", film: "Kabhi Kabhie", year: 1976, duration: 310, videoId: "BVnz6oSupUM", channel: "YRF" },
    ],
  },
  {
    key: "C",
    id: "aakhri",
    name: "Aakhri Reel",
    tagline: "1980–1981 · the last side",
    tracks: [
      { id: "c1", title: "Om Shanti Om", titleHi: "ॐ शांति ॐ", artist: "Kishore Kumar", film: "Karz", year: 1980, duration: 320, videoId: "BF5tVDJCAUM", channel: "Saregama Music" },
      { id: "c2", title: "Dil Cheez Kya Hai", titleHi: "दिल चीज़ क्या है", artist: "Asha Bhosle", film: "Umrao Jaan", year: 1981, duration: 325, videoId: "KCahJUGJtFI", channel: "Saregama — Old Hindi Songs" },
    ],
  },
];
