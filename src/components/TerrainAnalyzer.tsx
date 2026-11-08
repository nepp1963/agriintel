// src/components/TerrainAnalyzer.tsx
import React, { useState } from 'react';
import { analyzeFieldTerrain, TerrainPoint, SlopeResult } from '../utils/terrainUtils';

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

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-xl shadow-md space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">AgriIntelPH Terrain & Slope Calibration</h2>
        <p className="text-slate-600 text-sm mt-1">
          Accurate elevation fetching via Open-Meteo and geodetic Haversine slope calculations.
        </p>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={handleRunAnalysis}
          disabled={loading}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg disabled:opacity-50 transition-colors"
        >
          {loading ? 'Analyzing Terrain...' : 'Run Terrain Calibration'}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {terrainPoints.length > 0 && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-3">Calibrated Vertex Elevations</h3>
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="p-3 font-semibold text-slate-700">Vertex</th>
                    <th className="p-3 font-semibold text-slate-700">Latitude</th>
                    <th className="p-3 font-semibold text-slate-700">Longitude</th>
                    <th className="p-3 font-semibold text-slate-700">Elevation (m)</th>
                  </tr>
                </thead>
                <tbody>
                  {terrainPoints.map((pt, idx) => (
                    <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-3 font-medium text-slate-900">P{idx + 1}</td>
                      <td className="p-3 text-slate-600">{pt.lat.toFixed(5)}</td>
                      <td className="p-3 text-slate-600">{pt.lng.toFixed(5)}</td>
                      <td className="p-3 font-semibold text-emerald-600">{pt.elevation.toFixed(2)} m</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-3">Segment Slope Analysis</h3>
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="p-3 font-semibold text-slate-700">Segment</th>
                    <th className="p-3 font-semibold text-slate-700">Horizontal Distance</th>
                    <th className="p-3 font-semibold text-slate-700">Vertical Rise</th>
                    <th className="p-3 font-semibold text-slate-700">Slope (%)</th>
                    <th className="p-3 font-semibold text-slate-700">Slope (°)</th>
                  </tr>
                </thead>
                <tbody>
                  {slopeResults.map((seg, idx) => (
                    <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-3 font-medium text-slate-900">{seg.segment}</td>
                      <td className="p-3 text-slate-600">{seg.horizontalDistanceMeters} m</td>
                      <td className="p-3 text-slate-600">{seg.verticalRiseMeters} m</td>
                      <td className="p-3 font-bold text-emerald-700">{seg.slopePercent}%</td>
                      <td className="p-3 text-slate-600">{seg.slopeDegrees}°</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
