# MIGRATION_REPORT.md — PrintProfiles.Org

## Status

Done. Repo analyzed, dependencies installed, production build and typecheck both pass with exit code 0. No secret was available or fabricated; the only missing env var (`GEMINI_API_KEY`) is documented below. No remote/Vercel action was performed.

## What was done

- Clone target path: `/home/tommaso/projects/printprofiles-org` (clean tree, freshly cloned).
- Commit HEAD: `f516e15` (`git rev-parse --short HEAD`).
- Files created: `CLAUDE.md`, `MIGRATION_REPORT.md`.
- `.env.local` was **not** needed — the build succeeds with no env file (see "What works"). Not created.
- Build side effect: `npm install` generated an untracked `package-lock.json`. This is an unavoidable output of the mandated install step (the repo had no lockfile). Left in place, not committed.

## What works

| Step | Command | Exit code | Result |
|---|---|---|---|
| Install | `npm install` | 0 | 114 packages added in ~9 s; audit reports **1 high-severity vulnerability** (transitive dep of `xlsx`). |
| Build | `npm run build` (`vite build`) | 0 | 48 modules transformed in 2.06 s. Output: `dist/index.html` 1.09 kB, `dist/assets/index-zhACKX5W.js` 837.84 kB (gzip 247.41 kB). Warning: chunk > 500 kB (code-splitting hint only). |
| Typecheck | `npx tsc --noEmit` | 0 | No errors. |

No `.env.local` or `GEMINI_API_KEY` was present during the build, and it still succeeded — `vite.config.ts:6` `loadEnv(mode, '.', '')` simply yields `undefined`, which Vite's `define` injects as a no-op value. The build does **not** require a key.

## What is missing

| Name | Purpose | What breaks without it |
|---|---|---|
| `GEMINI_API_KEY` | Google Gemini API key for the "Suggest Settings" AI feature | The AI button renders but always errors out ("API_KEY is not configured"). Everything else (browse, filter, import, export) works normally. |

No other secret/env var is referenced anywhere in the code (`grep` for `process.env` / `import.meta.env` returns only the Gemini path). No key was invented or fabricated.

## Connecting the Vercel deploy to this working directory

These steps link this local checkout to the existing Vercel project. **None of them have been run here** — they require interactive login that has not been performed.

1. `npx vercel link` — authenticates and links to a Vercel project. Requires **interactive login** (browser/email OTP) and selecting the scope + existing project (`print-profiles-org`). Not performed.
2. `npx vercel env pull .env.local` — downloads the project's env vars (including `GEMINI_API_KEY`) into `.env.local`. Requires the link from step 1. Not performed.
3. `npx vercel build` / `npx vercel deploy` — optional local verification / deploy. Requires login. Not performed.

## Not done / out of scope

- No remote changes: no push, no deploy, no branch/PR activity.
- No Vercel login or `vercel link`/`vercel env pull`.
- No source, config, `package.json`, or `README.md` was modified.
- The `package-lock.json` produced by `npm install` was left uncommitted and untouched by git (no `git add`/`commit`/`push` was run).

---

## Session 2026-08-25 — cleanup finalised, scraper blocked

### TASK 1 — cleanup: DONE

The prior session's work was **already committed**, not left in the working tree as the
hand-off suggested. `git diff` was empty at `7785f78`; only three untracked files remained.

Verified against the committed state:

| Item | Status | Evidence |
|---|---|---|
| Dead password gate removed from `App.tsx` | ✅ | `429c069`; no `isAuthenticated`/`handleLogin` left. `logoSrc`/`logoKey` survive but are **live** — wired to `<Header>` at `App.tsx:47`. |
| Exporters deduplicated | ✅ | `82f0abe`; `utils/exporters.ts` exports the three generators, imported by `CreateProfileForm.tsx:8` and `CommunityProfiles.tsx:5`. No duplicate bodies remain. |
| xlsx advisory | ✅ **resolved** | `7785f78` moved xlsx to the SheetJS CDN tarball `0.20.3`. `npm audit` → **0 vulnerabilities**. Nothing to document as unfixable. |

Gates: `npx tsc --noEmit` clean · `npm run build` clean (2.32 s, 903 kB bundle — the >500 kB
chunk warning is pre-existing and cosmetic).

New commits (local only, **not pushed**):
- `1449bd4` chore(deps): commit package-lock for SheetJS 0.20.3 resolution
- `0d11535` docs: add CLAUDE.md project guide for AI agents

### TASK 2 — scraper: BLOCKED, NOT LAUNCHED

`3dfilamentprofiles.com` sits behind a **Vercel Security Checkpoint**. Every path tested —
`/`, `/defaults`, `/sitemap.xml` and `/robots.txt` itself — returns **HTTP 429** with a
JavaScript bot-challenge page. Confirmed consistent across 6 requests with a 3 s spacing and
an identifiable user-agent.

Two consequences:

1. **`robots.txt` is unreachable**, so there is no way to confirm that crawling is permitted.
   The task's own requirement ("respect robots.txt") cannot be satisfied.
2. Getting past the checkpoint would mean defeating a deliberate access control the site
   owner deployed. That is out of scope and was not attempted.

**The scraper was therefore NOT launched.** Running it detached would have pounded a
protected origin several hundred times to no effect — indistinguishable from an attack.
There is no PID to report.

Delivered anyway, ready to run the moment access is legitimate:

- `scripts/scrape-3dfp/scrape.mjs` — identifiable UA, ≥1.5 s rate limit with exponential
  backoff and `Retry-After` support, `robots.txt` parsed as a hard gate (Crawl-delay obeyed),
  BFS discovery of `/defaults/{brand}/{material}/{variant}`, progressive per-page save to
  `data/`, resumable (skips what is already on disk), logs to `scrape.log`. Aborts on
  challenge detection by design — **it is not a bypass and must not become one.**
- `scripts/scrape-3dfp/import.mjs` — compares `data/*.json` against the 454 presets in
  `constants.ts`, emits `createPreset({...})` lines for missing entries only, in the exact TS
  schema, each carrying `notes: "Imported from 3dfilamentprofiles.com — <url>"` for attribution.

### Test results

- `scrape.mjs`: **0 pages, 0 profiles.** It aborts in preflight on the challenge, as designed.
  The HTML parsing (`parseProfile`, label→value extraction) has therefore **never been
  validated against a real page** and should be treated as unverified.
- `import.mjs`: validated end-to-end on a synthetic 2-page fixture against the real
  `constants.ts` — 416 existing keys indexed, 1 duplicate correctly rejected (3D Solutech
  PLA), 1 new preset emitted with correct type inference and attribution, unmapped label
  correctly surfaced.

### How to import once scraping is possible

```bash
node scripts/scrape-3dfp/scrape.mjs                 # resumable; watch scrape.log
node scripts/scrape-3dfp/import.mjs                 # dry run — check UNMAPPED LABELS output
# fix LABEL_MAP in import.mjs from that list, then:
node scripts/scrape-3dfp/import.mjs --write
npx tsc --noEmit && npm run build
```

### To unblock

Ask the site owner for permission plus a UA allowlist or a data export/API. Also worth
checking whether the profile data has an upstream open source — scraping a challenge-protected
front-end is the worst available route to it.
