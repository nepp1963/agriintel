// src/components/MapSampler.tsx
import React, { useState } from 'react';
import { fetchBatchElevations, getHaversineDistance } from '../utils/terrainUtils';

export const MapSampler: React.FC<{ lat: number; lng: number }> = ({ lat, lng }) => {
  const [elevation, setElevation] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Call this whenever map is clicked
  const handleMapClick = async (clickedLat: number, clickedLng: number) => {
    setLoading(true);
    const elevations = await fetchBatchElevations([{ lat: clickedLat, lng: clickedLng }]);
    setElevation(elevations[0] ?? 0);
    setLoading(false);
  };

  return (
    <div className="bg-slate-900 text-slate-100 p-3 rounded-lg flex items-center justify-between text-sm">
      <div>
        <span className="font-semibold text-emerald-400">MAP GIS LAYER & TOPOGRAPHIC ELEVATION / SLOPE SAMPLER</span>
        <div className="text-xs text-slate-400 mt-0.5">
          Active Lat: {lat.toFixed(4)}° N | Lng: {lng.toFixed(4)}° E | 
          Elevation: <strong className="text-white">{loading ? 'Loading...' : `${elevation !== null ? elevation : 20} m`}</strong>
        </div>
      </div>
    </div>
  );
};
