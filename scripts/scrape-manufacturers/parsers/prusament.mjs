#!/usr/bin/env node
// Prusament material pages: https://prusament.com/materials/<slug>/
// The "Printer requirements" table holds the temps, with two label generations:
//   <th>Nozzle</th>/<th>Heatbed</th> (new)  and  <th>Extruder</th>/<th>Bed</th> (older)
// both in the form "Temperature: <nominal> ± <tolerance> °C" — take the nominal.

import { get, decodeEntities } from '../fetch.mjs';

export const MANUFACTURER = 'Prusa';
export const ORIGIN = 'https://prusament.com';

const INDEX = 'https://prusament.com/materials/';

const detectType = (name) => {
  const s = String(name || '').toUpperCase();
  if (/PA[ -]?CF|NYLON.*CF|CF.*NYLON|CARBON.*NYLON|NYLON.*CARBON/.test(s)) return 'PA-CF';
  if (/PA[ -]?GF|NYLON.*GLASS|GLASS.*NYLON/.test(s)) return 'PA-GF';
  if (/TPU/.test(s)) return 'TPU';
  if (/PETG|PET-G/.test(s)) return 'PETG';
  if (/ABS/.test(s)) return 'ABS';
  if (/ASA/.test(s)) return 'ASA';
  if (/PC[ -]|POLYCARBON/.test(s)) return 'PC';
  if (/NYLON|PA6|PA11|PA12|POLYAMIDE/.test(s)) return 'Nylon';
  if (/WOOD/.test(s)) return 'PLA';
  if (/PLA/.test(s)) return 'PLA';
  return 'Other';
};

export async function listProducts() {
  const res = await get(INDEX);
  if (!res.ok) return [];
  const out = new Set();
  for (const m of res.body.matchAll(/href="((?:https:\/\/prusament\.com)?\/materials\/([a-z0-9-]+)\/)/g)) {
    if (m[2] === 'feed') continue;
    out.add(`https://prusament.com/materials/${m[2]}/`);
  }
  return [...out];
}

export async function parseProduct(url) {
  const res = await get(url);
  if (!res.ok) return null;
  const html = res.body;

  const h1 = decodeEntities((/<h1[^>]*>([\s\S]*?)<\/h1>/i.exec(html) || [, ''])[1])
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!h1) return null;
  const brand = h1.replace(/^Prusament\s+/i, '').trim();

  const fields = {};
  for (const row of html.matchAll(/<tr>([\s\S]*?)<\/tr>/g)) {
    const th = (/<th[^>]*>([\s\S]*?)<\/th>/i.exec(row[1]) || [, ''])[1]
      .replace(/<[^>]+>/g, ' ')
      .replace(/&deg;/g, '°')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
    const tm = /Temperature:\s*(\d+(?:\.\d+)?)/i.exec(row[1].replace(/<[^>]+>/g, ' '));
    if (!tm) continue;
    const val = parseInt(tm[1], 10);
    if (/nozzle|extruder|hotend|hot-end/.test(th)) fields.nozzleTemp = val;
    else if (/heatbed|bed|build\s*plate/.test(th)) fields.bedTemp = val;
  }

  if (fields.nozzleTemp === undefined || fields.bedTemp === undefined) return null;

  return {
    manufacturer: MANUFACTURER,
    brand,
    filamentType: detectType(h1),
    nozzleTemp: fields.nozzleTemp,
    bedTemp: fields.bedTemp,
    sourceUrl: url,
    sourceType: 'manufacturer',
  };
}
