import { useState } from "react";
import { twMerge } from "tailwind-merge";

interface AddAssignmentFormProps {
  selectedCategory: "HW" | "Quiz" | "Midterm" | "Final";
  onCancel: () => void;
  onAdd: (assignment: Partial<Assignments>) => void;
}

export default function AddAssignmentForm({
  selectedCategory,
  onCancel,
  onAdd,
}: AddAssignmentFormProps) {
  const [newAssignment, setNewAssignment] = useState<Partial<Assignments>>({
    type: selectedCategory,
    name: "",
    description: "",
    grade: 0,
    points: 100,
    dueDate: new Date().toISOString().split("T")[0],
    status: "nothing",
    dateCreated: new Date().toISOString(),
  });

  const handleSubmit = () => {
    if (!newAssignment.name || !newAssignment.dueDate) return;
    onAdd(newAssignment);
  };

  return (
    <div className="bg-neutral-800 rounded-md p-4 mb-4 border border-white/20">
      <h3 className="text-lg font-bold mb-3">New {selectedCategory}</h3>
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-1">
            Name
          </label>
          <input
            type="text"
            value={newAssignment.name}
            onChange={(e) =>
              setNewAssignment({
                ...newAssignment,
                name: e.target.value,
              })
            }
            className="w-full px-3 py-2 bg-neutral-700 border border-white/20 rounded-md focus:outline-none"
            placeholder="Assignment name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-1">
            Description
          </label>
          <textarea
            value={newAssignment.description}
            onChange={(e) =>
              setNewAssignment({
                ...newAssignment,
                description: e.target.value,
              })
            }
            className="w-full px-3 py-2 bg-neutral-700 border border-white/20 rounded-md focus:outline-none h-24"
            placeholder="Assignment description"
          />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">
              Max Points
            </label>
            <input
              type="number"
              min="0"
              value={newAssignment.points}
              onChange={(e) =>
                setNewAssignment({
                  ...newAssignment,
                  points: parseFloat(e.target.value) || 0,
                })
              }
              className="w-full px-3 py-2 bg-neutral-700 border border-white/20 rounded-md focus:outline-none"
              placeholder="Assignment worth"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">
              Due Date
            </label>
            <input
              type="date"
              value={newAssignment.dueDate}
              onChange={(e) =>
                setNewAssignment({
                  ...newAssignment,
                  dueDate: e.target.value,
                })
              }
              className="w-full px-3 py-2 bg-neutral-700 border border-white/20 rounded-md focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">
              Status
            </label>
            <select
              value={newAssignment.status}
              onChange={(e) =>
                setNewAssignment({
                  ...newAssignment,
                  status: e.target.value as Assignments["status"],
                })
              }
              className="w-full px-3 py-2.5 bg-neutral-700 border border-white/20 rounded-md focus:outline-none"
            >
              <option value="nothing">Not Started</option>
              <option value="started">In Progress</option>
              <option value="submitted">Submitted</option>
              <option value="late">Late</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-neutral-700 rounded-md hover:bg-neutral-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!newAssignment.name || !newAssignment.dueDate}
            className={twMerge(
              "px-4 py-2 rounded-md transition-colors",
              !newAssignment.name || !newAssignment.dueDate
                ? "bg-neutral-600 text-neutral-400 cursor-not-allowed"
                : "bg-white text-black hover:bg-white/80"
            )}
          >
            Add {selectedCategory}
          </button>
        </div>
      </div>
    </div>
  );
}
