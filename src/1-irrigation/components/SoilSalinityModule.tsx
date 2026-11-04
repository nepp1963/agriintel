import React from 'react';

interface Props {
  ecIrrigation: number | '';
  setEcIrrigation: (val: number | '') => void;
  ecThreshold: number | '';
  setEcThreshold: (val: number | '') => void;
  targetLeachingEfficiency: number | '';
  setTargetLeachingEfficiency: (val: number | '') => void;
  safeLR: number;
}

export function SoilSalinityModule({
  ecIrrigation, setEcIrrigation,
  ecThreshold, setEcThreshold,
  targetLeachingEfficiency, setTargetLeachingEfficiency,
  safeLR
}: Props) {
  const t = {
    card: "bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-xl backdrop-blur-md",
    input: "bg-slate-950/80 border-slate-800 text-slate-100 placeholder-slate-600 focus:border-emerald-500 focus:ring-emerald-500/20",
    label: "text-xs font-medium text-slate-400 mb-1 block",
    header: "text-lg font-semibold text-slate-100 flex items-center gap-2 mb-4"
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={t.card}>
          <h2 className={t.header}>🧂 Water & Soil Salinity Inputs</h2>
          <div className="space-y-3">
            <div>
              <label className={t.label}>IRRIGATION WATER SALINITY (ECiw dS/m)</label>
              <input type="number" step="0.1" value={ecIrrigation} onChange={e => setEcIrrigation(e.target.value === '' ? '' : Number(e.target.value))} className={`w-full border rounded-lg px-3 py-2 text-xs ${t.input}`} />
            </div>
            <div>
              <label className={t.label}>CROP SALINITY THRESHOLD (ECe dS/m)</label>
              <input type="number" step="0.1" value={ecThreshold} onChange={e => setEcThreshold(e.target.value === '' ? '' : Number(e.target.value))} className={`w-full border rounded-lg px-3 py-2 text-xs ${t.input}`} />
            </div>
          </div>
        </div>

        <div className={t.card}>
          <h2 className={t.header}>💧 Leaching & Management</h2>
          <div className="space-y-3">
            <div>
              <label className={t.label}>IRRIGATION APPLICATION EFFICIENCY</label>
              <input type="number" step="0.05" value={targetLeachingEfficiency} onChange={e => setTargetLeachingEfficiency(e.target.value === '' ? '' : Number(e.target.value))} className={`w-full border rounded-lg px-3 py-2 text-xs ${t.input}`} />
            </div>
            <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-800/60">
              <span className="text-[10px] text-slate-400 block font-medium">STATUS</span>
              <div className="text-sm font-bold text-emerald-400 mt-0.5">{safeLR < 15 ? "Low Salinity Hazard" : "High Salinity Risk - Leaching Required"}</div>
            </div>
          </div>
        </div>

        <div className={t.card}>
          <h2 className={t.header}>📊 Leaching Requirement Output</h2>
          <div className="space-y-3 text-xs">
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 text-center">
              <span className="text-slate-400 block text-[10px] mb-1">REQUIRED LEACHING FRACTION (LR)</span>
              <div className="text-2xl font-bold text-amber-400">{safeLR.toFixed(1)}%</div>
              <span className="text-[10px] text-slate-500 mt-1 block">Auto-routed into SPIS Adjusted Crop Demand (ETc)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
