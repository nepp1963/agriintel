import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useLocation } from '../../context/LocationContext';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Map click listener hook
function DashboardMapSync() {
  const { updateFromCoords, setZoom } = useLocation();

  useMapEvents({
    click(e) {
      updateFromCoords(e.latlng.lat, e.latlng.lng);
    },
    zoomend(e) {
      setZoom(e.target.getZoom());
    }
  });

  return null;
}

// Preset Locations in the Philippines for quick selection
const presetLocations = [
  { name: 'Pampanga (San Fernando / Central Plain)', lat: 15.0286, lng: 120.6896 },
  { name: 'Pampanga (Porac / Lahar Zone)', lat: 15.0716, lng: 120.5423 },
  { name: 'Cavite (Bacoor / Imus Lowland)', lat: 14.4127, lng: 120.9367 },
  { name: 'Laguna (Los Baños / UPLB Area)', lat: 14.1648, lng: 121.2413 },
  { name: 'Batangas (Lipa City Uplands)', lat: 13.9419, lng: 121.1644 },
  { name: 'Nueva Ecija (Muñoz / Paddy Plain)', lat: 15.7124, lng: 120.9030 },
  { name: 'Bukidnon (Malaybalay Plateau)', lat: 8.1574, lng: 125.1278 },
  { name: 'Iloilo (Central Plain)', lat: 10.8778, lng: 122.4847 },
];

export function InteractiveDashboardMap() {
  const { location, updateFromCoords } = useLocation();

  // Create a dynamic 14.5 ha boundary around current coordinates
  const latOffset = 0.003;
  const lngOffset = 0.004;
  const dynamicFarmBoundary: [number, number][] = [
    [location.lat + latOffset, location.lng - lngOffset],
    [location.lat + latOffset, location.lng + lngOffset],
    [location.lat - latOffset, location.lng + lngOffset],
    [location.lat - latOffset, location.lng - lngOffset],
  ];

  const handleLocationPresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = presetLocations.find(p => p.name === e.target.value);
    if (selected) {
      updateFromCoords(selected.lat, selected.lng);
    }
  };

  const handleManualCoords = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const lat = parseFloat(formData.get('lat') as string);
    const lng = parseFloat(formData.get('lng') as string);
    if (!isNaN(lat) && !isNaN(lng)) {
      updateFromCoords(lat, lng);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Control Panel: Preset Location & Manual Coordinates */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">
          📍 Target Location Selection
        </h3>

        {/* Quick Location Preset Dropdown */}
        <div>
          <label className="text-xs text-slate-400 font-medium block mb-1">PRESET PHILIPPINE SITE</label>
          <select
            onChange={handleLocationPresetChange}
            className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg p-2.5 focus:outline-none focus:border-emerald-500"
          >
            {presetLocations.map(p => (
              <option key={p.name} value={p.name}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* Manual Lat/Lng Override Inputs */}
        <form onSubmit={handleManualCoords} className="space-y-2 pt-2 border-t border-slate-800">
          <label className="text-xs text-slate-400 font-medium block">CUSTOM GEOGRAPHIC COORDINATES</label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[10px] text-slate-500 block">LATITUDE (°N)</span>
              <input
                type="number"
                step="any"
                name="lat"
                defaultValue={location.lat}
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-md p-2 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">LONGITUDE (°E)</span>
              <input
                type="number"
                step="any"
                name="lng"
                defaultValue={location.lng}
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-md p-2 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs py-2 rounded-lg transition-colors cursor-pointer mt-1"
          >
            Set Location & Recalculate
          </button>
        </form>

        <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 text-xs space-y-1 text-slate-300">
          <div><span className="text-slate-500">Current Site:</span> <strong className="text-emerald-400">{location.name}</strong></div>
          <div><span className="text-slate-500">Coordinates:</span> {location.lat.toFixed(4)}° N, {location.lng.toFixed(4)}° E</div>
          <div><span className="text-slate-500">Elevation Lift:</span> {location.elevation} m MASL</div>
        </div>
      </div>

      {/* Right Map Display (Interactive Pin & Boundary) */}
      <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold text-slate-200">
            Spatial Farm Boundary & GIS Layer
          </h3>
          <span className="text-[11px] text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-800">
            Click Map to Pin Site
          </span>
        </div>

        <div className="w-full rounded-lg overflow-hidden border border-slate-800 relative z-0" style={{ height: '360px' }}>
          <MapContainer
            center={[location.lat, location.lng]}
            zoom={location.zoom}
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%' }}
          >
            <DashboardMapSync />

            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <Polygon
              positions={dynamicFarmBoundary}
              pathOptions={{ color: '#10b981', fillColor: '#10b981', fillOpacity: 0.2, weight: 2 }}
            />

            <Marker position={[location.lat, location.lng]}>
              <Popup>
                <div className="text-xs p-1 space-y-1">
                  <strong className="text-slate-800 font-bold block border-b pb-1">📍 Selected Agricultural Zone</strong>
                  <div><span className="text-slate-500">Site Name:</span> {location.name}</div>
                  <div><span className="text-slate-500">Area:</span> 14.5 Hectares</div>
                  <div><span className="text-slate-500">Coords:</span> {location.lat.toFixed(4)}° N, {location.lng.toFixed(4)}° E</div>
                </div>
              </Popup>
            </Marker>
          </MapContainer>
        </div>

        <p className="text-[11px] text-slate-500 text-center">
          💡 Choose locations via: <strong>1)</strong> Direct map click, <strong>2)</strong> Philippine regional preset dropdown, or <strong>3)</strong> Manual Lat/Lng coordinate inputs.
        </p>
      </div>
    </div>
  );
}
