# Putting this online

You do **not** need Node.js on your Mac for this. Vercel installs and builds the project
on their own servers. Your laptop only needs a browser.

Two accounts, both free: **GitHub** (stores the code) and **Vercel** (runs it).

---

## Route A — no Terminal at all

### 1. Unzip

Double-click `nostalgia-radio.zip` in Finder. You get a folder called `nostalgia-radio`.
Open it — you should see `app`, `public`, `package.json`, and friends. **That folder's
contents are what you upload**, not the folder itself, and not the zip.

### 2. Make a GitHub repo

1. Sign in (or sign up) at <https://github.com>.
2. Click **+** → **New repository**, top right.
3. Name it `purane-naghme`. Leave it **Public** (Vercel's free tier needs public, or a
   private repo on a personal account — both work; public is simplest).
4. Do **not** tick "Add a README" — you already have one.
5. **Create repository**.

### 3. Upload the files

On the empty repo page, click **uploading an existing file**.

Open your `nostalgia-radio` folder in Finder, select **everything inside it**
(`Cmd + A`), and drag it onto the GitHub page. It'll take a minute — there are two
2 MB background images in there.

Scroll down, click **Commit changes**.

> If GitHub complains it can't handle folders: use **Add file → Upload files** and drag
> the `app` and `public` folders in as a second commit.

### 4. Deploy

1. Go to <https://vercel.com> and **Sign up with GitHub**.
2. **Add New…** → **Project**.
3. Find `purane-naghme` in the list → **Import**.
4. Change **nothing**. Vercel detects Next.js and fills everything in.
5. **Deploy**.

Two or three minutes later you get a URL like `purane-naghme.vercel.app`. That's it —
open it on your phone, send it to anyone.

### 5. Afterwards

Every time you edit a file on GitHub and commit, Vercel rebuilds and redeploys on its own.
So changing a song is: edit `app/lib/tracks.ts` on github.com, commit, wait two minutes.

---

## Route B — with Terminal (faster, if you're comfortable)

Needs `git`, which macOS will offer to install the first time you type it.

```bash
cd ~/Downloads/nostalgia-radio        # wherever you unzipped it

git init
git add .
git commit -m "Purane Naghme"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/purane-naghme.git
git push -u origin main
```

Then do step 4 above.

---

## Before you share it publicly

Open `app/lib/site.ts` and fix the placeholders — all four are currently `#` or a guess:

```ts
credit: "@krishna",                       // ← your actual handle
howIMadeThis: { href: "#" },              // ← your video/post, or "" to hide the note
links: [ { href: "#" }, { href: "#" } ],  // ← your Instagram and X
```

And read the provenance note at the top of `app/lib/tracks.ts`. Every track is a
rights-holder upload (Saregama, Shemaroo, YRF, Rajshri), which is the licensed way to
embed them — but they're still copyrighted recordings and it's your name on the site.

---

## Running it on your own Mac instead (optional)

Only if you want to edit and see changes instantly.

Check for Node:

```bash
node -v
```

If that prints something like `v22.x`, you're set. If it says "command not found",
install it from <https://nodejs.org> (the LTS button).

Then:

```bash
cd ~/Downloads/nostalgia-radio
npm install
npm run dev
```

Open <http://localhost:3000>. Stop it with `Ctrl + C`.

---

## If something goes wrong

- **Vercel build fails** — open the build log and read the last red line. A clean
  `npm ci && npm run build` was verified against this exact code, so a failure is almost
  always a missing file from the upload. Check `app/fonts/` has nine `.woff2` files and
  `public/bg/` has two `.png` files.
- **The site loads but the tape window is black** — that's the YouTube player failing to
  load. Check the browser console. If a specific song is dead, the deck skips it
  automatically and logs a `youtube_player_error` event to Vercel Analytics.
- **No music on iPhone until you tap** — expected. Mobile browsers require a tap before
  any audio, which is what the PLAY key is for.
