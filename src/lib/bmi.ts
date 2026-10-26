// BMI (Body Mass Index) calculation: metric and imperial units, plus category.

export type UnitSystem = 'metric' | 'imperial'

export interface BmiResult {
  bmi: number
  category: BmiCategory
}

export type BmiCategory =
  | 'Underweight'
  | 'Normal weight'
  | 'Overweight'
  | 'Obese'

// Metric: weight in kg, height in cm. BMI = kg / (m)^2
export function bmiMetric(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100
  return weightKg / (heightM * heightM)
}

// Imperial: weight in lb, height in inches. BMI = 703 * lb / in^2
export function bmiImperial(weightLb: number, heightIn: number): number {
  return (703 * weightLb) / (heightIn * heightIn)
}

// Round to one decimal place.
export function roundBmi(bmi: number): number {
  return Math.round(bmi * 10) / 10
}

// WHO standard BMI categories.
export function bmiCategory(bmi: number): BmiCategory {
  if (bmi < 18.5) return 'Underweight'
  if (bmi < 25) return 'Normal weight'
  if (bmi < 30) return 'Overweight'
  return 'Obese'
}

// Convert feet + inches to total inches.
export function feetInchesToInches(feet: number, inches: number): number {
  return feet * 12 + inches
}

// Compute BMI with validation. Returns null for invalid input.
export function computeBmi(
  unit: UnitSystem,
  weight: number,
  heightCmOrIn: number,
): BmiResult | null {
  if (
    !Number.isFinite(weight) ||
    !Number.isFinite(heightCmOrIn) ||
    weight <= 0 ||
    heightCmOrIn <= 0
  ) {
    return null
  }
  const raw =
    unit === 'metric'
      ? bmiMetric(weight, heightCmOrIn)
      : bmiImperial(weight, heightCmOrIn)
  if (!Number.isFinite(raw) || raw <= 0) return null
  return { bmi: roundBmi(raw), category: bmiCategory(raw) }
}
