import React, { useMemo, useState } from 'react';
import { FilamentProfile, PrinterBrand } from '../types';
import { PRINTER_BRANDS, PRINTER_MODELS } from '../constants';
import { reinforcementOf, isAbrasive, REINFORCEMENTS, REINFORCEMENT_LABEL, Reinforcement } from '../utils/reinforcement';
import ProfileDetail, { downloadProfile } from './ProfileDetail';

interface CommunityProfilesProps {
  profiles: FilamentProfile[];
  isLoading: boolean;
}

// The five a visitor reaches for first. Everything else lives in the rail.
const QUICK_TYPES = ['PLA', 'PETG', 'ABS', 'ASA', 'TPU'];

const toggle = <T,>(list: T[], v: T): T[] =>
  list.includes(v) ? list.filter((x) => x !== v) : [...list, v];

const Chip: React.FC<{ on: boolean; onClick: () => void; children: React.ReactNode }> = ({ on, onClick, children }) => (
  <button
    onClick={onClick}
    className={`inline-flex items-center h-9 px-4 rounded-full text-[13px] font-medium border transition-colors ${
      on ? 'bg-stone-900 border-stone-900 text-[#fdfbf7]' : 'bg-white border-stone-300 text-stone-700 hover:border-stone-400'
    }`}
  >
    {children}
  </button>
);

