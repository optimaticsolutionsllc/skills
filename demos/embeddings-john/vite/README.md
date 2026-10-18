# Embeddings by Doing — Rose + Tim

A standalone, interactive, beginner-friendly learning app. It shows what an embedding is through a practical example: finding a useful clip in John J D Munn's recordings to make a social post.

## Tech stack

- **Vite 7** for local development and optimized static builds
- **React 19** for the interactive components and UI state
- **TypeScript 5.9** with strict type-checking
- **No backend, keys, trackers, or runtime API calls**

## Run locally

Requires Node.js 20.19+ or 22.12+.

```bash
npm install
npm run dev
```

Open the local link shown in the terminal, usually http://localhost:5173.

## Build and preview

```bash
npm run build
npm run preview
```

Deploy the `dist/` folder to any static web host: Vercel, Netlify, Cloudflare Pages, or GitHub Pages (after enabling Pages in the host repository). `base: './'` makes the bundle work from a nested path.

## Files

- `src/App.tsx` — lesson sections, interactive cards, search map, and quiz
- `src/data.ts` — typed example clips, searches, questions, and five-step pipeline
- `src/math.ts` — tested cosine-similarity math for ranking
- `src/styles.css` — responsive visual design
- `tests/math.test.mjs` — scoring and ordering checks

## Limitations

All practice transcript lines, times, four-number vectors, map dots, and ranking scores are **teaching examples**. They are *not* real John recordings or actual model-generated embeddings. The similarity formula is real, and runs in your browser against the four-number examples.

A real production app would use a dedicated embedding model, a transcript ingestion pipeline, source-linked chunks, a persistent index, and a verification step before publishing. This intentionally does not call the workshop endpoint because that service was disabled.

## Source

Adapted from the original standalone lesson at `../content-finder.html` in the same repository. The original remains untouched.

## Level 2 — Multimodal Content Pipeline Lab (October 2026)

The eight beginner lessons are preserved. Five new, separate interactive modules explore text/image/audio/video embeddings; timestamped recordings and incorrect ASR; labels, provenance and consent; 90-day post performance and source retrieval; model selection and editable embedding-only budget estimates.

The learning app uses invented data only. It processes no John content, makes no API calls, and contains no real client identifiers, proof, or analytics. Cost estimates use Google Gemini and OpenAI embedding pricing (source links appear inside the app); verify before processing. Client data privacy and permission must be reviewed before API uploads.

### Practical evaluation before production

Index 20–30 real calls after consent/access review. Use 30–50 manually verified searches as a benchmark. Keep recording ID, moment ID, start/end milliseconds, raw+corrected ASR, speaker IDs, source video and audio URI, sampled frames, model+version, approval flags, and post/90-day results. Compare retrieval quality, review time, false matches and lead/conversion outcomes before ingesting the full archive.
