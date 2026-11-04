import React from 'react';

interface Props {
  selectedCrop: string;
  setSelectedCrop: (val: string) => void;
  slopePercent: number | '';
  setSlopePercent: (val: number | '') => void;
  soilDepthCm: number | '';
  setSoilDepthCm: (val: number | '') => void;
  soilPh: number | '';
  setSoilPh: (val: number | '') => void;
  drainageClass: string;
  setDrainageClass: (val: string) => void;
}

export function LandSuitabilityModule({
  selectedCrop, setSelectedCrop,
  slopePercent, setSlopePercent,
  soilDepthCm, setSoilDepthCm,
  soilPh, setSoilPh,
  drainageClass, setDrainageClass
}: Props) {
  const slope = typeof slopePercent === 'number' ? slopePercent : 0;
  const depth = typeof soilDepthCm === 'number' ? soilDepthCm : 0;
  const ph = typeof soilPh === 'number' ? soilPh : 7;

  let suitabilityScore = "S1 - Highly Suitable";
  let limitingFactor = "None (Optimal Conditions)";

  if (slope > 15 || depth < 50 || ph < 5.0 || ph > 8.0) {
    suitabilityScore = "N - Not Suitable";
    limitingFactor = slope > 15 ? "Excessive slope gradient (>15%)" : depth < 50 ? "Shallow rooting depth (<50cm)" : "Extreme soil pH limitation";
  } else if (slope > 8 || depth < 75 || ph < 5.5 || ph > 7.5) {
    suitabilityScore = "S3 - Marginally Suitable";
    limitingFactor = slope > 8 ? "Moderate slope constraints (>8% triggers Drip Irrigation routing)" : "Suboptimal soil depth or pH";
  } else if (slope > 4 || depth < 90) {
    suitabilityScore = "S2 - Moderately Suitable";
    limitingFactor = "Minor topographic or depth variance";
  }

  const t = {
    card: "bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-xl backdrop-blur-md",
    input: "bg-slate-950/80 border-slate-800 text-slate-100 placeholder-slate-600 focus:border-emerald-500 focus:ring-emerald-500/20",
    select: "bg-slate-950/80 border border-slate-800 text-slate-100 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:border-emerald-500",
    label: "text-xs font-medium text-slate-400 mb-1 block",
    header: "text-lg font-semibold text-slate-100 flex items-center gap-2 mb-4"
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={t.card}>
          <h2 className={t.header}>🗺️ Terrain & Topography</h2>
          <div className="space-y-3">
            <div>
              <label className={t.label}>TARGET CROP EVALUATION</label>
              <select value={selectedCrop} onChange={e => setSelectedCrop(e.target.value)} className={`w-full ${t.select}`}>
                <option value="sugarcane">Sugarcane (Commercial)</option>
                <option value="rice">Lowland Rice (Palay)</option>
                <option value="corn">Yellow Corn (Maize)</option>
                <option value="onion">Red Onion</option>
              </select>
            </div>
            <div>
              <label className={t.label}>SLOPE GRADIENT (%)</label>
              <input type="number" step="0.5" value={slopePercent} onChange={e => setSlopePercent(e.target.value === '' ? '' : Number(e.target.value))} className={`w-full border rounded-lg px-3 py-2 text-xs ${t.input}`} />
              <span className="text-[10px] text-slate-500 mt-1 block">Values &gt;8% automatically flag SPIS micro-irrigation routing.</span>
            </div>
          </div>
        </div>

        <div className={t.card}>
          <h2 className={t.header}>🧪 Soil Physical & Chemical Properties</h2>
          <div className="space-y-3">
            <div>
              <label className={t.label}>EFFECTIVE SOIL DEPTH (CM)</label>
              <input type="number" value={soilDepthCm} onChange={e => setSoilDepthCm(e.target.value === '' ? '' : Number(e.target.value))} className={`w-full border rounded-lg px-3 py-2 text-xs ${t.input}`} />
            </div>
            <div>
              <label className={t.label}>SOIL pH (1:1 Water)</label>
              <input type="number" step="0.1" value={soilPh} onChange={e => setSoilPh(e.target.value === '' ? '' : Number(e.target.value))} className={`w-full border rounded-lg px-3 py-2 text-xs ${t.input}`} />
            </div>
            <div>
              <label className={t.label}>DRAINAGE CLASS</label>
              <select value={drainageClass} onChange={e => setDrainageClass(e.target.value)} className={`w-full ${t.select}`}>
                <option value="well">Well Drained</option>
                <option value="moderately_well">Moderately Well Drained</option>
                <option value="imperfectly">Imperfectly Drained</option>
                <option value="poorly">Poorly Drained</option>
              </select>
            </div>
          </div>
        </div>

        <div className={t.card}>
          <h2 className={t.header}>⭐ FAO Suitability Class</h2>
          <div className="space-y-3 text-xs">
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 text-center">
              <span className="text-slate-400 block text-[10px] mb-1">EVALUATED CLASS</span>
              <div className="text-xl font-bold text-emerald-400">{suitabilityScore}</div>
            </div>
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
              <span className="text-slate-400 block text-[10px]">PRIMARY LIMITING FACTOR</span>
              <div className="font-semibold text-amber-300 mt-0.5">{limitingFactor}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
