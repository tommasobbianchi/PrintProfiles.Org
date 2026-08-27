# DELEGATION SPECIFICATION: HARNESS-DRIVEN VALIDATION LOOP

Repo: `/home/tommaso/projects/printprofiles-org` · Baseline commit: `15da0dd` · Branch: `main`

## 1. TARGET GOAL

- **Functional Objective:** `node scripts/scrape-manufacturers/coverage-audit.mjs` must exit `0`.
  It exits `1` today with exactly 8 `material-gap` findings. A finding means: the store's own
  catalogue lists ≥2 products of a filament material, and `scripts/scrape-manufacturers/data/*.json`
  holds **no captured row** of that material for that host. Close every gap by making the parser
  extract the rows it is currently dropping, then re-crawling that host.

  | manufacturer | host | missing materials | rows held | materials covered |
  |---|---|---|---|---|
  | Kingroon | kingroon.com | TPU | 21 | 4/5 |
  | TecBears | tecbears.com | PLA | 0 | 0/1 |
  | MarsWork | marswork3d.com | PLA | 0 | 0/1 |
  | Siraya Tech | siraya.tech | PLA, PETG | 6 | 4/6 |
  | Push Plastic | pushplastic.com | PLA, PC, Nylon, ASA, ABS, PA-CF | 12 | 2/8 |
  | Filaments.CA | filaments.ca | TPE, ASA | 44 | 4/6 |
  | Print-Me | print-me.pl | PC | 283 | 7/8 |
  | Copymaster3D | copymaster3d.com | PLA | 0 | 0/1 |

  All 8 hosts were confirmed **live** on 2026-08-27 via `NO_CACHE=1`. Three (TecBears, MarsWork,
  Copymaster3D) hold zero rows of any kind, so their extraction fails completely rather than
  partially — start there, the fault will be structural and cheapest to find.

- **Target Files / Scope (writable):**
  - `scripts/scrape-manufacturers/parsers/shopify.mjs`
  - `scripts/scrape-manufacturers/parsers/woocommerce.mjs`
  - `scripts/scrape-manufacturers/brand-registry.mjs`
  - `scripts/scrape-manufacturers/data/*.json` (generated — write only by running the crawler)
  - `constants.ts` (append only, and only with output emitted by `import-manufacturers.mjs`)
  - `COVERAGE-EXCEPTIONS.md` (create if a host proves genuinely unobtainable)

  Everything else is **read-only**, explicitly including `coverage-audit.mjs`, `fetch.mjs`,
  `robots.test.mjs`, `abrasive.mjs` and `import-manufacturers.mjs`.

- **Open Bindings:**
  1. *Is a host's data actually published anywhere?* Not knowable in advance.
     **Default:** after 3 failed attempts on one host, write a `COVERAGE-EXCEPTIONS.md` entry
     citing the 3 attempts and the evidence, then STOP and report. An exception entry does
     **not** clear the gate and must never be presented as success.
  2. *A store that has moved domain.* Precedent exists: R3D's registry host `r3d.store` 404s
     while the live store is `www.r3dprint.com`. **Default:** if a host 404s under `NO_CACHE=1`,
     search for the live storefront and correct `brand-registry.mjs`; only if none is found,
     downgrade `platform` to `'other'` with a dated note.
  3. *Number of new presets.* Unbounded. **Default:** whatever `import-manufacturers.mjs`
     emits; never hand-write a preset.

## 2. HARNESS ENVIRONMENT & GROUND TRUTH

- **Harness Interface:** the ordered §3 command sequence and its exit codes. There is no
  harness binary in this repo; `coverage-audit.mjs` is the oracle for F2P, the remaining §3
  commands are the P2P guard.
- **Fail-to-Pass (F2P):** `node scripts/scrape-manufacturers/coverage-audit.mjs` — currently
  exit `1`, 8 findings collected (non-vacuous, verified). Must reach exit `0`.
- **Pass-to-Pass (P2P):** `robots.test.mjs`, `abrasive.mjs`, `npx tsc --noEmit`,
  `npm run build`, and import idempotency. All green at baseline. Distinct from F2P.
