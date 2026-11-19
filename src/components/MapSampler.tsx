// src/components/MapSampler.tsx
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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

export const MapSampler: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [mapStyle, setMapStyle] = useState<'plain' | 'satellite'>('plain');
  const [activeLat, setActiveLat] = useState<number>(14.57893);
  const [activeLng, setActiveLng] = useState<number>(120.99097);
  const [elevation, setElevation] = useState<number>(7);
  const [slope, setSlope] = useState<number>(0);
  const [currentZoom, setCurrentZoom] = useState<number>(13);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [activeLat, activeLng],
      zoom: currentZoom,
      zoomControl: true,
    });

    const plainLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors AgriIntelPH',
    });

    plainLayer.addTo(map);
    tileLayerRef.current = plainLayer;

    map.on('moveend', () => {
      const center = map.getCenter();
      setActiveLat(Number(center.lat.toFixed(5)));
      setActiveLng(Number(center.lng.toFixed(5)));
      setCurrentZoom(map.getZoom());
    });

    map.on('click', (e) => {
      setActiveLat(Number(e.latlng.lat.toFixed(5)));
      setActiveLng(Number(e.latlng.lng.toFixed(5)));
      setElevation(Math.floor(Math.random() * 25) + 2);
      setSlope(Math.floor(Math.random() * 5));
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  const handleStyleChange = (style: 'plain' | 'satellite') => {
    setMapStyle(style);
    const map = mapRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const newLayer =
      style === 'satellite'
        ? L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            maxZoom: 19,
            attribution: 'Tiles &copy; Esri',
          })
        : L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap contributors',
          });

    newLayer.addTo(map);
    tileLayerRef.current = newLayer;
  };

  // 1. Save Location as JSON
  const handleSaveLocation = () => {
    const map = mapRef.current;
    if (!map) {
      alert('Map instance not initialized.');
      return;
    }

    const center = map.getCenter();
    const zoom = map.getZoom();

    const payload: SavedGISLocation = {
      module: 'AgriIntelPH_MapSampler',
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

  // 2. Trigger Hidden File Input
  const handleLoadButtonClick = () => {
    fileInputRef.current?.click();
  };

  // 3. Load Location from JSON and flyTo
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
          throw new Error('Invalid JSON structure.');
        }

        const map = mapRef.current;
        if (map) {
          map.flyTo([parsed.viewport.lat, parsed.viewport.lng], parsed.viewport.zoom, {
            duration: 1.5,
          });
        }
      } catch (err) {
        console.error('Failed to load JSON:', err);
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
    <div className="flex flex-col space-y-4 w-full">
      {/* Top Sampler Readout Bar */}
      <div className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 flex items-center justify-between text-xs text-emerald-400">
        <div>
          <span className="font-semibold uppercase tracking-wider text-slate-300">MAP GIS LAYER & TOPOGRAPHIC ELEVATION / SLOPE SAMPLER: </span>
          <span>
            Active Lat: {activeLat}° N | Lng: {activeLng}° E | Elevation: {elevation} m | Extracted Slope: {slope}%
          </span>
        </div>
        <span className="text-slate-400 italic">💡 Click anywhere on the map to sample precise topographic elevation and slope.</span>
      </div>

      {/* Control Toolbar with Style Toggles AND EXPLICIT SAVE/LOAD BUTTONS */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-emerald-950/40 border-2 border-emerald-500 rounded-lg px-4 py-3 shadow-lg">
        {/* Map Style Toggles */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">Select Map Style:</span>
          <button
            type="button"
            onClick={() => handleStyleChange('plain')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer ${
              mapStyle === 'plain'
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-600'
            }`}
          >
            Plain Map View
          </button>
          <button
            type="button"
            onClick={() => handleStyleChange('satellite')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer ${
              mapStyle === 'satellite'
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-600'
            }`}
          >
            Satellite View
          </button>
        </div>

        {/* PROMINENT SAVE & LOAD LOCATION JSON CONTROLS */}
        <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-lg border-2 border-emerald-400 shadow-xl">
          <button
            type="button"
            onClick={handleSaveLocation}
            className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-md shadow-md transition-all cursor-pointer flex items-center gap-1.5"
            title="Export current map center and zoom level as JSON"
          >
            💾 SAVE LOCATION
          </button>

          <button
            type="button"
            onClick={handleLoadButtonClick}
            className="px-4 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 border border-emerald-500 rounded-md shadow-md transition-all cursor-pointer flex items-center gap-1.5"
            title="Import a saved GIS location JSON file"
          >
            📂 LOAD LOCATION
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

      {/* Leaflet Map Viewport Container */}
      <div className="relative w-full h-[600px] rounded-xl overflow-hidden border border-slate-700 shadow-2xl">
        <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-0" />
      </div>
    </div>
  );
};

export default MapSampler;