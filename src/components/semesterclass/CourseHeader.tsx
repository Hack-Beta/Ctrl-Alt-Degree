import { ChevronLeft, Edit, Trash2 } from "lucide-react";

interface CourseHeaderProps {
  courseData: SemesterCourse;
  onNavigateBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function CourseHeader({
  courseData,
  onNavigateBack,
  onEdit,
  onDelete,
}: CourseHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-3">
        <button
          onClick={onNavigateBack}
          className="p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <ChevronLeft />
        </button>
        <div className="flex gap-3">
          <h1 className="text-3xl font-bold text-wrap leading-none line-clamp-2">
            {courseData.course.name}{" "}
            <span className="text-neutral-300 text-base font-normal leading-none">
              {" "}
              {courseData.course.description}
            </span>
          </h1>
        </div>
      </div>

      <div className="flex flex-col items-center gap-3">
        <button
          onClick={onEdit}
          className="px-3 py-2 rounded-md hover:bg-white/10 transition-colors flex items-center gap-2"
        >
          <Edit size={16} />
          Edit
        </button>
        <button
          onClick={onDelete}
          className="px-3 py-2 rounded-md hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors flex items-center gap-2"
        >
          <Trash2 size={16} />
          Delete
        </button>
      </div>
    </div>
  );
}
