import { twMerge } from "tailwind-merge";

interface StatsPanelProps {
  courseData: SemesterCourse;
  assignments: Assignments[];
  categoryGrades: Record<
    string,
    { earned: number; total: number; percentage: number }
  >;
  overallGrade: { percentage: number; letter: string };
}

export default function StatsPanel({
  courseData,
  assignments,
  categoryGrades,
  overallGrade,
}: StatsPanelProps) {
  return (
    <div className="w-64 bg-neutral-950/75 rounded-2xl border border-white/20 flex flex-col p-4">
      <h2 className="text-lg font-bold mb-1">Course Stats</h2>

      <div className="space-y-2.5">
        <div>
          <h3 className="text-sm text-neutral-400">Credits</h3>
          <p className="text-xl font-bold">{courseData.course.credits}</p>
        </div>

        <div>
          <h3 className="text-sm text-neutral-400 mb-0.5">Current Grade</h3>
          {overallGrade.percentage > 0 ? (
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold">
                  {overallGrade.percentage.toFixed(1)}%
                </p>
                <span
                  className={twMerge(
                    "text-lg px-2 rounded",
                    overallGrade.percentage >= 90
                      ? "bg-green-500/20 text-green-300"
                      : overallGrade.percentage >= 80
                      ? "bg-lime-500/20 text-lime-300"
                      : overallGrade.percentage >= 70
                      ? "bg-yellow-500/20 text-yellow-300"
                      : overallGrade.percentage >= 60
                      ? "bg-orange-500/20 text-orange-300"
                      : "bg-red-500/20 text-red-300"
                  )}
                >
                  {overallGrade.letter}
                </span>
              </div>

              <div className="w-full bg-neutral-700 h-2 rounded-full overflow-hidden mt-2">
                <div
                  className={twMerge(
                    "h-full rounded-full",
                    overallGrade.percentage >= 90
                      ? "bg-green-500"
                      : overallGrade.percentage >= 80
                      ? "bg-lime-500"
                      : overallGrade.percentage >= 70
                      ? "bg-yellow-500"
                      : overallGrade.percentage >= 60
                      ? "bg-orange-500"
                      : "bg-red-500"
                  )}
                  style={{
                    width: `${Math.min(overallGrade.percentage, 100)}%`,
                  }}
                ></div>
              </div>
            </div>
          ) : (
            <p className="text-xl font-bold">N/A</p>
          )}
        </div>

        <div>
          <h3 className="text-sm text-neutral-400 mb-1.5">Category Grades</h3>
          <div className="space-y-1">
            {Object.entries(categoryGrades).map(
              ([category, { total, percentage }]) => (
                <div
                  key={category}
                  className="flex justify-between items-center"
                >
                  <span className="text-sm">{category}</span>
                  {total > 0 ? (
                    <div className="flex items-center gap-1">
                      <span
                        className={twMerge(
                          "font-medium px-1.5 text-xs rounded",
                          percentage >= 90
                            ? "bg-green-500/20 text-green-300"
                            : percentage >= 80
                            ? "bg-lime-500/20 text-lime-300"
                            : percentage >= 70
                            ? "bg-yellow-500/20 text-yellow-300"
                            : percentage >= 60
                            ? "bg-orange-500/20 text-orange-300"
                            : "bg-red-500/20 text-red-300"
                        )}
                      >
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-neutral-500">
                      No assignments
                    </span>
                  )}
                </div>
              )
            )}
          </div>
        </div>

        <div>
          <h3 className="text-sm text-neutral-400">Assignments</h3>
          <div className="space-y-1 mt-1.5">
            <div className="flex justify-between items-center">
              <span className="text-sm">Homework</span>
              <span className="text-sm font-bold">
                {assignments.filter((a) => a.type === "HW").length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Quizzes</span>
              <span className="text-sm font-bold">
                {assignments.filter((a) => a.type === "Quiz").length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Midterms</span>
              <span className="text-sm font-bold">
                {assignments.filter((a) => a.type === "Midterm").length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Finals</span>
              <span className="text-sm font-bold">
                {assignments.filter((a) => a.type === "Final").length}
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-3">
          <h3 className="text-sm text-neutral-400 mb-0.5">Grade Weights</h3>
          {courseData.weights && courseData.weights[0] ? (
            <div className="space-y-0.5">
              {Object.entries(courseData.weights[0]).map(([type, weight]) => (
                <div key={type} className="flex justify-between items-center">
                  <span className="text-sm">{type}</span>
                  <span className="text-sm font-bold">{weight}%</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-neutral-400">No weights set</p>
          )}
        </div>
      </div>
    </div>
  );
}
