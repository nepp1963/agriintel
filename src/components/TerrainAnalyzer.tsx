// src/components/TerrainAnalyzer.tsx
import React, { useState, useRef } from 'react';
import { analyzeFieldTerrain, TerrainPoint, SlopeResult } from '../utils/terrainUtils';

interface SavedGISLocation {
  module: string;
  version: string;
  timestamp: string;
  boundaryPoints: Array<{ lat: number; lng: number }>;
}

export const TerrainAnalyzer: React.FC = () => {
  // Default sample boundary points (e.g., agricultural field perimeter)
  const [boundaryPoints, setBoundaryPoints] = useState<Array<{ lat: number; lng: number }>>([
    { lat: 14.1648, lng: 121.2413 },
    { lat: 14.1655, lng: 121.2420 },
    { lat: 14.1640, lng: 121.2435 },
    { lat: 14.1632, lng: 121.2418 },
  ]);

  const [loading, setLoading] = useState<boolean>(false);
  const [terrainPoints, setTerrainPoints] = useState<TerrainPoint[]>([]);
  const [slopeResults, setSlopeResults] = useState<SlopeResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleRunAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await analyzeFieldTerrain(boundaryPoints);
      setTerrainPoints(result.points);
      setSlopeResults(result.segments);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze terrain.');
    } finally {
      setLoading(false);
    }
  };

  // 1. Save Boundary Location / Points as JSON
  const handleSaveLocation = () => {
    const payload: SavedGISLocation = {
      module: 'AgriIntelPH_TerrainAnalyzer',
      version: '1.0',
      timestamp: new Date().toISOString(),
      boundaryPoints,
    };

    const jsonString = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    const dateTag = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `agriintel-terrain-boundary-${dateTag}.json`;
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 2. Trigger Hidden File Input
  const handleLoadButtonClick = () => {
    fileInputRef.current?.click();
  };

  // 3. Load Location / Points from JSON File
  const handleLoadLocationFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed: SavedGISLocation = JSON.parse(content);

        if (!parsed.boundaryPoints || !Array.isArray(parsed.boundaryPoints)) {
          throw new Error('Invalid terrain boundary JSON structure.');
        }

        setBoundaryPoints(parsed.boundaryPoints);
      } catch (err) {
        console.error('Failed to load terrain JSON:', err);
        alert('Invalid JSON file. Please select a valid AgriIntel terrain boundary file.');
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };

    reader.readAsText(file);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-xl shadow-md space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">AgriIntelPH Terrain & Slope Calibration</h2>
        <p className="text-slate-600 text-sm mt-1">
          Accurate elevation fetching via Open-Meteo and geodetic Haversine slope calculations.
        </p>
      </div>

      {/* Action Controls & Save/Load Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={handleRunAnalysis}
          disabled={loading}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg disabled:opacity-50 transition-colors cursor-pointer"
        >
          {loading ? 'Analyzing Terrain...' : 'Run Terrain Calibration'}
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSaveLocation}
            className="px-3 py-2 text-sm font-medium text-white bg-emerald-700 hover:bg-emerald-600 rounded-lg shadow-sm transition-colors cursor-pointer"
            title="Save current boundary points as JSON"
          >
            Save Location
          </button>

          <button
            type="button"
            onClick={handleLoadButtonClick}
            className="px-3 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg shadow-sm transition-colors cursor-pointer"
            title="Load boundary points from JSON"
          >
            Load Location
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleLoadLocationFile}
            className="hidden"
          />
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}
    </div>
  );
};

export default TerrainAnalyzer;