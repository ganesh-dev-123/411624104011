import React, { useState, useEffect } from 'react';
import { useTasks } from '../context/TaskContext';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../components/layout/Layout';
import TaskCard from '../components/tasks/TaskCard';
import {
  FaPlus, FaSearch, FaFilter, FaTimes, FaSort,
  FaCheckCircle, FaClock, FaFire, FaStar, FaInbox
} from 'react-icons/fa';
import './Tasks.css';

const PRIORITIES = ['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
const STATUSES = ['ALL', 'PENDING', 'IN_PROGRESS', 'COMPLETED', 'ARCHIVED'];
const SORT_OPTIONS = [
  { value: 'created_desc', label: 'Newest First' },
  { value: 'created_asc', label: 'Oldest First' },
  { value: 'due_asc', label: 'Due Date (Soonest)' },
  { value: 'priority', label: 'Priority' },
  { value: 'title', label: 'Title A–Z' },
];

const TaskModal = ({ task, onClose, onSave }) => {
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    priority: task?.priority || 'MEDIUM',
    status: task?.status || 'PENDING',
    due_date: task?.due_date ? task.due_date.slice(0, 16) : '',
    notes: task?.notes || '',
    emoji: task?.emoji || '',
    is_favorite: task?.is_favorite || false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError('Title is required'); return; }
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        due_date: form.due_date ? new Date(form.due_date).toISOString() : null,
        emoji: form.emoji || null,
        notes: form.notes || null,
        description: form.description || null,
      };
      await onSave(payload);
      onClose();
    } catch (err) {
      setError('Failed to save task. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div
        className="modal-box"
        onClick={e => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
      >
        <div className="modal-header">
          <h2>{task ? 'Edit Task' : 'Create New Task'}</h2>
          <button className="modal-close" onClick={onClose}><FaTimes /></button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && <div className="modal-error">{error}</div>}

          <div className="form-row">
            <div className="form-group emoji-group">
              <label>Emoji</label>
              <input
                type="text"
                name="emoji"
                value={form.emoji}
                onChange={handleChange}
                placeholder="📋"
                maxLength={2}
                className="emoji-input"
              />
            </div>
            <div className="form-group flex-1">
              <label>Title *</label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="What needs to be done?"
                className="form-input"
                autoFocus
              />
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Add more details..."
              className="form-textarea"
              rows={3}
            />
          </div>

          <div className="form-row">
            <div className="form-group flex-1">
              <label>Priority</label>
              <select name="priority" value={form.priority} onChange={handleChange} className="form-select">
                <option value="LOW">🟢 Low</option>
                <option value="MEDIUM">🔵 Medium</option>
                <option value="HIGH">🟡 High</option>
                <option value="CRITICAL">🔴 Critical</option>
              </select>
            </div>
            <div className="form-group flex-1">
              <label>Status</label>
              <select name="status" value={form.status} onChange={handleChange} className="form-select">
                <option value="PENDING">⏳ Pending</option>
                <option value="IN_PROGRESS">🔄 In Progress</option>
                <option value="COMPLETED">✅ Completed</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Due Date & Time</label>
            <input
              type="datetime-local"
              name="due_date"
              value={form.due_date}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Notes</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Any additional notes..."
              className="form-textarea"
              rows={2}
            />
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="is_favorite"
                checked={form.is_favorite}
                onChange={handleChange}
              />
              <FaStar className="star-icon" /> Mark as favorite
            </label>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-save" disabled={saving}>
              {saving ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const Tasks = () => {
  const { tasks, loading, addTask, editTask, removeTask } = useTasks();
  const [search, setSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [sortBy, setSortBy] = useState('created_desc');
  const [showFilters, setShowFilters] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const handleSave = async (payload) => {
    if (editingTask) {
      await editTask(editingTask.id, payload);
    } else {
      await addTask(payload);
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setShowModal(true);
  };

  const handleDelete = async (taskId) => {
    await removeTask(taskId);
    setConfirmDelete(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTask(null);
  };

  // Filter + sort
  const filtered = tasks
    .filter(t => {
      const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
        (t.description || '').toLowerCase().includes(search.toLowerCase());
      const matchPriority = filterPriority === 'ALL' || t.priority === filterPriority;
      const matchStatus = filterStatus === 'ALL' || t.status === filterStatus;
      return matchSearch && matchPriority && matchStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'created_asc': return new Date(a.created_at) - new Date(b.created_at);
        case 'created_desc': return new Date(b.created_at) - new Date(a.created_at);
        case 'due_asc': {
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return new Date(a.due_date) - new Date(b.due_date);
        }
        case 'priority': {
          const order = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
          return (order[a.priority] ?? 2) - (order[b.priority] ?? 2);
        }
        case 'title': return a.title.localeCompare(b.title);
        default: return 0;
      }
    });

  const counts = {
    all: tasks.length,
    pending: tasks.filter(t => t.status === 'PENDING').length,
    inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
    completed: tasks.filter(t => t.status === 'COMPLETED').length,
    favorite: tasks.filter(t => t.is_favorite).length,
  };

  const activeFilterCount = [
    filterPriority !== 'ALL',
    filterStatus !== 'ALL',
    search !== '',
  ].filter(Boolean).length;

  return (
    <Layout>
      <div className="tasks-page">
        {/* Header */}
        <div className="tasks-header">
          <div>
            <h1>My Tasks</h1>
            <p className="tasks-subtitle">{counts.all} total · {counts.pending} pending · {counts.completed} done</p>
          </div>
          <button className="btn-new-task" onClick={() => { setEditingTask(null); setShowModal(true); }}>
            <FaPlus /> New Task
          </button>
        </div>

        {/* Quick Stats */}
        <div className="tasks-quick-stats">
          <div className="quick-stat">
            <FaInbox className="qs-icon qs-total" />
            <div>
              <span className="qs-value">{counts.all}</span>
              <span className="qs-label">Total</span>
            </div>
          </div>
          <div className="quick-stat">
            <FaClock className="qs-icon qs-pending" />
            <div>
              <span className="qs-value">{counts.pending}</span>
              <span className="qs-label">Pending</span>
            </div>
          </div>
          <div className="quick-stat">
            <FaFire className="qs-icon qs-progress" />
            <div>
              <span className="qs-value">{counts.inProgress}</span>
              <span className="qs-label">In Progress</span>
            </div>
          </div>
          <div className="quick-stat">
            <FaCheckCircle className="qs-icon qs-done" />
            <div>
              <span className="qs-value">{counts.completed}</span>
              <span className="qs-label">Completed</span>
            </div>
          </div>
          <div className="quick-stat">
            <FaStar className="qs-icon qs-fav" />
            <div>
              <span className="qs-value">{counts.favorite}</span>
              <span className="qs-label">Favorites</span>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="tasks-toolbar">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="search-input"
            />
            {search && (
              <button className="search-clear" onClick={() => setSearch('')}><FaTimes /></button>
            )}
          </div>

          <div className="toolbar-right">
            <button
              className={`btn-filter ${showFilters ? 'active' : ''}`}
              onClick={() => setShowFilters(v => !v)}
            >
              <FaFilter />
              Filters
              {activeFilterCount > 0 && <span className="filter-badge">{activeFilterCount}</span>}
            </button>

            <div className="sort-select-wrapper">
              <FaSort className="sort-icon" />
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="sort-select">
                {SORT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              className="filters-panel"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="filter-group">
                <label>Priority</label>
                <div className="filter-chips">
                  {PRIORITIES.map(p => (
                    <button
                      key={p}
                      className={`filter-chip ${filterPriority === p ? 'active' : ''}`}
                      onClick={() => setFilterPriority(p)}
                    >
                      {p === 'ALL' ? 'All' : p.charAt(0) + p.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>
              <div className="filter-group">
                <label>Status</label>
                <div className="filter-chips">
                  {STATUSES.map(s => (
                    <button
                      key={s}
                      className={`filter-chip ${filterStatus === s ? 'active' : ''}`}
                      onClick={() => setFilterStatus(s)}
                    >
                      {s === 'ALL' ? 'All' : s.replace('_', ' ').charAt(0) + s.replace('_', ' ').slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>
              {activeFilterCount > 0 && (
                <button
                  className="clear-filters"
                  onClick={() => { setFilterPriority('ALL'); setFilterStatus('ALL'); setSearch(''); }}
                >
                  <FaTimes /> Clear all filters
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Task List */}
        <div className="tasks-list-section">
          {loading ? (
            <div className="tasks-loading">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="task-skeleton">
                  <div className="skeleton-title" />
                  <div className="skeleton-line" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="tasks-empty">
              <span className="empty-icon">📭</span>
              <h3>{search || activeFilterCount > 0 ? 'No tasks match your filters' : 'No tasks yet'}</h3>
              <p>
                {search || activeFilterCount > 0
                  ? 'Try adjusting your search or filters.'
                  : 'Click "New Task" to create your first task!'}
              </p>
              {(search || activeFilterCount > 0) && (
                <button className="btn-clear-search" onClick={() => { setSearch(''); setFilterPriority('ALL'); setFilterStatus('ALL'); }}>
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="tasks-grid">
              <AnimatePresence>
                {filtered.map((task, i) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2, delay: i * 0.03 }}
                  >
                    <TaskCard
                      task={task}
                      onEdit={() => handleEdit(task)}
                      onDelete={() => setConfirmDelete(task.id)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Task Modal */}
        <AnimatePresence>
          {showModal && (
            <TaskModal
              task={editingTask}
              onClose={handleCloseModal}
              onSave={handleSave}
            />
          )}
        </AnimatePresence>

        {/* Delete Confirm */}
        <AnimatePresence>
          {confirmDelete && (
            <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
              <motion.div
                className="confirm-box"
                onClick={e => e.stopPropagation()}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <h3>Delete Task?</h3>
                <p>This action cannot be undone.</p>
                <div className="confirm-actions">
                  <button className="btn-cancel" onClick={() => setConfirmDelete(null)}>Cancel</button>
                  <button className="btn-danger" onClick={() => handleDelete(confirmDelete)}>Delete</button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

export default Tasks;
