export interface LocationData {
  name: string;
  region: string;
  lat: number;
  lng: number;
  elevation: number;
  climateType: 'Type I' | 'Type II' | 'Type III' | 'Type IV';
  soilSeries: string;
  hydrologicGroup: 'A' | 'B' | 'C' | 'D';
  defaultCurveNumber: number;
  solarRad: number;
  tempMin: number;
  tempMax: number;
  humidity: number;
  windSpeed: number;
  cloudCoverPercent: number;
  windDirection: string;
  zoom: number;
}
