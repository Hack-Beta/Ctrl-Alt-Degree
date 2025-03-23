import { useState, useEffect } from "react";
import { getUserData } from "../../api/userAPI";
import { useAuth } from "../../context/AuthContext";

export default function DegreeProgress() {
  const { user } = useAuth();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchUserData = async () => {
        try {
          const data = await getUserData(user.id.toString());
          setUserData(data);
        } catch (error) {
          console.error("Failed to load user data:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchUserData();
    }
  }, [user]);

  if (loading) {
    return <div>Loading...</div>;
  }

  const progressPercentage =
    userData.credits_completed > 0
      ? Math.round((userData.credits_completed / 120) * 100)
      : 0;

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="dpcard py-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">
              {user ? `${user.firstName} ${user.lastName}` : ""}
            </h2>
            <p className="text-neutral-400">
              {userData.major || "No major selected"}{" "}
              {userData.emphasis ? `- ${userData.emphasis}` : ""}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold">GPA: {userData.gpa.toFixed(2)}</p>
            <p className="text-neutral-400">
              Semester {userData.current_semester}
            </p>
          </div>
        </div>
      </div>

      <div className="dpcard py-6">
        <h3 className="text-lg font-semibold mb-3">Degree Progress</h3>
        <div className="w-full bg-neutral-700 rounded-full h-4">
          <div
            className="bg-white h-4 rounded-full"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-2">
          <span>{userData.credits_completed} credits completed</span>
          <span>{progressPercentage}% complete</span>
        </div>
      </div>

      <div className="flex gap-6 w-full flex-grow h-full">
        <div className="dpcard w-2/3 h-full">
          <h3 className="text-lg font-semibold mb-3">Recommendations</h3>
          {userData.major ? (
            <div>
              <p className="mb-2">
                Based on your {userData.major} major
                {userData.emphasis ? ` with ${userData.emphasis} emphasis` : ""}
                , we recommend:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Complete core requirements for {userData.major}</li>
                <li>Consider taking advanced courses in your field</li>
                <li>Meet with your academic advisor to plan next semester</li>
              </ul>
            </div>
          ) : (
            <p>
              Please select a major in your profile to get personalized
              recommendations.
            </p>
          )}
        </div>

        <div className="dpcard w-1/3 h-full">
          <h3 className="text-lg font-semibold mb-3">Academic Standing</h3>
          <div className="h-full flex flex-col justify-evenly items-center">
            <div className="relative w-40 h-40">
              <svg viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="transparent"
                  stroke="#444"
                  strokeWidth="10"
                />

                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="transparent"
                  stroke={
                    userData.gpa >= 3.0
                      ? "#10b981"
                      : userData.gpa >= 2.0
                      ? "#f59e0b"
                      : "#ef4444"
                  }
                  strokeWidth="10"
                  strokeDasharray={`${(userData.gpa / 4) * 283} 283`}
                  strokeLinecap="round"
                  transform="rotate(-90 50 50)"
                />
                <text
                  x="50"
                  y="45"
                  textAnchor="middle"
                  fontSize="18"
                  fontWeight="bold"
                  fill="white"
                >
                  {userData.gpa.toFixed(2)}
                </text>
                <text
                  x="50"
                  y="65"
                  textAnchor="middle"
                  fontSize="12"
                  fill="#a3a3a3"
                >
                  GPA
                </text>
              </svg>
            </div>

            {/* Status with emoji */}
            <div className="text-center mt-4 w-full">
              <p className="text-sm text-neutral-400 mb-2">Status</p>
              <div
                className="text-2xl font-bold py-3 px-4 rounded-lg"
                style={{
                  background:
                    userData.gpa >= 3.5
                      ? "linear-gradient(to right, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.05))"
                      : userData.gpa >= 2.0
                      ? "linear-gradient(to right, rgba(245, 158, 11, 0.2), rgba(245, 158, 11, 0.05))"
                      : "linear-gradient(to right, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.05))",
                }}
              >
                {userData.gpa >= 3.5 ? (
                  <>🏆 Dean's List</>
                ) : userData.gpa >= 2.0 ? (
                  <>👍 Good Standing</>
                ) : (
                  <>⚠️ Academic Probation</>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
