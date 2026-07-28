import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { GitCommit, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AppLayout: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content-wrapper">
        <header className="app-topbar">
          <div className="topbar-title">
            <h1>Version Control Management System</h1>
            <p className="topbar-subtitle">University Engineering Portal & API Console</p>
          </div>
          <div className="topbar-actions">
            <div className="status-chip">
              <span className="pulse-indicator"></span>
              <span>API Connected</span>
            </div>
            <div className="user-badge">
              <Shield size={16} />
              <span>{user?.email || 'Authenticated'}</span>
            </div>
          </div>
        </header>

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
