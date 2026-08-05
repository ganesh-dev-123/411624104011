import React, { useState, useEffect } from 'react';
import { getRecentActivities } from '../../services/tasks';
import { useAuth } from '../../context/AuthContext';
import './RecentActivity.css';

const RecentActivity = () => {
  const { token } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchActivities();
    }
  }, [token]);

  const fetchActivities = async () => {
    try {
      const data = await getRecentActivities();
      setActivities(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch activities:', error);
      setLoading(false);
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'CREATE_TASK': return '✨';
      case 'UPDATE_TASK': return '📝';
      case 'COMPLETE_TASK': return '✅';
      case 'DELETE_TASK': return '🗑️';
      default: return '📌';
    }
  };

  const getTimeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  if (loading) {
    return <div className="recent-activity-loading">Loading activities...</div>;
  }

  return (
    <div className="recent-activity">
      <h3>Recent Activity</h3>
      <div className="activity-list">
        {activities.length === 0 ? (
          <p className="no-activity">No recent activity</p>
        ) : (
          activities.map((activity) => (
            <div key={activity.id} className="activity-item">
              <span className="activity-icon">{getActionIcon(activity.action)}</span>
              <div className="activity-content">
                <p className="activity-description">{activity.description}</p>
                <span className="activity-time">{getTimeAgo(activity.created_at)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RecentActivity;