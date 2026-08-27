# CLAUDE.md — PrintProfiles.Org

## What this is

PrintProfiles.Org (brand "FilamentDB") is a 3D-printing filament-profile sharing site. Users browse a repository of pre-filled filament profiles, create/edit profiles in a form, and export them as slicer-native files (Bambu Studio / Orca, PrusaSlicer, ideaMaker). It also has an AI "Suggest Settings" feature backed by Google Gemini. In production the site is currently "Coming Soon".

Repo: `github.com/tommasobbianchi/PrintProfiles.Org` (HEAD `f516e15`).

## Stack

From `package.json`:

| Package | Version | Role |
|---|---|---|
| react / react-dom | ^19.2.0 | UI |
| @google/genai | ^1.29.1 | Gemini AI suggestions |
| xlsx | 0.18.5 | Excel bulk import |
| vite | ^6.2.0 (resolved 6.4.3) | build/dev server |
| @vitejs/plugin-react | ^5.0.0 | React transform |
| typescript | ~5.8.2 | typecheck |

Styling is Tailwind CSS loaded from CDN (`index.html:9`), not a build-time Tailwind install.

## Architecture

Single-page React app, no router, no backend, no database.

- Entry: `index.html` → `index.tsx:1` mounts `<App/>` in `#root`.
- `App.tsx` owns all top-level state:
  - `activeTab` (`'create' | 'community'`) — `App.tsx:12`
  - `communityProfiles` — list of `FilamentProfile`, `App.tsx:13`
  - `isLoadingProfiles` — simulated 1.5 s load, `App.tsx:14` + `useEffect` at `App.tsx:32-38`
  - dead auth + logo state (see below)
- `CreateProfileForm.tsx` holds the editable form state and all import/export logic; it calls back up via `onShare` (`App.tsx:156`).
- `CommunityProfiles.tsx` renders/filters/downloads the repository list.
- `services/geminiService.ts` wraps the Gemini call.
- `utils/bulkImport.ts` (Excel) and `utils/slicerImport.ts` (JSON/INI/FILAMENT) parse imported files.

Data flow: profiles are seeded from `PRESET_PROFILES` (454 hardcoded presets in `constants.ts:64-736`); after the fake 1.5 s delay they land in `communityProfiles`. New profiles (single, bulk, raw import) are prepended in-memory via `addProfileToCommunity` (`App.tsx:41-49`). **Nothing is persisted** — there is no remote DB and no profile localStorage; state is lost on reload. The only localStorage key is `custom_app_logo` (`App.tsx:24,104`).

## Deploy chain

- Domain: `printprofiles.org`
- Vercel deployment: `https://print-profiles-org.vercel.app/`
- GitHub: `github.com/tommasobbianchi/PrintProfiles.Org`

**No `vercel.json` exists** (verified: no vercel/netlify config in the tree). Vercel infers from the presence of `package.json` + `vite`:
- Framework preset: **Vite**
- Build command: `npm run build` → `vite build`
- Output directory: `dist`

## External connectors / APIs

Only one external dependency: **Google Gemini** via `@google/genai`.

- `services/geminiService.ts:71` — `new GoogleGenAI({ apiKey })`.
- `services/geminiService.ts:87-94` — `ai.models.generateContent` with model **`gemini-2.5-flash`**, `responseMimeType: "application/json"`, and a structured `responseSchema` (`geminiService.ts:4-57`) returning nozzle/bed temps, speeds, retraction, fan, drying.
- Invoked from `CreateProfileForm.tsx:226-245` (`handleAISuggest`).

To run AI locally: set `GEMINI_API_KEY=<your key>` in `.env.local` (Vite's `loadEnv` picks it up — `vite.config.ts:6`). Without it, the "Suggest Settings" button shows "API_KEY is not configured" and the app still works otherwise.

No other remote API, no backend, no database.

## Environment variables

Injection is **not** `import.meta.env`. `vite.config.ts:6` calls `loadEnv(mode, '.', '')` (loads all `.env*` vars) and statically injects them via `define` as `process.env.*`:

| Name | Read at | Required? | Status |
|---|---|---|---|
| `GEMINI_API_KEY` | `vite.config.ts:6` (loadEnv), injected `vite.config.ts:14-15`; consumed as `process.env.API_KEY` at `services/geminiService.ts:65` and `components/CreateProfileForm.tsx:227` | Optional — only for AI suggestions | **MISSING** (no `.env*` in this dir) |

Note: `process.env.GEMINI_API_KEY` is also injected (`vite.config.ts:15`) but is never read anywhere — dead define.


## Long-running work: `/watchjob` is mandatory

Crawls in `scripts/scrape-manufacturers/` run at 1.5 s per domain by design — a full sweep is
tens of minutes and a delegated convergence run is hours. **Every one of them goes under
`watchjob`, and so does any delegated sub-agent:**

```bash
~/.claude/skills/watchjob/scripts/watchjob.sh <name> -- 'HOSTS=<host> ONLY=<parser> node scripts/scrape-manufacturers/run-all.mjs'
```

Binding on the main session, on subagents, and on any delegated model (opencode, DeepSeek, Kimi,
agy). Delegation specs must carry this obligation forward to the executor.

Never `nohup`, `setsid`, a bare `&`, hand-rolled `systemd-run`, or a terminal polling loop.
Never answer "is it still running?" with `pgrep`/`ps | grep` — use `~/.claude/scripts/job status
<name>`. A crawl is not finished until `job status` says so, and `watchjob` announces failures
as well as successes.


## Commands

| Task | Command |
|---|---|
| dev | `npm run dev` (port 3000, host 0.0.0.0 — `vite.config.ts:8-11`) |
| build | `npm run build` |
| preview | `npm run preview` |
| typecheck | `npx tsc --noEmit` (no `typecheck` script exists in `package.json`) |

## Local dev caveats

- **AI suggestions silently degrade** without `GEMINI_API_KEY`: the button still renders but always errors out; the rest of the app is unaffected.
- **Tailwind comes from a CDN** (`index.html:9`) — styling breaks when offline.
- `index.html:15-27` declares a browser **import map** pointing React/@google/genai/xlsx at `aistudiocdn.com`/`esm.sh`. The Vite build bundles from `node_modules` instead, so the import map is effectively dead in production output.
- `index.html:11-14` polyfills `window.process = { env: {} }` — legacy safety net; `process.env.API_KEY` is already replaced at build time by Vite's `define`.
- `npm install` reports **1 high-severity vulnerability** (from a transitive dep of `xlsx`); not addressed here.
- The 1.5 s repository "loading" spinner is cosmetic (`App.tsx:32-38`).

### Dead / duplicate code worth flagging (no fixes applied)

- `App.tsx:16-19,51-65` — auth state + `handleLogin`/`handleLogout` (hardcoded password `'PrintProfiles.Org'`) are never wired to any UI; `isAuthenticated` gates nothing.
- `App.tsx:22-30,67-120` — logo upload/reset state and handlers (`logoSrc`, `logoKey`, `logoInputRef`, `handleAppLogoUpload`, `handleResetLogo`) are never rendered.
- `CreateProfileForm.tsx:52-178` and `CommunityProfiles.tsx:121-236` — near-identical duplicate `generateBambuJson`/`generatePrusaIni`/`generateIdeaMakerJson` generators.
- `metadata.json` and `AI_BEHAVIOR_PROFILE.md` — Google AI Studio artifacts, unused by the code.
