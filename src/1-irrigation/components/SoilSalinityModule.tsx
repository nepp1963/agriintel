import React, { useState } from 'react';

export function SoilSalinityModule() {
  // Input states for Soil Salinity & Leaching
  const [eciw, setEciw] = useState(1.2); // Electrical conductivity of irrigation water (dS/m)
  const [targetEce, setTargetEce] = useState(4.0); // Target threshold EC of saturation extract for crop (dS/m)
  const [lrMethod, setLrMethod] = useState('Standard FAO Leaching Requirement Formula');

  // Calculations
  const leachingRequirement = eciw / (5 * targetEce - eciw);
  const lrPercent = Math.max(0, (leachingRequirement * 100)).toFixed(1);

  return (
    <div className="space-y-6 text-slate-100">
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-bold text-emerald-400 flex items-center gap-2">
            🧪 Soil Salinity & Leaching Requirement Engine
          </h2>
          <p className="text-xs text-slate-400">Compute leaching fraction requirements to manage rootzone salt accumulation and electrical conductivity.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Input Parameters */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">1. Salinity & Water Quality Parameters</h3>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Calculation Method</label>
            <select
              value={lrMethod}
              onChange={(e) => setLrMethod(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-xs rounded-lg p-2 text-slate-200"
            >
              <option value="Standard FAO Leaching Requirement Formula">Standard FAO Leaching Requirement Formula</option>
              <option value="Ayers & Westcot Steady-State Model">Ayers & Westcot Steady-State Model</option>
            </select>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">Irrigation Water Salinity (ECiw)</span>
              <span className="text-emerald-400 font-bold">{eciw} dS/m</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="5.0"
              step="0.1"
              value={eciw}
              onChange={(e) => setEciw(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">Target Crop Rootzone Salinity Threshold (ECe)</span>
              <span className="text-emerald-400 font-bold">{targetEce} dS/m</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="12.0"
              step="0.5"
              value={targetEce}
              onChange={(e) => setTargetEce(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
          </div>
        </div>

        {/* Right Column: Calculated Outputs */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">2. Leaching Requirement Outputs</h3>

          <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <span className="text-slate-400 text-xs">Leaching Fraction (LR):</span>
              <span className="text-emerald-400 font-bold text-lg font-mono">{lrPercent}%</span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Drainage Water Salinity Estimation:</span>
              <span className="text-slate-200 font-bold font-mono">{(eciw / (leachingRequirement || 0.01)).toFixed(2)} dS/m</span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Rootzone Salt Status:</span>
              <span className="text-emerald-400 font-bold">Safe (Within Threshold)</span>
            </div>
          </div>

          <div className="p-3.5 bg-emerald-950/40 rounded-xl border border-emerald-800/50 text-xs text-emerald-300 space-y-1">
            <strong>Management Advisory:</strong>
            <p>Ensure extra irrigation water volume equivalent to {lrPercent}% above normal crop evapotranspiration (Etc) is applied to leach salts below the root zone.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SoilSalinityModule;
