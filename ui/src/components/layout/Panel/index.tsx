import React from 'react';
import { FiMenu, FiX } from 'react-icons/fi';

export interface PanelNavItem {
  id: string;
  label: string;
  icon: React.ElementType;
}

interface PanelSidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  navItems: PanelNavItem[];
  title: string;
  badge: string;
}

export const PanelSidebar: React.FC<PanelSidebarProps> = ({
  isSidebarOpen,
  setIsSidebarOpen,
  activeTab,
  setActiveTab,
  navItems,
  title,
  badge,
}) => {
  return (
    <aside
      className={`w-64 bg-white border-r border-gray-200 fixed h-full z-30 transition-transform duration-300 ease-in-out flex flex-col overflow-y-auto ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="h-16 flex items-center px-6 border-b border-gray-200 relative shrink-0">
        <button
          className="lg:hidden absolute top-0 right-4 p-2 h-full text-gray-400 hover:text-gray-600 focus:outline-none flex items-center"
          onClick={() => setIsSidebarOpen(false)}
          title="Close sidebar"
        >
          <FiX className="w-5 h-5" />
        </button>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded bg-gray-900 text-white flex items-center justify-center font-bold text-lg">
            {badge}
          </div>
          <span className="font-semibold text-gray-900 tracking-tight">{title}</span>
        </div>
      </div>
      <nav className="p-3 space-y-1 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => {
                setActiveTab(item.id);
                if (window.innerWidth < 1024) setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon
                className={`w-4 h-4 mr-3 shrink-0 ${
                  isActive ? 'text-gray-900' : 'text-gray-400'
                }`}
              />
              {item.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

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

export const PanelShell: React.FC<PanelShellProps> = ({
  isSidebarOpen,
  setIsSidebarOpen,
  activeTab,
  setActiveTab,
  navItems,
  title,
  badge,
  children,
}) => {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-20 lg:hidden pt-16"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <PanelSidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        navItems={navItems}
        title={title}
        badge={badge}
      />

      <main
        className={`flex-1 transition-all duration-300 ease-in-out bg-gray-50 min-h-screen relative overflow-x-hidden ${
          isSidebarOpen ? 'lg:ml-64' : 'ml-0'
        }`}
      >
        <div className="w-full max-w-[1600px] mx-auto p-6 lg:p-8">
          <div className="mb-6 lg:hidden">
            <button
              className="p-2 rounded-md bg-white border border-gray-200 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none flex items-center justify-center transition-colors"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              title="Toggle sidebar"
            >
              <FiMenu className="w-5 h-5" />
            </button>
          </div>
          <div className="w-full">{children}</div>
        </div>
      </main>
    </div>
  );
};
