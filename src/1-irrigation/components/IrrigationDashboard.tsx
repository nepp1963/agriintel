import React, { useState } from 'react';
import SoilSalinityModule from './SoilSalinityModule';
import FarmPlanningModule from './FarmPlanningModule';
import { useLocation } from '../../context/LocationContext';
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Complete Philippine Regional Extreme Weather & Crop Suitability Intelligence Dataset (All 17 Regions)
const REGIONAL_INTELLIGENCE: Record<string, {
  name: string;
  lat: number;
  lng: number;
  climateType: string;
  typhoonFrequency: string;
  extremeEvents: string[];
  cropSuitability: { crop: string; rating: string; advisory: string }[];
}> = {
  'Region I (Ilocos Region)': {
    name: 'Region I (Ilocos Region)',
    lat: 16.0792,
    lng: 120.3308,
    climateType: 'Type I (Pronounced dry Nov–Apr, wet May–Oct)',
    typhoonFrequency: 'High (4 to 5 Tropical Cyclones / year)',
    extremeEvents: ['Prolonged summer drought', 'Monsoon flash floods', 'Coastal storm surges'],
    cropSuitability: [
      { crop: 'Lowland Rice & Tobacco', rating: 'S1 - Highly Suitable', advisory: 'Thrives during dry season with regulated irrigation.' },
      { crop: 'Mango & Legumes', rating: 'S1 - Highly Suitable', advisory: 'Excellent performance in well-drained rolling terrain.' }
    ]
  },
  'Region II (Cagayan Valley)': {
    name: 'Region II (Cagayan Valley)',
    lat: 17.6132,
    lng: 121.7270,
    climateType: 'Type III (Seasons not very pronounced, relatively dry)',
    typhoonFrequency: 'Very High (Direct entry corridor for Super Typhoons)',
    extremeEvents: ['Catastrophic Cagayan River Basin flooding', 'Severe typhoons & sustained gales', 'Agricultural drought'],
    cropSuitability: [
      { crop: 'Corn & Lowland Rice', rating: 'S1 - Highly Suitable', advisory: 'Major corn granary; monitor fourth-quarter typhoon risks.' },
      { crop: 'Citrus & Banana', rating: 'S2 - Moderately Suitable', advisory: 'Prone to wind damage during peak typhoon months.' }
    ]
  },
  'Region III (Central Luzon)': {
    name: 'Region III (Central Luzon)',
    lat: 15.0286,
    lng: 120.6896,
    climateType: 'Type I (Pronounced dry and wet seasons)',
    typhoonFrequency: 'High (4 to 5 Tropical Cyclones / year)',
    extremeEvents: ['Pampanga River Basin agricultural inundation', 'Severe summer heat & irrigation water deficits', 'Typhoon wind damage'],
    cropSuitability: [
      { crop: 'Lowland Paddy Rice', rating: 'S1 - Highly Suitable', advisory: 'Rice granary; double-cropping highly viable.' },
      { crop: 'Bulb Onion & Garlic', rating: 'S1 - Highly Suitable', advisory: 'Ideal during dry season in Nueva Ecija/Tarlac.' }
    ]
  },
  'Region IV-A (CALABARZON)': {
    name: 'CALABARZON (Region IV-A)',
    lat: 14.45896,
    lng: 120.93851,
    climateType: 'Type I (Two pronounced seasons)',
    typhoonFrequency: 'Moderate - High (3 to 4 Cyclones / year)',
    extremeEvents: ['Monsoon Surge Flash Floods (Habagat)', 'Volcanic ashfall & lahar risks (Taal)', 'Prolonged dry spells (El Niño)'],
    cropSuitability: [
      { crop: 'Lowland Paddy Rice', rating: 'S1 - Highly Suitable', advisory: 'Requires drainage management during peak wet season.' },
      { crop: 'High-Value Upland Crops', rating: 'S1 - Highly Suitable', advisory: 'Optimal in volcanic loam upland zones (Lipa/Tagaytay).' }
    ]
  },
  'MIMAROPA (Region IV-B)': {
    name: 'MIMAROPA (Region IV-B)',
    lat: 12.7503,
    lng: 121.1812,
    climateType: 'Type I & III (Short dry season)',
    typhoonFrequency: 'Moderate (3 Cyclones / year)',
    extremeEvents: ['Coastal storm surges', 'Flash floods in island river basins', 'Seasonal dry-season water stress'],
    cropSuitability: [
      { crop: 'Cashew, Coconut & Rice', rating: 'S1 - Highly Suitable', advisory: 'Thrives across Palawan and Mindoro alluvial valleys.' },
      { crop: 'Cassava & Root Crops', rating: 'S1 - Highly Suitable', advisory: 'Resilient in sandy coastal loam soils.' }
    ]
  },
  'Region V (Bicol Region)': {
    name: 'Bicol Region (Region V)',
    lat: 13.6218,
    lng: 123.1948,
    climateType: 'Type II & IV (No dry season, pronounced max rainfall)',
    typhoonFrequency: 'Very High (Direct Typhoon Belt: 5+ Cyclones / year)',
    extremeEvents: ['Super Typhoon wind damage & storm surges', 'Volcanic lahar flows (Mayon)', 'Continuous soil saturation'],
    cropSuitability: [
      { crop: 'Coconut & Abaca', rating: 'S1 - Highly Suitable', advisory: 'Resilient perennial crops suited for continuous rainfall.' },
      { crop: 'Lowland Rice', rating: 'S2 - Moderately Suitable', advisory: 'High crop loss risk during late fourth-quarter typhoons.' }
    ]
  },
  'Region VI (Western Visayas)': {
    name: 'Western Visayas (Region VI)',
    lat: 10.7202,
    lng: 122.5621,
    climateType: 'Type I & III (Short dry season 1–3 months)',
    typhoonFrequency: 'Moderate (2 to 3 Cyclones / year)',
    extremeEvents: ['Agricultural drought (El Niño)', 'Riverine flooding (Jaro/Jalaur basins)', 'Salinity intrusion'],
    cropSuitability: [
      { crop: 'Sugarcane & Grains', rating: 'S1 - Highly Suitable', advisory: 'Extremely productive in well-drained alluvial plains.' },
      { crop: 'Rainfed Rice', rating: 'S2 - Moderately Suitable', advisory: 'Vulnerable to onset delays of the wet monsoon.' }
    ]
  },
  'Region VII (Central Visayas)': {
    name: 'Region VII (Central Visayas)',
    lat: 10.3157,
    lng: 123.8854,
    climateType: 'Type III (Seasons not very pronounced)',
    typhoonFrequency: 'Low - Moderate (1 to 2 Cyclones / year)',
    extremeEvents: ['Severe El Niño water scarcity', 'Karst aquifer drought vulnerability', 'Localized coastal flash floods'],
    cropSuitability: [
      { crop: 'Corn, Cassava & Mango', rating: 'S1 - Highly Suitable', advisory: 'Well-adapted to rolling limestone-derived soils.' },
      { crop: 'Lowland Rice', rating: 'S3 - Marginally Suitable', advisory: 'Limited by seasonal water availability.' }
    ]
  },
  'Region VIII (Eastern Visayas)': {
    name: 'Eastern Visayas (Region VIII)',
    lat: 11.2434,
    lng: 125.0047,
    climateType: 'Type II & IV (No dry season, very high rainfall)',
    typhoonFrequency: 'Very High (Primary landfall zone for major typhoons)',
    extremeEvents: ['Catastrophic storm surges (Haiyan-type)', 'Continuous torrential rainfall & landslides', 'Severe river siltation'],
    cropSuitability: [
      { crop: 'Coconut & Abaca', rating: 'S1 - Highly Suitable', advisory: 'Primary livelihood crop resilient to high moisture.' },
      { crop: 'Lowland Rice', rating: 'S2 - Moderately Suitable', advisory: 'Requires robust drainage networks.' }
    ]
  },
  'Region IX (Zamboanga Peninsula)': {
    name: 'Zamboanga Peninsula (Region IX)',
    lat: 7.9042,
    lng: 123.2505,
    climateType: 'Type IV (Evenly distributed rainfall throughout year)',
    typhoonFrequency: 'Low (Outside main typhoon belt)',
    extremeEvents: ['Localized flash floods', 'Prolonged dry spells during regional drought', 'Pest and disease outbreaks in rubber'],
    cropSuitability: [
      { crop: 'Rubber, Coconut & Fruit Trees', rating: 'S1 - Highly Suitable', advisory: 'Thrives in stable equatorial climate.' },
      { crop: 'Lowland Rice', rating: 'S2 - Moderately Suitable', advisory: 'Viable in irrigated river valley basins.' }
    ]
  },
  'Region X (Northern Mindanao)': {
    name: 'Northern Mindanao (Region X)',
    lat: 8.2280,
    lng: 124.2452,
    climateType: 'Type III & IV (No pronounced dry season)',
    typhoonFrequency: 'Low (Infrequent direct strikes)',
    extremeEvents: ['Upland flash floods (Sendong-type)', 'Prolonged dry spells', 'Landslides in mountainous agricultural zones'],
    cropSuitability: [
      { crop: 'Pineapple, Banana & Corn', rating: 'S1 - Highly Suitable', advisory: 'Major commercial agro-industrial zone (Bukidnon plateau).' },
      { crop: 'Lowland Rice', rating: 'S1 - Highly Suitable', advisory: 'High yields in Bukidnon and Agusan river valleys.' }
    ]
  },
  'Region XI (Davao Region)': {
    name: 'Davao Region (Region XI)',
    lat: 7.1907,
    lng: 125.4553,
    climateType: 'Type IV (Rainfall evenly distributed)',
    typhoonFrequency: 'Very Low (Generally typhoon-free)',
    extremeEvents: ['Strong convective thunderstorms', 'El Niño agricultural moisture stress', 'Seismic activity & landslides'],
    cropSuitability: [
      { crop: 'Cavendish Banana, Durian & Cacao', rating: 'S1 - Highly Suitable', advisory: 'Prime export fruit production zone.' },
      { crop: 'Coconut & Palm Oil', rating: 'S1 - Highly Suitable', advisory: 'Excellent climatic fit.' }
    ]
  },
  'Region XII (SOCCSKSARGEN)': {
    name: 'SOCCSKSARGEN (Region XII)',
    lat: 6.2704,
    lng: 124.6053,
    climateType: 'Type IV (Rainfall evenly distributed)',
    typhoonFrequency: 'Very Low (Typhoon-free zone)',
    extremeEvents: ['Agricultural drought / El Niño grain loss', 'River basin flooding (Cotabato marshlands)', 'Convective flash floods'],
    cropSuitability: [
      { crop: 'Corn, Rice & Palm Oil', rating: 'S1 - Highly Suitable', advisory: 'Highly productive agricultural plains (Cotabato/Koronadal).' },
      { crop: 'Coffee & Rubber', rating: 'S1 - Highly Suitable', advisory: 'Thrives in upland volcanic soils.' }
    ]
  },
  'Region XIII (Caraga)': {
    name: 'Caraga (Region XIII)',
    lat: 8.9504,
    lng: 125.5312,
    climateType: 'Type II (No dry season, maximum rainfall in winter)',
    typhoonFrequency: 'Moderate - High (Eastern seaboard exposure)',
    extremeEvents: ['Severe riverine flooding (Agusan River Basin)', 'Continuous heavy winter monsoon rains', 'Coastal storm surges'],
    cropSuitability: [
      { crop: 'Timber, Palm Oil & Rubber', rating: 'S1 - Highly Suitable', advisory: 'Ideal forestry and agro-forestry climate.' },
      { crop: 'Lowland Rice', rating: 'S2 - Moderately Suitable', advisory: 'Prone to seasonal inundation in Agusan basin.' }
    ]
  },
  'CAR (Cordillera Administrative Region)': {
    name: 'Cordillera Administrative Region (CAR)',
    lat: 16.4023,
    lng: 120.5960,
    climateType: 'Type I & III (Pronounced dry/wet with cool high-altitude climate)',
    typhoonFrequency: 'High (Mountainous windward exposure)',
    extremeEvents: ['Catastrophic mountain landslides & road slips', 'Severe typhoon wind & rain battering', 'Sub-zero frost events in high peaks'],
    cropSuitability: [
      { crop: 'Temperate Vegetables (Potato/Cabbage)', rating: 'S1 - Highly Suitable', advisory: 'Requires terraced farming and soil erosion control.' },
      { crop: 'Strawberries & Cut Flowers', rating: 'S1 - Highly Suitable', advisory: 'High-value highland specialty crops.' }
    ]
  },
  'NCR (National Capital Region)': {
    name: 'National Capital Region (NCR)',
    lat: 14.5995,
    lng: 120.9842,
    climateType: 'Type I (Pronounced dry Nov–Apr, wet May–Oct)',
    typhoonFrequency: 'Moderate - High (Direct urban exposure)',
    extremeEvents: ['Urban tidal & monsoon flooding (Marikina/Pasig basins)', 'Severe heat island effect', 'Typhoon windstorm disruptions'],
    cropSuitability: [
      { crop: 'Urban Agriculture & Hydroponics', rating: 'S1 - Highly Suitable', advisory: 'Controlled environment agriculture and rooftop farming.' },
      { crop: 'Conventional Field Crops', rating: 'S3 - Marginally Suitable', advisory: 'Extremely limited by urbanization and industrial conversion.' }
    ]
  },
  'BARMM (Bangsamoro)': {
    name: 'BARMM (Bangsamoro)',
    lat: 7.2230,
    lng: 124.2431,
    climateType: 'Type IV (Rainfall evenly distributed)',
    typhoonFrequency: 'Very Low (Typhoon-free)',
    extremeEvents: ['Lingering Liguasan Marsh seasonal flooding', 'Prolonged dry spells', 'River siltation'],
    cropSuitability: [
      { crop: 'Corn, Cassava & Rubber', rating: 'S1 - Highly Suitable', advisory: 'Extensive alluvial agricultural potential.' },
      { crop: 'Aquaculture & Inland Fisheries', rating: 'S1 - Highly Suitable', advisory: 'Unmatched potential across marshland and coastal zones.' }
    ]
  }
};

