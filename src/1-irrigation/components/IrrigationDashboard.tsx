import React, { useState } from 'react';
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
import { Doughnut, Bar } from 'react-chartjs-2';
import { WatershedModule } from './WatershedModule';
import { LandSuitabilityModule } from './LandSuitabilityModule';
import { SoilSalinityModule } from './SoilSalinityModule';
import { GISMapModule } from './GISMapModule';
import { WeatherClimateModule } from './WeatherClimateModule';
import { TyphoonTrackerModule } from './TyphoonTrackerModule';

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
  const [activeTab, setActiveTab] = useState<'irrigation' | 'watershed' | 'suitability' | 'salinity' | 'gis' | 'weather' | 'typhoon'>('irrigation');

  // UI Customization States
  const [themeAccent, setThemeAccent] = useState<'emerald' | 'sky' | 'purple' | 'amber'>('emerald');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  // Persistent GIS Coordinates (Default: Laguna / Southern Luzon)
  const [gisLat, setGisLat] = useState<number>(14.1648);
  const [gisLng, setGisLng] = useState<number>(121.2413);
  const [extractedElevation, setExtractedElevation] = useState<number>(85);

  // Regional Presets
  const [selectedRegion, setSelectedRegion] = useState<string>("luzon");

  // Weather Parameters
  const [temp, setTemp] = useState<number | ''>(31.5);
  const [humidity, setHumidity] = useState<number | ''>(70);
  const [windSpeed, setWindSpeed] = useState<number | ''>(2.2);
  const [solarRad, setSolarRad] = useState<number | ''>(21.0);

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
  const [curveNumber, setCurveNumber] = useState<number | ''>(78);
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
    setGisLat(lat);
    setGisLng(lng);
    setExtractedElevation(elevation);
    setSlopePercent(slope);
    setStaticHead(Math.min(elevation, 50));

    let matchedRegion = "luzon";
    if (lat < 9.0) {
      if (lng < 123.5) {
        matchedRegion = "mindanao_zamboanga";
      } else if (lat < 7.0 && lng >= 124.0 && lng <= 125.5) {
        matchedRegion = "mindanao_soccsksargen";
      } else if (lng >= 125.5) {
        matchedRegion = "mindanao_davao";
      } else if (lat >= 7.8 && lng >= 124.0 && lng <= 125.5) {
        matchedRegion = "mindanao_north";
      } else {
        matchedRegion = "mindanao_barmm_caraga";
      }
    } else if (lat >= 9.0 && lat < 13.5 && lng < 121.5) {
      matchedRegion = "mimaropa";
    } else if (lat >= 9.0 && lat < 13.0) {
      if (lng < 123.0) {
        matchedRegion = "visayas_western";
      } else if (lng >= 123.0 && lng < 124.5) {
        matchedRegion = "visayas_central";
      } else {
        matchedRegion = "visayas_eastern";
      }
    } else if (lat >= 13.0 && lat <= 15.5) {
      matchedRegion = "southern_luzon";
    } else {
      matchedRegion = "luzon";
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
      ["Region Preset", regionData[selectedRegion].name, ""],
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

  const tdhDoughnutData = {
    labels: ['Static Lift (m)', 'Friction Loss (m)', 'Minor Losses (m)', 'Operating Pressure (m)'],
    datasets: [{
      data: [numHead, Number(frictionLossNum.toFixed(2)), Number(minorLossesNum.toFixed(2)), numOpPress],
      backgroundColor: ['#64748b', '#f59e0b', '#fbbf24', '#38bdf8'],
      borderColor: isDarkMode ? '#0f172a' : '#ffffff',
      borderWidth: 2,
    }],
  };

  const hourlyYieldLabels = ['8 AM', '9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM'];
  const hourlyYieldFactors = [0.3, 0.6, 0.85, 1.0, 1.0, 0.95, 0.8, 0.55, 0.25];
  const totalFactorSum = hourlyYieldFactors.reduce((a, b) => a + b, 0);
  const hourlyWaterData = hourlyYieldFactors.map(factor => Number(((dailyWaterVolumeM3 * factor) / totalFactorSum).toFixed(1)));

  const solarBarData = {
    labels: hourlyYieldLabels,
    datasets: [{
      label: 'Hourly Yield (m³)',
      data: hourlyWaterData,
      backgroundColor: themeAccent === 'emerald' ? '#10b981' : themeAccent === 'sky' ? '#0ea5e9' : themeAccent === 'purple' ? '#a855f7' : '#f59e0b',
      borderRadius: 6,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: isDarkMode ? '#94a3b8' : '#475569', font: { size: 11 } } }
    }
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

            {/* Lovable-Style Theme Accent & Light/Dark Mode Switcher */}
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
                    <label className={t.label}>REGION PRESET</label>
                    <select value={selectedRegion} onChange={e => handleRegionChange(e.target.value)} className={`${t.select} w-full truncate`}>
                      <option value="luzon">Central & Northern Luzon</option>
                      <option value="southern_luzon">Southern Luzon (CALABARZON/Bicol)</option>
                      <option value="mimaropa">MIMAROPA Region (Region IV-B)</option>
                      <option value="visayas_western">Western Visayas (Region VI - Panay/Negros)</option>
                      <option value="visayas_central">Central Visayas (Region VII - Cebu/Bohol)</option>
                      <option value="visayas_eastern">Eastern Visayas (Region VIII - Samar/Leyte)</option>
                      <option value="mindanao_north">Northern Mindanao (Region X)</option>
                      <option value="mindanao_davao">Davao Region (Region XI)</option>
                      <option value="mindanao_soccsksargen">SOCCSKSARGEN (Region XII)</option>
                      <option value="mindanao_zamboanga">Zamboanga Peninsula (Region IX)</option>
                      <option value="mindanao_barmm_caraga">BARMM & Caraga Regions</option>
                    </select>
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
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={t.label}>FLOW (L/S)</label>
                      <input type="number" value={flowRateLps} onChange={e => setFlowRateLps(e.target.value === '' ? '' : Number(e.target.value))} className={`w-full border rounded-lg px-3 py-2 text-xs focus:outline-none ${t.input}`} />
                    </div>
                    <div>
                      <label className={t.label}>STATIC LIFT (M)</label>
                      <input type="number" value={staticHead} onChange={e => setStaticHead(e.target.value === '' ? '' : Number(e.target.value))} className={`w-full border rounded-lg px-3 py-2 text-xs focus:outline-none ${t.input}`} />
                    </div>
                    <div>
                      <label className={t.label}>LENGTH (M)</label>
                      <input type="number" value={pipeLength} onChange={e => setPipeLength(e.target.value === '' ? '' : Number(e.target.value))} className={`w-full border rounded-lg px-3 py-2 text-xs focus:outline-none ${t.input}`} />
                    </div>
                    <div>
                      <label className={t.label}>DIAM (MM)</label>
                      <input type="number" value={pipeDiameterMm} onChange={e => setPipeDiameterMm(e.target.value === '' ? '' : Number(e.target.value))} className={`w-full border rounded-lg px-3 py-2 text-xs focus:outline-none ${t.input}`} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={t.label}>MINOR LOSS (%)</label>
                      <input type="number" value={minorLossPercent} onChange={e => setMinorLossPercent(e.target.value === '' ? '' : Number(e.target.value))} className={`w-full border rounded-lg px-3 py-2 text-xs focus:outline-none ${t.input}`} />
                    </div>
                    <div>
                      <label className={t.label}>OP. PRESS (M)</label>
                      <input type="number" value={operatingPressure} onChange={e => setOperatingPressure(e.target.value === '' ? '' : Number(e.target.value))} className={`w-full border rounded-lg px-3 py-2 text-xs focus:outline-none ${t.input}`} />
                    </div>
                  </div>
                </div>
              </div>

              <div className={t.card}>
                <h2 className={t.header}>☀️ Solar & BoS Sizing</h2>
                <div className="space-y-3">
                  <div>
                    <label className={t.label}>PEAK SUN HOURS (PSH)</label>
                    <input type="number" step="0.1" value={peakSunHours} onChange={e => setPeakSunHours(e.target.value === '' ? '' : Number(e.target.value))} className={`w-full border rounded-lg px-3 py-2 text-xs focus:outline-none ${t.input}`} />
                  </div>
                  <div>
                    <label className={t.label}>SOLAR PANEL SPEC (WATTAGE)</label>
                    <select value={panelWattage} onChange={e => setPanelWattage(Number(e.target.value))} className={`${t.select} w-full truncate`}>
                      <option value={250}>250W (Standard Economy)</option>
                      <option value={300}>300W (Mid-Range Residential)</option>
                      <option value={350}>350W (Standard Commercial)</option>
                      <option value={400}>400W (High-Efficiency)</option>
                      <option value={450}>450W (Utility Grade)</option>
                      <option value={550}>550W (High-Capacity Utility)</option>
                    </select>
                  </div>
                  <div>
                    <label className={t.label}>SYSTEM DC VOLTAGE</label>
                    <select value={systemVoltage} onChange={e => setSystemVoltage(Number(e.target.value))} className={`${t.select} w-full truncate`}>
                      <option value={12}>12V DC System</option>
                      <option value={24}>24V DC System</option>
                      <option value={48}>48V DC System (Standard)</option>
                    </select>
                  </div>
                  <div>
                    <label className={t.label}>BATTERY STORAGE AUTONOMY</label>
                    <select value={batteryAutonomyRatio} onChange={e => setBatteryAutonomyRatio(Number(e.target.value))} className={`${t.select} w-full truncate`}>
                      <option value={0.25}>0.25 Day Buffer (Telemetry/Controls)</option>
                      <option value={0.50}>0.50 Day Buffer (Standard Half-Day)</option>
                      <option value={1.00}>1.00 Day (Full 24-Hour Autonomy)</option>
                      <option value={2.00}>2.00 Days (Extended Rain/Cloud Backup)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className={t.card}>
                <h2 className={t.header}>💰 Economics & Savings</h2>
                <div className="space-y-3">
                  <div>
                    <label className={t.label}>FUEL / DIESEL PRICE</label>
                    <input type="number" value={dieselPricePHP} onChange={e => setDieselPricePHP(e.target.value === '' ? '' : Number(e.target.value))} className={`w-full border rounded-lg px-3 py-2 text-xs focus:outline-none ${t.input}`} />
                  </div>
                  <div>
                    <label className={t.label}>ANNUAL OP. DAYS</label>
                    <input type="number" value={annualOpDays} onChange={e => setAnnualOpDays(e.target.value === '' ? '' : Number(e.target.value))} className={`w-full border rounded-lg px-3 py-2 text-xs focus:outline-none ${t.input}`} />
                  </div>
                  <div className={`p-2.5 rounded-lg border ${isDarkMode ? 'bg-slate-950/40 border-slate-800/60' : 'bg-slate-100 border-slate-200'}`}>
                    <span className="text-[10px] text-slate-500 block font-medium">DAILY YIELD</span>
                    <div className={`text-lg font-bold ${activeTheme.text} mt-0.5`}>{dailyWaterVolumeM3.toFixed(1)} <span className="text-[10px] font-normal text-slate-400">m³/day</span></div>
                  </div>
                </div>
              </div>

            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:hidden">
              <div className={t.card}>
                <h2 className={t.header}>📈 Total Dynamic Head (TDH) Breakdown</h2>
                <div className="h-64 flex justify-center items-center">
                  <Doughnut data={tdhDoughnutData} options={chartOptions} />
                </div>
              </div>
              <div className={t.card}>
                <h2 className={t.header}>☀️ Estimated Daily Pumping Yield Curve</h2>
                <div className="h-64">
                  <Bar data={solarBarData} options={chartOptions} />
                </div>
              </div>
            </div>

            <div className={t.card}>
              <div className="flex justify-between items-center mb-4">
                <h2 className={t.header}>📊 Comprehensive Agronomic & Engineering Outputs</h2>
                <span className={`text-xs ${activeTheme.badge} border px-3 py-1 rounded-full font-medium print:hidden`}>Integrated Suite Active</span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4 mb-6">
                <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-950/60 border-slate-800/80' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-[11px] text-slate-500 block font-medium">GROSS CROP DEMAND</span>
                  <div className={`text-xl font-bold ${activeTheme.text} mt-1`}>{cropDemandFormatted} <span className="text-xs font-normal text-slate-400">mm/d</span></div>
                  <span className="text-[10px] text-slate-500 mt-1 block">{selectedCrop === 'lowland_rice' ? 'Paddy + 3mm Seepage Allowance' : 'Dryland Aerobic Regime'}</span>
                </div>
                <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-950/60 border-slate-800/80' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-[11px] text-slate-500 block font-medium">REQUIRED PV ARRAY</span>
                  <div className="text-xl font-bold text-amber-500 mt-1">{requiredPvKw.toFixed(2)} <span className="text-xs font-normal text-slate-400">kWp</span></div>
                  <span className="text-[10px] text-slate-500 mt-1 block">~{recommendedPanelCount} panels ({panelWattage}W)</span>
                </div>
                <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-950/60 border-slate-800/80' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-[11px] text-slate-500 block font-medium">MPPT CHARGE CONTROLLER</span>
                  <div className="text-xl font-bold text-sky-500 mt-1">{recommendedSccAmps} <span className="text-xs font-normal text-slate-400">Amps</span></div>
                  <span className="text-[10px] text-slate-500 mt-1 block">@ {systemVoltage}V DC Bus</span>
                </div>
                <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-950/60 border-slate-800/80' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-[11px] text-slate-500 block font-medium">PUMP INVERTER / VFD</span>
                  <div className="text-xl font-bold text-indigo-500 mt-1">{recommendedInverterKw} <span className="text-xs font-normal text-slate-400">kW</span></div>
                  <span className="text-[10px] text-slate-500 mt-1 block">Motor surge rated</span>
                </div>
                <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-950/60 border-slate-800/80' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-[11px] text-slate-500 block font-medium">LIFEPO4 BATTERY BANK</span>
                  <div className="text-xl font-bold text-teal-500 mt-1">{battery100AhUnits} <span className="text-xs font-normal text-slate-400">units (100Ah)</span></div>
                  <span className="text-[10px] text-slate-500 mt-1 block">@ {systemVoltage}V ({batteryAutonomyRatio * 100}% day)</span>
                </div>
                <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-950/60 border-slate-800/80' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-[11px] text-slate-500 block font-medium">DAILY PUMPING YIELD</span>
                  <div className={`text-xl font-bold ${activeTheme.text} mt-1`}>{dailyWaterVolumeM3.toFixed(1)} <span className="text-xs font-normal text-slate-400">m³/d</span></div>
                  <span className="text-[10px] text-slate-500 mt-1 block">At {numPSH} PSH</span>
                </div>
                <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-950/60 border-slate-800/80' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-[11px] text-slate-500 block font-medium">ANNUAL FUEL SAVINGS</span>
                  <div className={`text-xl font-bold ${activeTheme.text} mt-1`}>₱{Math.round(annualSavingsPHP).toLocaleString()}</div>
                  <span className="text-[10px] text-slate-500 mt-1 block">{(annualCo2Kg / 1000).toFixed(2)} tonnes CO₂</span>
                </div>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
