import { FilamentProfile } from '../types';

// Reinforcement is not a filament type.
//
// In the data a carbon-filled PETG is `filamentType: 'PETG'` with "CF" in the product name —
// only PA-CF and PA-GF ever became types of their own. So a material filter alone can never
// reach the ~400 filled profiles in the catalogue, and "PETG CF" is a search a visitor will
// certainly try. This derives the facet from the name instead.
//
// The detection mirrors scripts/scrape-manufacturers/abrasive.mjs, which carries the full
// reasoning: the hard part is not spotting fills, it is not matching the look-alikes
// (`polycarbonate` contains "carbon", `metallic` is a colour, `hdglass` is clear PETG).
// Here only the fibre half is needed, so the rule set is much smaller — but the same trap
// applies, hence the explicit exclusions.

export type Reinforcement = 'CF' | 'GF' | 'AF';

export const REINFORCEMENTS: Reinforcement[] = ['CF', 'GF', 'AF'];

export const REINFORCEMENT_LABEL: Record<Reinforcement, string> = {
    CF: 'Carbon fibre',
    GF: 'Glass fibre',
    AF: 'Aramid',
};

// "polycarbonate" contains "carbon" and "carbon black" is a pigment; neither is a fill.
const NOT_FIBRE = /poly ?carbonate|carbon ?look|carbon black/i;

// Separators vary by source ("PA6-CF", "PA6 CF", "ppscf"), so they are flattened first.
const flatten = (s: string) => s.replace(/[_\-\s]+/g, ' ').trim();

const RULES: Array<[Reinforcement, RegExp]> = [
    ['AF', /(^|[^a-z])af\d*([^a-z]|$)|\b(aramid|kevlar)\b/i],
    ['GF', /(^|[^a-z])gf\d*([^a-z]|$)|glass ?fib|fib(er|re) ?glass|glasfaser|\b(pps|ppa|pa\d*|pet|petg|pctg|abs|asa|pc|pla|pp|pekk|peek|pei|htn|tpu)gf\d*\b/i],
    ['CF', /(^|[^a-z])r?cf\d*([^a-z]|$)|carbon ?fib|fibra de carbono|\bcarbone\b|\b(carbonx|carbonfil)\b|\b(pps|ppa|pa\d*|pet|petg|pctg|abs|asa|pc|pla|pp|pekk|peek|pei|htn|tpu)r?cf\d*\b|\bcarbon\b/i],
];

/** The fibre a profile is filled with, or null when it is unfilled. */
export function reinforcementOf(p: FilamentProfile): Reinforcement | null {
    const text = flatten(`${p.brand ?? ''} ${p.profileName ?? ''} ${p.filamentType}`);
    if (NOT_FIBRE.test(text)) {
        // A name may deny one fibre and still state another: "PC-CF" is polycarbonate AND
        // carbon-filled. Only fall through when an explicit token survives the exclusion.
        const explicit = /(^|[^a-z])(r?cf|gf|af)\d*([^a-z]|$)|\b(kevlar|aramid)\b/i.test(text);
        if (!explicit) return null;
    }
    for (const [tag, re] of RULES) if (re.test(text)) return tag;
    return null;
}

/** The catalogue already carries the warning in `notes`; this just reads it back. */
export function isAbrasive(p: FilamentProfile): boolean {
    return /hardened nozzle/i.test(p.notes ?? '');
}
