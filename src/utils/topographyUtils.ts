export interface TopoAnalysis {
  minElevation: number;
  maxElevation: number;
  elevationRange: number;
  averageSlopePercent: number;
  maxSlopePercent: number;
}

export function analyzeFarmTopography(points: { lat: number; lng: number; elevation: number }[]): TopoAnalysis {
  if (!points || points.length < 2) {
    return { minElevation: 0, maxElevation: 0, elevationRange: 0, averageSlopePercent: 0, maxSlopePercent: 0 };
  }

  let minElev = Infinity;
  let maxElev = -Infinity;
  let totalSlope = 0;
  let maxSlope = 0;
  let slopeCount = 0;

  points.forEach(p => {
    if (p.elevation < minElev) minElev = p.elevation;
    if (p.elevation > maxElev) maxElev = p.elevation;
  });

  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    const elevDiff = Math.abs(p2.elevation - p1.elevation);
    const distanceMeters = haversineDistance(p1.lat, p1.lng, p2.lat, p2.lng);

    if (distanceMeters > 0) {
      const slopePercent = (elevDiff / distanceMeters) * 100;
      totalSlope += slopePercent;
      if (slopePercent > maxSlope) maxSlope = slopePercent;
      slopeCount++;
    }
  }

  return {
    minElevation: Math.round(minElev * 10) / 10,
    maxElevation: Math.round(maxElev * 10) / 10,
    elevationRange: Math.round((maxElev - minElev) * 10) / 10,
    averageSlopePercent: slopeCount > 0 ? Math.round((totalSlope / slopeCount) * 10) / 10 : 0,
    maxSlopePercent: Math.round(maxSlope * 10) / 10
  };
}

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) ** 2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}
