import { useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";

import SignupForm from "../components/features/Auth/Signup";
import NotFoundPage from "../components/layout/Notfound";
import HomePage from "../containers/Home";
import { LoginPage } from "../components/features/Auth/Login";
import ProfilePage from "../containers/profile";
import UpdateProfilePage from "../containers/profile/UpdateProfile";
import UpdatePostPage from "../containers/post/UpdatePost";
import PostDeepLink from "../containers/post/PostDeepLink";
import MessagesPage from "../containers/Message";
import ExplorePage from "../containers/Explore";
import ActivityPage from "../containers/activity";
import YourActivityPage from "../containers/your-activity";
import Navbar from "../components/layout/Navbar";
import PrivateRoute from "./ProtectedRoutes";
import AdminDashboard from "../containers/Admin";
import ManagerDashboard from "../containers/Manager";
import GalleryPage from "../containers/Gallery";
import FileRequestsPage from "../containers/FileRequests";
import LandingPage from "../containers/LandingPage";
import { useAppSelector } from "../redux/hooks";
import SettingsPage from "../components/features/Settings/Settings";
import LeftSidebar from "../containers/Home/LeftSidebar";

const RootPage = () => {
  const { isAuthenticated } = useAppSelector((state: any) => state.auth);
  return isAuthenticated ? <HomePage /> : <LandingPage />;
};

const Approutes = () => {
  const location = useLocation();
  const { isAuthenticated, user } = useAppSelector((state: any) => state.auth);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Routes where the sidebar should NOT appear
  const noSidebarRoutes = ["/login", "/signup"];
  const isLandingRoute = location.pathname === "/" && !isAuthenticated;
  const isNoSidebarRoute =
    noSidebarRoutes.includes(location.pathname) || isLandingRoute;

  // Show sidebar on all authenticated routes except auth pages
  const showSidebar = isAuthenticated && !isNoSidebarRoute;

  return (
    <div>
      {!isLandingRoute && <Navbar />}

      {/* Sidebar — fixed, always visible on authenticated pages */}
      {/* Shows role-specific nav items on /admin and /manager */}
      {showSidebar && (
        <LeftSidebar
          isAuthenticated={isAuthenticated}
          isCollapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((prev) => !prev)}
          userRole={user?.role}
        />
      )}

      {/* Page content — offset by sidebar width when sidebar is visible */}
      <div
        className={
          showSidebar
            ? `transition-all duration-300 ease-in-out mb-16 md:${
                sidebarCollapsed ? "ml-16" : "ml-64"
              }`
            : ""
        }
      >
        <Routes>
          {/* PUBLIC ROUTES */}
          <Route path="/" element={<RootPage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupForm />} />
          <Route path="/post/:postId" element={<PostDeepLink />} />

          {/* PROTECTED ROUTES */}
          <Route
            path="/profile/update"
            element={
              <PrivateRoute>
                <UpdateProfilePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/post/update/:postId"
            element={
              <PrivateRoute>
                <UpdatePostPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile/:userId?"
            element={
              <PrivateRoute>
                <ProfilePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/message"
            element={
              <PrivateRoute>
                <MessagesPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/activity"
            element={
              <PrivateRoute>
                <ActivityPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/your-activity"
            element={
              <PrivateRoute>
                <YourActivityPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <PrivateRoute allowedRoles={["ADMIN"]}>
                <AdminDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/manager"
            element={
              <PrivateRoute allowedRoles={["MANAGER", "ADMIN"]}>
                <ManagerDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/gallery"
            element={
              <PrivateRoute allowedRoles={["MANAGER", "ADMIN"]}>
                <GalleryPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/file-requests"
            element={
              <PrivateRoute allowedRoles={["MANAGER", "ADMIN"]}>
                <FileRequestsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <PrivateRoute>
                <SettingsPage />
              </PrivateRoute>
            }
          />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </div>
  );
};

export default Approutes;
