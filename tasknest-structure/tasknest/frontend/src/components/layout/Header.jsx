import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import ModeIcon from '../common/ModeIcon';
import ModeText from '../common/ModeText';
import './Header.css';

const Header = () => {
  const { isKid, mode, toggleMode } = useTheme();
  const { user } = useAuth();

  return (
    <header className={`header ${isKid ? 'header-kid' : ''}`}>
      <div className="header-left">
        <h2>
          <ModeText name="welcome" />, {user?.full_name || user?.username || 'Guest'}!
        </h2>
      </div>
      <div className="header-right">
        <button className="mode-toggle" onClick={toggleMode}>
          <ModeIcon name="mode" />
          <span>{isKid ? <ModeText name="mode-kid" /> : <ModeText name="mode-professional" />}</span>
        </button>
        <span className={`header-mode-badge ${isKid ? 'badge-kid' : 'badge-pro'}`}>
          {isKid ? <ModeIcon name="streak" /> : <ModeIcon name="streak" fallback="🎯" />}
        </span>
      </div>
    </header>
  );
};

export default Header;