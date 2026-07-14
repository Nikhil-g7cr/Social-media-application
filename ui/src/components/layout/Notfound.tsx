import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const NotFoundPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      const lastValidLocation = sessionStorage.getItem(
        "lastValidSidebarLocation",
      );

      if (lastValidLocation) {
        navigate(lastValidLocation, { replace: true });
        return;
      }

      // React Router stores a history index for in-app navigation. Return to
      // the previous page/tab when one exists; direct visits still fall back
      // to Home because there is no in-app page to return to.
      if ((window.history.state?.idx ?? 0) > 0) {
        navigate(-1);
      } else {
        navigate("/", { replace: true });
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4">
      <h1 className="text-7xl font-bold text-gray-800">404</h1>

      <h2 className="mt-4 text-2xl font-semibold text-gray-700">
        Page Not Found
      </h2>

      <p className="mt-2 text-center text-gray-500">
        The page you're looking for doesn't exist.
      </p>

      <p className="mt-6 text-sm text-gray-400">
        Returning to the previous page...
      </p>
    </div>
  );
};

export default NotFoundPage;
