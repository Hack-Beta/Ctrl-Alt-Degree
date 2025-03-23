import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMockSemesterCourseAPI } from "../../api/semesterCourseAPI";

import SemesterCourseModal from "../../components/SemesterCourseModal";
import CategorySidebar from "../../components/semesterclass/CategorySidebar";
import CourseHeader from "../../components/semesterclass/CourseHeader";
import AssignmentList from "../../components/semesterclass/AssignmentList";
import StatsPanel from "../../components/semesterclass/StatsPanel";
import {
  calculateCategoryGrades,
  calculateOverallGrade,
} from "../../components/semesterclass/GradeUtils";

export default function SemesterClass() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedBtn, setSelectedBtn] = useState<
    "HW" | "Quiz" | "Midterm" | "Final"
  >("HW");
  const [courseData, setCourseData] = useState<SemesterCourse | null>(null);
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState<Assignments[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAddAssignment, setShowAddAssignment] = useState(false);
  const [categoryGrades, setCategoryGrades] = useState<
    Record<string, { earned: number; total: number; percentage: number }>
  >({
    HW: { earned: 0, total: 0, percentage: 0 },
    Quiz: { earned: 0, total: 0, percentage: 0 },
    Midterm: { earned: 0, total: 0, percentage: 0 },
    Final: { earned: 0, total: 0, percentage: 0 },
  });
  const [overallGrade, setOverallGrade] = useState({
    percentage: 0,
    letter: "N/A",
  });

  const semesterCourseAPI = useMockSemesterCourseAPI();

  useEffect(() => {
    async function loadCourseData() {
      if (!id) return;

      setLoading(true);
      try {
        const course = await semesterCourseAPI.getSemesterCourse(Number(id));
        if (course) {
          setCourseData(course);

          try {
            const parsedAssignments = JSON.parse(course.assignments || "[]");
            setAssignments(parsedAssignments);
          } catch (e) {
            console.error("Failed to parse assignments:", e);
            setAssignments([]);
          }
        }
      } catch (error) {
        console.error("Failed to load course data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadCourseData();
  }, [id]);

  useEffect(() => {
    if (!courseData || !courseData.weights || courseData.weights.length === 0)
      return;

    const categories = ["HW", "Quiz", "Midterm", "Final"] as const;
    const newCategoryGrades = calculateCategoryGrades(assignments, categories);
    setCategoryGrades(newCategoryGrades);

    const newOverallGrade = calculateOverallGrade(
      newCategoryGrades,
      courseData.weights[0]
    );
    setOverallGrade(newOverallGrade);
  }, [assignments, courseData]);

  const saveAssignments = async (updatedAssignments: Assignments[]) => {
    if (!courseData || !id) return;

    try {
      await semesterCourseAPI.updateSemesterCourse(Number(id), {
        ...courseData,
        assignments: JSON.stringify(updatedAssignments),
      });
    } catch (error) {
      console.error("Failed to save assignments:", error);
    }
  };

  const handleAddAssignment = (newAssignment: Partial<Assignments>) => {
    const updatedAssignments = [
      ...assignments,
      {
        ...newAssignment,
        type: selectedBtn,
      } as Assignments,
    ];

    setAssignments(updatedAssignments);
    saveAssignments(updatedAssignments);
    setShowAddAssignment(false);
  };

  const handleDeleteAssignment = (targetAssignment: Assignments) => {
    const updatedAssignments = assignments.filter(
      (assignment) =>
        !(
          assignment.name === targetAssignment.name &&
          assignment.dateCreated === targetAssignment.dateCreated &&
          assignment.type === targetAssignment.type
        )
    );

    setAssignments(updatedAssignments);
    saveAssignments(updatedAssignments);
  };

  const handleUpdateAssignment = (
    targetAssignment: Assignments,
    update: Partial<Assignments>
  ) => {
    const updatedAssignments = assignments.map((assignment) => {
      if (
        assignment.name === targetAssignment.name &&
        assignment.dateCreated === targetAssignment.dateCreated &&
        assignment.type === targetAssignment.type
      ) {
        return { ...assignment, ...update };
      }
      return assignment;
    });

    setAssignments(updatedAssignments);
    saveAssignments(updatedAssignments);
  };

  const handleUpdateStatus = (
    assignment: Assignments,
    status: Assignments["status"]
  ) => {
    handleUpdateAssignment(assignment, { status });
  };

  const handleUpdateCourse = async (courseData: Partial<SemesterCourse>) => {
    if (!id) return;

    try {
      const updatedCourse = await semesterCourseAPI.updateSemesterCourse(
        Number(id),
        {
          ...courseData,
          assignments: JSON.stringify(assignments),
        }
      );

      if (updatedCourse) {
        setCourseData(updatedCourse);
      }

      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to update course:", error);
    }
  };

  const handleDeleteCourse = async () => {
    if (!id || !window.confirm("Are you sure you want to delete this course?"))
      return;

    try {
      const success = await semesterCourseAPI.deleteSemesterCourse(Number(id));
      if (success) {
        navigate("/my-semester");
      }
    } catch (error) {
      console.error("Failed to delete course:", error);
    }
  };

  const filteredAssignments = assignments.filter(
    (assignment) =>
      assignment.type === selectedBtn &&
      (searchTerm === "" ||
        assignment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignment.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!courseData) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-xl mb-4">Course not found</p>
        <button
          onClick={() => navigate("/my-semester")}
          className="px-4 py-2 bg-white text-black rounded-md hover:bg-white/80 transition-colors flex items-center gap-2"
        >
          Back to My Semester
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col w-full gap-6 h-screen overflow-none">
        <CourseHeader
          courseData={courseData}
          onNavigateBack={() => navigate("/my-semester")}
          onEdit={() => setIsModalOpen(true)}
          onDelete={handleDeleteCourse}
        />

        <div className="flex gap-6 max-h-3/4">
          <CategorySidebar
            selectedCategory={selectedBtn}
            onSelectCategory={setSelectedBtn}
            categoryGrades={categoryGrades}
          />

          <AssignmentList
            selectedCategory={selectedBtn}
            courseData={courseData}
            filteredAssignments={filteredAssignments}
            categoryGrades={categoryGrades}
            searchTerm={searchTerm}
            showAddAssignment={showAddAssignment}
            onSearchChange={setSearchTerm}
            onShowAddAssignment={setShowAddAssignment}
            onAddAssignment={handleAddAssignment}
            onUpdateAssignment={handleUpdateAssignment}
            onDeleteAssignment={handleDeleteAssignment}
            onUpdateStatus={handleUpdateStatus}
          />

          <StatsPanel
            courseData={courseData}
            assignments={assignments}
            categoryGrades={categoryGrades}
            overallGrade={overallGrade}
          />
        </div>
      </div>

      <SemesterCourseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleUpdateCourse}
        editData={courseData}
      />
    </>
  );
}
