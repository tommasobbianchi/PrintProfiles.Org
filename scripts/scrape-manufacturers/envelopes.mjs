#!/usr/bin/env node
// Plausible temperature envelope per polymer: [nozzleMin, nozzleMax, bedMin, bedMax].
//
// These are NOT textbook ranges. They are deliberately wider, because the database is full of
// grades that a textbook range would call wrong: foaming ASA, low-warp ASA, casting wax typed
// as PLA, adhesive-bed nylons. An envelope exists to catch a profile carrying ANOTHER
// polymer's settings, not to enforce a house opinion about how a material should be printed.
//
// The minimums below were widened on 2026-08-26 after reviewing the 42 presets that sat under
// them. Most were correct and the envelope was wrong. What the sources actually publish:
//
//   Spectrum ASA 275         bed 50-80    (verified on spectrumfilaments.com)
//   Polymaker Fiberon PA6-CF20  bed 25-50 (verified in SpoolmanDB's bed_temp_range)
//   Polymaker PolyCast PVB   bed 25-70    (same)
//   FormFutura AquaSolve PVA bed 30
//   PrimaSelect PC / add:north PC HT  bed 80, PrimaSelect PC-CF bed 70
//   BASF Ultrafuse PP-GF30   bed 40
//   Wax-Alike MoldLay        nozzle 175   (a casting wax, typed PLA)
//   re3D rPP                 nozzle 190   (recycled PP)
//   FDplast TPU              nozzle 180   (a soft TPU)
//
// So a low bed on ASA or nylon is a real product decision, not a parse error. What remains
// under these floors after the widening is genuinely suspect and worth reading.

export const ENVELOPE = {
  PLA: [170, 250, 0, 80],        // 170: MoldLay casting wax ships as PLA
  PETG: [200, 275, 45, 110],
  ABS: [210, 285, 70, 120],
  ASA: [220, 290, 50, 120],      // 50: Spectrum ASA 275 publishes bed 50-80
  TPU: [180, 260, 0, 80],
  TPE: [180, 260, 0, 80],
  PC: [240, 320, 70, 130],       // 70: PrimaSelect PC-CF; CF-filled PC warps less and runs cooler
  Nylon: [220, 320, 25, 120],    // 25: Polymaker's PA line is printed on an adhesive-prepped bed
  'PA-CF': [230, 320, 25, 120],
  'PA-GF': [230, 320, 25, 120],
  PA6: [230, 320, 25, 120],
  PA12: [230, 320, 25, 120],
  PVA: [170, 230, 25, 80],
  BVOH: [170, 230, 25, 80],
  HIPS: [210, 260, 60, 120],
  PP: [190, 280, 30, 120],
  PCTG: [220, 280, 35, 110],     // 35: 3D-Fuel publishes bed 39 across its whole Pro PCTG line
  PVB: [190, 250, 25, 90],
  PET: [210, 280, 45, 110],
  CPE: [220, 280, 45, 110],
  PEBA: [200, 260, 0, 80],
  PHA: [180, 240, 0, 80],
  PEI: [350, 450, 120, 200],     // 200: Kexcelled K11 PEI; ULTEM-class beds run this hot
  Copolyester: [210, 280, 45, 110],
};

// Below the floor is the shape of a profile that borrowed a cooler polymer's settings, which is
// how "Artillery PC" ends up at 210 C. Above the ceiling is normal for filled and engineering
// grades — PET-CF at 300 C is correct — so only the cold side is treated as a likely defect.
export function tooCold(type, nozzle, bed) {
  const e = ENVELOPE[type];
  if (!e) return null;
  const why = [];
  if (nozzle < e[0]) why.push(`nozzle ${nozzle} below ${e[0]}`);
  if (bed < e[2]) why.push(`bed ${bed} below ${e[2]}`);
  return why.length ? why.join('; ') : null;
}
