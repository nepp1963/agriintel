// src/components/FarmMap.tsx
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

export const FarmMap: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [currentZoom, setCurrentZoom] = useState<number>(13);
  const [currentCenter, setCurrentCenter] = useState<{ lat: number; lng: number }>({
    lat: 14.57893,
    lng: 120.99097,
  });

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [currentCenter.lat, currentCenter.lng],
      zoom: currentZoom,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors AgriIntelPH',
    }).addTo(map);

    map.on('moveend', () => {
      const center = map.getCenter();
      setCurrentCenter({ lat: Number(center.lat.toFixed(5)), lng: Number(center.lng.toFixed(5)) });
      setCurrentZoom(map.getZoom());
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // 1. Export current map center and zoom as JSON
  const handleSaveLocation = () => {
    const map = mapRef.current;
    if (!map) {
      alert('Map instance not initialized.');
      return;
    }

    const center = map.getCenter();
    const zoom = map.getZoom();

    const payload: SavedGISLocation = {
      module: 'AgriIntelPH_FarmMap',
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
    link.download = `agriintel-farm-location-${dateTag}.json`;
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 2. Trigger hidden file picker
  const handleLoadButtonClick = () => {
    fileInputRef.current?.click();
  };

  // 3. Parse JSON and fly to saved coordinates/zoom
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

        const map = mapRef.current;
        if (map) {
          map.flyTo([parsed.viewport.lat, parsed.viewport.lng], parsed.viewport.zoom, {
            duration: 1.5,
          });
        }
      } catch (err) {
        console.error('Failed to load GIS location JSON:', err);
        alert('Invalid JSON file. Please select a valid AgriIntel location file.');
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };

    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col space-y-4 w-full p-4 bg-slate-950 text-slate-100 rounded-xl">
      {/* Top Toolbar with Save & Load Location Buttons */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-lg px-4 py-3 shadow-md">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            Farm Map Viewport
          </span>
          <span className="text-xs text-slate-400">
            (Lat: {currentCenter.lat}, Lng: {currentCenter.lng} | Zoom: {currentZoom})
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSaveLocation}
            className="px-3 py-1.5 text-xs font-medium text-white bg-emerald-700 hover:bg-emerald-600 rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-1"
            title="Export current map center and zoom level as JSON"
          >
            <span>Save Location</span>
          </button>

          <button
            type="button"
            onClick={handleLoadButtonClick}
            className="px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-1"
            title="Import a saved GIS location JSON file"
          >
            <span>Load Location</span>
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
      <div className="relative w-full h-[600px] rounded-xl overflow-hidden border border-slate-800 shadow-2xl">
        <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-0" />
      </div>
    </div>
  );
};

export default FarmMap;