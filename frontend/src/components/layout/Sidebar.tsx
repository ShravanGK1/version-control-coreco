import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  ChevronLeft,
  ChevronRight,
  GitBranch,
  Layers,
  LogOut,
  ShieldCheck,
  User as UserIcon,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="brand-logo">
          <GitBranch className="brand-icon" />
          {!collapsed && <span className="brand-title">VCMS Admin</span>}
        </div>
        <button
          className="collapse-btn"
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <div className="sidebar-menu">
        <div className="menu-group">
          {!collapsed && <div className="menu-label">Navigation</div>}
          <NavLink
            to="/versions"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            title="Version Listing"
          >
            <Layers className="nav-icon" size={20} />
            {!collapsed && <span className="nav-text">Version Listing</span>}
          </NavLink>
        </div>
      </div>

      <div className="sidebar-footer">
        {!collapsed && user && (
          <div className="user-profile-card">
            <div className="user-avatar">
              <UserIcon size={18} />
            </div>
            <div className="user-info">
              <span className="user-name">{user.name || 'Admin User'}</span>
              <span className="user-email">{user.email}</span>
            </div>
          </div>
        )}

        <button className="logout-btn" onClick={handleLogout} title="Logout">
          <LogOut size={20} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};
