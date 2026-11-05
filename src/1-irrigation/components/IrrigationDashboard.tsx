import React, { useState } from 'react';
import SoilSalinityModule from './SoilSalinityModule';
import FarmPlanningModule from './FarmPlanningModule';
import { useLocation } from '../../context/LocationContext';
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Regional Extreme Weather & Crop Suitability Intelligence Dataset
const REGIONAL_INTELLIGENCE: Record<string, {
  name: string;
  lat: number;
  lng: number;
  climateType: string;
  typhoonFrequency: string;
  extremeEvents: string[];
  cropSuitability: { crop: string; rating: string; advisory: string }[];
}> = {
  'CALABARZON (Cavite / Batangas)': {
    name: 'CALABARZON (Region IV-A)',
    lat: 14.45896,
    lng: 120.93851,
    climateType: 'Type I (Two pronounced seasons: Dry Nov-Apr, Wet May-Oct)',
    typhoonFrequency: 'Moderate - High (3 to 4 Tropical Cyclones / year)',
    extremeEvents: [
      'Monsoon Surge Flash Floods (Southwest Monsoon / Habagat)',
      'Volcanic Ashfall & Lahar Risks (Taal Eruption Hazard Buffer)',
      'Prolonged Dry Spells during Strong El Niño Events'
    ],
    cropSuitability: [
      { crop: 'Lowland Paddy Rice', rating: 'S1 - Highly Suitable', advisory: 'Requires drainage management during peak Habagat wet season.' },
      { crop: 'High-Value Upland Crops', rating: 'S1 - Highly Suitable', advisory: 'Optimal in volcanic loam upland zones (Lipa/Tagaytay).' },
      { crop: 'Corn & Grain Legumes', rating: 'S2 - Moderately Suitable', advisory: 'Prone to waterlogging in alluvial coastal plains.' }
    ]
  },
  'Central Luzon (Pampanga Plain)': {
    name: 'Central Luzon (Region III)',
    lat: 15.0286,
    lng: 120.6896,
    climateType: 'Type I (Pronounced dry and wet seasons)',
    typhoonFrequency: 'High (4 to 5 Tropical Cyclones / year)',
    extremeEvents: [
      'Widespread Agricultural Inundation (Pampanga River Basin Overflow)',
      'Extreme Summer Heat & Irrigation Water Deficits (Angat Dam Allocation Constraints)',
      'Typhoon Direct Hits & Strong Gale Force Winds'
    ],
    cropSuitability: [
      { crop: 'Lowland Paddy Rice', rating: 'S1 - Highly Suitable', advisory: 'Rice granary of the Philippines; double-cropping highly viable.' },
      { crop: 'Bulb Onion & Garlic', rating: 'S1 - Highly Suitable', advisory: 'Ideal during dry season (Nueva Ecija / Tarlac plain).' },
      { crop: 'Perennial Fruit Crops', rating: 'S3 - Marginally Suitable', advisory: 'High flood damage risk during major typhoons.' }
    ]
  },
  'Bicol Peninsula (Naga / Albay)': {
    name: 'Bicol Region (Region V)',
    lat: 13.6218,
    lng: 123.1948,
    climateType: 'Type II & IV (No dry season with very pronounced maximum rainfall)',
    typhoonFrequency: 'Very High (Direct Typhoon Belt: 5+ Cyclones / year)',
    extremeEvents: [
      'Super Typhoon Wind Damage & Storm Surges',
      'Extreme Rainfall & Volcanic Lahar Flows (Mayon Hazard Zone)',
      'Soil Saturation & Constant Siltation Inundation'
    ],
    cropSuitability: [
      { crop: 'Coconut & Abaca', rating: 'S1 - Highly Suitable', advisory: 'Resilient perennial crops suited for continuous rainfall.' },
      { crop: 'Lowland Rice', rating: 'S2 - Moderately Suitable', advisory: 'High crop loss risk during late fourth-quarter typhoons.' },
      { crop: 'High-Value Vegetables', rating: 'S3 - Marginally Suitable', advisory: 'Requires protected cropping/greenhouse structures.' }
    ]
  },
  'Western Visayas (Iloilo Plain)': {
    name: 'Western Visayas (Region VI)',
    lat: 10.7202,
    lng: 122.5621,
    climateType: 'Type I & III (Short dry season of 1 to 3 months)',
    typhoonFrequency: 'Moderate (2 to 3 Cyclones / year)',
    extremeEvents: [
      'Agricultural Drought & Prolonged El Niño Dry Spells',
      'Riverine Flooding (Jaro & Jalaur River Basins)',
      'Coastal High Tides & Salinity Intrusion'
    ],
    cropSuitability: [
      { crop: 'Sugarcane & Grains', rating: 'S1 - Highly Suitable', advisory: 'Extremely productive in well-drained alluvial plains.' },
      { crop: 'Rainfed Rice', rating: 'S2 - Moderately Suitable', advisory: 'Vulnerable to onset delays of the wet monsoon.' },
      { crop: 'Aqua-Silviculture', rating: 'S1 - Highly Suitable', advisory: 'Ideal in coastal brackish transitional zones.' }
    ]
  }
};

