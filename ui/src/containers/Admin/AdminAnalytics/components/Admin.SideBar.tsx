import React from 'react';
import { FiX } from 'react-icons/fi';

export interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
}

interface AdminSidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  navItems: NavItem[];
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({
  isSidebarOpen,
  setIsSidebarOpen,
  activeTab,
  setActiveTab,
  navItems,
}) => {
  return (
    <aside
      className={`w-72 bg-white/80 backdrop-blur-xl border-r border-gray-200/60 fixed top-0 h-full pt-8 z-30 shadow-[4px_0_24px_rgba(0,0,0,0.02)] transition-transform duration-300 ease-in-out flex flex-col overflow-y-auto ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="px-8 pb-6 mb-2 border-b border-gray-100 relative shrink-0">
        <button
          className="lg:hidden absolute top-0 right-4 p-2 text-gray-400 hover:text-gray-600 focus:outline-none"
          onClick={() => setIsSidebarOpen(false)}
        >
          <FiX className="w-5 h-5" />
        </button>
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30 mb-4">
          <span className="text-xl font-bold">A</span>
        </div>
        <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
          Admin Control
        </h2>
        <p className="text-xs text-gray-500 mt-1 font-medium">System Management</p>
      </div>
      <nav className="mt-2 px-4 space-y-2 flex-1 pb-8">
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
              className={`w-full flex items-center px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 group ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 shadow-sm border border-indigo-100/50'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
              }`}
            >
              <Icon
                className={`w-5 h-5 mr-3 transition-colors duration-300 ${
                  isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600'
                }`}
              />
              {item.label}
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default AdminSidebar;