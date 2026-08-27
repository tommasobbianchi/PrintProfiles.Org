import React, { useEffect } from 'react';
import { FilamentProfile } from '../types';
import { reinforcementOf, isAbrasive } from '../utils/reinforcement';
import { generateBambuJson, generatePrusaIni, generateIdeaMakerJson } from '../utils/exporters';

type Format = 'bambu' | 'prusa' | 'ideamaker';

const FORMATS: { id: Format; label: string; ext: string; hint: string }[] = [
    { id: 'bambu', label: 'Bambu / Orca', ext: 'json', hint: 'Imports as a filament preset in Orca or Bambu Studio' },
    { id: 'prusa', label: 'PrusaSlicer', ext: 'ini', hint: 'A filament .ini for PrusaSlicer 2.7 and later' },
    { id: 'ideamaker', label: 'ideaMaker', ext: 'json', hint: 'ideaMaker filament template' },
];

export const downloadProfile = (profile: FilamentProfile, type: Format) => {
    const spec = {
        bambu: { body: () => JSON.stringify(generateBambuJson(profile), null, 2), mime: 'text/json', ext: 'json', tag: 'BambuOrca' },
        prusa: { body: () => generatePrusaIni(profile), mime: 'text/plain', ext: 'ini', tag: 'Prusa' },
        ideamaker: { body: () => JSON.stringify(generateIdeaMakerJson(profile), null, 2), mime: 'text/json', ext: 'json', tag: 'IdeaMaker' },
    }[type];

    const blob = new Blob([spec.body()], { type: `${spec.mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${profile.profileName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${spec.tag}.${spec.ext}`;
    link.click();
    URL.revokeObjectURL(url);
};

// Provenance is the thing a scraped catalogue has to earn trust with, so it gets stated in
// plain words rather than left as a raw sourceType string.
const SOURCE_COPY: Record<string, { label: string; blurb: string }> = {
    manufacturer: { label: 'Manufacturer', blurb: "The vendor's own published figures." },
    retailer: { label: 'Retailer', blurb: 'Published by a shop that sells this spool, not by the maker. The figures are theirs, so check the maker\'s own datasheet before a critical print.' },
    spoolmandb: { label: 'SpoolmanDB', blurb: 'From SpoolmanDB, the MIT-licensed community database.' },
    'slicer-profile': { label: 'Slicer profile', blurb: "Parameter values from an open-source slicer's tuned profile — not the vendor's own figure." },
    generic: { label: 'Unattributed', blurb: 'A hand-written starting point with no cited source. Treat it as a starting point, not a datasheet.' },
};

const Stat: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div className="flex flex-col gap-1 bg-white/[0.06] border border-white/15 rounded-lg px-4 py-3">
        <span className="text-[10px] uppercase tracking-[0.06em] text-stone-400">{label}</span>
        <span className="text-xl font-semibold text-stone-50 tabular-nums leading-none">{value}</span>
    </div>
);

const ProfileDetail: React.FC<{ profile: FilamentProfile; onClose: () => void }> = ({ profile, onClose }) => {
    const [format, setFormat] = React.useState<Format>('bambu');
    const fill = reinforcementOf(profile);
    const abrasive = isAbrasive(profile);
    const source = SOURCE_COPY[profile.sourceType ?? 'generic'] ?? SOURCE_COPY.generic;
    const chosen = FORMATS.find((f) => f.id === format)!;

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';
        return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 backdrop-blur-sm p-4 sm:p-8" onClick={onClose}>
            <div className="w-full max-w-4xl bg-stone-950/85 backdrop-blur-xl rounded-xl border border-white/15 shadow-2xl my-4" onClick={(e) => e.stopPropagation()}>

                <div className="flex items-start justify-between gap-6 p-6 border-b border-white/15">
                    <div className="min-w-0">
                        <p className="text-sm text-stone-400">{profile.manufacturer}</p>
                        <h2 className="text-3xl font-bold text-stone-50 tracking-tight leading-tight mt-1 break-words">
                            {profile.brand || profile.filamentType}
                        </h2>
                        <div className="flex flex-wrap gap-2 mt-3">
                            <span className="inline-flex items-center h-6 px-2 border border-white/30 rounded text-[11px] font-medium text-stone-200">{profile.filamentType}</span>
                            {fill && <span className="inline-flex items-center h-6 px-2 rounded bg-stone-100 text-stone-900 text-[11px] font-semibold tracking-wide">{fill}</span>}
                            <span className="inline-flex items-center h-6 px-2 border border-white/30 rounded text-[11px] font-medium text-stone-200">{profile.filamentDiameter} mm</span>
                            {profile.printerBrand !== 'Other' && (
                                <span className="inline-flex items-center h-6 px-2 border border-white/30 rounded text-[11px] font-medium text-stone-200">
                                    {profile.printerModel ? `${profile.printerBrand} ${profile.printerModel}` : profile.printerBrand}
                                </span>
                            )}
                        </div>
                    </div>
                    <button onClick={onClose} aria-label="Close" className="shrink-0 text-stone-400 hover:text-white transition-colors">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" className="h-6 w-6"><path d="M6 6l12 12M18 6L6 18" /></svg>
                    </button>
                </div>

                {abrasive && (
                    <div className="flex items-start gap-3 mx-6 mt-6 px-4 py-3 border border-amber-400/40 bg-amber-400/10 rounded-lg">
                        <svg viewBox="0 0 24 24" fill="none" stroke="#fcd34d" strokeWidth={1.8} strokeLinecap="round" className="h-[18px] w-[18px] shrink-0 mt-0.5"><path d="M12 3.5 2.5 20h19L12 3.5Z" /><path d="M12 10v4" /><path d="M12 17.2v.1" /></svg>
                        <div>
                            <p className="text-sm font-semibold text-amber-200">Abrasive — hardened nozzle required</p>
                            <p className="text-[13px] text-amber-100/80 leading-snug mt-0.5">
                                This fill wears a brass nozzle out in hours. Fit hardened steel or a ruby before printing it.
                            </p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 p-6">
                    <div className="flex flex-col gap-6">
                        <section className="flex flex-col gap-3">
                            <h3 className="text-[11px] font-semibold uppercase tracking-[0.09em] text-stone-400">Temperature</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <Stat label="Nozzle" value={`${profile.nozzleTemp}°`} />
                                <Stat label="First layer" value={`${profile.nozzleTempInitial}°`} />
                                <Stat label="Bed" value={`${profile.bedTemp}°`} />
                                <Stat label="First layer bed" value={`${profile.bedTempInitial}°`} />
                            </div>
                        </section>

                        <section className="flex flex-col gap-3">
                            <h3 className="text-[11px] font-semibold uppercase tracking-[0.09em] text-stone-400">Flow and speed</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <Stat label="Max volumetric" value={`${profile.maxVolumetricSpeed}`} />
                                <Stat label="Print speed" value={`${profile.printSpeed}`} />
                                <Stat label="Flow ratio" value={profile.flowRatio ?? '—'} />
                                <Stat label="Density" value={profile.density ?? '—'} />
                            </div>
                        </section>

                        <section className="flex flex-col gap-3">
                            <h3 className="text-[11px] font-semibold uppercase tracking-[0.09em] text-stone-400">Cooling and handling</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <Stat label="Fan min" value={`${profile.fanSpeedMin}%`} />
                                <Stat label="Fan max" value={`${profile.fanSpeedMax}%`} />
                                <Stat label="Retraction" value={`${profile.retractionDistance} mm`} />
                                <Stat label="Drying" value={profile.dryingTemp ? `${profile.dryingTemp}° / ${profile.dryingTime ?? '—'}` : '—'} />
                            </div>
                        </section>
                    </div>

                    <aside className="flex flex-col gap-4 bg-white/[0.06] border border-white/15 rounded-xl p-5 h-fit">
                        <h3 className="text-[11px] font-semibold uppercase tracking-[0.09em] text-stone-400">Where these numbers come from</h3>
                        <span className="inline-flex items-center self-start h-6 px-2 rounded bg-white/15 text-[11px] font-semibold tracking-wide text-stone-100">
                            {source.label.toUpperCase()}
                        </span>
                        <p className="text-[13px] text-stone-300 leading-relaxed">{source.blurb}</p>
                        {profile.sourceProfile && (
                            <p className="text-[13px] text-stone-300 leading-relaxed">
                                Cited profile: <span className="font-medium text-stone-100">{profile.sourceProfile}</span>
                            </p>
                        )}
                        {profile.sourceUrl && (
                            <a href={profile.sourceUrl} target="_blank" rel="noopener noreferrer"
                               className="text-[13px] text-amber-300 hover:text-amber-200 underline break-all">
                                View the source
                            </a>
                        )}

                        <div className="h-px bg-white/15" />

                        <h3 className="text-[11px] font-semibold uppercase tracking-[0.09em] text-stone-400">Export</h3>
                        <div className="flex flex-wrap gap-2">
                            {FORMATS.map((f) => (
                                <button key={f.id} onClick={() => setFormat(f.id)}
                                    className={`h-8 px-3 rounded-md text-[13px] font-medium border transition-colors ${
                                        format === f.id ? 'border-stone-100 bg-stone-100 text-stone-900' : 'border-white/25 bg-black/30 text-stone-300 hover:border-white/50 hover:text-white'
                                    }`}>
                                    {f.label}
                                </button>
                            ))}
                        </div>
                        <button onClick={() => downloadProfile(profile, format)}
                            className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-lg bg-stone-100 text-stone-900 text-sm font-medium hover:bg-white transition-colors">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M12 3v12" /><path d="M7 11l5 5 5-5" /><path d="M4 20h16" /></svg>
                            Download {chosen.ext.toUpperCase()}
                        </button>
                        <p className="text-[11.5px] text-stone-400 leading-snug">{chosen.hint}</p>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default ProfileDetail;
