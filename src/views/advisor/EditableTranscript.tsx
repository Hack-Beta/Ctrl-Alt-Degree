import { useState, useEffect } from "react";
import { getUserData, saveUserData } from "../../api/userAPI";
import CourseCard from "../../components/CourseCard";
import { useAuth } from "../../context/AuthContext";

export default function EditableTranscript() {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [userData, setUserData] = useState<User | null>(null);
  const [transcriptData, setTranscriptData] = useState<Transcript | null>(null);
  const [originalCourses, setOriginalCourses] = useState<Course[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    major: "",
    emphasis: "",
    currentSemester: 1,
    gpa: 0,
  });

  const generateId = () =>
    `course_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        try {
          const data = await getUserData(user.id.toString());
          setUserData(data);

          if (data.transcript) {
            try {
              const transcript =
                typeof data.transcript === "string"
                  ? JSON.parse(data.transcript)
                  : data.transcript;

              setTranscriptData(transcript);

              if (transcript.courses && Array.isArray(transcript.courses)) {
                setCourses(transcript.courses);
              }

              setFormData({
                major: data.major || "Computer Science",
                emphasis: data.emphasis || "Data Science",
                currentSemester: data.current_semester || 1,
                gpa: data.gpa || 0.0,
              });
            } catch (e) {
              console.error("Error parsing transcript:", e);
            }
          }
        } catch (error) {
          console.error("Failed to fetch user data:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      let totalGrade = 0;
      let totalCredits = 0;
      let validCourses = 0;

      courses.forEach((course) => {
        if (course.grade && course.credits) {
          totalGrade += parseFloat(course.grade);
          totalCredits += parseFloat(course.credits);
          validCourses++;
        }
      });

      const calculatedGpa = validCourses > 0 ? totalGrade / validCourses : 0;

      const updatedTranscript = {
        major: formData.major,
        emphasis: formData.emphasis,
        currentSemester: formData.currentSemester,
        courses: courses,
      };

      await saveUserData({
        id: user.id,
        email: user.email,
        major: formData.major,
        emphasis: formData.emphasis,
        current_semester: formData.currentSemester,
        credits_completed: totalCredits,
        gpa: calculatedGpa,
        transcript: JSON.stringify(updatedTranscript),
      });

      setFormData({
        ...formData,
        gpa: calculatedGpa,
      });

      setEditing(false);
    } catch (error) {
      console.error("Failed to save transcript:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCourse = (indexToDelete: number) => {
    const updatedCourses = courses
      .filter((_, i) => i !== indexToDelete)
      .map((course) => ({
        ...course,
        id: course.id || generateId(),
      }));

    setCourses(updatedCourses);
  };

  if (loading) {
    return <div className="p-4 text-center">Loading transcript data...</div>;
  }

  return (
    <div className="bg-neutral-800/60 rounded-xl border border-white/20 p-4 h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Your Transcript</h2>
        {!editing ? (
          <button
            onClick={() => {
              setOriginalCourses(JSON.parse(JSON.stringify(courses)));
              setEditing(true);
            }}
            className="px-3 py-1 bg-neutral-700 hover:bg-neutral-600 rounded-md text-sm"
          >
            Edit
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => {
                setEditing(false);
                setCourses(originalCourses);
              }}
              className="px-3 py-1 bg-neutral-700 hover:bg-neutral-600 rounded-md text-sm"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-1 bg-white text-black hover:bg-neutral-200 rounded-md text-sm"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        )}
      </div>

      <div className="mb-4 pb-4 border-b border-white/10">
        <h3 className="text-lg font-medium mb-2">Student Information</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-neutral-400">Name</label>
            <div className="text-white">
              {user ? `${user.firstName} ${user.lastName}` : ""}
            </div>
          </div>

          <div>
            <label className="block text-sm text-neutral-400">
              Current Semester
            </label>
            {editing ? (
              <select
                value={formData.currentSemester}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    currentSemester: parseInt(e.target.value),
                  })
                }
                className="w-full px-2 py-1 bg-neutral-700 border border-white/20 rounded"
              >
                <option value={1}>Freshman | Fall</option>
                <option value={2}>Freshman | Spring</option>
                <option value={3}>Sophomore | Fall</option>
                <option value={4}>Sophomore | Spring</option>
                <option value={5}>Junior | Fall</option>
                <option value={6}>Junior | Spring</option>
                <option value={7}>Senior | Fall</option>
                <option value={8}>Senior | Spring</option>
              </select>
            ) : (
              <div className="text-white">
                {formData.currentSemester === 1
                  ? "Freshman | Fall"
                  : formData.currentSemester === 2
                  ? "Freshman | Spring"
                  : formData.currentSemester === 3
                  ? "Sophomore | Fall"
                  : formData.currentSemester === 4
                  ? "Sophomore | Spring"
                  : formData.currentSemester === 5
                  ? "Junior | Fall"
                  : formData.currentSemester === 6
                  ? "Junior | Spring"
                  : formData.currentSemester === 7
                  ? "Senior | Fall"
                  : "Senior | Spring"}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm text-neutral-400">GPA</label>
            <div className="text-white">{formData.gpa.toFixed(2)}</div>
          </div>

          <div>
            <label className="block text-sm text-neutral-400">Major</label>
            {editing ? (
              <input
                type="text"
                value={formData.major}
                onChange={(e) =>
                  setFormData({ ...formData, major: e.target.value })
                }
                className="w-full px-2 py-1 bg-neutral-700 border border-white/20 rounded"
              />
            ) : (
              <div className="text-white">{formData.major || "N/A"}</div>
            )}
          </div>

          <div>
            <label className="block text-sm text-neutral-400">Emphasis</label>
            {editing ? (
              <input
                type="text"
                value={formData.emphasis}
                onChange={(e) =>
                  setFormData({ ...formData, emphasis: e.target.value })
                }
                className="w-full px-2 py-1 bg-neutral-700 border border-white/20 rounded"
              />
            ) : (
              <div className="text-white">{formData.emphasis || "N/A"}</div>
            )}
          </div>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-medium">Courses</h3>
          <div className="flex gap-1">
            {editing && (
              <button
                onClick={() =>
                  setCourses([
                    { id: generateId(), name: "", grade: "", credits: "" },
                    ...courses,
                  ])
                }
                className="px-2 py-1 bg-neutral-700 hover:bg-neutral-600 rounded text-sm"
              >
                Add Course
              </button>
            )}
            <button
              onClick={() => {
                const reversedCourses = [...courses]
                  .reverse()
                  .map((course) => ({
                    ...course,
                    id: course.id || generateId(),
                  }));
                setCourses(reversedCourses);
              }}
              className="px-3 py-1 bg-neutral-700 hover:bg-neutral-600 rounded-md text-sm"
            >
              Flip
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {courses.length > 0 ? (
            editing ? (
              courses.map((course, index) => (
                <CourseCard
                  key={course.id || `index_${index}`}
                  index={index}
                  course={course}
                  courses={courses}
                  setCourses={setCourses}
                  onDelete={() => handleDeleteCourse(index)}
                />
              ))
            ) : (
              courses.map((course, index) => (
                <div
                  key={course.id || `index_${index}`}
                  className="bg-neutral-700/50 rounded p-2 flex justify-between"
                >
                  <div className="w-1/2">{course.name || "No name"}</div>
                  <div className="w-1/4 text-center">
                    {course.grade || "N/A"}
                  </div>
                  <div className="w-1/4 text-right">
                    {course.credits || "0"} credits
                  </div>
                </div>
              ))
            )
          ) : (
            <div className="text-neutral-400 text-center py-4">
              No courses added yet.
              {editing && " Click 'Add Course' to get started."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
