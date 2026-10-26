// GPA calculator on the standard US 4.0 scale.
// Each course has a letter grade and a number of credit hours. The GPA is the
// sum of (grade points × credits) divided by the total credits.

export interface Course {
  name: string
  credits: number
  grade: string // one of the keys in GRADE_POINTS
}

// Standard 4.0 scale with +/- grades. A+ is capped at 4.0 (no weight above 4.0).
export const GRADE_POINTS: Record<string, number> = {
  'A+': 4.0,
  A: 4.0,
  'A-': 3.7,
  'B+': 3.3,
  B: 3.0,
  'B-': 2.7,
  'C+': 2.3,
  C: 2.0,
  'C-': 1.7,
  'D+': 1.3,
  D: 1.0,
  'D-': 0.7,
  F: 0.0,
}

export const GRADE_OPTIONS = Object.keys(GRADE_POINTS)

export interface GpaResult {
  gpa: number // on a 4.0 scale, rounded to 2 decimal places
  totalCredits: number
  totalPoints: number
}

// Convert a letter grade to its 4.0-scale point value. Returns undefined for
// grades that are not on the standard scale.
export function gradeToPoints(grade: string): number | undefined {
  return GRADE_POINTS[grade]
}

// Calculate the cumulative GPA from a list of courses. Returns null if there
// are no courses with positive credits.
export function calculateGpa(courses: Course[]): GpaResult | null {
  let totalCredits = 0
  let totalPoints = 0
  for (const c of courses) {
    if (
      !Number.isFinite(c.credits) ||
      c.credits <= 0 ||
      gradeToPoints(c.grade) === undefined
    ) {
      continue
    }
    totalCredits += c.credits
    totalPoints += GRADE_POINTS[c.grade] * c.credits
  }
  if (totalCredits <= 0) return null
  return {
    gpa: round2(totalPoints / totalCredits),
    totalCredits: round2(totalCredits),
    totalPoints: round2(totalPoints),
  }
}

// Round to 2 decimal places.
export function round2(n: number): number {
  return Math.round(n * 100) / 100
}
