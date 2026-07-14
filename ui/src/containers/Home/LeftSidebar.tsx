import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Search,
  MessageSquare,
  User,
  LogOut,
  Heart,
  ChevronLeft,
  ChevronRight,
  BarChart2,
  Users,
  FileText,
  AlertOctagon,
  Image,
  FolderOpen,
} from "lucide-react";

interface LeftSidebarProps {
  isAuthenticated: boolean;
  isCollapsed: boolean;
  onToggle: () => void;
  userRole?: string;
}

interface NavItem {
  path: string;
  icon: React.ElementType;
  label: string;
}

export default function LeftSidebar({
  isAuthenticated,
  isCollapsed,
  onToggle,
  userRole,
}: LeftSidebarProps) {
  const location = useLocation();

  // Checks both pathname and ?tab= query param
  const isActive = (path: string) => {
    const [pathname, search] = path.split("?");
    if (search) {
      const tabParam = new URLSearchParams(search).get("tab");
      const currentTab = new URLSearchParams(location.search).get("tab");
      return location.pathname === pathname && currentTab === tabParam;
    }
    return location.pathname === path;
  };

  // ── Nav sets ────────────────────────────────────────────────────────────────

  const normalNavItems: NavItem[] = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/explore", icon: Search, label: "Explore" },
    { path: "/message", icon: MessageSquare, label: "Messages" },
    { path: "/activity", icon: Heart, label: "Activity" },
  ];

  const adminNavItems: NavItem[] = [
    { path: "/admin?tab=analytics", icon: BarChart2, label: "Dashboard" },
    { path: "/admin?tab=users", icon: Users, label: "Manage Users" },
    { path: "/admin?tab=posts", icon: FileText, label: "Manage Posts" },
    { path: "/admin?tab=comments", icon: MessageSquare, label: "Comments" },
    { path: "/admin?tab=reports", icon: AlertOctagon, label: "Reports" },
    { path: "/admin?tab=gallery", icon: Image, label: "Gallery" },
    {
      path: "/admin?tab=file-requests",
      icon: FolderOpen,
      label: "File Requests",
    },
  ];

  const managerNavItems: NavItem[] = [
    { path: "/manager?tab=posts", icon: FileText, label: "Moderate Posts" },
    { path: "/manager?tab=comments", icon: MessageSquare, label: "Comments" },
    {
      path: "/manager?tab=reports",
      icon: AlertOctagon,
      label: "User Complaints",
    },
    { path: "/manager?tab=gallery", icon: Image, label: "Gallery" },
    {
      path: "/manager?tab=file-requests",
      icon: FolderOpen,
      label: "File Requests",
    },
  ];

  const unauthenticatedNavItems: NavItem[] = [
    { path: "/explore", icon: Search, label: "Explore" },
    { path: "/login", icon: LogOut, label: "Login" },
    { path: "/signup", icon: User, label: "Sign Up" },
  ];

  // Pick which nav set to show based on current route + role
  const isAdminPage = location.pathname === "/admin";
  const isManagerPage = location.pathname === "/manager";

  let navItems: NavItem[];
  let sectionLabel: string | null = null;

  if (!isAuthenticated) {
    navItems = unauthenticatedNavItems;
  } else if (isAdminPage && userRole === "ADMIN") {
    navItems = adminNavItems;
    sectionLabel = "Admin Control";
  } else if (
    isManagerPage &&
    (userRole === "MANAGER" || userRole === "ADMIN")
  ) {
    navItems = managerNavItems;
    sectionLabel = "Manager Panel";
  } else {
    navItems = normalNavItems;
  }

  // Remember only recognized sidebar destinations. If somebody edits a panel
  // tab in the address bar to an invalid value, the 404 page can restore the
  // last valid tab instead of sending them to Home.
  useEffect(() => {
    if (navItems.some(({ path }) => isActive(path))) {
      sessionStorage.setItem(
        "lastValidSidebarLocation",
        `${location.pathname}${location.search}`,
      );
    }
  }, [location.pathname, location.search, navItems]);

  return (
    <>
        <aside
          className={`hidden md:flex fixed top-16 left-0 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 z-30 flex-col transition-all duration-300 ease-in-out overflow-visible ${
            isCollapsed ? "w-16" : "w-64"
          }`}
        >
          {/* Toggle button — sits on the right edge */}
          <button
            onClick={onToggle}
            className="absolute -right-3.5 top-8 z-40 h-7 w-7 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-md hover:shadow-lg hover:bg-gray-50 transition-all duration-150"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="h-3.5 w-3.5 text-gray-600" />
            ) : (
              <ChevronLeft className="h-3.5 w-3.5 text-gray-600" />
            )}
          </button>

          {/* Section label for role panels */}
          {sectionLabel && !isCollapsed && (
            <div className="px-4 pt-4 pb-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                {sectionLabel}
              </span>
            </div>
          )}

          {/* Nav items */}
          <nav
            className={`flex-1 px-2 space-y-1 ${
              isCollapsed
                ? "overflow-visible"
                : "overflow-y-auto overflow-x-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            } ${sectionLabel && !isCollapsed ? "pt-1" : "py-4"}`}
          >
            {navItems.map(({ path, icon: Icon, label }) => {
              const active = isActive(path);
              return (
                <div key={path} className="relative group">
                  <Link
                    to={path}
                    className={`flex items-center rounded-xl font-medium transition-all duration-150 ${
                      active
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    } ${isCollapsed ? "justify-center p-3" : "gap-3 px-4 py-3"}`}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {!isCollapsed && <span className="truncate">{label}</span>}
                  </Link>

                  {/* Tooltip when collapsed */}
                  {isCollapsed && (
                    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-gray-900 text-white text-sm font-medium rounded-lg whitespace-nowrap pointer-events-none z-50 shadow-lg opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0 transition-all duration-150">
                      {label}
                      <span className="absolute right-full top-1/2 -translate-y-1/2 border-[5px] border-transparent border-r-gray-900" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Back to home — shown at bottom when inside a role panel */}
            {(isAdminPage || isManagerPage) && (
              <div className="relative group mt-2 pt-3 border-t border-gray-100">
                <Link
                  to="/"
                  className={`flex items-center rounded-xl font-medium transition-all duration-150 text-gray-500 hover:bg-gray-100 hover:text-gray-900 ${
                    isCollapsed ? "justify-center p-3" : "gap-3 px-4 py-3"
                  }`}
                >
                  <Home className="h-5 w-5 shrink-0" />
                  {!isCollapsed && (
                    <span className="truncate">Back to Home</span>
                  )}
                </Link>
                {isCollapsed && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-gray-900 text-white text-sm font-medium rounded-lg whitespace-nowrap pointer-events-none z-50 shadow-lg opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0 transition-all duration-150">
                    Back to Home
                    <span className="absolute right-full top-1/2 -translate-y-1/2 border-[5px] border-transparent border-r-gray-900" />
                  </div>
                )}
              </div>
            )}
          </nav>
        </aside>
      

      <nav className="fixed bottom-0 left-0 right-0 md:hidden h-16 bg-white border-t border-gray-200 z-30 flex items-center justify-around">
        {navItems.map(({ path, icon: Icon, label }) => {
          const active = isActive(path);

          return (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                active ? "text-blue-600" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Icon className="h-5 w-5" />
            </Link>
          );
        })}
      </nav>
    </>
  );
}
