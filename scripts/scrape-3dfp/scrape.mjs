#!/usr/bin/env node
// Scraper for 3dfilamentprofiles.com -> scripts/scrape-3dfp/data/*.json
//
// STATUS 2026-08-25: the origin sits behind a Vercel Security Checkpoint that answers
// HTTP 429 + a JS challenge to every path, /robots.txt included. This script therefore
// ABORTS in preflight and has never completed a real run. It is not a bypass and must not
// become one: if the challenge is present, the correct move is to ask the site owner for
// permission / an API / a UA allowlist, not to defeat the check.
//
// Run: node scripts/scrape-3dfp/scrape.mjs
// Resume: safe to re-run; anything already in data/ is skipped.

import { writeFile, readFile, mkdir, readdir } from 'node:fs/promises';
import { appendFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const DATA = join(HERE, 'data');
const LOG = join(HERE, 'scrape.log');
const ORIGIN = 'https://3dfilamentprofiles.com';
const UA = 'PrintProfilesBot/1.0 (+https://printprofiles.org; contact tommaso.b.bianchi@gmail.com)';
const DELAY_MS = 1500; // floor; bumped by Retry-After and by backoff

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function log(msg) {
  const line = `${new Date().toISOString()} ${msg}\n`;
  process.stdout.write(line);
  await appendFile(LOG, line).catch(() => {});
}

// ---------- robots.txt ----------
// ponytail: group-agnostic parse — we obey the union of every Disallow in the file rather
// than resolving User-agent groups. Strictly more conservative, which is the right bias.
function parseRobots(txt) {
  const dis = [];
  let crawlDelay = 0;
  for (const raw of txt.split('\n')) {
    const line = raw.replace(/#.*/, '').trim();
    const m = /^([A-Za-z-]+)\s*:\s*(.*)$/.exec(line);
    if (!m) continue;
    const [, k, v] = m;
    if (/^disallow$/i.test(k) && v) dis.push(v);
    if (/^crawl-delay$/i.test(k)) crawlDelay = Math.max(crawlDelay, Number(v) * 1000 || 0);
  }
  return {
    crawlDelay,
    allowed: (path) => !dis.some((d) => path.startsWith(d)),
  };
}

// ---------- fetching ----------
const CHALLENGE = /Security Checkpoint|__vercel_challenge|cf-browser-verification/i;
let delay = DELAY_MS;
let lastHit = 0;

async function get(url, { retries = 3 } = {}) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const wait = Math.max(0, lastHit + delay - Date.now());
    if (wait) await sleep(wait);
    lastHit = Date.now();

    const res = await fetch(url, { headers: { 'user-agent': UA, accept: 'text/html,*/*' } });
    const body = await res.text();

    if (CHALLENGE.test(body)) {
      throw new Error(`BOT_CHALLENGE at ${url} (status ${res.status}) — refusing to work around it`);
    }
    if (res.status === 429 || res.status >= 500) {
      const ra = Number(res.headers.get('retry-after')) * 1000;
      delay = Math.min(60_000, Math.max(delay * 2, ra || 0));
      await log(`WARN ${res.status} ${url} — backing off to ${delay}ms`);
      continue;
    }
    if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);

    delay = Math.max(DELAY_MS, delay * 0.9); // decay back toward the floor
    return body;
  }
  throw new Error(`giving up on ${url} after ${retries} retries`);
}

// ---------- parsing ----------
const strip = (h) =>
  h.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '');

const links = (html, re) =>
  [...new Set([...strip(html).matchAll(/href="([^"]+)"/g)].map((m) => m[1]).filter((h) => re.test(h)))];

// Pulls "Label: 123" / "Label 123 °C" pairs out of tables and definition lists.
function parseProfile(html, url) {
  const clean = strip(html);
  const text = clean.replace(/<[^>]+>/g, '\n').replace(/&deg;/g, '°').replace(/&amp;/g, '&');
  const lines = text.split('\n').map((s) => s.trim()).filter(Boolean);

  const fields = {};
  for (let i = 0; i < lines.length - 1; i++) {
    const key = lines[i].replace(/:$/, '').trim();
    const val = lines[i + 1];
    if (key.length < 48 && /^[-+]?[\d.]+\s*(°?[CF]|mm|mm\/s|mm³\/s|%|g|h)?$/i.test(val)) {
      if (!(key in fields)) fields[key] = val;
    }
  }
  const title = (/<title>([^<]*)<\/title>/i.exec(html) || [, ''])[1].trim();
  const h1 = (/<h1[^>]*>([\s\S]*?)<\/h1>/i.exec(clean) || [, ''])[1].replace(/<[^>]+>/g, '').trim();

  return { url, title, h1, fields, scrapedAt: new Date().toISOString() };
}

const slug = (u) => u.replace(/^https?:\/\/[^/]+/, '').replace(/^\/+|\/+$/g, '').replace(/[^\w.-]+/g, '_') || 'index';

// ---------- main ----------
async function main() {
  await mkdir(DATA, { recursive: true });
  await log(`=== run start === UA=${UA} delay>=${DELAY_MS}ms`);

  // 1. robots.txt — a hard gate, not a formality.
  const robotsTxt = await get(`${ORIGIN}/robots.txt`).catch((e) => {
    throw new Error(`cannot read robots.txt, so cannot confirm scraping is permitted: ${e.message}`);
  });
  const robots = parseRobots(robotsTxt);
  if (robots.crawlDelay > delay) {
    delay = robots.crawlDelay;
    await log(`robots.txt Crawl-delay -> ${delay}ms`);
  }
  if (!robots.allowed('/defaults')) throw new Error('robots.txt disallows /defaults — stopping');

  // 2. resume: skip whatever is already on disk
  const done = new Set((await readdir(DATA).catch(() => [])).map((f) => f.replace(/\.json$/, '')));
  await log(`resume: ${done.size} pages already saved`);

  // 3. discover brand -> material -> variant by walking the index pages
  const seen = new Set();
  const queue = ['/defaults'];
  const profiles = [];

  while (queue.length) {
    const path = queue.shift();
    if (seen.has(path) || !robots.allowed(path)) continue;
    seen.add(path);

    let html;
    try {
      html = await get(ORIGIN + path);
    } catch (e) {
      await log(`ERROR ${path}: ${e.message}`);
      if (/BOT_CHALLENGE/.test(e.message)) throw e; // never grind against a challenge
      continue;
    }

    const children = links(html, /^\/defaults\//).map((h) => h.split(/[?#]/)[0]);
    for (const c of children) if (!seen.has(c)) queue.push(c);

    const depth = path.split('/').filter(Boolean).length; // defaults=1, brand=2, material=3, variant=4
    if (depth >= 4) {
      const file = join(DATA, slug(path) + '.json');
      if (done.has(slug(path))) {
        await log(`skip (already saved) ${path}`);
      } else {
        const p = parseProfile(html, ORIGIN + path);
        await writeFile(file, JSON.stringify(p, null, 2));
        profiles.push(p);
        await log(`saved ${path} (${Object.keys(p.fields).length} fields)`);
      }
    } else {
      await log(`index ${path} -> ${children.length} links, queue=${queue.length}`);
    }
  }

  await log(`=== run done === visited=${seen.size} newProfiles=${profiles.length}`);
}

main().catch(async (e) => {
  await log(`FATAL ${e.message}`);
  process.exitCode = 1;
});
