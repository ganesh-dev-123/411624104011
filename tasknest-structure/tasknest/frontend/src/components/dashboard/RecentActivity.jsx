import React, { useState, useEffect, useCallback } from 'react';
import { getRecentActivities } from '../../services/tasks';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { formatRelativeTime, formatExactTime } from '../../hooks/useRelativeTime';
import ModeIcon from '../common/ModeIcon';
import ModeText from '../common/ModeText';
import './RecentActivity.css';

/* ─── icon map ─────────────────────────────────────────────────────────────── */
const ACTION_META = {
  CREATE_TASK:       { icon: 'create', label: 'task-created', color: 'success' },
  UPDATE_TASK:       { icon: 'update', label: 'task-updated', color: 'primary' },
  DELETE_TASK:       { icon: 'delete', label: 'task-deleted', color: 'danger' },
  COMPLETE_TASK:     { icon: 'complete', label: 'task-completed', color: 'success' },
  DUPLICATE_TASK:    { icon: 'duplicate', label: 'task-duplicated', color: 'primary' },
  ARCHIVE_TASK:      { icon: 'archive', label: 'task-archived', color: 'secondary' },
  LOGIN:             { icon: 'login', label: 'login-success', color: 'primary' },
  LOGOUT:            { icon: 'logout', label: 'logout-success', color: 'warning' },
  REGISTER:          { icon: 'register', label: 'register-success', color: 'success' },
  UPDATE_PROFILE:    { icon: 'update-profile', label: 'profile-updated', color: 'primary' },
  CHANGE_PASSWORD:   { icon: 'change-password', label: 'password-changed', color: 'warning' },
  UPDATE_PREFERENCES:{ icon: 'settings', label: 'profile-updated', color: 'secondary' },
};

function getMeta(action) {
  return ACTION_META[action] ?? { icon: 'brand', label: 'empty-activity', color: 'secondary' };
}

function getColorVar(colorName) {
  const colorMap = {
    success: 'var(--color-success)',
    primary: 'var(--color-primary)',
    danger: 'var(--color-danger)',
    warning: 'var(--color-warning)',
    secondary: 'var(--color-secondary)',
  };
  return colorMap[colorName] || 'var(--color-secondary)';
}

/* ─── single row with its own live-ticking timestamp ───────────────────────── */
function ActivityRow({ activity }) {
  const [relTime, setRelTime] = useState(() => formatRelativeTime(activity.created_at));
  const exact = formatExactTime(activity.created_at);
  const meta  = getMeta(activity.action);
  const color = getColorVar(meta.color);

  useEffect(() => {
    setRelTime(formatRelativeTime(activity.created_at));
    const id = setInterval(
      () => setRelTime(formatRelativeTime(activity.created_at)),
      30_000,
    );
    return () => clearInterval(id);
  }, [activity.created_at]);

  return (
    <div className="activity-item">
      <span
        className="activity-icon"
        style={{ background: color + '18', color: color }}
        aria-hidden="true"
      >
        <ModeIcon name={meta.icon} />
      </span>
      <div className="activity-content">
        <p className="activity-description">{activity.description}</p>
        <time
          className="activity-time"
          dateTime={activity.created_at}
          title={exact}
        >
          {relTime}
        </time>
      </div>
    </div>
  );
}

/* ─── container ─────────────────────────────────────────────────────────────── */
const RecentActivity = ({ refreshKey }) => {
  const { token } = useAuth();
  const { isKid } = useTheme();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(false);

  const fetchActivities = useCallback(async () => {
    if (!token) return;
    try {
      setError(false);
      const data = await getRecentActivities();
      setActivities(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [token]);

  /* initial fetch + re-fetch whenever parent signals a mutation */
  useEffect(() => { fetchActivities(); }, [fetchActivities, refreshKey]);

  /* auto-refresh every 60 s so the panel stays live without user action */
  useEffect(() => {
    const id = setInterval(fetchActivities, 60_000);
    return () => clearInterval(id);
  }, [fetchActivities]);

  return (
    <div className={`recent-activity ${isKid ? 'recent-activity-kid' : ''}`}>
      <div className="activity-header">
        <h3>{isKid ? "What's Happening! 🎉" : 'Recent Activity'}</h3>
        <button
          className="activity-refresh-btn"
          onClick={fetchActivities}
          title="Refresh activity"
          aria-label="Refresh activity"
        >
          <ModeIcon name="refresh" />
        </button>
      </div>

      {loading && (
        <div className="activity-loading">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="activity-skeleton" />
          ))}
        </div>
      )}

      {!loading && error && (
        <p className="activity-error">
          {isKid ? 'Oops! Could not load activity' : 'Failed to load activity'}{' '}
          <button onClick={fetchActivities}>{isKid ? 'Try Again' : 'Retry'}</button>
        </p>
      )}

      {!loading && !error && (
        <div className="activity-list">
          {activities.length === 0 ? (
            <div className="no-activity">
              <ModeIcon name="inbox" />
              <p><ModeText name="empty-activity" /></p>
            </div>
          ) : (
            activities.map(a => <ActivityRow key={a.id} activity={a} />)
          )}
        </div>
      )}
    </div>
  );
};

export default RecentActivity;
