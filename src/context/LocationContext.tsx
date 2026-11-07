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
    let regionName = "Philippine Regional Zone";
    let climateType: 'Type I' | 'Type II' | 'Type III' | 'Type IV' = 'Type I';
    let soilSeries = 'Tropical Clay Loam';
    let hydrologicGroup: 'A' | 'B' | 'C' | 'D' = 'B';
    let tempMax = 31.5;
    let tempMin = 24.0;
    let solarRad = 20.1;
    let cloudCoverPercent = 42;
    let windDirection = 'Variable (Monsoon Track)';

    // 1. National Capital Region (NCR / Metro Manila)
    if (lat >= 14.45 && lat <= 14.75 && lng >= 120.90 && lng <= 121.12) {
      regionName = "National Capital Region (NCR - Manila)";
      climateType = "Type I";
      soilSeries = "Novaliches Clay Loam";
      hydrologicGroup = "C";
      tempMax = 32.5;
      tempMin = 25.0;
      solarRad = 21.2;
      cloudCoverPercent = 45;
      windDirection = "ENE (Amihan Track)";
    }
    // 2. Central Luzon (Pampanga, Tarlac, Bulacan, Nueva Ecija, Zambales, Bataan, Aurora)
    else if (lat >= 14.75 && lat <= 16.20 && lng >= 119.80 && lng <= 121.60) {
      regionName = "Central Luzon (Region III)";
      climateType = "Type I";
      soilSeries = "Pampanga Clay Loam / Alluvial";
      hydrologicGroup = "C";
      tempMax = 32.0;
      tempMin = 24.5;
      solarRad = 21.0;
      cloudCoverPercent = 40;
      windDirection = "WSW (Habagat Track)";
    }
    // 3. Southern Tagalog / CALABARZON (Batangas, Cavite, Laguna, Rizal, Quezon)
    else if (lat >= 13.50 && lat <= 14.75 && lng >= 120.50 && lng <= 122.50) {
      regionName = "Southern Luzon (CALABARZON)";
      climateType = "Type I";
      soilSeries = "Lipa Clay Loam";
      hydrologicGroup = "B";
      tempMax = 31.5;
      tempMin = 24.0;
      solarRad = 20.1;
      cloudCoverPercent = 42;
      windDirection = "ENE (Amihan Track)";
    }
    // 4. Ilocos Region & Cordillera (Region I & CAR)
    else if (lat > 16.20 && lat <= 18.60 && lng >= 119.50 && lng <= 121.80) {
      regionName = "Northern Luzon (Ilocos / CAR)";
      climateType = "Type I";
      soilSeries = "Bantay Loam / Mountain Soil";
      hydrologicGroup = "B";
      tempMax = 30.0;
      tempMin = 22.0;
      solarRad = 19.5;
      cloudCoverPercent = 38;
      windDirection = "NNE (Mountain Breeze)";
    }
    // 5. Cagayan Valley (Region II)
    else if (lat >= 16.00 && lat <= 19.00 && lng > 121.60 && lng <= 122.50) {
      regionName = "Cagayan Valley (Region II)";
      climateType = "Type III";
      soilSeries = "Cagayan Alluvial Sandy Loam";
      hydrologicGroup = "A";
      tempMax = 33.0;
      tempMin = 23.5;
      solarRad = 21.8;
      cloudCoverPercent = 35;
      windDirection = "ESE (Pacific Trade Winds)";
    }
    // 6. Bicol Region (Region V)
    else if (lat >= 12.00 && lat <= 14.30 && lng >= 122.50 && lng <= 124.50) {
      regionName = "Bicol Region (Region V)";
      climateType = "Type II";
      soilSeries = "Hydrometric Volcanic Ash Soil";
      hydrologicGroup = "C";
      tempMax = 31.0;
      tempMin = 24.2;
      solarRad = 19.2;
      cloudCoverPercent = 55;
      windDirection = "ENE (Typhoon Alley Track)";
    }
    // 7. MIMAROPA & Palawan (Region IV-B)
    else if (lat >= 9.00 && lat <= 13.50 && lng >= 117.00 && lng <= 121.80) {
      regionName = "MIMAROPA Region (Region IV-B)";
      climateType = "Type I";
      soilSeries = "Palawan Silty Clay Loam";
      hydrologicGroup = "B";
      tempMax = 32.0;
      tempMin = 24.5;
      solarRad = 21.5;
      cloudCoverPercent = 38;
      windDirection = "SW (Monsoon Flow)";
    }
    // 8. Visayas (Regions VI, VII, VIII)
    else if (lat >= 9.00 && lat <= 12.00 && lng >= 122.00 && lng <= 126.00) {
      regionName = "Visayas Islands Group";
      climateType = "Type IV";
      soilSeries = "Visayan Loam / Clay";
      hydrologicGroup = "B";
      tempMax = 31.8;
      tempMin = 24.8;
      solarRad = 20.5;
      cloudCoverPercent = 48;
      windDirection = "E (Visayan Trade Winds)";
    }
    // 9. Mindanao (Regions IX, X, XI, XII, XIII, BARMM)
    else if (lat >= 4.50 && lat < 9.00 && lng >= 119.00 && lng <= 126.60) {
      regionName = "Mindanao Island Group";
      climateType = "Type IV";
      soilSeries = "Mindanao Volcanic Clay";
      hydrologicGroup = "A";
      tempMax = 32.2;
      tempMin = 25.0;
      solarRad = 20.8;
      cloudCoverPercent = 50;
      windDirection = "S (Equatorial Flow)";
    }

    setLocation({
      name: regionName,
      lat,
      lng,
      zoom: newZoom || 13,
      region: regionName,
      soilSeries,
      climateType,
      hydrologicGroup,
      defaultCurveNumber: hydrologicGroup === 'A' ? 68 : hydrologicGroup === 'B' ? 78 : hydrologicGroup === 'C' ? 85 : 89,
      tempMax,
      tempMin,
      solarRad,
      cloudCoverPercent,
      windDirection
    });
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
