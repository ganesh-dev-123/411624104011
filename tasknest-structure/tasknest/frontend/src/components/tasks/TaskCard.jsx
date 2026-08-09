import React from 'react';
import { motion } from 'framer-motion';
import { FaStar } from 'react-icons/fa';
import ModeIcon from '../common/ModeIcon';
import ModeText from '../common/ModeText';
import { useTheme } from '../../context/ThemeContext';
import './TaskCard.css';

const TaskCard = ({ task, onEdit, onDelete }) => {
  const { isKid } = useTheme();

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'CRITICAL': return 'priority-critical';
      case 'HIGH': return 'priority-high';
      case 'MEDIUM': return 'priority-medium';
      case 'LOW': return 'priority-low';
      default: return 'priority-medium';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED': return 'status-completed';
      case 'IN_PROGRESS': return 'status-in-progress';
      case 'PENDING': return 'status-pending';
      case 'CANCELLED': return 'status-cancelled';
      case 'ARCHIVED': return 'status-archived';
      default: return 'status-pending';
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'CRITICAL': return 'priority-critical';
      case 'HIGH': return 'priority-high';
      case 'MEDIUM': return 'priority-medium';
      case 'LOW': return 'priority-low';
      default: return 'priority-medium';
    }
  };

  const isOverdue = task.due_date &&
    new Date(task.due_date) < new Date() &&
    task.status !== 'COMPLETED';

  return (
    <motion.div
      className={`task-card ${task.status === 'COMPLETED' ? 'task-completed' : ''} ${isKid ? 'task-card-kid' : ''}`}
      whileHover={{ scale: isKid ? 1.02 : 1.005 }}
      transition={{ duration: 0.15 }}
    >
      <div className="task-card-header">
        <div className="task-card-title">
          <span className="task-emoji">
            {task.emoji || <ModeIcon name="brand" />}
          </span>
          <h3 className={task.status === 'COMPLETED' ? 'completed-text' : ''}>
            {task.title}
          </h3>
          {task.is_favorite && <FaStar className="fav-icon" />}
        </div>
        <div className="task-card-actions">
          <span className={`task-priority ${getPriorityColor(task.priority)}`}>
            <ModeText name={getPriorityLabel(task.priority)} fallback={task.priority || 'MEDIUM'} />
          </span>
          {onEdit && (
            <button
              className="action-btn edit-btn"
              onClick={(e) => { e.stopPropagation(); onEdit(task); }}
              title={isKid ? 'Change task' : 'Edit task'}
            >
              <ModeIcon name="edit" />
            </button>
          )}
          {onDelete && (
            <button
              className="action-btn delete-btn"
              onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
              title={isKid ? 'Remove task' : 'Delete task'}
            >
              <ModeIcon name="delete" />
            </button>
          )}
        </div>
      </div>

      {task.description && (
        <p className="task-card-description">{task.description}</p>
      )}

      <div className="task-card-meta">
        <div className="task-meta-item">
          <span className="status-badge">
            <ModeText name={getStatusBadge(task.status)} />
          </span>
        </div>
        {task.due_date && (
          <div className="task-meta-item">
            <span className={`due-date ${isOverdue ? 'overdue' : ''}`}>
              <ModeIcon name="calendar" /> {new Date(task.due_date).toLocaleDateString()}
              {isOverdue && (isKid ? ' · Overdue! 🔥' : ' · Overdue')}
            </span>
          </div>
        )}
        {task.category_name && (
          <div className="task-meta-item">
            <span
              className="category-badge"
              style={task.category_color ? { background: task.category_color + '22', color: task.category_color } : {}}
            >
              {task.category_name}
            </span>
          </div>
        )}
      </div>

      {task.completion_percentage > 0 && (
        <div className="task-progress">
          <div
            className="task-progress-bar"
            style={{ width: `${task.completion_percentage}%` }}
          />
          <span className="task-progress-text">{task.completion_percentage}%</span>
        </div>
      )}
    </motion.div>
  );
};

export default TaskCard;
