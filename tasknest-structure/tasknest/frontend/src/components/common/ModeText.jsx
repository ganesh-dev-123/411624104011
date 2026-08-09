import React from 'react';
import { useTheme } from '../../context/ThemeContext';

/* Mode-aware text mapping - provides professional and friendly alternatives */
const TEXT_MAP = {
  // Greetings
  'morning': { professional: 'Good Morning', kids: 'Good Morning! ☀️' },
  'afternoon': { professional: 'Good Afternoon', kids: 'Good Afternoon! 🌤️' },
  'evening': { professional: 'Good Evening', kids: 'Good Evening! 🌆' },
  'night': { professional: 'Good Night', kids: 'Good Night! 🌙' },
  'welcome': { professional: 'Welcome back', kids: 'Welcome back! 👋' },
  
  // Task statuses
  'task-completed': { professional: 'Task completed successfully', kids: 'Awesome! You finished your task! ⭐' },
  'task-created': { professional: 'Task created successfully', kids: 'Yay! New task added! 🎉' },
  'task-updated': { professional: 'Task updated successfully', kids: 'Great! Task updated! ✨' },
  'task-deleted': { professional: 'Task deleted successfully', kids: 'Task removed! 🗑️' },
  'task-duplicated': { professional: 'Task duplicated successfully', kids: 'Task copied! 📋' },
  'task-archived': { professional: 'Task archived successfully', kids: 'Task archived! 📦' },
  
  // Status labels
  'status-completed': { professional: 'Completed', kids: 'Done! ✅' },
  'status-in-progress': { professional: 'In Progress', kids: 'Working on it 🔄' },
  'status-pending': { professional: 'Pending', kids: 'To Do ⏳' },
  'status-cancelled': { professional: 'Cancelled', kids: 'Cancelled ❌' },
  'status-archived': { professional: 'Archived', kids: 'Archived 📦' },
  
  // Priority labels
  'priority-critical': { professional: 'Critical', kids: 'Super Important! 🔴' },
  'priority-high': { professional: 'High', kids: 'Important! 🟠' },
  'priority-medium': { professional: 'Medium', kids: 'Medium 🟡' },
  'priority-low': { professional: 'Low', kids: 'Easy! 🟢' },
  
  // Statistics
  'stats-completed': { professional: 'Completed', kids: 'Tasks Done! ⭐' },
  'stats-pending': { professional: 'Pending', kids: 'To Do 📋' },
  'stats-overdue': { professional: 'Overdue', kids: 'Overdue! 🔥' },
  'stats-in-progress': { professional: 'In Progress', kids: 'Working! 🔄' },
  'stats-streak': { professional: 'Current Streak', kids: 'Fire Streak! 🔥' },
  'stats-best-streak': { professional: 'Best Streak', kids: 'Best Ever! 🏆' },
  'stats-productivity': { professional: 'Productivity Score', kids: 'Super Score! ⚡' },
  'stats-completion-time': { professional: 'Avg Completion Time', kids: 'Fast Time! ⏱️' },
  
  // Motivational messages (Kids mode)
  'motivation-great': { professional: 'Great progress', kids: "You're on fire! 🔥" },
  'motivation-keep-going': { professional: 'Keep going', kids: "Keep it up! 💪" },
  'motivation-awesome': { professional: 'Awesome work', kids: 'Super work! 🌟' },
  'motivation-almost-there': { professional: 'Almost there', kids: "Almost there! 🎯" },
  'motivation-done': { professional: 'All done', kids: 'You did it! 🎉' },
  
  // Empty states
  'empty-tasks': { professional: 'No tasks yet', kids: 'No tasks yet! Add one! 📝' },
  'empty-activity': { professional: 'No activity yet', kids: 'No activity yet! 📭' },
  'empty-calendar': { professional: 'No tasks scheduled', kids: 'Free day! 🎉' },
  
  // Buttons
  'btn-create': { professional: 'Create Task', kids: 'Add New Task! ➕' },
  'btn-save': { professional: 'Save', kids: 'Save! 💾' },
  'btn-cancel': { professional: 'Cancel', kids: 'Nevermind' },
  'btn-delete': { professional: 'Delete', kids: 'Remove' },
  'btn-edit': { professional: 'Edit', kids: 'Change' },
  
  // Navigation
  'nav-dashboard': { professional: 'Dashboard', kids: 'My Space 🏠' },
  'nav-tasks': { professional: 'Tasks', kids: 'My Tasks 📝' },
  'nav-statistics': { professional: 'Statistics', kids: 'My Progress 📊' },
  'nav-calendar': { professional: 'Calendar', kids: 'My Calendar 📅' },
  'nav-settings': { professional: 'Settings', kids: 'Settings ⚙️' },
  
  // Mode toggle
  'mode-professional': { professional: 'Professional Mode', kids: 'Grown-up Mode 💼' },
  'mode-kid': { professional: 'Kids Mode', kids: 'Kids Mode 🌟' },
  
  // Auth
  'login-success': { professional: 'Login successful', kids: 'Welcome! 🎉' },
  'register-success': { professional: 'Registration successful', kids: 'Account created! 🎉' },
  'logout-success': { professional: 'Logged out successfully', kids: 'See you soon! 👋' },
  
  // Settings
  'profile-updated': { professional: 'Profile updated successfully', kids: 'Profile saved! ✅' },
  'password-changed': { professional: 'Password changed successfully', kids: 'Password changed! 🔐' },
};

/**
 * ModeText - Renders different text based on the current mode
 * 
 * @param {string} name - Text name from TEXT_MAP
 * @param {object} props - Additional props to pass to the span
 * @param {string} fallback - Fallback text if name not found
 */
const ModeText = ({ name, props = {}, fallback = '' }) => {
  const { isKid } = useTheme();
  const textData = TEXT_MAP[name];
  
  if (!textData) {
    return <span {...props}>{fallback}</span>;
  }
  
  const text = isKid ? textData.kids : textData.professional;
  
  return <span {...props}>{text}</span>;
};

export default ModeText;
