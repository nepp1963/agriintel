import React from 'react';

interface Props {
  catchmentAreaSqKm: number | '';
  setCatchmentAreaSqKm: (val: number | '') => void;
  rainfallMm: number | '';
  setRainfallMm: (val: number | '') => void;
  curveNumber: number | '';
  setCurveNumber: (val: number | '') => void;
  flowLengthKm: number | '';
  setFlowLengthKm: (val: number | '') => void;
  elevationDropM: number | '';
  setElevationDropM: (val: number | '') => void;
}

export function WatershedModule({
  catchmentAreaSqKm, setCatchmentAreaSqKm,
  rainfallMm, setRainfallMm,
  curveNumber, setCurveNumber,
  flowLengthKm, setFlowLengthKm,
  elevationDropM, setElevationDropM
}: Props) {
  const area = typeof catchmentAreaSqKm === 'number' ? catchmentAreaSqKm : 0;
  const rain = typeof rainfallMm === 'number' ? rainfallMm : 0;
  const cn = typeof curveNumber === 'number' ? curveNumber : 75;
  const len = typeof flowLengthKm === 'number' ? flowLengthKm : 1;
  const drop = typeof elevationDropM === 'number' ? elevationDropM : 1;

  const sRetention = (25400 / cn) - 254;
  const initialAbstraction = 0.2 * sRetention;
  const effectiveRainfall = rain > initialAbstraction ? Math.pow(rain - initialAbstraction, 2) / (rain + 0.8 * sRetention) : 0;
  
  const annualRunoffVolumeM3 = area * 1000000 * (effectiveRainfall / 1000);
  const averageDailyFlowM3 = annualRunoffVolumeM3 / 365;

  const slope = drop / (len * 1000);
  const slopeSafe = slope > 0 ? slope : 0.01;
  const timeOfConcentrationHrs = 0.0195 * Math.pow(len * 1000, 0.77) * Math.pow(slopeSafe, -0.38);

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
          <h2 className={t.header}>⛰️ Catchment & NRCS CN</h2>
          <div className="space-y-3">
            <div>
              <label className={t.label}>CATCHMENT AREA (KM²)</label>
              <input type="number" value={catchmentAreaSqKm} onChange={e => setCatchmentAreaSqKm(e.target.value === '' ? '' : Number(e.target.value))} className={`w-full border rounded-lg px-3 py-2 text-xs ${t.input}`} />
            </div>
            <div>
              <label className={t.label}>ANNUAL RAINFALL (MM/YEAR)</label>
              <input type="number" value={rainfallMm} onChange={e => setRainfallMm(e.target.value === '' ? '' : Number(e.target.value))} className={`w-full border rounded-lg px-3 py-2 text-xs ${t.input}`} />
            </div>
            <div>
              <label className={t.label}>NRCS CURVE NUMBER (CN)</label>
              <input type="number" value={curveNumber} onChange={e => setCurveNumber(e.target.value === '' ? '' : Number(e.target.value))} className={`w-full border rounded-lg px-3 py-2 text-xs ${t.input}`} />
            </div>
          </div>
        </div>

        <div className={t.card}>
          <h2 className={t.header}>🌊 Flow Length & Topography</h2>
          <div className="space-y-3">
            <div>
              <label className={t.label}>MAIN CHANNEL LENGTH (KM)</label>
              <input type="number" value={flowLengthKm} onChange={e => setFlowLengthKm(e.target.value === '' ? '' : Number(e.target.value))} className={`w-full border rounded-lg px-3 py-2 text-xs ${t.input}`} />
            </div>
            <div>
              <label className={t.label}>ELEVATION DROP (M)</label>
              <input type="number" value={elevationDropM} onChange={e => setElevationDropM(e.target.value === '' ? '' : Number(e.target.value))} className={`w-full border rounded-lg px-3 py-2 text-xs ${t.input}`} />
            </div>
            <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-800/60">
              <span className="text-[10px] text-slate-400 block font-medium">ESTIMATED CHANNEL SLOPE</span>
              <div className="text-lg font-bold text-sky-400 mt-0.5">{(slope * 100).toFixed(2)}%</div>
            </div>
          </div>
        </div>

        <div className={t.card}>
          <h2 className={t.header}>📊 Hydrological Summary</h2>
          <div className="space-y-3 text-xs">
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
              <span className="text-slate-400 block text-[10px]">TIME OF CONCENTRATION (Tc)</span>
              <div className="text-xl font-bold text-amber-400 mt-1">{timeOfConcentrationHrs.toFixed(2)} <span className="text-xs font-normal text-slate-400">hours</span></div>
            </div>
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
              <span className="text-slate-400 block text-[10px]">EFFECTIVE RUNOFF DEPTH (Q)</span>
              <div className="text-xl font-bold text-emerald-400 mt-1">{effectiveRainfall.toFixed(1)} <span className="text-xs font-normal text-slate-400">mm</span></div>
            </div>
          </div>
        </div>
      </div>

      <div className={t.card}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">💧 Annual Water Yield & Reservoir Inflow Analysis</h2>
          <span className="text-xs bg-sky-950/80 border border-sky-800 text-sky-400 px-3 py-1 rounded-full font-medium">Integrated Streamflow Linked to SPIS</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-xl">
            <span className="text-[11px] text-slate-400 block font-medium">TOTAL ANNUAL RUNOFF VOLUME</span>
            <div className="text-2xl font-bold text-emerald-400 mt-1">{(annualRunoffVolumeM3 / 1000000).toFixed(2)} <span className="text-xs font-normal text-slate-400">Million m³/year</span></div>
          </div>
          <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-xl">
            <span className="text-[11px] text-slate-400 block font-medium">AVERAGE DAILY STREAMFLOW</span>
            <div className="text-2xl font-bold text-sky-400 mt-1">{averageDailyFlowM3.toFixed(1)} <span className="text-xs font-normal text-slate-400">m³/day</span></div>
          </div>
          <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-xl">
            <span className="text-[11px] text-slate-400 block font-medium">RETENTION PARAMETER (S)</span>
            <div className="text-2xl font-bold text-amber-400 mt-1">{sRetention.toFixed(1)} <span className="text-xs font-normal text-slate-400">mm</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
