// Grade calculator: final exam score needed, and weighted average for multiple assignments.

export interface FinalGradeResult {
  needed: number // score needed on the final (as a percentage, 0-100)
  currentContribution: number // current grade * (1 - finalWeight/100)
  reachable: boolean // whether the needed score is <= 100
}

// Given your current grade (0-100), the grade you want (0-100), and the final
// exam weight as a percentage of the total course grade, calculate the score
// you need on the final.
// current * (1 - w) + final * w = desired
// final = (desired - current * (1 - w)) / w
export function finalGradeNeeded(
  currentGrade: number,
  desiredGrade: number,
  finalWeightPercent: number,
): FinalGradeResult | null {
  if (
    !Number.isFinite(currentGrade) ||
    !Number.isFinite(desiredGrade) ||
    !Number.isFinite(finalWeightPercent) ||
    currentGrade < 0 ||
    desiredGrade < 0 ||
    finalWeightPercent <= 0 ||
    finalWeightPercent > 100
  ) {
    return null
  }
  const w = finalWeightPercent / 100
  const currentContribution = currentGrade * (1 - w)
  const needed = (desiredGrade - currentContribution) / w
  return {
    needed: round1(needed),
    currentContribution: round1(currentContribution),
    reachable: needed <= 100,
  }
}

export interface Assignment {
  grade: number
  weight: number // percentage weight of the total
}

export interface WeightedResult {
  average: number // weighted average (0-100)
  totalWeight: number // sum of weights, for validation
  weightOk: boolean // whether weights sum to 100 (within tolerance)
}

// Weighted average of a list of assignments. Each assignment has a grade (0-100)
// and a weight (percentage). Weights do not have to sum to 100 — if they do not,
// the average is normalised by the total weight.
export function weightedAverage(assignments: Assignment[]): WeightedResult | null {
  if (!assignments.length) return null
  let totalWeight = 0
  let weightedSum = 0
  for (const a of assignments) {
    if (
      !Number.isFinite(a.grade) ||
      !Number.isFinite(a.weight) ||
      a.grade < 0 ||
      a.weight < 0
    ) {
      return null
    }
    totalWeight += a.weight
    weightedSum += a.grade * a.weight
  }
  if (totalWeight <= 0) return null
  return {
    average: round1(weightedSum / totalWeight),
    totalWeight: round1(totalWeight),
    weightOk: Math.abs(totalWeight - 100) < 0.5,
  }
}

// Round to 1 decimal place.
export function round1(n: number): number {
  return Math.round(n * 10) / 10
}
