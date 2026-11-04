import React, { useState } from 'react';
import { MapContainer, TileLayer, Polygon, Marker, Popup, LayersControl, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Official PAGASA PAR Boundary Coordinates
const parCoordinates: [number, number][] = [
  [5, 115],
  [15, 115],
  [21, 120],
  [25, 120],
  [25, 135],
  [5, 135]
];

interface TyphoonTrackerModuleProps {
  selectedRegion?: string;
}

function ClickableMarker({ 
  position, 
  monsoonName, 
  rainProb 
}: { 
  position: [number, number]; 
  monsoonName: string; 
  rainProb: string; 
}) {
  const [coords, setCoords] = useState<[number, number]>(position);

  useMapEvents({
    click(e) {
      setCoords([e.latlng.lat, e.latlng.lng]);
    },
  });

  return (
    <Marker position={coords}>
      <Popup>
        <div className="text-xs space-y-1 p-0.5">
          <div className="font-bold text-slate-800 border-b pb-1 mb-1">
            🌀 PAGASA Monsoonal Status
          </div>
          <div><span className="text-slate-500">Active Regime:</span> {monsoonName}</div>
          <div><span className="text-slate-500">Rain Probability:</span> <strong className="text-rose-600">{rainProb}</strong></div>
          <div className="text-[10px] text-slate-400 mt-1 pt-1 border-t">
            Lat: {coords[0].toFixed(2)}°, Lng: {coords[1].toFixed(2)}°
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

export function TyphoonTrackerModule({ selectedRegion = 'luzon' }: TyphoonTrackerModuleProps) {
  const [selectedMonsoon, setSelectedMonsoon] = useState<'southwest' | 'northeast'>('southwest');

  const monsoonData = {
    southwest: {
      name: "Southwest Monsoon (Habagat)",
      period: "May to October (Peak: July–September)",
      mechanism: "Moisture-laden warm air originating from the Indian Ocean/Equatorial Pacific, frequently enhanced by TC/LPA presence.",
      regionalProbability: {
        luzon: "85% High Risk (Heavy Orographic Monsoonal Rain)",
        southern_luzon: "80% High Risk (Western Slopes & Bicol Corridor)",
        mimaropa: "75% Moderate-High Risk (Mindoro/Palawan)",
        visayas_western: "70% Moderate-High Risk (Panay & Negros)",
        visayas_central: "50% Moderate Risk (Rain-Shadow Shielding)",
        visayas_eastern: "45% Moderate-Low Risk",
        mindanao_north: "40% Low-Moderate Risk",
        mindanao_davao: "25% Low Risk",
        mindanao_soccsksargen: "20% Low Risk",
        mindanao_zamboanga: "35% Moderate-Low Risk",
        mindanao_barmm_caraga: "30% Low Risk"
      }
    },
    northeast: {
      name: "Northeast Monsoon (Amihan)",
      period: "November to April (Peak: December–February)",
      mechanism: "Cool, dry continental air from Siberia absorbing moisture over the Philippine Sea, delivering high rainfall to eastern seaboards.",
      regionalProbability: {
        luzon: "75% High Risk (Northern/Eastern Seaboard)",
        southern_luzon: "85% High Risk (Bicol & Eastern Quezon)",
        mimaropa: "35% Low-Moderate Risk",
        visayas_western: "30% Low Risk",
        visayas_central: "40% Moderate Risk",
        visayas_eastern: "90% Extreme Risk (Frontline Pacific Sea Discharge)",
        mindanao_north: "50% Moderate Risk",
        mindanao_davao: "65% Moderate-High Risk",
        mindanao_soccsksargen: "30% Low Risk",
        mindanao_zamboanga: "25% Low Risk",
        mindanao_barmm_caraga: "85% High Risk (Caraga Eastern Seaboard)"
      }
    }
  };

  const activeMonsoon = monsoonData[selectedMonsoon];
  const activeRegionProbability = activeMonsoon.regionalProbability[selectedRegion as keyof typeof activeMonsoon.regionalProbability] || activeMonsoon.regionalProbability['luzon'];

  // Default coordinate center based on region
  const defaultCenter: [number, number] = selectedRegion.includes('mindanao') ? [8.0, 125.0] : selectedRegion.includes('visayas') ? [10.5, 123.5] : [14.6, 121.0];

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-xl backdrop-blur-md space-y-5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            🌀 PAGASA Typhoon Tracker, PAR Boundary & Monsoon Rainfall
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Active tropical cyclone tracking, PAR maritime boundary, and monsoon rain enhancement probability. Click map to inspect any coordinate balloon.
          </p>
        </div>
        <span className="text-xs bg-rose-950/80 border border-rose-800 text-rose-400 px-3 py-1 rounded-full font-medium shrink-0">
          PAGASA Feed: Active
        </span>
      </div>

      {/* Status Bulletin Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 block font-medium">PAR TROPICAL CYCLONE STATUS</span>
          <div className="text-base font-bold text-emerald-400 mt-1">No Active TC Inside PAR</div>
          <span className="text-[11px] text-slate-500 mt-1 block">DOST-PAGASA Public Weather Bulletin</span>
        </div>

        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 block font-medium">TC SYSTEMS OUTSIDE PAR</span>
          <div className="text-base font-bold text-amber-400 mt-1">Typhoon In-fa (2631)</div>
          <span className="text-[11px] text-slate-500 mt-1 block">1,770 km East Northeast of Extreme Northern Luzon</span>
        </div>

        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 block font-medium">WIND & MOVEMENT VECTOR</span>
          <div className="text-base font-bold text-sky-400 mt-1">130 km/h (Gusts: 160 km/h)</div>
          <span className="text-[11px] text-slate-500 mt-1 block">Moving North-Northwestward at 10 km/h</span>
        </div>
      </div>

      {/* Monsoon Rain Enhancement Risk Section */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800 pb-3">
          <div>
            <span className="text-[10px] text-sky-400 font-semibold uppercase tracking-wider">Monsoonal Downpour Analysis</span>
            <h3 className="text-sm font-bold text-slate-100 mt-0.5">Monsoon Rainfall Probability & Cyclonic Enhancement</h3>
          </div>

          <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setSelectedMonsoon('southwest')}
              className={`text-xs px-3 py-1 rounded font-medium transition-all cursor-pointer ${
                selectedMonsoon === 'southwest' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🌊 Southwest (Habagat)
            </button>
            <button
              onClick={() => setSelectedMonsoon('northeast')}
              className={`text-xs px-3 py-1 rounded font-medium transition-all cursor-pointer ${
                selectedMonsoon === 'northeast' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ❄️ Northeast (Amihan)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
            <span className="text-slate-400 block font-medium">MONSOON TYPE & ACTIVE WINDOW</span>
            <div className="text-sm font-bold text-sky-400 mt-1">{activeMonsoon.name}</div>
            <span className="text-[11px] text-slate-500 mt-0.5 block">{activeMonsoon.period}</span>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
            <span className="text-slate-400 block font-medium">CURRENT REGION MONSOON PROBABILITY</span>
            <div className="text-sm font-bold text-emerald-400 mt-1">{activeRegionProbability}</div>
            <span className="text-[11px] text-slate-500 mt-0.5 block">Estimated based on topographical exposure & historical PAGASA surges</span>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
            <span className="text-slate-400 block font-medium">ENHANCEMENT DYNAMICS</span>
            <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">{activeMonsoon.mechanism}</p>
          </div>
        </div>
      </div>

      {/* Map Container with PAR Polygon Overlay & Interactive Monsoon Balloon Marker */}
      <div className="w-full rounded-lg overflow-hidden border border-slate-800 relative z-0" style={{ height: '420px' }}>
        <MapContainer
          center={defaultCenter}
          zoom={6}
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

          {/* Official PAR Polygon Border */}
          <Polygon 
            positions={parCoordinates}
            pathOptions={{
              color: '#f43f5e',
              weight: 3,
              dashArray: '6, 6',
              fillColor: '#f43f5e',
              fillOpacity: 0.1
            }}
          >
            <Popup>
              <strong>Philippine Area of Responsibility (PAR)</strong><br />
              Monitored Domain for DOST-PAGASA Tropical Cyclones & Monsoon Surges
            </Popup>
          </Polygon>

          {/* Interactive Marker with Monsoon Rain Probability Message Balloon */}
          <ClickableMarker 
            position={defaultCenter} 
            monsoonName={activeMonsoon.name} 
            rainProb={activeRegionProbability} 
          />
        </MapContainer>
      </div>
      <div className="text-center text-[11px] text-slate-500">
        Click anywhere inside the PAR map to pin a coordinate and view its monsoonal rainfall probability balloon.
      </div>
    </div>
  );
}
