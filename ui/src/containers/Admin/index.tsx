import React, { useState, useEffect } from 'react';
import { useAppSelector } from '../../redux/hooks';
import { Navigate } from 'react-router-dom';
import DataTable from '../../components/shared/DataTable';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users');
  const user = useAppSelector((state: any) => state.auth.user);

  if (user?.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  // Placeholder data
  const usersData = [
    { ID: '1', FullName: 'Alice Doe', UserName: 'alice', Role: 'USER', IsActive: true },
    { ID: '2', FullName: 'Bob Smith', UserName: 'bob', Role: 'MANAGER', IsActive: true },
  ];

  const userColumns = [
    { key: 'FullName', label: 'Name' },
    { key: 'UserName', label: 'Username' },
    { key: 'Role', label: 'Role', render: (val: string) => <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">{val}</span> },
    { key: 'IsActive', label: 'Status', render: (val: boolean) => <span className={`px-2 py-1 rounded-full text-xs ${val ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{val ? 'Active' : 'Suspended'}</span> },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'users':
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Users</h2>
            <DataTable 
              columns={userColumns} 
              data={usersData} 
              actions={(row) => (
                <div className="space-x-2">
                  <button className="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
                  <button className="text-red-600 hover:text-red-800 text-sm">Suspend</button>
                  <button className="text-indigo-600 hover:text-indigo-800 text-sm">Make Manager</button>
                </div>
              )}
            />
          </div>
        );
      case 'posts':
        return <div>Manage Posts module to be implemented...</div>;
      case 'comments':
        return <div>Manage Comments module to be implemented...</div>;
      case 'reports':
        return <div>Manage Reports module to be implemented...</div>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 fixed h-full pt-16">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800">Admin Panel</h2>
        </div>
        <nav className="mt-6">
          <button
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center px-6 py-3 text-left ${activeTab === 'users' ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            Manage Users
          </button>
          <button
            onClick={() => setActiveTab('posts')}
            className={`w-full flex items-center px-6 py-3 text-left ${activeTab === 'posts' ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            Manage Posts
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={`w-full flex items-center px-6 py-3 text-left ${activeTab === 'comments' ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            Manage Comments
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`w-full flex items-center px-6 py-3 text-left ${activeTab === 'reports' ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            Manage Reports
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 pt-16 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-6 capitalize">{activeTab.replace('-', ' ')}</h1>
            <div className="text-gray-500">
              {renderContent()}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
