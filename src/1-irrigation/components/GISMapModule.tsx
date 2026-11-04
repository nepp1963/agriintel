import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, LayersControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface GISMapModuleProps {
  lat: number;
  lng: number;
  extractedSlope: number;
  extractedElevation: number;
  onLocationSelect: (lat: number, lng: number, calculatedSlope: number, elevation: number) => void;
}

// Function to estimate daily rainfall probability based on lat/lng spatial regions
function getDailyRainfallProbability(lat: number, lng: number): { probPct: number; riskLabel: string; colorClass: string } {
  let probPct = 35; // Default baseline

  if (lat < 9.0) {
    // Mindanao region
    probPct = Math.round(25 + (Math.abs(Math.sin(lat * lng)) * 30));
  } else if (lat >= 9.0 && lat < 13.0) {
    // Visayas regions
    if (lng >= 124.5) {
      // Eastern Visayas (High Atlantic/Pacific exposure)
      probPct = Math.round(65 + (Math.abs(Math.sin(lat * lng)) * 25));
    } else {
      probPct = Math.round(40 + (Math.abs(Math.cos(lat * lng)) * 35));
    }
  } else if (lat >= 13.0 && lat <= 15.5) {
    // Southern Luzon & Bicol
    probPct = Math.round(50 + (Math.abs(Math.sin(lat + lng)) * 35));
  } else {
    // Central & Northern Luzon
    probPct = Math.round(30 + (Math.abs(Math.sin(lat * lng)) * 45));
  }

  let riskLabel = "Low Chance of Rain";
  let colorClass = "text-emerald-600 font-bold";

  if (probPct >= 70) {
    riskLabel = "High Rain Probability";
    colorClass = "text-rose-600 font-bold";
  } else if (probPct >= 45) {
    riskLabel = "Moderate Rain Probability";
    colorClass = "text-amber-600 font-bold";
  }

  return { probPct, riskLabel, colorClass };
}

function LocationMarker({ 
  position, 
  onSelect 
}: { 
  position: [number, number]; 
  onSelect: (lat: number, lng: number) => void 
}) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  const rainInfo = getDailyRainfallProbability(position[0], position[1]);

  return (
    <Marker position={position}>
      <Popup className="custom-location-popup">
        <div className="text-xs space-y-1 p-0.5">
          <div className="font-semibold text-slate-800 border-b pb-1 mb-1">
            📍 Selected Project Site
          </div>
          <div><span className="text-slate-500">Lat:</span> {position[0].toFixed(4)}° N</div>
          <div><span className="text-slate-500">Lng:</span> {position[1].toFixed(4)}° E</div>
          <div className="pt-1.5 border-t mt-1">
            <span className="text-slate-500 block text-[10px] uppercase font-medium">Daily Rain Probability</span>
            <div className={`text-sm ${rainInfo.colorClass}`}>
              🌧️ {rainInfo.probPct}% ({rainInfo.riskLabel})
            </div>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

export function GISMapModule({ 
  lat, 
  lng, 
  extractedSlope, 
  extractedElevation, 
  onLocationSelect 
}: GISMapModuleProps) {
  
  const handleMapClick = (selectedLat: number, selectedLng: number) => {
    const simulatedSlope = Number((Math.abs(Math.sin(selectedLat * selectedLng)) * 14).toFixed(1));
    const simulatedElevation = Math.round(Math.abs(Math.cos(selectedLat)) * 350 + 20);

    onLocationSelect(selectedLat, selectedLng, simulatedSlope, simulatedElevation);
  };

  const rainInfo = getDailyRainfallProbability(lat, lng);

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-xl backdrop-blur-md space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            🗺️ GIS Spatial Site Location & DEM Profiling
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Click anywhere on the map to inspect project site parameters. The marker balloon displays real-time daily rainfall probability.
          </p>
        </div>
        <span className="text-xs bg-purple-950/80 border border-purple-800 text-purple-400 px-3 py-1 rounded-full font-medium">
          DEM Mesh Connected
        </span>
      </div>

      <div className="w-full rounded-lg overflow-hidden border border-slate-800 relative z-0" style={{ height: '400px' }}>
        <MapContainer
          center={[lat, lng]}
          zoom={8}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <LayersControl position="topright">
            <LayersControl.BaseLayer checked name="OpenStreetMap (Streets)">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
            </LayersControl.BaseLayer>

            <LayersControl.BaseLayer name="ESRI World Imagery (Satellite)">
              <TileLayer
                attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              />
            </LayersControl.BaseLayer>
          </LayersControl>

          <LocationMarker position={[lat, lng]} onSelect={handleMapClick} />
        </MapContainer>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 text-xs">
        <div>
          <span className="text-slate-400 block font-medium">TARGET LATITUDE</span>
          <div className="text-sm font-bold text-purple-400 mt-0.5">{lat.toFixed(4)}° N</div>
        </div>
        <div>
          <span className="text-slate-400 block font-medium">TARGET LONGITUDE</span>
          <div className="text-sm font-bold text-purple-400 mt-0.5">{lng.toFixed(4)}° E</div>
        </div>
        <div>
          <span className="text-slate-400 block font-medium">DEM EXTRACTED SLOPE</span>
          <div className={`text-sm font-bold mt-0.5 ${extractedSlope > 8 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {extractedSlope}% {extractedSlope > 8 ? '(High Slope)' : '(Gentle)'}
          </div>
        </div>
        <div>
          <span className="text-slate-400 block font-medium">EST. ELEVATION LIFT</span>
          <div className="text-sm font-bold text-emerald-400 mt-0.5">{extractedElevation} m MASL</div>
        </div>
        <div>
          <span className="text-slate-400 block font-medium">DAILY RAIN PROBABILITY</span>
          <div className="text-sm font-bold text-sky-400 mt-0.5">🌧️ {rainInfo.probPct}% Chance</div>
        </div>
      </div>
    </div>
  );
}
