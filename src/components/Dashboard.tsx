import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useLocation } from '../context/LocationContext';

// Click Handler to make the map interactive
function MapClickHandler() {
  const { updateFromCoords } = useLocation();

  useMapEvents({
    click(e) {
      updateFromCoords(e.latlng.lat, e.latlng.lng);
    },
  });

  return null;
}

export function OverviewMapModule() {
  const { location } = useLocation();

  // Create a dynamic 14.5-hectare boundary polygon relative to current clicked coordinates
  const latOffset = 0.003;
  const lngOffset = 0.004;
  const dynamicFarmBoundary: [number, number][] = [
    [location.lat + latOffset, location.lng - lngOffset],
    [location.lat + latOffset, location.lng + lngOffset],
    [location.lat - latOffset, location.lng + lngOffset],
    [location.lat - latOffset, location.lng - lngOffset],
  ];

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-xl backdrop-blur-md">
      {/* Metric Cards Section (Fixing the $ET_O$ LaTeX raw text) */}
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

      {/* Interactive Synchronized Map */}
      <div className="w-full rounded-lg overflow-hidden border border-slate-800 relative z-0" style={{ height: '400px' }}>
        <MapContainer
          center={[location.lat, location.lng]}
          zoom={location.zoom}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <MapClickHandler />

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
