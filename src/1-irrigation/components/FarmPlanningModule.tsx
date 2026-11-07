import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default Leaflet marker icon paths in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Tile layer definitions for Street and Satellite views
const TILE_LAYERS = {
  street: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
  }
};

function MapClickHandler({ onMapClick }: { onMapClick: (latlng: { lat: number; lng: number }) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    },
  });
  return null;
}

export function FarmPlanningModule({ theme = 'dark' }: { theme?: string }) {
  const [mapStyle, setMapStyle] = useState<'street' | 'satellite'>('street');
  const [targetCrop, setTargetCrop] = useState('High-Value Vegetables (Onion/Garlic)');
  const [soilTexture, setSoilTexture] = useState('Sandy Loam / Light Texture');
  const [terrainSlope, setTerrainSlope] = useState(2);
  const [vertices, setVertices] = useState<[number, number][]>([
    [13.9360, 121.3610],
    [13.9360, 121.3650],
    [13.9320, 121.3650],
    [13.9320, 121.3610]
  ]);

  const isDark = theme === 'dark';

  const handleMapClick = (latlng: { lat: number; lng: number }) => {
    setVertices((prev: any) => [...prev, [latlng.lat, latlng.lng]]);
  };

  // Button Action Handlers
  const handleSavePlan = () => {
    const planData = {
      activeSite: "Southern Luzon (Batangas)",
      coordinates: { lat: 13.93410, lng: 121.36320 },
      targetCrop,
      soilTexture,
      terrainSlope,
      vertices,
      timestamp: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(planData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `agriintel-farm-plan-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleLoadPlan = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          if (data.targetCrop) setTargetCrop(data.targetCrop);
          if (data.soilTexture) setSoilTexture(data.soilTexture);
          if (data.terrainSlope !== undefined) setTerrainSlope(data.terrainSlope);
          if (data.vertices) setVertices(data.vertices);
          alert('Farm plan loaded successfully!');
        } catch (err) {
          alert('Invalid JSON file format.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handlePrintDossier = () => {
    window.print();
  };

  return (
    <div className={`flex flex-col gap-5 w-full ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
      
      {/* Top Header & Global Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-emerald-400 flex items-center gap-2">
            🌱 Smart Farm Planning & Field Survey Engine
          </h2>
          <p className="text-xs text-slate-400">
            Map boundary via Mobile GPS or Drone Survey, auto-derive hydraulic layout & crop plans
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleLoadPlan}
            className="px-3 py-1.5 bg-slate-800 border border-slate-700 text-xs font-semibold rounded text-slate-300 hover:bg-slate-700 cursor-pointer"
          >
            📂 Load Plan (JSON)
          </button>
          <button 
            onClick={handleSavePlan}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold rounded text-white shadow cursor-pointer"
          >
            💾 Save Plan (JSON)
          </button>
          <button 
            onClick={handlePrintDossier}
            className="px-3 py-1.5 bg-slate-800 border border-slate-700 text-xs font-semibold rounded text-slate-300 hover:bg-slate-700 cursor-pointer"
          >
            🖨️ Print Dossier
          </button>
        </div>
      </div>

      {/* GIS Site Info Bar */}
      <div className={`grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-lg border text-xs ${
        isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div>
          <span className="text-slate-400 block font-medium">ACTIVE GIS SITE</span>
          <span className="text-emerald-400 font-bold">📍 Southern Luzon (Batangas)</span>
        </div>
        <div>
          <span className="text-slate-400 block font-medium">DECIMAL DEGREES (DD)</span>
          <span className="font-mono">13.93410° N, 121.36320° E</span>
        </div>
        <div>
          <span className="text-slate-400 block font-medium">DMS COORDINATES</span>
          <span className="font-mono">13° 56' 2.8" N, 121° 21' 47.5" E</span>
        </div>
        <div>
          <span className="text-slate-400 block font-medium">UTM GRID REFERENCE</span>
          <span className="font-mono">Zone 51N (E 539,129, N 1,540,749)</span>
        </div>
      </div>

      {/* Main Grid: Left Controls + Right Map */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Left Column Controls */}
        <div className="flex flex-col gap-4">
          <div className={`p-4 rounded-lg border flex flex-col gap-3 ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <h3 className="text-xs font-bold text-emerald-400 tracking-wider uppercase">
              1. FIELD SURVEY & BOUNDARY INPUTS
            </h3>
            <button className="w-full py-2 bg-emerald-950/80 border border-emerald-700/60 hover:bg-emerald-900/50 text-emerald-300 text-xs font-semibold rounded transition">
              📍 Log Mobile GPS Boundary Vertex
            </button>
            <button 
              onClick={() => setVertices([])}
              className="w-full py-2 bg-rose-950/50 border border-rose-800/50 hover:bg-rose-900/50 text-rose-300 text-xs font-semibold rounded transition"
            >
              Reset Boundary Polygon
            </button>
          </div>

          <div className={`p-4 rounded-lg border flex flex-col gap-4 ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <h3 className="text-xs font-bold text-emerald-400 tracking-wider uppercase">
              2. SOIL & TOPOGRAPHY PROFILES
            </h3>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-300">Target Crop Profile</label>
              <select 
                value={targetCrop} 
                onChange={(e) => setTargetCrop(e.target.value)}
                className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded p-2 focus:outline-none focus:border-emerald-500"
              >
                <option>High-Value Vegetables (Onion/Garlic)</option>
                <option>Rice / Lowland Paddy</option>
                <option>Corn / Maize</option>
                <option>Sugarcane</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-300">Soil Texture Class</label>
              <select 
                value={soilTexture}
                onChange={(e) => setSoilTexture(e.target.value)}
                className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded p-2 focus:outline-none focus:border-emerald-500"
              >
                <option>Sandy Loam / Light Texture</option>
                <option>Clay Loam / Heavy Texture</option>
                <option>Silt Loam / Medium Texture</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Mean Terrain Slope (%)</span>
                <span className="text-emerald-400 font-bold">{terrainSlope}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="30" 
                value={terrainSlope}
                onChange={(e) => setTerrainSlope(Number(e.target.value))}
                className="accent-emerald-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Right Column Map Card */}
        <div className={`lg:col-span-2 p-4 rounded-lg border flex flex-col gap-3 ${
          isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wide">
              Spatial Polygon Boundary ({vertices.length} vertices)
            </span>
            <span className="px-2.5 py-1 bg-emerald-950/80 border border-emerald-700/60 text-emerald-400 text-xs font-bold rounded">
              Est. Calculated Area: 7.40 ha
            </span>
          </div>

          {/* Map Style Switcher Toolbar */}
          <div className={`flex items-center justify-between p-2.5 rounded-md border ${
            isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              🗺️ Select Map Style:
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMapStyle('street')}
                className={`px-3 py-1 text-xs font-semibold rounded transition-all flex items-center gap-1 ${
                  mapStyle === 'street'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                📖 Plain Map View
              </button>
              <button
                type="button"
                onClick={() => setMapStyle('satellite')}
                className={`px-3 py-1 text-xs font-semibold rounded transition-all flex items-center gap-1 ${
                  mapStyle === 'satellite'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                🛰️ Satellite View
              </button>
            </div>
          </div>

          <div className="h-[400px] w-full rounded-lg overflow-hidden border border-slate-800 relative">
            <MapContainer 
              center={[13.93410, 121.36320]} 
              zoom={14} 
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                key={mapStyle}
                url={TILE_LAYERS[mapStyle].url}
                attribution={TILE_LAYERS[mapStyle].attribution}
                maxZoom={19}
              />
              <MapClickHandler onMapClick={handleMapClick} />
              
              {vertices.length > 0 && (
                <Polygon positions={vertices} pathOptions={{ color: '#10b981', fillColor: '#10b981', fillOpacity: 0.3 }} />
              )}
              <Marker position={[13.93410, 121.36320]}>
                <Popup>Active Parcel Survey Center</Popup>
              </Marker>
            </MapContainer>
          </div>
          
          <span className="text-[11px] text-slate-400 italic">
            * Click anywhere on the map to pin survey points or load a JSON file to reconstruct a saved farm plan.
          </span>
        </div>
      </div>

      {/* Recommendations Footer Section */}
      <div className={`p-4 rounded-lg border flex flex-col gap-3 ${
        isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <h3 className="text-xs font-bold text-emerald-400 tracking-wider uppercase">
          3. AUTOMATED ENGINEERING & AGRONOMIC RECOMMENDATIONS
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded">
            <span className="text-[11px] text-slate-400 font-semibold block uppercase">RECOMMENDED IRRIGATION SYSTEM</span>
            <span className="text-sm font-bold text-emerald-400">Drip / Micro-Sprinkler (High Infiltration Rate)</span>
          </div>
          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded flex flex-col justify-center">
            <span className="text-[11px] text-slate-400 font-semibold block uppercase">SUITABLE CROP ROTATIONS</span>
            <span className="text-xs font-semibold text-slate-200">
              Primary: <strong className="text-emerald-400">{targetCrop}</strong>
            </span>
            <span className="text-xs text-slate-400">Secondary: Mungbean / Sweet Potato (Dry Season)</span>
          </div>
        </div>
      </div>

    </div>
  );
}

export default FarmPlanningModule;
