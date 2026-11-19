import React, { useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useLocation } from '../context/LocationContext';

interface SavedGISLocation {
  module: string;
  version: string;
  timestamp: string;
  viewport: {
    lat: number;
    lng: number;
    zoom: number;
  };
}

// Map Controller to capture the Leaflet map instance and handle clicks
function MapController({ onMapReady }: { onMapReady: (map: L.Map) => void }) {
  const { updateFromCoords } = useLocation();
  const map = useMap();

  React.useEffect(() => {
    onMapReady(map);
  }, [map, onMapReady]);

  useMapEvents({
    click(e) {
      updateFromCoords(e.latlng.lat, e.latlng.lng);
    },
  });

  return null;
}

export function OverviewMapModule() {
  const { location, updateFromCoords } = useLocation();
  const mapRef = useRef<L.Map | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Create a dynamic 14.5-hectare boundary polygon relative to current clicked coordinates
  const latOffset = 0.003;
  const lngOffset = 0.004;
  const dynamicFarmBoundary: [number, number][] = [
    [location.lat + latOffset, location.lng - lngOffset],
    [location.lat + latOffset, location.lng + lngOffset],
    [location.lat - latOffset, location.lng + lngOffset],
    [location.lat - latOffset, location.lng - lngOffset],
  ];

  // 1. Save current map center and zoom to JSON
  const handleSaveLocation = () => {
    const map = mapRef.current;
    if (!map) {
      alert('Map instance not initialized yet.');
      return;
    }

    const center = map.getCenter();
    const zoom = map.getZoom();

    const payload: SavedGISLocation = {
      module: 'AgriIntelPH_OverviewMapModule',
      version: '1.0',
      timestamp: new Date().toISOString(),
      viewport: {
        lat: Number(center.lat.toFixed(6)),
        lng: Number(center.lng.toFixed(6)),
        zoom,
      },
    };

    const jsonString = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    const dateTag = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `agriintel-gis-location-${dateTag}.json`;
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 2. Trigger hidden file picker
  const handleLoadButtonClick = () => {
    fileInputRef.current?.click();
  };

  // 3. Parse JSON and fly to saved coordinates/zoom & update global context
  const handleLoadLocationFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed: SavedGISLocation = JSON.parse(content);

        if (
          !parsed.viewport ||
          typeof parsed.viewport.lat !== 'number' ||
          typeof parsed.viewport.lng !== 'number' ||
          typeof parsed.viewport.zoom !== 'number'
        ) {
          throw new Error('Invalid GIS location JSON structure.');
        }

        // Update global location context so marker & boundaries sync
        updateFromCoords(parsed.viewport.lat, parsed.viewport.lng);

        // Fly map to location
        const map = mapRef.current;
        if (map) {
          map.flyTo([parsed.viewport.lat, parsed.viewport.lng], parsed.viewport.zoom, {
            duration: 1.5,
          });
        }
      } catch (err) {
        console.error('Failed to load GIS location JSON:', err);
        alert('Invalid JSON file. Please select a valid AgriIntel GIS location file.');
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };

    reader.readAsText(file);
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-xl backdrop-blur-md">
      {/* Metric Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 block font-medium uppercase tracking-wider">
            REFERENCE ET₀ (PENMAN-MONTEITH)
          </span>
          <div className="text-xl font-bold text-emerald-400 mt-1">6.10 <span className="text-xs text-slate-400 font-normal">mm/day</span></div>
        </div>

        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 block font-medium uppercase tracking-wider">
            CROP WATER DEMAND (ET_c)
          </span>
          <div className="text-xl font-bold text-emerald-400 mt-1">7.02 <span className="text-xs text-slate-400 font-normal">mm/day</span></div>
        </div>

        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 block font-medium uppercase tracking-wider">
            DIRECT RUNOFF (NRCS Q_s)
          </span>
          <div className="text-xl font-bold text-emerald-400 mt-1">30.33 <span className="text-xs text-slate-400 font-normal">mm</span></div>
        </div>
      </div>

      {/* Toolbar with Save & Load Location Buttons */}
      <div className="flex items-center justify-between mb-3 px-1">
        <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Spatial Viewport Controls
        </span>
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-lg border border-emerald-500/40 shadow-inner">
          <button
            type="button"
            onClick={handleSaveLocation}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-600 rounded shadow transition-colors cursor-pointer flex items-center gap-1.5"
            title="Export current map center and zoom level as JSON"
          >
            💾 Save Location
          </button>

          <button
            type="button"
            onClick={handleLoadButtonClick}
            className="px-3 py-1.5 text-xs font-semibold text-slate-100 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded shadow transition-colors cursor-pointer flex items-center gap-1.5"
            title="Import a saved GIS location JSON file"
          >
            📂 Load Location
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleLoadLocationFile}
            className="hidden"
          />
        </div>
      </div>

      {/* Interactive Synchronized Map */}
      <div className="w-full rounded-lg overflow-hidden border border-slate-800 relative z-0" style={{ height: '400px' }}>
        <MapContainer
          center={[location.lat, location.lng]}
          zoom={location.zoom}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <MapController onMapReady={(map) => { mapRef.current = map; }} />

          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Dynamic Green Farm Zone Boundary following current site */}
          <Polygon
            positions={dynamicFarmBoundary}
            pathOptions={{ color: '#10b981', fillColor: '#10b981', fillOpacity: 0.25, weight: 2 }}
          />

          {/* Dynamic Pin Marker */}
          <Marker position={[location.lat, location.lng]}>
            <Popup>
              <div className="text-xs p-1 space-y-1">
                <strong className="text-slate-800 font-bold block border-b pb-1">📍 Selected Agricultural Zone</strong>
                <div><span className="text-slate-500">Location:</span> {location.name}</div>
                <div><span className="text-slate-500">Soil Series:</span> {location.soilSeries}</div>
                <div><span className="text-slate-500">Area:</span> 14.5 Hectares</div>
                <div><span className="text-slate-500">Coords:</span> {location.lat.toFixed(4)}° N, {location.lng.toFixed(4)}° E</div>
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>
      <p className="text-[11px] text-slate-500 text-center mt-3">
        Click anywhere on the map to pin a new site and recalculate spatial hydraulics for that region.
      </p>
    </div>
  );
}

export default OverviewMapModule;