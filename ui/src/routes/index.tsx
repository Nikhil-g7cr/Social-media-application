import { Route, Routes, useLocation } from "react-router-dom";

// Import your Roles class

import SignupForm from "../components/features/Auth/Signup";
import NotFoundPage from "../components/layout/Notfound";
import HomePage from "../containers/Home";
import { LoginPage } from "../components/features/Auth/Login";
import ProfilePage from "../containers/profile";
import MessagesPage from "../containers/Message";
import ExplorePage from "../containers/Explore";
import Navbar from "../components/layout/Navbar";
import PrivateRoute from "./ProtectedRoutes";

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
      <Navbar avatarUrl={"http://localhost 50000"}/>
      
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<HomePage />} />
        <Route path="/explore" element={<ExplorePage/>}/>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupForm />} />

        {/* PROTECTED ROUTES */}
        <Route path="/profile" element={
          <PrivateRoute>
            <ProfilePage/>
          </PrivateRoute>
        }/>
        <Route path="/message" element={
          <PrivateRoute>
            <MessagesPage/>
          </PrivateRoute>
        }/>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
};

export default Approutes;