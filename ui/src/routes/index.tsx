import { Route, Routes, useLocation } from "react-router-dom";

// Import your Roles class

import SignupForm from "../components/features/Auth/Signup";
import NotFoundPage from "../components/layout/Notfound";
import HomePage from "../containers/Home";
import { LoginPage } from "../components/features/Auth/Login";

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
      
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupForm />} />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
};

export default Approutes;