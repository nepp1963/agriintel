import { fetchBatchElevations, calculateSegmentSlope } from "../../utils/terrainUtils";
import React, { useState, useEffect } from 'react';
import SoilSalinityModule from './SoilSalinityModule';
import FarmPlanningModule from './FarmPlanningModule';
import { useLocation } from '../../context/LocationContext';
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Master Philippine Crop Catalog with Phenological Kc Values & Irrigation Parameters
const ALL_PHILIPPINE_CROPS = [
  'Lowland Rice / Paddy (Wetland)',
  'Upland Rice / Rainfed (Dry Farming)',
  'Sugarcane (High-Water Commercial Field Crop)',
  'Tomato (High-Value Solanaceous Crop)',
  'Potato (Highland Temperate Tubers)',
  'Yellow / Hybrid Corn (Grain & Feed)',
  'White Corn / Glutinous Corn',
  'Bulb Onion & Shallots',
  'Garlic (Lowland Dry Season)',
  'Eggplant / Talong (Solanaceous)',
  'Cassava / Kamoteng Kahoy (Drought-Resilient Root Crop)',
  'Sweet Potato / Kamote',
  'Banana (Cavendish / Saba / Lakatan)',
  'Coconut (Perennial Palm)',
  'Pineapple (Commercial Plantation)',
  'Cacao (High-Value Plantation)',
  'Coffee (Arabica / Robusta / Liberica)',
  'Abaca (Manila Hemp / Fiber Crop)'
];

// Local Agronomic Soil Types & DA-BSWM Series in the Philippines
const ALL_PHILIPPINE_SOIL_TYPES = [
  'Angeles Fine Sand (Coarse / Well-Drained Volcanic Sand)',
  'Lipa Clay Loam (Rich Volcanic Loam)',
  'Guimbalaon Clay (Deep Red Highland Volcanic Clay)',
  'San Manuel Silt Loam (Fertile Alluvial Floodplain Silt)',
  'San Rafael Heavy Clay (Swelling Black Paddy / Heavy Clay)',
  'Baguio Sandy Clay Loam (Highland Mountain Loam)',
  'Iloilo Clay Loam (Heavy Lowland Alluvial Clay)',
  'Davao Clay (Deep Upland Fertile Clay)',
  'Cotabato Silt Loam (Agro-Industrial River Valley Loam)',
  'Tarlac Clay (Flat Lowland Paddy Clay)',
  'Hydromorphic Peat / Mangrove Organic Soil (Coastal Marsh)'
];

