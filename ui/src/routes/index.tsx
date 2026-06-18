import { Route, Routes, useLocation } from "react-router-dom";

// Import your Roles class

import LoginForm from "../components/features/Auth/Login";
import SignupForm from "../components/features/Auth/Signup";
import NotFoundPage from "../components/layout/Notfound";

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
        {/* <Route path="/" element={<Home />} /> */}
        <Route path="/login" element={<LoginForm />} />
        <Route path="/signup" element={<SignupForm />} />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
};

export default Approutes;