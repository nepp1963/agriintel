import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from 'chart.js';
import { WatershedModule } from './WatershedModule';
import { LandSuitabilityModule } from './LandSuitabilityModule';
import { SoilSalinityModule } from './SoilSalinityModule';
import { GISMapModule } from './GISMapModule';
import { WeatherClimateModule } from './WeatherClimateModule';
import { TyphoonTrackerModule } from './TyphoonTrackerModule';
import { GeohazardFaultModule } from './GeohazardFaultModule';
import { useLocation } from '../../context/LocationContext';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

export function IrrigationDashboard() {
  const { location, updateFromCoords } = useLocation();
  const [activeTab, setActiveTab] = useState<'irrigation' | 'watershed' | 'suitability' | 'salinity' | 'gis' | 'weather' | 'typhoon' | 'geohazard'>('irrigation');

  // UI Customization States
  const [themeAccent, setThemeAccent] = useState<'emerald' | 'sky' | 'purple' | 'amber'>('emerald');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  // Persistent GIS Coordinates (Synced with Global LocationContext)
  const [gisLat, setGisLat] = useState<number>(location.lat);
  const [gisLng, setGisLng] = useState<number>(location.lng);
  const [extractedElevation, setExtractedElevation] = useState<number>(location.elevation);

  // Regional Presets
  const [selectedRegion, setSelectedRegion] = useState<string>("southern_luzon");

  // Weather Parameters
  const [temp, setTemp] = useState<number | ''>(location.tempMax);
  const [humidity, setHumidity] = useState<number | ''>(location.humidity);
  const [windSpeed, setWindSpeed] = useState<number | ''>(location.windSpeed);
  const [solarRad, setSolarRad] = useState<number | ''>(location.solarRad);

  // Crop & Soil Selectors
  const [selectedCrop, setSelectedCrop] = useState<string>("lowland_rice");
  const [growthStage, setGrowthStage] = useState<string>("mid");
  const [soilType, setSoilType] = useState<string>("heavy_clay");

  // Irrigation Method Selector
  const [irrigationMethod, setIrrigationMethod] = useState<string>("surface");

  // Hydraulics Parameters
  const [flowRateLps, setFlowRateLps] = useState<number | ''>(5);
  const [staticHead, setStaticHead] = useState<number | ''>(12);
  const [pipeLength, setPipeLength] = useState<number | ''>(150);
  const [pipeDiameterMm, setPipeDiameterMm] = useState<number | ''>(75);
  const [pumpEfficiency, setPumpEfficiency] = useState<number | ''>(0.65);
  const [minorLossPercent, setMinorLossPercent] = useState<number | ''>(10);
  const [operatingPressure, setOperatingPressure] = useState<number | ''>(10);

  // Solar & Battery Parameters
  const [peakSunHours, setPeakSunHours] = useState<number | ''>(5.2);
  const [safetyFactor, setSafetyFactor] = useState<number | ''>(1.3);
  const [panelWattage, setPanelWattage] = useState<number>(350);
  const [systemVoltage, setSystemVoltage] = useState<number>(48);
  const [batteryAutonomyRatio, setBatteryAutonomyRatio] = useState<number>(0.5);

  // Economic Parameters
  const [dieselPricePHP, setDieselPricePHP] = useState<number | ''>(60);
  const [annualOpDays, setAnnualOpDays] = useState<number | ''>(240);

  // Cross-Module States
  const [catchmentAreaSqKm, setCatchmentAreaSqKm] = useState<number | ''>(12.5);
  const [rainfallMm, setRainfallMm] = useState<number | ''>(2400);
  const [curveNumber, setCurveNumber] = useState<number | ''>(location.defaultCurveNumber);
  const [flowLengthKm, setFlowLengthKm] = useState<number | ''>(6.2);
  const [elevationDropM, setElevationDropM] = useState<number | ''>(350);

  const [slopePercent, setSlopePercent] = useState<number | ''>(6.5);
  const [soilDepthCm, setSoilDepthCm] = useState<number | ''>(90);
  const [soilPh, setSoilPh] = useState<number | ''>(6.5);
  const [drainageClass, setDrainageClass] = useState<string>("poorly");

  const [ecIrrigation, setEcIrrigation] = useState<number | ''>(1.2);
  const [ecThreshold, setEcThreshold] = useState<number | ''>(1.7);
  const [targetLeachingEfficiency, setTargetLeachingEfficiency] = useState<number | ''>(0.85);

  const regionData: Record<string, { name: string; psh: number; temp: number; hum: number; solar: number }> = {
    luzon: { name: "Central & Northern Luzon", psh: 5.2, temp: 31.5, hum: 70, solar: 21.0 },
    southern_luzon: { name: "Southern Luzon (CALABARZON/Bicol)", psh: 4.9, temp: 30.2, hum: 76, solar: 20.1 },
    mimaropa: { name: "MIMAROPA Region (Region IV-B)", psh: 5.0, temp: 30.5, hum: 75, solar: 20.3 },
    visayas_western: { name: "Western Visayas (Region VI - Panay/Negros)", psh: 5.1, temp: 30.0, hum: 75, solar: 20.5 },
    visayas_central: { name: "Central Visayas (Region VII - Cebu/Bohol)", psh: 4.9, temp: 29.8, hum: 77, solar: 19.8 },
    visayas_eastern: { name: "Eastern Visayas (Region VIII - Samar/Leyte)", psh: 4.6, temp: 28.8, hum: 82, solar: 18.6 },
    mindanao_north: { name: "Northern Mindanao (Region X)", psh: 5.1, temp: 29.8, hum: 74, solar: 20.4 },
    mindanao_davao: { name: "Davao Region (Region XI)", psh: 4.9, temp: 30.8, hum: 77, solar: 19.9 },
    mindanao_soccsksargen: { name: "SOCCSKSARGEN (Region XII)", psh: 5.3, temp: 31.2, hum: 72, solar: 21.2 },
    mindanao_zamboanga: { name: "Zamboanga Peninsula (Region IX)", psh: 5.0, temp: 30.2, hum: 76, solar: 20.0 },
    mindanao_barmm_caraga: { name: "BARMM & Caraga Regions", psh: 4.7, temp: 29.0, hum: 80, solar: 19.2 }
  };

  const cropData: Record<string, { name: string; kc: Record<string, number> }> = {
    lowland_rice: { name: "Lowland Rice / Paddy (Wetland)", kc: { init: 1.05, mid: 1.20, late: 0.90 } },
    upland_rice: { name: "Upland Rice (Dryland / Aerobic)", kc: { init: 0.45, mid: 1.05, late: 0.70 } },
    sugarcane: { name: "Sugarcane (Commercial)", kc: { init: 0.40, mid: 1.25, late: 0.75 } },
    corn: { name: "Yellow Corn (Maize)", kc: { init: 0.40, mid: 1.15, late: 0.60 } },
    onion: { name: "Red Onion (Granex/Lasso)", kc: { init: 0.70, mid: 1.05, late: 0.75 } },
    tomato: { name: "Processing Tomato", kc: { init: 0.60, mid: 1.15, late: 0.80 } }
  };

  const soilData: Record<string, { name: string; awhc: number }> = {
    sand: { name: "Sand (Low Retention)", awhc: 60 },
    sandy_loam: { name: "Sandy Loam", awhc: 110 },
    clay_loam: { name: "Clay Loam (Balanced)", awhc: 140 },
    heavy_clay: { name: "Heavy Clay (Paddy Sealed)", awhc: 180 }
  };

  const irrigationMethodData: Record<string, { name: string; efficiency: number }> = {
    surface: { name: "Surface Flooding (45% Eff)", efficiency: 0.45 },
    furrow: { name: "Furrow Irrigation (60% Eff)", efficiency: 0.60 },
    sprinkler: { name: "Sprinkler Irrigation (75% Eff)", efficiency: 0.75 },
    micro: { name: "Micro-Irrigation (85% Eff)", efficiency: 0.85 },
    drip: { name: "Drip Irrigation (90% Eff)", efficiency: 0.90 }
  };

  // Synchronize local states whenever global LocationContext changes
  useEffect(() => {
    setGisLat(location.lat);
    setGisLng(location.lng);
    setExtractedElevation(location.elevation);
    setTemp(location.tempMax);
    setHumidity(location.humidity);
    setWindSpeed(location.windSpeed);
    setSolarRad(location.solarRad);
    setCurveNumber(location.defaultCurveNumber);

    if (location.region.includes('MIMAROPA')) setSelectedRegion('mimaropa');
    else if (location.region.includes('Central & Northern Luzon')) setSelectedRegion('luzon');
    else if (location.region.includes('CALABARZON') || location.region.includes('Bicol')) setSelectedRegion('southern_luzon');
    else if (location.region.includes('Visayas')) setSelectedRegion('visayas_central');
    else setSelectedRegion('mindanao_davao');
  }, [location]);

  const handleRegionChange = (regionKey: string) => {
    setSelectedRegion(regionKey);
    const preset = regionData[regionKey];
    if (preset) {
      setPeakSunHours(preset.psh);
      setTemp(preset.temp);
      setHumidity(preset.hum);
      setSolarRad(preset.solar);
    }
  };

  const handleGISLocationSelect = (lat: number, lng: number, slope: number, elevation: number) => {
    setSlopePercent(slope);
    setStaticHead(Math.min(elevation, 50));
    updateFromCoords(lat, lng);

    let matchedRegion = "luzon";
    if (lat >= 14.5) {
      matchedRegion = "luzon";
    } else if (lat >= 13.0 && lat < 14.5) {
      matchedRegion = "southern_luzon";
    } else if (lat >= 9.0 && lat < 13.5 && lng < 122.0) {
      matchedRegion = "mimaropa";
    } else if (lat >= 9.0 && lat < 11.5) {
      matchedRegion = "visayas_central";
    } else {
      matchedRegion = "mindanao_davao";
    }

    setSelectedRegion(matchedRegion);
    const preset = regionData[matchedRegion];
    if (preset) {
      setPeakSunHours(preset.psh);
      setTemp(preset.temp);
      setHumidity(preset.hum);
      setSolarRad(preset.solar);
    }
  };

  const numTemp = typeof temp === 'number' ? temp : 0;
  const numSolar = typeof solarRad === 'number' ? solarRad : 0;
  const numFlow = typeof flowRateLps === 'number' ? flowRateLps : 0;
  const numHead = typeof staticHead === 'number' ? staticHead : 0;
  const numLen = typeof pipeLength === 'number' ? pipeLength : 0;
  const numDiam = typeof pipeDiameterMm === 'number' ? pipeDiameterMm : 1;
  const numEff = typeof pumpEfficiency === 'number' ? pumpEfficiency : 0.5;
  const numMinorPct = typeof minorLossPercent === 'number' ? minorLossPercent : 0;
  const numOpPress = typeof operatingPressure === 'number' ? operatingPressure : 0;
  const numPSH = typeof peakSunHours === 'number' && peakSunHours > 0 ? peakSunHours : 5;
  const numSafety = typeof safetyFactor === 'number' ? safetyFactor : 1.25;
  const numDieselPrice = typeof dieselPricePHP === 'number' ? dieselPricePHP : 60;
  const numOpDays = typeof annualOpDays === 'number' ? annualOpDays : 240;

  const activeKc = cropData[selectedCrop]?.kc[growthStage] || 1.20;
  const activeAwhc = soilData[soilType]?.awhc || 140;
  const activeMethodEfficiency = irrigationMethodData[irrigationMethod]?.efficiency || 0.85;

  const baseEt0 = numTemp * 0.23 + numSolar * 0.1;

  const ecIw = typeof ecIrrigation === 'number' ? ecIrrigation : 0;
  const ecT = typeof ecThreshold === 'number' ? ecThreshold : 1.5;
  const rawLR = (ecIw / (5 * ecT - ecIw)) * 100;
  const safeLR = rawLR > 0 ? rawLR : 5.0;
  const leachingMultiplier = 1 + (safeLR / 100);

  const netCropDemand = baseEt0 * activeKc * leachingMultiplier;
  const standingWaterAllowance = selectedCrop === 'lowland_rice' ? 3.0 : 0.0;
  const grossCropDemand = (netCropDemand + standingWaterAllowance) / activeMethodEfficiency;
  const cropDemandFormatted = grossCropDemand.toFixed(2);

  const numSlope = typeof slopePercent === 'number' ? slopePercent : 0;
  const isHighSlope = numSlope > 8;

  const wArea = typeof catchmentAreaSqKm === 'number' ? catchmentAreaSqKm : 0;
  const wRain = typeof rainfallMm === 'number' ? rainfallMm : 0;
  const wCn = typeof curveNumber === 'number' ? curveNumber : 78;
  const sRet = (25400 / wCn) - 254;
  const initAbs = 0.2 * sRet;
  const effRain = wRain > initAbs ? Math.pow(wRain - initAbs, 2) / (wRain + 0.8 * sRet) : 0;
  const annualRunoffM3 = wArea * 1000000 * (effRain / 1000);
  const dailyStreamflowLps = (annualRunoffM3 / 365) / 86400 * 1000;
  const isFlowExceedingYield = numFlow > dailyStreamflowLps && dailyStreamflowLps > 0;

  const frictionLossNum = (numFlow * numLen) / (numDiam * 100);
  const minorLossesNum = frictionLossNum * (numMinorPct / 100);
  const totalHeadNum = numHead + frictionLossNum + minorLossesNum + numOpPress;

  const motorPowerKw = (numFlow * totalHeadNum * 9.81) / (10 * numEff * 1000);
  const requiredPvKw = motorPowerKw * numSafety;
  const recommendedPanelCount = Math.ceil((requiredPvKw * 1000) / panelWattage);

  const totalPvWatts = recommendedPanelCount * panelWattage;
  const recommendedSccAmps = Math.ceil((totalPvWatts / systemVoltage) * 1.25);
  const recommendedInverterKw = Math.max(motorPowerKw * 1.5, requiredPvKw).toFixed(2);

  const dailyEnergyWattHours = motorPowerKw * 1000 * numPSH;
  const requiredBatteryAh = (dailyEnergyWattHours * batteryAutonomyRatio) / (systemVoltage * 0.8);
  const battery100AhUnits = Math.ceil(requiredBatteryAh / 100);

  const dailyWaterVolumeM3 = numFlow * 3600 * numPSH / 1000;
  const dailyDieselLitres = (motorPowerKw * numPSH) * 0.35;
  const annualSavingsPHP = dailyDieselLitres * numOpDays * numDieselPrice;
  const annualCo2Kg = dailyDieselLitres * numOpDays * 2.68;

  const themeColors = {
    emerald: { primary: 'bg-emerald-600', text: 'text-emerald-400', border: 'border-emerald-500/20', badge: 'bg-emerald-500/10 text-emerald-400' },
    sky: { primary: 'bg-sky-600', text: 'text-sky-400', border: 'border-sky-500/20', badge: 'bg-sky-500/10 text-sky-400' },
    purple: { primary: 'bg-purple-600', text: 'text-purple-400', border: 'border-purple-500/20', badge: 'bg-purple-500/10 text-purple-400' },
    amber: { primary: 'bg-amber-600', text: 'text-amber-400', border: 'border-amber-500/20', badge: 'bg-amber-500/10 text-amber-400' }
  };

  const activeTheme = themeColors[themeAccent];

  const t = {
    container: isDarkMode ? "min-h-screen bg-slate-950 text-slate-100 p-6" : "min-h-screen bg-slate-50 text-slate-900 p-6",
    card: isDarkMode ? "bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-xl backdrop-blur-md" : "bg-white border border-slate-200 rounded-xl p-5 shadow-sm",
    input: isDarkMode ? "bg-slate-950/80 border-slate-800 text-slate-100 placeholder-slate-600 focus:border-emerald-500" : "bg-white border-slate-300 text-slate-900 focus:border-blue-500",
    select: isDarkMode ? "bg-slate-950/80 border border-slate-800 text-slate-100 rounded-lg px-3 py-2 text-xs focus:outline-none" : "bg-white border border-slate-300 text-slate-900 rounded-lg px-3 py-2 text-xs focus:outline-none",
    label: isDarkMode ? "text-xs font-medium text-slate-400 mb-1 block" : "text-xs font-medium text-slate-600 mb-1 block",
    header: isDarkMode ? "text-lg font-semibold text-slate-100 flex items-center gap-2 mb-4" : "text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4",
    navBar: isDarkMode ? "bg-slate-900/40 border border-slate-800/80 px-4 py-3 rounded-lg gap-3" : "bg-white border border-slate-200 px-4 py-3 rounded-lg gap-3 shadow-xs"
  };

  const handleExportCSV = () => {
    const csvRows = [
      ["Parameter", "Value", "Unit"],
      ["Region Preset", regionData[selectedRegion]?.name || location.name, ""],
      ["Irrigation Method", irrigationMethodData[irrigationMethod].name, `Efficiency: ${activeMethodEfficiency * 100}%`],
      ["Temperature", numTemp, "°C"],
      ["Solar Radiation", numSolar, "MJ/m²/day"],
      ["Target Crop", cropData[selectedCrop].name, ""],
      ["Phenological Stage", growthStage, `Kc: ${activeKc}`],
      ["Soil Profile", soilData[soilType].name, `AWHC: ${activeAwhc} mm/m`],
      ["Flow Rate", numFlow, "L/s"],
      ["Static Lift", numHead, "m"],
      ["Pipe Length", numLen, "m"],
      ["Pipe Diameter", numDiam, "mm"],
      ["Minor Loss", numMinorPct, "%"],
      ["Operating Pressure", numOpPress, "m"],
      ["Pump Efficiency", numEff, ""],
      ["Peak Sun Hours", numPSH, "hours"],
      ["Solar Derate Factor", numSafety, ""],
      ["Panel Spec", `${panelWattage} W`, ""],
      ["Total Panel Count", recommendedPanelCount, "units"],
      ["Total PV Array Capacity", `${(totalPvWatts / 1000).toFixed(2)} kWp`, ""],
      ["System DC Voltage", `${systemVoltage} V`, "Bus"],
      ["Battery Autonomy Selection", `${batteryAutonomyRatio * 100}% Daily Energy`, ""],
      ["Recommended MPPT SCC", `${recommendedSccAmps} A`, `@ ${systemVoltage}V DC`],
      ["Recommended Solar Inverter", `${recommendedInverterKw} kW`, "VFD / Pure Sine"],
      ["LiFePO4 Battery Bank", `${battery100AhUnits} units (100Ah each)`, `@ ${systemVoltage}V nominal (${battery100AhUnits * 100} Ah total)`],
      ["Gross Crop Water Demand", cropDemandFormatted, "mm/day"],
      ["Total Dynamic Head (TDH)", totalHeadNum.toFixed(2), "m"],
      ["Daily Pumping Yield", dailyWaterVolumeM3.toFixed(1), "m³/day"],
      ["Annual Fuel Savings", Math.round(annualSavingsPHP), "PHP"],
      ["Annual CO2 Offset", (annualCo2Kg / 1000).toFixed(2), "tonnes"]
    ];

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `AgriIntel_Report_${selectedRegion}_${selectedCrop}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={t.container}>
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Top Navigation Bar */}
        <div className={`flex flex-col xl:flex-row justify-between items-center ${t.navBar} print:hidden`}>
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`text-xs ${activeTheme.badge} border px-2.5 py-1 rounded-full font-medium`}>
              AgriIntel Core Engine
            </span>

            {/* Theme Accent & Light/Dark Mode Switcher */}
            <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-lg border border-slate-700 text-xs">
              <span className="text-slate-400 font-medium px-1">Theme:</span>
              <button onClick={() => setThemeAccent('emerald')} className={`w-4 h-4 rounded-full bg-emerald-500 transition-transform ${themeAccent === 'emerald' ? 'scale-125 ring-2 ring-white' : 'opacity-70'}`} title="Emerald Green" />
              <button onClick={() => setThemeAccent('sky')} className={`w-4 h-4 rounded-full bg-sky-500 transition-transform ${themeAccent === 'sky' ? 'scale-125 ring-2 ring-white' : 'opacity-70'}`} title="Sky Blue" />
              <button onClick={() => setThemeAccent('purple')} className={`w-4 h-4 rounded-full bg-purple-500 transition-transform ${themeAccent === 'purple' ? 'scale-125 ring-2 ring-white' : 'opacity-70'}`} title="Purple" />
              <button onClick={() => setThemeAccent('amber')} className={`w-4 h-4 rounded-full bg-amber-500 transition-transform ${themeAccent === 'amber' ? 'scale-125 ring-2 ring-white' : 'opacity-70'}`} title="Amber" />

              <div className="h-4 w-px bg-slate-700 mx-1" />

              <button
                onClick={() => setIsDarkMode(true)}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${isDarkMode ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                🌙 Dark
              </button>
              <button
                onClick={() => setIsDarkMode(false)}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${!isDarkMode ? 'bg-slate-200 text-slate-900' : 'text-slate-400 hover:text-white'}`}
              >
                ☀️ Light
              </button>
            </div>

            <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 flex-wrap">
              <button
                onClick={() => setActiveTab('irrigation')}
                className={`text-xs px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
                  activeTab === 'irrigation' ? `${activeTheme.primary} text-white shadow` : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                🌱 SPIS Irrigation
              </button>
              <button
                onClick={() => setActiveTab('gis')}
                className={`text-xs px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
                  activeTab === 'gis' ? `${activeTheme.primary} text-white shadow` : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                🗺️ GIS Spatial & DEM
              </button>
              <button
                onClick={() => setActiveTab('weather')}
                className={`text-xs px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
                  activeTab === 'weather' ? `${activeTheme.primary} text-white shadow` : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                🌦️ Weather & Climate
              </button>
              <button
                onClick={() => setActiveTab('typhoon')}
                className={`text-xs px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
                  activeTab === 'typhoon' ? `${activeTheme.primary} text-white shadow` : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                🌀 PAGASA Typhoon & PAR
              </button>
              <button
                onClick={() => setActiveTab('geohazard')}
                className={`text-xs px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
                  activeTab === 'geohazard' ? `${activeTheme.primary} text-white shadow` : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                🌋 PHIVOLCS Geohazard & Faults
              </button>
              <button
                onClick={() => setActiveTab('watershed')}
                className={`text-xs px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
                  activeTab === 'watershed' ? `${activeTheme.primary} text-white shadow` : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                ⛰️ Watershed (NRCS CN)
              </button>
              <button
                onClick={() => setActiveTab('suitability')}
                className={`text-xs px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
                  activeTab === 'suitability' ? `${activeTheme.primary} text-white shadow` : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                📐 Land Suitability
              </button>
              <button
                onClick={() => setActiveTab('salinity')}
                className={`text-xs px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
                  activeTab === 'salinity' ? `${activeTheme.primary} text-white shadow` : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                🧂 Soil Salinity & Leaching
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {activeTab === 'irrigation' && (
              <button
                onClick={handleExportCSV}
                className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer print:hidden flex items-center gap-1.5"
              >
                📥 Export CSV
              </button>
            )}
            <button
              onClick={() => window.print()}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer print:hidden"
            >
              🖨️ Print / Executive Dossier
            </button>
            <div className={`text-sm font-semibold tracking-wider ${activeTheme.text}`}>
              AgriIntel
            </div>
          </div>
        </div>

        {/* Cross-Module Alerts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:hidden">
          {isHighSlope && (
            <div className="bg-amber-950/40 border border-amber-800/60 p-3 rounded-xl flex items-center gap-3 text-xs text-amber-300">
              <span>⚠️</span>
              <div>
                <strong className="font-semibold">Land Suitability Auto-Routing:</strong> High slope detected ({numSlope}% &gt; 8%). Surface/furrow irrigation flagged; recommended application method: <strong className="text-white">Drip / Micro-Sprinkler Emitters</strong>.
              </div>
            </div>
          )}
          {isFlowExceedingYield && (
            <div className="bg-rose-950/40 border border-rose-800/60 p-3 rounded-xl flex items-center gap-3 text-xs text-rose-300">
              <span>⚡</span>
              <div>
                <strong className="font-semibold">Watershed Streamflow Alert:</strong> Pump flow rate ({numFlow} L/s) exceeds estimated daily catchment yield ({dailyStreamflowLps.toFixed(1)} L/s). Consider adding a storage reservoir.
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Tab Views */}
        {activeTab === 'gis' ? (
          <GISMapModule
            lat={gisLat}
            lng={gisLng}
            extractedSlope={typeof slopePercent === 'number' ? slopePercent : 6.5}
            extractedElevation={extractedElevation}
            onLocationSelect={handleGISLocationSelect}
          />
        ) : activeTab === 'weather' ? (
          <WeatherClimateModule selectedRegion={selectedRegion} />
        ) : activeTab === 'typhoon' ? (
          <TyphoonTrackerModule selectedRegion={selectedRegion} />
        ) : activeTab === 'geohazard' ? (
          <GeohazardFaultModule />
        ) : activeTab === 'watershed' ? (
          <WatershedModule
            catchmentAreaSqKm={catchmentAreaSqKm} setCatchmentAreaSqKm={setCatchmentAreaSqKm}
            rainfallMm={rainfallMm} setRainfallMm={setRainfallMm}
            curveNumber={curveNumber} setCurveNumber={setCurveNumber}
            flowLengthKm={flowLengthKm} setFlowLengthKm={setFlowLengthKm}
            elevationDropM={elevationDropM} setElevationDropM={setElevationDropM}
          />
        ) : activeTab === 'suitability' ? (
          <LandSuitabilityModule
            selectedCrop={selectedCrop} setSelectedCrop={setSelectedCrop}
            slopePercent={slopePercent} setSlopePercent={setSlopePercent}
            soilDepthCm={soilDepthCm} setSoilDepthCm={setSoilDepthCm}
            soilPh={soilPh} setSoilPh={setSoilPh}
            drainageClass={drainageClass} setDrainageClass={setDrainageClass}
          />
        ) : activeTab === 'salinity' ? (
          <SoilSalinityModule
            ecIrrigation={ecIrrigation} setEcIrrigation={setEcIrrigation}
            ecThreshold={ecThreshold} setEcThreshold={setEcThreshold}
            targetLeachingEfficiency={targetLeachingEfficiency} setTargetLeachingEfficiency={setTargetLeachingEfficiency}
            safeLR={safeLR}
          />
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 print:grid-cols-2">

              <div className={t.card}>
                <h2 className={t.header}>🌱 Regional Climate & Crops</h2>
                <div className="space-y-3">
                  <div>
                    <label className={t.label}>ACTIVE SITE & REGION</label>
                    <div className="text-xs font-semibold text-emerald-400 bg-slate-950 p-2 rounded-lg border border-slate-800 truncate">
                      {location.name}
                    </div>
                  </div>

                  <div>
                    <label className={t.label}>TARGET CROP PROFILE</label>
                    <select value={selectedCrop} onChange={e => setSelectedCrop(e.target.value)} className={`${t.select} w-full truncate`}>
                      <option value="lowland_rice">Lowland Rice / Paddy (Wetland)</option>
                      <option value="upland_rice">Upland Rice (Dryland / Aerobic)</option>
                      <option value="sugarcane">Sugarcane (Commercial)</option>
                      <option value="corn">Yellow Corn (Maize)</option>
                      <option value="onion">Red Onion (Granex/Lasso)</option>
                      <option value="tomato">Processing Tomato</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className={t.label}>TEMP (°C)</label>
                      <input type="number" value={temp} onChange={e => setTemp(e.target.value === '' ? '' : Number(e.target.value))} className={`w-full border rounded-lg px-3 py-2 text-xs focus:outline-none ${t.input}`} />
                    </div>
                    <div>
                      <label className={t.label}>SOLAR (MJ)</label>
                      <input type="number" value={solarRad} onChange={e => setSolarRad(e.target.value === '' ? '' : Number(e.target.value))} className={`w-full border rounded-lg px-3 py-2 text-xs focus:outline-none ${t.input}`} />
                    </div>
                  </div>

                  <div>
                    <label className={t.label}>PHENOLOGICAL STAGE (Kc)</label>
                    <select value={growthStage} onChange={e => setGrowthStage(e.target.value)} className={`${t.select} w-full truncate`}>
                      <option value="init">Initial Stage (Kc: {cropData[selectedCrop].kc.init})</option>
                      <option value="mid">Mid-Season Stage (Kc: {cropData[selectedCrop].kc.mid})</option>
                      <option value="late">Late-Season Stage (Kc: {cropData[selectedCrop].kc.late})</option>
                    </select>
                  </div>

                  <div>
                    <label className={t.label}>SOIL PROFILE & TEXTURE</label>
                    <select value={soilType} onChange={e => setSoilType(e.target.value)} className={`${t.select} w-full truncate`}>
                      <option value="sand">Sand (AWHC: 60 mm/m)</option>
                      <option value="sandy_loam">Sandy Loam (AWHC: 110 mm/m)</option>
                      <option value="clay_loam">Clay Loam (AWHC: 140 mm/m)</option>
                      <option value="heavy_clay">Heavy Clay (AWHC: 180 mm/m)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Hydraulics Card */}
              <div className={t.card}>
                <h2 className={t.header}>💧 Irrigation Method & Hydraulics</h2>
                <div className="space-y-3">
                  <div>
                    <label className={t.label}>APPLICATION METHOD</label>
                    <select value={irrigationMethod} onChange={e => setIrrigationMethod(e.target.value)} className={`${t.select} w-full truncate`}>
                      <option value="surface">Surface Flooding (45% Eff)</option>
                      <option value="furrow">Furrow Irrigation (60% Eff)</option>
                      <option value="sprinkler">Sprinkler Irrigation (75% Eff)</option>
                      <option value="micro">Micro-Irrigation (85% Eff)</option>
                      <option value="drip">Drip Irrigation (90% Eff)</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className={t.label}>FLOW RATE (L/s)</label>
                      <input type="number" value={flowRateLps} onChange={e => setFlowRateLps(e.target.value === '' ? '' : Number(e.target.value))} className={`w-full border rounded-lg px-3 py-2 text-xs focus:outline-none ${t.input}`} />
                    </div>
                    <div>
                      <label className={t.label}>STATIC LIFT (m)</label>
                      <input type="number" value={staticHead} onChange={e => setStaticHead(e.target.value === '' ? '' : Number(e.target.value))} className={`w-full border rounded-lg px-3 py-2 text-xs focus:outline-none ${t.input}`} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className={t.label}>PIPE LENGTH (m)</label>
                      <input type="number" value={pipeLength} onChange={e => setPipeLength(e.target.value === '' ? '' : Number(e.target.value))} className={`w-full border rounded-lg px-3 py-2 text-xs focus:outline-none ${t.input}`} />
                    </div>
                    <div>
                      <label className={t.label}>DIAMETER (mm)</label>
                      <input type="number" value={pipeDiameterMm} onChange={e => setPipeDiameterMm(e.target.value === '' ? '' : Number(e.target.value))} className={`w-full border rounded-lg px-3 py-2 text-xs focus:outline-none ${t.input}`} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className={t.label}>OPERATING PRES (m)</label>
                      <input type="number" value={operatingPressure} onChange={e => setOperatingPressure(e.target.value === '' ? '' : Number(e.target.value))} className={`w-full border rounded-lg px-3 py-2 text-xs focus:outline-none ${t.input}`} />
                    </div>
                    <div>
                      <label className={t.label}>PUMP EFF (%)</label>
                      <input type="number" value={pumpEfficiency ? pumpEfficiency * 100 : ''} onChange={e => setPumpEfficiency(e.target.value === '' ? '' : Number(e.target.value) / 100)} className={`w-full border rounded-lg px-3 py-2 text-xs focus:outline-none ${t.input}`} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Solar PV Sizing Card */}
              <div className={t.card}>
                <h2 className={t.header}>☀️ SPIS Solar PV Sizing</h2>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className={t.label}>PEAK SUN HOURS</label>
                      <input type="number" value={peakSunHours} onChange={e => setPeakSunHours(e.target.value === '' ? '' : Number(e.target.value))} className={`w-full border rounded-lg px-3 py-2 text-xs focus:outline-none ${t.input}`} />
                    </div>
                    <div>
                      <label className={t.label}>SAFETY FACTOR</label>
                      <input type="number" value={safetyFactor} onChange={e => setSafetyFactor(e.target.value === '' ? '' : Number(e.target.value))} className={`w-full border rounded-lg px-3 py-2 text-xs focus:outline-none ${t.input}`} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className={t.label}>PANEL WATTAGE</label>
                      <select value={panelWattage} onChange={e => setPanelWattage(Number(e.target.value))} className={`${t.select} w-full truncate`}>
                        <option value={300}>300W Monocrystalline</option>
                        <option value={350}>350W Monocrystalline</option>
                        <option value={400}>400W Monocrystalline</option>
                        <option value={550}>550W High-Efficiency</option>
                      </select>
                    </div>
                    <div>
                      <label className={t.label}>BUS VOLTAGE</label>
                      <select value={systemVoltage} onChange={e => setSystemVoltage(Number(e.target.value))} className={`${t.select} w-full truncate`}>
                        <option value={24}>24V DC Bus</option>
                        <option value={48}>48V DC Bus</option>
                        <option value={96}>96V DC Bus</option>
                      </select>
                    </div>
                  </div>
                  <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800 space-y-1 text-xs">
                    <div className="flex justify-between"><span className="text-slate-400">Total Solar Array:</span><strong className="text-white">{(totalPvWatts / 1000).toFixed(2)} kWp</strong></div>
                    <div className="flex justify-between"><span className="text-slate-400">Panel Units Needed:</span><strong className="text-emerald-400">{recommendedPanelCount} units ({panelWattage}W)</strong></div>
                    <div className="flex justify-between"><span className="text-slate-400">Recommended VFD:</span><strong className="text-white">{recommendedInverterKw} kW</strong></div>
                  </div>
                </div>
              </div>

              {/* Economic & Outputs Card */}
              <div className={t.card}>
                <h2 className={t.header}>📊 System Outputs & Savings</h2>
                <div className="space-y-3">
                  <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800 space-y-2 text-xs">
                    <div className="flex justify-between"><span className="text-slate-400">Gross Crop Demand:</span><strong className="text-emerald-400">{cropDemandFormatted} mm/day</strong></div>
                    <div className="flex justify-between"><span className="text-slate-400">Total Dynamic Head:</span><strong className="text-white">{totalHeadNum.toFixed(1)} m</strong></div>
                    <div className="flex justify-between"><span className="text-slate-400">Daily Pumping Yield:</span><strong className="text-white">{dailyWaterVolumeM3.toFixed(1)} m³/day</strong></div>
                    <div className="flex justify-between"><span className="text-slate-400">Annual Diesel Savings:</span><strong className="text-amber-400">₱{Math.round(annualSavingsPHP).toLocaleString()}</strong></div>
                  </div>
                  <div>
                    <label className={t.label}>DIESEL PRICE (PHP/L)</label>
                    <input type="number" value={dieselPricePHP} onChange={e => setDieselPricePHP(e.target.value === '' ? '' : Number(e.target.value))} className={`w-full border rounded-lg px-3 py-2 text-xs focus:outline-none ${t.input}`} />
                  </div>
                </div>
              </div>

            </div>
          </>
        )}

      </div>
    </div>
  );
}

export default IrrigationDashboard;
