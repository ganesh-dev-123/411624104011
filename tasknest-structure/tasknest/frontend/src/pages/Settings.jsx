import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/layout/Layout';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import { toast } from 'react-toastify';
import {
  FaUser, FaPalette, FaBell, FaShieldAlt,
  FaMoon, FaSun, FaChild, FaBriefcase, FaSave,
  FaEye, FaEyeSlash, FaTrash
} from 'react-icons/fa';
import './Settings.css';

const SECTIONS = [
  { id: 'profile', label: 'Profile', icon: <FaUser /> },
  { id: 'appearance', label: 'Appearance', icon: <FaPalette /> },
  { id: 'notifications', label: 'Notifications', icon: <FaBell /> },
  { id: 'security', label: 'Security', icon: <FaShieldAlt /> },
];

const Toggle = ({ checked, onChange, label, description }) => (
  <div className="setting-row">
    <div className="setting-row-text">
      <span className="setting-label">{label}</span>
      {description && <span className="setting-desc">{description}</span>}
    </div>
    <button
      role="switch"
      aria-checked={checked}
      className={`toggle ${checked ? 'toggle--on' : ''}`}
      onClick={() => onChange(!checked)}
    >
      <span className="toggle-thumb" />
    </button>
  </div>
);

const Settings = () => {
  const { user, updateUser } = useAuth();
  const { theme, toggleTheme, mode, toggleMode, isDark, isKid } = useTheme();
  const [activeSection, setActiveSection] = useState('profile');

  // Profile form
  const [profileForm, setProfileForm] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    username: user?.username || '',
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // Password form
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false, new: false, confirm: false,
  });
  const [savingPassword, setSavingPassword] = useState(false);

  // Notifications
  const [notifSettings, setNotifSettings] = useState({
    email_reminders: true,
    due_date_alerts: true,
    weekly_summary: false,
    overdue_warnings: true,
  });

  const handleProfileChange = (e) => {
    setProfileForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await api.put('/auth/me', profileForm);
      updateUser(res.data);
      toast.success('Profile updated successfully!');
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to update profile.';
      toast.error(msg);
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = (e) => {
    setPasswordForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast.error('New passwords do not match.');
      return;
    }
    if (passwordForm.new_password.length < 8) {
      toast.error('Password must be at least 8 characters.');
      return;
    }
    setSavingPassword(true);
    try {
      await api.post('/auth/change-password', {
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      });
      toast.success('Password changed successfully!');
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to change password.';
      toast.error(msg);
    } finally {
      setSavingPassword(false);
    }
  };

  const getInitials = () => {
    const name = user?.full_name || user?.username || 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <Layout>
      <div className="settings-page">
        <motion.div
          className="settings-header"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1>Settings</h1>
          <p className="settings-subtitle">Manage your account and preferences</p>
        </motion.div>

        <div className="settings-layout">
          {/* Sidebar */}
          <motion.aside
            className="settings-sidebar"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            {SECTIONS.map(s => (
              <button
                key={s.id}
                className={`settings-nav-item ${activeSection === s.id ? 'active' : ''}`}
                onClick={() => setActiveSection(s.id)}
              >
                <span className="nav-icon">{s.icon}</span>
                {s.label}
              </button>
            ))}
          </motion.aside>

          {/* Content */}
          <motion.div
            className="settings-content"
            key={activeSection}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25 }}
          >

            {/* PROFILE */}
            {activeSection === 'profile' && (
              <div className="settings-section">
                <h2 className="section-title">Profile</h2>
                <p className="section-desc">Update your personal information.</p>

                {/* Avatar */}
                <div className="avatar-block">
                  <div className="avatar-circle">{getInitials()}</div>
                  <div>
                    <p className="avatar-name">{user?.full_name || user?.username}</p>
                    <p className="avatar-email">{user?.email}</p>
                  </div>
                </div>

                <form onSubmit={handleSaveProfile} className="settings-form">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      name="full_name"
                      value={profileForm.full_name}
                      onChange={handleProfileChange}
                      className="settings-input"
                      placeholder="Your full name"
                    />
                  </div>
                  <div className="form-group">
                    <label>Username</label>
                    <input
                      type="text"
                      name="username"
                      value={profileForm.username}
                      onChange={handleProfileChange}
                      className="settings-input"
                      placeholder="username"
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={profileForm.email}
                      onChange={handleProfileChange}
                      className="settings-input"
                      placeholder="your@email.com"
                    />
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="btn-primary" disabled={savingProfile}>
                      <FaSave /> {savingProfile ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* APPEARANCE */}
            {activeSection === 'appearance' && (
              <div className="settings-section">
                <h2 className="section-title">Appearance</h2>
                <p className="section-desc">Customize how TaskNest looks for you.</p>

                {/* Theme */}
                <div className="appearance-card">
                  <h3 className="appearance-label">Color Theme</h3>
                  <div className="theme-options">
                    <button
                      className={`theme-card ${!isDark ? 'active' : ''}`}
                      onClick={() => !isDark || toggleTheme()}
                    >
                      <div className="theme-preview light-preview">
                        <div className="preview-sidebar" />
                        <div className="preview-content" />
                      </div>
                      <div className="theme-card-footer">
                        <FaSun /> Light
                      </div>
                    </button>
                    <button
                      className={`theme-card ${isDark ? 'active' : ''}`}
                      onClick={() => isDark || toggleTheme()}
                    >
                      <div className="theme-preview dark-preview">
                        <div className="preview-sidebar" />
                        <div className="preview-content" />
                      </div>
                      <div className="theme-card-footer">
                        <FaMoon /> Dark
                      </div>
                    </button>
                  </div>
                </div>

                {/* Mode */}
                <div className="appearance-card">
                  <h3 className="appearance-label">Display Mode</h3>
                  <div className="theme-options">
                    <button
                      className={`theme-card ${!isKid ? 'active' : ''}`}
                      onClick={() => isKid && toggleMode()}
                    >
                      <div className="mode-preview">
                        <FaBriefcase className="mode-icon" />
                      </div>
                      <div className="theme-card-footer">
                        <FaBriefcase /> Professional
                      </div>
                    </button>
                    <button
                      className={`theme-card ${isKid ? 'active' : ''}`}
                      onClick={() => !isKid && toggleMode()}
                    >
                      <div className="mode-preview mode-preview--kid">
                        <FaChild className="mode-icon" />
                      </div>
                      <div className="theme-card-footer">
                        <FaChild /> Kid Mode
                      </div>
                    </button>
                  </div>
                  {isKid && (
                    <p className="mode-note">Kid mode uses larger text and friendlier interface elements.</p>
                  )}
                </div>

                <div className="current-theme-info">
                  Currently using: <strong>{isDark ? 'Dark' : 'Light'}</strong> theme in <strong>{isKid ? 'Kid' : 'Professional'}</strong> mode
                </div>
              </div>
            )}

            {/* NOTIFICATIONS */}
            {activeSection === 'notifications' && (
              <div className="settings-section">
                <h2 className="section-title">Notifications</h2>
                <p className="section-desc">Choose what you want to be notified about.</p>

                <div className="toggles-list">
                  <Toggle
                    checked={notifSettings.due_date_alerts}
                    onChange={v => setNotifSettings(s => ({ ...s, due_date_alerts: v }))}
                    label="Due Date Alerts"
                    description="Get notified when a task is due soon"
                  />
                  <Toggle
                    checked={notifSettings.overdue_warnings}
                    onChange={v => setNotifSettings(s => ({ ...s, overdue_warnings: v }))}
                    label="Overdue Warnings"
                    description="Get reminded about overdue tasks"
                  />
                  <Toggle
                    checked={notifSettings.email_reminders}
                    onChange={v => setNotifSettings(s => ({ ...s, email_reminders: v }))}
                    label="Email Reminders"
                    description="Receive task reminders via email"
                  />
                  <Toggle
                    checked={notifSettings.weekly_summary}
                    onChange={v => setNotifSettings(s => ({ ...s, weekly_summary: v }))}
                    label="Weekly Summary"
                    description="Get a weekly productivity report every Monday"
                  />
                </div>

                <div className="form-actions">
                  <button
                    className="btn-primary"
                    onClick={() => toast.success('Notification preferences saved!')}
                  >
                    <FaSave /> Save Preferences
                  </button>
                </div>
              </div>
            )}

            {/* SECURITY */}
            {activeSection === 'security' && (
              <div className="settings-section">
                <h2 className="section-title">Security</h2>
                <p className="section-desc">Keep your account secure.</p>

                <div className="settings-subsection">
                  <h3 className="subsection-title">Change Password</h3>
                  <form onSubmit={handleSavePassword} className="settings-form">
                    {(['current', 'new', 'confirm']).map(field => {
                      const names = {
                        current: 'current_password',
                        new: 'new_password',
                        confirm: 'confirm_password',
                      };
                      const labels = {
                        current: 'Current Password',
                        new: 'New Password',
                        confirm: 'Confirm New Password',
                      };
                      return (
                        <div className="form-group" key={field}>
                          <label>{labels[field]}</label>
                          <div className="password-input-wrapper">
                            <input
                              type={showPasswords[field] ? 'text' : 'password'}
                              name={names[field]}
                              value={passwordForm[names[field]]}
                              onChange={handlePasswordChange}
                              className="settings-input"
                              placeholder="••••••••"
                            />
                            <button
                              type="button"
                              className="show-pass-btn"
                              onClick={() => setShowPasswords(p => ({ ...p, [field]: !p[field] }))}
                            >
                              {showPasswords[field] ? <FaEyeSlash /> : <FaEye />}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    <div className="form-actions">
                      <button type="submit" className="btn-primary" disabled={savingPassword}>
                        <FaShieldAlt /> {savingPassword ? 'Saving...' : 'Update Password'}
                      </button>
                    </div>
                  </form>
                </div>

                <div className="settings-subsection danger-zone">
                  <h3 className="subsection-title danger-title">Danger Zone</h3>
                  <p className="danger-desc">
                    Deleting your account is permanent and cannot be undone. All your tasks and data will be lost.
                  </p>
                  <button
                    className="btn-danger-outline"
                    onClick={() => toast.error('Account deletion requires confirmation. Please contact support.')}
                  >
                    <FaTrash /> Delete Account
                  </button>
                </div>
              </div>
            )}

          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
