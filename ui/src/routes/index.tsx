import { Route, Routes, useLocation } from "react-router-dom";

// Import your Roles class

import SignupForm from "../components/features/Auth/Signup";
import NotFoundPage from "../components/layout/Notfound";
import HomePage from "../containers/Home";
import { LoginPage } from "../components/features/Auth/Login";
import ProfilePage from "../containers/profile";
import UpdateProfilePage from "../containers/profile/UpdateProfile";
import UpdatePostPage from "../containers/post/UpdatePost";
import MessagesPage from "../containers/Message";
import ExplorePage from "../containers/Explore";
import ActivityPage from "../containers/activity";
import YourActivityPage from "../containers/your-activity";
import Navbar from "../components/layout/Navbar";
import PrivateRoute from "./ProtectedRoutes";
import AdminDashboard from "../containers/Admin";
import ManagerDashboard from "../containers/Manager";

// Create Reusable Role Arrays for cleaner code

const Approutes = () => {
  const location = useLocation();

  const isAuthRoute =
    location.pathname.startsWith("/login") ||
    location.pathname.startsWith("/signup");

  return (
    <div>
      {/* Topbar is now visible on all pages so you can always access the Cart */}
      {/* <Topbar /> */}
      <Navbar />
      
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<HomePage />} />
        <Route path="/explore" element={<ExplorePage/>}/>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupForm />} />

        {/* PROTECTED ROUTES */}
        <Route path="/profile/update" element={
          <PrivateRoute>
            <UpdateProfilePage/>
          </PrivateRoute>
        }/>
        <Route path="/post/update/:postId" element={
          <PrivateRoute>
            <UpdatePostPage/>
          </PrivateRoute>
        }/>
        <Route path="/profile/:userId?" element={
          <PrivateRoute>
            <ProfilePage/>
          </PrivateRoute>
        }/>
        <Route path="/message" element={
          <PrivateRoute>
            <MessagesPage/>
          </PrivateRoute>
        }/>
        <Route path="/activity" element={
          <PrivateRoute>
            <ActivityPage/>
          </PrivateRoute>
        }/>
        <Route path="/your-activity" element={
          <PrivateRoute>
            <YourActivityPage/>
          </PrivateRoute>
        }/>
        <Route path="/admin" element={
          <PrivateRoute allowedRoles={['ADMIN']}>
            <AdminDashboard/>
          </PrivateRoute>
        }/>
        <Route path="/manager" element={
          <PrivateRoute allowedRoles={['MANAGER', 'ADMIN']}>
            <ManagerDashboard/>
          </PrivateRoute>
        }/>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
};

export default Approutes;