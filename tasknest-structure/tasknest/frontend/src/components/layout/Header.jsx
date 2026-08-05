import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

const Header = () => {
  const { isKid, mode, toggleMode } = useTheme();
  const { user } = useAuth();

  return (
    <header className="header">
      <div className="header-left">
        <h2>Welcome back, {user?.full_name || user?.username || 'Guest'}!</h2>
      </div>
      <div className="header-right">
        <button className="mode-toggle" onClick={toggleMode}>
          {isKid ? '👶 Kid Mode' : '💼 Professional'}
        </button>
        <span className="header-mode-badge">
          {isKid ? '🌟 Kid' : '🎯 Pro'}
        </span>
      </div>
    </header>
  );
};

export default Header;