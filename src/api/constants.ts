import coursesData from "../json/courses.json";

export const courses: Course[] = coursesData;

export const courseMap: Record<string, Course> = courses.reduce(
  (acc: any, course: any) => {
    acc[course.course] = course;
    return acc;
  },
  {} as Record<string, Course>
);

export const grades: Record<string, number> = {
  "A+": 4.0,
  A: 4.0,
  "A-": 3.7,
  "B+": 3.3,
  B: 3.0,
  "B-": 2.7,
  "C+": 2.3,
  C: 2.0,
  "C-": 1.7,
  "D+": 1.3,
  D: 1.0,
  "D-": 0.7,
  F: 0.0,
  P: 0.0,
  W: 0.0,
  I: 0.0,
};

export const GRADE_OPTIONS = Object.keys(grades).filter(
  (grade) => !["P", "W", "I"].includes(grade)
);

export const MAJORS = [
  "Computer Science",
  "Mathematics",
  "Engineering",
  "Biology",
  "Chemistry",
  "Physics",
  "Business",
  "Economics",
  "Psychology",
  "Sociology",
  "English",
  "History",
];

export const EMPHASES: Record<string, string[]> = {
  "Computer Science": [
    "Software Engineering",
    "Data Science",
    "Computer Security",
    "Artificial Intelligence",
    "Systems",
  ],
  Mathematics: [
    "Pure Mathematics",
    "Applied Mathematics",
    "Statistics",
    "Data Science",
  ],
  Engineering: [
    "Civil Engineering",
    "Mechanical Engineering",
    "Electrical Engineering",
    "Chemical Engineering",
  ],
};
