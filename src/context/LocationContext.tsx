import React, { createContext, useContext, useState } from 'react';
import { LocationData } from '../types/location';

const defaultLocation: LocationData = {
  name: 'Central Luzon (Pampanga)',
  region: 'Region III',
  lat: 15.0285,
  lng: 120.6817,
  elevation: 15,
  climateType: 'Type I',
  soilSeries: 'San Manuel Loam',
  hydrologicGroup: 'B',
  defaultCurveNumber: 75,
  solarRad: 21.0,
  tempMin: 24.5,
  tempMax: 32.5,
  humidity: 78,
  windSpeed: 2.1,
  cloudCoverPercent: 35,
  windDirection: 'NE (Amihan)',
};

interface LocationContextType {
  location: LocationData;
  setLocation: React.Dispatch<React.SetStateAction<LocationData>>;
  updateFromCoords: (lat: number, lng: number) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [location, setLocation] = useState<LocationData>(defaultLocation);

  const updateFromCoords = (lat: number, lng: number) => {
    let regionName = 'Central & Northern Luzon';
    let climateType: 'Type I' | 'Type II' | 'Type III' | 'Type IV' = 'Type I';
    let soilSeries = 'San Manuel Loam';
    let hydrologicGroup: 'A' | 'B' | 'C' | 'D' = 'B';
    let defaultCurveNumber = 75;
    let tempMax = 32.5;
    let tempMin = 24.5;
    let solarRad = 21.0;
    let cloudCoverPercent = 35;
    let windDirection = 'NE (Amihan)';

    // Geographic Bounding Logic
    if (lat >= 14.5) {
      // Central & Northern Luzon
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
      // Southern Luzon / CALABARZON
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
    } else if (lat >= 11.5 && lat < 14.5 && lng > 122.0) {
      // Bicol Region
      regionName = 'Bicol Region';
      climateType = 'Type II';
      soilSeries = 'Guimbal Clay';
      hydrologicGroup = 'D';
      defaultCurveNumber = 88;
      tempMax = 31.0;
      tempMin = 24.0;
      solarRad = 18.5;
      cloudCoverPercent = 58;
      windDirection = 'E (Pacific Trade Winds)';
    } else if (lat >= 9.0 && lat < 13.5 && lng < 122.0) {
      // MIMAROPA (Mindoro, Marinduque, Romblon, Palawan)
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
    } else if (lat >= 9.0 && lat < 11.5) {
      // Visayas
      regionName = 'Central & Eastern Visayas';
      climateType = 'Type III';
      soilSeries = 'Mandaue Silt Loam';
      hydrologicGroup = 'C';
      defaultCurveNumber = 82;
      tempMax = 31.0;
      tempMin = 24.5;
      solarRad = 19.8;
      cloudCoverPercent = 50;
      windDirection = 'ENE (Pacific Monsoon)';
    } else {
      // Mindanao
      regionName = 'Davao & Mindanao Region';
      climateType = 'Type IV';
      soilSeries = 'Bukidnon Clay Loam';
      hydrologicGroup = 'C';
      defaultCurveNumber = 83;
      tempMax = 31.8;
      tempMin = 24.2;
      solarRad = 19.9;
      cloudCoverPercent = 45;
      windDirection = 'E/SE (Intertropical Convergence)';
    }

    setLocation({
      name: `${regionName} (${lat.toFixed(3)}°, ${lng.toFixed(3)}°)`,
      region: regionName,
      lat,
      lng,
      elevation: Math.max(5, Math.round((lat - 5) * 4)),
      climateType,
      soilSeries,
      hydrologicGroup,
      defaultCurveNumber,
      solarRad,
      tempMin,
      tempMax,
      humidity: 78,
      windSpeed: 2.0,
      cloudCoverPercent,
      windDirection,
    });
  };

  return (
    <LocationContext.Provider value={{ location, setLocation, updateFromCoords }}>
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
