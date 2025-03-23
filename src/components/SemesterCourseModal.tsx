import { useState, useEffect } from "react";
import { X, Plus, Minus } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { courses as allCourses } from "../api/constants";

interface SemesterCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (courseData: Partial<SemesterCourse>) => void;
  editData?: SemesterCourse | null;
}

const defaultWeights = {
  HW: 25,
  Quiz: 15,
  Midterm: 30,
  Final: 30,
};

export default function SemesterCourseModal({
  isOpen,
  onClose,
  onSave,
  editData,
}: SemesterCourseModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [weights, setWeights] =
    useState<Record<"HW" | "Quiz" | "Midterm" | "Final", number>>(
      defaultWeights
    );
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (editData) {
      setSelectedCourse(editData.course);
      setSearchTerm(editData.course.name);
      if (editData.weights && editData.weights.length > 0) {
        setWeights(editData.weights[0]);
      }
    } else {
      setSelectedCourse(null);
      setSearchTerm("");
      setWeights(defaultWeights);
    }
  }, [editData, isOpen]);

  useEffect(() => {
    if (searchTerm) {
      if (!searchTerm.trim()) {
        setFilteredCourses([]);
        return;
      }

      const filtered = allCourses
        .filter((c: Course) =>
          c.name?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .slice(0, 5);

      setFilteredCourses(filtered as any);
    }
  }, [searchTerm]);

  // Handle course selection
  const handleSelectCourse = (course: any) => {
    setSelectedCourse({
      id: course.course,
      name: course.name,
      grade: "",
      credits: course.credits.toString(),
      description: course.description,
      prerequisites: course.prerequisites,
    });
    setSearchTerm(course.course);
    setShowResults(false);
  };

  const handleWeightChange = (type: keyof typeof weights, value: number) => {
    setWeights((prev) => ({
      ...prev,
      [type]: Math.max(0, Math.min(100, value)),
    }));
  };

  const handleSave = () => {
    if (!selectedCourse) return;

    onSave({
      course: selectedCourse,
      weights: [weights],
      assignments: "[]",
    });

    setSelectedCourse(null);
    setSearchTerm("");
    setWeights(defaultWeights);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50">
      <div className="bg-neutral-800 rounded-xl w-full max-w-2xl p-6 relative border border-white/20">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/60 hover:text-white"
        >
          <X size={24} />
        </button>

        <h2 className="text-xl font-bold mb-6">
          {editData ? "Edit Course" : "Add New Course to Semester"}
        </h2>

        <div className="space-y-6">
          {!selectedCourse && (
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Course
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowResults(true);
                  }}
                  onFocus={() => setShowResults(true)}
                  placeholder="Search for a course..."
                  className="w-full px-4 py-2 bg-neutral-700 border border-white/20 rounded-md focus:outline-none"
                />

                {showResults && filteredCourses.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full bg-neutral-700 border border-white/20 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {filteredCourses.map((course, index) => (
                      <div
                        key={index}
                        className="px-4 py-2 hover:bg-neutral-600 cursor-pointer"
                        onClick={() => handleSelectCourse(course)}
                      >
                        <div className="font-medium">{course.name}</div>
                        <div className="text-xs text-gray-300">
                          {course.description?.substring(0, 100)}...
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          {selectedCourse && (
            <>
              <div className="bg-neutral-700/50 rounded-md p-4 border border-white/10">
                <h3 className="font-semibold text-lg">{selectedCourse.name}</h3>
                <p className="text-sm text-neutral-300 mt-1">
                  {selectedCourse.description}
                </p>
                <div className="mt-2 flex gap-4">
                  <span className="text-sm text-neutral-400">
                    Credits: {selectedCourse.credits}
                  </span>
                  {selectedCourse.prerequisites &&
                    selectedCourse.prerequisites.length > 0 && (
                      <span className="text-sm text-neutral-400">
                        Prerequisites: {selectedCourse.prerequisites.join(", ")}
                      </span>
                    )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Grade Weights</h3>
                <p className="text-sm text-neutral-400 mb-4">
                  Set the percentage weight for each assessment type (must total
                  100%)
                </p>

                <div className="space-y-3">
                  {(Object.keys(weights) as Array<keyof typeof weights>).map(
                    (type) => (
                      <div
                        key={type}
                        className="flex items-center justify-between"
                      >
                        <span className="w-24">{type}</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              handleWeightChange(type, weights[type] - 5)
                            }
                            className="bg-neutral-700 hover:bg-neutral-600 w-8 h-8 rounded-md flex items-center justify-center"
                          >
                            <Minus size={16} />
                          </button>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={weights[type]}
                            onChange={(e) =>
                              handleWeightChange(
                                type,
                                parseInt(e.target.value) || 0
                              )
                            }
                            className="w-16 px-2 py-1 bg-neutral-700 border border-white/20 rounded-md text-center"
                          />
                          <button
                            onClick={() =>
                              handleWeightChange(type, weights[type] + 5)
                            }
                            className="bg-neutral-700 hover:bg-neutral-600 w-8 h-8 rounded-md flex items-center justify-center"
                          >
                            <Plus size={16} />
                          </button>
                          <span className="w-8">{weights[type]}%</span>
                        </div>
                      </div>
                    )
                  )}
                </div>
                <div
                  className={twMerge(
                    "mt-4 px-3 py-2 rounded-md text-center",
                    Object.values(weights).reduce((a, b) => a + b, 0) === 100
                      ? "bg-green-500/20 text-green-300"
                      : "bg-red-500/20 text-red-300"
                  )}
                >
                  Total: {Object.values(weights).reduce((a, b) => a + b, 0)}%
                  {Object.values(weights).reduce((a, b) => a + b, 0) !==
                    100 && <span> (must equal 100%)</span>}
                </div>
              </div>
            </>
          )}
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-neutral-700 text-white rounded-md hover:bg-neutral-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={
                !selectedCourse ||
                Object.values(weights).reduce((a, b) => a + b, 0) !== 100
              }
              className={twMerge(
                "px-4 py-2 rounded-md transition-colors",
                !selectedCourse ||
                  Object.values(weights).reduce((a, b) => a + b, 0) !== 100
                  ? "bg-neutral-600 text-neutral-400 cursor-not-allowed"
                  : "bg-white text-black hover:bg-white/80"
              )}
            >
              {editData ? "Save Changes" : "Add Course"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
