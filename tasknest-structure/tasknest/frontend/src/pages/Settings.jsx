import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/layout/Layout';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { updateProfile, changePassword } from '../services/auth';
import { toast } from 'react-toastify';
import ModeIcon from '../components/common/ModeIcon';
import ModeText from '../components/common/ModeText';
import {
  FaEye, FaEyeSlash, FaTrash, FaSun, FaMoon, FaSave,
} from 'react-icons/fa';
import './Settings.css';

/* ── sidebar nav items ──────────────────────────────────────────────────── */
const SECTIONS = [
  { id: 'profile',       label: 'Profile',       icon: 'user' },
  { id: 'appearance',    label: 'Appearance',     icon: 'appearance' },
  { id: 'notifications', label: 'Notifications',  icon: 'notifications' },
  { id: 'security',      label: 'Security',       icon: 'security' },
];

/* ── reusable toggle row ────────────────────────────────────────────────── */
const Toggle = ({ checked, onChange, label, description }) => (
  <div className="setting-row">
    <div className="setting-row-text">
      <span className="setting-label">{label}</span>
      {description && <span className="setting-desc">{description}</span>}
    </div>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      className={`toggle ${checked ? 'toggle--on' : ''}`}
      onClick={() => onChange(!checked)}
    >
      <span className="toggle-thumb" />
    </button>
  </div>
);

