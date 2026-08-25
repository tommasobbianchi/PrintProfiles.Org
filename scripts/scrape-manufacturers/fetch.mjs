#!/usr/bin/env node
// Shared fetch layer for the manufacturer scrapers.
//
//   import { get, getPdfText, log } from './fetch.mjs'
//
// get(url) -> { ok, status, body, fromCache }
//   - disk cache per URL (cache/<sha1>.html + .meta.json) => every run is resumable
//   - >= 1500 ms per-domain rate limit (independent timers), honours Retry-After
//   - robots.txt fetched once per host, parsed group-aware (the groups matching OUR UA plus
//     the "*" fallback; named-bot groups are theirs, not ours), RFC 9309 longest-match
//     Allow/Disallow. Hard gate: a disallowed URL is never fetched. Fails CLOSED when
//     robots.txt is unreachable or 5xx.
//   - exponential backoff on 429/5xx/network error, max 3 attempts
// getPdfText(url) -> extracted text via pdftotext ('' if unavailable)
// log(msg) -> timestamped line to stdout + run.log

import { createHash } from 'node:crypto';
import { appendFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const CACHE = join(HERE, 'cache');
const LOG = join(HERE, 'run.log');
const UA = 'PrintProfilesOrg-bot/1.0 (+https://printprofiles.org; contact tommaso.b.bianchi@gmail.com)';
const FLOOR = 1500; // ms between requests to the same domain

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const sha1 = (s) => createHash('sha1').update(s).digest('hex');
const execFileAsync = promisify(execFile);

export async function log(msg) {
  const line = `${new Date().toISOString()} ${msg}\n`;
  process.stdout.write(line);
  return appendFile(LOG, line).catch(() => {});
}

// Decode the HTML entities that appear in scraped titles/brands.
export function decodeEntities(s) {
  return String(s || '')
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&amp;/g, '&')
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ');
}

// ---------- per-domain rate limiting ----------
const lastHit = new Map(); // host -> ts of last request start
const minDelay = new Map(); // host -> minimum inter-request delay (robots crawl-delay can raise it)

async function throttle(host) {
  const delay = minDelay.get(host) ?? FLOOR;
  const wait = Math.max(0, (lastHit.get(host) ?? 0) + delay - Date.now());
  if (wait) await sleep(wait);
  lastHit.set(host, Date.now());
}

// ---------- robots.txt ----------
// Group-aware parse: we apply the union of Disallow rules from the groups that match OUR
// user-agent (exact agent match, or the "*" fallback). Named-bot groups (GPTBot, Bytespider,
// Amazonbot, …) are scoped to those bots and are ignored. This is what keeps sites that
// Disallow "/" only for AI crawlers from being wrongly blocked for us.
const robotsCache = new Map(); // host -> { allowed(path), crawlDelay }

