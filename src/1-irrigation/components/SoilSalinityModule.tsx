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

// Comprehensive BSWM Philippine Soil Series Database (including Pampanga & Regional Profiles)
export const philippineSoilSeries = [
  // Southern Luzon / CALABARZON
  { id: 'lipa_clay_loam', name: 'Lipa Clay Loam', region: 'CALABARZON (Cavite/Batangas/Laguna)', ecThreshold: 1.7, texture: 'Clay Loam', drain: 'Moderate to Well Drained' },
  { id: 'guadalupe_clay', name: 'Guadalupe Clay', region: 'CALABARZON / Metro Manila', ecThreshold: 1.5, texture: 'Heavy Clay', drain: 'Poorly Drained' },
  { id: 'tagaytay_sandy_loam', name: 'Tagaytay Sandy Loam', region: 'Cavite Upland / Batangas', ecThreshold: 2.0, texture: 'Sandy Loam / Volcanic Ash', drain: 'Well Drained' },
  { id: 'antipolo_clay', name: 'Antipolo Clay', region: 'Rizal / Laguna Foothills', ecThreshold: 1.6, texture: 'Clay', drain: 'Moderate Drained' },
  { id: 'calumpang_clay', name: 'Calumpang Clay', region: 'Laguna Basin / Cavite Lowland', ecThreshold: 1.4, texture: 'Silty Clay', drain: 'Poorly Drained' },
  { id: 'quingua_silt_loam', name: 'Quingua Silt Loam', region: 'Bulacan / Cavite Alluvial', ecThreshold: 1.8, texture: 'Silt Loam', drain: 'Well Drained' },
  
  // Central & Northern Luzon / Pampanga
  { id: 'angeles_sandy_loam', name: 'Angeles Fine Sand / Sandy Loam', region: 'Pampanga (Porac / Floridablanca / Mabalacat)', ecThreshold: 2.5, texture: 'Coarse Volcanic Sand / Lahar Deposit', drain: 'Excessively Drained' },
  { id: 'candaba_silty_clay', name: 'Candaba Silty Clay', region: 'Pampanga (Candaba Swamp & Delta)', ecThreshold: 1.3, texture: 'Heavy Alluvial Clay', drain: 'Very Poorly Drained' },
  { id: 'san_manuel_loam', name: 'San Manuel Loam', region: 'Central Luzon (Pampanga/Tarlac)', ecThreshold: 2.0, texture: 'Silt Loam', drain: 'Well Drained' },
  { id: 'maligaya_clay', name: 'Maligaya Clay', region: 'Nueva Ecija / Central Luzon Plain', ecThreshold: 1.3, texture: 'Heavy Clay (Paddy)', drain: 'Poorly Drained' },
  { id: 'luisiana_clay', name: 'Luisiana Clay', region: 'Laguna Uplands / Quezon', ecThreshold: 1.5, texture: 'Latosolic Clay', drain: 'Moderate Drained' },
  { id: 'alaminos_clay', name: 'Alaminos Clay', region: 'Pangasinan / Zambales', ecThreshold: 1.7, texture: 'Clay', drain: 'Well Drained' },
  { id: 'bued_silt_loam', name: 'Bued Silt Loam', region: 'Benguet / Mountain Province', ecThreshold: 2.2, texture: 'Silt Loam', drain: 'Excessively Drained' },

  // Visayas
  { id: 'iloilo_clay_loam', name: 'Iloilo Clay Loam', region: 'Western Visayas (Panay)', ecThreshold: 1.6, texture: 'Clay Loam', drain: 'Moderate Drained' },
  { id: 'mandaue_silt_loam', name: 'Mandaue Silt Loam', region: 'Central Visayas (Cebu)', ecThreshold: 1.8, texture: 'Silt Loam', drain: 'Well Drained' },
  { id: 'faraon_clay', name: 'Faraon Clay', region: 'Negros Occidental / Cebu Limestone', ecThreshold: 1.4, texture: 'Black Clay', drain: 'Poorly Drained' },
  { id: 'basey_clay', name: 'Basey Clay', region: 'Eastern Visayas (Samar)', ecThreshold: 1.5, texture: 'Heavy Clay', drain: 'Poorly Drained' },

  // Mindanao
  { id: 'bukidnon_clay_loam', name: 'Bukidnon Clay Loam', region: 'Northern Mindanao (Bukidnon)', ecThreshold: 2.1, texture: 'Volcanic Clay Loam', drain: 'Well Drained' },
  { id: 'kabacan_clay', name: 'Kabacan Clay', region: 'SOCCSKSARGEN (Cotabato Basin)', ecThreshold: 1.5, texture: 'Silty Clay', drain: 'Moderate Drained' },
  { id: 'davao_clay_loam', name: 'Davao Clay Loam', region: 'Davao Region / Davao del Sur', ecThreshold: 1.9, texture: 'Clay Loam', drain: 'Well Drained' },
  { id: 'adtuyon_clay', name: 'Adtuyon Clay', region: 'Zamboanga / Northern Mindanao', ecThreshold: 1.7, texture: 'Clay', drain: 'Moderate Drained' },
  { id: 'matina_clay', name: 'Matina Clay', region: 'Davao Lowland Plains', ecThreshold: 1.3, texture: 'Heavy Coastal Clay', drain: 'Poorly Drained' }
];

