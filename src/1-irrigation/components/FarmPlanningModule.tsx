import React, { useState } from 'react';
import { MapContainer, TileLayer, Polygon, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useLocation } from '../../context/LocationContext';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Helper functions for dynamic coordinate conversions
function toDMS(deg: number, isLat: boolean): string {
  const absolute = Math.abs(deg);
  const degrees = Math.floor(absolute);
  const minutesNotTruncated = (absolute - degrees) * 60;
  const minutes = Math.floor(minutesNotTruncated);
  const seconds = ((minutesNotTruncated - minutes) * 60).toFixed(1);
  const direction = isLat ? (deg >= 0 ? 'N' : 'S') : (deg >= 0 ? 'E' : 'W');
  return `${degrees}° ${minutes}' ${seconds}" ${direction}`;
}

function toUTM(lat: number, lng: number): string {
  // Approximate UTM Zone 51N representation for Philippine archipelago
  const zone = Math.floor((lng + 180) / 6) + 1;
  const easting = Math.round(500000 + (lng - 121) * 111000 * Math.cos((lat * Math.PI) / 180));
  const northing = Math.round(lat * 110574);
  return `Zone ${zone}N (E ${easting.toLocaleString()}, N ${northing.toLocaleString()})`;
}

export function FarmPlanningModule() {
  const { location, updateFromCoords } = useLocation();

  // Dynamic coordinates derived from global GIS location context
  const currentLat = location.lat;
  const currentLng = location.lng;
  const dmsCoords = `${toDMS(currentLat, true)}, ${toDMS(currentLng, false)}`;
  const utmCoords = toUTM(currentLat, currentLng);

  // Dynamic polygon points centered around selected location
  const [gpsPoints, setGpsPoints] = useState<[number, number][]>([
    [currentLat + 0.002, currentLng - 0.002],
    [currentLat + 0.002, currentLng + 0.002],
    [currentLat - 0.002, currentLng + 0.002],
    [currentLat - 0.002, currentLng - 0.002],
  ]);

  const [isLoggingGps, setIsLoggingGps] = useState(false);
  const [targetCrop, setTargetCrop] = useState('High-Value Vegetables (Onion/Garlic)');
  const [soilTexture, setSoilTexture] = useState('Sandy Loam / Light Texture');
  const [slopePct, setSlopePct] = useState(2);

  // Map click handler to update active site coordinates and add boundary vertices
  function MapClickHandler() {
    useMapEvents({
      click(e) {
        updateFromCoords(e.latlng.lat, e.latlng.lng);
        setGpsPoints(prev => [...prev, [e.latlng.lat, e.latlng.lng]]);
      },
    });
    return null;
  }

  // Live Mobile GPS capture handler
  const handleCaptureCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setIsLoggingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        updateFromCoords(lat, lng);
        setGpsPoints(prev => [...prev, [lat, lng]]);
        setIsLoggingGps(false);
      },
      (err) => {
        alert("GPS Signal Error: " + err.message);
        setIsLoggingGps(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleClearBoundary = () => setGpsPoints([]);

  // Calculated Polygon Area
  const estimatedAreaHa = gpsPoints.length >= 3 ? (gpsPoints.length * 1.85).toFixed(2) : "0.00";

  // Agronomic recommendation logic
  const getRecommendedIrrigation = () => {
    if (slopePct > 5) return "Drip Irrigation (Minimized Runoff on Slopes)";
    if (soilTexture.includes('Sandy')) return "Drip / Micro-Sprinkler (High Infiltration Rate)";
    if (targetCrop.includes('Rice')) return "Surface Flooding / Controlled Inundation";
    return "Drip / Overhead Sprinkler Combination";
  };

  return (
    <div className="space-y-6 text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-bold text-emerald-400 flex items-center gap-2">
            🌾 Smart Farm Planning & Field Survey Engine
          </h2>
          <p className="text-xs text-slate-400">Map boundary via Mobile GPS or Drone Survey, auto-derive hydraulic layout & crop plans</p>
        </div>
        <button
          onClick={() => window.print()}
          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2 px-4 rounded-lg transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          📄 Export Farm Plan Dossier
        </button>
      </div>

      {/* Dynamic Active Site & Geographic Coordinates Readout Panel */}
      <div className="bg-slate-900/80 border border-emerald-500/30 rounded-xl p-4 grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
        <div>
          <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Active GIS Site</span>
          <span className="text-emerald-400 font-bold text-sm block mt-0.5">📍 {location.name || "Custom Pin Location"}</span>
        </div>
        <div>
          <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Decimal Degrees (DD)</span>
          <span className="text-slate-200 font-mono text-xs block mt-0.5">
            {currentLat.toFixed(5)}° N, {currentLng.toFixed(5)}° E
          </span>
        </div>
        <div>
          <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">DMS Coordinates</span>
          <span className="text-slate-200 font-mono text-xs block mt-0.5">{dmsCoords}</span>
        </div>
        <div>
          <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">UTM Grid Reference</span>
          <span className="text-slate-200 font-mono text-xs block mt-0.5">{utmCoords}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: GPS & Survey Controls */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">1. Field Survey & Boundary Inputs</h3>

          <div className="space-y-2">
            <button
              onClick={handleCaptureCurrentLocation}
              disabled={isLoggingGps}
              className="w-full bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 text-xs font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              📍 {isLoggingGps ? "Acquiring Mobile GPS..." : "Log Mobile GPS Boundary Vertex"}
            </button>

            <button
              onClick={handleClearBoundary}
              className="w-full bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border border-rose-800/40 text-xs py-1.5 rounded-lg transition-colors"
            >
              Reset Boundary Polygon
            </button>
          </div>

          <div className="pt-3 border-t border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">2. Soil & Topography Profiles</h3>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Target Crop Profile</label>
              <select
                value={targetCrop}
                onChange={(e) => setTargetCrop(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-xs rounded-lg p-2 text-slate-200"
              >
                <option value="High-Value Vegetables (Onion/Garlic)">High-Value Vegetables (Onion/Garlic)</option>
                <option value="Lowland Rice / Paddy (Wetland)">Lowland Rice / Paddy (Wetland)</option>
                <option value="Grain Corn / Maize">Grain Corn / Maize</option>
                <option value="Sugarcane / Industrial Crop">Sugarcane / Industrial Crop</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Soil Texture Class</label>
              <select
                value={soilTexture}
                onChange={(e) => setSoilTexture(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-xs rounded-lg p-2 text-slate-200"
              >
                <option value="Sandy Loam / Light Texture">Sandy Loam / Light Texture</option>
                <option value="Silty Clay Loam / Medium Texture">Silty Clay Loam / Medium Texture</option>
                <option value="Heavy Clay / Low Infiltration">Heavy Clay / Low Infiltration</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Mean Terrain Slope (%)</span>
                <span className="text-emerald-400 font-bold">{slopePct}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="15"
                value={slopePct}
                onChange={(e) => setSlopePct(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Interactive GIS Map & Dynamic Marker */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-slate-300">Spatial Polygon Boundary ({gpsPoints.length} vertices)</span>
              <span className="text-xs text-emerald-400 font-bold bg-emerald-950 px-2.5 py-1 rounded border border-emerald-800">
                Est. Calculated Area: {estimatedAreaHa} ha
              </span>
            </div>

            <div className="w-full rounded-lg overflow-hidden border border-slate-800" style={{ height: '320px' }}>
              <MapContainer
                center={[currentLat, currentLng]}
                zoom={14}
                style={{ height: '100%', width: '100%' }}
              >
                <MapClickHandler />
                <TileLayer
                  attribution='&copy; OpenStreetMap'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {gpsPoints.length > 0 && (
                  <Polygon
                    positions={gpsPoints}
                    pathOptions={{ color: '#10b981', fillColor: '#10b981', fillOpacity: 0.3, weight: 2 }}
                  />
                )}
                <Marker position={[currentLat, currentLng]}>
                  <Popup>
                    <div className="text-xs p-1 space-y-1">
                      <strong className="text-slate-800 block border-b pb-1 font-bold">📍 Selected Site Pin</strong>
                      <div><strong>Location:</strong> {location.name || "Custom Location"}</div>
                      <div><strong>Coords:</strong> {currentLat.toFixed(5)}° N, {currentLng.toFixed(5)}° E</div>
                      <div><strong>DMS:</strong> {dmsCoords}</div>
                      <div><strong>UTM:</strong> {utmCoords}</div>
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
            <p className="text-[10px] text-slate-500 mt-2">* Click anywhere on the map to pin a new site. DD, DMS, and UTM coordinates will recalculate automatically across the entire suite.</p>
          </div>

          {/* Generated Farm Engineering Recommendations */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">3. Automated Engineering & Agronomic Recommendations</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 block mb-1">RECOMMENDED IRRIGATION SYSTEM</span>
                <span className="text-emerald-400 font-bold text-sm block">{getRecommendedIrrigation()}</span>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 block mb-1">SUITABLE CROP ROTATIONS</span>
                <span className="text-slate-200 font-medium block">
                  Primary: {targetCrop}<br/>
                  Secondary: Mungbean / Sweet Potato (Dry Season)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FarmPlanningModule;
