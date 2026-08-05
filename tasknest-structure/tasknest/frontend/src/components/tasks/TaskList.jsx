import React from 'react';
import { motion } from 'framer-motion';
import TaskCard from './TaskCard';
import './TaskList.css';

const TaskList = ({ tasks, loading }) => {
  if (loading) {
    return (
      <div className="task-list-loading">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="task-skeleton">
            <div className="skeleton-title"></div>
            <div className="skeleton-line"></div>
            <div className="skeleton-line"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div className="task-list-empty">
        <span className="empty-icon">📭</span>
        <p>No tasks yet. Create your first task!</p>
      </div>
    );
  }

  return (
    <div className="task-list">
      {tasks.map((task, index) => (
        <motion.div
          key={task.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          <TaskCard task={task} />
        </motion.div>
      ))}
    </div>
  );
};

export default TaskList;