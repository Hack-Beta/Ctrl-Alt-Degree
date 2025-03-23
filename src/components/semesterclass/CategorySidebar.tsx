import { twMerge } from "tailwind-merge";

type CategoryType = "HW" | "Quiz" | "Midterm" | "Final";

interface CategorySidebarProps {
  selectedCategory: CategoryType;
  onSelectCategory: (category: CategoryType) => void;
  categoryGrades: Record<
    string,
    { earned: number; total: number; percentage: number }
  >;
}

export default function CategorySidebar({
  selectedCategory,
  onSelectCategory,
  categoryGrades,
}: CategorySidebarProps) {
  return (
    <div className="w-30">
      <div className="bg-neutral-950/75 h-auto w-full rounded-2xl border border-white/20 flex flex-col justify-evenly items-center text-xl font-extrabold py-4">
        <button
          onClick={() => onSelectCategory("HW")}
          className={twMerge(
            "text-white/40 duration-150 py-4 w-full text-center relative",
            selectedCategory === "HW" && "text-white/90 bg-white/10"
          )}
        >
          HW
          {categoryGrades.HW.total > 0 && (
            <span className="absolute bottom-1 left-0 right-0 text-xs font-normal">
              {categoryGrades.HW.percentage.toFixed(1)}%
            </span>
          )}
        </button>
        <button
          onClick={() => onSelectCategory("Quiz")}
          className={twMerge(
            "text-white/40 duration-150 py-4 w-full text-center relative",
            selectedCategory === "Quiz" && "text-white/90 bg-white/10"
          )}
        >
          Quiz
          {categoryGrades.Quiz.total > 0 && (
            <span className="absolute bottom-1 left-0 right-0 text-xs font-normal">
              {categoryGrades.Quiz.percentage.toFixed(1)}%
            </span>
          )}
        </button>
        <button
          onClick={() => onSelectCategory("Midterm")}
          className={twMerge(
            "text-white/40 duration-150 py-4 w-full text-center relative",
            selectedCategory === "Midterm" && "text-white/90 bg-white/10"
          )}
        >
          Exam
          {categoryGrades.Midterm.total > 0 && (
            <span className="absolute bottom-1 left-0 right-0 text-xs font-normal">
              {categoryGrades.Midterm.percentage.toFixed(1)}%
            </span>
          )}
        </button>
        <button
          onClick={() => onSelectCategory("Final")}
          className={twMerge(
            "text-white/40 duration-150 py-4 w-full text-center relative",
            selectedCategory === "Final" && "text-white/90 bg-white/10"
          )}
        >
          Final
          {categoryGrades.Final.total > 0 && (
            <span className="absolute bottom-1 left-0 right-0 text-xs font-normal">
              {categoryGrades.Final.percentage.toFixed(1)}%
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
