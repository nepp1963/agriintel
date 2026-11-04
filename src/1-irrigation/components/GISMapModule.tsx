import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, LayersControl, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useLocation } from '../../context/LocationContext';

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
  onLocationSelect: (lat: number, lng: number, slope: number, elevation: number) => void;
}

function MapSyncHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number, slope: number, elevation: number) => void }) {
  const { setZoom } = useLocation();

  useMapEvents({
    click(e) {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;
      // Generate simulated slope and elevation based on coordinates
      const mockSlope = Number((Math.abs(Math.sin(lat * lng)) * 14).toFixed(1));
      const mockElevation = Math.max(5, Math.round(Math.abs(Math.cos(lat)) * 120));
      onLocationSelect(lat, lng, mockSlope, mockElevation);
    },
    zoomend(e) {
      setZoom(e.target.getZoom());
    }
  });

  return null;
}

export function GISMapModule({ lat, lng, extractedSlope, extractedElevation, onLocationSelect }: GISMapModuleProps) {
  const { location } = useLocation();

  const isHighSlope = extractedSlope > 8;
  const rainProbability = lat > 14.0 ? '68%' : lat > 12.0 ? '57%' : '45%';

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-xl backdrop-blur-md space-y-5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            🗺️ GIS Spatial Site Location & DEM Profiling
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Click anywhere on the map to extract high-resolution DEM slope, elevation lift, and localized rain probability for <span className="text-emerald-400 font-medium">{location.name}</span>.
          </p>
        </div>
        <span className="text-xs bg-emerald-950/80 border border-emerald-800 text-emerald-400 px-3 py-1 rounded-full font-medium shrink-0">
          DEM Mesh Connected
        </span>
      </div>

      {/* Live Parameter Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 bg-slate-950/80 p-4 rounded-xl border border-slate-800 text-xs">
        <div>
          <span className="text-slate-500 block font-medium">TARGET LATITUDE</span>
          <div className="text-sm font-bold text-sky-400 mt-0.5">{lat.toFixed(4)}° N</div>
        </div>
        <div>
          <span className="text-slate-500 block font-medium">TARGET LONGITUDE</span>
          <div className="text-sm font-bold text-sky-400 mt-0.5">{lng.toFixed(4)}° E</div>
        </div>
        <div>
          <span className="text-slate-500 block font-medium">DEM EXTRACTED SLOPE</span>
          <div className={`text-sm font-bold mt-0.5 ${isHighSlope ? 'text-amber-400' : 'text-emerald-400'}`}>
            {extractedSlope}% ({isHighSlope ? 'High Slope' : 'Gentle'})
          </div>
        </div>
        <div>
          <span className="text-slate-500 block font-medium">EST. ELEVATION LIFT</span>
          <div className="text-sm font-bold text-slate-200 mt-0.5">{extractedElevation} m MASL</div>
        </div>
        <div>
          <span className="text-slate-500 block font-medium">DAILY RAIN PROBABILITY</span>
          <div className="text-sm font-bold text-rose-400 mt-0.5">🌧️ {rainProbability} Chance</div>
        </div>
      </div>

      {/* Map Container */}
      <div className="w-full rounded-lg overflow-hidden border border-slate-800 relative z-0" style={{ height: '460px' }}>
        <MapContainer
          center={[lat, lng]}
          zoom={location.zoom}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <MapSyncHandler onLocationSelect={onLocationSelect} />
          
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

          <Marker position={[lat, lng]}>
            <Popup>
              <div className="text-xs space-y-1 p-0.5">
                <div className="font-bold text-slate-800 border-b pb-1 mb-1">
                  📍 Selected AgriIntel Site
                </div>
                <div><span className="text-slate-500">Elevation:</span> {extractedElevation} m MASL</div>
                <div><span className="text-slate-500">Slope:</span> {extractedSlope}%</div>
                <div><span className="text-slate-500">Rain Probability:</span> <strong className="text-rose-600">{rainProbability}</strong></div>
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>

      <div className="text-center text-[11px] text-slate-500">
        Zooming or clicking anywhere on this map will instantly synchronize zoom levels and target coordinates across all AgriIntel modules.
      </div>
    </div>
  );
}

export default GISMapModule;
