#!/usr/bin/env node
// Probe candidate hosts to see which expose Shopify's public /products.json endpoint.
// Goes through fetch.mjs's get() so the robots.txt hard gate still applies.
// Prints a table; writes nothing.

import { get } from './fetch.mjs';

const CANDIDATES = [
  'spectrumfilaments.com', 'azurefilm.com', 'hatchbox3d.com', 'cookiecad.com',
  'tinmorry.com', '3djake.com', 'sunlu.com', 'esun3d.com', 'polymaker.com',
  'creality.com', 'anycubic.com', 'bambulab.com', 'geeetech.com', 'flashforge.com',
  'snapmaker.com', 'matterhackers.com', 'fillamentum.com', '3dxtech.com',
  'colorfabb.com', 'formfutura.com', 'add-north.com', 'devildesign.com', 'rosa3d.pl',
  'atomicfilament.com', 'printedsolid.com', 'coex3d.com', 'ninjatek.com', 'recreus.com',
];

const pad = (s, n) => String(s).padEnd(n, ' ');

async function main() {
  console.log(pad('HOST', 26) + pad('SHOPIFY?', 10) + 'NOTE');
  console.log('-'.repeat(80));
  for (const host of CANDIDATES) {
    const res = await get(`https://${host}/products.json?limit=1`);
    let shopify = false;
    let note;
    if (res.ok) {
      try {
        const data = JSON.parse(res.body);
        shopify = Array.isArray(data.products);
        note = shopify ? `products.json OK` : '200 but not products.json';
      } catch {
        note = '200 but not JSON';
      }
    } else {
      note = `status=${res.status}`;
    }
    console.log(pad(host, 26) + pad(shopify ? 'YES' : 'no', 10) + note);
  }
}

main();
