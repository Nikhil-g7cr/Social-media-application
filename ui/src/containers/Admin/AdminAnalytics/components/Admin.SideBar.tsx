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
      className={`w-64 bg-white border-r border-gray-200 fixed top-0 h-full z-30 transition-transform duration-300 ease-in-out flex flex-col overflow-y-auto ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="h-16 flex items-center px-6 border-b border-gray-200 relative shrink-0">
        <button
          className="lg:hidden absolute top-0 right-4 p-2 h-full text-gray-400 hover:text-gray-600 focus:outline-none flex items-center"
          onClick={() => setIsSidebarOpen(false)}
        >
          <FiX className="w-5 h-5" />
        </button>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded bg-gray-900 text-white flex items-center justify-center font-bold text-lg">
            A
          </div>
          <span className="font-semibold text-gray-900 tracking-tight">Admin Console</span>
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

export default AdminSidebar;