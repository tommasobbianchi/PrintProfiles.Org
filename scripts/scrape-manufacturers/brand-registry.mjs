#!/usr/bin/env node
// Registry of filament brands, their official store host, and the e-commerce platform that
// host runs on. `platform` decides which generic parser can scrape it:
//
//   'shopify'     -> parsers/shopify.mjs      (/products.json is public JSON)
//   'woocommerce' -> parsers/woocommerce.mjs  (/wp-json/wc/store/v1/products is public JSON)
//   'other'       -> resolves and serves the brand, but neither platform => needs a bespoke parser
//   'blocked'     -> robots.txt disallows the probe path, or the host answers 403/challenge.
//                    We do NOT work around it; the brand is simply out of scope.
//   'unresolved'  -> no official storefront domain could be confirmed (Amazon/AliExpress-only brand)
//
// The `platform` values below are NOT guesses: they were produced by running
// `node scripts/scrape-manufacturers/resolve-brands.mjs`, which calls probeHost() through the
// shared fetch.mjs (robots gate + rate limit). Re-run it to refresh them.
//
// `hosts` keeps every candidate domain that resolves in DNS, in preference order; `host` is
// the one the probe settled on. Keeping the alternates makes a re-probe cheap when a brand
// migrates platform (several of these moved Woo -> Shopify in the last two years).

import { get } from './fetch.mjs';

/** @typedef {'shopify'|'woocommerce'|'other'|'blocked'|'unresolved'} Platform */