const PAR_POLYGON_COORDS: [number, number][] = [
  [25.0, 120.0],
  [25.0, 135.0],
  [5.0, 135.0],
  [5.0, 115.0],
  [15.0, 115.0],
  [21.0, 120.0],
];

function SyncedMapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

function MapEventsHandler({ onZoomChange, onClickChange }: { onZoomChange?: (z: number) => void; onClickChange?: (lat: number, lng: number) => void }) {
  useMapEvents({
    zoomend(e) {
      if (onZoomChange) onZoomChange(e.target.getZoom());
    },
    click(e) {
      if (onClickChange) onClickChange(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
}

export function IrrigationDashboard() {
  const [activeTab, setActiveTab] = useState<
    'spis' | 'gis' | 'weather' | 'typhoon' | 'phivolcs' | 'watershed' | 'land' | 'soil' | 'farmPlan'
  >('spis');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [accentColor, setAccentColor] = useState<string>('#10b981'); // Emerald default
  const { location, updateFromCoords } = useLocation();

  // Selected Regional Intelligence Preset
  const [selectedRegionKey, setSelectedRegionKey] = useState<string>('Region IV-A (CALABARZON)');
  const activeRegionData = REGIONAL_INTELLIGENCE[selectedRegionKey] || REGIONAL_INTELLIGENCE['Region IV-A (CALABARZON)'];

  // Map view mode toggle ('street' vs 'satellite')
  const [sharedZoom, setSharedZoom] = useState<number>(13);
  const [mapViewMode, setMapViewMode] = useState<'satellite' | 'street'>('satellite');

  // Advanced SPIS Inputs
  const [regionPreset, setRegionPreset] = useState('Region IV-A (CALABARZON)');
  const [cropProfile, setCropProfile] = useState('Lowland Rice / Paddy (Wetland)');
  const [temp, setTemp] = useState(31.5);
  const [solarRad, setSolarRad] = useState(21);
  const [phenologicalStage, setPhenologicalStage] = useState('Mid-Season Stage (Kc: 1.2)');
  const [soilTexture, setSoilTexture] = useState('Heavy Clay (AWHC: 180 mm/m)');

  const [appMethod, setAppMethod] = useState('Surface Flooding (45% Eff)');
  const [flowRate, setFlowRate] = useState(5); // L/s
  const [staticLift, setStaticLift] = useState(12);
  const [pipeLength, setPipeLength] = useState(150);
  const [pipeDiameter, setPipeDiameter] = useState(75);
  const [minorLossPct, setMinorLossPct] = useState(10);
  const [opPressure, setOpPressure] = useState(10);

  // Solar & BoS Sizing Inputs
  const [peakSunHours, setPeakSunHours] = useState(5.2);
  const [solarSpecWatt, setSolarSpecWatt] = useState<number>(350); // Watts
  const [selectedDcVoltage, setSelectedDcVoltage] = useState<number>(48); // 12, 24, or 48 VDC
  const [batteryAh, setBatteryAh] = useState<number>(200); // 100, 200, or 314 Ah

  const [dieselPrice, setDieselPrice] = useState(60);
  const [annualDays, setAnnualDays] = useState(240);

  // Hydraulics & TDH Calculations
  const frictionLossNum = Number(((pipeLength * 0.02) / (pipeDiameter / 1000)).toFixed(1));
  const minorLossNum = Number(((staticLift + frictionLossNum) * (minorLossPct / 100)).toFixed(1));
  const totalTDHNum = Number((staticLift + frictionLossNum + minorLossNum + opPressure).toFixed(1));
  
  // Daily Volume & Energy Calculations
  const dailyYieldVal = (flowRate * 3.6 * peakSunHours * 1.3).toFixed(1); // m3/day
  
  const hydraulicPowerKw = (9.81 * flowRate * totalTDHNum) / 1000;
  const pumpEfficiency = 0.45; // 45% overall motor/pump efficiency
  const requiredElectricalKw = hydraulicPowerKw / pumpEfficiency;

  // 1. Dynamic Solar Panel Sizing
  const totalSolarKwRequired = (requiredElectricalKw * 1.25);
  const calculatedPanelsCount = Math.max(1, Math.ceil((totalSolarKwRequired * 1000) / solarSpecWatt));

  // 2. Dynamic LiFePO4 Battery Sizing
  const dailyEnergyWh = (requiredElectricalKw * 1000) * peakSunHours;
  const dodFactor = 0.80;
  const totalWhCapacityNeeded = dailyEnergyWh / dodFactor;
  const requiredAhAtSystemVoltage = totalWhCapacityNeeded / selectedDcVoltage;
  const calculatedBatteriesCount = Math.max(1, Math.ceil(requiredAhAtSystemVoltage / batteryAh));

  // Conic gradient calculations for TDH Pie Chart
  const pStatic = (staticLift / totalTDHNum) * 100;
  const pFriction = (frictionLossNum / totalTDHNum) * 100;
  const pMinor = (minorLossNum / totalTDHNum) * 100;
  const pPress = (opPressure / totalTDHNum) * 100;

  const c1 = pStatic;
  const c2 = c1 + pFriction;
  const c3 = c2 + pMinor;

  const tdhConicGradient = `conic-gradient(
    #64748b 0% ${c1}%, 
    #f59e0b ${c1}% ${c2}%, 
    #eab308 ${c2}% ${c3}%, 
    #06b6d4 ${c3}% 100%
  )`;

  // Watershed Hydrology States
  const [rainfallDepth, setRainfallDepth] = useState(75);
  const [curveNumber, setCurveNumber] = useState(75);
  const [hydrologicGroup, setHydrologicGroup] = useState('Group B (Moderate Infiltration)');
  const [tcHours, setTcHours] = useState(2.4);

  const computeRunoff = () => {
    const P = rainfallDepth / 25.4;
    const S = 1000 / curveNumber - 10;
    const Ia = 0.2 * S;
    if (P <= Ia) return "0.00";
    const Qin = Math.pow(P - Ia, 2) / (P - Ia + S);
    return (Qin * 25.4).toFixed(2);
  };

  // Land Suitability States
  const [landUseTarget, setLandUseTarget] = useState('Lowland Rice Paddy');
  const [soilDepth, setSoilDepth] = useState('> 100 cm (Deep)');
  const [soilSlopePct, setSoilSlopePct] = useState(2);

  const evaluateSuitability = () => {
    if (soilSlopePct > 8) return { class: 'S3 - Marginally Suitable', note: 'Slope limitation (> 8%) requires contouring or terracing.' };
    if (soilDepth.includes('Shallow')) return { class: 'S2 - Moderately Suitable', note: 'Restricted effective soil depth.' };
    return { class: 'S1 - Highly Suitable', note: 'No severe topography, soil depth, or drainage limitations detected.' };
  };

  const suitabilityResult = evaluateSuitability();

  // Tile Providers
  const SATELLITE_TILE_URL = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
  const SATELLITE_ATTRIBUTION = "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and GIS User Community";

  const STREET_TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  const STREET_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

  const activeTileUrl = mapViewMode === 'satellite' ? SATELLITE_TILE_URL : STREET_TILE_URL;
  const activeAttribution = mapViewMode === 'satellite' ? SATELLITE_ATTRIBUTION : STREET_ATTRIBUTION;

  const MapStyleToolbar = () => (
    <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-lg border border-slate-800 mb-3 text-xs">
      <span className="text-slate-400 font-medium">🗺️ Select Map Style:</span>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => setMapViewMode('street')}
          className={`px-3 py-1 rounded-md transition-all font-medium ${mapViewMode === 'street' ? 'bg-emerald-600 text-white font-bold shadow-sm' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'}`}
        >
          🗺️ Plain Map View
        </button>
        <button
          onClick={() => setMapViewMode('satellite')}
          className={`px-3 py-1 rounded-md transition-all font-medium ${mapViewMode === 'satellite' ? 'bg-emerald-600 text-white font-bold shadow-sm' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'}`}
        >
          🛰️ Satellite View
        </button>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} p-6 transition-colors`}>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Header with Color Palette Picker */}
        <div className={`flex flex-col md:flex-row justify-between items-center p-4 rounded-xl border ${theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'} gap-4`}>
          <div className="flex items-center gap-4">
            <span className="font-bold text-emerald-500 tracking-wide text-sm bg-emerald-950/60 px-3 py-1.5 rounded-lg border border-emerald-800/40">
              AgriIntel Core Engine
            </span>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">Theme:</span>
              <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-950 rounded-lg border border-slate-800">
                {['#10b981', '#06b6d4', '#6366f1', '#a855f7', '#eab308', '#f97316'].map((color) => (
                  <button
                    key={color}
                    onClick={() => setAccentColor(color)}
                    style={{ backgroundColor: color }}
                    className={`w-3.5 h-3.5 rounded-full transition-transform ${accentColor === color ? 'scale-125 ring-2 ring-white' : 'opacity-80 hover:opacity-100'}`}
                  />
                ))}
              </div>
              <button onClick={() => setTheme('dark')} className={`px-2.5 py-1 rounded-md flex items-center gap-1 ${theme === 'dark' ? 'bg-slate-800 text-white font-bold' : 'bg-slate-900 text-slate-400'}`}>
                🌙 Dark
              </button>
              <button onClick={() => setTheme('light')} className={`px-2.5 py-1 rounded-md flex items-center gap-1 ${theme === 'light' ? 'bg-emerald-600 text-white font-bold' : 'bg-slate-900 text-slate-400'}`}>
                ☀️ Light
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => window.print()} className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1 transition-colors">
              Export CSV
            </button>
            <button onClick={() => window.print()} className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors">
              Print / Executive Dossier
            </button>
            <span className="text-xs font-bold text-emerald-400 tracking-wider">AgriIntel</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className={`flex flex-wrap items-center gap-2 p-2 rounded-xl border ${theme === 'dark' ? 'bg-slate-900/55 border-slate-800' : 'bg-white border-slate-200'}`}>
          {[
            { id: 'spis', label: '🌱 SPIS Irrigation' },
            { id: 'gis', label: '🗺️ GIS Spatial & DEM' },
            { id: 'weather', label: '🌦️ Weather & Climate' },
            { id: 'typhoon', label: '🌀 PAGASA Typhoon & PAR' },
            { id: 'phivolcs', label: '🌋 PHIVOLCS Geohazard & Faults' },
            { id: 'watershed', label: '📐 Watershed (NRCS CN)' },
            { id: 'land', label: '🌾 Land Suitability' },
            { id: 'soil', label: '🧪 Soil Salinity & Leaching' },
            { id: 'farmPlan', label: '📍 Farm Planning & Survey' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === tab.id ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-300 hover:bg-slate-800/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Full Expanded SPIS Irrigation Dashboard */}
        {activeTab === 'spis' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              
              {/* Card 1: Regional Climate & Crops */}
              <div className={`p-5 rounded-xl border ${theme === 'dark' ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'} space-y-3.5`}>
                <h3 className="text-xs font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-1.5">
                  🌱 Regional Climate & Crops
                </h3>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1 uppercase font-semibold">REGION PRESET (ALL PHILIPPINE REGIONS)</label>
                  <select 
                    value={regionPreset} 
                    onChange={(e) => {
                      setRegionPreset(e.target.value);
                      const reg = REGIONAL_INTELLIGENCE[e.target.value];
                      if (reg) updateFromCoords(reg.lat, reg.lng);
                    }} 
                    className="w-full bg-slate-950 border border-slate-700 text-xs rounded-lg p-2 text-slate-200"
                  >
                    {Object.keys(REGIONAL_INTELLIGENCE).map((regKey) => (
                      <option key={regKey} value={regKey}>{regKey}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1 uppercase font-semibold">TARGET CROP PROFILE</label>
                  <select value={cropProfile} onChange={(e) => setCropProfile(e.target.value)} className="w-full bg-slate-950 border border-slate-700 text-xs rounded-lg p-2 text-slate-200">
                    <option value="Lowland Rice / Paddy (Wetland)">Lowland Rice / Paddy (Wetland)</option>
                    <option value="High-Value Vegetables (Onion/Garlic)">High-Value Vegetables (Onion/Garlic)</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-[10px] text-slate-400 block mb-1 uppercase font-semibold">TEMP (°C)</label><input type="number" value={temp} onChange={(e) => setTemp(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-700 text-xs rounded-lg p-2 text-slate-200" /></div>
                  <div><label className="text-[10px] text-slate-400 block mb-1 uppercase font-semibold">SOLAR (MJ)</label><input type="number" value={solarRad} onChange={(e) => setSolarRad(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-700 text-xs rounded-lg p-2 text-slate-200" /></div>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1 uppercase font-semibold">PHENOLOGICAL STAGE (Kc)</label>
                  <select value={phenologicalStage} onChange={(e) => setPhenologicalStage(e.target.value)} className="w-full bg-slate-950 border border-slate-700 text-xs rounded-lg p-2 text-slate-200">
                    <option value="Mid-Season Stage (Kc: 1.2)">Mid-Season Stage (Kc: 1.2)</option>
                    <option value="Initial Stage (Kc: 0.4)">Initial Stage (Kc: 0.4)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1 uppercase font-semibold">SOIL PROFILE & TEXTURE</label>
                  <select value={soilTexture} onChange={(e) => setSoilTexture(e.target.value)} className="w-full bg-slate-950 border border-slate-700 text-xs rounded-lg p-2 text-slate-200">
                    <option value="Heavy Clay (AWHC: 180 mm/m)">Heavy Clay (AWHC: 180 mm/m)</option>
                    <option value="Clay Loam (AWHC: 140 mm/m)">Clay Loam (AWHC: 140 mm/m)</option>
                  </select>
                </div>
              </div>

              {/* Card 2: Irrigation Method & Hydraulics */}
              <div className={`p-5 rounded-xl border ${theme === 'dark' ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'} space-y-3.5`}>
                <h3 className="text-xs font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-1.5">
                  💧 Irrigation Method & Hydraulics
                </h3>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1 uppercase font-semibold">APPLICATION METHOD</label>
                  <select value={appMethod} onChange={(e) => setAppMethod(e.target.value)} className="w-full bg-slate-950 border border-slate-700 text-xs rounded-lg p-2 text-slate-200">
                    <option value="Surface Flooding (45% Eff)">Surface Flooding (45% Eff)</option>
                    <option value="Drip Irrigation (90% Eff)">Drip Irrigation (90% Eff)</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-[10px] text-slate-400 block mb-1 uppercase font-semibold">FLOW (L/S)</label><input type="number" value={flowRate} onChange={(e) => setFlowRate(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-700 text-xs rounded-lg p-2 text-slate-200" /></div>
                  <div><label className="text-[10px] text-slate-400 block mb-1 uppercase font-semibold">STATIC LIFT (M)</label><input type="number" value={staticLift} onChange={(e) => setStaticLift(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-700 text-xs rounded-lg p-2 text-slate-200" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-[10px] text-slate-400 block mb-1 uppercase font-semibold">LENGTH (M)</label><input type="number" value={pipeLength} onChange={(e) => setPipeLength(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-700 text-xs rounded-lg p-2 text-slate-200" /></div>
                  <div><label className="text-[10px] text-slate-400 block mb-1 uppercase font-semibold">DIAM (MM)</label><input type="number" value={pipeDiameter} onChange={(e) => setPipeDiameter(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-700 text-xs rounded-lg p-2 text-slate-200" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-[10px] text-slate-400 block mb-1 uppercase font-semibold">MINOR LOSS (%)</label><input type="number" value={minorLossPct} onChange={(e) => setMinorLossPct(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-700 text-xs rounded-lg p-2 text-slate-200" /></div>
                  <div><label className="text-[10px] text-slate-400 block mb-1 uppercase font-semibold">OP. PRESS (M)</label><input type="number" value={opPressure} onChange={(e) => setOpPressure(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-700 text-xs rounded-lg p-2 text-slate-200" /></div>
                </div>
              </div>

              {/* Card 3: Solar & BoS Sizing */}
              <div className={`p-5 rounded-xl border ${theme === 'dark' ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'} space-y-3.5`}>
                <h3 className="text-xs font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-1.5">
                  ☀️ Solar & BoS Sizing
                </h3>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1 uppercase font-semibold">PEAK SUN HOURS (PSH)</label>
                  <input type="number" value={peakSunHours} onChange={(e) => setPeakSunHours(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-700 text-xs rounded-lg p-2 text-slate-200" />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1 uppercase font-semibold">SOLAR PANEL SPEC (WATTAGE)</label>
                  <select value={solarSpecWatt} onChange={(e) => setSolarSpecWatt(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-700 text-xs rounded-lg p-2 text-slate-200">
                    <option value={150}>150W Compact Panel</option>
                    <option value={250}>250W Standard Utility</option>
                    <option value={350}>350W Commercial Monocrystalline</option>
                    <option value={450}>450W High-Efficiency Mono</option>
                    <option value={550}>550W High-Power Agro</option>
                    <option value={600}>600W Ultra High-Power</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1 uppercase font-semibold">SYSTEM DC VOLTAGE</label>
                  <select value={selectedDcVoltage} onChange={(e) => setSelectedDcVoltage(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-700 text-xs rounded-lg p-2 text-slate-200">
                    <option value={12}>12V DC System</option>
                    <option value={24}>24V DC System</option>
                    <option value={48}>48V DC System (Standard)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1 uppercase font-semibold">LIFEPO4 BATTERY BANK SPEC</label>
                  <select value={batteryAh} onChange={(e) => setBatteryAh(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-700 text-xs rounded-lg p-2 text-slate-200">
                    <option value={100}>100Ah LiFePO4</option>
                    <option value={200}>200Ah LiFePO4</option>
                    <option value={314}>314Ah LiFePO4</option>
                  </select>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-2 pt-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-[10px] uppercase font-bold">Panels Needed:</span>
                    <span className="text-emerald-400 font-bold font-mono text-sm">{calculatedPanelsCount} units ({solarSpecWatt}W)</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-slate-800/80 pt-1.5">
                    <span className="text-slate-400 text-[10px] uppercase font-bold">Batteries Needed:</span>
                    <span className="text-emerald-400 font-bold font-mono text-sm">{calculatedBatteriesCount} units ({batteryAh}Ah @ {selectedDcVoltage}V)</span>
                  </div>
                </div>
              </div>

              {/* Card 4: Economics & Savings */}
              <div className={`p-5 rounded-xl border ${theme === 'dark' ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'} space-y-3.5`}>
                <h3 className="text-xs font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-1.5">
                  💰 Economics & Savings
                </h3>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1 uppercase font-semibold">FUEL / DIESEL PRICE</label>
                  <input type="number" value={dieselPrice} onChange={(e) => setDieselPrice(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-700 text-xs rounded-lg p-2 text-slate-200" />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1 uppercase font-semibold">ANNUAL OP. DAYS</label>
                  <input type="number" value={annualDays} onChange={(e) => setAnnualDays(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-700 text-xs rounded-lg p-2 text-slate-200" />
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-1">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">DAILY YIELD</span>
                  <span className="text-emerald-400 text-lg font-bold block font-mono">{dailyYieldVal} m³/day</span>
                </div>
              </div>
            </div>

            {/* Bottom Analytics & Curves Section with 1:1 Dimension Ratio */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* TDH Breakdown Conic Pie Graph (1:1 Box Dimension) */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col justify-between aspect-square max-h-[420px]">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">📈 Total Dynamic Head (TDH) Breakdown (Pie Graph)</h4>
                <div className="flex flex-col items-center justify-center my-auto gap-4">
                  <div 
                    className="w-36 h-36 rounded-full border-4 border-slate-800 shadow-inner relative flex items-center justify-center"
                    style={{ background: tdhConicGradient }}
                  >
                    <div className="w-20 h-20 rounded-full bg-slate-950 flex flex-col items-center justify-center text-center shadow">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Total TDH</span>
                      <span className="text-sm font-bold text-emerald-400 font-mono">{totalTDHNum}m</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-slate-500 inline-block"></span>
                      <span>Static Lift: <strong>{staticLift}m</strong> ({pStatic.toFixed(1)}%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
                      <span>Friction: <strong>{frictionLossNum}m</strong> ({pFriction.toFixed(1)}%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-yellow-500 inline-block"></span>
                      <span>Minor: <strong>{minorLossNum}m</strong> ({pMinor.toFixed(1)}%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-cyan-500 inline-block"></span>
                      <span>Pressure: <strong>{opPressure}m</strong> ({pPress.toFixed(1)}%)</span>
                    </div>
                  </div>
                </div>
                <div className="text-[11px] text-slate-400 text-center">Proportional hydraulic loss distribution</div>
              </div>

              {/* Estimated Daily Pumping Yield Curve Bar Graph (1:1 Box Dimension) */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col justify-between aspect-square max-h-[420px]">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">☀️ Estimated Daily Pumping Yield Curve (Hourly Values)</h4>
                <div className="w-full my-auto flex flex-col justify-end">
                  <div className="h-44 w-full bg-slate-950 rounded-lg border border-slate-800 flex items-end p-2.5 gap-1.5 pt-8">
                    {[2, 5, 12, 25, 38, 45, 48, 42, 30, 18, 6, 1].map((val, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group">
                        <span className="text-[9px] text-emerald-400 font-mono opacity-90 group-hover:opacity-100 pb-1">{val}m³</span>
                        <div style={{ height: `${val * 1.8}%` }} className="w-full bg-emerald-500/80 rounded-t-sm hover:bg-emerald-400 transition-all" />
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-400 flex justify-between pt-2">
                    <span>06:00 AM</span>
                    <span>12:00 PM (Peak)</span>
                    <span>06:00 PM</span>
                  </p>
                </div>
                <div className="text-[11px] text-slate-400 text-center">Hourly solar PV yield distribution across operational window</div>
              </div>

            </div>
          </div>
        )}

        {/* Tab 2: GIS Spatial & DEM */}
        {activeTab === 'gis' && (
          <div className="space-y-4">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">🗺️ GIS Layer & Coordinate Selector</h3>
                <p className="text-xs text-slate-400">Active Latitude: <span className="text-emerald-400 font-mono">{location.lat.toFixed(5)}° N</span> | Longitude: <span className="text-emerald-400 font-mono">{location.lng.toFixed(5)}° E</span></p>
              </div>
              <div className="w-full md:w-72">
                <select onChange={(e) => { const [lat, lng] = e.target.value.split(',').map(Number); updateFromCoords(lat, lng); }} className="w-full bg-slate-950 border border-slate-700 text-xs rounded-lg p-2 text-slate-200">
                  <option value="14.45896,120.93851">Bacoor, Cavite (14.459° N, 120.939° E)</option>
                  <option value="15.0286,120.6896">Pampanga Central Plain (15.029° N, 120.690° E)</option>
                  <option value="14.1648,121.2413">Laguna / UPLB (14.165° N, 121.241° E)</option>
                </select>
              </div>
            </div>

            <MapStyleToolbar />

            <div className="w-full rounded-xl overflow-hidden border border-slate-800" style={{ height: '420px' }}>
              <MapContainer center={[location.lat, location.lng]} zoom={sharedZoom} style={{ height: '100%', width: '100%' }}>
                <SyncedMapController center={[location.lat, location.lng]} zoom={sharedZoom} />
                <MapEventsHandler onZoomChange={setSharedZoom} onClickChange={updateFromCoords} />
                <TileLayer key={mapViewMode} attribution={activeAttribution} url={activeTileUrl} />
                <Marker position={[location.lat, location.lng]}><Popup>Selected Location: {location.name || "Custom Pin"}</Popup></Marker>
              </MapContainer>
            </div>
          </div>
        )}

        {/* Tab 3: Weather & Climate */}
        {activeTab === 'weather' && (
          <div className="space-y-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">🌦️ PAGASA Regional Weather & Extreme Climate Risk Matrix</h3>
                <p className="text-xs text-slate-400">Select any Philippine region to evaluate historical climate extremes and typhoon frequencies.</p>
              </div>
              <div className="w-full md:w-80">
                <select
                  value={selectedRegionKey}
                  onChange={(e) => {
                    const key = e.target.value;
                    setSelectedRegionKey(key);
                    const reg = REGIONAL_INTELLIGENCE[key];
                    if (reg) updateFromCoords(reg.lat, reg.lng);
                  }}
                  className="w-full bg-slate-950 border border-slate-700 text-xs rounded-lg p-2 text-slate-200"
                >
                  {Object.keys(REGIONAL_INTELLIGENCE).map((k) => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">⚠️ Historical Extreme Weather Events</h4>
                <div className="space-y-2">
                  {activeRegionData.extremeEvents.map((evt, idx) => (
                    <div key={idx} className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs text-slate-300 flex items-start gap-2">
                      <span className="text-amber-400 font-bold">•</span>
                      <span>{evt}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">🌪️ Climatology & Typhoon Frequency</h4>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-3 text-slate-300">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Climate Classification</span>
                    <strong className="text-emerald-400 text-sm">{activeRegionData.climateType}</strong>
                  </div>
                  <div className="border-t border-slate-800 pt-2">
                    <span className="text-slate-400 block text-[10px] uppercase">Annual Typhoon Exposure</span>
                    <strong className="text-amber-400 text-sm">{activeRegionData.typhoonFrequency}</strong>
                  </div>
                </div>
              </div>
            </div>

            <MapStyleToolbar />

            <div className="w-full rounded-xl overflow-hidden border border-slate-800" style={{ height: '380px' }}>
              <MapContainer center={[location.lat, location.lng]} zoom={sharedZoom} style={{ height: '100%', width: '100%' }}>
                <SyncedMapController center={[location.lat, location.lng]} zoom={sharedZoom} />
                <MapEventsHandler onZoomChange={setSharedZoom} onClickChange={updateFromCoords} />
                <TileLayer key={mapViewMode} attribution={activeAttribution} url={activeTileUrl} />
                <Marker position={[location.lat, location.lng]}><Popup>{activeRegionData.name}</Popup></Marker>
              </MapContainer>
            </div>
          </div>
        )}

        {/* Tab 4: PAGASA Typhoon & PAR */}
        {activeTab === 'typhoon' && (
          <div className="space-y-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">🌀 PAGASA Philippine Area of Responsibility (PAR) & Regional Weather Matrix</h3>
                <p className="text-xs text-slate-400">Complete nationwide extreme weather and typhoon vulnerability table across all 17 Philippine regions.</p>
              </div>
              <span className="text-xs font-mono bg-emerald-950 text-emerald-300 px-3 py-1 rounded border border-emerald-800">
                PAR Status: Normal (No Cyclones Detected)
              </span>
            </div>

            <MapStyleToolbar />

            <div className="w-full rounded-xl overflow-hidden border border-slate-800" style={{ height: '380px' }}>
              <MapContainer center={[13.0, 122.0]} zoom={5} style={{ height: '100%', width: '100%' }}>
                <SyncedMapController center={[location.lat, location.lng]} zoom={sharedZoom} />
                <MapEventsHandler onZoomChange={setSharedZoom} onClickChange={updateFromCoords} />
                <TileLayer key={mapViewMode} attribution={activeAttribution} url={activeTileUrl} />
                
                <Polygon
                  positions={PAR_POLYGON_COORDS}
                  pathOptions={{ color: '#f59e0b', weight: 2.5, dashArray: '6, 6', fillColor: '#f59e0b', fillOpacity: 0.1 }}
                />

                <Marker position={[location.lat, location.lng]}>
                  <Popup>
                    <div className="text-xs font-sans">
                      <strong>📍 Selected Target Location</strong><br/>
                      {location.name || "Custom Site"}<br/>
                      Lat: {location.lat.toFixed(4)}°N, Lng: {location.lng.toFixed(4)}°E
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>

            {/* Comprehensive Nationwide Regional Extreme Weather Table */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">📋 Complete Nationwide Regional Extreme Weather & Vulnerability Listing (All 17 Regions)</h4>
              <div className="overflow-x-auto max-h-[500px]">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="sticky top-0 bg-slate-950 text-slate-400">
                    <tr className="border-b border-slate-800">
                      <th className="p-3">Region</th>
                      <th className="p-3">Climate Type</th>
                      <th className="p-3">Typhoon Exposure</th>
                      <th className="p-3">Historical Hazards</th>
                      <th className="p-3">Agricultural Vulnerabilities</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {Object.values(REGIONAL_INTELLIGENCE).map((reg, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/40">
                        <td className="p-3 font-bold text-emerald-400">{reg.name}</td>
                        <td className="p-3">{reg.climateType}</td>
                        <td className="p-3 font-medium text-amber-400">{reg.typhoonFrequency}</td>
                        <td className="p-3">{reg.extremeEvents.join('; ')}</td>
                        <td className="p-3">{reg.cropSuitability.map(c => c.advisory).join(' ')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: PHIVOLCS Geohazard & Faults */}
        {activeTab === 'phivolcs' && (
          <div className="space-y-4">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">🌋 PHIVOLCS Active Fault & Volcanic Hazard Map</h3>
                <p className="text-xs text-slate-400">Geohazard proximity analysis active for: <strong className="text-emerald-400">{location.name || "Selected Location"}</strong></p>
              </div>
              <div className="flex gap-2 text-xs">
                <span className="bg-amber-950 text-amber-300 px-2.5 py-1 rounded border border-amber-800">Shaking: Moderate</span>
                <span className="bg-emerald-950 text-emerald-300 px-2.5 py-1 rounded border border-emerald-800">Liquefaction: Low</span>
              </div>
            </div>

            <MapStyleToolbar />

            <div className="w-full rounded-xl overflow-hidden border border-slate-800" style={{ height: '420px' }}>
              <MapContainer center={[location.lat, location.lng]} zoom={sharedZoom} style={{ height: '100%', width: '100%' }}>
                <SyncedMapController center={[location.lat, location.lng]} zoom={sharedZoom} />
                <MapEventsHandler onZoomChange={setSharedZoom} onClickChange={updateFromCoords} />
                <TileLayer key={mapViewMode} attribution={activeAttribution} url={activeTileUrl} />
                <Marker position={[location.lat, location.lng]}><Popup>Geohazard Check: {location.name || "Custom Pin"}</Popup></Marker>
              </MapContainer>
            </div>
          </div>
        )}

        {/* Tab 6: Watershed (NRCS CN) */}
        {activeTab === 'watershed' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">📐 NRCS CURVE NUMBER RUNOFF COMPUTATION</h3>
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between text-xs mb-1"><span className="text-slate-400">24-Hr Storm Rainfall Depth (mm)</span><span className="text-emerald-400 font-bold">{rainfallDepth} mm</span></div>
                  <input type="range" min="10" max="300" value={rainfallDepth} onChange={(e) => setRainfallDepth(Number(e.target.value))} className="w-full accent-emerald-500" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1"><span className="text-slate-400">Runoff Curve Number (CN)</span><span className="text-emerald-400 font-bold">{curveNumber}</span></div>
                  <input type="range" min="40" max="98" value={curveNumber} onChange={(e) => setCurveNumber(Number(e.target.value))} className="w-full accent-emerald-500" />
                </div>
              </div>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-2">
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Direct Storm Surface Runoff (Q)</span>
                <span className="text-emerald-400 text-xl font-bold font-mono block">{computeRunoff()} mm</span>
              </div>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">WATERSHED PARAMETERS & HYDROLOGIC GROUP</h3>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Hydrologic Soil Group</label>
                  <select value={hydrologicGroup} onChange={(e) => setHydrologicGroup(e.target.value)} className="w-full bg-slate-950 border border-slate-700 text-xs rounded-lg p-2 text-slate-200">
                    <option value="Group A (High Infiltration / Sand)">Group A (High Infiltration / Sand)</option>
                    <option value="Group B (Moderate Infiltration)">Group B (Moderate Infiltration)</option>
                  </select>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1"><span className="text-slate-400">Time of Concentration (Tc)</span><span className="text-emerald-400 font-bold">{tcHours} hrs</span></div>
                  <input type="range" min="0.5" max="12.0" step="0.1" value={tcHours} onChange={(e) => setTcHours(Number(e.target.value))} className="w-full accent-emerald-500" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 7: Land Suitability */}
        {activeTab === 'land' && (
          <div className="space-y-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">🌾 Regional Crop Suitability & FAO Agricultural Adaptability Matrix</h3>
                <p className="text-xs text-slate-400">Crop evaluations automatically synchronized for: <strong className="text-emerald-400">{activeRegionData.name}</strong></p>
              </div>
              <div className="w-full md:w-80">
                <select
                  value={selectedRegionKey}
                  onChange={(e) => {
                    const key = e.target.value;
                    setSelectedRegionKey(key);
                    const reg = REGIONAL_INTELLIGENCE[key];
                    if (reg) updateFromCoords(reg.lat, reg.lng);
                  }}
                  className="w-full bg-slate-950 border border-slate-700 text-xs rounded-lg p-2 text-slate-200"
                >
                  {Object.keys(REGIONAL_INTELLIGENCE).map((k) => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {activeRegionData.cropSuitability.map((item, idx) => (
                <div key={idx} className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-2">
                  <span className="text-xs font-bold text-emerald-400 block">{item.crop}</span>
                  <span className="bg-emerald-950 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-800 inline-block">
                    {item.rating}
                  </span>
                  <p className="text-xs text-slate-300 pt-1">{item.advisory}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
                <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">FAO LAND EVALUATION PARAMETERS</h3>
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Target Land Use / Crop</label>
                    <select value={landUseTarget} onChange={(e) => setLandUseTarget(e.target.value)} className="w-full bg-slate-950 border border-slate-700 text-xs rounded-lg p-2 text-slate-200">
                      <option value="Lowland Rice Paddy">Lowland Rice Paddy</option>
                      <option value="High-Value Commercial Vegetables">High-Value Commercial Vegetables</option>
                    </select>
                  </div>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-2">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">FAO Local Site Rating</span>
                  <span className="text-emerald-400 text-lg font-bold block">{suitabilityResult.class}</span>
                </div>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
                <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">LIMITATION FACTORS & DRAINAGE</h3>
                <div className="space-y-3 text-xs">
                  <div>
                    <div className="flex justify-between text-xs mb-1"><span className="text-slate-400">Terrain Slope (%)</span><span className="text-emerald-400 font-bold">{soilSlopePct}%</span></div>
                    <input type="range" min="0" max="20" value={soilSlopePct} onChange={(e) => setSoilSlopePct(Number(e.target.value))} className="w-full accent-emerald-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 8: Soil Salinity & Leaching */}
        {activeTab === 'soil' && <SoilSalinityModule />}

        {/* Tab 9: Farm Planning & Survey */}
        {activeTab === 'farmPlan' && <FarmPlanningModule />}

      </div>
    </div>
  );
}

export default IrrigationDashboard;
