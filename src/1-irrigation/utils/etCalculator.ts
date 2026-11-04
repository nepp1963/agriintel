export interface WeatherParameters {
  temp: number;
  windSpeed: number;
  solarRadiation: number;
  humidity: number;
}

export interface CropWaterRequirementResult {
  etc: number;
  netIrrigationRequirement: number;
}

export function calculatePenmanMonteithET0(weather: WeatherParameters, elevation: number = 0): number {
  const { temp, windSpeed, solarRadiation, humidity } = weather;
  const pressure = 101.3 * Math.pow((293 - 0.0065 * elevation) / 293, 5.26);
  const gamma = 0.000665 * pressure;
  const es = 0.6108 * Math.exp((17.27 * temp) / (temp + 237.3));
  const ea = es * (humidity / 100);
  const vpd = es - ea;
  const delta = (4098 * es) / Math.pow(temp + 237.3, 2);
  const G = 0;
  const numerator = 0.408 * delta * (solarRadiation - G) + gamma * (900 / (temp + 273)) * windSpeed * vpd;
  const denominator = delta + gamma * (1 + 0.34 * windSpeed);
  const et0 = numerator / denominator;
  return Math.max(0, parseFloat(et0.toFixed(2)));
}

export function calculateCropWaterRequirement(et0: number, kc: number, effectiveRainfall: number = 0): CropWaterRequirementResult {
  const etc = et0 * kc;
  const netIrrigationRequirement = Math.max(0, etc - effectiveRainfall);
  return { etc: parseFloat(etc.toFixed(2)), netIrrigationRequirement: parseFloat(netIrrigationRequirement.toFixed(2)) };
}