function parseRobots(txt, ua) {
  const groups = [];
  let cur = null;
  for (const raw of txt.split('\n')) {
    const line = raw.replace(/#.*/, '').trim();
    const m = /^([A-Za-z-]+)\s*:\s*(.*)$/.exec(line);
    if (!m) continue;
    const [, k, v] = m;
    if (/^user-agent$/i.test(k)) {
      cur = { agent: v.trim().toLowerCase(), rules: [], crawlDelay: 0 };
      groups.push(cur);
    } else if (cur) {
      if (/^(dis)?allow$/i.test(k) && v) cur.rules.push({ allow: !/^disallow$/i.test(k), pat: v.trim() });
      else if (/^crawl-delay$/i.test(k)) cur.crawlDelay = Math.max(cur.crawlDelay, Number(v) * 1000 || 0);
    }
  }
  const token = ua.toLowerCase().split('/')[0].trim();
  // An empty User-agent value must not match everything, hence the g.agent && guard.
  const relevant = groups.filter((g) => g.agent === '*' || (g.agent && token.includes(g.agent)));
  const rules = relevant.flatMap((g) => g.rules);
  const crawlDelay = relevant.reduce((max, g) => Math.max(max, g.crawlDelay), 0);
  return {
    crawlDelay,
    // RFC 9309 matching: '*' is any run of characters, '$' anchors the end, and the
    // longest matching pattern wins with Allow beating Disallow on an equal-length tie.
    allowed: (path) => {
      let best = null;
      for (const r of rules) {
        // Take the '$' anchor off before escaping, so it survives as an anchor and not
        // as a literal dollar sign; '*' then becomes the only wildcard left to expand.
        const anchored = r.pat.endsWith('$');
        const body = anchored ? r.pat.slice(0, -1) : r.pat;
        const re = new RegExp(
          '^' + body.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + (anchored ? '$' : ''),
        );
        if (!re.test(path)) continue;
        const len = r.pat.length;
        if (!best || len > best.len || (len === best.len && r.allow)) best = { len, allow: r.allow };
      }
      return best ? best.allow : true;
    },
  };
}

async function robotsFor(host) {
  if (robotsCache.has(host)) return robotsCache.get(host);
  let rules = { allowed: () => true, crawlDelay: 0 };
  try {
    const res = await rawFetch(`https://${host}/robots.txt`, 0);
    if (res.status === 200) rules = parseRobots(res.body, UA);
    else if (res.status >= 500) {
      // RFC 9309 §2.3.1.3: a server error means "unavailable", which must be read as
      // disallow-all, not as permission. Fail closed.
      rules = { allowed: () => false, crawlDelay: 0 };
      await log(`robots.txt for ${host} returned ${res.status} — treating as disallow-all`);
    } else await log(`WARN robots.txt for ${host} returned ${res.status} — no rules, proceeding`);
  } catch {
    // Network failure is indistinguishable from "unavailable" -> fail closed too.
    rules = { allowed: () => false, crawlDelay: 0 };
    await log(`robots.txt for ${host} unreachable — treating as disallow-all`);
  }
  if (rules.crawlDelay > FLOOR) {
    minDelay.set(host, rules.crawlDelay);
    await log(`robots.txt Crawl-delay for ${host} -> ${rules.crawlDelay}ms`);
  }
  robotsCache.set(host, rules);
  return rules;
}

function isAllowed(rules, url) {
  const u = new URL(url);
  return rules.allowed(u.pathname + u.search);
}

// ---------- raw network fetch with retry/backoff ----------
async function rawFetch(url, retries = 3) {
  const host = new URL(url).hostname;
  for (let attempt = 0; ; attempt++) {
    await throttle(host);
    let res;
    try {
      res = await fetch(url, { headers: { 'user-agent': UA, accept: 'text/html,application/xhtml+xml,application/xml,application/json,*/*' }, redirect: 'follow' });
    } catch {
      if (attempt >= retries) return { status: 'network-error', body: '' };
      await backoff(host, url, 'network error', attempt);
      continue;
    }
    const status = res.status;
    const body = await res.text().catch(() => '');
    if (status === 429 || status >= 500) {
      if (attempt >= retries) return { status, body };
      const ra = Number(res.headers.get('retry-after')) * 1000;
      if (ra) minDelay.set(host, Math.max(minDelay.get(host) ?? FLOOR, ra));
      await backoff(host, url, `HTTP ${status}`, attempt, ra);
      continue;
    }
    return { status, body };
  }
}

async function backoff(host, url, why, attempt, retryAfter = 0) {
  const base = minDelay.get(host) ?? FLOOR;
  const wait = Math.max(retryAfter, base * 2 ** (attempt + 1));
  await log(`WARN ${why} at ${url} (attempt ${attempt + 1}) — backing off ${wait}ms`);
  await sleep(wait);
}

// ---------- public: get ----------
export async function get(url) {
  await mkdir(CACHE, { recursive: true }).catch(() => {});
  const host = new URL(url).hostname;
  const rules = await robotsFor(host);
  if (!isAllowed(rules, url)) {
    await log(`robots-disallow ${url}`);
    return { ok: false, status: 'robots-disallow', body: '', fromCache: false };
  }

  const key = sha1(url);
  const htmlPath = join(CACHE, `${key}.html`);
  const metaPath = join(CACHE, `${key}.meta.json`);

  try {
    const body = await readFile(htmlPath, 'utf8');
    const meta = JSON.parse(await readFile(metaPath, 'utf8'));
    return { ok: true, status: meta.status ?? 200, body, fromCache: true };
  } catch {
    // miss -> fetch
  }

  const res = await rawFetch(url, 3);
  if (res.status === 200) {
    await writeFile(htmlPath, res.body);
    await writeFile(metaPath, JSON.stringify({ url, status: res.status }));
    return { ok: true, status: 200, body: res.body, fromCache: false };
  }
  await log(`WARN GET ${url} -> ${res.status}`);
  return { ok: false, status: res.status, body: res.body || '', fromCache: false };
}

// ---------- public: getPdfText ----------
let pdfChecked = false;
let pdfAvailable = false;

async function pdftotextAvailable() {
  if (pdfChecked) return pdfAvailable;
  pdfChecked = true;
  try {
    await execFileAsync('pdftotext', ['-v']);
    pdfAvailable = true;
  } catch {
    pdfAvailable = false;
    await log('WARN pdftotext not found — PDF text extraction disabled');
  }
  return pdfAvailable;
}

export async function getPdfText(url) {
  await mkdir(CACHE, { recursive: true }).catch(() => {});
  const host = new URL(url).hostname;
  const rules = await robotsFor(host);
  if (!isAllowed(rules, url)) return '';

  const key = sha1(url);
  const pdfPath = join(CACHE, `${key}.pdf`);
  let have = true;
  try {
    await readFile(pdfPath);
  } catch {
    have = false;
  }
  if (!have) {
    await throttle(host);
    const res = await fetch(url, { headers: { 'user-agent': UA }, redirect: 'follow' });
    if (!res.ok) return '';
    await writeFile(pdfPath, Buffer.from(await res.arrayBuffer()));
  }
  if (!(await pdftotextAvailable())) return '';
  try {
    const { stdout } = await execFileAsync('pdftotext', ['-layout', pdfPath, '-']);
    return stdout;
  } catch {
    return '';
  }
}

// Exported for robots.test.mjs only.
export { parseRobots as __parseRobotsForTest };
