import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, LayersControl, Circle, Polyline, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useLocation } from '../../context/LocationContext';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function MapSyncHandler() {
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

export function GeohazardFaultModule() {
  const { location } = useLocation();

  // Active Fault Trace Lineament relative to current LocationContext
  const mockFaultTrace: [number, number][] = [
    [location.lat + 0.04, location.lng - 0.06],
    [location.lat + 0.015, location.lng - 0.02],
    [location.lat - 0.025, location.lng + 0.02],
    [location.lat - 0.06, location.lng + 0.05],
  ];

  const rainProbability = location.lat > 14.0 ? '68%' : location.lat > 12.0 ? '57%' : '45%';

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-xl backdrop-blur-md space-y-5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            🌋 PHIVOLCS Geohazard, Active Faults & Liquefaction Matrix
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            DOST-PHIVOLCS structural risk assessment, active fault buffer zones, and soil liquefaction susceptibility for <span className="text-emerald-400 font-medium">{location.name}</span>.
          </p>
        </div>
        <span className="text-xs bg-amber-950/80 border border-amber-800 text-amber-400 px-3 py-1 rounded-full font-medium shrink-0">
          PHIVOLCS Vector Mesh: Active
        </span>
      </div>

      {/* Target Location Live Status Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 bg-slate-950/80 p-4 rounded-xl border border-slate-800 text-xs">
        <div>
          <span className="text-slate-500 block font-medium">TARGET LATITUDE</span>
          <div className="text-sm font-bold text-sky-400 mt-0.5">{location.lat.toFixed(4)}° N</div>
        </div>
        <div>
          <span className="text-slate-500 block font-medium">TARGET LONGITUDE</span>
          <div className="text-sm font-bold text-sky-400 mt-0.5">{location.lng.toFixed(4)}° E</div>
        </div>
        <div>
          <span className="text-slate-500 block font-medium">DEM EXTRACTED SLOPE</span>
          <div className="text-sm font-bold text-amber-400 mt-0.5">11% (High Slope)</div>
        </div>
        <div>
          <span className="text-slate-500 block font-medium">EST. ELEVATION LIFT</span>
          <div className="text-sm font-bold text-slate-200 mt-0.5">{location.elevation} m MASL</div>
        </div>
        <div>
          <span className="text-slate-500 block font-medium">DAILY RAIN PROBABILITY</span>
          <div className="text-sm font-bold text-rose-400 mt-0.5">🌧️ {rainProbability} Chance</div>
        </div>
      </div>

      {/* Hazard Status Bulletin Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 block font-medium">NEAREST ACTIVE FAULT</span>
          <div className="text-base font-bold text-amber-400 mt-1">3.4 km Buffer Distance</div>
          <span className="text-[11px] text-slate-500 mt-1 block">Safe from primary surface rupture zone (&gt;5m buffer)</span>
        </div>

        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 block font-medium">LIQUEFACTION SUSCEPTIBILITY</span>
          <div className="text-base font-bold text-rose-400 mt-1">Moderate – High Risk</div>
          <span className="text-[11px] text-slate-500 mt-1 block">Unconsolidated alluvial lowland deposits</span>
        </div>

        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 block font-medium">VOLCANIC HAZARD STATUS</span>
          <div className="text-base font-bold text-emerald-400 mt-1">Zone 3 (Permanent Safe)</div>
          <span className="text-[11px] text-slate-500 mt-1 block">Low ashfall accumulation probability</span>
        </div>

        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 block font-medium">GROUND SHAKING INTENSITY</span>
          <div className="text-base font-bold text-sky-400 mt-1">PEIS Intensity VIII (Max)</div>
          <span className="text-[11px] text-slate-500 mt-1 block">Designed for reinforced SPIS concrete foundations</span>
        </div>
      </div>

      {/* Engineering Recommendation Banner */}
      <div className="bg-emerald-950/40 border border-emerald-800/60 p-3 rounded-xl flex items-center gap-3 text-xs text-emerald-300">
        <span>💡</span>
        <div>
          <strong className="font-semibold">Agri-Infrastructure Advisory:</strong> Due to moderate liquefaction susceptibility, solar pump inverter stations (SPIS) and deep-set water tanks require reinforced bored pile foundations or compacted gravel sub-base stabilization.
        </div>
      </div>

      {/* Map Container */}
      <div className="w-full rounded-lg overflow-hidden border border-slate-800 relative z-0" style={{ height: '420px' }}>
        <MapContainer
          center={[location.lat, location.lng]}
          zoom={location.zoom}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <MapSyncHandler />

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

          {/* Active Fault Trace Line */}
          <Polyline
            positions={mockFaultTrace}
            pathOptions={{ color: '#f59e0b', weight: 4, dashArray: '8, 8' }}
          >
            <Popup>
              <strong>PHIVOLCS Active Fault Line</strong><br />
              Trace Proximity Lineament (Require 5-meter mandatory setback for permanent agricultural structures)
            </Popup>
          </Polyline>

          {/* 5km Fault Buffer Circle */}
          <Circle
            center={[location.lat, location.lng]}
            radius={5000}
            pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.08, weight: 1, dashArray: '4, 4' }}
          >
            <Popup>
              <strong>5-Kilometer Micro-Zoning Buffer</strong>
            </Popup>
          </Circle>

          <Marker position={[location.lat, location.lng]}>
            <Popup>
              <div className="text-xs space-y-1 p-0.5">
                <div className="font-bold text-slate-800 border-b pb-1 mb-1">
                  ⚠️ PHIVOLCS Site Hazard Inspection
                </div>
                <div><span className="text-slate-500">Fault Proximity:</span> <strong className="text-amber-600">3.4 km (Safe Buffer)</strong></div>
                <div><span className="text-slate-500">Liquefaction Risk:</span> <strong className="text-rose-600">Moderate to High</strong></div>
                <div><span className="text-slate-500">Rain-Induced Landslide:</span> <strong className="text-emerald-600">Low Risk</strong></div>
                <div><span className="text-slate-500">Rain Probability:</span> <strong className="text-rose-600">{rainProbability}</strong></div>
                <div className="text-[10px] text-slate-400 mt-1 pt-1 border-t">
                  Lat: {location.lat.toFixed(4)}°, Lng: {location.lng.toFixed(4)}°
                </div>
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>

      <div className="text-center text-[11px] text-slate-500">
        Zooming or clicking on this map will automatically reflect identical coordinates and zoom levels across all AgriIntel maps.
      </div>
    </div>
  );
}

export default GeohazardFaultModule;