- **Test Integrity Constraint:** modifying, weakening or bypassing the oracle is prohibited and
  invalidates the run. Concretely: do **not** edit `coverage-audit.mjs`; do **not** change
  `MIN_PRODUCTS_PER_TYPE` or any threshold; do **not** edit `robots.test.mjs` or `abrasive.mjs`
  fixtures to make them agree with a change; do **not** lower or bypass the 1.5 s/domain rate
  limit in `fetch.mjs`; do **not** touch `scripts/scrape-3dfp/` for any reason.

## 3. VERIFICATION COMMANDS

Run from the repo root. **Never pipe these** — a pipe makes `$?` the status of the last stage,
not of `node`. Redirect to a file and read the file.

1. **Static analysis:** `./node_modules/.bin/tsc --noEmit`
2. **Harness / oracle:** `node scripts/scrape-manufacturers/coverage-audit.mjs`
3. **Targeted execution:** `node scripts/scrape-manufacturers/robots.test.mjs`

Supporting gates (§5 references them by name):

```bash
node scripts/scrape-manufacturers/abrasive.mjs                          # G_ABR
npm run build                                                           # G_BUILD
node scripts/scrape-manufacturers/import-manufacturers.mjs              # G_IMPORT (run twice)
grep -c 'createPreset' constants.ts                                     # G_COUNT
grep -o 'id: "[^"]*"' constants.ts | sort | uniq -d | wc -l             # G_DUPES
```

Working commands (not gates):

```bash
HOSTS=<host> ONLY=shopify      node scripts/scrape-manufacturers/run-all.mjs
HOSTS=<host> ONLY=woocommerce  node scripts/scrape-manufacturers/run-all.mjs
HOSTS=<host>                   node scripts/scrape-manufacturers/coverage-audit.mjs
node scripts/scrape-manufacturers/coverage-audit.mjs --json    # structured findings
NO_CACHE=1 ...                 # force a live request; errors are never cached, so a cached
                               # hit proves a URL worked once, not that the store still exists
```

**A crawl is long-running.** Per `CLAUDE.md`, launch it under watchjob, never `nohup`/`setsid`/`&`:

```bash
~/.claude/skills/watchjob/scripts/watchjob.sh <name> -- 'HOSTS=<host> ONLY=shopify node scripts/scrape-manufacturers/run-all.mjs'
~/.claude/scripts/job status <name>     # 0 active · 1 failed · 2 finished · 3 unknown
```

Never answer "is it still running?" with `pgrep` or `ps | grep`.

## 4. CONVERGENCE LOOP (FORMAL EXECUTION PROTOCOL)

Ceiling **6 iterations per host**, **24 total**. One host per iteration, strictly serial — the
crawler takes a per-parser lock and concurrent runs overwrite each other's `data/*.json`.

1. **EDIT.** Fetch 2–3 product pages for a missing material on the target host. Determine
   concretely why `parseProduct` yields `null`: no spec table in `body_html`; the temps live
   only on the rendered page; a label wording not in the list; a non-English default locale;
   localised product handles; the store moved domain. Make the **narrowest** change that
   recovers them, scoped to that vendor.
2. **EXECUTE.** Re-crawl that host (under watchjob), then
   `HOSTS=<host> node scripts/scrape-manufacturers/coverage-audit.mjs`.
   A crawl reports `new=0` when rows for that host already exist — to force a genuine re-parse,
   remove that host's rows from the data file first.
3. **PARSE.** Read `missingTypes` for the host from `--json`. Do not infer progress from an
   exit code: a crawl that changes nothing still exits 0.
4. **PATCH.** If `missingTypes` shrank, continue to the next host. If unchanged after 3
   attempts on the same host, apply Open Binding 1 and stop.

On ceiling without convergence: stop, do **not** report success, return the last
`git diff --stat` plus the unresolved finding set.

## 5. TERMINATION CRITERIA (BOOLEAN GATES)

Finalize IF AND ONLY IF every gate holds, each backed by captured stdout:

- [ ] `coverage_audit_exit == 0` (§3.2) — 8 findings → 0
- [ ] `fail_to_pass_status == ALL_PASSED` — no `material-gap` remains for any of the 8 hosts
- [ ] `pass_to_pass_regressions == 0` — §3.1 exit 0, §3.3 exit 0, `G_ABR` exit 0, `G_BUILD` exit 0
- [ ] `new_linter_diagnostics == 0` — `tsc --noEmit` baseline fingerprint is **`{} (0 errors)`**;
      absolute zero *is* the gate here only because the baseline is genuinely zero. Any
      `error TS…` absent from the baseline fails the gate.