// Complete Philippine Regional Climate, Weather Hazards & Local Soil Series Dataset (All 17 Regions)
const REGIONAL_INTELLIGENCE: Record<string, {
  name: string;
  lat: number;
  lng: number;
  climateType: string;
  typhoonFrequency: string;
  predominantSoil: string;
  extremeEvents: string[];
  cropSuitability: { crop: string; rating: string; advisory: string }[];
}> = {
  'Region I (Ilocos Region)': {
    name: 'Region I (Ilocos Region)',
    lat: 16.0792,
    lng: 120.3308,
    climateType: 'Type I (Pronounced dry Nov–Apr, wet May–Oct)',
    typhoonFrequency: 'High (4 to 5 Tropical Cyclones / year)',
    predominantSoil: 'Angeles Fine Sand (Coarse / Well-Drained Volcanic Sand)',
    extremeEvents: ['Prolonged summer drought', 'Monsoon flash floods', 'Coastal storm surges'],
    cropSuitability: [
      { crop: 'Lowland Rice & Tobacco', rating: 'S1 - Highly Suitable', advisory: 'Thrives during dry season with regulated irrigation.' },
      { crop: 'Upland Rice & Tomato', rating: 'S1 - Highly Suitable', advisory: 'Excellent performance in well-drained sandy loam terrain.' }
    ]
  },
  'Region II (Cagayan Valley)': {
    name: 'Region II (Cagayan Valley)',
    lat: 17.6132,
    lng: 121.7270,
    climateType: 'Type III (Seasons not very pronounced, relatively dry)',
    typhoonFrequency: 'Very High (Direct entry corridor for Super Typhoons)',
    predominantSoil: 'San Manuel Silt Loam (Fertile Alluvial Floodplain Silt)',
    extremeEvents: ['Catastrophic Cagayan River Basin flooding', 'Severe typhoons & sustained gales', 'Agricultural drought'],
    cropSuitability: [
      { crop: 'Yellow Corn & Lowland Rice', rating: 'S1 - Highly Suitable', advisory: 'Major corn granary; monitor fourth-quarter typhoon risks.' },
      { crop: 'Sugarcane & Banana', rating: 'S2 - Moderately Suitable', advisory: 'Prone to wind damage during peak typhoon months.' }
    ]
  },
  'Region III (Central Luzon)': {
    name: 'Region III (Central Luzon)',
    lat: 15.0286,
    lng: 120.6896,
    climateType: 'Type I (Pronounced dry and wet seasons)',
    typhoonFrequency: 'High (4 to 5 Tropical Cyclones / year)',
    predominantSoil: 'Tarlac Clay (Flat Lowland Paddy Clay)',
    extremeEvents: ['Pampanga River Basin agricultural inundation', 'Severe summer heat & irrigation water deficits', 'Typhoon wind damage'],
    cropSuitability: [
      { crop: 'Lowland Paddy Rice & Sugarcane', rating: 'S1 - Highly Suitable', advisory: 'Rice and sugar granary; double-cropping highly viable in clay paddies.' },
      { crop: 'Bulb Onion, Garlic & Tomato', rating: 'S1 - Highly Suitable', advisory: 'Ideal in well-drained sandy loam pockets of Nueva Ecija/Tarlac.' }
    ]
  },
  'Region IV-A (CALABARZON)': {
    name: 'CALABARZON (Region IV-A)',
    lat: 14.45896,
    lng: 120.93851,
    climateType: 'Type I (Two pronounced seasons)',
    typhoonFrequency: 'Moderate - High (3 to 4 Cyclones / year)',
    predominantSoil: 'Lipa Clay Loam (Rich Volcanic Loam)',
    extremeEvents: ['Monsoon Surge Flash Floods (Habagat)', 'Volcanic ashfall & lahar risks (Taal)', 'Prolonged dry spells (El Niño)'],
    cropSuitability: [
      { crop: 'Lowland Paddy Rice & Sugarcane', rating: 'S1 - Highly Suitable', advisory: 'Requires drainage management during peak wet season.' },
      { crop: 'High-Value Vegetables (Tomato/Eggplant) & Coffee/Cacao', rating: 'S1 - Highly Suitable', advisory: 'Optimal in volcanic loam upland zones (Lipa/Tagaytay).' }
    ]
  },
  'MIMAROPA (Region IV-B)': {
    name: 'MIMAROPA (Region IV-B)',
    lat: 12.7503,
    lng: 121.1812,
    climateType: 'Type I & III (Short dry season)',
    typhoonFrequency: 'Moderate (3 Cyclones / year)',
    predominantSoil: 'San Manuel Silt Loam (Fertile Alluvial Floodplain Silt)',
    extremeEvents: ['Coastal storm surges', 'Flash floods in island river basins', 'Seasonal dry-season water stress'],
    cropSuitability: [
      { crop: 'Upland Rice, Coconut & Cassava', rating: 'S1 - Highly Suitable', advisory: 'Thrives across Palawan and Mindoro alluvial valleys.' },
      { crop: 'Sweet Potato & Root Crops', rating: 'S1 - Highly Suitable', advisory: 'Resilient in sandy coastal loam soils.' }
    ]
  },
  'Region V (Bicol Region)': {
    name: 'Bicol Region (Region V)',
    lat: 13.6218,
    lng: 123.1948,
    climateType: 'Type II & IV (No dry season, pronounced max rainfall)',
    typhoonFrequency: 'Very High (Direct Typhoon Belt: 5+ Cyclones / year)',
    predominantSoil: 'Lipa Clay Loam (Rich Volcanic Loam)',
    extremeEvents: ['Super Typhoon wind damage & storm surges', 'Volcanic lahar flows (Mayon)', 'Continuous soil saturation'],
    cropSuitability: [
      { crop: 'Coconut & Abaca', rating: 'S1 - Highly Suitable', advisory: 'Resilient perennial crops suited for continuous rainfall.' },
      { crop: 'Lowland Rice & Sweet Potato', rating: 'S2 - Moderately Suitable', advisory: 'High crop loss risk during late fourth-quarter typhoons.' }
    ]
  },
  'Region VI (Western Visayas)': {
    name: 'Western Visayas (Region VI)',
    lat: 10.7202,
    lng: 122.5621,
    climateType: 'Type I & III (Short dry season 1–3 months)',
    typhoonFrequency: 'Moderate (2 to 3 Cyclones / year)',
    predominantSoil: 'Guimbalaon Clay (Deep Red Highland Volcanic Clay)',
    extremeEvents: ['Agricultural drought (El Niño)', 'Riverine flooding (Jaro/Jalaur basins)', 'Salinity intrusion'],
    cropSuitability: [
      { crop: 'Sugarcane & Yellow Corn', rating: 'S1 - Highly Suitable', advisory: 'Premier national sugarcane belt; highly productive in volcanic clay.' },
      { crop: 'Upland Rice & Cassava', rating: 'S2 - Moderately Suitable', advisory: 'Vulnerable to onset delays of the wet monsoon.' }
    ]
  },
  'Region VII (Central Visayas)': {
    name: 'Region VII (Central Visayas)',
    lat: 10.3157,
    lng: 123.8854,
    climateType: 'Type III (Seasons not very pronounced)',
    typhoonFrequency: 'Low - Moderate (1 to 2 Cyclones / year)',
    predominantSoil: 'Iloilo Clay Loam (Heavy Lowland Alluvial Clay)',
    extremeEvents: ['Severe El Niño water scarcity', 'Karst aquifer drought vulnerability', 'Localized coastal flash floods'],
    cropSuitability: [
      { crop: 'White Corn, Cassava & Sugarcane', rating: 'S1 - Highly Suitable', advisory: 'Well-adapted to rolling limestone-derived clay loam soils.' },
      { crop: 'Lowland Rice & Tomato', rating: 'S3 - Marginally Suitable', advisory: 'Limited by seasonal water availability.' }
    ]
  },
  'Region VIII (Eastern Visayas)': {
    name: 'Eastern Visayas (Region VIII)',
    lat: 11.2434,
    lng: 125.0047,
    climateType: 'Type II & IV (No dry season, very high rainfall)',
    typhoonFrequency: 'Very High (Primary landfall zone for major typhoons)',
    predominantSoil: 'San Rafael Heavy Clay (Swelling Black Paddy / Heavy Clay)',
    extremeEvents: ['Catastrophic storm surges (Haiyan-type)', 'Continuous torrential rainfall & landslides', 'Severe river siltation'],
    cropSuitability: [
      { crop: 'Coconut, Abaca & Sugarcane', rating: 'S1 - Highly Suitable', advisory: 'Primary livelihood crops resilient to high soil moisture.' },
      { crop: 'Lowland Rice & Sweet Potato', rating: 'S2 - Moderately Suitable', advisory: 'Requires robust drainage networks in heavy clay soils.' }
    ]
  },
  'Region IX (Zamboanga Peninsula)': {
    name: 'Zamboanga Peninsula (Region IX)',
    lat: 7.9042,
    lng: 123.2505,
    climateType: 'Type IV (Evenly distributed rainfall throughout year)',
    typhoonFrequency: 'Low (Outside main typhoon belt)',
    predominantSoil: 'Davao Clay (Deep Upland Fertile Clay)',
    extremeEvents: ['Localized flash floods', 'Prolonged dry spells during regional drought', 'Pest and disease outbreaks in rubber'],
    cropSuitability: [
      { crop: 'Rubber, Coconut & Cassava', rating: 'S1 - Highly Suitable', advisory: 'Thrives in stable equatorial climate and deep clay soils.' },
      { crop: 'Upland Rice & Corn', rating: 'S2 - Moderately Suitable', advisory: 'Viable in irrigated river valley basins.' }
    ]
  },
  'Region X (Northern Mindanao)': {
    name: 'Northern Mindanao (Region X)',
    lat: 8.2280,
    lng: 124.2452,
    climateType: 'Type III & IV (No pronounced dry season)',
    typhoonFrequency: 'Low (Infrequent direct strikes)',
    predominantSoil: 'Guimbalaon Clay (Deep Red Highland Volcanic Clay)',
    extremeEvents: ['Upland flash floods (Sendong-type)', 'Prolonged dry spells', 'Landslides in mountainous agricultural zones'],
    cropSuitability: [
      { crop: 'Pineapple, Banana, Potato & Corn', rating: 'S1 - Highly Suitable', advisory: 'Major commercial agro-industrial zone (Bukidnon plateau).' },
      { crop: 'Upland Rice & Sugarcane', rating: 'S1 - Highly Suitable', advisory: 'High yields in Bukidnon and Agusan river valley clay loam.' }
    ]
  },
  'Region XI (Davao Region)': {
    name: 'Davao Region (Region XI)',
    lat: 7.1907,
    lng: 125.4553,
    climateType: 'Type IV (Rainfall evenly distributed)',
    typhoonFrequency: 'Very Low (Generally typhoon-free)',
    predominantSoil: 'Davao Clay (Deep Upland Fertile Clay)',
    extremeEvents: ['Strong convective thunderstorms', 'El Niño agricultural moisture stress', 'Seismic activity & landslides'],
    cropSuitability: [
      { crop: 'Cavendish Banana, Cacao & Coffee', rating: 'S1 - Highly Suitable', advisory: 'Prime export fruit production zone on rich fertile clay.' },
      { crop: 'Coconut, Sugarcane & Tomato', rating: 'S1 - Highly Suitable', advisory: 'Excellent climatic and soil fit.' }
    ]
  },
  'Region XII (SOCCSKSARGEN)': {
    name: 'SOCCSKSARGEN (Region XII)',
    lat: 6.2704,
    lng: 124.6053,
    climateType: 'Type IV (Rainfall evenly distributed)',
    typhoonFrequency: 'Very Low (Typhoon-free zone)',
    predominantSoil: 'Cotabato Silt Loam (Agro-Industrial River Valley Loam)',
    extremeEvents: ['Agricultural drought / El Niño grain loss', 'River basin flooding (Cotabato marshlands)', 'Convective flash floods'],
    cropSuitability: [
      { crop: 'Yellow Corn, Sugarcane & Lowland Rice', rating: 'S1 - Highly Suitable', advisory: 'Highly productive agricultural plains (Cotabato/Koronadal).' },
      { crop: 'Coffee, Cacao & Cassava', rating: 'S1 - Highly Suitable', advisory: 'Thrives in upland volcanic loam soils.' }
    ]
  },
  'Region XIII (Caraga)': {
    name: 'Caraga (Region XIII)',
    lat: 8.9504,
    lng: 125.5312,
    climateType: 'Type II (No dry season, maximum rainfall in winter)',
    typhoonFrequency: 'Moderate - High (Eastern seaboard exposure)',
    predominantSoil: 'San Manuel Silt Loam (Fertile Alluvial Floodplain Silt)',
    extremeEvents: ['Severe riverine flooding (Agusan River Basin)', 'Continuous heavy winter monsoon rains', 'Coastal storm surges'],
    cropSuitability: [
      { crop: 'Abaca, Coconut & Rubber', rating: 'S1 - Highly Suitable', advisory: 'Ideal forestry and agro-forestry climate in deep silt loam.' },
      { crop: 'Upland Rice & Cassava', rating: 'S2 - Moderately Suitable', advisory: 'Prone to seasonal inundation in Agusan basin.' }
    ]
  },
  'CAR (Cordillera Administrative Region)': {
    name: 'Cordillera Administrative Region (CAR)',
    lat: 16.4023,
    lng: 120.5960,
    climateType: 'Type I & III (Pronounced dry/wet with cool high-altitude climate)',
    typhoonFrequency: 'High (Mountainous windward exposure)',
    predominantSoil: 'Baguio Sandy Clay Loam (Highland Mountain Loam)',
    extremeEvents: ['Catastrophic mountain landslides & road slips', 'Severe typhoon wind & rain battering', 'Sub-zero frost events in high peaks'],
    cropSuitability: [
      { crop: 'Highland Potato, Cabbage & Tomato', rating: 'S1 - Highly Suitable', advisory: 'Requires terraced farming and soil erosion control.' },
      { crop: 'Upland Rice (Heirloom Kalinga/Ifugao)', rating: 'S1 - Highly Suitable', advisory: 'High-value highland cultural specialty crops in organic mountain loam.' }
    ]
  },
  'NCR (National Capital Region)': {
    name: 'NCR (National Capital Region)',
    lat: 14.5995,
    lng: 120.9842,
    climateType: 'Type I (Pronounced dry Nov–Apr, wet May–Oct)',
    typhoonFrequency: 'Moderate - High (Direct urban exposure)',
    predominantSoil: 'San Rafael Heavy Clay (Swelling Black Paddy / Heavy Clay)',
    extremeEvents: ['Urban tidal & monsoon flooding (Marikina/Pasig basins)', 'Severe heat island effect', 'Typhoon windstorm disruptions'],
    cropSuitability: [
      { crop: 'Urban Agriculture & Hydroponics (Tomato/Lettuce)', rating: 'S1 - Highly Suitable', advisory: 'Controlled environment agriculture and rooftop farming.' },
      { crop: 'Conventional Field Crops', rating: 'S3 - Marginally Suitable', advisory: 'Extremely limited by urbanization and industrial conversion.' }
    ]
  },
  'BARMM (Bangsamoro)': {
    name: 'BARMM (Bangsamoro)',
    lat: 7.2230,
    lng: 124.2431,
    climateType: 'Type IV (Rainfall evenly distributed)',
    typhoonFrequency: 'Very Low (Typhoon-free)',
    predominantSoil: 'Hydromorphic Peat / Mangrove Organic Soil (Coastal Marsh)',
    extremeEvents: ['Lingering Liguasan Marsh seasonal flooding', 'Prolonged dry spells', 'River siltation'],
    cropSuitability: [
      { crop: 'White Corn, Cassava & Sugarcane', rating: 'S1 - Highly Suitable', advisory: 'Extensive alluvial agricultural potential in well-drained zones.' },
      { crop: 'Sweet Potato & Inland Aquaculture', rating: 'S1 - Highly Suitable', advisory: 'Unmatched potential across marshland and coastal organic peat zones.' }
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
  const { location, updateFromCoords } = useLocation();

  const handleNumberInput = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: number) => void) => {
    const val = e.target.value;
    if (val === '') {
      setter('' as any);
    } else {
      const parsed = parseFloat(val);
      if (!isNaN(parsed)) setter(parsed);
    }
  };

  const initialReg = (location && location.lat >= 14.4 && location.lat <= 14.7 && location.lng >= 120.9 && location.lng <= 121.1) ? "National Capital Region (NCR)" : "Region IV-A (CALABARZON)";
    const [selectedRegionKey, setSelectedRegionKey] = useState<string>(initialReg);
  const activeRegionData = REGIONAL_INTELLIGENCE[selectedRegionKey] || REGIONAL_INTELLIGENCE['Region IV-A (CALABARZON)'];

  const [regionPreset, setRegionPreset] = useState(initialReg);
  const [selectedSoilType, setSelectedSoilType] = useState<string>(activeRegionData.predominantSoil);
  const [cropProfile, setCropProfile] = useState<string>('Lowland Rice / Paddy (Wetland)');

  const [extractedElevation, setExtractedElevation] = useState<number>(0);
  const [extractedSlopePct, setExtractedSlopePct] = useState<number>(0);

  const computeTopography = async (lat: number, lng: number) => {
    try {
      const elevations = await fetchBatchElevations([{ lat, lng }]);
      const liveElev = elevations[0] ?? 0;
      const offsetElevations = await fetchBatchElevations([{ lat: lat + 0.0001, lng: lng + 0.0001 }]);
      const adjElev = offsetElevations[0] ?? liveElev;
      const slopeData = calculateSegmentSlope(
        { lat, lng, elevation: liveElev },
        { lat: lat + 0.0001, lng: lng + 0.0001, elevation: adjElev },
        "Dynamic Terrain Segment"
      );
      return { elev: Number(liveElev.toFixed(1)), slope: Number(Math.abs(slopeData.slopePercent).toFixed(1)) };
    } catch (err) {
      console.error("Open-Meteo elevation fetch failed:", err);
      return { elev: 20, slope: 2.0 };
    }
  };

  useEffect(() => {
    if (activeRegionData && activeRegionData.predominantSoil) {
      setSelectedSoilType(activeRegionData.predominantSoil);
    }
  }, [selectedRegionKey]);

  const handleMapLocationSelect = async (lat: number, lng: number) => {
    updateFromCoords(lat, lng);

    let closestKey = selectedRegionKey;
    let minDistance = Infinity;

    for (const [key, reg] of Object.entries(REGIONAL_INTELLIGENCE)) {
      const dist = Math.pow(reg.lat - lat, 2) + Math.pow(reg.lng - lng, 2);
      if (dist < minDistance) {
        minDistance = dist;
        closestKey = key;
      }
    }

    setSelectedRegionKey(closestKey);
    setRegionPreset(closestKey);

    const topo = await computeTopography(lat, lng);
    setExtractedElevation(topo.elev);
    setExtractedSlopePct(topo.slope);
    setSoilSlopePct(topo.slope);
  };

  const [sharedZoom, setSharedZoom] = useState<number>(13);
  const [mapViewMode, setMapViewMode] = useState<'satellite' | 'street'>('street');

  const [temp, setTemp] = useState<number | ''>(31.5);
  const [solarRad, setSolarRad] = useState<number | ''>(21);
  const [phenologicalStage, setPhenologicalStage] = useState('Mid-Season Stage (Kc: 1.2)');
  const [soilTexture, setSoilTexture] = useState('Heavy Clay (AWHC: 180 mm/m)');

  const [appMethod, setAppMethod] = useState('Surface Flooding (45% Eff)');
  const [flowRate, setFlowRate] = useState<number | ''>(5);
  const [staticLift, setStaticLift] = useState<number | ''>(12);
  const [pipeLength, setPipeLength] = useState<number | ''>(150);
  const [pipeDiameter, setPipeDiameter] = useState<number | ''>(75);
  const [minorLossPct, setMinorLossPct] = useState<number | ''>(10);
  const [opPressure, setOpPressure] = useState<number | ''>(10);

  const [peakSunHours, setPeakSunHours] = useState<number | ''>(5.2);
  const [solarSpecWatt, setSolarSpecWatt] = useState<number>(350);
  const [selectedDcVoltage, setSelectedDcVoltage] = useState<number>(48);
  const [batteryAh, setBatteryAh] = useState<number>(200);

  const [dieselPrice, setDieselPrice] = useState<number | ''>(60);
  const [annualDays, setAnnualDays] = useState<number | ''>(240);

  const numFlowRate = Number(flowRate) || 0;
  const numStaticLift = Number(staticLift) || 0;
  const numPipeLength = Number(pipeLength) || 0;
  const numPipeDiameter = Number(pipeDiameter) || 1;
  const numMinorLossPct = Number(minorLossPct) || 0;
  const numOpPressure = Number(opPressure) || 0;
  const numPeakSunHours = Number(peakSunHours) || 0;

  const frictionLossNum = Number(((numPipeLength * 0.02) / (numPipeDiameter / 1000)).toFixed(1));
  const minorLossNum = Number(((numStaticLift + frictionLossNum) * (numMinorLossPct / 100)).toFixed(1));
  const totalTDHNum = Math.max(0.1, Number((numStaticLift + frictionLossNum + minorLossNum + numOpPressure).toFixed(1)));
  
  const dailyYieldVal = (numFlowRate * 3.6 * numPeakSunHours * 1.3).toFixed(1);
  
  const hydraulicPowerKw = (9.81 * numFlowRate * totalTDHNum) / 1000;
  const pumpEfficiency = 0.45;
  const requiredElectricalKw = hydraulicPowerKw / pumpEfficiency;

  const totalSolarKwRequired = (requiredElectricalKw * 1.25);
  const calculatedPanelsCount = Math.max(1, Math.ceil((totalSolarKwRequired * 1000) / solarSpecWatt));

  const dailyEnergyWh = (requiredElectricalKw * 1000) * numPeakSunHours;
  const dodFactor = 0.80;
  const totalWhCapacityNeeded = dailyEnergyWh / dodFactor;
  const requiredAhAtSystemVoltage = totalWhCapacityNeeded / selectedDcVoltage;
  const calculatedBatteriesCount = Math.max(1, Math.ceil(requiredAhAtSystemVoltage / batteryAh));

  const pStatic = (numStaticLift / totalTDHNum) * 100;
  const pFriction = (frictionLossNum / totalTDHNum) * 100;
  const pMinor = (minorLossNum / totalTDHNum) * 100;
  const pPress = (numOpPressure / totalTDHNum) * 100;

  const c1 = pStatic;
  const c2 = c1 + pFriction;
  const c3 = c2 + pMinor;

  const tdhConicGradient = `conic-gradient(
    #64748b 0% ${c1}%, 
    #f59e0b ${c1}% ${c2}%, 
    #eab308 ${c2}% ${c3}%, 
    #06b6d4 ${c3}% 100%
  )`;

  const [rainfallDepth, setRainfallDepth] = useState<number | ''>(75);
  const [curveNumber, setCurveNumber] = useState<number | ''>(75);
  const [hydrologicGroup, setHydrologicGroup] = useState('Group B (Moderate Infiltration)');
  const [tcHours, setTcHours] = useState<number | ''>(2.4);

  const computeRunoff = () => {
    const P = (Number(rainfallDepth) || 0) / 25.4;
    const S = 1000 / (Number(curveNumber) || 1) - 10;
    const Ia = 0.2 * S;
    if (P <= Ia) return "0.00";
    const Qin = Math.pow(P - Ia, 2) / (P - Ia + S);
    return (Qin * 25.4).toFixed(2);
  };

  const [landUseTarget, setLandUseTarget] = useState('Lowland Rice Paddy');
  const [soilDepth, setSoilDepth] = useState('> 100 cm (Deep)');
  const [soilSlopePct, setSoilSlopePct] = useState<number | ''>(28.5);

  const evaluateSuitability = () => {
    const slopeVal = Number(soilSlopePct) || 0;
    if (slopeVal > 18) {
      return { 
        class: 'N2 - Not Suitable / High Erosion Hazard', 
        note: `⚠️ Severe slope limitation (${slopeVal}%). Surface flooding, paddy farming, and basin irrigation are strictly non-viable due to severe soil erosion and runoff hazards. Terracing, drip, or micro-sprinkler systems are mandatory.` 
      };
    }
    if (slopeVal > 8) {
      return { 
        class: 'S3 - Marginally Suitable', 
        note: `⚠️ Moderate slope (${slopeVal}%). Surface flooding is restricted; contour farming, bench terracing, or sprinkler/drip systems are recommended.` 
      };
    }
    if (soilDepth.includes('Shallow')) {
      return { class: 'S2 - Moderately Suitable', note: 'Restricted effective soil depth.' };
    }
    return { class: 'S1 - Highly Suitable', note: 'No severe topography, soil depth, or drainage limitations detected.' };
  };

  const suitabilityResult = evaluateSuitability();

  const SATELLITE_TILE_URL = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
  const SATELLITE_ATTRIBUTION = "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and GIS User Community";

  const STREET_TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  const STREET_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

  const activeTileUrl = mapViewMode === 'satellite' ? SATELLITE_TILE_URL : STREET_TILE_URL;
  const activeAttribution = mapViewMode === 'satellite' ? SATELLITE_ATTRIBUTION : STREET_ATTRIBUTION;

  const MapStyleToolbar = () => (
    <div className={`flex items-center justify-between p-2.5 rounded-lg border mb-3 text-xs ${theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-slate-200 border-slate-300'}`}>
      <span className={theme === 'dark' ? 'text-slate-400 font-medium' : 'text-slate-700 font-medium'}>🗺️ Select Map Style:</span>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => setMapViewMode('street')}
          className={`px-3 py-1 rounded-md transition-all font-medium ${mapViewMode === 'street' ? 'bg-emerald-600 text-white font-bold shadow-sm' : (theme === 'dark' ? 'bg-slate-900 text-slate-300 hover:bg-slate-800' : 'bg-white text-slate-700 hover:bg-slate-100')}`}
        >
          🗺️ Plain Map View
        </button>
        <button
          onClick={() => setMapViewMode('satellite')}
          className={`px-3 py-1 rounded-md transition-all font-medium ${mapViewMode === 'satellite' ? 'bg-emerald-600 text-white font-bold shadow-sm' : (theme === 'dark' ? 'bg-slate-900 text-slate-300 hover:bg-slate-800' : 'bg-white text-slate-700 hover:bg-slate-100')}`}
        >
          🛰️ Satellite View
        </button>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} p-6 transition-colors`}>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Header */}
        <div className={`flex flex-col md:flex-row justify-between items-center p-4 rounded-xl border ${theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'} gap-4`}>
          <div className="flex items-center gap-4">
            <span className="font-normal text-slate-200 tracking-wider text-base bg-emerald-950/60 px-3.5 py-2 rounded-lg border border-emerald-800/40 shadow-sm">
              <span className="text-cyan-400 text-lg font-bold">A</span>gr<span className="text-white text-sm font-normal">i</span><span className="text-lg font-bold text-cyan-400">I</span>ntel<span className="text-lg font-bold text-cyan-400">PH</span> Core Engine
            </span>
            <div className="flex items-center gap-2 text-xs">
              <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>Theme:</span>
              <button 
                onClick={() => setTheme('dark')} 
                className={`px-2.5 py-1 rounded-md flex items-center gap-1 ${theme === 'dark' ? 'bg-slate-800 text-white font-bold' : 'bg-slate-200 text-slate-700'}`}
              >
                🌙 Dark
              </button>
              <button 
                onClick={() => setTheme('light')} 
                className={`px-2.5 py-1 rounded-md flex items-center gap-1 ${theme === 'light' ? 'bg-emerald-600 text-white font-bold' : 'bg-slate-200 text-slate-700'}`}
              >
                ☀️ Light
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => window.print()} className={`text-xs font-medium px-3 py-1.5 rounded-lg border flex items-center gap-1 transition-colors ${theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'}`}>
              Export CSV
            </button>
            <button onClick={() => window.print()} className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors">
              Print / Executive Dossier
            </button>
            <span className="text-sm font-normal text-slate-300 tracking-wider flex items-center gap-0.5"><span className="text-cyan-400 text-base font-bold">A</span>gr<span className="text-white text-xs font-normal">i</span><span className="text-base font-bold text-cyan-400">I</span>ntel<span className="text-base font-bold text-cyan-400">PH</span></span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className={`flex flex-wrap items-center gap-2 p-2 rounded-xl border ${theme === 'dark' ? 'bg-slate-900/55 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
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
                activeTab === tab.id 
                  ? 'bg-emerald-600 text-white shadow-sm font-bold' 
                  : (theme === 'dark' ? 'text-slate-300 hover:bg-slate-800/50' : 'text-slate-700 hover:bg-slate-100')
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
              <div className={`p-5 rounded-xl border ${theme === 'dark' ? 'bg-slate-900/60 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900 shadow-sm'} space-y-3.5`}>
                <h3 className="text-xs font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-1.5">
                  🌱 Regional Climate & Crops
                </h3>
                <div>
                  <label className={`text-[10px] block mb-1 uppercase font-semibold ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>REGION PRESET (ALL PHILIPPINE REGIONS)</label>
                  <select 
                    value={regionPreset} 
                    onChange={(e) => {
                      const newReg = e.target.value;
                      setRegionPreset(newReg);
                      setSelectedRegionKey(newReg);
                      const reg = REGIONAL_INTELLIGENCE[newReg];
                      if (reg) {
                        updateFromCoords(reg.lat, reg.lng);
                      }
                    }} 
                    className={`w-full text-xs rounded-lg p-2 border ${theme === 'dark' ? 'bg-slate-950 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-800'}`}
                  >
                    {Object.keys(REGIONAL_INTELLIGENCE).map((regKey) => (
                      <option key={regKey} value={regKey}>{regKey}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`text-[10px] block mb-1 uppercase font-semibold ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>LOCAL SOIL TYPE & DA-BSWM SERIES</label>
                  <select 
                    value={selectedSoilType} 
                    onChange={(e) => setSelectedSoilType(e.target.value)} 
                    className={`w-full text-xs rounded-lg p-2 font-medium border ${theme === 'dark' ? 'bg-slate-950 border-emerald-700/60 text-emerald-300' : 'bg-slate-50 border-emerald-600 text-emerald-700'}`}
                  >
                    {ALL_PHILIPPINE_SOIL_TYPES.map((soil) => (
                      <option key={soil} value={soil}>{soil}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`text-[10px] block mb-1 uppercase font-semibold ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>TARGET CROP PROFILE</label>
                  <select 
                    value={cropProfile} 
                    onChange={(e) => setCropProfile(e.target.value)} 
                    className={`w-full text-xs rounded-lg p-2 font-medium border ${theme === 'dark' ? 'bg-slate-950 border-emerald-700/60 text-emerald-300' : 'bg-slate-50 border-emerald-600 text-emerald-700'}`}
                  >
                    {ALL_PHILIPPINE_CROPS.map((crop) => (
                      <option key={crop} value={crop}>{crop}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`text-[10px] block mb-1 uppercase font-semibold ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>TEMP (°C)</label>
                    <input type="number" value={temp} onChange={(e) => handleNumberInput(e, setTemp)} className={`w-full text-xs rounded-lg p-2 border ${theme === 'dark' ? 'bg-slate-950 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-800'}`} />
                  </div>
                  <div>
                    <label className={`text-[10px] block mb-1 uppercase font-semibold ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>SOLAR (MJ)</label>
                    <input type="number" value={solarRad} onChange={(e) => handleNumberInput(e, setSolarRad)} className={`w-full text-xs rounded-lg p-2 border ${theme === 'dark' ? 'bg-slate-950 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-800'}`} />
                  </div>
                </div>
                <div>
                  <label className={`text-[10px] block mb-1 uppercase font-semibold ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>PHENOLOGICAL STAGE (Kc)</label>
                  <select value={phenologicalStage} onChange={(e) => setPhenologicalStage(e.target.value)} className={`w-full text-xs rounded-lg p-2 border ${theme === 'dark' ? 'bg-slate-950 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-800'}`}>
                    <option value="Mid-Season Stage (Kc: 1.2)">Mid-Season Stage (Kc: 1.2)</option>
                    <option value="Initial Stage (Kc: 0.4)">Initial Stage (Kc: 0.4)</option>
                    <option value="Development Stage (Kc: 0.8)">Development Stage (Kc: 0.8)</option>
                    <option value="Late Stage / Harvest (Kc: 0.6)">Late Stage / Harvest (Kc: 0.6)</option>
                  </select>
                </div>
                <div>
                  <label className={`text-[10px] block mb-1 uppercase font-semibold ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>SOIL PROFILE & TEXTURE</label>
                  <select value={soilTexture} onChange={(e) => setSoilTexture(e.target.value)} className={`w-full text-xs rounded-lg p-2 border ${theme === 'dark' ? 'bg-slate-950 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-800'}`}>
                    <option value="Heavy Clay (AWHC: 180 mm/m)">Heavy Clay (AWHC: 180 mm/m)</option>
                    <option value="Clay Loam (AWHC: 140 mm/m)">Clay Loam (AWHC: 140 mm/m)</option>
                    <option value="Sandy Loam (AWHC: 100 mm/m)">Sandy Loam (AWHC: 100 mm/m)</option>
                    <option value="Fine Sand / Coarse (AWHC: 60 mm/m)">Fine Sand / Coarse (AWHC: 60 mm/m)</option>
                  </select>
                </div>
              </div>

              {/* Card 2: Irrigation Method & Hydraulics */}
              <div className={`p-5 rounded-xl border ${theme === 'dark' ? 'bg-slate-900/60 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900 shadow-sm'} space-y-3.5`}>
                <h3 className="text-xs font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-1.5">
                  💧 Irrigation Method & Hydraulics
                </h3>
                <div>
                  <label className={`text-[10px] block mb-1 uppercase font-semibold ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>APPLICATION METHOD</label>
                  <select value={appMethod} onChange={(e) => setAppMethod(e.target.value)} className={`w-full text-xs rounded-lg p-2 border ${theme === 'dark' ? 'bg-slate-950 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-800'}`}>
                    <option value="Surface Flooding (45% Eff)">Surface Flooding (45% Eff)</option>
                    <option value="Furrow Irrigation (60% Eff)">Furrow Irrigation (60% Eff)</option>
                    <option value="Sprinkler Irrigation (75% Eff)">Sprinkler Irrigation (75% Eff)</option>
                    <option value="Micro-Sprinkler (75% Eff)">Micro-Sprinkler (75% Eff)</option>
                    <option value="Drip Irrigation (90% Eff)">Drip Irrigation (90% Eff)</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`text-[10px] block mb-1 uppercase font-semibold ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>FLOW (L/S)</label>
                    <input type="number" value={flowRate} onChange={(e) => handleNumberInput(e, setFlowRate)} className={`w-full text-xs rounded-lg p-2 border ${theme === 'dark' ? 'bg-slate-950 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-800'}`} />
                  </div>
                  <div>
                    <label className={`text-[10px] block mb-1 uppercase font-semibold ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>STATIC LIFT (M)</label>
                    <input type="number" value={staticLift} onChange={(e) => handleNumberInput(e, setStaticLift)} className={`w-full text-xs rounded-lg p-2 border ${theme === 'dark' ? 'bg-slate-950 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-800'}`} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`text-[10px] block mb-1 uppercase font-semibold ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>LENGTH (M)</label>
                    <input type="number" value={pipeLength} onChange={(e) => handleNumberInput(e, setPipeLength)} className={`w-full text-xs rounded-lg p-2 border ${theme === 'dark' ? 'bg-slate-950 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-800'}`} />
                  </div>
                  <div>
                    <label className={`text-[10px] block mb-1 uppercase font-semibold ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>DIAM (MM)</label>
                    <input type="number" value={pipeDiameter} onChange={(e) => handleNumberInput(e, setPipeDiameter)} className={`w-full text-xs rounded-lg p-2 border ${theme === 'dark' ? 'bg-slate-950 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-800'}`} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`text-[10px] block mb-1 uppercase font-semibold ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>MINOR LOSS (%)</label>
                    <input type="number" value={minorLossPct} onChange={(e) => handleNumberInput(e, setMinorLossPct)} className={`w-full text-xs rounded-lg p-2 border ${theme === 'dark' ? 'bg-slate-950 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-800'}`} />
                  </div>
                  <div>
                    <label className={`text-[10px] block mb-1 uppercase font-semibold ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>OP. PRESS (M)</label>
                    <input type="number" value={opPressure} onChange={(e) => handleNumberInput(e, setOpPressure)} className={`w-full text-xs rounded-lg p-2 border ${theme === 'dark' ? 'bg-slate-950 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-800'}`} />
                  </div>
                </div>
              </div>

              {/* Card 3: Solar & BoS Sizing */}
              <div className={`p-5 rounded-xl border ${theme === 'dark' ? 'bg-slate-900/60 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900 shadow-sm'} space-y-3.5`}>
                <h3 className="text-xs font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-1.5">
                  ☀️ Solar & BoS Sizing
                </h3>
                <div>
                  <label className={`text-[10px] block mb-1 uppercase font-semibold ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>PEAK SUN HOURS (PSH)</label>
                  <input type="number" value={peakSunHours} onChange={(e) => handleNumberInput(e, setPeakSunHours)} className={`w-full text-xs rounded-lg p-2 border ${theme === 'dark' ? 'bg-slate-950 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-800'}`} />
                </div>
                <div>
                  <label className={`text-[10px] block mb-1 uppercase font-semibold ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>SOLAR PANEL SPEC (WATTAGE)</label>
                  <select value={solarSpecWatt} onChange={(e) => setSolarSpecWatt(Number(e.target.value))} className={`w-full text-xs rounded-lg p-2 border ${theme === 'dark' ? 'bg-slate-950 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-800'}`}>
                    <option value={150}>150W Compact Panel</option>
                    <option value={250}>250W Standard Utility</option>
                    <option value={350}>350W Commercial Monocrystalline</option>
                    <option value={450}>450W High-Efficiency Mono</option>
                    <option value={550}>550W High-Power Agro</option>
                    <option value={600}>600W Ultra High-Power</option>
                  </select>
                </div>
                <div>
                  <label className={`text-[10px] block mb-1 uppercase font-semibold ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>SYSTEM DC VOLTAGE</label>
                  <select value={selectedDcVoltage} onChange={(e) => setSelectedDcVoltage(Number(e.target.value))} className={`w-full text-xs rounded-lg p-2 border ${theme === 'dark' ? 'bg-slate-950 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-800'}`}>
                    <option value={12}>12V DC System</option>
                    <option value={24}>24V DC System</option>
                    <option value={48}>48V DC System (Standard)</option>
                  </select>
                </div>
                <div>
                  <label className={`text-[10px] block mb-1 uppercase font-semibold ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>LIFEPO4 BATTERY BANK SPEC</label>
                  <select value={batteryAh} onChange={(e) => setBatteryAh(Number(e.target.value))} className={`w-full text-xs rounded-lg p-2 border ${theme === 'dark' ? 'bg-slate-950 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-800'}`}>
                    <option value={100}>100Ah LiFePO4</option>
                    <option value={200}>200Ah LiFePO4</option>
                    <option value={314}>314Ah LiFePO4</option>
                  </select>
                </div>

                <div className={`p-3 rounded-xl border text-xs space-y-2 pt-2.5 ${theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-300'}`}>
                  <div className="flex justify-between items-center">
                    <span className={`text-[10px] uppercase font-bold ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Panels Needed:</span>
                    <span className="text-emerald-500 font-bold font-mono text-sm">{calculatedPanelsCount} units ({solarSpecWatt}W)</span>
                  </div>
                  <div className={`flex justify-between items-center border-t pt-1.5 ${theme === 'dark' ? 'border-slate-800/80' : 'border-slate-300'}`}>
                    <span className={`text-[10px] uppercase font-bold ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Batteries Needed:</span>
                    <span className="text-emerald-500 font-bold font-mono text-sm">{calculatedBatteriesCount} units ({batteryAh}Ah @ {selectedDcVoltage}V)</span>
                  </div>
                </div>
              </div>

              {/* Card 4: Economics & Savings */}
              <div className={`p-5 rounded-xl border ${theme === 'dark' ? 'bg-slate-900/60 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900 shadow-sm'} space-y-3.5`}>
                <h3 className="text-xs font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-1.5">
                  💰 Economics & Savings
                </h3>
                <div>
                  <label className={`text-[10px] block mb-1 uppercase font-semibold ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>FUEL / DIESEL PRICE</label>
                  <input type="number" value={dieselPrice} onChange={(e) => handleNumberInput(e, setDieselPrice)} className={`w-full text-xs rounded-lg p-2 border ${theme === 'dark' ? 'bg-slate-950 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-800'}`} />
                </div>
                <div>
                  <label className={`text-[10px] block mb-1 uppercase font-semibold ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>ANNUAL OP. DAYS</label>
                  <input type="number" value={annualDays} onChange={(e) => handleNumberInput(e, setAnnualDays)} className={`w-full text-xs rounded-lg p-2 border ${theme === 'dark' ? 'bg-slate-950 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-800'}`} />
                </div>
                <div className={`p-4 rounded-xl border text-xs space-y-1 ${theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-300'}`}>
                  <span className={`block text-[10px] uppercase font-bold ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>DAILY YIELD</span>
                  <span className="text-emerald-500 text-lg font-bold block font-mono">{dailyYieldVal} m³/day</span>
                </div>
              </div>
            </div>

            {/* Bottom Analytics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* TDH Breakdown Pie Graph Card */}
              <div className={`border rounded-xl p-6 flex flex-col justify-between min-h-[500px] ${theme === 'dark' ? 'bg-slate-900/60 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900 shadow-sm'}`}>
                <h4 className="text-xs font-bold text-emerald-500 uppercase tracking-wider">📈 Total Dynamic Head (TDH) Breakdown (Pie Graph)</h4>
                <div className="flex flex-col sm:flex-row items-center justify-around my-auto gap-8 py-8">
                  <div 
                    className={`w-64 h-64 rounded-full border-4 shadow-inner relative flex items-center justify-center shrink-0 transition-all ${theme === 'dark' ? 'border-slate-800' : 'border-slate-300'}`}
                    style={{ background: tdhConicGradient }}
                  >
                    <div className={`w-36 h-36 rounded-full flex flex-col items-center justify-center text-center shadow ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-900'}`}>
                      <span className={`text-xs uppercase font-semibold ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Total TDH</span>
                      <span className="text-xl font-bold text-emerald-500 font-mono">{totalTDHNum}m</span>
                    </div>
                  </div>
                  <div className={`grid grid-cols-1 gap-y-3 text-xs ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                    <div className="flex items-center gap-2.5">
                      <span className="w-3.5 h-3.5 rounded-full bg-slate-500 inline-block shrink-0"></span>
                      <span>Static Lift: <strong className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>{numStaticLift}m</strong> ({pStatic.toFixed(1)}%)</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="w-3.5 h-3.5 rounded-full bg-amber-500 inline-block shrink-0"></span>
                      <span>Friction Loss: <strong className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>{frictionLossNum}m</strong> ({pFriction.toFixed(1)}%)</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="w-3.5 h-3.5 rounded-full bg-yellow-500 inline-block shrink-0"></span>
                      <span>Minor Loss: <strong className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>{minorLossNum}m</strong> ({pMinor.toFixed(1)}%)</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="w-3.5 h-3.5 rounded-full bg-cyan-500 inline-block shrink-0"></span>
                      <span>Operating Pressure: <strong className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>{numOpPressure}m</strong> ({pPress.toFixed(1)}%)</span>
                    </div>
                  </div>
                </div>
                <div className={`text-[11px] text-center border-t pt-3 ${theme === 'dark' ? 'text-slate-400 border-slate-800/80' : 'text-slate-600 border-slate-200'}`}>
                  Proportional hydraulic loss distribution
                </div>
              </div>

              {/* Estimated Daily Pumping Yield Curve Bar Graph Card */}
              <div className={`border rounded-xl p-6 flex flex-col justify-between min-h-[500px] ${theme === 'dark' ? 'bg-slate-900/60 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900 shadow-sm'}`}>
                <h4 className="text-xs font-bold text-emerald-500 uppercase tracking-wider">☀️ Estimated Daily Pumping Yield Curve (Hourly Values)</h4>
                <div className="w-full my-auto flex flex-col justify-end pt-6">
                  <div className={`h-80 w-full rounded-lg border flex items-end p-4 gap-2.5 pt-12 ${theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-300'}`}>
                    {[2, 5, 12, 25, 38, 45, 48, 42, 30, 18, 6, 1].map((val, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group">
                        <span className="text-[10px] text-emerald-500 font-mono opacity-90 group-hover:opacity-100 pb-1.5">{val}m³</span>
                        <div style={{ height: `${val * 1.9}%` }} className="w-full bg-emerald-500/80 rounded-t-md hover:bg-emerald-400 transition-all shadow-sm" />
                      </div>
                    ))}
                  </div>
                  <p className={`text-[11px] flex justify-between pt-3 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                    <span>06:00 AM</span>
                    <span>12:00 PM (Peak Sun)</span>
                    <span>06:00 PM</span>
                  </p>
                </div>
                <div className={`text-[11px] text-center border-t pt-3 ${theme === 'dark' ? 'text-slate-400 border-slate-800/80' : 'text-slate-600 border-slate-200'}`}>
                  Hourly solar PV yield distribution across operational window
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Tab 2: GIS Spatial & DEM */}
        {activeTab === 'gis' && (
          <div className="space-y-4">
            <div className={`border rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${theme === 'dark' ? 'bg-slate-900/60 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900 shadow-sm'}`}>
              <div>
                <h3 className="text-xs font-bold text-emerald-500 uppercase tracking-wider">MAP GIS LAYER & TOPOGRAPHIC ELEVATION / SLOPE SAMPLER</h3>
                <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                  Active Lat: <span className="text-emerald-500 font-mono">{location.lat.toFixed(5)}° N</span> | 
                  Lng: <span className="text-emerald-500 font-mono">{location.lng.toFixed(5)}° E</span> | 
                  Elevation: <span className="text-amber-500 font-mono">{extractedElevation} m</span> | 
                  Extracted Slope: <span className={`font-mono font-bold ${extractedSlopePct > 18 ? 'text-red-500' : 'text-emerald-500'}`}>{extractedSlopePct}%</span>
                </p>
              </div>
              <div className={`text-[11px] italic ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                💡 Click anywhere on the map to sample precise topographic elevation and slope.
              </div>
            </div>

            <MapStyleToolbar />

            <div className={`w-full rounded-xl overflow-hidden border relative ${theme === 'dark' ? 'border-slate-800' : 'border-slate-300'}`} style={{ height: '420px' }}>
              <MapContainer center={[location.lat, location.lng]} zoom={sharedZoom} style={{ height: '100%', width: '100%' }}>
                <SyncedMapController center={[location.lat, location.lng]} zoom={sharedZoom} />
                <MapEventsHandler onZoomChange={setSharedZoom} onClickChange={(lat, lng) => {
                  handleMapLocationSelect(lat, lng);
                }} />
                <TileLayer key={mapViewMode} attribution={activeAttribution} url={activeTileUrl} />
                <Marker position={[location.lat, location.lng]}>
                  <Popup>
                    <div className="text-xs space-y-1">
                      <strong>📍 Topographic Point Analysis</strong><br/>
                      Elevation: {extractedElevation} m<br/>
                      Calculated Slope: {extractedSlopePct}% ({isFinite(extractedSlopePct) ? (Math.atan(extractedSlopePct / 100) * (180 / Math.PI)).toFixed(1) : 0}°)<br/>
                      {extractedSlopePct > 18 ? <span className="text-red-500 font-bold">⚠️ Warning: Steep Slope (&gt;18%) - Surface Irrigation Non-Viable</span> : <span className="text-emerald-500 font-bold">✅ Suitable for Standard Irrigation</span>}
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
          </div>
        )}

        {/* Tab 3: Weather & Climate */}
        {activeTab === 'weather' && (
          <div className="space-y-6">
            <div className={`border rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${theme === 'dark' ? 'bg-slate-900/60 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900 shadow-sm'}`}>
              <div>
                <h3 className="text-xs font-bold text-emerald-500 uppercase tracking-wider">🌦️ PAGASA Regional Weather & Extreme Climate Risk Matrix</h3>
                <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Select any Philippine region to evaluate historical climate extremes and typhoon frequencies.</p>
              </div>
              <div className="w-full md:w-80">
                <select
                  value={selectedRegionKey}
                  onChange={(e) => {
                    const key = e.target.value;
                    setSelectedRegionKey(key);
                    setRegionPreset(key);
                    const reg = REGIONAL_INTELLIGENCE[key];
                    if (reg) {
                      updateFromCoords(reg.lat, reg.lng);
                    }
                  }}
                  className={`w-full text-xs rounded-lg p-2 border ${theme === 'dark' ? 'bg-slate-950 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-800'}`}
                >
                  {Object.keys(REGIONAL_INTELLIGENCE).map((k) => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={`border rounded-xl p-5 space-y-3 ${theme === 'dark' ? 'bg-slate-900/60 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900 shadow-sm'}`}>
                <h4 className="text-xs font-bold text-amber-500 uppercase tracking-wider">⚠️ Historical Extreme Weather Events</h4>
                <div className="space-y-2">
                  {activeRegionData.extremeEvents.map((evt, idx) => (
                    <div key={idx} className={`p-3 rounded-lg border text-xs flex items-start gap-2 ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-100 border-slate-300 text-slate-700'}`}>
                      <span className="text-amber-500 font-bold">•</span>
                      <span>{evt}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`border rounded-xl p-5 space-y-3 ${theme === 'dark' ? 'bg-slate-900/60 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900 shadow-sm'}`}>
                <h4 className="text-xs font-bold text-emerald-500 uppercase tracking-wider">🌪️ Local Climatology & Soil Series</h4>
                <div className={`p-4 rounded-xl border text-xs space-y-3 ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-100 border-slate-300 text-slate-700'}`}>
                  <div>
                    <span className={`block text-[10px] uppercase ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Climate Classification</span>
                    <strong className="text-emerald-500 text-sm">{activeRegionData.climateType}</strong>
                  </div>
                  <div className={`border-t pt-2 ${theme === 'dark' ? 'border-slate-800' : 'border-slate-300'}`}>
                    <span className={`block text-[10px] uppercase ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Predominant Local Soil Type</span>
                    <strong className="text-emerald-500 text-sm">{activeRegionData.predominantSoil}</strong>
                  </div>
                  <div className={`border-t pt-2 ${theme === 'dark' ? 'border-slate-800' : 'border-slate-300'}`}>
                    <span className={`block text-[10px] uppercase ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Annual Typhoon Exposure</span>
                    <strong className="text-amber-500 text-sm">{activeRegionData.typhoonFrequency}</strong>
                  </div>
                </div>
              </div>
            </div>

            <MapStyleToolbar />

            <div className={`w-full rounded-xl overflow-hidden border ${theme === 'dark' ? 'border-slate-800' : 'border-slate-300'}`} style={{ height: '380px' }}>
              <MapContainer center={[location.lat, location.lng]} zoom={sharedZoom} style={{ height: '100%', width: '100%' }}>
                <SyncedMapController center={[location.lat, location.lng]} zoom={sharedZoom} />
                <MapEventsHandler onZoomChange={setSharedZoom} onClickChange={(lat, lng) => handleMapLocationSelect(lat, lng)} />
                <TileLayer key={mapViewMode} attribution={activeAttribution} url={activeTileUrl} />
                <Marker position={[location.lat, location.lng]}><Popup>{activeRegionData.name}</Popup></Marker>
              </MapContainer>
            </div>
          </div>
        )}

        {/* Tab 4: PAGASA Typhoon & PAR */}
        {activeTab === 'typhoon' && (
          <div className="space-y-6">
            <div className={`border rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${theme === 'dark' ? 'bg-slate-900/60 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900 shadow-sm'}`}>
              <div>
                <h3 className="text-xs font-bold text-emerald-500 uppercase tracking-wider">🌀 PAGASA Philippine Area of Responsibility (PAR) & Regional Weather Matrix</h3>
                <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Complete nationwide extreme weather and typhoon vulnerability table across all 17 Philippine regions.</p>
              </div>
              <span className="text-xs font-mono bg-emerald-950 text-emerald-300 px-3 py-1 rounded border border-emerald-800">
                PAR Status: Normal (No Cyclones Detected)
              </span>
            </div>

            <MapStyleToolbar />

            <div className={`w-full rounded-xl overflow-hidden border ${theme === 'dark' ? 'border-slate-800' : 'border-slate-300'}`} style={{ height: '380px' }}>
              <MapContainer center={[13.0, 122.0]} zoom={5} style={{ height: '100%', width: '100%' }}>
                <SyncedMapController center={[location.lat, location.lng]} zoom={sharedZoom} />
                <MapEventsHandler onZoomChange={setSharedZoom} onClickChange={(lat, lng) => handleMapLocationSelect(lat, lng)} />
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

            <div className={`border rounded-xl p-5 space-y-4 ${theme === 'dark' ? 'bg-slate-900/60 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900 shadow-sm'}`}>
              <h4 className="text-xs font-bold text-emerald-500 uppercase tracking-wider">📋 Complete Nationwide Regional Extreme Weather & Local Soil Listing (All 17 Regions)</h4>
              <div className="overflow-x-auto max-h-[500px]">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className={`sticky top-0 ${theme === 'dark' ? 'bg-slate-950 text-slate-400' : 'bg-slate-200 text-slate-700'}`}>
                    <tr className={`border-b ${theme === 'dark' ? 'border-slate-800' : 'border-slate-300'}`}>
                      <th className="p-3">Region</th>
                      <th className="p-3">Predominant Local Soil Type</th>
                      <th className="p-3">Climate Type</th>
                      <th className="p-3">Typhoon Exposure</th>
                      <th className="p-3">Historical Hazards</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${theme === 'dark' ? 'divide-slate-800/60 text-slate-300' : 'divide-slate-200 text-slate-700'}`}>
                    {Object.values(REGIONAL_INTELLIGENCE).map((reg, idx) => (
                      <tr key={idx} className={theme === 'dark' ? 'hover:bg-slate-900/40' : 'hover:bg-slate-50'}>
                        <td className="p-3 font-bold text-emerald-500">{reg.name}</td>
                        <td className={`p-3 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>{reg.predominantSoil}</td>
                        <td className="p-3">{reg.climateType}</td>
                        <td className="p-3 font-medium text-amber-500">{reg.typhoonFrequency}</td>
                        <td className="p-3">{reg.extremeEvents.join('; ')}</td>
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
            <div className={`border rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${theme === 'dark' ? 'bg-slate-900/60 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900 shadow-sm'}`}>
              <div>
                <h3 className="text-xs font-bold text-emerald-500 uppercase tracking-wider">🌋 PHIVOLCS Active Fault & Volcanic Hazard Map</h3>
                <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Geohazard proximity analysis active for: <strong className="text-emerald-500">{location.name || "Selected Location"}</strong></p>
              </div>
              <div className="flex gap-2 text-xs">
                <span className="bg-amber-950 text-amber-300 px-2.5 py-1 rounded border border-amber-800">Shaking: Moderate</span>
                <span className="bg-emerald-950 text-emerald-300 px-2.5 py-1 rounded border border-emerald-800">Liquefaction: Low</span>
              </div>
            </div>

            <MapStyleToolbar />

            <div className={`w-full rounded-xl overflow-hidden border ${theme === 'dark' ? 'border-slate-800' : 'border-slate-300'}`} style={{ height: '420px' }}>
              <MapContainer center={[location.lat, location.lng]} zoom={sharedZoom} style={{ height: '100%', width: '100%' }}>
                <SyncedMapController center={[location.lat, location.lng]} zoom={sharedZoom} />
                <MapEventsHandler onZoomChange={setSharedZoom} onClickChange={(lat, lng) => handleMapLocationSelect(lat, lng)} />
                <TileLayer key={mapViewMode} attribution={activeAttribution} url={activeTileUrl} />
                <Marker position={[location.lat, location.lng]}><Popup>Geohazard Check: {location.name || "Custom Pin"}</Popup></Marker>
              </MapContainer>
            </div>
          </div>
        )}

        {/* Tab 6: Watershed (NRCS CN) */}
        {activeTab === 'watershed' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`border rounded-xl p-5 space-y-4 ${theme === 'dark' ? 'bg-slate-900/60 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900 shadow-sm'}`}>
              <h3 className="text-xs font-bold text-emerald-500 uppercase tracking-wider">📐 NRCS CURVE NUMBER RUNOFF COMPUTATION</h3>
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>24-Hr Storm Rainfall Depth (mm)</span>
                    <span className="text-emerald-500 font-bold">{rainfallDepth} mm</span>
                  </div>
                  <input type="range" min="10" max="300" value={Number(rainfallDepth) || 0} onChange={(e) => handleNumberInput(e, setRainfallDepth)} className="w-full accent-emerald-500" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>Runoff Curve Number (CN)</span>
                    <span className="text-emerald-500 font-bold">{curveNumber}</span>
                  </div>
                  <input type="range" min="40" max="98" value={Number(curveNumber) || 0} onChange={(e) => handleNumberInput(e, setCurveNumber)} className="w-full accent-emerald-500" />
                </div>
              </div>
              <div className={`p-4 rounded-xl border text-xs space-y-2 ${theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-300'}`}>
                <span className={`block text-[10px] uppercase font-bold tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Direct Storm Surface Runoff (Q)</span>
                <span className="text-emerald-500 text-xl font-bold font-mono block">{computeRunoff()} mm</span>
              </div>
            </div>
            <div className={`border rounded-xl p-5 space-y-4 ${theme === 'dark' ? 'bg-slate-900/60 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900 shadow-sm'}`}>
              <h3 className="text-xs font-bold text-emerald-500 uppercase tracking-wider">WATERSHED PARAMETERS & HYDROLOGIC GROUP</h3>
              <div className="space-y-3 text-xs">
                <div>
                  <label className={`text-[11px] block mb-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Hydrologic Soil Group</label>
                  <select value={hydrologicGroup} onChange={(e) => setHydrologicGroup(e.target.value)} className={`w-full text-xs rounded-lg p-2 border ${theme === 'dark' ? 'bg-slate-950 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-800'}`}>
                    <option value="Group A (High Infiltration / Sand)">Group A (High Infiltration / Sand)</option>
                    <option value="Group B (Moderate Infiltration / Loam)">Group B (Moderate Infiltration / Loam)</option>
                    <option value="Group C (Slow Infiltration / Clay Loam)">Group C (Slow Infiltration / Clay Loam)</option>
                    <option value="Group D (Very Slow Infiltration / Heavy Clay)">Group D (Very Slow Infiltration / Heavy Clay)</option>
                  </select>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>Time of Concentration (Tc)</span>
                    <span className="text-emerald-500 font-bold">{tcHours} hrs</span>
                  </div>
                  <input type="range" min="0.5" max="12.0" step="0.1" value={Number(tcHours) || 0} onChange={(e) => handleNumberInput(e, setTcHours)} className="w-full accent-emerald-500" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 7: Land Suitability */}
        {activeTab === 'land' && (
          <div className="space-y-6">
            <div className={`border rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${theme === 'dark' ? 'bg-slate-900/60 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900 shadow-sm'}`}>
              <div>
                <h3 className="text-xs font-bold text-emerald-500 uppercase tracking-wider">🌾 Regional Crop Suitability & FAO Agricultural Adaptability Matrix</h3>
                <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Crop evaluations automatically synchronized for: <strong className="text-emerald-500">{activeRegionData.name}</strong></p>
              </div>
              <div className="w-full md:w-80">
                <select
                  value={selectedRegionKey}
                  onChange={(e) => {
                    const key = e.target.value;
                    setSelectedRegionKey(key);
                    setRegionPreset(key);
                    const reg = REGIONAL_INTELLIGENCE[key];
                    if (reg) {
                      updateFromCoords(reg.lat, reg.lng);
                    }
                  }}
                  className={`w-full text-xs rounded-lg p-2 border ${theme === 'dark' ? 'bg-slate-950 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-800'}`}
                >
                  {Object.keys(REGIONAL_INTELLIGENCE).map((k) => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {activeRegionData.cropSuitability.map((item, idx) => (
                <div key={idx} className={`border rounded-xl p-4 space-y-2 ${theme === 'dark' ? 'bg-slate-900/60 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900 shadow-sm'}`}>
                  <span className="text-xs font-bold text-emerald-500 block">{item.crop}</span>
                  <span className="bg-emerald-950 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-800 inline-block">
                    {item.rating}
                  </span>
                  <p className={`text-xs pt-1 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>{item.advisory}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className={`border rounded-xl p-5 space-y-4 ${theme === 'dark' ? 'bg-slate-900/60 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900 shadow-sm'}`}>
                <h3 className="text-xs font-bold text-emerald-500 uppercase tracking-wider">FAO LAND EVALUATION PARAMETERS</h3>
                <div className="space-y-3 text-xs">
                  <div>
                    <label className={`text-[11px] block mb-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Target Land Use / Crop</label>
                    <select 
                      value={landUseTarget} 
                      onChange={(e) => setLandUseTarget(e.target.value)} 
                      className={`w-full text-xs rounded-lg p-2 border ${theme === 'dark' ? 'bg-slate-950 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-800'}`}
                    >
                      {ALL_PHILIPPINE_CROPS.map((crop) => (
                        <option key={crop} value={crop}>{crop}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`text-[11px] block mb-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Local Soil Series / Type Selection</label>
                    <select 
                      value={selectedSoilType} 
                      onChange={(e) => setSelectedSoilType(e.target.value)} 
                      className={`w-full text-xs rounded-lg p-2 font-medium border ${theme === 'dark' ? 'bg-slate-950 border-emerald-700/60 text-emerald-300' : 'bg-slate-50 border-emerald-600 text-emerald-700'}`}
                    >
                      {ALL_PHILIPPINE_SOIL_TYPES.map((soil) => (
                        <option key={soil} value={soil}>{soil}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className={`p-4 rounded-xl border text-xs space-y-2 ${Number(soilSlopePct) > 18 ? 'bg-red-950/40 border-red-800/80 text-red-200' : (theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-100 border-slate-300 text-slate-900')}`}>
                  <span className={`block text-[10px] uppercase font-bold tracking-wider ${Number(soilSlopePct) > 18 ? 'text-red-400' : (theme === 'dark' ? 'text-slate-400' : 'text-slate-600')}`}>
                    FAO Local Site Rating & Slope Hazard Warning
                  </span>
                  <span className={`text-lg font-bold block ${Number(soilSlopePct) > 18 ? 'text-red-400' : 'text-emerald-500'}`}>
                    {suitabilityResult.class}
                  </span>
                  <p className={`text-[11px] pt-1 leading-relaxed ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                    {suitabilityResult.note}
                  </p>
                </div>
              </div>

              <div className={`border rounded-xl p-5 space-y-4 ${theme === 'dark' ? 'bg-slate-900/60 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900 shadow-sm'}`}>
                <h3 className="text-xs font-bold text-emerald-500 uppercase tracking-wider">LIMITATION FACTORS & DRAINAGE</h3>
                <div className="space-y-3 text-xs">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>Terrain Slope (%) [Synced from Map & DEM]</span>
                      <span className={`font-bold ${Number(soilSlopePct) > 18 ? 'text-red-500' : 'text-emerald-500'}`}>{soilSlopePct}%</span>
                    </div>
                    <input type="range" min="0" max="45" value={Number(soilSlopePct) || 0} onChange={(e) => handleNumberInput(e, setSoilSlopePct)} className="w-full accent-emerald-500" />
                  </div>
                  {Number(soilSlopePct) > 18 && (
                    <div className="p-3 bg-red-950/60 border border-red-800 rounded-lg text-red-300 text-xs space-y-1">
                      <strong>⚠️ Irrigation Viability Warning:</strong>
                      <p>Slopes exceeding 18% (such as upland sections of Mt. Makiling and Tagaytay/Laurel ridges) present extreme erosion risks for surface flooding or paddy irrigation. Switch to micro-irrigation (drip/sprinkler) or terraced contour farming.</p>
                    </div>
                  )}
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
