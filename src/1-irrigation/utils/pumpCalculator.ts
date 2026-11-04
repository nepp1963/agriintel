export interface PipeParameters {
  flowRateLps: number;
  pipeLengthMeters: number;
  innerDiameterMm: number;
  hazenWilliamsC: number;
}

export interface PumpRequirementInput {
  flowRateLps: number;
  staticHeadMeters: number;
  totalFrictionLoss: number;
  minorLosses: number;
  pumpEfficiency: number;
}

export function calculateHazenWilliamsFrictionLoss(params: PipeParameters): number {
  const { flowRateLps, pipeLengthMeters, innerDiameterMm, hazenWilliamsC } = params;
  if (flowRateLps <= 0 || innerDiameterMm <= 0) return 0;
  const q = flowRateLps / 1000;
  const d = innerDiameterMm / 1000;
  const numerator = 10.67 * pipeLengthMeters * Math.pow(q, 1.852);
  const denominator = Math.pow(hazenWilliamsC, 1.852) * Math.pow(d, 4.87);
  const headLoss = numerator / denominator;
  return parseFloat(headLoss.toFixed(2));
}

export function calculatePumpPowerRequirements(input: PumpRequirementInput) {
  const { flowRateLps, staticHeadMeters, totalFrictionLoss, minorLosses, pumpEfficiency } = input;
  const tdh = staticHeadMeters + totalFrictionLoss + minorLosses;
  const qM3s = flowRateLps / 1000;
  const waterDensity = 1000;
  const gravity = 9.81;
  const hydraulicPowerKw = (qM3s * waterDensity * gravity * tdh) / 1000;
  const safeEfficiency = Math.max(0.1, Math.min(1.0, pumpEfficiency));
  const brakePowerKw = hydraulicPowerKw / safeEfficiency;
  const brakePowerHp = brakePowerKw / 0.7457;
  return {
    tdh: parseFloat(tdh.toFixed(2)),
    hydraulicPowerKw: parseFloat(hydraulicPowerKw.toFixed(3)),
    brakePowerKw: parseFloat(brakePowerKw.toFixed(3)),
    brakePowerHp: parseFloat(brakePowerHp.toFixed(2))
  };
}