export const BRANDS = [
  { manufacturer: 'Filamentor', host: 'filamentor.it', hosts: ['filamentor.it'], platform: 'shopify', note: 'multi-brand retailer; crawled with vendorField so its house lines Professional Lab and Smart Print are attributed correctly' },
  { manufacturer: 'Bambu Lab', host: 'bambulab.com', hosts: ['bambulab.com', 'us.store.bambulab.com'], platform: 'blocked', note: 'robots.txt disallows /products.json and the store paths' },
  { manufacturer: 'SUNLU', host: 'sunlu.com', hosts: ['sunlu.com'], platform: 'other' },
  { manufacturer: 'ELEGOO', host: 'elegoo.com', hosts: ['elegoo.com', 'us.elegoo.com'], platform: 'shopify' },
  { manufacturer: 'eSUN', host: 'esun3d.com', hosts: ['esun3d.com', 'esun3d.net'], platform: 'other' },
  { manufacturer: 'Overture', host: 'overture3d.com', hosts: ['overture3d.com'], platform: 'shopify' },
  { manufacturer: 'Polymaker', host: 'polymaker.com', hosts: ['polymaker.com', 'us.polymaker.com'], platform: 'blocked' },
  { manufacturer: 'Creality', host: 'creality.com', hosts: ['creality.com', 'store.creality.com'], platform: 'other' },
  { manufacturer: 'Anycubic', host: 'anycubic.com', hosts: ['anycubic.com', 'store.anycubic.com'], platform: 'other' },
  { manufacturer: 'Geeetech', host: 'geeetech.com', hosts: ['geeetech.com'], platform: 'shopify' },
  { manufacturer: 'Eryone', host: 'eryone3d.com', hosts: ['eryone3d.com', 'eryone.com'], platform: 'shopify', note: 'bespoke parser already exists: parsers/eryone.mjs' },
  { manufacturer: 'Jayo', host: 'jayo3d.com', hosts: ['jayo3d.com'], platform: 'shopify' },
  { manufacturer: 'Inland', host: 'www.microcenter.com', hosts: ['www.microcenter.com'], platform: 'blocked', note: 'Micro Center house brand, no standalone store' },
  { manufacturer: 'FlashForge', host: 'flashforge.com', hosts: ['flashforge.com', 'flashforgeshop.com'], platform: 'shopify' },
  { manufacturer: 'DEEPLEE', host: 'deeplee.net', hosts: ['deeplee.net', 'deeplee3d.com', 'deeplee.com'], platform: 'other' },
  { manufacturer: 'Kingroon', host: 'kingroon.com', hosts: ['kingroon.com', 'kingroon3d.com'], platform: 'shopify' },
  { manufacturer: 'Amolen', host: 'amolen.com', hosts: ['amolen.com'], platform: 'shopify' },
  { manufacturer: 'CC3D', host: 'cc3d.store', hosts: ['cc3d.store', 'cc3d.com'], platform: 'other' },
  { manufacturer: 'Giantarm', host: 'giantarm.com', hosts: ['giantarm.com'], platform: 'other' },
  { manufacturer: 'Ziro', host: 'ziro3d.com', hosts: ['ziro3d.com'], platform: 'shopify' },
  { manufacturer: 'TecBears', host: 'tecbears.com', hosts: ['tecbears.com'], platform: 'shopify' },
  { manufacturer: 'PanChroma', host: 'panchroma.com', hosts: ['panchroma.com', 'us.polymaker.com'], platform: 'blocked', note: 'Polymaker sub-brand' },
  { manufacturer: '3DHoJor', host: '3dhojor.com', hosts: ['3dhojor.com'], platform: 'shopify' },
  // The apex 404s on /products.json; the store lives on www and is plain Shopify. Recorded as
  // 'other' until 2026-08-26 purely because the probe used the wrong host.
  { manufacturer: 'Tinmorry', host: 'www.tinmorry.com', hosts: ['www.tinmorry.com', 'tinmorry.com'], platform: 'shopify' },
  { manufacturer: 'Hatchbox', host: 'hatchbox3d.com', hosts: ['hatchbox3d.com'], platform: 'blocked' },
  { manufacturer: 'iSanmate', host: 'isanmate.com', hosts: ['isanmate.com'], platform: 'other', note: 'storefront gone: /products.json 404 live 2026-08-27' },
  { manufacturer: 'Prusament', host: 'prusament.com', hosts: ['prusament.com'], platform: 'other', note: 'bespoke parser already exists: parsers/prusament.mjs' },
  { manufacturer: 'SOLEYIN', host: 'soleyin.com', hosts: ['soleyin.com'], platform: 'other' },
  { manufacturer: 'Snapmaker', host: 'snapmaker.com', hosts: ['snapmaker.com', 'us.snapmaker.com'], platform: 'other' },
  { manufacturer: 'kexcelled', host: 'kexcelled.com', hosts: ['kexcelled.com', 'kexcelled3d.com'], platform: 'shopify' },
  { manufacturer: 'IEMAI', host: 'iemai3d.com', hosts: ['iemai3d.com', 'iemai.com'], platform: 'other' },
  { manufacturer: 'Cookiecad', host: 'cookiecad.com', hosts: ['cookiecad.com'], platform: 'other', note: 'storefront gone: /products.json 404 live 2026-08-27' },
  { manufacturer: 'MarsWork', host: 'marswork3d.com', hosts: ['marswork3d.com'], platform: 'shopify' },
  { manufacturer: 'Siraya Tech', host: 'siraya.tech', hosts: ['siraya.tech', 'sirayatech.com'], platform: 'shopify' },
  { manufacturer: 'OVV3D', host: null, hosts: [], platform: 'unresolved', note: 'no domain resolves; Amazon-only brand' },
  { manufacturer: '3DJake', host: '3djake.com', hosts: ['3djake.com', 'www.3djake.uk', '3djake.de'], platform: 'other', note: 'retailer, not a manufacturer' },
  { manufacturer: 'Extrudr', host: 'extrudr.com', hosts: ['extrudr.com'], platform: 'other', note: 'bespoke parser already exists: parsers/extrudr.mjs' },
  // inslogic.com robots-disallows, which is why this read 'blocked'. The actual storefront is
  // inslogic3d.com, whose robots explicitly permits crawling and serves a Shopify feed.
  { manufacturer: 'Inslogic', host: 'www.inslogic3d.com', hosts: ['www.inslogic3d.com', 'inslogic3d.com', 'inslogic.com'], platform: 'shopify' },
  { manufacturer: 'AzureFilm', host: 'azurefilm.com', hosts: ['azurefilm.com', 'azurefilm.si'], platform: 'woocommerce' },
  { manufacturer: 'DURAMIC 3D', host: 'duramic3d.com', hosts: ['duramic3d.com'], platform: 'shopify' },
  { manufacturer: 'Fiberon', host: 'fiberon3d.com', hosts: ['fiberon3d.com', 'fiberlogy.com'], platform: 'other', note: 'Fiberlogy sub-brand' },
  { manufacturer: 'Spectrum', host: 'spectrumfilaments.com', hosts: ['spectrumfilaments.com'], platform: 'other' },
  { manufacturer: 'Mika3D', host: 'mika3d.com', hosts: ['mika3d.com'], platform: 'other' },
  { manufacturer: 'Protopasta', host: 'proto-pasta.com', hosts: ['proto-pasta.com', 'protopasta.com'], platform: 'shopify' },
  { manufacturer: 'Stronghero3d', host: 'stronghero3d.com', hosts: ['stronghero3d.com'], platform: 'other' },
  { manufacturer: 'Comgrow', host: 'comgrow.com', hosts: ['comgrow.com'], platform: 'other' },
  { manufacturer: 'Yousu', host: 'yousu3d.com', hosts: ['yousu3d.com', 'yousu.com'], platform: 'other' },
  { manufacturer: 'R3D', host: 'www.r3dprint.com', hosts: ['www.r3dprint.com', 'r3d.store'], platform: 'shopify', note: 'r3d.store 404s; the live storefront is www.r3dprint.com (26 products, Shopify), found 2026-08-27' },
  { manufacturer: 'VOXELPLA', host: 'voxelpla.com', hosts: ['voxelpla.com'], platform: 'shopify' },
  { manufacturer: 'Fiberlogy', host: 'fiberlogy.com', hosts: ['fiberlogy.com'], platform: 'other', note: 'bespoke parser already exists: parsers/fiberlogy.mjs' },
  { manufacturer: 'LANDU', host: 'landu3d.com', hosts: ['landu3d.com'], platform: 'shopify' },
  { manufacturer: '3D-Fuel', host: '3dfuel.com', hosts: ['3dfuel.com'], platform: 'shopify' },
  { manufacturer: '123-3D', host: '123-3d.nl', hosts: ['123-3d.nl'], platform: 'other', note: 'retailer, not a manufacturer' },
  { manufacturer: 'Winkle', host: 'winkle.shop', hosts: ['winkle.shop', 'winkle3d.com'], platform: 'other' },
  { manufacturer: 'Rosa3D', host: 'rosa3d.pl', hosts: ['rosa3d.pl', 'rosa3d.com'], platform: 'other' },
  { manufacturer: 'Sovol', host: 'sovol3d.com', hosts: ['sovol3d.com'], platform: 'shopify' },
  { manufacturer: 'SainSmart', host: 'sainsmart.com', hosts: ['sainsmart.com'], platform: 'shopify' },
  { manufacturer: 'Voxelab', host: 'voxelab3dp.com', hosts: ['voxelab3dp.com'], platform: 'shopify' },
  { manufacturer: 'Fillamentum', host: 'fillamentum.com', hosts: ['fillamentum.com'], platform: 'other', note: 'bespoke parser already exists: parsers/fillamentum.mjs' },
  { manufacturer: 'Atomic Filament', host: 'atomicfilament.com', hosts: ['atomicfilament.com'], platform: 'shopify' },
  { manufacturer: 'Aceaddity', host: 'aceaddity.com', hosts: ['aceaddity.com'], platform: 'blocked' },
  { manufacturer: 'RepRapper', host: 'reprapper.com', hosts: ['reprapper.com'], platform: 'other', note: 'first probe saw robots.txt 5xx and failed closed; re-probe showed it reachable' },
  { manufacturer: 'Matterhackers', host: 'matterhackers.com', hosts: ['matterhackers.com'], platform: 'other', note: 'retailer, not a manufacturer' },
  { manufacturer: 'add:north', host: 'addnorth.com', hosts: ['addnorth.com'], platform: 'other' },
  { manufacturer: 'FormFutura', host: 'formfutura.com', hosts: ['formfutura.com'], platform: 'other' },
  { manufacturer: 'Devil Design', host: 'devildesign.com', hosts: ['devildesign.com'], platform: 'other' },
  { manufacturer: 'CCTREE', host: 'cctree.com', hosts: ['cctree.com'], platform: 'other' },
  { manufacturer: 'ColorFabb', host: 'colorfabb.com', hosts: ['colorfabb.com'], platform: 'other' },
  { manufacturer: 'QIDI Tech', host: 'qidi3d.com', hosts: ['qidi3d.com', 'qiditech.com'], platform: 'shopify' },
  { manufacturer: 'Gizmo Dorks', host: 'gizmodorks.com', hosts: ['gizmodorks.com'], platform: 'other' },
  { manufacturer: 'Numakers', host: 'numakers.com', hosts: ['numakers.com'], platform: 'shopify' },
  { manufacturer: 'Zyltech', host: 'zyltech.com', hosts: ['zyltech.com'], platform: 'other' },
  { manufacturer: 'Paramount 3D', host: 'paramount-3d.com', hosts: ['paramount-3d.com', 'pm3d.com'], platform: 'other' },
  { manufacturer: '3D Solutech', host: '3dsolutech.com', hosts: ['3dsolutech.com'], platform: 'blocked' },
  { manufacturer: 'Prusa', host: 'prusa3d.com', hosts: ['prusa3d.com'], platform: 'other' },
  { manufacturer: 'Das Filament', host: 'dasfilament.de', hosts: ['dasfilament.de'], platform: 'other', note: 'storefront gone: /products.json 404 live 2026-08-27' },
  { manufacturer: 'Filament PM', host: 'filament-pm.com', hosts: ['filament-pm.com', 'filament-pm.cz'], platform: 'other' },
  { manufacturer: 'Nobufil', host: 'nobufil.com', hosts: ['nobufil.com'], platform: 'other' },
  { manufacturer: 'AURAPOL', host: 'aurapol.cz', hosts: ['aurapol.cz', 'aurapol.com'], platform: 'other' },
  { manufacturer: 'SmartMaterials', host: 'smartmaterials3d.com', hosts: ['smartmaterials3d.com'], platform: 'other' },
  { manufacturer: 'Gembird', host: 'gembird.com', hosts: ['gembird.com', 'gembird.nl'], platform: 'other' },
  { manufacturer: 'Smartfil', host: 'smartfil.es', hosts: ['smartfil.es', 'smartmaterials3d.com'], platform: 'other', note: 'Smart Materials sub-brand' },
  { manufacturer: 'NinjaTek', host: 'ninjatek.com', hosts: ['ninjatek.com'], platform: 'woocommerce' },
  { manufacturer: 'PrimaSelect', host: 'primacreator.com', hosts: ['primacreator.com'], platform: 'shopify' },
  { manufacturer: 'Recreus', host: 'recreus.com', hosts: ['recreus.com'], platform: 'shopify' },
  { manufacturer: '3DXTECH', host: '3dxtech.com', hosts: ['3dxtech.com'], platform: 'shopify' },
  { manufacturer: 'Polar Filament', host: 'polarfilament.com', hosts: ['polarfilament.com'], platform: 'shopify' },
  { manufacturer: 'Sakata3D', host: 'sakata3d.com', hosts: ['sakata3d.com'], platform: 'other' },
  { manufacturer: 'COEX', host: 'coex3d.com', hosts: ['coex3d.com'], platform: 'shopify' },
  { manufacturer: 'Push Plastic', host: 'pushplastic.com', hosts: ['pushplastic.com'], platform: 'shopify' },
  { manufacturer: 'Filaments.CA', host: 'filaments.ca', hosts: ['filaments.ca'], platform: 'shopify' },
  { manufacturer: 'BASF', host: 'forward-am.com', hosts: ['forward-am.com', 'move.forward-am.com'], platform: 'other' },
  { manufacturer: 'Verbatim', host: 'verbatim.com', hosts: ['verbatim.com'], platform: 'other' },
  { manufacturer: 'taulman3D', host: 'taulman3d.com', hosts: ['taulman3d.com'], platform: 'other' },
  { manufacturer: 'Wanhao', host: 'wanhao3d.com', hosts: ['wanhao3d.com'], platform: 'other' },
  { manufacturer: 'MakerBot', host: 'makerbot.com', hosts: ['makerbot.com'], platform: 'other' },
  { manufacturer: 'Raise3D', host: 'raise3d.com', hosts: ['raise3d.com'], platform: 'other' },
  { manufacturer: 'UltiMaker', host: 'ultimaker.com', hosts: ['ultimaker.com'], platform: 'other' },
  { manufacturer: 'Zortrax', host: 'zortrax.com', hosts: ['zortrax.com'], platform: 'other' },
  { manufacturer: 'Filoalfa', host: 'filoalfa3d.com', hosts: ['filoalfa3d.com'], platform: 'blocked' },
  { manufacturer: 'REC', host: 'rec3d.ru', hosts: ['rec3d.ru', 'rec3d.com'], platform: 'other' },
  { manufacturer: 'Print-Me', host: 'print-me.pl', hosts: ['print-me.pl'], platform: 'woocommerce' },
  { manufacturer: 'Fiberthree', host: 'fiberthree.com', hosts: ['fiberthree.com'], platform: 'other' },
  { manufacturer: 'Igus', host: 'igus.com', hosts: ['igus.com', 'igus.eu'], platform: 'other' },
  { manufacturer: 'Francofil', host: 'francofil.fr', hosts: ['francofil.fr'], platform: 'woocommerce' },
  { manufacturer: 'GreenGate3D', host: 'greengate3d.com', hosts: ['greengate3d.com'], platform: 'shopify' },
  { manufacturer: 'IC3D', host: 'ic3dprinters.com', hosts: ['ic3dprinters.com'], platform: 'other', note: 'storefront gone: /products.json 404 live 2026-08-27' },
  { manufacturer: 'Keene Village Plastics', host: 'keenevillageplastics.com', hosts: ['keenevillageplastics.com'], platform: 'other' },
  { manufacturer: 'Filaform', host: 'filaform.com', hosts: ['filaform.com'], platform: 'other' },
  { manufacturer: 'X3D', host: 'x3d.com.au', hosts: ['x3d.com.au', 'x3d.co.uk'], platform: 'shopify' },
  { manufacturer: 'Real', host: 'realfilament.com', hosts: ['realfilament.com', 'real-filament.com'], platform: 'other' },
  { manufacturer: '3DE', host: '3de.co.uk', hosts: ['3de.co.uk'], platform: 'other' },
  { manufacturer: 'Copymaster3D', host: 'copymaster3d.com', hosts: ['copymaster3d.com'], platform: 'shopify' },
  { manufacturer: 'Nature3D', host: 'nature3d.net', hosts: ['nature3d.net'], platform: 'other' },
  { manufacturer: 'Polyalchemy', host: null, hosts: [], platform: 'unresolved', note: 'no domain resolves; Elixir line sold through resellers only' },
];

