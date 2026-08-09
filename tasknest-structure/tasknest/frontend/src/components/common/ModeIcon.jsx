import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import {
  FaCheckCircle, FaClock, FaExclamationCircle, FaListUl,
  FaHome, FaTasks, FaChartBar, FaCalendar, FaCog,
  FaMoon, FaSun, FaSignOutAlt, FaUser, FaEdit, FaTrash,
  FaStar, FaPlus, FaSearch, FaFilter, FaTimes, FaSort,
  FaFire, FaTrophy, FaBolt, FaCalendarCheck, FaSync,
  FaChevronLeft, FaChevronRight, FaCircle, FaEye, FaEyeSlash,
  FaPalette, FaBell, FaShieldAlt, FaBriefcase, FaChild,
  FaEnvelope, FaLock, FaCheck, FaHourglassHalf, FaSyncAlt,
  FaBox, FaDoorOpen, FaKey, FaCog as FaSettings, FaPen,
  FaArchive, FaCopy, FaInbox
} from 'react-icons/fa';

/* Mode-aware icon mapping - provides professional icons and playful alternatives */
const ICON_MAP = {
  // Dashboard icons
  'completed': { professional: <FaCheckCircle />, kids: '⭐' },
  'pending': { professional: <FaClock />, kids: '⏳' },
  'overdue': { professional: <FaExclamationCircle />, kids: '🔥' },
  'total': { professional: <FaListUl />, kids: '📋' },
  'home': { professional: <FaHome />, kids: '🏠' },
  'tasks': { professional: <FaTasks />, kids: '📝' },
  'statistics': { professional: <FaChartBar />, kids: '📊' },
  'calendar': { professional: <FaCalendar />, kids: '📅' },
  'settings': { professional: <FaCog />, kids: '⚙️' },
  
  // Navigation
  'logout': { professional: <FaSignOutAlt />, kids: '🚪' },
  'user': { professional: <FaUser />, kids: '👤' },
  'theme': { professional: null, kids: null }, // Handled separately
  'mode': { professional: <FaBriefcase />, kids: <FaChild /> },
  
  // Task actions
  'edit': { professional: <FaEdit />, kids: '✏️' },
  'delete': { professional: <FaTrash />, kids: '🗑️' },
  'favorite': { professional: <FaStar />, kids: '⭐' },
  'add': { professional: <FaPlus />, kids: '➕' },
  'search': { professional: <FaSearch />, kids: '🔍' },
  'filter': { professional: <FaFilter />, kids: '🎯' },
  'close': { professional: <FaTimes />, kids: '✕' },
  'sort': { professional: <FaSort />, kids: '🔄' },
  'duplicate': { professional: <FaCopy />, kids: '📋' },
  'archive': { professional: <FaArchive />, kids: '📦' },
  
  // Status icons
  'status-completed': { professional: <FaCheck />, kids: '✅' },
  'status-in-progress': { professional: <FaSyncAlt />, kids: '🔄' },
  'status-pending': { professional: <FaHourglassHalf />, kids: '⏳' },
  'status-cancelled': { professional: <FaTimes />, kids: '❌' },
  'status-archived': { professional: <FaBox />, kids: '📦' },
  
  // Statistics
  'streak': { professional: <FaFire />, kids: '🔥' },
  'trophy': { professional: <FaTrophy />, kids: '🏆' },
  'productivity': { professional: <FaBolt />, kids: '⚡' },
  'calendar-check': { professional: <FaCalendarCheck />, kids: '📅' },
  'refresh': { professional: <FaSync />, kids: '🔄' },
  
  // Calendar
  'prev': { professional: <FaChevronLeft />, kids: '◀️' },
  'next': { professional: <FaChevronRight />, kids: '▶️' },
  'dot': { professional: <FaCircle />, kids: '•' },
  
  // Auth
  'email': { professional: <FaEnvelope />, kids: '📧' },
  'password': { professional: <FaLock />, kids: '🔒' },
  'show-password': { professional: <FaEye />, kids: '👁️' },
  'hide-password': { professional: <FaEyeSlash />, kids: '🙈' },
  
  // Settings
  'appearance': { professional: <FaPalette />, kids: '🎨' },
  'notifications': { professional: <FaBell />, kids: '🔔' },
  'security': { professional: <FaShieldAlt />, kids: '🛡️' },
  'change-password': { professional: <FaKey />, kids: '🔑' },
  
  // Activity
  'create': { professional: <FaPlus />, kids: '✨' },
  'update': { professional: <FaPen />, kids: '📝' },
  'complete': { professional: <FaCheckCircle />, kids: '✅' },
  'login': { professional: <FaDoorOpen />, kids: '🚪' },
  'register': { professional: <FaUser />, kids: '🎉' },
  'update-profile': { professional: <FaUser />, kids: '👤' },
  'inbox': { professional: <FaInbox />, kids: '📭' },
  
  // Brand
  'brand': { professional: <FaTasks />, kids: '📋' },
};

/**
 * ModeIcon - Renders different icons based on the current mode
 * 
 * @param {string} name - Icon name from ICON_MAP
 * @param {object} props - Additional props to pass to the icon
 * @param {string} className - CSS class name
 * @param {React.ReactNode} fallback - Fallback icon if name not found
 */
const ModeIcon = ({ name, props = {}, className = '', fallback = null }) => {
  const { isKid } = useTheme();
  const iconData = ICON_MAP[name];
  
  if (!iconData) {
    return fallback ? <span className={className}>{fallback}</span> : null;
  }
  
  const icon = isKid ? iconData.kids : iconData.professional;
  
  // If it's a React component (professional mode), render it
  if (React.isValidElement(icon)) {
    return React.cloneElement(icon, { 
      className, 
      ...props 
    });
  }
  
  // If it's a string/emoji (kids mode), render as text
  return <span className={className} {...props}>{icon}</span>;
};

export default ModeIcon;
