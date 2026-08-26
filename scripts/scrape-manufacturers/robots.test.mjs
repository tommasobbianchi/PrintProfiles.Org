#!/usr/bin/env node
// Self-check for the robots.txt gate in fetch.mjs. Run: node robots.test.mjs
// Covers the three defects found in review: mid-pattern wildcards failing open,
// Allow: being ignored, and named-bot groups over-blocking us.
import assert from 'node:assert';
import { __parseRobotsForTest as parseRobots } from './fetch.mjs';

const UA = 'FilamentProfilesOrg-bot/1.0 (+https://filamentprofiles.org)';

// The real shape of fiberlogy.com/robots.txt (fetched 2026-08-25).
const FIBERLOGY = `
User-agent: *
Allow: /

User-agent: ClaudeBot
Disallow: /

User-agent: GPTBot
Disallow: /

User-agent: *
Disallow: /wp/wp-admin/
Allow: /wp/wp-admin/admin-ajax.php
Disallow: /*?add-to-cart=
Disallow: /*?*filter_
`;

const fib = parseRobots(FIBERLOGY, UA);
// Named-bot Disallow: / must NOT apply to us — this is what unblocks the crawl.
assert.equal(fib.allowed('/en/sklep/page/2/'), true, 'product listing must be allowed');
assert.equal(fib.allowed('/en/product/easy-pla/'), true, 'product page must be allowed');
// Mid-pattern wildcard must actually block (previously failed OPEN).
assert.equal(fib.allowed('/en/sklep/?add-to-cart=123'), false, 'add-to-cart trap must be blocked');
assert.equal(fib.allowed('/en/sklep/?x=1&filter_color=red'), false, 'filter trap must be blocked');
// Allow must beat the shorter Disallow it sits inside (previously ignored).
assert.equal(fib.allowed('/wp/wp-admin/'), false, 'wp-admin blocked');
assert.equal(fib.allowed('/wp/wp-admin/admin-ajax.php'), true, 'admin-ajax carved back out by Allow');

// A group that really does name us must bind.
const mine = parseRobots('User-agent: filamentprofilesorg-bot\nDisallow: /private/\n', UA);
assert.equal(mine.allowed('/private/x'), false, 'our own named group must apply');
assert.equal(mine.allowed('/public/x'), true);

// An empty User-agent value must not swallow everything.
const empty = parseRobots('User-agent:\nDisallow: /\n', UA);
assert.equal(empty.allowed('/anything'), true, 'empty UA group must not match us');

// '$' anchors the end.
const anchored = parseRobots('User-agent: *\nDisallow: /*.pdf$\n', UA);
assert.equal(anchored.allowed('/a/b.pdf'), false);
assert.equal(anchored.allowed('/a/b.pdf?x=1'), true);

console.log('robots gate: all checks passed');