- [ ] `G_IMPORT` second consecutive run prints `new=0` (idempotent)
- [ ] `G_COUNT >= 2770` — never below baseline. A fall means real presets were deleted.
- [ ] `G_DUPES == 0`
- [ ] no manufacturer exceeds 120 presets — colour-collapse regression guard:
      `node -e "const s=require('fs').readFileSync('constants.ts','utf8');const m={};for(const x of s.matchAll(/manufacturer: [\"']([^\"']+)[\"']/g))m[x[1]]=(m[x[1]]||0)+1;console.log(Object.entries(m).filter(([,n])=>n>120).length)"`
- [ ] `git diff` touches only §1 writable paths

### Baseline (measured 2026-08-27 at `15da0dd`)

```
coverage-audit           exit 1, 8 findings
tsc --noEmit             exit 0, 0 errors
robots.test.mjs          exit 0
abrasive.mjs             exit 0  (26 abrasive + 23 non-abrasive)
npm run build            exit 0
import (2nd run)         new=0
presets                  2770
duplicate ids            0
```

## 6. GUARDRAILS & EXECUTION CONSTRAINTS

- **Zero-Assumption Rule.** Never state that a step succeeded, a gate passed, or a host is
  fixed without running the corresponding §3 command **in that same turn** and showing its
  output and exit code. "Should now work", "this ought to pass", and reasoning about what a
  command would print are prohibited as evidence. Unrun ⇒ write **NOT VERIFIED**.
- **Exit 0 is not evidence that work happened.** A crawl that touches nothing exits 0. Confirm
  the host's `captured` count or `missingTypes` actually changed. A clean `git diff` after an
  edit means the edit did not land — verify every patch applied before believing it.
- **Blast Radius Limitation.** Minimal diffs inside §1 scope. No drive-by refactors, no
  dependency additions, no reformatting of untouched lines.
- **Never loosen a shared regex to fix one host.** Precedents in this repo: relaxing the
  page-wide temperature patterns corrupted four correct FlashForge rows (PET-GF bed
  275 °C → 100 °C); a bare `plateau chauffant` label matched marketing prose and took the next
  number on the page, which was inside an image filename (`…-15-150x150.png`), producing a
  150 °C bed for ABS. Confine changes to the vendor's own spec block. After **any** shared
  change, re-crawl ≥3 previously-passing hosts and prove their rows byte-identical.
- **Sanity-bound every recovered value.** PLA bed 0–70, PETG 60–100, ABS/ASA 90–120, TPU 0–70,
  PC 90–140. Outside that is a parse bug, not a discovery. Also reject an inverted range: a
  vendor writing `190 – 110 °C` is a typo, and averaging it to 150 is how a bad preset shipped.
- **Fix the generator, never the artefact.** If `constants.ts` is wrong, the parser or importer
  is wrong. Hand-editing a preset leaves the bug live and it returns on the next import.
- **Colour collapse is policy.** Never raise row counts by adding colour variants. Atomic
  Filament publishes 462 filament-like products that are one PCTG line in ~100 colours;
  collapsing them to 53 presets is correct.
- **Oracle Supremacy.** The audit's verdict is final. If you believe a finding is wrong, report
  the disagreement with evidence and stop — do not edit the audit to agree with you.
- **Baseline Obligation.** Run §3 once before the first EDIT and record it. A gate already red
  at baseline is not a regression you caused; report it, do not silently fix it.
- **No commits, pushes, or deploys.** Leave everything in the working tree; report
  `git diff --stat`.
- **Deviation is allowed; silent deviation is not.** If this spec is wrong — an unachievable
  criterion, a remedy that cannot work — say so with the measurement that shows it and propose
  the correction. A caught spec error is the most valuable thing you can return.

## 7. REQUIRED FINAL REPORT

```
Iterations used:     N / 24
Findings:            8 -> N
Hosts fixed:         <host: materials recovered, before -> after>
Hosts escalated:     <host: the 3 attempts and the evidence>
Presets:             2770 -> N
Gates:               each of §5 with the literal command output proving it
Files changed:       git diff --stat
Rollback:            git reset --hard 15da0dd
```

Any gate not verified must be listed as **NOT VERIFIED**, with the reason.
