import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import NoiseEffect from "./components/NoiseEffect"; // Import the new component

import Home from "./views/home/Home";
import VirtualAdvisor from "./views/advisor/VirtualAdvisor";
import DegreeProgress from "./views/degree/DegreeProgress";
import MySemester from "./views/semester/MySemester";
import Profile from "./views/Profile";
import Sidebar from "./components/Sidebar";
import Settings from "./views/Settings";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";

import ProtectedRoute from "./components/ProtectedRoute";
import TranscriptSetup from "./views/home/TranscriptSetup";
import SemesterClass from "./views/semester/SemesterClass";

function Layout(props: any) {
  const { children } = props;

  return (
    <div className="font-display flex antialiased text-white tracking-tight h-screen max-h-screen overflow-hidden">
      <Sidebar />
      <div className="p-8 w-10/12 h-screen">{children}</div>
    </div>
  );
}

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/sign-in"
        element={isAuthenticated ? <Navigate to="/" /> : <SignIn />}
      />
      <Route
        path="/sign-up"
        element={isAuthenticated ? <Navigate to="/" /> : <SignUp />}
      />

      <Route element={<ProtectedRoute />}>
        <Route
          path="/"
          element={
            <Layout>
              <Home />
            </Layout>
          }
        />
        <Route
          path="/transcript-setup"
          element={
            <Layout>
              <TranscriptSetup />
            </Layout>
          }
        />
        <Route
          path="/virtual-advisor"
          element={
            <Layout>
              <VirtualAdvisor />
            </Layout>
          }
        />
        <Route
          path="/degree-progress"
          element={
            <Layout>
              <DegreeProgress />
            </Layout>
          }
        />
        <Route
          path="/my-semester"
          element={
            <Layout>
              <MySemester />
            </Layout>
          }
        />
        <Route
          path="/my-semester/:id"
          element={
            <Layout>
              <SemesterClass />
            </Layout>
          }
        />
        <Route
          path="/profile"
          element={
            <Layout>
              <Profile />
            </Layout>
          }
        />
        <Route
          path="/settings"
          element={
            <Layout>
              <Settings />
            </Layout>
          }
        />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <NoiseEffect opacity={0.035} />{" "}
        {/* Removed speed prop since we're using static noise */}
        <AppContent />
      </AuthProvider>
    </Router>
  );
}
