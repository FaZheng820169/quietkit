// Calorie (TDEE) calculator: BMR via Mifflin-St Jeor, TDEE by activity factor,
// and calorie targets for weight goals.

export type UnitSystem = 'metric' | 'imperial'
export type Gender = 'male' | 'female'

export type ActivityLevel =
  | 'sedentary'
  | 'light'
  | 'moderate'
  | 'very'
  | 'extra'

export const ACTIVITY_FACTORS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  very: 1.725,
  extra: 1.9,
}

export const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  sedentary: 'Sedentary (little or no exercise)',
  light: 'Lightly active (1–3 days/week)',
  moderate: 'Moderately active (3–5 days/week)',
  very: 'Very active (6–7 days/week)',
  extra: 'Extra active (physical job / 2× training)',
}

export interface CalorieResult {
  bmr: number
  tdee: number
  goals: { label: string; calories: number; perWeek: string }[]
}

// Mifflin-St Jeor equation (metric: kg, cm).
export function bmrMetric(weightKg: number, heightCm: number, age: number, gender: Gender): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age
  return gender === 'male' ? base + 5 : base - 161
}

// Convert imperial inputs to metric, then apply Mifflin-St Jeor.
export function bmrImperial(
  weightLb: number,
  heightIn: number,
  age: number,
  gender: Gender,
): number {
  const weightKg = weightLb * 0.453592
  const heightCm = heightIn * 2.54
  return bmrMetric(weightKg, heightCm, age, gender)
}

export function tdee(bmr: number, activity: ActivityLevel): number {
  return bmr * ACTIVITY_FACTORS[activity]
}

// Calorie targets for common weight goals (500 kcal ≈ 0.5 kg/week).
export function calorieGoals(tdeeValue: number): CalorieResult['goals'] {
  return [
    { label: 'Maintain weight', calories: Math.round(tdeeValue), perWeek: '0 kg' },
    {
      label: 'Lose 0.5 kg/week',
      calories: Math.round(tdeeValue - 500),
      perWeek: '−0.5 kg',
    },
    {
      label: 'Lose 1 kg/week',
      calories: Math.round(tdeeValue - 1000),
      perWeek: '−1 kg',
    },
    {
      label: 'Gain 0.5 kg/week',
      calories: Math.round(tdeeValue + 500),
      perWeek: '+0.5 kg',
    },
    {
      label: 'Gain 1 kg/week',
      calories: Math.round(tdeeValue + 1000),
      perWeek: '+1 kg',
    },
  ]
}

// Compute everything. Returns null for invalid input.
export function computeCalories(params: {
  unit: UnitSystem
  gender: Gender
  age: number
  weight: number // kg or lb
  height: number // cm or inches
  activity: ActivityLevel
}): CalorieResult | null {
  const { unit, gender, age, weight, height, activity } = params
  if (
    !Number.isFinite(age) ||
    !Number.isFinite(weight) ||
    !Number.isFinite(height) ||
    age <= 0 ||
    weight <= 0 ||
    height <= 0
  ) {
    return null
  }
  const bmr =
    unit === 'metric'
      ? bmrMetric(weight, height, age, gender)
      : bmrImperial(weight, height, age, gender)
  if (!Number.isFinite(bmr) || bmr <= 0) return null
  const tdeeValue = tdee(bmr, activity)
  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdeeValue),
    goals: calorieGoals(tdeeValue),
  }
}

// Feet + inches to total inches (reused from BMI pattern).
export function feetInchesToInches(feet: number, inches: number): number {
  return feet * 12 + inches
}
