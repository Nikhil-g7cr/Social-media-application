import { Link, Navigate, useLocation, useParams } from "react-router-dom";
import type { ReactNode } from "react";
import { useAppSelector } from "../redux/hooks"
import { Roles } from "./RoleGuard"; // Make sure to import Roles

interface PrivateRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
}

const AccessDenied = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 mt-10">
    <div className="w-full max-w-2xl rounded-2xl border border-red-100 bg-white p-10 shadow-lg mb-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 shrink-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-7 w-7 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z"
            />
          </svg>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Access Denied</h1>
          <p className="mt-2 text-gray-600 leading-relaxed">
            You do not have the required permissions to view this page.
          </p>
        </div>
      </div>
      <div className="flex justify-end">
        <Link
          to="/"
          className="rounded-xl bg-red-600 px-5 py-2.5 font-medium text-white transition hover:bg-red-700"
        >
          Go Back Home
        </Link>
      </div>
    </div>
  </div>
);

const PrivateRoute = ({ children, allowedRoles }: PrivateRouteProps) => {
  
  const user = useAppSelector((state:any) => state.auth.user);

  const { isAuthenticated } = useAppSelector((state:any) => state.auth);
  const location = useLocation();
  const { rolePrefix } = useParams(); // NEW: Grab the dynamic URL parameter

  // 1. If no user is logged in, redirect to login page
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // --- NEW LOGIC: Dynamic URL Rewriting based on Role ---
  if (rolePrefix) {
    const expectedPrefix = Roles.getRolePrefix(user?.role);
    
    // If the URL says /admin/product but the user is a developer (expected 'dev')
    // Automatically redirect them to /dev/product
    if (expectedPrefix && expectedPrefix !== 'user' && rolePrefix !== expectedPrefix) {
      const newPath = location.pathname.replace(`/${rolePrefix}`, `/${expectedPrefix}`);
      return <Navigate to={newPath} replace />;
    }
  }
  // ------------------------------------------------------

  // 2. If roles are required, check if user has permission
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <AccessDenied />;
  }

  // 3. User is authenticated and authorized
  return <>{children}</>;
};

export default PrivateRoute;