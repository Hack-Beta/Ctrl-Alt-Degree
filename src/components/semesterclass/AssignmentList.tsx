import { Search, Plus } from "lucide-react";
import { twMerge } from "tailwind-merge";
import AssignmentCard from "./AssignmentCard";
import AddAssignmentForm from "./AddAssignmentForm";

interface AssignmentListProps {
  selectedCategory: "HW" | "Quiz" | "Midterm" | "Final";
  courseData: SemesterCourse;
  filteredAssignments: Assignments[];
  categoryGrades: Record<
    string,
    { earned: number; total: number; percentage: number }
  >;
  searchTerm: string;
  showAddAssignment: boolean;
  onSearchChange: (search: string) => void;
  onShowAddAssignment: (show: boolean) => void;
  onAddAssignment: (assignment: Partial<Assignments>) => void;
  onUpdateAssignment: (
    assignment: Assignments,
    update: Partial<Assignments>
  ) => void;
  onDeleteAssignment: (assignment: Assignments) => void;
  onUpdateStatus: (
    assignment: Assignments,
    status: Assignments["status"]
  ) => void;
}

export default function AssignmentList({
  selectedCategory,
  courseData,
  filteredAssignments,
  categoryGrades,
  searchTerm,
  showAddAssignment,
  onSearchChange,
  onShowAddAssignment,
  onAddAssignment,
  onUpdateAssignment,
  onDeleteAssignment,
  onUpdateStatus,
}: AssignmentListProps) {
  return (
    <div className="bg-neutral-950/75 rounded-2xl border border-white/20 flex flex-col p-4 w-full">
      <div className="flex justify-between items-center mb-4 flex-shrink-0">
        <h2 className="text-xl font-bold">
          {selectedCategory === "HW"
            ? "Homework"
            : selectedCategory === "Quiz"
            ? "Quizzes"
            : selectedCategory === "Midterm"
            ? "Midterm Exams"
            : "Final Exam"}
        </h2>

        <div className="flex items-center gap-3">
          <div className="bg-neutral-950/75 w-64 h-10 border border-white/20 rounded-xl flex items-center px-3 text-white/30">
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="bg-transparent border-none outline-none w-full"
            />
            <Search />
          </div>

          <button
            onClick={() => onShowAddAssignment(true)}
            className="px-3 py-2 bg-white/10 hover:bg-white/20 transition-colors rounded-md flex items-center gap-2"
          >
            <Plus size={16} />
            Add New
          </button>
        </div>
      </div>

      <div className="bg-neutral-800/50 rounded-md p-3 mb-4 flex items-center justify-between flex-shrink-0">
        <div className="flex gap-4 items-center">
          <span className="text-sm text-neutral-300">
            Weight for{" "}
            {selectedCategory === "HW"
              ? "Homework"
              : selectedCategory === "Quiz"
              ? "Quizzes"
              : selectedCategory === "Midterm"
              ? "Midterm Exams"
              : "Final Exam"}
            :
            <span className="font-bold ml-1">
              {courseData.weights && courseData.weights[0]
                ? `${
                    courseData.weights[0][
                      selectedCategory as keyof (typeof courseData.weights)[0]
                    ]
                  }%`
                : "Not set"}
            </span>
          </span>

          {categoryGrades[selectedCategory].total > 0 && (
            <span
              className={twMerge(
                "text-sm rounded-md px-2 py-1",
                categoryGrades[selectedCategory].percentage >= 90
                  ? "bg-green-500/20 text-green-300"
                  : categoryGrades[selectedCategory].percentage >= 80
                  ? "bg-lime-500/20 text-lime-300"
                  : categoryGrades[selectedCategory].percentage >= 70
                  ? "bg-yellow-500/20 text-yellow-300"
                  : categoryGrades[selectedCategory].percentage >= 60
                  ? "bg-orange-500/20 text-orange-300"
                  : "bg-red-500/20 text-red-300"
              )}
            >
              Current: {categoryGrades[selectedCategory].percentage.toFixed(1)}%
              ({categoryGrades[selectedCategory].earned}/
              {categoryGrades[selectedCategory].total} points)
            </span>
          )}
        </div>

        <span className="text-sm text-neutral-400">
          {filteredAssignments.length}{" "}
          {filteredAssignments.length === 1 ? "item" : "items"}
        </span>
      </div>

      {/* Assignments list */}
      <div className="overflow-y-auto">
        {showAddAssignment ? (
          <AddAssignmentForm
            selectedCategory={selectedCategory}
            onCancel={() => onShowAddAssignment(false)}
            onAdd={onAddAssignment}
          />
        ) : filteredAssignments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-neutral-400">
            <p>
              No{" "}
              {selectedCategory === "HW"
                ? "homework"
                : selectedCategory === "Quiz"
                ? "quizzes"
                : selectedCategory === "Midterm"
                ? "midterm exams"
                : "final exam"}{" "}
              found
            </p>
            <button
              onClick={() => onShowAddAssignment(true)}
              className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 transition-colors rounded-md flex items-center gap-2"
            >
              <Plus size={16} />
              Add New
            </button>
          </div>
        ) : (
          filteredAssignments.map((assignment) => (
            <AssignmentCard
              key={assignment.dateCreated}
              assignment={assignment}
              onUpdate={onUpdateAssignment}
              onDelete={onDeleteAssignment}
              onUpdateStatus={onUpdateStatus}
            />
          ))
        )}
      </div>
    </div>
  );
}
