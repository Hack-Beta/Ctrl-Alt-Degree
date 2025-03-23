import { useState } from "react";
import { Save, Trash2 } from "lucide-react";
import { twMerge } from "tailwind-merge";

interface AssignmentCardProps {
  assignment: Assignments;
  onUpdate: (assignment: Assignments, update: Partial<Assignments>) => void;
  onDelete: (assignment: Assignments) => void;
  onUpdateStatus: (
    assignment: Assignments,
    status: Assignments["status"]
  ) => void;
}

export default function AssignmentCard({
  assignment,
  onUpdate,
  onDelete,
  onUpdateStatus,
}: AssignmentCardProps) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="bg-neutral-800/50 rounded-md p-4 mb-3 border border-white/10">
      <div className="flex justify-between">
        <h3 className="font-bold">{assignment.name}</h3>
        <div className="flex items-center gap-2">
          <span
            className={twMerge(
              "px-2 py-1 text-xs rounded",
              assignment.status === "nothing" &&
                "bg-neutral-700 text-neutral-300",
              assignment.status === "started" && "bg-blue-500/20 text-blue-300",
              assignment.status === "submitted" &&
                "bg-green-500/20 text-green-300",
              assignment.status === "late" && "bg-red-500/20 text-red-300"
            )}
          >
            {assignment.status === "nothing"
              ? "Not Started"
              : assignment.status === "started"
              ? "In Progress"
              : assignment.status === "submitted"
              ? "Submitted"
              : "Late"}
          </span>
          <button
            onClick={() => onDelete(assignment)}
            className="text-neutral-400 hover:text-red-400"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <p className="text-sm text-neutral-300 mt-2 mb-4">
        {assignment.description}
      </p>

      <div className="flex items-center gap-4 mt-2 mb-3 bg-neutral-900/50 p-3 rounded-md">
        <div className="flex items-center gap-2">
          <label className="text-sm text-neutral-400">Grade:</label>
          {isEditing ? (
            <input
              type="number"
              value={assignment.grade}
              min="0"
              max={assignment.points}
              onChange={(e) => {
                const val = Math.min(
                  parseFloat(e.target.value) || 0,
                  assignment.points
                );
                onUpdate(assignment, { grade: val });
              }}
              className="w-16 px-2 py-1 bg-neutral-700 border border-white/20 rounded-md"
            />
          ) : (
            <span
              className="cursor-pointer hover:bg-neutral-700 px-2 py-1 rounded"
              onClick={() => setIsEditing(true)}
            >
              {assignment.grade || 0}
            </span>
          )}
        </div>
        <div className="text-neutral-400">/</div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-neutral-400">Max Points:</label>
          {isEditing ? (
            <input
              type="number"
              value={assignment.points}
              min="1"
              onChange={(e) => {
                const val = Math.max(1, parseFloat(e.target.value) || 1);
                onUpdate(assignment, { points: val });
              }}
              className="w-16 px-2 py-1 bg-neutral-700 border border-white/20 rounded-md"
            />
          ) : (
            <span
              className="cursor-pointer hover:bg-neutral-700 px-2 py-1 rounded"
              onClick={() => setIsEditing(true)}
            >
              {assignment.points || 100}
            </span>
          )}
        </div>

        {assignment.grade !== undefined && assignment.points > 0 && (
          <div
            className={twMerge(
              "ml-auto text-sm rounded px-2 py-1",
              (assignment.grade / assignment.points) * 100 >= 90
                ? "bg-green-500/20 text-green-300"
                : (assignment.grade / assignment.points) * 100 >= 80
                ? "bg-lime-500/20 text-lime-300"
                : (assignment.grade / assignment.points) * 100 >= 70
                ? "bg-yellow-500/20 text-yellow-300"
                : (assignment.grade / assignment.points) * 100 >= 60
                ? "bg-orange-500/20 text-orange-300"
                : "bg-red-500/20 text-red-300"
            )}
          >
            {((assignment.grade / assignment.points) * 100).toFixed(1)}%
          </div>
        )}

        {isEditing && (
          <button
            onClick={() => setIsEditing(false)}
            className="bg-neutral-700 hover:bg-neutral-600 transition-colors rounded-md px-2 py-1 ml-auto flex items-center gap-1"
          >
            <Save size={14} />
            <span className="text-sm">Done</span>
          </button>
        )}
      </div>

      <div className="flex justify-between items-center mt-2">
        <span className="text-sm text-neutral-400">
          Due: {new Date(assignment.dueDate).toLocaleDateString()}
        </span>

        <div className="flex gap-2">
          <button
            onClick={() => onUpdateStatus(assignment, "started")}
            className={twMerge(
              "px-2 py-1 text-xs rounded",
              assignment.status === "started"
                ? "bg-blue-500/50 text-blue-100"
                : "bg-blue-500/20 text-blue-300 hover:bg-blue-500/30"
            )}
          >
            Start
          </button>
          <button
            onClick={() => onUpdateStatus(assignment, "submitted")}
            className={twMerge(
              "px-2 py-1 text-xs rounded",
              assignment.status === "submitted"
                ? "bg-green-500/50 text-green-100"
                : "bg-green-500/20 text-green-300 hover:bg-green-500/30"
            )}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
