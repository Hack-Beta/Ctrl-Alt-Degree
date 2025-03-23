export const GRADE_SCALE: Record<string, number[]> = {
  "A+": [97, 100],
  A: [93, 96.99],
  "A-": [90, 92.99],
  "B+": [87, 89.99],
  B: [83, 86.99],
  "B-": [80, 82.99],
  "C+": [77, 79.99],
  C: [73, 76.99],
  "C-": [70, 72.99],
  "D+": [67, 69.99],
  D: [63, 66.99],
  "D-": [60, 62.99],
  F: [0, 59.99],
};

export const getLetterGrade = (percentage: number): string => {
  for (const [letter, [min, max]] of Object.entries(GRADE_SCALE)) {
    if (percentage >= min && percentage <= max) {
      return letter;
    }
  }
  return "N/A";
};

export const calculateCategoryGrades = (
  assignments: Assignments[],
  categories: readonly ("HW" | "Quiz" | "Midterm" | "Final")[]
) => {
  return categories.reduce((acc, category) => {
    const categoryAssignments = assignments.filter((a) => a.type === category);
    const earned = categoryAssignments.reduce(
      (sum, a) => sum + (a.grade || 0),
      0
    );
    const total = categoryAssignments.reduce(
      (sum, a) => sum + (a.points || 0),
      0
    );
    const percentage = total > 0 ? (earned / total) * 100 : 0;

    acc[category] = { earned, total, percentage };
    return acc;
  }, {} as Record<string, { earned: number; total: number; percentage: number }>);
};

export const calculateOverallGrade = (
  categoryGrades: Record<
    string,
    { earned: number; total: number; percentage: number }
  >,
  weights: Record<"HW" | "Quiz" | "Midterm" | "Final", number>
) => {
  const categories = ["HW", "Quiz", "Midterm", "Final"] as const;
  let weightedSum = 0;
  let totalApplicableWeight = 0;

  categories.forEach((category) => {
    const categoryGrade = categoryGrades[category];
    if (categoryGrade.total > 0) {
      weightedSum += categoryGrade.percentage * weights[category];
      totalApplicableWeight += weights[category];
    }
  });

  const finalPercentage =
    totalApplicableWeight > 0 ? weightedSum / totalApplicableWeight : 0;

  return {
    percentage: finalPercentage,
    letter: getLetterGrade(finalPercentage),
  };
};
