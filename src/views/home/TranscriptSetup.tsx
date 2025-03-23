import { useEffect, useState } from "react";
import { saveUserData } from "../../api/userAPI";
import CourseCard from "../../components/CourseCard";
import { useAuth } from "../../context/AuthContext";

export default function TranscriptSetup() {
  const { user } = useAuth();

  const [updating, setUpdating] = useState(false);
  const [transcriptData, setTranscriptData] = useState<Transcript>({
    major: "Computer Science",
    emphasis: "Data Science",
    currentSemester: 1,
  });
  const [courses, setCourses] = useState<Course[]>([]);

  const handleSave = async () => {
    if (!user) return;

    setUpdating(true);
    try {
      let gpa = 0.0;
      let credits = 0.0;
      courses.map((course) => {
        gpa += parseFloat(course.grade || "");
        credits += parseFloat(course.credits);
      });
      let avgGpa = gpa / courses.length;

      const finalTranscript = {
        ...transcriptData,
        courses,
      };

      await saveUserData({
        id: user.id,
        email: user.email,
        major: transcriptData.major,
        emphasis: transcriptData.emphasis || "",
        current_semester: transcriptData.currentSemester || 0,
        credits_completed: credits,
        gpa: avgGpa,
        transcript: JSON.stringify(finalTranscript),
      });
    } catch (error) {
      console.error("Failed to save transcript:", error);
    } finally {
      setUpdating(false);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex w-full gap-6">
        <div className="w-full">
          <label className="block text-sm font-medium text-neutral-300 mb-1">
            Major
          </label>
          <input
            type="text"
            value={transcriptData.major}
            disabled
            onChange={(e) =>
              setTranscriptData({ ...transcriptData, major: e.target.value })
            }
            className="select-none w-full px-3 py-2 bg-neutral-700/50 border border-white/20 rounded-md focus:outline-none focus:ring-2 focus:ring-white/50"
          />
        </div>
        <div className="w-full">
          <label className="block text-sm font-medium text-neutral-300 mb-1">
            emphasis
          </label>
          <select
            value={transcriptData.emphasis}
            onChange={(e) =>
              setTranscriptData({ ...transcriptData, emphasis: e.target.value })
            }
            className="w-full px-3 py-2 bg-neutral-700/50 border border-white/20 rounded-md focus:outline-none focus:ring-2 focus:ring-white/50"
          >
            <option value="Data Science">Data Science</option>
            <option value="Computer Security">Computer Security</option>
          </select>
        </div>
        <div className="w-full">
          <label className="block text-sm font-medium text-neutral-300 mb-1">
            Current Semester
          </label>
          <select
            value={transcriptData.currentSemester}
            onChange={(e) =>
              setTranscriptData({
                ...transcriptData,
                currentSemester: parseInt(e.target.value),
              })
            }
            className="w-full px-3 py-2 bg-neutral-700/50 border border-white/20 rounded-md focus:outline-none focus:ring-2 focus:ring-white/50"
          >
            <option value="1">Freshman | Fall</option>
            <option value="2">Freshman | Spring</option>
            <option value="3">Sophomore | Fall</option>
            <option value="4">Sophomore | Spring</option>
            <option value="5">Junior | Fall</option>
            <option value="6">Junior | Spring</option>
            <option value="7">Senior | Fall</option>
            <option value="8">Senior | Spring</option>
          </select>
        </div>
        <button
          onClick={handleSave}
          disabled={updating}
          className="px-4 py-2 bg-white text-black h-fit mt-auto rounded-md"
        >
          {updating ? "Saving..." : "Save"}
        </button>
      </div>
      <div className="bg-neutral-800 p-4 rounded-md flex flex-col gap-4 border border-white/20">
        <h1>Add any completed courses here</h1>
        {courses.map((course, index) => (
          <CourseCard
            key={index}
            index={index}
            course={course}
            courses={courses}
            setCourses={setCourses}
          />
        ))}
        <button
          className="bg-neutral-900/50 w-full py-2 rounded-md border border-white/20 hover:bg-neutral-900 duration-150"
          onClick={() =>
            setCourses([...courses, { name: "", grade: "", credits: "" }])
          }
        >
          Add new
        </button>
      </div>
    </div>
  );
}
