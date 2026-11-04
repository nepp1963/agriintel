import React from 'react';

interface WeatherClimateModuleProps {
  selectedRegion: string;
}

export function WeatherClimateModule({ selectedRegion }: WeatherClimateModuleProps) {
  const weatherRecords: Record<string, { name: string; rainfall: string; frequency: string; probability: string; strongestTyphoon: string; description: string }> = {
    luzon: {
      name: "Central & Northern Luzon",
      rainfall: "2,500 – 3,500 mm/yr",
      frequency: "Distinct Wet (May–Oct) & Dry (Nov–Apr) seasons",
      probability: "Very High (Primary Typhoon Corridor)",
      strongestTyphoon: "Typhoon Lawin (Haima, 2016) / Typhoon Ompong (Mangkhut, 2018)",
      description: "Subject to severe monsoonal downpours and major landfalling category 4-5 typhoons originating from the Pacific."
    },
    southern_luzon: {
      name: "Southern Luzon (CALABARZON/Bicol)",
      rainfall: "3,000 – 4,000 mm/yr",
      frequency: "Heavy rainfall year-round, peaks September–January",
      probability: "Very High (Bicol Landfall Gateway)",
      strongestTyphoon: "Typhoon Rolly (Goni, 2020) / Typhoon Rosing (Angela, 1995)",
      description: "One of the most typhoon-prone regions in the world, frequently experiencing extreme winds and catastrophic storm surges."
    },
    mimaropa: {
      name: "MIMAROPA Region (Region IV-B)",
      rainfall: "2,200 – 2,800 mm/yr",
      frequency: "Pronounced wet season from June to October",
      probability: "Moderate-High",
      strongestTyphoon: "Typhoon Nona (Melor, 2015)",
      description: "Island provinces experience moderate typhoon frequencies with occasional intense tropical cyclone landfalls affecting Mindoro and Palawan."
    },
    visayas_western: {
      name: "Western Visayas (Region VI - Panay/Negros)",
      rainfall: "2,000 – 2,500 mm/yr",
      frequency: "Wet season from May to January",
      probability: "Moderate-High",
      strongestTyphoon: "Typhoon Yolanda (Haiyan, 2013)",
      description: "Vulnerable to powerful late-season typhoons crossing the central Philippine archipelago from the Pacific basin."
    },
    visayas_central: {
      name: "Central Visayas (Region VII - Cebu/Bohol)",
      rainfall: "1,600 – 2,200 mm/yr",
      frequency: "Relatively short dry season; rainfall spread across months",
      probability: "Moderate",
      strongestTyphoon: "Typhoon Odette (Rai, 2021)",
      description: "Historically lower frequency than Eastern Visayas, but vulnerable to rapid-intensification super typhoons moving westward."
    },
    visayas_eastern: {
      name: "Eastern Visayas (Region VIII - Samar/Leyte)",
      rainfall: "3,000 – 4,500 mm/yr",
      frequency: "No distinct dry season; heavy rainfall throughout the year",
      probability: "Extreme (Primary Eastern Landfall Zone)",
      strongestTyphoon: "Typhoon Yolanda (Haiyan, 2013)",
      description: "Acts as the frontline barrier for Pacific tropical cyclones entering the Philippine Area of Responsibility."
    },
    mindanao_north: {
      name: "Northern Mindanao (Region X)",
      rainfall: "1,500 – 2,200 mm/yr",
      frequency: "Uniformly distributed rainfall with short dry periods",
      probability: "Low-Moderate",
      strongestTyphoon: "Tropical Storm Sendong (Washi, 2011)",
      description: "Historically considered outside the primary typhoon belt, though vulnerable to torrential flash flood-inducing storms."
    },
    mindanao_davao: {
      name: "Davao Region (Region XI)",
      rainfall: "1,800 – 2,500 mm/yr",
      frequency: "Rainfall evenly distributed year-round with no pronounced dry season",
      probability: "Low (Southern Outlier)",
      strongestTyphoon: "Typhoon Pablo (Bopha, 2012)",
      description: "Rarely struck by typhoons, but highly destructive when rare southern category 5 storms make direct landfall."
    },
    mindanao_soccsksargen: {
      name: "SOCCSKSARGEN (Region XII)",
      rainfall: "1,500 – 2,000 mm/yr",
      frequency: "Short dry season (1–3 months); moderate rainfall",
      probability: "Very Low",
      strongestTyphoon: "Tropical Storm Vinta (Tembin, 2017)",
      description: "Extremely rare direct typhoon landfalls; climate is generally safe from intense cyclonic winds."
    },
    mindanao_zamboanga: {
      name: "Zamboanga Peninsula (Region IX)",
      rainfall: "1,500 – 2,200 mm/yr",
      frequency: "Relatively wet year-round with brief dry intervals",
      probability: "Very Low",
      strongestTyphoon: "Tropical Storm Paeng (Nalgae, 2022)",
      description: "Outside the typhoon belt, predominantly affected by intertropical convergence zones (ITCZ) rather than landfalling typhoons."
    },
    mindanao_barmm_caraga: {
      name: "BARMM & Caraga Regions",
      rainfall: "2,500 – 4,000 mm/yr",
      frequency: "Heavy, continuous rainfall with minimal dry months",
      probability: "Moderate (Caraga Corridor)",
      strongestTyphoon: "Typhoon Odette (Rai, 2021) / Typhoon Pablo (Bopha, 2012)",
      description: "Caraga experiences higher typhoon exposure along northeastern Mindanao, while BARMM is largely sheltered."
    }
  };

  const currentRecord = weatherRecords[selectedRegion] || weatherRecords['luzon'];

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-xl backdrop-blur-md space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            🌦️ Historical Weather, Rainfall & Typhoon Risk Profile
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Climatological records, annual historical rainfall frequency, typhoon probability, and peak historical storm impacts for the selected region.
          </p>
        </div>
        <span className="text-xs bg-sky-950/80 border border-sky-800 text-sky-400 px-3 py-1 rounded-full font-medium">
          Climate Database Active
        </span>
      </div>

      {/* Featured Active Region Card */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 border-b border-slate-800 pb-3">
          <div>
            <span className="text-[10px] text-sky-400 font-semibold uppercase tracking-wider">Currently Selected Region Profile</span>
            <h3 className="text-xl font-bold text-slate-100 mt-0.5">{currentRecord.name}</h3>
          </div>
          <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 rounded-full font-medium">
            Typhoon Risk: {currentRecord.probability}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900/80 p-4 rounded-lg border border-slate-800">
            <span className="text-xs text-slate-400 block font-medium">ANNUAL HISTORICAL RAINFALL</span>
            <div className="text-lg font-bold text-emerald-400 mt-1">{currentRecord.rainfall}</div>
            <span className="text-[11px] text-slate-500 mt-1 block">{currentRecord.frequency}</span>
          </div>

          <div className="bg-slate-900/80 p-4 rounded-lg border border-slate-800">
            <span className="text-xs text-slate-400 block font-medium">STRONGEST RECORDED TYPHOON</span>
            <div className="text-sm font-bold text-rose-400 mt-1">{currentRecord.strongestTyphoon}</div>
            <span className="text-[11px] text-slate-500 mt-1 block">Peak historical intensity & impact marker</span>
          </div>

          <div className="bg-slate-900/80 p-4 rounded-lg border border-slate-800">
            <span className="text-xs text-slate-400 block font-medium">CLIMATOLOGICAL SUMMARY</span>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">{currentRecord.description}</p>
          </div>
        </div>
      </div>

      {/* Overview Table of All Regions */}
      <div>
        <h4 className="text-sm font-semibold text-slate-200 mb-3">📋 Complete Regional Climate & Cyclone Index Matrix</h4>
        <div className="overflow-x-auto border border-slate-800 rounded-lg">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3 font-medium">Region Preset</th>
                <th className="p-3 font-medium">Annual Rainfall</th>
                <th className="p-3 font-medium">Typhoon Probability</th>
                <th className="p-3 font-medium">Strongest Recorded Typhoon</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-900/40">
              {Object.entries(weatherRecords).map(([key, rec]) => (
                <tr key={key} className={key === selectedRegion ? 'bg-sky-950/20 font-medium' : 'hover:bg-slate-900/20'}>
                  <td className="p-3 text-slate-200">{rec.name}</td>
                  <td className="p-3 text-emerald-400">{rec.rainfall}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      rec.probability.includes('Extreme') || rec.probability.includes('Very High') ? 'bg-rose-950/60 text-rose-300 border border-rose-800/50' :
                      rec.probability.includes('Moderate') ? 'bg-amber-950/60 text-amber-300 border border-amber-800/50' :
                      'bg-emerald-950/60 text-emerald-300 border border-emerald-800/50'
                    }`}>
                      {rec.probability}
                    </span>
                  </td>
                  <td className="p-3 text-slate-300">{rec.strongestTyphoon}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
