export interface CropGrowthStage {
  stage: 'initial' | 'development' | 'mid-season' | 'late-season';
  kc: number;
  durationDays: number;
}

export interface CropProfile {
  id: string;
  name: string;
  scientificName: string;
  rootDepth: number;
  growthStages: CropGrowthStage[];
  targetYieldTonPerHa: number;
}

export interface SoilProfile {
  id: string;
  texture: string;
  infiltrationRate: number;
  bulkDensity: number;
  fieldCapacity: number;
  wiltingPoint: number;
  availableWaterCapacity: number;
  drainageCharacteristics: 'Poor' | 'Moderate' | 'Good' | 'Excessive';
}

export const PHILIPPINE_CROPS: CropProfile[] = [
  {
    id: 'rice-lowland',
    name: 'Lowland Rice (Palay)',
    scientificName: 'Oryza sativa',
    rootDepth: 0.40,
    growthStages: [
      { stage: 'initial', kc: 1.05, durationDays: 30 },
      { stage: 'development', kc: 1.10, durationDays: 30 },
      { stage: 'mid-season', kc: 1.20, durationDays: 40 },
      { stage: 'late-season', kc: 0.90, durationDays: 20 }
    ],
    targetYieldTonPerHa: 4.5
  },
  {
    id: 'yellow-corn',
    name: 'Yellow Corn',
    scientificName: 'Zea mays',
    rootDepth: 0.70,
    growthStages: [
      { stage: 'initial', kc: 0.30, durationDays: 20 },
      { stage: 'development', kc: 0.75, durationDays: 35 },
      { stage: 'mid-season', kc: 1.15, durationDays: 40 },
      { stage: 'late-season', kc: 0.60, durationDays: 25 }
    ],
    targetYieldTonPerHa: 5.0
  },
  {
    id: 'mango',
    name: 'Mango (Carabao)',
    scientificName: 'Mangifera indica',
    rootDepth: 1.50,
    growthStages: [
      { stage: 'initial', kc: 0.75, durationDays: 60 },
      { stage: 'development', kc: 0.85, durationDays: 90 },
      { stage: 'mid-season', kc: 0.95, durationDays: 120 },
      { stage: 'late-season', kc: 0.80, durationDays: 95 }
    ],
    targetYieldTonPerHa: 10.0
  }
];

export const PHILIPPINE_SOILS: SoilProfile[] = [
  {
    id: 'clay-loam',
    texture: 'Clay Loam',
    infiltrationRate: 10.0,
    bulkDensity: 1.35,
    fieldCapacity: 32.0,
    wiltingPoint: 18.0,
    availableWaterCapacity: 140,
    drainageCharacteristics: 'Moderate'
  },
  {
    id: 'sandy-loam',
    texture: 'Sandy Loam',
    infiltrationRate: 25.0,
    bulkDensity: 1.45,
    fieldCapacity: 20.0,
    wiltingPoint: 8.0,
    availableWaterCapacity: 120,
    drainageCharacteristics: 'Good'
  },
  {
    id: 'puddled-clay',
    texture: 'Puddled Clay (Lowland Rice Paddies)',
    infiltrationRate: 2.0,
    bulkDensity: 1.50,
    fieldCapacity: 40.0,
    wiltingPoint: 22.0,
    availableWaterCapacity: 180,
    drainageCharacteristics: 'Poor'
  }
];
