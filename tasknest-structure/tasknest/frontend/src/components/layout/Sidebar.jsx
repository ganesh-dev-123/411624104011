import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  FaHome, 
  FaTasks, 
  FaChartBar, 
  FaCalendar, 
  FaCog, 
  FaSignOutAlt,
  FaMoon,
  FaSun
} from 'react-icons/fa';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { theme, toggleTheme, isKid } = useTheme();

  const menuItems = [
    { path: '/', icon: <FaHome />, label: 'Dashboard' },
    { path: '/tasks', icon: <FaTasks />, label: 'Tasks' },
    { path: '/statistics', icon: <FaChartBar />, label: 'Statistics' },
    { path: '/calendar', icon: <FaCalendar />, label: 'Calendar' },
    { path: '/settings', icon: <FaCog />, label: 'Settings' },
  ];

  return (
    <aside className={`sidebar ${isKid ? 'sidebar-kid' : ''}`}>
      <div className="sidebar-brand">
        <span className="brand-icon">📋</span>
        <span className="brand-text">TaskNest</span>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button onClick={toggleTheme} className="sidebar-theme-btn">
          {theme === 'light' ? <FaMoon /> : <FaSun />}
        </button>
        <button onClick={logout} className="sidebar-logout-btn">
          <FaSignOutAlt />
          <span>Logout</span>
        </button>
        <div className="sidebar-user">
          <span className="user-avatar">👤</span>
          <span className="user-name">{user?.username || 'Guest'}</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;