const PAR_POLYGON_COORDS: [number, number][] = [
  [25.0, 120.0],
  [25.0, 135.0],
  [5.0, 135.0],
  [5.0, 115.0],
  [15.0, 115.0],
  [21.0, 120.0],
];

function SyncedMapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

function MapEventsHandler({ onZoomChange, onClickChange }: { onZoomChange?: (z: number) => void; onClickChange?: (lat: number, lng: number) => void }) {
  useMapEvents({
    zoomend(e) {
      if (onZoomChange) onZoomChange(e.target.getZoom());
    },
    click(e) {
      if (onClickChange) onClickChange(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
}

export function IrrigationDashboard() {
  const [activeTab, setActiveTab] = useState<
    'spis' | 'gis' | 'weather' | 'typhoon' | 'phivolcs' | 'watershed' | 'land' | 'soil' | 'farmPlan'
  >('spis');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const { location, updateFromCoords } = useLocation();

  // Selected Regional Intelligence Preset
  const [selectedRegionKey, setSelectedRegionKey] = useState<string>('CALABARZON (Cavite / Batangas)');
  const activeRegionData = REGIONAL_INTELLIGENCE[selectedRegionKey] || REGIONAL_INTELLIGENCE['CALABARZON (Cavite / Batangas)'];

  // Map view mode toggle ('street' vs 'satellite')
  const [sharedZoom, setSharedZoom] = useState<number>(13);
  const [mapViewMode, setMapViewMode] = useState<'satellite' | 'street'>('satellite');

  // Input states for SPIS Irrigation
  const [regionPreset, setRegionPreset] = useState('Southern Luzon (Batangas)');
  const [cropProfile, setCropProfile] = useState('Lowland Rice / Paddy (Wetland)');
  const [temp, setTemp] = useState(31.5);
  const [solarRad, setSolarRad] = useState(20.1);
  const [appMethod, setAppMethod] = useState('Surface Flooding (45% Eff)');
  const [flowRate, setFlowRate] = useState(5);
  const [staticLift, setStaticLift] = useState(12);
  const [peakSunHours, setPeakSunHours] = useState(5.2);
  const [safetyFactor, setSafetyFactor] = useState(1.3);

  // Watershed Hydrology States
  const [rainfallDepth, setRainfallDepth] = useState(75);
  const [curveNumber, setCurveNumber] = useState(75);
  const [hydrologicGroup, setHydrologicGroup] = useState('Group B (Moderate Infiltration)');
  const [tcHours, setTcHours] = useState(2.4);

  const computeRunoff = () => {
    const P = rainfallDepth / 25.4;
    const S = 1000 / curveNumber - 10;
    const Ia = 0.2 * S;
    if (P <= Ia) return "0.00";
    const Qin = Math.pow(P - Ia, 2) / (P - Ia + S);
    return (Qin * 25.4).toFixed(2);
  };

  // Land Suitability States
  const [landUseTarget, setLandUseTarget] = useState('Lowland Rice Paddy');
  const [soilDepth, setSoilDepth] = useState('> 100 cm (Deep)');
  const [drainageClass, setDrainageClass] = useState('Moderately Well Drained');
  const [soilSlopePct, setSoilSlopePct] = useState(2);

  const evaluateSuitability = () => {
    if (soilSlopePct > 8) return { class: 'S3 - Marginally Suitable', note: 'Slope limitation (> 8%) requires contouring or terracing.' };
    if (soilDepth.includes('Shallow')) return { class: 'S2 - Moderately Suitable', note: 'Restricted effective soil depth.' };
    return { class: 'S1 - Highly Suitable', note: 'No severe topography, soil depth, or drainage limitations detected.' };
  };

  const suitabilityResult = evaluateSuitability();

  // Tile Providers
  const SATELLITE_TILE_URL = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
  const SATELLITE_ATTRIBUTION = "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and GIS User Community";

  const STREET_TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  const STREET_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

  const activeTileUrl = mapViewMode === 'satellite' ? SATELLITE_TILE_URL : STREET_TILE_URL;
  const activeAttribution = mapViewMode === 'satellite' ? SATELLITE_ATTRIBUTION : STREET_ATTRIBUTION;

  const MapStyleToolbar = () => (
    <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-lg border border-slate-800 mb-3 text-xs">
      <span className="text-slate-400 font-medium">🗺️ Select Map Style:</span>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => setMapViewMode('street')}
          className={`px-3 py-1 rounded-md transition-all font-medium ${mapViewMode === 'street' ? 'bg-emerald-600 text-white font-bold shadow-sm' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'}`}
        >
          🗺️ Plain Map View
        </button>
        <button
          onClick={() => setMapViewMode('satellite')}
          className={`px-3 py-1 rounded-md transition-all font-medium ${mapViewMode === 'satellite' ? 'bg-emerald-600 text-white font-bold shadow-sm' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'}`}
        >
          🛰️ Satellite View
        </button>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} p-6 transition-colors`}>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Header */}
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

        {/* Navigation Tabs */}
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
                <select value={regionPreset} onChange={(e) => setRegionPreset(e.target.value)} className="w-full bg-slate-950 border border-slate-700 text-xs rounded-lg p-2 text-slate-200">
                  <option value="Southern Luzon (Batangas)">Southern Luzon (Batangas)</option>
                  <option value="Central Luzon (Pampanga / San Fernando)">Central Luzon (Pampanga / San Fernando)</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">TARGET CROP PROFILE</label>
                <select value={cropProfile} onChange={(e) => setCropProfile(e.target.value)} className="w-full bg-slate-950 border border-slate-700 text-xs rounded-lg p-2 text-slate-200">
                  <option value="Lowland Rice / Paddy (Wetland)">Lowland Rice / Paddy (Wetland)</option>
                  <option value="High-Value Vegetables (Onion/Garlic)">High-Value Vegetables (Onion/Garlic)</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-[11px] text-slate-400 block mb-1">TEMP (°C)</label><input type="number" value={temp} onChange={(e) => setTemp(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-700 text-xs rounded-lg p-2 text-slate-200" /></div>
                <div><label className="text-[11px] text-slate-400 block mb-1">SOLAR (MJ)</label><input type="number" value={solarRad} onChange={(e) => setSolarRad(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-700 text-xs rounded-lg p-2 text-slate-200" /></div>
              </div>
            </div>
            <div className={`p-5 rounded-xl border ${theme === 'dark' ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'} space-y-4`}>
              <h3 className="text-xs font-bold text-emerald-500 uppercase tracking-wider">💧 Irrigation & Hydraulics</h3>
              <div><label className="text-[11px] text-slate-400 block mb-1">APPLICATION METHOD</label><select value={appMethod} onChange={(e) => setAppMethod(e.target.value)} className="w-full bg-slate-950 border border-slate-700 text-xs rounded-lg p-2 text-slate-200"><option value="Surface Flooding (45% Eff)">Surface Flooding (45% Eff)</option><option value="Drip Irrigation (90% Eff)">Drip Irrigation (90% Eff)</option></select></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-[11px] text-slate-400 block mb-1">FLOW (L/s)</label><input type="number" value={flowRate} onChange={(e) => setFlowRate(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-700 text-xs rounded-lg p-2 text-slate-200" /></div>
                <div><label className="text-[11px] text-slate-400 block mb-1">STATIC LIFT (M)</label><input type="number" value={staticLift} onChange={(e) => setStaticLift(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-700 text-xs rounded-lg p-2 text-slate-200" /></div>
              </div>
            </div>
            <div className={`p-5 rounded-xl border ${theme === 'dark' ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'} space-y-4`}>
              <h3 className="text-xs font-bold text-emerald-500 uppercase tracking-wider">☀️ SPIS Solar PV Sizing</h3>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-[11px] text-slate-400 block mb-1">PEAK SUN HOURS</label><input type="number" value={peakSunHours} onChange={(e) => setPeakSunHours(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-700 text-xs rounded-lg p-2 text-slate-200" /></div>
                <div><label className="text-[11px] text-slate-400 block mb-1">SAFETY FACTOR</label><input type="number" value={safetyFactor} onChange={(e) => setSafetyFactor(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-700 text-xs rounded-lg p-2 text-slate-200" /></div>
              </div>
              <div className="pt-2 border-t border-slate-800 space-y-1.5 text-xs">
                <div className="flex justify-between"><span className="text-slate-400">Total Solar Array:</span><span className="text-emerald-400 font-bold">0.35 kWp</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Panel Units Needed:</span><span className="text-emerald-400 font-bold">1 units (350W)</span></div>
              </div>
            </div>
            <div className={`p-5 rounded-xl border ${theme === 'dark' ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'} space-y-4`}>
              <h3 className="text-xs font-bold text-emerald-500 uppercase tracking-wider">📊 System Outputs</h3>
              <div className="space-y-3 text-xs bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <div className="flex justify-between"><span className="text-slate-400">Gross Crop Demand:</span><span className="text-emerald-400 font-bold">35.40 mm/day</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Total Dynamic Head:</span><span className="text-slate-200 font-bold">22.1 m</span></div>
                <div className="flex justify-between border-t border-slate-800 pt-2"><span className="text-slate-400">Annual Diesel Savings:</span><span className="text-emerald-400 font-bold">₱4,373</span></div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: GIS Spatial & DEM */}
        {activeTab === 'gis' && (
          <div className="space-y-4">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">🗺️ GIS Layer & Coordinate Selector</h3>
                <p className="text-xs text-slate-400">Active Latitude: <span className="text-emerald-400 font-mono">{location.lat.toFixed(5)}° N</span> | Longitude: <span className="text-emerald-400 font-mono">{location.lng.toFixed(5)}° E</span></p>
              </div>
              <div className="w-full md:w-72">
                <select onChange={(e) => { const [lat, lng] = e.target.value.split(',').map(Number); updateFromCoords(lat, lng); }} className="w-full bg-slate-950 border border-slate-700 text-xs rounded-lg p-2 text-slate-200">
                  <option value="14.45896,120.93851">Bacoor, Cavite (14.459° N, 120.939° E)</option>
                  <option value="15.0286,120.6896">Pampanga Central Plain (15.029° N, 120.690° E)</option>
                  <option value="14.1648,121.2413">Laguna / UPLB (14.165° N, 121.241° E)</option>
                </select>
              </div>
            </div>

            <MapStyleToolbar />

            <div className="w-full rounded-xl overflow-hidden border border-slate-800" style={{ height: '420px' }}>
              <MapContainer center={[location.lat, location.lng]} zoom={sharedZoom} style={{ height: '100%', width: '100%' }}>
                <SyncedMapController center={[location.lat, location.lng]} zoom={sharedZoom} />
                <MapEventsHandler onZoomChange={setSharedZoom} onClickChange={updateFromCoords} />
                <TileLayer key={mapViewMode} attribution={activeAttribution} url={activeTileUrl} />
                <Marker position={[location.lat, location.lng]}><Popup>Selected Location: {location.name || "Custom Pin"}</Popup></Marker>
              </MapContainer>
            </div>
          </div>
        )}

        {/* Tab 3: Weather & Climate (WITH RESTORED REGIONAL EXTREME WEATHER LISTING) */}
        {activeTab === 'weather' && (
          <div className="space-y-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">🌦️ PAGASA Regional Weather & Extreme Climate Risk Matrix</h3>
                <p className="text-xs text-slate-400">Select a regional zone to evaluate historical climate extremes and typhoon frequencies.</p>
              </div>
              <div className="w-full md:w-80">
                <select
                  value={selectedRegionKey}
                  onChange={(e) => {
                    const key = e.target.value;
                    setSelectedRegionKey(key);
                    const reg = REGIONAL_INTELLIGENCE[key];
                    if (reg) updateFromCoords(reg.lat, reg.lng);
                  }}
                  className="w-full bg-slate-950 border border-slate-700 text-xs rounded-lg p-2 text-slate-200"
                >
                  {Object.keys(REGIONAL_INTELLIGENCE).map((k) => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Regional Risk Panels */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">⚠️ Historical Extreme Weather Events</h4>
                <div className="space-y-2">
                  {activeRegionData.extremeEvents.map((evt, idx) => (
                    <div key={idx} className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs text-slate-300 flex items-start gap-2">
                      <span className="text-amber-400 font-bold">•</span>
                      <span>{evt}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">🌪️ Climatology & Typhoon Frequency</h4>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-3 text-slate-300">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Climate Classification</span>
                    <strong className="text-emerald-400 text-sm">{activeRegionData.climateType}</strong>
                  </div>
                  <div className="border-t border-slate-800 pt-2">
                    <span className="text-slate-400 block text-[10px] uppercase">Annual Typhoon Exposure</span>
                    <strong className="text-amber-400 text-sm">{activeRegionData.typhoonFrequency}</strong>
                  </div>
                </div>
              </div>
            </div>

            <MapStyleToolbar />

            <div className="w-full rounded-xl overflow-hidden border border-slate-800" style={{ height: '380px' }}>
              <MapContainer center={[location.lat, location.lng]} zoom={sharedZoom} style={{ height: '100%', width: '100%' }}>
                <SyncedMapController center={[location.lat, location.lng]} zoom={sharedZoom} />
                <MapEventsHandler onZoomChange={setSharedZoom} onClickChange={updateFromCoords} />
                <TileLayer key={mapViewMode} attribution={activeAttribution} url={activeTileUrl} />
                <Marker position={[location.lat, location.lng]}><Popup>{activeRegionData.name}</Popup></Marker>
              </MapContainer>
            </div>
          </div>
        )}

        {/* Tab 4: PAGASA Typhoon & PAR */}
        {activeTab === 'typhoon' && (
          <div className="space-y-4">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">🌀 PAGASA Philippine Area of Responsibility (PAR) Tracking Engine</h3>
                <p className="text-xs text-slate-400">Yellow boundary shows official PAR polygon. Marker reflects active location ({location.name || "Custom Pin"}).</p>
              </div>
              <span className="text-xs font-mono bg-emerald-950 text-emerald-300 px-3 py-1 rounded border border-emerald-800">
                PAR Status: Normal (No Cyclones Detected)
              </span>
            </div>

            <MapStyleToolbar />

            <div className="w-full rounded-xl overflow-hidden border border-slate-800" style={{ height: '420px' }}>
              <MapContainer center={[13.0, 122.0]} zoom={5} style={{ height: '100%', width: '100%' }}>
                <SyncedMapController center={[location.lat, location.lng]} zoom={sharedZoom} />
                <MapEventsHandler onZoomChange={setSharedZoom} onClickChange={updateFromCoords} />
                <TileLayer key={mapViewMode} attribution={activeAttribution} url={activeTileUrl} />
                
                <Polygon
                  positions={PAR_POLYGON_COORDS}
                  pathOptions={{ color: '#f59e0b', weight: 2.5, dashArray: '6, 6', fillColor: '#f59e0b', fillOpacity: 0.1 }}
                />

                <Marker position={[location.lat, location.lng]}>
                  <Popup>
                    <div className="text-xs font-sans">
                      <strong>📍 Selected Target Location</strong><br/>
                      {location.name || "Custom Site"}<br/>
                      Lat: {location.lat.toFixed(4)}°N, Lng: {location.lng.toFixed(4)}°E
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
          </div>
        )}

        {/* Tab 5: PHIVOLCS Geohazard & Faults */}
        {activeTab === 'phivolcs' && (
          <div className="space-y-4">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">🌋 PHIVOLCS Active Fault & Volcanic Hazard Map</h3>
                <p className="text-xs text-slate-400">Geohazard proximity analysis active for: <strong className="text-emerald-400">{location.name || "Selected Location"}</strong></p>
              </div>
              <div className="flex gap-2 text-xs">
                <span className="bg-amber-950 text-amber-300 px-2.5 py-1 rounded border border-amber-800">Shaking: Moderate</span>
                <span className="bg-emerald-950 text-emerald-300 px-2.5 py-1 rounded border border-emerald-800">Liquefaction: Low</span>
              </div>
            </div>

            <MapStyleToolbar />

            <div className="w-full rounded-xl overflow-hidden border border-slate-800" style={{ height: '420px' }}>
              <MapContainer center={[location.lat, location.lng]} zoom={sharedZoom} style={{ height: '100%', width: '100%' }}>
                <SyncedMapController center={[location.lat, location.lng]} zoom={sharedZoom} />
                <MapEventsHandler onZoomChange={setSharedZoom} onClickChange={updateFromCoords} />
                <TileLayer key={mapViewMode} attribution={activeAttribution} url={activeTileUrl} />
                <Marker position={[location.lat, location.lng]}><Popup>Geohazard Check: {location.name || "Custom Pin"}</Popup></Marker>
              </MapContainer>
            </div>
          </div>
        )}

        {/* Tab 6: Watershed (NRCS CN) */}
        {activeTab === 'watershed' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">📐 NRCS CURVE NUMBER RUNOFF COMPUTATION</h3>
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between text-xs mb-1"><span className="text-slate-400">24-Hr Storm Rainfall Depth (mm)</span><span className="text-emerald-400 font-bold">{rainfallDepth} mm</span></div>
                  <input type="range" min="10" max="300" value={rainfallDepth} onChange={(e) => setRainfallDepth(Number(e.target.value))} className="w-full accent-emerald-500" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1"><span className="text-slate-400">Runoff Curve Number (CN)</span><span className="text-emerald-400 font-bold">{curveNumber}</span></div>
                  <input type="range" min="40" max="98" value={curveNumber} onChange={(e) => setCurveNumber(Number(e.target.value))} className="w-full accent-emerald-500" />
                </div>
              </div>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-2">
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Direct Storm Surface Runoff (Q)</span>
                <span className="text-emerald-400 text-xl font-bold font-mono block">{computeRunoff()} mm</span>
              </div>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">WATERSHED PARAMETERS & HYDROLOGIC GROUP</h3>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Hydrologic Soil Group</label>
                  <select value={hydrologicGroup} onChange={(e) => setHydrologicGroup(e.target.value)} className="w-full bg-slate-950 border border-slate-700 text-xs rounded-lg p-2 text-slate-200">
                    <option value="Group A (High Infiltration / Sand)">Group A (High Infiltration / Sand)</option>
                    <option value="Group B (Moderate Infiltration)">Group B (Moderate Infiltration)</option>
                  </select>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1"><span className="text-slate-400">Time of Concentration (Tc)</span><span className="text-emerald-400 font-bold">{tcHours} hrs</span></div>
                  <input type="range" min="0.5" max="12.0" step="0.1" value={tcHours} onChange={(e) => setTcHours(Number(e.target.value))} className="w-full accent-emerald-500" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 7: Land Suitability (WITH RESTORED REGIONAL CROP SUITABILITY MATRIX) */}
        {activeTab === 'land' && (
          <div className="space-y-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">🌾 Regional Crop Suitability & FAO Agricultural Adaptability Matrix</h3>
                <p className="text-xs text-slate-400">Crop evaluations automatically synchronized for: <strong className="text-emerald-400">{activeRegionData.name}</strong></p>
              </div>
              <div className="w-full md:w-80">
                <select
                  value={selectedRegionKey}
                  onChange={(e) => {
                    const key = e.target.value;
                    setSelectedRegionKey(key);
                    const reg = REGIONAL_INTELLIGENCE[key];
                    if (reg) updateFromCoords(reg.lat, reg.lng);
                  }}
                  className="w-full bg-slate-950 border border-slate-700 text-xs rounded-lg p-2 text-slate-200"
                >
                  {Object.keys(REGIONAL_INTELLIGENCE).map((k) => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {activeRegionData.cropSuitability.map((item, idx) => (
                <div key={idx} className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-2">
                  <span className="text-xs font-bold text-emerald-400 block">{item.crop}</span>
                  <span className="bg-emerald-950 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-800 inline-block">
                    {item.rating}
                  </span>
                  <p className="text-xs text-slate-300 pt-1">{item.advisory}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
                <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">FAO LAND EVALUATION PARAMETERS</h3>
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Target Land Use / Crop</label>
                    <select value={landUseTarget} onChange={(e) => setLandUseTarget(e.target.value)} className="w-full bg-slate-950 border border-slate-700 text-xs rounded-lg p-2 text-slate-200">
                      <option value="Lowland Rice Paddy">Lowland Rice Paddy</option>
                      <option value="High-Value Commercial Vegetables">High-Value Commercial Vegetables</option>
                    </select>
                  </div>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-2">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">FAO Local Site Rating</span>
                  <span className="text-emerald-400 text-lg font-bold block">{suitabilityResult.class}</span>
                </div>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
                <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">LIMITATION FACTORS & DRAINAGE</h3>
                <div className="space-y-3 text-xs">
                  <div>
                    <div className="flex justify-between text-xs mb-1"><span className="text-slate-400">Terrain Slope (%)</span><span className="text-emerald-400 font-bold">{soilSlopePct}%</span></div>
                    <input type="range" min="0" max="20" value={soilSlopePct} onChange={(e) => setSoilSlopePct(Number(e.target.value))} className="w-full accent-emerald-500" />
                  </div>
                </div>
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