export const SHOPIFY_BRANDS = BRANDS.filter((b) => b.platform === 'shopify');
export const WOOCOMMERCE_BRANDS = BRANDS.filter((b) => b.platform === 'woocommerce');

export const byManufacturer = (name) => BRANDS.find((b) => b.manufacturer.toLowerCase() === String(name).toLowerCase());

// ---------------------------------------------------------------------------
// Platform probe. Every request goes through fetch.mjs, so the robots gate, the
// >=1.5 s per-domain floor and the disk cache all apply. A robots-disallow is a
// final answer, never something to route around.
// ---------------------------------------------------------------------------

const SHOPIFY_PROBE = (host) => `https://${host}/products.json?limit=1`;
const WOO_PROBE = (host) => `https://${host}/wp-json/wc/store/v1/products?per_page=1`;

/**
 * @param {string} host
 * @returns {Promise<{platform: Platform, robots: string, products: number|null, detail: string}>}
 */
export async function probeHost(host) {
  if (!host) return { platform: 'unresolved', robots: 'n/a', products: null, detail: 'no domain' };

  let robots = 'allowed';
  let blockedReason = '';

  // 1. Shopify: /products.json?limit=1 -> { products: [...] }
  const sh = await get(SHOPIFY_PROBE(host));
  if (sh.status === 'robots-disallow') {
    robots = 'disallow /products.json';
    blockedReason = 'robots.txt disallows /products.json';
  } else if (sh.ok) {
    try {
      const j = JSON.parse(sh.body);
      if (Array.isArray(j.products)) {
        return { platform: 'shopify', robots, products: j.products.length, detail: 'products.json' };
      }
    } catch {
      /* HTML or error page -> not Shopify */
    }
  } else if (sh.status === 403 || sh.status === 401) {
    blockedReason = `HTTP ${sh.status} on /products.json`;
  }

  // 2. WooCommerce Store API: /wp-json/wc/store/v1/products -> [ {...} ]
  const wc = await get(WOO_PROBE(host));
  if (wc.status === 'robots-disallow') {
    robots = robots === 'allowed' ? 'disallow /wp-json' : `${robots}, /wp-json`;
    blockedReason ||= 'robots.txt disallows /wp-json';
  } else if (wc.ok) {
    try {
      const j = JSON.parse(wc.body);
      if (Array.isArray(j)) {
        return { platform: 'woocommerce', robots, products: j.length, detail: 'store-api' };
      }
    } catch {
      /* not the Store API */
    }
  } else if (wc.status === 403 || wc.status === 401) {
    blockedReason ||= `HTTP ${wc.status} on /wp-json`;
  }

  // 3. Fall back to the home page: WooCommerce sites always ship the plugin assets, and a
  //    Shopify site with products.json turned off still carries Shopify.shop / cdn.shopify.com.
  const home = await get(`https://${host}/`);
  if (home.status === 'robots-disallow') {
    return { platform: 'blocked', robots: 'disallow /', products: null, detail: 'robots.txt disallows the home page' };
  }
  if (home.ok) {
    const html = home.body;
    if (/wp-content\/plugins\/woocommerce/i.test(html)) {
      return { platform: 'woocommerce', robots, products: null, detail: 'html: woocommerce plugin assets (Store API unavailable)' };
    }
    if (/cdn\.shopify\.com|Shopify\.shop|shopify-features/i.test(html)) {
      return { platform: 'shopify', robots, products: null, detail: 'html: shopify markers (products.json unavailable)' };
    }
    return { platform: 'other', robots, products: null, detail: 'reachable, neither platform detected' };
  }

  if (blockedReason || home.status === 403 || home.status === 401) {
    return {
      platform: 'blocked',
      robots,
      products: null,
      detail: blockedReason || `HTTP ${home.status} on /`,
    };
  }
  return { platform: 'other', robots, products: null, detail: `unreachable: HTTP ${home.status}` };
}
