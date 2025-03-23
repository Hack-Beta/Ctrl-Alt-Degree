import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getUserData } from "../api/userAPI";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const [userMajor, setUserMajor] = useState<string | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<string>(
    "/default-profile.jpg"
  );

  useEffect(() => {
    if (user) {
      const fetchUserData = async () => {
        try {
          const data = await getUserData(user.id.toString());
          if (data.major) {
            setUserMajor(data.major);
          }
          if (data.profile_photo) {
            setProfilePhoto(data.profile_photo);
          }
        } catch (error) {
          console.error("Failed to load user data in sidebar:", error);
        }
      };

      fetchUserData();
    }
  }, [user]);

  const handleSignOut = () => {
    logout();
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="sidebar flex-none overflow-clip">
      <div className="flex flex-col w-full text-xl">
        <Link to="/" className="btn py-4">
          Home
        </Link>
        <Link to="/virtual-advisor" className="btn">
          Virtual Advisor
        </Link>
        <Link to="/degree-progress" className="btn">
          Degree Progress
        </Link>
        <Link to="/my-semester" className="btn">
          My Semester
        </Link>
      </div>
      <div className="flex flex-col w-full mt-auto text-xl">
        <Link to="/settings" className="btn">
          Settings
        </Link>
        <button onClick={handleSignOut} className="btn text-left">
          Sign Out
        </button>
        <Link
          to="/profile"
          className="btn flex gap-4 items-center tracking-normal pb-5 pt-5"
        >
          <img
            src={profilePhoto} // Use the profile photo from state
            className="size-12 rounded-full object-cover"
            alt="Profile"
          />
          <div className="flex flex-col text-sm leading-none gap-2">
            <strong className="text-white/80">
              {user.firstName} {user.lastName}
            </strong>
            <p>{user.email}</p>
            {userMajor && <p className="text-white/60">{userMajor}</p>}
          </div>
        </Link>
      </div>
    </div>
  );
}
