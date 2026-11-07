import React, { createContext, useContext, useState } from 'react';
import { LocationData } from '../types/location';

const defaultLocation: LocationData = {
  name: 'Rizal Park Monument (Kilometer Zero, Manila)',
  region: 'National Capital Region (NCR)',
  lat: 14.5831,
  lng: 120.9794,
  elevation: 5,
  climateType: 'Type I',
  soilSeries: 'Novaliches Clay Loam',
  hydrologicGroup: 'B',
  defaultCurveNumber: 75,
  solarRad: 20.5,
  tempMin: 25.0,
  tempMax: 32.0,
  humidity: 75,
  windSpeed: 2.5,
  cloudCoverPercent: 40,
  windDirection: 'NE (Amihan)',
  zoom: 13,
};

interface LocationContextType {
  location: LocationData;
  setLocation: React.Dispatch<React.SetStateAction<LocationData>>;
  updateFromCoords: (lat: number, lng: number, newZoom?: number) => void;
  setZoom: (zoom: number) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [location, setLocation] = useState<LocationData>(defaultLocation);

  const updateFromCoords = (lat: number, lng: number, newZoom?: number) => {
    let regionName = 'Southern Luzon (CALABARZON)';
    let climateType: 'Type I' | 'Type II' | 'Type III' | 'Type IV' = 'Type I';
    let soilSeries = 'Lipa Clay Loam';
    let hydrologicGroup: 'A' | 'B' | 'C' | 'D' = 'B';
    let defaultCurveNumber = 78;
    let tempMax = 31.5;
    let tempMin = 24.0;
    let solarRad = 20.1;
    let cloudCoverPercent = 42;
    let windDirection = 'ENE (Amihan Track)';

    if (lat >= 14.5 && lng < 121.1) {
      regionName = 'National Capital Region (NCR - Manila)';
      climateType = 'Type I';
      soilSeries = 'Novaliches Clay Loam';
      hydrologicGroup = 'B';
      defaultCurveNumber = 75;
      tempMax = 32.0;
      tempMin = 25.0;
      solarRad = 20.5;
      cloudCoverPercent = 40;
      windDirection = 'NE (Amihan)';
    } else if (lat >= 14.5) {
      regionName = 'Central & Northern Luzon';
      climateType = 'Type I';
      soilSeries = 'San Manuel Loam';
      hydrologicGroup = 'B';
      defaultCurveNumber = 75;
      tempMax = 32.5;
      tempMin = 24.5;
      solarRad = 21.0;
      cloudCoverPercent = 30;
      windDirection = 'NE (Amihan)';
    } else if (lat >= 13.0 && lat < 14.5) {
      regionName = 'Southern Luzon (CALABARZON)';
      climateType = 'Type I';
      soilSeries = 'Lipa Clay Loam';
      hydrologicGroup = 'B';
      defaultCurveNumber = 78;
      tempMax = 31.5;
      tempMin = 24.0;
      solarRad = 20.1;
      cloudCoverPercent = 42;
      windDirection = 'ENE (Amihan Track)';
    } else if (lat >= 9.0 && lat < 13.5 && lng < 122.0) {
      regionName = 'MIMAROPA Region';
      climateType = 'Type III';
      soilSeries = 'Annam Clay Loam';
      hydrologicGroup = 'C';
      defaultCurveNumber = 80;
      tempMax = 31.2;
      tempMin = 24.2;
      solarRad = 20.3;
      cloudCoverPercent = 40;
      windDirection = 'SW (Habagat)';
    } else {
      regionName = 'Davao & Mindanao Region';
      climateType = 'Type IV';
      soilSeries = 'Bukidnon Clay Loam';
      hydrologicGroup = 'C';
      defaultCurveNumber = 83;
      tempMax = 31.8;
      tempMin = 24.2;
      solarRad = 19.9;
      cloudCoverPercent = 45;
      windDirection = 'E/SE (Convergence)';
    }

    setLocation(prev => ({
      ...prev,
      name: `${regionName} (${lat.toFixed(4)}°, ${lng.toFixed(4)}°)`,
      region: regionName,
      lat,
      lng,
      elevation: Math.round(36),
      climateType,
      soilSeries,
      hydrologicGroup,
      defaultCurveNumber,
      solarRad,
      tempMin,
      tempMax,
      cloudCoverPercent,
      windDirection,
      zoom: newZoom !== undefined ? newZoom : prev.zoom,
    }));
  };

  const setZoom = (zoom: number) => {
    setLocation(prev => ({ ...prev, zoom }));
  };

  return (
    <LocationContext.Provider value={{ location, setLocation, updateFromCoords, setZoom }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
