import React, { useState } from 'react';
import SoilSalinityModule from './SoilSalinityModule';
import FarmPlanningModule from './FarmPlanningModule';

export function IrrigationDashboard() {
  const [activeTab, setActiveTab] = useState<
    'spis' | 'gis' | 'weather' | 'typhoon' | 'phivolcs' | 'watershed' | 'land' | 'soil' | 'farmPlan'
  >('spis');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

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
          <button
            onClick={() => setActiveTab('spis')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeTab === 'spis' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-300 hover:bg-slate-800/50'}`}
          >
            🌱 SPIS Irrigation
          </button>
          <button
            onClick={() => setActiveTab('gis')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeTab === 'gis' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-300 hover:bg-slate-800/50'}`}
          >
            🗺️ GIS Spatial & DEM
          </button>
          <button
            onClick={() => setActiveTab('weather')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeTab === 'weather' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-300 hover:bg-slate-800/50'}`}
          >
            🌦️ Weather & Climate
          </button>
          <button
            onClick={() => setActiveTab('typhoon')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeTab === 'typhoon' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-300 hover:bg-slate-800/50'}`}
          >
            🌀 PAGASA Typhoon & PAR
          </button>
          <button
            onClick={() => setActiveTab('phivolcs')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeTab === 'phivolcs' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-300 hover:bg-slate-800/50'}`}
          >
            🌋 PHIVOLCS Geohazard & Faults
          </button>
          <button
            onClick={() => setActiveTab('watershed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeTab === 'watershed' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-300 hover:bg-slate-800/50'}`}
          >
            📐 Watershed (NRCS CN)
          </button>
          <button
            onClick={() => setActiveTab('land')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeTab === 'land' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-300 hover:bg-slate-800/50'}`}
          >
            🌾 Land Suitability
          </button>
          <button
            onClick={() => setActiveTab('soil')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeTab === 'soil' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-300 hover:bg-slate-800/50'}`}
          >
            🧪 Soil Salinity & Leaching
          </button>
          <button
            onClick={() => setActiveTab('farmPlan')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeTab === 'farmPlan' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-300 hover:bg-slate-800/50'}`}
          >
            📍 Farm Planning & Survey
          </button>
        </div>

        {/* Tab Content Panels */}
        {activeTab === 'spis' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* Panel 1: Regional Climate & Crops */}
            <div className={`p-5 rounded-xl border ${theme === 'dark' ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'} space-y-4`}>
              <h3 className="text-xs font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-1.5">
                🌱 Regional Climate & Crops
              </h3>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">ACTIVE SITE & REGION</label>
                <select
                  value={regionPreset}
                  onChange={(e) => setRegionPreset(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-xs rounded-lg p-2 text-slate-200 focus:border-emerald-500 focus:outline-none"
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
                  className="w-full bg-slate-950 border border-slate-700 text-xs rounded-lg p-2 text-slate-200 focus:border-emerald-500 focus:outline-none"
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
                  <input
                    type="number"
                    value={temp}
                    onChange={(e) => setTemp(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 text-xs rounded-lg p-2 text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">SOLAR (MJ)</label>
                  <input
                    type="number"
                    value={solarRad}
                    onChange={(e) => setSolarRad(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 text-xs rounded-lg p-2 text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">PHENOLOGICAL STAGE (Kc)</label>
                <select
                  value={phenologicalStage}
                  onChange={(e) => setPhenologicalStage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-xs rounded-lg p-2 text-slate-200"
                >
                  <option value="Initial Stage (Kc: 1.05)">Initial Stage (Kc: 1.05)</option>
                  <option value="Mid-Season Stage (Kc: 1.2)">Mid-Season Stage (Kc: 1.2)</option>
                  <option value="Late Season Stage (Kc: 0.9)">Late Season Stage (Kc: 0.9)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">SOIL PROFILE & TEXTURE</label>
                <select
                  value={soilProfile}
                  onChange={(e) => setSoilProfile(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-xs rounded-lg p-2 text-slate-200"
                >
                  <option value="Heavy Clay (AWHC: 180 mm/m)">Heavy Clay (AWHC: 180 mm/m)</option>
                  <option value="Sandy Loam (AWHC: 120 mm/m)">Sandy Loam (AWHC: 120 mm/m)</option>
                  <option value="Angeles Fine Sand / Lahar (AWHC: 95 mm/m)">Angeles Fine Sand / Lahar (AWHC: 95 mm/m)</option>
                  <option value="Candaba Silty Clay (AWHC: 190 mm/m)">Candaba Silty Clay (AWHC: 190 mm/m)</option>
                </select>
              </div>
            </div>

            {/* Panel 2: Irrigation Method & Hydraulics */}
            <div className={`p-5 rounded-xl border ${theme === 'dark' ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'} space-y-4`}>
              <h3 className="text-xs font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-1.5">
                💧 Irrigation Method & Hydraulics
              </h3>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">APPLICATION METHOD</label>
                <select
                  value={appMethod}
                  onChange={(e) => setAppMethod(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-xs rounded-lg p-2 text-slate-200"
                >
                  <option value="Surface Flooding (45% Eff)">Surface Flooding (45% Eff)</option>
                  <option value="Sprinkler Irrigation (75% Eff)">Sprinkler Irrigation (75% Eff)</option>
                  <option value="Drip Irrigation (90% Eff)">Drip Irrigation (90% Eff)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">FLOW (L/s)</label>
                  <input
                    type="number"
                    value={flowRate}
                    onChange={(e) => setFlowRate(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 text-xs rounded-lg p-2 text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">STATIC LIFT (M)</label>
                  <input
                    type="number"
                    value={staticLift}
                    onChange={(e) => setStaticLift(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 text-xs rounded-lg p-2 text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">LENGTH (M)</label>
                  <input
                    type="number"
                    value={pipeLength}
                    onChange={(e) => setPipeLength(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 text-xs rounded-lg p-2 text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">DIAM (MM)</label>
                  <input
                    type="number"
                    value={pipeDiam}
                    onChange={(e) => setPipeDiam(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 text-xs rounded-lg p-2 text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">OPERATING PRES (M)</label>
                  <input
                    type="number"
                    value={opPress}
                    onChange={(e) => setOpPress(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 text-xs rounded-lg p-2 text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">PUMP EFF (%)</label>
                  <input
                    type="number"
                    value={pumpEff}
                    onChange={(e) => setPumpEff(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 text-xs rounded-lg p-2 text-slate-200"
                  />
                </div>
              </div>
            </div>

            {/* Panel 3: SPIS Solar PV Sizing */}
            <div className={`p-5 rounded-xl border ${theme === 'dark' ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'} space-y-4`}>
              <h3 className="text-xs font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-1.5">
                ☀️ SPIS Solar PV Sizing
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">PEAK SUN HOURS</label>
                  <input
                    type="number"
                    value={peakSunHours}
                    onChange={(e) => setPeakSunHours(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 text-xs rounded-lg p-2 text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">SAFETY FACTOR</label>
                  <input
                    type="number"
                    value={safetyFactor}
                    onChange={(e) => setSafetyFactor(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 text-xs rounded-lg p-2 text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">PANEL WATTAGE</label>
                <select
                  value={panelWattage}
                  onChange={(e) => setPanelWattage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-xs rounded-lg p-2 text-slate-200"
                >
                  <option value="350W Monocrystalline">350W Monocrystalline</option>
                  <option value="550W High-Efficiency Monocrystalline">550W High-Efficiency Monocrystalline</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">BUS VOLTAGE</label>
                <select
                  value={busVoltage}
                  onChange={(e) => setBusVoltage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-xs rounded-lg p-2 text-slate-200"
                >
                  <option value="48V DC Bus">48V DC Bus</option>
                  <option value="380V High-Voltage VFD Inverter">380V High-Voltage VFD Inverter</option>
                </select>
              </div>

              <div className="pt-2 border-t border-slate-800 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Solar Array:</span>
                  <span className="text-emerald-400 font-bold">0.35 kWp</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Panel Units Needed:</span>
                  <span className="text-emerald-400 font-bold">1 units (350W)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Recommended VFD:</span>
                  <span className="text-emerald-400 font-bold">0.25 kW</span>
                </div>
              </div>
            </div>

            {/* Panel 4: System Outputs & Savings */}
            <div className={`p-5 rounded-xl border ${theme === 'dark' ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'} space-y-4`}>
              <h3 className="text-xs font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-1.5">
                📊 System Outputs & Savings
              </h3>

              <div className="space-y-3 text-xs bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-400">Gross Crop Demand:</span>
                  <span className="text-emerald-400 font-bold">35.40 mm/day</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Dynamic Head:</span>
                  <span className="text-slate-200 font-bold">22.1 m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Daily Pumping Yield:</span>
                  <span className="text-slate-200 font-bold">93.6 m³/day</span>
                </div>
                <div className="flex justify-between border-t border-slate-800 pt-2">
                  <span className="text-slate-400">Annual Diesel Savings:</span>
                  <span className="text-emerald-400 font-bold">₱4,373</span>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">DIESEL PRICE (PHP/L)</label>
                <input
                  type="number"
                  value={dieselPrice}
                  onChange={(e) => setDieselPrice(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 text-xs rounded-lg p-2 text-slate-200"
                />
              </div>
            </div>

          </div>
        )}

        {/* Other Tab Renderers */}
        {activeTab === 'gis' && (
          <div className="p-8 bg-slate-900/60 border border-slate-800 rounded-xl space-y-4">
            <h2 className="text-lg font-bold text-emerald-400">🗺️ GIS Spatial & DEM Topographic Analysis</h2>
            <p className="text-xs text-slate-400">Digital Elevation Model (DEM) slope mapping, catchment delineations, and Philippine soil series overlays active.</p>
          </div>
        )}

        {activeTab === 'weather' && (
          <div className="p-8 bg-slate-900/60 border border-slate-800 rounded-xl space-y-4">
            <h2 className="text-lg font-bold text-emerald-400">🌦️ PAGASA Weather & Climate Monitoring</h2>
            <p className="text-xs text-slate-400">Real-time PAGASA climatological normal values and rainfall tracking for Region III, IV-A, and nationwide zones.</p>
          </div>
        )}

        {activeTab === 'typhoon' && (
          <div className="p-8 bg-slate-900/60 border border-slate-800 rounded-xl space-y-4">
            <h2 className="text-lg font-bold text-emerald-400">🌀 PAGASA Typhoon & Philippine Area of Responsibility (PAR)</h2>
            <p className="text-xs text-slate-400">Live tropical cyclone tracking, wind signal impact warnings, and agricultural risk mitigation advisories.</p>
          </div>
        )}

        {activeTab === 'phivolcs' && (
          <div className="p-8 bg-slate-900/60 border border-slate-800 rounded-xl space-y-4">
            <h2 className="text-lg font-bold text-emerald-400">🌋 PHIVOLCS Geohazard & Active Fault Lines</h2>
            <p className="text-xs text-slate-400">Volcanic hazard zones, lahar flow path modeling (Pinatubo/Mayon), and active earthquake fault line proximity checks.</p>
          </div>
        )}

        {activeTab === 'watershed' && (
          <div className="p-8 bg-slate-900/60 border border-slate-800 rounded-xl space-y-4">
            <h2 className="text-lg font-bold text-emerald-400">📐 Watershed Hydrology (NRCS Curve Number Method)</h2>
            <p className="text-xs text-slate-400">Runoff curve number computations, time of concentration, and peak discharge estimation for agricultural catchments.</p>
          </div>
        )}

        {activeTab === 'land' && (
          <div className="p-8 bg-slate-900/60 border border-slate-800 rounded-xl space-y-4">
            <h2 className="text-lg font-bold text-emerald-400">🌾 Land Suitability Evaluation Engine</h2>
            <p className="text-xs text-slate-400">FAO Framework for Land Evaluation: crop suitability rating (S1, S2, S3, N) based on soil depth, drainage, and slope.</p>
          </div>
        )}

        {activeTab === 'soil' && <SoilSalinityModule />}

        {activeTab === 'farmPlan' && <FarmPlanningModule />}

      </div>
    </div>
  );
}

export default IrrigationDashboard;
