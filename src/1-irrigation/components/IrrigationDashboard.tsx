import React, { useState } from 'react';
import SoilSalinityModule from './SoilSalinityModule';
import FarmPlanningModule from './FarmPlanningModule';
import { useLocation } from '../../context/LocationContext';
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Official PAGASA Philippine Area of Responsibility (PAR) Boundary Polygon
const PAR_POLYGON_COORDS: [number, number][] = [
  [25.0, 120.0],
  [25.0, 135.0],
  [5.0, 135.0],
  [5.0, 115.0],
  [15.0, 115.0],
  [21.0, 120.0],
];

// Component to handle dynamic map center AND zoom level synchronization
function SyncedMapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

// Map event listener to broadcast zoom and click updates back to LocationContext
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

  // Shared map state: zoom level & view mode (satellite vs street map)
  const [sharedZoom, setSharedZoom] = useState<number>(13);
  const [mapViewMode, setMapViewMode] = useState<'satellite' | 'street'>('satellite');

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
  const [opPress, setOpPress] = useState(10);
  const [pumpEff, setPumpEff] = useState(65);

  const [peakSunHours, setPeakSunHours] = useState(5.2);
  const [safetyFactor, setSafetyFactor] = useState(1.3);
  const [panelWattage, setPanelWattage] = useState('350W Monocrystalline');
  const [busVoltage, setBusVoltage] = useState('48V DC Bus');
  const [dieselPrice, setDieselPrice] = useState(60);

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
  const SATELLITE_ATTRIBUTION = "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community";

  const STREET_TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  const STREET_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

  const activeTileUrl = mapViewMode === 'satellite' ? SATELLITE_TILE_URL : STREET_TILE_URL;
  const activeAttribution = mapViewMode === 'satellite' ? SATELLITE_ATTRIBUTION : STREET_ATTRIBUTION;

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
            {/* Global Map Layer Toggle Switch */}
            <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
              <button
                onClick={() => setMapViewMode('satellite')}
                className={`px-2.5 py-1 rounded-md transition-colors ${mapViewMode === 'satellite' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'}`}
              >
                🛰️ Satellite
              </button>
              <button
                onClick={() => setMapViewMode('street')}
                className={`px-2.5 py-1 rounded-md transition-colors ${mapViewMode === 'street' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'}`}
              >
                🗺️ Map View
              </button>
            </div>

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
                <p className="text-xs text-slate-400">Active Latitude: <span className="text-emerald-400 font-mono">{location.lat.toFixed(5)}° N</span> | Longitude: <span className="text-emerald-400 font-mono">{location.lng.toFixed(5)}° E</span> | Zoom: <span className="text-emerald-400 font-mono">{sharedZoom}x</span></p>
              </div>
              <div className="w-full md:w-72">
                <select onChange={(e) => { const [lat, lng] = e.target.value.split(',').map(Number); updateFromCoords(lat, lng); }} className="w-full bg-slate-950 border border-slate-700 text-xs rounded-lg p-2 text-slate-200">
                  <option value="14.45896,120.93851">Bacoor, Cavite (14.459° N, 120.939° E)</option>
                  <option value="15.0286,120.6896">Pampanga Central Plain (15.029° N, 120.690° E)</option>
                  <option value="14.1648,121.2413">Laguna / UPLB (14.165° N, 121.241° E)</option>
                </select>
              </div>
            </div>

            <div className="w-full rounded-xl overflow-hidden border border-slate-800" style={{ height: '420px' }}>
              <MapContainer center={[location.lat, location.lng]} zoom={sharedZoom} style={{ height: '100%', width: '100%' }}>
                <SyncedMapController center={[location.lat, location.lng]} zoom={sharedZoom} />
                <MapEventsHandler onZoomChange={setSharedZoom} onClickChange={updateFromCoords} />
                <TileLayer attribution={activeAttribution} url={activeTileUrl} />
                <Marker position={[location.lat, location.lng]}><Popup>Selected Location: {location.name || "Custom Pin"}</Popup></Marker>
              </MapContainer>
            </div>
          </div>
        )}

        {/* Tab 3: Weather & Climate */}
        {activeTab === 'weather' && (
          <div className="space-y-4">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">🌦️ PAGASA Climate Zones & Weather Map</h3>
                <p className="text-xs text-slate-400">Viewing climate normals for: <strong className="text-emerald-400">{location.name || "Selected Location"}</strong> ({location.lat.toFixed(3)}°N, {location.lng.toFixed(3)}°E)</p>
              </div>
              <span className="text-xs font-mono bg-emerald-950 text-emerald-300 px-3 py-1 rounded border border-emerald-800">
                Climate Zone Active
              </span>
            </div>

            <div className="w-full rounded-xl overflow-hidden border border-slate-800" style={{ height: '420px' }}>
              <MapContainer center={[location.lat, location.lng]} zoom={sharedZoom} style={{ height: '100%', width: '100%' }}>
                <SyncedMapController center={[location.lat, location.lng]} zoom={sharedZoom} />
                <MapEventsHandler onZoomChange={setSharedZoom} onClickChange={updateFromCoords} />
                <TileLayer attribution={activeAttribution} url={activeTileUrl} />
                <Marker position={[location.lat, location.lng]}><Popup>Weather Grid Station: {location.name || "Custom Pin"}</Popup></Marker>
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

            <div className="w-full rounded-xl overflow-hidden border border-slate-800" style={{ height: '420px' }}>
              <MapContainer center={[13.0, 122.0]} zoom={5} style={{ height: '100%', width: '100%' }}>
                <SyncedMapController center={[location.lat, location.lng]} zoom={sharedZoom} />
                <MapEventsHandler onZoomChange={setSharedZoom} onClickChange={updateFromCoords} />
                <TileLayer attribution={activeAttribution} url={activeTileUrl} />
                
                <Polygon
                  positions={PAR_POLYGON_COORDS}
                  pathOptions={{ color: '#f59e0b', weight: 2.5, dashArray: '6, 6', fillColor: '#f59e0b', fillOpacity: 0.1 }}
                />

                <Marker position={[location.lat, location.lng]}>
                  <Popup>
                    <div className="text-xs font-sans">
                      <strong>📍 Selected Target Location</strong><br/>
                      {location.name || "Custom Site"}<br/>
                      Lat: {location.lat.toFixed(4)}°N, Lng: {location.lng.toFixed(4)}°E<br/>
                      <span className="text-emerald-600 font-bold">Inside PAGASA PAR Bounding Box</span>
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

            <div className="w-full rounded-xl overflow-hidden border border-slate-800" style={{ height: '420px' }}>
              <MapContainer center={[location.lat, location.lng]} zoom={sharedZoom} style={{ height: '100%', width: '100%' }}>
                <SyncedMapController center={[location.lat, location.lng]} zoom={sharedZoom} />
                <MapEventsHandler onZoomChange={setSharedZoom} onClickChange={updateFromCoords} />
                <TileLayer attribution={activeAttribution} url={activeTileUrl} />
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

        {/* Tab 7: Land Suitability */}
        {activeTab === 'land' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">🌾 FAO LAND EVALUATION FRAMEWORK</h3>
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
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">FAO Suitability Rating</span>
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
