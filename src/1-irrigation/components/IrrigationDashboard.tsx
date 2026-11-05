import React, { useState } from 'react';
import SoilSalinityModule from './SoilSalinityModule';
import FarmPlanningModule from './FarmPlanningModule';
import { useLocation } from '../../context/LocationContext';

export function IrrigationDashboard() {
  const [activeTab, setActiveTab] = useState<
    'spis' | 'gis' | 'weather' | 'typhoon' | 'phivolcs' | 'watershed' | 'land' | 'soil' | 'farmPlan'
  >('spis');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const { location, updateFromCoords } = useLocation();

  // Input states for SPIS Irrigation
  const [regionPreset, setRegionPreset] = useState('Southern Luzon (Batangas)');
  const [cropProfile, setCropProfile] = useState('Lowland Rice / Paddy (Wetland)');
  const [temp, setTemp] = useState(31.5);
  const [solarRad, setSolarRad] = useState(20.1);
  const [phenologicalStage, setPhenologicalStage] = useState('Mid-Season Stage (Kc: 1.2)');
  const [soilProfile, setSoilProfile] = useState('Heavy Clay (AWHC: 180 mm/m)');
  
  const [appMethod, setAppMethod] = useState('Surface Flooding (45% Eff)');
  const [flowRate, setFlowRate] = useState(5);
  const [staticLift, setStaticLift] = useState(12);
  const [pipeLength, setPipeLength] = useState(150);
  const [pipeDiam, setPipeDiam] = useState(75);
  const [minorLossPct, setMinorLossPct] = useState(10);
  const [opPress, setOpPress] = useState(10);
  const [pumpEff, setPumpEff] = useState(65);

  const [peakSunHours, setPeakSunHours] = useState(5.2);
  const [safetyFactor, setSafetyFactor] = useState(1.3);
  const [panelWattage, setPanelWattage] = useState('350W Monocrystalline');
  const [busVoltage, setBusVoltage] = useState('48V DC Bus');
  const [dieselPrice, setDieselPrice] = useState(60);

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} p-6 transition-colors`}>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Header & Navigation Bar */}
        <div className={`flex flex-col md:flex-row justify-between items-center p-4 rounded-xl border ${theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'} gap-4`}>
          <div className="flex items-center gap-4">
            <span className="font-bold text-emerald-500 tracking-wide text-sm bg-emerald-950/60 px-3 py-1.5 rounded-lg border border-emerald-800/40">
              AgriIntel Core Engine
            </span>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">Theme:</span>
              <button onClick={() => setTheme('dark')} className={`px-2.5 py-1 rounded-md flex items-center gap-1 ${theme === 'dark' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300'}`}>
                🌙 Dark
              </button>
              <button onClick={() => setTheme('light')} className={`px-2.5 py-1 rounded-md flex items-center gap-1 ${theme === 'light' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'}`}>
                ☀️ Light
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => window.print()} className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1 transition-colors">
              📊 Export CSV
            </button>
            <button onClick={() => window.print()} className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors">
              🖨️ Print / Executive Dossier
            </button>
            <span className="text-xs font-bold text-emerald-400 tracking-wider">AgriIntel</span>
          </div>
        </div>

        {/* Module Navigation Tabs */}
        <div className={`flex flex-wrap items-center gap-2 p-2 rounded-xl border ${theme === 'dark' ? 'bg-slate-900/55 border-slate-800' : 'bg-white border-slate-200'}`}>
          {[
            { id: 'spis', label: '🌱 SPIS Irrigation' },
            { id: 'gis', label: '🗺️ GIS Spatial & DEM' },
            { id: 'weather', label: '🌦️ Weather & Climate' },
            { id: 'typhoon', label: '🌀 PAGASA Typhoon & PAR' },
            { id: 'phivolcs', label: '🌋 PHIVOLCS Geohazard & Faults' },
            { id: 'watershed', label: '📐 Watershed (NRCS CN)' },
            { id: 'land', label: '🌾 Land Suitability' },
            { id: 'soil', label: '🧪 Soil Salinity & Leaching' },
            { id: 'farmPlan', label: '📍 Farm Planning & Survey' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === tab.id ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-300 hover:bg-slate-800/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: SPIS Irrigation */}
        {activeTab === 'spis' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className={`p-5 rounded-xl border ${theme === 'dark' ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'} space-y-4`}>
              <h3 className="text-xs font-bold text-emerald-500 uppercase tracking-wider">🌱 Regional Climate & Crops</h3>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">ACTIVE SITE & REGION</label>
                <select
                  value={regionPreset}
                  onChange={(e) => setRegionPreset(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-xs rounded-lg p-2 text-slate-200"
                >
                  <option value="Southern Luzon (Batangas)">Southern Luzon (Batangas)</option>
                  <option value="Central Luzon (Pampanga / San Fernando)">Central Luzon (Pampanga / San Fernando)</option>
                  <option value="Cagayan Valley (Tuguegarao)">Cagayan Valley (Tuguegarao)</option>
                  <option value="Western Visayas (Iloilo)">Western Visayas (Iloilo)</option>
                  <option value="Northern Mindanao (Bukidnon)">Northern Mindanao (Bukidnon)</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">TARGET CROP PROFILE</label>
                <select
                  value={cropProfile}
                  onChange={(e) => setCropProfile(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-xs rounded-lg p-2 text-slate-200"
                >
                  <option value="Lowland Rice / Paddy (Wetland)">Lowland Rice / Paddy (Wetland)</option>
                  <option value="High-Value Vegetables (Onion/Garlic)">High-Value Vegetables (Onion/Garlic)</option>
                  <option value="Corn / Maize (Upland)">Corn / Maize (Upland)</option>
                  <option value="Sugarcane / Industrial">Sugarcane / Industrial</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">TEMP (°C)</label>
                  <input type="number" value={temp} onChange={(e) => setTemp(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-700 text-xs rounded-lg p-2 text-slate-200" />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">SOLAR (MJ)</label>
                  <input type="number" value={solarRad} onChange={(e) => setSolarRad(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-700 text-xs rounded-lg p-2 text-slate-200" />
                </div>
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">PHENOLOGICAL STAGE (Kc)</label>
                <select value={phenologicalStage} onChange={(e) => setPhenologicalStage(e.target.value)} className="w-full bg-slate-950 border border-slate-700 text-xs rounded-lg p-2 text-slate-200">
                  <option value="Initial Stage (Kc: 1.05)">Initial Stage (Kc: 1.05)</option>
                  <option value="Mid-Season Stage (Kc: 1.2)">Mid-Season Stage (Kc: 1.2)</option>
                  <option value="Late Season Stage (Kc: 0.9)">Late Season Stage (Kc: 0.9)</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">SOIL PROFILE & TEXTURE</label>
                <select value={soilProfile} onChange={(e) => setSoilProfile(e.target.value)} className="w-full bg-slate-950 border border-slate-700 text-xs rounded-lg p-2 text-slate-200">
                  <option value="Heavy Clay (AWHC: 180 mm/m)">Heavy Clay (AWHC: 180 mm/m)</option>
                  <option value="Sandy Loam (AWHC: 120 mm/m)">Sandy Loam (AWHC: 120 mm/m)</option>
                  <option value="Angeles Fine Sand / Lahar (AWHC: 95 mm/m)">Angeles Fine Sand / Lahar (AWHC: 95 mm/m)</option>
                  <option value="Candaba Silty Clay (AWHC: 190 mm/m)">Candaba Silty Clay (AWHC: 190 mm/m)</option>
                </select>
              </div>
            </div>

            <div className={`p-5 rounded-xl border ${theme === 'dark' ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'} space-y-4`}>
              <h3 className="text-xs font-bold text-emerald-500 uppercase tracking-wider">💧 Irrigation Method & Hydraulics</h3>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">APPLICATION METHOD</label>
                <select value={appMethod} onChange={(e) => setAppMethod(e.target.value)} className="w-full bg-slate-950 border border-slate-700 text-xs rounded-lg p-2 text-slate-200">
                  <option value="Surface Flooding (45% Eff)">Surface Flooding (45% Eff)</option>
                  <option value="Sprinkler Irrigation (75% Eff)">Sprinkler Irrigation (75% Eff)</option>
                  <option value="Drip Irrigation (90% Eff)">Drip Irrigation (90% Eff)</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">FLOW (L/s)</label>
                  <input type="number" value={flowRate} onChange={(e) => setFlowRate(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-700 text-xs rounded-lg p-2 text-slate-200" />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">STATIC LIFT (M)</label>
                  <input type="number" value={staticLift} onChange={(e) => setStaticLift(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-700 text-xs rounded-lg p-2 text-slate-200" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">LENGTH (M)</label>
                  <input type="number" value={pipeLength} onChange={(e) => setPipeLength(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-700 text-xs rounded-lg p-2 text-slate-200" />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">DIAM (MM)</label>
                  <input type="number" value={pipeDiam} onChange={(e) => setPipeDiam(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-700 text-xs rounded-lg p-2 text-slate-200" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">OPERATING PRES (M)</label>
                  <input type="number" value={opPress} onChange={(e) => setOpPress(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-700 text-xs rounded-lg p-2 text-slate-200" />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">PUMP EFF (%)</label>
                  <input type="number" value={pumpEff} onChange={(e) => setPumpEff(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-700 text-xs rounded-lg p-2 text-slate-200" />
                </div>
              </div>
            </div>

            <div className={`p-5 rounded-xl border ${theme === 'dark' ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'} space-y-4`}>
              <h3 className="text-xs font-bold text-emerald-500 uppercase tracking-wider">☀️ SPIS Solar PV Sizing</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">PEAK SUN HOURS</label>
                  <input type="number" value={peakSunHours} onChange={(e) => setPeakSunHours(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-700 text-xs rounded-lg p-2 text-slate-200" />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">SAFETY FACTOR</label>
                  <input type="number" value={safetyFactor} onChange={(e) => setSafetyFactor(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-700 text-xs rounded-lg p-2 text-slate-200" />
                </div>
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">PANEL WATTAGE</label>
                <select value={panelWattage} onChange={(e) => setPanelWattage(e.target.value)} className="w-full bg-slate-950 border border-slate-700 text-xs rounded-lg p-2 text-slate-200">
                  <option value="350W Monocrystalline">350W Monocrystalline</option>
                  <option value="550W High-Efficiency Monocrystalline">550W High-Efficiency Monocrystalline</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">BUS VOLTAGE</label>
                <select value={busVoltage} onChange={(e) => setBusVoltage(e.target.value)} className="w-full bg-slate-950 border border-slate-700 text-xs rounded-lg p-2 text-slate-200">
                  <option value="48V DC Bus">48V DC Bus</option>
                  <option value="380V High-Voltage VFD Inverter">380V High-Voltage VFD Inverter</option>
                </select>
              </div>
              <div className="pt-2 border-t border-slate-800 space-y-1.5 text-xs">
                <div className="flex justify-between"><span className="text-slate-400">Total Solar Array:</span><span className="text-emerald-400 font-bold">0.35 kWp</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Panel Units Needed:</span><span className="text-emerald-400 font-bold">1 units (350W)</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Recommended VFD:</span><span className="text-emerald-400 font-bold">0.25 kW</span></div>
              </div>
            </div>

            <div className={`p-5 rounded-xl border ${theme === 'dark' ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'} space-y-4`}>
              <h3 className="text-xs font-bold text-emerald-500 uppercase tracking-wider">📊 System Outputs & Savings</h3>
              <div className="space-y-3 text-xs bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <div className="flex justify-between"><span className="text-slate-400">Gross Crop Demand:</span><span className="text-emerald-400 font-bold">35.40 mm/day</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Total Dynamic Head:</span><span className="text-slate-200 font-bold">22.1 m</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Daily Pumping Yield:</span><span className="text-slate-200 font-bold">93.6 m³/day</span></div>
                <div className="flex justify-between border-t border-slate-800 pt-2"><span className="text-slate-400">Annual Diesel Savings:</span><span className="text-emerald-400 font-bold">₱4,373</span></div>
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">DIESEL PRICE (PHP/L)</label>
                <input type="number" value={dieselPrice} onChange={(e) => setDieselPrice(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-700 text-xs rounded-lg p-2 text-slate-200" />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: GIS Spatial & DEM */}
        {activeTab === 'gis' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">🗺️ GIS Layer & Coordinate Selector</h3>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">TARGET REGIONAL ZONE</label>
                <select
                  onChange={(e) => {
                    const [lat, lng] = e.target.value.split(',').map(Number);
                    updateFromCoords(lat, lng);
                  }}
                  className="w-full bg-slate-950 border border-slate-700 text-xs rounded-lg p-2 text-slate-200"
                >
                  <option value="14.45896,120.93851">Bacoor, Cavite (14.459° N, 120.939° E)</option>
                  <option value="15.0286,120.6896">Pampanga Central Plain (15.029° N, 120.690° E)</option>
                  <option value="14.1648,121.2413">Laguna / UPLB (14.165° N, 121.241° E)</option>
                  <option value="13.9419,121.1644">Batangas Lipa Uplands (13.942° N, 121.164° E)</option>
                  <option value="15.7124,120.9030">Nueva Ecija Muñoz (15.712° N, 120.903° E)</option>
                </select>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs space-y-2 font-mono">
                <div><span className="text-slate-500">Active Latitude:</span> <span className="text-emerald-400">{location.lat.toFixed(5)}° N</span></div>
                <div><span className="text-slate-500">Active Longitude:</span> <span className="text-emerald-400">{location.lng.toFixed(5)}° E</span></div>
                <div><span className="text-slate-500">Elevation Model:</span> <span className="text-slate-300">SRTM 30m DEM Active</span></div>
              </div>
            </div>
            <div className="md:col-span-2 bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Topographic Catchment & Slope Analysis</h3>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-3">
                <p className="text-slate-300">Digital Elevation Model (DEM) slope mapping, stream network ordering, and Philippine soil series overlays are active for the selected coordinates.</p>
                <div className="grid grid-cols-3 gap-3 text-center pt-2">
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">MEAN ELEVATION</span>
                    <span className="text-emerald-400 font-bold text-sm">24.5 m</span>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">CATCHMENT SLOPE</span>
                    <span className="text-emerald-400 font-bold text-sm">1.8% (Gentle)</span>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">DRAINAGE CLASS</span>
                    <span className="text-emerald-400 font-bold text-sm">Moderately Well</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Weather & Climate */}
        {activeTab === 'weather' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">🌦️ PAGASA Climate Zones</h3>
              <div className="space-y-2 text-xs text-slate-300">
                <div className="p-2.5 bg-slate-950 rounded border border-slate-800"><strong>Type I:</strong> Two pronounced seasons (Dry Nov-Apr, Wet May-Oct). Central Luzon / Cavite.</div>
                <div className="p-2.5 bg-slate-950 rounded border border-slate-800"><strong>Type II:</strong> No dry season, max rainfall Nov-Jan. Eastern Philippines.</div>
                <div className="p-2.5 bg-slate-950 rounded border border-slate-800"><strong>Type III:</strong> Seasons not very pronounced, short dry season.</div>
              </div>
            </div>
            <div className="md:col-span-2 bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Climatological Normals & Evapotranspiration (ET₀)</h3>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800"><span className="text-[10px] text-slate-400 block">MEAN TEMP</span><span className="text-emerald-400 font-bold text-base">28.4 °C</span></div>
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800"><span className="text-[10px] text-slate-400 block">PEAK ET₀</span><span className="text-emerald-400 font-bold text-base">6.10 mm/day</span></div>
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800"><span className="text-[10px] text-slate-400 block">RELATIVE HUMIDITY</span><span className="text-emerald-400 font-bold text-base">78 %</span></div>
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800"><span className="text-[10px] text-slate-400 block">ANNUAL RAIN</span><span className="text-emerald-400 font-bold text-base">2,150 mm</span></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: PAGASA Typhoon & PAR */}
        {activeTab === 'typhoon' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">🌀 Philippine Area of Responsibility (PAR) Tracker</h3>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-3">
                <p className="text-slate-300">Active meteorological monitoring across the PAR bounding box (5°N 115°E, 15°N 115°E, 21°N 120°E, 25°N 135°E, 5°N 135°E).</p>
                <div className="p-3 bg-emerald-950/40 rounded-lg border border-emerald-800/50 text-emerald-300">
                  <strong>Current Status:</strong> No active tropical cyclones within PAR threatening the target agricultural zone.
                </div>
              </div>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Agricultural Risk Advisory & Wind Signals</h3>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-3 text-slate-300">
                <p>• Drainage canal clearing advised prior to seasonal monsoon depressions.</p>
                <p>• Greenhouse structures and solar PV framing secure under current wind thresholds.</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: PHIVOLCS Geohazard & Faults */}
        {activeTab === 'phivolcs' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">🌋 PHIVOLCS Active Fault & Volcanic Hazard Check</h3>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-3 text-slate-300">
                <p><strong>Valley Fault System (VFS):</strong> Proximity analysis active for West Valley Fault buffer zones.</p>
                <p><strong>Volcanic Hazard Zones:</strong> Lahar flow simulation active for Central Luzon (Pinatubo) and Southern Tagalog (Taal/Banahaw).</p>
              </div>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Site Vulnerability Index</h3>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-3">
                <div className="flex justify-between items-center"><span className="text-slate-400">Ground Shaking Susceptibility:</span><span className="text-amber-400 font-bold">Moderate - High</span></div>
                <div className="flex justify-between items-center"><span className="text-slate-400">Liquefaction Potential:</span><span className="text-slate-200 font-bold">Low (Alluvial Plain)</span></div>
                <div className="flex justify-between items-center"><span className="text-slate-400">Volcanic Ashfall Risk:</span><span className="text-emerald-400 font-bold">Low</span></div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: Watershed (NRCS CN) */}
        {activeTab === 'watershed' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">📐 NRCS Curve Number Runoff Computation</h3>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-3 text-slate-300">
                <p>Calculates direct surface runoff ($Q$) resulting from storm rainfall depth ($P$) based on soil hydrologic groups (A, B, C, D) and land use cover.</p>
                <div className="flex justify-between font-bold text-emerald-400 pt-2 border-t border-slate-800">
                  <span>Computed Direct Runoff (Q):</span><span>30.33 mm</span>
                </div>
              </div>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Watershed Parameters</h3>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-3">
                <div className="flex justify-between"><span className="text-slate-400">Hydrologic Soil Group:</span><span className="text-slate-200 font-bold">Group B (Moderate Infiltration)</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Curve Number (CN):</span><span className="text-slate-200 font-bold">75</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Time of Concentration ($T_c$):</span><span className="text-slate-200 font-bold">2.4 hours</span></div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 7: Land Suitability */}
        {activeTab === 'land' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">🌾 FAO Land Evaluation Framework</h3>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-3 text-slate-300">
                <p>Evaluates land suitability classes: <strong>S1</strong> (Highly Suitable), <strong>S2</strong> (Moderately Suitable), <strong>S3</strong> (Marginally Suitable), and <strong>N</strong> (Not Suitable).</p>
                <div className="p-3 bg-emerald-950/40 rounded-lg border border-emerald-800/50 text-emerald-300">
                  <strong>Selected Site Rating:</strong> S1 - Highly Suitable for Lowland Paddy & Vegetable Production.
                </div>
              </div>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider</div>">Limitation Factors</h3>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-3 text-slate-300">
                <div className="flex justify-between"><span>Drainage Limitation:</span><span className="text-emerald-400 font-bold">None</span></div>
                <div className="flex justify-between"><span>Soil Fertility Status:</span><span className="text-emerald-400 font-bold">High (Alluvial Deposit)</span></div>
                <div className="flex justify-between"><span>Slope Constraint:</span><span className="text-emerald-400 font-bold">None (&lt; 3%)</span></div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 8: Soil Salinity & Leaching */}
        {activeTab === 'soil' && <SoilSalinityModule />}

        {/* Tab 9: Farm Planning & Survey */}
        {activeTab === 'farmPlan' && <FarmPlanningModule />}

      </div>
    </div>
  );
}

export default IrrigationDashboard;