/* ── password input with show/hide ──────────────────────────────────────── */
const PasswordField = ({ label, name, value, onChange }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="form-group">
      <label htmlFor={name}>{label}</label>
      <div className="password-input-wrapper">
        <input
          id={name}
          type={show ? 'text' : 'password'}
          name={name}
          value={value}
          onChange={onChange}
          className="settings-input"
          placeholder="••••••••"
          autoComplete={name === 'current_password' ? 'current-password' : 'new-password'}
        />
        <button
          type="button"
          className="show-pass-btn"
          aria-label={show ? 'Hide password' : 'Show password'}
          onClick={() => setShow(v => !v)}
        >
          {show ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════════
   Main Settings component
   ══════════════════════════════════════════════════════════════════════════ */
const Settings = () => {
  const { user, updateUser } = useAuth();
  const { toggleTheme, toggleMode, isDark, isKid, theme } = useTheme();

  const [activeSection, setActiveSection] = useState('profile');

  /* ── profile form ─────────────────────────────────────────────────────── */
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    email:     '',
    username:  '',
  });
  const [savingProfile, setSavingProfile] = useState(false);

  /* Sync form whenever user object loads or changes */
  useEffect(() => {
    if (user) {
      setProfileForm({
        full_name: user.full_name || '',
        email:     user.email     || '',
        username:  user.username  || '',
      });
    }
  }, [user]);

  const handleProfileChange = (e) =>
    setProfileForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!profileForm.full_name.trim() && !profileForm.username.trim()) {
      toast.error(isKid ? 'Please add your name or username!' : 'Full name or username is required.');
      return;
    }
    setSavingProfile(true);
    try {
      /* Call the typed service helper which hits PUT /api/auth/me */
      const updated = await updateProfile({
        full_name: profileForm.full_name || null,
        email:     profileForm.email     || null,
        username:  profileForm.username  || null,
      });
      updateUser(updated);   // push new data into AuthContext
      toast.success(isKid ? 'Profile saved! ✅' : 'Profile updated successfully');
    } catch (err) {
      const msg = err.response?.data?.detail || (isKid ? 'Could not save profile' : 'Failed to update profile.');
      toast.error(msg);
    } finally {
      setSavingProfile(false);
    }
  };

  /* ── password form ────────────────────────────────────────────────────── */
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password:     '',
    confirm_password: '',
  });
  const [savingPassword, setSavingPassword] = useState(false);

  const handlePasswordInput = (e) =>
    setPasswordForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSavePassword = async (e) => {
    e.preventDefault();
    const { current_password, new_password, confirm_password } = passwordForm;

    if (!current_password) {
      toast.error(isKid ? 'Please enter your current password!' : 'Please enter your current password.');
      return;
    }
    if (new_password.length < 8) {
      toast.error(isKid ? 'Password needs 8+ characters!' : 'New password must be at least 8 characters.');
      return;
    }
    if (new_password !== confirm_password) {
      toast.error(isKid ? 'Passwords don\'t match!' : 'New passwords do not match.');
      return;
    }

    setSavingPassword(true);
    try {
      /* Call the typed service helper which hits POST /api/auth/change-password */
      await changePassword(current_password, new_password);
      toast.success(isKid ? 'Password changed! ✅' : 'Password changed successfully');
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      const msg = err.response?.data?.detail || (isKid ? 'Could not change password' : 'Failed to change password.');
      toast.error(msg);
    } finally {
      setSavingPassword(false);
    }
  };

  /* ── notification toggles (client-side only — no server endpoint yet) ── */
  const [notifSettings, setNotifSettings] = useState({
    due_date_alerts:  true,
    overdue_warnings: true,
    email_reminders:  false,
    weekly_summary:   false,
  });

  /* ── helpers ──────────────────────────────────────────────────────────── */
  const getInitials = () => {
    const name = user?.full_name || user?.username || 'U';
    return name.trim().split(/\s+/).map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  /* ══════════════════════════════════════════════════════════════════════
     Render
     ══════════════════════════════════════════════════════════════════════ */
  return (
    <Layout>
      <div className={`settings-page ${isKid ? 'settings-page-kid' : ''}`}>

        <motion.div
          className="settings-header"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1>{isKid ? 'Settings ⚙️' : 'Settings'}</h1>
          <p className="settings-subtitle">{isKid ? 'Make TaskNest yours!' : 'Manage your account and preferences'}</p>
        </motion.div>

        <div className="settings-layout">

          {/* ── sidebar ─────────────────────────────────────────────── */}
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
                <span className="nav-icon"><ModeIcon name={s.icon} /></span>
                {s.label}
              </button>
            ))}
          </motion.aside>

          {/* ── content panel ───────────────────────────────────────── */}
          <motion.div
            className="settings-content"
            key={activeSection}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.22 }}
          >

            {/* ─── PROFILE ────────────────────────────────────────── */}
            {activeSection === 'profile' && (
              <div className="settings-section">
                <h2 className="section-title">{isKid ? 'My Profile' : 'Profile'}</h2>
                <p className="section-desc">{isKid ? 'Tell us about yourself!' : 'Update your personal information.'}</p>

                <div className="avatar-block">
                  <div className="avatar-circle">{getInitials()}</div>
                  <div>
                    <p className="avatar-name">{user?.full_name || user?.username}</p>
                    <p className="avatar-email">{user?.email}</p>
                  </div>
                </div>

                <form onSubmit={handleSaveProfile} className="settings-form">
                  <div className="form-group">
                    <label htmlFor="full_name">{isKid ? 'Your Name' : 'Full Name'}</label>
                    <input
                      id="full_name"
                      type="text"
                      name="full_name"
                      value={profileForm.full_name}
                      onChange={handleProfileChange}
                      className="settings-input"
                      placeholder={isKid ? "What's your name?" : "Your full name"}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="username">{isKid ? 'Username' : 'Username'}</label>
                    <input
                      id="username"
                      type="text"
                      name="username"
                      value={profileForm.username}
                      onChange={handleProfileChange}
                      className="settings-input"
                      placeholder="username"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">{isKid ? 'Email' : 'Email'}</label>
                    <input
                      id="email"
                      type="email"
                      name="email"
                      value={profileForm.email}
                      onChange={handleProfileChange}
                      className="settings-input"
                      placeholder="you@example.com"
                    />
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="btn-primary" disabled={savingProfile}>
                      <ModeIcon name="save" /> {savingProfile ? (isKid ? 'Saving...' : 'Saving…') : (isKid ? 'Save!' : 'Save Changes')}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ─── APPEARANCE ─────────────────────────────────────── */}
            {activeSection === 'appearance' && (
              <div className="settings-section">
                <h2 className="section-title">{isKid ? 'Make it Pretty!' : 'Appearance'}</h2>
                <p className="section-desc">{isKid ? 'Choose your favorite style!' : 'Customize how TaskNest looks.'}</p>

                {/* theme */}
                <div className="appearance-card">
                  <h3 className="appearance-label">{isKid ? 'Colors' : 'Color Theme'}</h3>
                  <div className="theme-options">
                    <button
                      className={`theme-card ${!isDark ? 'active' : ''}`}
                      onClick={() => isDark && toggleTheme()}
                    >
                      <div className="theme-preview light-preview">
                        <div className="preview-sidebar" />
                        <div className="preview-content" />
                      </div>
                      <div className="theme-card-footer"><FaSun /> {isKid ? 'Light' : 'Light'}</div>
                    </button>
                    <button
                      className={`theme-card ${isDark ? 'active' : ''}`}
                      onClick={() => !isDark && toggleTheme()}
                    >
                      <div className="theme-preview dark-preview">
                        <div className="preview-sidebar" />
                        <div className="preview-content" />
                      </div>
                      <div className="theme-card-footer"><FaMoon /> {isKid ? 'Dark' : 'Dark'}</div>
                    </button>
                  </div>
                </div>

                {/* mode */}
                <div className="appearance-card">
                  <h3 className="appearance-label">{isKid ? 'Mode' : 'Display Mode'}</h3>
                  <div className="theme-options">
                    <button
                      className={`theme-card ${!isKid ? 'active' : ''}`}
                      onClick={() => isKid && toggleMode()}
                    >
                      <div className="mode-preview">
                        <ModeIcon name="mode" className="mode-icon" />
                      </div>
                      <div className="theme-card-footer"><ModeIcon name="mode" /> <ModeText name="mode-professional" /></div>
                    </button>
                    <button
                      className={`theme-card ${isKid ? 'active' : ''}`}
                      onClick={() => !isKid && toggleMode()}
                    >
                      <div className="mode-preview mode-preview--kid">
                        <ModeIcon name="mode" className="mode-icon" />
                      </div>
                      <div className="theme-card-footer"><ModeIcon name="mode" /> <ModeText name="mode-kid" /></div>
                    </button>
                  </div>
                  {isKid && (
                    <p className="mode-note">{isKid ? 'Kid mode uses larger text and friendlier UI elements!' : 'Kid mode uses larger text and friendlier UI elements.'}</p>
                  )}
                </div>

                <div className="current-theme-info">
                  {isKid ? 'Currently: ' : 'Currently: '}<strong>{isDark ? 'Dark' : 'Light'}</strong> theme ·{' '}
                  <strong>{isKid ? <ModeText name="mode-kid" /> : <ModeText name="mode-professional" />}</strong> mode
                </div>
              </div>
            )}

            {/* ─── NOTIFICATIONS ──────────────────────────────────── */}
            {activeSection === 'notifications' && (
              <div className="settings-section">
                <h2 className="section-title">{isKid ? 'Notifications 🔔' : 'Notifications'}</h2>
                <p className="section-desc">{isKid ? 'Choose what alerts you want!' : 'Choose what you want to be notified about.'}</p>

                <div className="toggles-list">
                  <Toggle
                    checked={notifSettings.due_date_alerts}
                    onChange={v => setNotifSettings(s => ({ ...s, due_date_alerts: v }))}
                    label={isKid ? 'Due Date Alerts' : 'Due Date Alerts'}
                    description={isKid ? 'Get notified when a task is due soon!' : 'Get notified when a task is due soon'}
                  />
                  <Toggle
                    checked={notifSettings.overdue_warnings}
                    onChange={v => setNotifSettings(s => ({ ...s, overdue_warnings: v }))}
                    label={isKid ? 'Overdue Warnings' : 'Overdue Warnings'}
                    description={isKid ? 'Get reminded about overdue tasks!' : 'Get reminded about overdue tasks'}
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
                    description="Weekly productivity report every Monday"
                  />
                </div>

                <div className="form-actions" style={{ marginTop: 20 }}>
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => toast.success('Notification preferences saved!')}
                  >
                    <FaSave /> Save Preferences
                  </button>
                </div>
              </div>
            )}

            {/* ─── SECURITY ───────────────────────────────────────── */}
            {activeSection === 'security' && (
              <div className="settings-section">
                <h2 className="section-title">Security</h2>
                <p className="section-desc">Keep your account safe.</p>

                {/* change password */}
                <div className="settings-subsection">
                  <h3 className="subsection-title">Change Password</h3>
                  <form onSubmit={handleSavePassword} className="settings-form">
                    <PasswordField
                      label="Current Password"
                      name="current_password"
                      value={passwordForm.current_password}
                      onChange={handlePasswordInput}
                    />
                    <PasswordField
                      label="New Password"
                      name="new_password"
                      value={passwordForm.new_password}
                      onChange={handlePasswordInput}
                    />
                    <PasswordField
                      label="Confirm New Password"
                      name="confirm_password"
                      value={passwordForm.confirm_password}
                      onChange={handlePasswordInput}
                    />
                    {/* inline mismatch hint */}
                    {passwordForm.confirm_password &&
                      passwordForm.new_password !== passwordForm.confirm_password && (
                        <p className="field-error">Passwords do not match</p>
                      )}
                    <div className="form-actions">
                      <button type="submit" className="btn-primary" disabled={savingPassword}>
                        <FaShieldAlt /> {savingPassword ? 'Saving…' : 'Update Password'}
                      </button>
                    </div>
                  </form>
                </div>

                {/* danger zone */}
                <div className="settings-subsection danger-zone">
                  <h3 className="subsection-title danger-title">Danger Zone</h3>
                  <p className="danger-desc">
                    Deleting your account is permanent and cannot be undone.
                    All tasks and data will be lost.
                  </p>
                  <button
                    type="button"
                    className="btn-danger-outline"
                    onClick={() =>
                      toast.error('Account deletion requires confirmation. Please contact support.')
                    }
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
