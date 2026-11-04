import React from 'react';
import { useLocation } from '../context/LocationContext';

export const WeatherPanel: React.FC = () => {
  const { location } = useLocation();

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-700 p-6 rounded-xl">
        <h2 className="text-xl font-bold text-white mb-2">Historical Weather, Rainfall & Typhoon Risk Profile</h2>
        <p className="text-slate-400 text-sm mb-4">
          Climatological records, annual historical rainfall frequency, and storm impacts for the selected region.
        </p>

        <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-lg flex justify-between items-center">
          <div>
            <span className="text-xs uppercase tracking-wider text-slate-400">Currently Selected Region Profile</span>
            <h3 className="text-lg font-semibold text-emerald-400 mt-1">{location.name}</h3>
            <p className="text-sm text-slate-300 mt-1">
              Climate Classification: <span className="font-medium text-white">{location.climateType}</span> | 
              Soil Series: <span className="font-medium text-white">{location.soilSeries}</span>
            </p>
          </div>
          <div className="text-right">
            <span className="inline-block px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold rounded-full">
              PAGASA {location.climateType} Zone
            </span>
          </div>
        </div>

        {/* Dynamic Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
            <span className="text-xs text-slate-400">ESTIMATED SOLAR RADIATION</span>
            <p className="text-xl font-bold text-white mt-1">{location.solarRad} <span className="text-xs font-normal text-slate-400">MJ/m²/day</span></p>
          </div>
          <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
            <span className="text-xs text-slate-400">TEMPERATURE RANGE</span>
            <p className="text-xl font-bold text-white mt-1">{location.tempMin}°C – {location.tempMax}°C</p>
          </div>
          <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
            <span className="text-xs text-slate-400">HYDROLOGIC SOIL GROUP</span>
            <p className="text-xl font-bold text-white mt-1">Group {location.hydrologicGroup} <span className="text-xs font-normal text-slate-400">(CN: {location.defaultCurveNumber})</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};
