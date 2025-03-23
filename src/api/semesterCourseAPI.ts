const API_URL = "http://localhost:5000/api";

export const getSemesterCourses = async (
  userId: string
): Promise<SemesterCourse[]> => {
  try {
    const response = await fetch(
      `${API_URL}/semester-courses?userId=${userId}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch semester courses");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching semester courses:", error);
    return [];
  }
};

export const getSemesterCourse = async (
  courseId: string | number
): Promise<SemesterCourse | null> => {
  try {
    const response = await fetch(`${API_URL}/semester-courses/${courseId}`);
    if (!response.ok) {
      throw new Error("Failed to fetch semester course");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching semester course:", error);
    return null;
  }
};

export const createSemesterCourse = async (
  courseData: Partial<SemesterCourse>,
  userId: string
): Promise<SemesterCourse | null> => {
  try {
    const response = await fetch(`${API_URL}/semester-courses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...courseData, userId }),
    });
    if (!response.ok) {
      throw new Error("Failed to create semester course");
    }
    return await response.json();
  } catch (error) {
    console.error("Error creating semester course:", error);
    return null;
  }
};

export const updateSemesterCourse = async (
  courseId: string | number,
  courseData: Partial<SemesterCourse>
): Promise<SemesterCourse | null> => {
  try {
    const response = await fetch(`${API_URL}/semester-courses/${courseId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(courseData),
    });
    if (!response.ok) {
      throw new Error("Failed to update semester course");
    }
    return await response.json();
  } catch (error) {
    console.error("Error updating semester course:", error);
    return null;
  }
};

export const deleteSemesterCourse = async (
  courseId: string | number
): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/semester-courses/${courseId}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error("Failed to delete semester course");
    }
    return true;
  } catch (error) {
    console.error("Error deleting semester course:", error);
    return false;
  }
};

export const useMockSemesterCourseAPI = () => {
  const STORAGE_KEY = "semester_courses";

  const getSemesterCoursesLocal = (): SemesterCourse[] => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  };

  const saveSemesterCoursesLocal = (courses: SemesterCourse[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(courses));
  };

  return {
    getSemesterCourses: () => Promise.resolve(getSemesterCoursesLocal()),

    getSemesterCourse: (id: string | number) => {
      const courses = getSemesterCoursesLocal();
      const course = courses.find((c) => c.id === id);
      return Promise.resolve(course || null);
    },

    createSemesterCourse: (courseData: Partial<SemesterCourse>) => {
      const courses = getSemesterCoursesLocal();
      const newCourse = {
        ...courseData,
        id: Date.now(),
        assignments: courseData.assignments || "[]",
      } as SemesterCourse;
      courses.push(newCourse);
      saveSemesterCoursesLocal(courses);
      return Promise.resolve(newCourse);
    },

    updateSemesterCourse: (
      id: string | number,
      courseData: Partial<SemesterCourse>
    ) => {
      const courses = getSemesterCoursesLocal();
      const index = courses.findIndex((c) => c.id === id);
      if (index >= 0) {
        courses[index] = { ...courses[index], ...courseData };
        saveSemesterCoursesLocal(courses);
        return Promise.resolve(courses[index]);
      }
      return Promise.resolve(null);
    },

    deleteSemesterCourse: (id: string | number) => {
      const courses = getSemesterCoursesLocal();
      const filteredCourses = courses.filter((c) => c.id !== id);
      saveSemesterCoursesLocal(filteredCourses);
      return Promise.resolve(true);
    },
  };
};
