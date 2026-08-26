#!/usr/bin/env node
// Does this filament chew a brass nozzle?
//
//   node scripts/scrape-manufacturers/abrasive.mjs    runs the self-check
//
// Fill that is harder than brass — carbon or glass fibre, metal powder, stone, wood, glow
// pigment, glitter — wears a standard nozzle out in hours. The person reading a preset is
// about to load the spool, so the fill has to be visible as a warning and not merely implied
// by a product name they may not recognise.
//
// The hard part is not finding the fills, it is NOT warning on the look-alikes. Every entry in
// DENY below was found in the real data and would have been a false warning:
//
//   polycarbonate, ezpc-polycarbonate   contain "carbon"; PC is not filled
//   carbonlook, carbon black            a finish and a pigment, not fibre
//   metallic, metal-like, metal-shine   pigment; the spool is ordinary PLA
//   gun-metal-gray, gunmetalgray        a colour name
//   hdglass, orange-glass-transparent   clear PETG; "glass" here means see-through
//
// A false warning is not harmless: warn on everything and the warning stops being read. So
// DENY beats ALLOW — but STRONG beats DENY, because an explicit CF/GF/Kevlar token is not
// something a colour name elsewhere in the string gets to overrule.

// Unambiguous fill markers. These outrank DENY, because a look-alike word elsewhere in the
// string must not cancel an explicit one: "ultimaker_ppscf_metallic-anthracite" is PPS-CF in a
// metallic colour, and letting "metallic" veto the "CF" would drop the warning from a filament
// that is unquestionably abrasive.
const STRONG = [
  /(^|[^a-z])(r?cf|gf|af)\d*([^a-z]|$)/i,
  // Some sources write the fill straight onto the polymer with no separator, e.g. the file
  // "ultimaker_ppscf_metallic-anthracite" for PPS-CF. Spelled-out polymers only — a bare
  // /[a-z](cf|gf)/ would fire on any word that happens to end in those two letters.
  /\b(pps|ppa|pa\d*|pet|petg|pctg|abs|asa|pc|pla|pp|pekk|peek|pei|htn|tpu)(r?cf|gf|af)\d*\b/i,
  /\b(kevlar|aramid)\b/i,
  /\b(carbonx|carbonfil|metalfil)\b/i,
  /(bronze|copper|steel|brass|iron|wood|cork|glow|bamboo|stone)fill/i,
];

// Checked next; a match here means "not abrasive" unless STRONG already fired.
const DENY = [
  /poly ?carbonate/i,
  /carbon ?look/i,
  /carbon\s+black/i,
  /metal(lic| ?like| ?shine)/i,
  /gun ?metal/i,
  /hd ?glass/i,
  /glass (transparent|clear)|(transparent|clear|vintage|orange|swift) glass/i,
  // A mineral or metal word followed by a colour word is a colour name, not a fill: COEX sells
  // "Stone Gray" in PLA, ABS, ASA, PCTG and PETG alike, and a fill does not travel across five
  // polymers under one name. "PLA Marble" on its own stays abrasive — only the paired form goes.
  /\b(stone|marble|granite|slate|sand|copper|bronze|brass|steel|iron|clay) (grey|gray|white|black|blue|red|green|yellow|silver|gold|beige|brown|pink|orange|purple|ivory|natural)\b/i,
];

const ALLOW = [
  // fibre fill spelled out, in the languages the corpora actually use
  /carbon ?fib/i,
  /\bcarbon\b/i,        // bare suffix: "PETG Carbon" is a CF grade; DENY handles the look-alikes
  /fibra de carbono/i,
  /\bcarbone\b/i,                       // French, e.g. "PEKK Carbone"
  /glass ?fib|glasfaser/i,
  // metal powder
  /\b(metal|tungsten|magnetite|steel|iron|copper|bronze|brass|aluminium|aluminum)\b/i,
  // mineral and organic fill
  /\b(marble|stone|granite|basalt|slate|sand|ceramic|mineral|clay)\b/i,
  /\b(wood|holz|bamboo|cork)\b/i,
  // pigments that are themselves hard: strontium aluminate, glitter flake
  /\bglow\b/i,
  /\b(glitter|sparkle|galaxy)\b/i,
];

// Product names arrive as titles, slugs and filenames, so the same word shows up as "carbon
// fiber", "carbon-fiber" and "carbon_fiber". Underscore is a word character, which means \b
// does not fire in "pekk_carbone" or "xyzprinting_carbon_fiber" — normalising every separator
// to a single space first is what makes one pattern cover all three spellings.
const flatten = (s) => String(s).replace(/[_\-\s]+/g, ' ').trim();

export function isAbrasive(...parts) {
  const text = flatten(parts.filter(Boolean).join(' '));
  if (STRONG.some((re) => re.test(text))) return true;
  if (DENY.some((re) => re.test(text))) return false;
  return ALLOW.some((re) => re.test(text));
}

export const ABRASIVE_NOTE = ' Abrasive — hardened nozzle required.';

// ---------------------------------------------------------------- self-check
if (import.meta.url === `file://${process.argv[1]}`) {
  const { strict: assert } = await import('node:assert');
  const yes = [
    'ColorFabb XT-CF20', 'Ultrafuse PA6 GF30', 'Fiberon PETG-rCF08', 'Kimya ABS Kevlar',
    'prusament-petg-tungsten-75', 'prusament-petg-magnetite-40', 'PA12-CF',
    'carbon-fiber-petg', 'petg-fibra-de-carbono', 'volumic_pekk_carbone',
    'white-glass-fiber-htpetg', 'metalfil-ancient-bronze', 'pla-metal-brass',
    'CarbonX PLA-CF', 'glow-in-the-dark-pla', 'PLA Wood', 'PLA Marble',
    'colorFabb bronzeFill', 'PLA Stone',
    'ultimaker_ppscf_metallic-anthracite', 'Kimya PETG Carbon', 'Extrudr PLA Carbon',
    'galaxy-black-high-impact-carbon-fiber-htpetg',
  ];
  const no = [
    'polycarbonate-pc-filament', 'ezpc-polycarbonate-1', 'PC Blend',
    'filament-3d-pla-carbonlook-05kg-175mm', 'PETG Carbon Black',
    'aurapol-pla-3d-filament-metallic-turquoise', 'primaselect-pla-metal-shine',
    'gun-metal-gray-abs-filament', 'gunmetalgray-pctg-prime', 'pla-metal-like-pack-4x200g',
    'hdglass', 'aurapol-pet-g-filament-stained-orange-glass-transparent',
    'swift-pet-g-orange-glass-250g', 'PLA Silk', 'PETG', 'PLA Basic', 'ABS',
    'Stone Gray PETG', 'ABSx Matt Stone Grey', 'PETG Marble White', 'Stone Gray PLA Prime',
  ];
  for (const s of yes) assert.equal(isAbrasive(s), true, `should be abrasive: ${s}`);
  for (const s of no) assert.equal(isAbrasive(s), false, `should NOT be abrasive: ${s}`);
  console.log(`abrasive self-check: ${yes.length} abrasive + ${no.length} non-abrasive all correct`);
}
