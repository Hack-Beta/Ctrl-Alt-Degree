import { X, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { courses, grades, GRADE_OPTIONS } from "../api/constants";

export default function CourseCard({
  index,
  course,
  courses: userCourses,
  setCourses,
  onDelete,
}: any) {
  const [searchTerm, setSearchTerm] = useState(course.name || "");
  const [filteredCourses, setFilteredCourses] = useState<any[]>([]);
  const [showCourseDropdown, setShowCourseDropdown] = useState(false);
  const [showGradeDropdown, setShowGradeDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const gradeDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchTerm) {
      if (!searchTerm.trim()) {
        setFilteredCourses([]);
        return;
      }

      const filtered = courses
        .filter((c) => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .slice(0, 5);

      setFilteredCourses(filtered);
    }
  }, [searchTerm]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowCourseDropdown(false);
      }
      if (
        gradeDropdownRef.current &&
        !gradeDropdownRef.current.contains(event.target as Node)
      ) {
        setShowGradeDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelectCourse = (selectedCourse: any) => {
    const updatedCourses = [...userCourses];
    updatedCourses[index] = {
      ...updatedCourses[index],
      name: selectedCourse.name,
      credits: selectedCourse.credits,
    };
    setCourses(updatedCourses);
    setSearchTerm(selectedCourse.name);
    setShowCourseDropdown(false);
  };

  const handleSelectGrade = (selectedGrade: string) => {
    const updatedCourses = [...userCourses];
    updatedCourses[index] = {
      ...updatedCourses[index],
      grade: selectedGrade,
      gradeValue: grades[selectedGrade],
    };
    setCourses(updatedCourses);
    setShowGradeDropdown(false);
  };

  return (
    <div
      key={index}
      className="flex gap-4 bg-neutral-900/30 py-3 items-center justify-between rounded-md border border-white/10"
    >
      <div>
        <button
          onClick={() => {
            onDelete(index);
          }}
          className="text-white hover:text-red-500 p-2 rounded-full ml-3 hover:bg-red-500/20 duration-150 border border-transparent hover:border-red-500 transition-colors"
        >
          <X />
        </button>
      </div>

      <div className="relative w-1/2" ref={dropdownRef}>
        <input
          type="text"
          value={searchTerm}
          placeholder="Course Name"
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowCourseDropdown(true);
          }}
          onFocus={() => setShowCourseDropdown(true)}
          className="px-3 py-2 w-full bg-neutral-700 border border-white/20 rounded-md focus:outline-none focus:ring-2 focus:ring-white/50"
        />

        {showCourseDropdown && filteredCourses.length > 0 && (
          <div className="absolute z-10 mt-1 w-full bg-neutral-800 border border-white/20 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {filteredCourses.map((c, i) => (
              <div
                key={i}
                className="px-3 py-2 hover:bg-neutral-700 cursor-pointer"
                onClick={() => handleSelectCourse(c)}
              >
                <div className="font-medium">{c.name}</div>
                <div className="text-xs text-gray-400">{c.credits} credits</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="relative" ref={gradeDropdownRef}>
        <button
          type="button"
          onClick={() => setShowGradeDropdown(!showGradeDropdown)}
          className="px-3 py-2 bg-neutral-700 border border-white/20 rounded-md focus:outline-none focus:ring-2 focus:ring-white/50 flex items-center justify-between min-w-[100px]"
        >
          {course.grade || "Grade"}
          <ChevronDown size={16} />
        </button>

        {showGradeDropdown && (
          <div className="absolute z-10 mt-1 w-full bg-neutral-800 border border-white/20 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {GRADE_OPTIONS.map((grade) => (
              <div
                key={grade}
                className="px-3 py-2 hover:bg-neutral-700 cursor-pointer"
                onClick={() => handleSelectGrade(grades[grade].toFixed(1))}
              >
                {grade} ({grades[grade].toFixed(1)})
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="px-3 py-2 bg-neutral-700 border border-white/20 rounded-md min-w-[100px] text-center mr-5">
        {course.credits || "0"} credits
      </div>
    </div>
  );
}
