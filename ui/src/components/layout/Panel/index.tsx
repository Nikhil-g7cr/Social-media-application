import React from 'react';

export interface PanelNavItem {
  id: string;
  label: string;
  icon: React.ElementType;
}

interface PanelShellProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  navItems: PanelNavItem[];
  title: string;
  badge: string;
  children: React.ReactNode;
}

/**
 * PanelShell — layout wrapper for admin/manager dashboards.
 *
 * The sidebar is now handled globally by LeftSidebar in routes/index.tsx
 * (which switches its nav items based on userRole + current path).
 * PanelShell no longer renders its own sidebar to avoid the double-sidebar bug.
 * The isSidebarOpen / setIsSidebarOpen props are kept for backward compatibility
 * but no longer drive a sidebar render.
 */
export const PanelShell: React.FC<PanelShellProps> = ({
  children,
}) => {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="w-full max-w-[1600px] mx-auto p-6 lg:p-8">
        <div className="w-full">{children}</div>
      </div>
    </div>
  );
};

// Keep PanelSidebar exported for any direct imports that may exist,
// but it is no longer rendered inside PanelShell.
export const PanelSidebar: React.FC<any> = () => null;
