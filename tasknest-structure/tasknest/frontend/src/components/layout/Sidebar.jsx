import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import ModeIcon from '../common/ModeIcon';
import ModeText from '../common/ModeText';
import { FaMoon, FaSun } from 'react-icons/fa';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { theme, toggleTheme, isKid } = useTheme();

  const menuItems = [
    { path: '/', icon: 'home', label: 'nav-dashboard' },
    { path: '/tasks', icon: 'tasks', label: 'nav-tasks' },
    { path: '/statistics', icon: 'statistics', label: 'nav-statistics' },
    { path: '/calendar', icon: 'calendar', label: 'nav-calendar' },
    { path: '/settings', icon: 'settings', label: 'nav-settings' },
  ];

  return (
    <aside className={`sidebar ${isKid ? 'sidebar-kid' : ''}`}>
      <div className="sidebar-brand">
        <span className="brand-icon">
          <ModeIcon name="brand" />
        </span>
        <span className="brand-text">TaskNest</span>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
          >
            <span className="sidebar-icon">
              <ModeIcon name={item.icon} />
            </span>
            <span className="sidebar-label">
              <ModeText name={item.label} />
            </span>
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button onClick={toggleTheme} className="sidebar-theme-btn" title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}>
          {theme === 'light' ? <FaMoon /> : <FaSun />}
        </button>
        <button onClick={logout} className="sidebar-logout-btn">
          <ModeIcon name="logout" />
          <span><ModeText name="logout-success" fallback="Logout" /></span>
        </button>
        <div className="sidebar-user">
          <span className="user-avatar">
            <ModeIcon name="user" />
          </span>
          <span className="user-name">{user?.username || 'Guest'}</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;