const FacetRow: React.FC<{ on: boolean; label: string; count: number; onClick: () => void }> = ({ on, label, count, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center justify-between w-full h-8 px-2 rounded-md text-[13.5px] text-left transition-colors ${
      on ? 'bg-stone-100 text-stone-900 font-semibold' : 'text-stone-700 hover:bg-stone-50'
    }`}
  >
    <span className="flex items-center gap-2.5 min-w-0">
      <span className={`inline-block h-3.5 w-3.5 rounded-[3px] shrink-0 border-[1.5px] ${on ? 'bg-amber-800 border-amber-800' : 'bg-white border-stone-300'}`} />
      <span className="truncate">{label}</span>
    </span>
    <span className="text-stone-400 tabular-nums shrink-0 ml-2">{count}</span>
  </button>
);

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="flex flex-col gap-2">
    <h3 className="text-[11px] font-semibold uppercase tracking-[0.09em] text-stone-400">{title}</h3>
    {children}
  </div>
);

const LoadingSpinner: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-24 gap-3">
    <div className="h-8 w-8 rounded-full border-2 border-stone-200 border-t-stone-700 animate-spin" />
    <p className="text-sm text-stone-500">Loading the repository…</p>
  </div>
);

const CommunityProfiles: React.FC<CommunityProfilesProps> = ({ profiles, isLoading }) => {
  const [query, setQuery] = useState('');
  const [types, setTypes] = useState<string[]>([]);
  const [fills, setFills] = useState<Reinforcement[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [printerBrand, setPrinterBrand] = useState<string>('All');
  const [printerModel, setPrinterModel] = useState<string>('All');
  const [showAllBrands, setShowAllBrands] = useState(false);
  const [limit, setLimit] = useState(60);
  const [selected, setSelected] = useState<FilamentProfile | null>(null);

  // Reinforcement is derived from the product name (see utils/reinforcement.ts), so it is
  // computed once per profile rather than on every keystroke.
  const indexed = useMemo(
    () => profiles.map((p) => ({
      p,
      fill: reinforcementOf(p),
      abrasive: isAbrasive(p),
      haystack: `${p.manufacturer} ${p.brand ?? ''} ${p.profileName} ${p.filamentType}`.toLowerCase(),
    })),
    [profiles],
  );

  const counts = useMemo(() => {
    const type: Record<string, number> = {};
    const fill: Record<string, number> = {};
    const brand: Record<string, number> = {};
    for (const { p, fill: f } of indexed) {
      type[p.filamentType] = (type[p.filamentType] ?? 0) + 1;
      brand[p.manufacturer] = (brand[p.manufacturer] ?? 0) + 1;
      if (f) fill[f] = (fill[f] ?? 0) + 1;
    }
    return {
      type: Object.entries(type).sort((a, b) => b[1] - a[1]),
      fill,
      brand: Object.entries(brand).sort((a, b) => b[1] - a[1]),
    };
  }, [indexed]);

  const results = useMemo(() => {
    const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return indexed
      .filter(({ p, fill, haystack }) => {
        // Every word must land somewhere, so "petg cf" narrows instead of widening.
        if (words.length && !words.every((w) => haystack.includes(w))) return false;
        if (types.length && !types.includes(p.filamentType)) return false;
        if (fills.length && !(fill && fills.includes(fill))) return false;
        if (brands.length && !brands.includes(p.manufacturer)) return false;
        if (printerBrand !== 'All' && p.printerBrand !== printerBrand && p.printerBrand !== 'Other') return false;
        if (printerModel !== 'All' && p.printerModel !== printerModel && p.printerModel && p.printerModel !== 'Generic') return false;
        return true;
      })
      .sort((a, b) => a.p.manufacturer.localeCompare(b.p.manufacturer) || (a.p.brand ?? '').localeCompare(b.p.brand ?? ''));
  }, [indexed, query, types, fills, brands, printerBrand, printerModel]);

  const active = query.trim().length > 0 || types.length > 0 || fills.length > 0 || brands.length > 0 || printerBrand !== 'All';
  const clearAll = () => {
    setQuery(''); setTypes([]); setFills([]); setBrands([]);
    setPrinterBrand('All'); setPrinterModel('All'); setLimit(60);
  };

  const visibleBrands = showAllBrands ? counts.brand : counts.brand.slice(0, 8);
  const availableModels = printerBrand !== 'All' && printerBrand !== 'Other'
    ? PRINTER_MODELS[printerBrand as PrinterBrand] ?? []
    : [];

  return (
    <div className="relative">
      {/* The mark as ground, not decoration: oversized, faint, never competing with the data.
          Pushed up and right so it sits behind the hero's whitespace rather than under the
          middle and right cards of the result grid, where it read as noise on the data.

          Two layers, because they do different jobs. The photograph is the logo actually
          printed — layer lines, extrusion texture, raised lettering — so it says what the site
          is about in a way a vector never could; it carries the texture. The line art sits over
          it and keeps the silhouette legible, which the photo alone loses once it is faint
          enough to be safe behind text.

          Both are masked to fade out before they reach the result grid. The two knobs worth
          touching are the opacities: photo 0.09, line art 0.05. */}
      <div
        aria-hidden="true"
        className="pointer-events-none select-none absolute -right-52 -top-24 w-[620px] max-w-[80vw] aspect-square"
        style={{
          // Fades to nothing toward the bottom-left, so nothing ever sits under a card.
          maskImage: 'radial-gradient(closest-side at 70% 30%, black 35%, transparent 78%)',
          WebkitMaskImage: 'radial-gradient(closest-side at 70% 30%, black 35%, transparent 78%)',
        }}
      >
        <img src="/logo-print.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-[0.09]" />
        <img src="/logo-mark.png" alt="" className="absolute inset-0 h-full w-full object-contain opacity-[0.05]" />
      </div>

      {/* Hero */}
      <div className="relative flex flex-col items-center gap-5 pt-10 pb-2 px-2">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-stone-900 text-center max-w-3xl leading-[1.05]">
          Find the settings for the spool in your hand
        </h1>
        <p className="text-base sm:text-[17px] text-stone-600 text-center max-w-xl leading-relaxed">
          {profiles.length.toLocaleString()} profiles from {counts.brand.length.toLocaleString()} brands, each one citing where its numbers came from.
        </p>

        <div className="w-full max-w-2xl flex flex-col gap-3.5 mt-1">
          <div className="relative flex items-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="#78716c" strokeWidth={1.8} strokeLinecap="round" className="absolute left-4 h-5 w-5">
              <circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setLimit(60); }}
              placeholder="Try “Polymaker”, “PETG CF”, or “ASA”"
              className="w-full h-14 pl-12 pr-4 text-[17px] bg-white border border-stone-300 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-400 transition-shadow"
            />
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            {QUICK_TYPES.map((t) => (
              <Chip key={t} on={types.includes(t)} onClick={() => { setTypes(toggle(types, t)); setLimit(60); }}>
                {t}<span className="ml-1.5 opacity-55 tabular-nums">{counts.type.find(([k]) => k === t)?.[1] ?? 0}</span>
              </Chip>
            ))}
            {REINFORCEMENTS.map((f) => (
              <Chip key={f} on={fills.includes(f)} onClick={() => { setFills(toggle(fills, f)); setLimit(60); }}>
                {f}<span className="ml-1.5 opacity-55 tabular-nums">{counts.fill[f] ?? 0}</span>
              </Chip>
            ))}
          </div>
        </div>
      </div>

      {isLoading ? <LoadingSpinner /> : (
        <div className="relative flex flex-col lg:flex-row gap-8 pt-10 pb-10 items-start">

          {/* Filter rail */}
          <aside className="w-full lg:w-[236px] shrink-0 flex flex-col gap-6 lg:sticky lg:top-24">
            <div className="flex items-baseline justify-between">
              <h2 className="text-[12px] font-semibold uppercase tracking-[0.09em] text-stone-500">Filters</h2>
              {active && (
                <button onClick={clearAll} className="text-xs text-amber-800 hover:text-amber-900 underline">Clear</button>
              )}
            </div>

            <Section title="Material">
              <div className="flex flex-col gap-0.5 max-h-72 overflow-y-auto pr-1">
                {counts.type.map(([t, n]) => (
                  <FacetRow key={t} on={types.includes(t)} label={t} count={n} onClick={() => { setTypes(toggle(types, t)); setLimit(60); }} />
                ))}
              </div>
            </Section>

            {/* The facet the data model does not have: a PETG-CF is filamentType PETG with
                "CF" in its name, so without this the filled grades cannot be searched at all. */}
            <Section title="Reinforcement">
              <div className="flex flex-col gap-0.5">
                {REINFORCEMENTS.map((f) => (
                  <FacetRow key={f} on={fills.includes(f)} label={REINFORCEMENT_LABEL[f]} count={counts.fill[f] ?? 0}
                            onClick={() => { setFills(toggle(fills, f)); setLimit(60); }} />
                ))}
              </div>
            </Section>

            <Section title="Brand">
              <div className="flex flex-col gap-0.5 max-h-72 overflow-y-auto pr-1">
                {visibleBrands.map(([b, n]) => (
                  <FacetRow key={b} on={brands.includes(b)} label={b} count={n} onClick={() => { setBrands(toggle(brands, b)); setLimit(60); }} />
                ))}
              </div>
              {counts.brand.length > 8 && (
                <button onClick={() => setShowAllBrands(!showAllBrands)} className="self-start text-xs text-amber-800 hover:text-amber-900 underline mt-1">
                  {showAllBrands ? 'Show fewer' : `All ${counts.brand.length} brands`}
                </button>
              )}
            </Section>

            <Section title="Printer">
              <select
                value={printerBrand}
                onChange={(e) => { setPrinterBrand(e.target.value); setPrinterModel('All'); setLimit(60); }}
                className="w-full h-9 px-2 bg-white border border-stone-300 rounded-md text-[13px] text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-900/10"
              >
                <option value="All">Any printer</option>
                {PRINTER_BRANDS.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
              {availableModels.length > 0 && (
                <select
                  value={printerModel}
                  onChange={(e) => { setPrinterModel(e.target.value); setLimit(60); }}
                  className="w-full h-9 px-2 mt-2 bg-white border border-stone-300 rounded-md text-[13px] text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-900/10"
                >
                  <option value="All">Any model</option>
                  {availableModels.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              )}
            </Section>
          </aside>

          {/* Results */}
          <div className="flex-grow min-w-0 flex flex-col gap-4">
            <div className="flex items-baseline justify-between border-b border-stone-200 pb-3">
              <p className="text-sm text-stone-600">
                {active
                  ? <><span className="font-semibold text-stone-900 tabular-nums">{results.length.toLocaleString()}</span> matching this filter</>
                  : <>All <span className="font-semibold text-stone-900 tabular-nums">{results.length.toLocaleString()}</span> profiles</>}
              </p>
              <p className="text-[13px] text-stone-400 hidden sm:block">Sorted by brand</p>
            </div>

            {results.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-20 border border-dashed border-stone-300 rounded-xl text-center px-6">
                <p className="text-[17px] font-semibold text-stone-700">Nothing matches those filters</p>
                <p className="text-sm text-stone-500 max-w-sm">
                  Try clearing the reinforcement filter — not every material is made in a filled grade.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {results.slice(0, limit).map(({ p, fill, abrasive }) => (
                    <article
                      key={p.id}
                      onClick={() => setSelected(p)}
                      className="group flex flex-col gap-3 p-[18px] bg-white border border-stone-200 rounded-xl cursor-pointer hover:border-stone-400 hover:shadow-sm transition-all"
                    >
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="text-xs text-stone-500 truncate">{p.manufacturer}</span>
                        <h3 className="text-[17px] font-semibold tracking-tight text-stone-900 leading-snug break-words">
                          {p.brand || p.filamentType}
                        </h3>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        <span className="inline-flex items-center h-[22px] px-2 border border-stone-300 rounded text-[11px] font-medium text-stone-700">{p.filamentType}</span>
                        {fill && <span className="inline-flex items-center h-[22px] px-2 rounded bg-stone-900 text-[#fdfbf7] text-[11px] font-semibold tracking-wide">{fill}</span>}
                      </div>

                      <div className="flex gap-5 pt-0.5">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[10px] uppercase tracking-[0.07em] text-stone-400">Nozzle</span>
                          <span className="text-[19px] font-semibold text-stone-900 tabular-nums leading-none">{p.nozzleTemp}°</span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[10px] uppercase tracking-[0.07em] text-stone-400">Bed</span>
                          <span className="text-[19px] font-semibold text-stone-900 tabular-nums leading-none">{p.bedTemp}°</span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[10px] uppercase tracking-[0.07em] text-stone-400">Flow</span>
                          <span className="text-[19px] font-semibold text-stone-900 tabular-nums leading-none">{p.maxVolumetricSpeed}</span>
                        </div>
                      </div>

                      {/* A hardware fact belongs where the choice is made, not one click deeper. */}
                      {abrasive && (
                        <div className="flex items-center gap-1.5">
                          <svg viewBox="0 0 24 24" fill="none" stroke="#92400e" strokeWidth={1.8} strokeLinecap="round" className="h-[15px] w-[15px] shrink-0">
                            <path d="M12 3.5 2.5 20h19L12 3.5Z" /><path d="M12 10v4" /><path d="M12 17.2v.1" />
                          </svg>
                          <span className="text-[11.5px] text-amber-800">Abrasive — hardened nozzle</span>
                        </div>
                      )}

                      <div className="flex gap-2 pt-1 mt-auto opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => { e.stopPropagation(); downloadProfile(p, 'bambu'); }}
                          className="h-7 px-2.5 rounded-md border border-stone-300 text-[11.5px] font-medium text-stone-600 hover:border-stone-500 hover:text-stone-900 transition-colors"
                        >Orca</button>
                        <button
                          onClick={(e) => { e.stopPropagation(); downloadProfile(p, 'prusa'); }}
                          className="h-7 px-2.5 rounded-md border border-stone-300 text-[11.5px] font-medium text-stone-600 hover:border-stone-500 hover:text-stone-900 transition-colors"
                        >Prusa</button>
                        <button
                          onClick={(e) => { e.stopPropagation(); downloadProfile(p, 'ideamaker'); }}
                          className="h-7 px-2.5 rounded-md border border-stone-300 text-[11.5px] font-medium text-stone-600 hover:border-stone-500 hover:text-stone-900 transition-colors"
                        >ideaMaker</button>
                      </div>
                    </article>
                  ))}
                </div>

                {results.length > limit && (
                  <button
                    onClick={() => setLimit(limit + 60)}
                    className="self-center mt-4 h-11 px-6 rounded-lg border border-stone-300 bg-white text-sm font-medium text-stone-700 hover:border-stone-500 transition-colors"
                  >
                    Show 60 more · {(results.length - limit).toLocaleString()} left
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {selected && <ProfileDetail profile={selected} onClose={() => setSelected(null)} />}
    </div>
  );
};

export default CommunityProfiles;
