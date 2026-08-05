import React, { useState } from 'react';
import { useTasks } from '../../context/TaskContext';
import { motion } from 'framer-motion';
import { FaPlus } from 'react-icons/fa';
import Button from '../common/Button';
import Input from '../common/Input';
import './QuickAddTask.css';

const QuickAddTask = () => {
  const [title, setTitle] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const { addTask } = useTasks();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      await addTask({
        title: title.trim(),
        priority: 'MEDIUM',
        status: 'PENDING'
      });
      setTitle('');
      setIsExpanded(false);
    } catch (error) {
      console.error('Failed to add task:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="quick-add-task">
      <motion.div 
        className={`quick-add-container ${isExpanded ? 'expanded' : ''}`}
        animate={{ height: isExpanded ? 'auto' : '56px' }}
      >
        <form onSubmit={handleSubmit}>
          <div className="quick-add-input">
            <Input
              type="text"
              placeholder="Add a new task..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onFocus={() => setIsExpanded(true)}
              className="quick-add-field"
            />
            <Button
              type="submit"
              variant="primary"
              size="small"
              loading={loading}
              disabled={!title.trim() || loading}
              className="quick-add-btn"
            >
              <FaPlus /> Add
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default QuickAddTask;