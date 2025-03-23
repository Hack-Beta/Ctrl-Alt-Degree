interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  major?: string;
  emphasis?: string;
  gpa?: number;
  credits_completed?: number;
  current_semester?: number;
  transcript?: string;
  profile_photo?: string;
}

interface Transcript {
  id?: number;
  major: string;
  emphasis?: string;
  gpa?: number;
  credits?: number;
  currentSemester?: number;
  courses?: string[] | Course[];
}

interface Course {
  id?: number | string;
  name: string;
  grade?: string;
  credits: string;
  description?: string;
  prerequisites?: string[];
}

interface SemesterCourse {
  id?: number;
  course: Course;
  weights: Record<"HW" | "Quiz" | "Midterm" | "Final", number>[];
  assignments: string;
}

interface Assignments {
  type: "HW" | "Quiz" | "Midterm" | "Final";
  grade: number;
  points: number;
  dueDate: string;
  status: "nothing" | "started" | "submitted" | "late";
  name: string;
  description: string;
  dateCreated: string;
}

interface Profile {
  id: number;
  name: string;
  email: string;
  bio: string;
  dateOfBirth: string;
  profilePicture: string;
  major: string;
  emphasis: string;
  transcript?: Transcript[];
}
