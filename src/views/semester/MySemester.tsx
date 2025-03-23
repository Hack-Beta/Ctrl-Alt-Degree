import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, X, BookOpen } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useMockSemesterCourseAPI } from "../../api/semesterCourseAPI";

import SemesterCourseModal from "../../components/SemesterCourseModal";
import {
  calculateCategoryGrades,
  calculateOverallGrade,
} from "../../components/semesterclass/GradeUtils";

export default function MySemester() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [editCourse, setEditCourse] = useState<SemesterCourse | null>(null);
  const [semesterCourses, setSemesterCourses] = useState<SemesterCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const semesterCourseAPI = useMockSemesterCourseAPI();

  useEffect(() => {
    async function loadCourses() {
      if (user) {
        setIsLoading(true);
        try {
          const courses = await semesterCourseAPI.getSemesterCourses();
          setSemesterCourses(courses);
        } catch (error) {
          console.error("Failed to load semester courses:", error);
        } finally {
          setIsLoading(false);
        }
      }
    }

    loadCourses();
  }, [user]);

  const handleCourseSlotClick = (index: number) => {
    const existingCourse = semesterCourses.find(
      (course) => course.id === index
    );

    if (existingCourse) {
      navigate(`/my-semester/${existingCourse.id}`);
    } else {
      setSelectedSlot(index);
      setEditCourse(null);
      setIsModalOpen(true);
    }
  };

  const handleEditCourse = (course: SemesterCourse) => {
    setEditCourse(course);
    setIsModalOpen(true);
  };

  const handleSaveCourse = async (courseData: Partial<SemesterCourse>) => {
    try {
      if (editCourse) {
        const updatedCourse = await semesterCourseAPI.updateSemesterCourse(
          editCourse.id!,
          courseData
        );

        if (updatedCourse) {
          setSemesterCourses((prevCourses) =>
            prevCourses.map((c) =>
              c.id === updatedCourse.id ? updatedCourse : c
            )
          );
        }
      } else if (selectedSlot !== null) {
        const newCourse = await semesterCourseAPI.createSemesterCourse({
          ...courseData,
          id: selectedSlot,
        });

        if (newCourse) {
          setSemesterCourses((prevCourses) => [...prevCourses, newCourse]);
        }
      }
    } catch (error) {
      console.error("Failed to save course:", error);
    }

    setIsModalOpen(false);
    setSelectedSlot(null);
    setEditCourse(null);
  };

  const handleDeleteCourse = async (courseId: number) => {
    try {
      const success = await semesterCourseAPI.deleteSemesterCourse(courseId);
      if (success) {
        setSemesterCourses((prevCourses) =>
          prevCourses.filter((course) => course.id !== courseId)
        );
      }
    } catch (error) {
      console.error("Failed to delete course:", error);
    }
  };
  const calculateStats = () => {
    if (semesterCourses.length === 0) {
      return { gpa: 0, totalCredits: 0 };
    }
    let totalCredits = 0;
    let totalGradePoints = 0;

    semesterCourses.forEach((course) => {
      const credits = parseInt(course.course.credits) || 0;
      totalCredits += credits;

      try {
        const assignments = JSON.parse(course.assignments || "[]");
        const categories = ["HW", "Quiz", "Midterm", "Final"] as const;
        const categoryGrades = calculateCategoryGrades(assignments, categories);

        if (course.weights && course.weights.length > 0) {
          const overallGrade = calculateOverallGrade(
            categoryGrades,
            course.weights[0]
          );

          const gradePoint =
            overallGrade.percentage >= 90
              ? 4.0
              : overallGrade.percentage >= 80
              ? 3.0
              : overallGrade.percentage >= 70
              ? 2.0
              : overallGrade.percentage >= 60
              ? 1.0
              : 0;

          totalGradePoints += gradePoint * credits;
        }
      } catch (error) {
        console.error("Error calculating course grade:", error);
      }
    });

    return {
      gpa: totalGradePoints / totalCredits || 0,
      totalCredits,
    };
  };

  const stats = calculateStats();

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="flex justify-between items-center">
        <h1 className="header">My Semester (Spring 2025)</h1>
        <button
          onClick={() => {
            setEditCourse(null);
            setSelectedSlot(
              semesterCourses.length > 0
                ? Math.max(...semesterCourses.map((c) => Number(c.id))) + 1
                : 1
            );
            setIsModalOpen(true);
          }}
          className="px-4 py-2 bg-white text-black rounded-md hover:bg-white/80 transition-colors flex items-center gap-2"
        >
          <Plus size={16} />
          Add New Course
        </button>
      </div>

      <div className="flex gap-6 h-full">
        <div className="flex flex-col w-3/4 gap-4 h-full">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
            </div>
          ) : semesterCourses.length === 0 ? (
            <div className="dpcard h-full flex flex-col items-center justify-center text-white/50">
              <BookOpen size={48} strokeWidth={1} className="mb-4" />
              <p className="text-xl font-medium">No courses added yet</p>
              <p className="text-sm mt-2">
                Click the "Add New Course" button to get started
              </p>
            </div>
          ) : (
            semesterCourses.map((course) => (
              <div
                key={course.id}
                className="dpcard hover:bg-neutral-800 transition-colors duration-150 cursor-pointer flex justify-between"
                onClick={() => navigate(`/my-semester/${course.id}`)}
              >
                <div className="p-4 flex-1">
                  <h3 className="text-xl font-bold">{course.course.name}</h3>
                  <p className="text-sm text-neutral-400 mt-1 line-clamp-1">
                    {course.course.credits} credits |{" "}
                    {course.course.description?.substring(0, 100)}...
                  </p>
                </div>
                <div className="flex">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditCourse(course);
                    }}
                    className="p-2 text-white/50 hover:text-white hover:bg-neutral-700/50 transition-colors h-full"
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCourse(course.id!);
                    }}
                    className="p-2 text-white/50 hover:text-red-500 hover:bg-red-500/10 transition-colors h-full"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
            ))
          )}

          {!isLoading &&
            Array.from({ length: Math.max(0, 5 - semesterCourses.length) }).map(
              (_, i) => (
                <div
                  key={`empty-${i}`}
                  className="dpcard hover:bg-neutral-800 transition-colors duration-150 cursor-pointer flex items-center justify-center text-white/30"
                  onClick={() =>
                    handleCourseSlotClick(
                      semesterCourses.length > 0
                        ? Math.max(
                            ...semesterCourses.map((c) => Number(c.id))
                          ) +
                            i +
                            1
                        : i + 1
                    )
                  }
                >
                  <Plus size={24} className="mr-2" />
                  <span>Add Course</span>
                </div>
              )
            )}
        </div>

        <div className="dpcard w-1/4 flex flex-col p-6">
          <h2 className="text-xl font-bold mb-4">Semester Progress</h2>

          <div className="space-y-4">
            <div>
              <p className="text-neutral-400 text-sm">Total Courses</p>
              <p className="text-2xl font-bold">{semesterCourses.length}</p>
            </div>

            <div>
              <p className="text-neutral-400 text-sm">Total Credits</p>
              <p className="text-2xl font-bold">{stats.totalCredits}</p>
            </div>

            <div>
              <p className="text-neutral-400 text-sm">Current GPA</p>
              <p className="text-2xl font-bold">
                {stats.gpa <= 0 ? "N/A" : stats.gpa.toFixed(2)}
              </p>
            </div>

            <div className="pt-4 mt-2 border-t border-white/10">
              <p className="text-neutral-400 text-sm mb-2">Completion</p>
              <div className="w-full bg-neutral-700 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-green-500 h-full rounded-full"
                  style={{
                    width: `${Math.min(semesterCourses.length * 20, 100)}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <SemesterCourseModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedSlot(null);
          setEditCourse(null);
        }}
        onSave={handleSaveCourse}
        editData={editCourse}
      />
    </div>
  );
}
