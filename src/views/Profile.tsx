import { useState, useEffect } from "react";
import { getUserData, saveUserData } from "../api/userAPI";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user } = useAuth();

  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [major, setMajor] = useState<string | null>(null);
  const [emphasis, setEmphasis] = useState<string | null>(null);
  const [gpa, setGpa] = useState(0);
  const [creditsCompleted, setCreditsCompleted] = useState(0);
  const [currentSemester, setCurrentSemester] = useState(1);
  const [profilePhoto, setProfilePhoto] = useState("/default-profile.jpg");

  const [updating, setUpdating] = useState(false);
  const [academicDataLoaded, setAcademicDataLoaded] = useState(false);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");

      const fetchAcademicData = async () => {
        try {
          const userData = await getUserData(user.id.toString());
          setMajor(userData.major || null);
          setEmphasis(userData.emphasis || null);
          setGpa(userData.gpa || 0);
          setCreditsCompleted(userData.credits_completed || 0);
          setCurrentSemester(userData.current_semester || 1);
          setProfilePhoto(userData.profile_photo || "/default-profile.jpg");
          setAcademicDataLoaded(true);
        } catch (error) {
          console.error("Failed to load academic data:", error);
          setAcademicDataLoaded(true);
        }
      };

      fetchAcademicData();
    }
  }, [user]);

  if (!user || !academicDataLoaded) {
    return <div>Loading...</div>;
  }

  const handleStartEdit = () => {
    setFirstName(user.firstName || "");
    setLastName(user.lastName || "");
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
  };

  const handleSave = async () => {
    if (!user) return;

    setUpdating(true);
    try {
      await saveUserData({
        id: user.id,
        firstName,
        lastName,
        major,
        emphasis,
        gpa,
        credits_completed: creditsCompleted,
        current_semester: currentSemester,
        profile_photo: profilePhoto,
      });

      setEditing(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="header">Your Profile</h1>
        {!editing ? (
          <button
            onClick={handleStartEdit}
            className="px-4 py-2 bg-white/80 text-black rounded-md hover:bg-black/80 hover:text-white duration-150"
          >
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-neutral-800 text-white rounded-md hover:bg-neutral-700 duration-150"
              disabled={updating}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-white/80 text-black rounded-md hover:bg-white duration-150"
              disabled={updating}
            >
              {updating ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}
      </div>

      <div className="flex gap-6 justify-between items-center">
        <div className="size-64 rounded-full bg-neutral-700 border-2 border-white/60 shadow-md overflow-hidden">
          <img
            src={`${profilePhoto}`}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex flex-col w-3/4 gap-3 p-6 bg-neutral-800/50 rounded-xl border border-white/20">
          <h2 className="text-xl font-semibold text-white/90 pb-2 border-b border-white/10">
            Personal Information
          </h2>

          {editing ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={user.email || ""}
                  disabled
                  className="w-full px-3 py-2 bg-neutral-700/50 border border-neutral-600 rounded-md text-neutral-400"
                />
                <p className="text-xs text-neutral-500 mt-1">
                  Email cannot be changed here
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">
                  Profile Photo URL
                </label>
                <input
                  type="text"
                  value={profilePhoto}
                  onChange={(e) => setProfilePhoto(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-white/50"
                  placeholder="URL to your profile photo"
                />
                <p className="text-xs text-neutral-500 mt-1">
                  Enter the URL of an image to use as your profile picture
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <span className="text-neutral-400">First Name</span>
                <span>{user.firstName}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <span className="text-neutral-400">Last Name</span>
                <span>{user.lastName}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <span className="text-neutral-400">Email</span>
                <span>{user.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-400">Profile Photo</span>
                <span className="text-sm text-neutral-500 break-all max-w-[60%] text-right">
                  {profilePhoto}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3 p-6 bg-neutral-800/50 rounded-xl border border-white/20">
        <h2 className="text-xl font-semibold text-white/90 pb-2 border-b border-white/10">
          Academic Information
        </h2>

        {editing ? (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">
                  Major
                </label>
                <input
                  type="text"
                  value={major || ""}
                  onChange={(e) => setMajor(e.target.value || null)}
                  className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-white/50"
                  placeholder="Your major"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">
                  Emphasis
                </label>
                <input
                  type="text"
                  value={emphasis || ""}
                  onChange={(e) => setEmphasis(e.target.value || null)}
                  className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-white/50"
                  placeholder="Your emphasis"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">
                  GPA
                </label>
                <input
                  type="number"
                  min="0"
                  max="4.0"
                  step="0.1"
                  value={gpa}
                  onChange={(e) => setGpa(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-white/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">
                  Credits Completed
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={creditsCompleted}
                  onChange={(e) =>
                    setCreditsCompleted(parseInt(e.target.value) || 0)
                  }
                  className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-white/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">
                  Current Semester
                </label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  step="1"
                  value={currentSemester}
                  onChange={(e) =>
                    setCurrentSemester(parseInt(e.target.value) || 1)
                  }
                  className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-white/50"
                />
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <span className="text-neutral-400">Major</span>
              <span>{major || "Not set"}</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <span className="text-neutral-400">Emphasis</span>
              <span>{emphasis || "Not set"}</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <span className="text-neutral-400">GPA</span>
              <span>{gpa.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <span className="text-neutral-400">Credits Completed</span>
              <span>{creditsCompleted}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-400">Current Semester</span>
              <span>{currentSemester}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