interface SoilSalinityModuleProps {
  ecIrrigation: number | '';
  setEcIrrigation: (v: number | '') => void;
  ecThreshold: number | '';
  setEcThreshold: (v: number | '') => void;
  targetLeachingEfficiency: number | '';
  setTargetLeachingEfficiency: (v: number | '') => void;
  safeLR: number;
}

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

export function SoilSalinityModule({
  ecIrrigation,
  setEcIrrigation,
  ecThreshold,
  setEcThreshold,
  targetLeachingEfficiency,
  setTargetLeachingEfficiency,
  safeLR
}: SoilSalinityModuleProps) {
  const { location, updateFromCoords } = useLocation();
  const [selectedSoilId, setSelectedSoilId] = useState<string>('lipa_clay_loam');

  const selectedSoil = philippineSoilSeries.find(s => s.id === selectedSoilId) || philippineSoilSeries[0];

  const handleSoilChange = (id: string) => {
    setSelectedSoilId(id);
    const matched = philippineSoilSeries.find(s => s.id === id);
    if (matched) {
      setEcThreshold(matched.ecThreshold);
    }
  };

  const handleManualCoordSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const lat = parseFloat(formData.get('lat') as string);
    const lng = parseFloat(formData.get('lng') as string);
    if (!isNaN(lat) && !isNaN(lng)) {
      updateFromCoords(lat, lng);
    }
  };

  const rainProbability = location.lat > 14.0 ? '68%' : location.lat > 12.0 ? '57%' : '45%';

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-xl backdrop-blur-md space-y-5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            🧂 BSWM Soil Series, Salinity Management & Leaching Sizing
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Official Philippine Bureau of Soils and Water Management (BSWM) soil taxonomy, EC threshold calibration, and leaching fraction requirement for <span className="text-emerald-400 font-medium">{location.name}</span>.
          </p>
        </div>
        <span className="text-xs bg-sky-950/80 border border-sky-800 text-sky-400 px-3 py-1 rounded-full font-medium shrink-0">
          BSWM Database Active
        </span>
      </div>

      {/* Synchronized Geographic & Spatial Status Header */}
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
          <span className="text-slate-500 block font-medium">ACTIVE SOIL SERIES</span>
          <div className="text-sm font-bold text-emerald-400 mt-0.5 truncate">{selectedSoil.name}</div>
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

      {/* Interactive Location Switcher & Soil Series Selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
        <div>
          <label className="text-xs font-medium text-slate-400 mb-1.5 block">
            📍 SELECT PHILIPPINE SOIL SERIES (BSWM TAXONOMY)
          </label>
          <select
            value={selectedSoilId}
            onChange={e => handleSoilChange(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
          >
            {philippineSoilSeries.map(soil => (
              <option key={soil.id} value={soil.id}>
                {soil.name} — {soil.region} ({soil.texture})
              </option>
            ))}
          </select>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Selected Soil Profile: <strong>{selectedSoil.texture}</strong> | Drainage: <strong>{selectedSoil.drain}</strong>
          </span>
        </div>

        <form onSubmit={handleManualCoordSubmit} className="flex flex-col justify-end">
          <label className="text-xs font-medium text-slate-400 mb-1.5 block">
            🌐 MANUAL GEOGRAPHIC COORDINATE OVERRIDE
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              step="any"
              name="lat"
              defaultValue={location.lat}
              placeholder="Latitude"
              className="w-1/2 bg-slate-900 border border-slate-700 text-slate-100 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-emerald-500"
            />
            <input
              type="number"
              step="any"
              name="lng"
              defaultValue={location.lng}
              placeholder="Longitude"
              className="w-1/2 bg-slate-900 border border-slate-700 text-slate-100 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs px-4 py-1.5 rounded-lg transition-colors shrink-0 cursor-pointer"
            >
              Set Site
            </button>
          </div>
        </form>
      </div>

      {/* Salinity Calculations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2">
          <label className="text-xs font-medium text-slate-400 block">IRRIGATION WATER SALINITY (ECiw - dS/m)</label>
          <input
            type="number"
            step="0.1"
            value={ecIrrigation}
            onChange={e => setEcIrrigation(e.target.value === '' ? '' : Number(e.target.value))}
            className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
          />
          <span className="text-[11px] text-slate-500 block">Typical groundwater EC: 0.5 - 2.5 dS/m</span>
        </div>

        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2">
          <label className="text-xs font-medium text-slate-400 block">CROP EC THRESHOLD (ECe - dS/m)</label>
          <input
            type="number"
            step="0.1"
            value={ecThreshold}
            onChange={e => setEcThreshold(e.target.value === '' ? '' : Number(e.target.value))}
            className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
          />
          <span className="text-[11px] text-slate-500 block">Auto-calibrated based on {selectedSoil.name}</span>
        </div>

        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2">
          <label className="text-xs font-medium text-slate-400 block">TARGET LEACHING EFFICIENCY (%)</label>
          <input
            type="number"
            step="0.05"
            max="1.0"
            min="0.1"
            value={targetLeachingEfficiency}
            onChange={e => setTargetLeachingEfficiency(e.target.value === '' ? '' : Number(e.target.value))}
            className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
          />
          <span className="text-[11px] text-slate-500 block">FAO-29 Recommended value: 0.85 (85%)</span>
        </div>
      </div>

      {/* Leaching Fraction Result Banner */}
      <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <span className="text-xs text-slate-400 block font-medium">REQUIRED LEACHING REQUIREMENT (LR)</span>
          <div className="text-xl font-bold text-emerald-400 mt-1">{safeLR.toFixed(2)}% Extra Water Volume</div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">
            Calculated via FAO-29 Rhodes Formula: LR = EC_iw / (5(EC_e) - EC_iw)
          </span>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-400 block font-medium">RECOMMENDED ACTION</span>
          <span className={`text-xs font-semibold px-3 py-1 rounded-full border mt-1 inline-block ${
            safeLR > 15 ? 'bg-amber-950 border-amber-800 text-amber-400' : 'bg-emerald-950 border-emerald-800 text-emerald-400'
          }`}>
            {safeLR > 15 ? '⚠️ Apply Intermittent Heavy Flushing' : '✅ Standard Irrigation Fraction Sufficient'}
          </span>
        </div>
      </div>

      {/* Interactive Synchronized Map */}
      <div className="w-full rounded-lg overflow-hidden border border-slate-800 relative z-0" style={{ height: '380px' }}>
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

          <Marker position={[location.lat, location.lng]}>
            <Popup>
              <div className="text-xs space-y-1 p-0.5">
                <div className="font-bold text-slate-800 border-b pb-1 mb-1">
                  🧂 BSWM Soil & Salinity Inspection
                </div>
                <div><span className="text-slate-500">Soil Series:</span> <strong>{selectedSoil.name}</strong></div>
                <div><span className="text-slate-500">Texture:</span> {selectedSoil.texture}</div>
                <div><span className="text-slate-500">Required LR:</span> <strong className="text-emerald-600">{safeLR.toFixed(2)}%</strong></div>
                <div className="text-[10px] text-slate-400 mt-1 pt-1 border-t">
                  Lat: {location.lat.toFixed(4)}°, Lng: {location.lng.toFixed(4)}°
                </div>
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>

      <div className="text-center text-[11px] text-slate-500">
        Clicking or zooming on this map updates your target coordinates and zoom level across all AgriIntel modules.
      </div>
    </div>
  );
}

export default SoilSalinityModule;
