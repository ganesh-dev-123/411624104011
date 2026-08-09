import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../components/layout/Layout';
import { useTasks } from '../context/TaskContext';
import { useTheme } from '../context/ThemeContext';
import ModeIcon from '../components/common/ModeIcon';
import ModeText from '../components/common/ModeText';
import { FaCircle, FaTimes } from 'react-icons/fa';
import './Calendar.css';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const TaskPill = ({ task }) => (
  <div
    className="cal-task-pill"
    style={{ borderLeftColor: `var(--priority-${task.priority?.toLowerCase() || 'medium'})` }}
    title={task.title}
  >
    <span className="pill-dot" style={{ background: `var(--priority-${task.priority?.toLowerCase() || 'medium'})` }} />
    <span className="pill-text">{task.emoji || ''} {task.title}</span>
  </div>
);

const DayDetail = ({ date, tasks, onClose }) => {
  const { isKid } = useTheme();
  const dateLabel = date.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <motion.div
      className="day-detail-panel"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2 }}
    >
      <div className="day-detail-header">
        <div>
          <h3 className="day-detail-title">{dateLabel}</h3>
          <p className="day-detail-sub">{tasks.length} task{tasks.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="day-detail-close" onClick={onClose}><ModeIcon name="close" /></button>
      </div>

      <div className="day-detail-list">
        {tasks.length === 0 ? (
          <div className="day-empty">
            <ModeIcon name="calendar" />
            <p><ModeText name="empty-calendar" /></p>
          </div>
        ) : (
          tasks.map(task => (
            <div key={task.id} className="day-task-card">
              <div className="day-task-top">
                <span className="day-task-emoji">{task.emoji || <ModeIcon name="brand" />}</span>
                <span className="day-task-title">{task.title}</span>
                <span
                  className="day-task-status"
                  style={{ color: `var(--priority-${task.priority?.toLowerCase() || 'medium'})` }}
                >
                  {task.status?.replace('_', ' ')}
                </span>
              </div>
              {task.description && (
                <p className="day-task-desc">{task.description}</p>
              )}
              <div className="day-task-meta">
                <span
                  className="day-task-priority"
                  style={{ color: `var(--priority-${task.priority?.toLowerCase() || 'medium'})` }}
                >
                  <FaCircle style={{ fontSize: 7 }} /> {task.priority}
                </span>
                {task.due_time && (
                  <span className="day-task-time"><ModeIcon name="calendar" /> {task.due_time}</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
};

const Calendar = () => {
  const { tasks } = useTasks();
  const { isKid } = useTheme();
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDay, setSelectedDay] = useState(null);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));
  const goToday = () => { setViewDate(new Date(today.getFullYear(), today.getMonth(), 1)); setSelectedDay(null); };

  // Build calendar grid
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const calendarCells = useMemo(() => {
    const cells = [];
    // Leading days from prev month
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      cells.push({ day: daysInPrevMonth - i, thisMonth: false, date: new Date(year, month - 1, daysInPrevMonth - i) });
    }
    // Days of current month
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ day: d, thisMonth: true, date: new Date(year, month, d) });
    }
    // Trailing days from next month
    const remaining = 42 - cells.length;
    for (let d = 1; d <= remaining; d++) {
      cells.push({ day: d, thisMonth: false, date: new Date(year, month + 1, d) });
    }
    return cells;
  }, [year, month, firstDayOfMonth, daysInMonth, daysInPrevMonth]);

  // Map tasks by date string
  const tasksByDate = useMemo(() => {
    const map = {};
    tasks.forEach(task => {
      if (task.due_date) {
        const key = new Date(task.due_date).toDateString();
        if (!map[key]) map[key] = [];
        map[key].push(task);
      }
    });
    return map;
  }, [tasks]);

  const selectedDayTasks = selectedDay ? (tasksByDate[selectedDay.toDateString()] || []) : [];

  const isToday = (date) => date.toDateString() === today.toDateString();
  const isSelected = (date) => selectedDay && date.toDateString() === selectedDay.toDateString();

  // Tasks with no due date
  const unscheduled = tasks.filter(t => !t.due_date && t.status !== 'COMPLETED' && t.status !== 'ARCHIVED');

  return (
    <Layout>
      <div className={`calendar-page ${isKid ? 'calendar-page-kid' : ''}`}>
        {/* Header */}
        <motion.div
          className="cal-header"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div>
            <h1><ModeText name="nav-calendar" /></h1>
            <p className="cal-subtitle">{isKid ? 'See when your tasks are due!' : 'View tasks by due date'}</p>
          </div>
          <div className="cal-nav">
            <button className="btn-today" onClick={goToday}>{isKid ? 'Today!' : 'Today'}</button>
            <button className="cal-nav-btn" onClick={prevMonth}><ModeIcon name="prev" /></button>
            <span className="cal-month-label">{MONTHS[month]} {year}</span>
            <button className="cal-nav-btn" onClick={nextMonth}><ModeIcon name="next" /></button>
          </div>
        </motion.div>

        <div className={`cal-layout ${selectedDay ? 'has-panel' : ''}`}>
          {/* Calendar Grid */}
          <motion.div
            className="cal-grid-wrapper"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            {/* Day names */}
            <div className="cal-day-names">
              {DAYS.map(d => (
                <div key={d} className="cal-day-name">{d}</div>
              ))}
            </div>

            {/* Cells */}
            <div className="cal-cells">
              {calendarCells.map((cell, i) => {
                const cellTasks = tasksByDate[cell.date.toDateString()] || [];
                const hasTasks = cellTasks.length > 0;
                const hasOverdue = cellTasks.some(t =>
                  t.status !== 'COMPLETED' && new Date(t.due_date) < today
                );

                return (
                  <div
                    key={i}
                    className={[
                      'cal-cell',
                      !cell.thisMonth && 'cal-cell--other',
                      isToday(cell.date) && 'cal-cell--today',
                      isSelected(cell.date) && 'cal-cell--selected',
                      hasTasks && 'cal-cell--has-tasks',
                      hasOverdue && 'cal-cell--overdue',
                    ].filter(Boolean).join(' ')}
                    onClick={() => setSelectedDay(isSelected(cell.date) ? null : cell.date)}
                  >
                    <span className="cal-cell-day">{cell.day}</span>
                    {hasTasks && (
                      <div className="cal-cell-tasks">
                        {cellTasks.slice(0, 3).map(task => (
                          <TaskPill key={task.id} task={task} />
                        ))}
                        {cellTasks.length > 3 && (
                          <span className="cal-more">+{cellTasks.length - 3} more</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Day Detail Panel */}
          <AnimatePresence>
            {selectedDay && (
              <DayDetail
                date={selectedDay}
                tasks={selectedDayTasks}
                onClose={() => setSelectedDay(null)}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Unscheduled Tasks */}
        {unscheduled.length > 0 && (
          <motion.div
            className="cal-unscheduled"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <h3 className="unsched-title">📥 Unscheduled Tasks ({unscheduled.length})</h3>
            <p className="unsched-sub">These tasks have no due date set.</p>
            <div className="unsched-list">
              {unscheduled.map(task => (
                <div key={task.id} className="unsched-item">
                  <span>{task.emoji || '📋'}</span>
                  <span className="unsched-name">{task.title}</span>
                  <span
                    className="unsched-priority"
                    style={{ color: `var(--priority-${task.priority?.toLowerCase() || 'medium'})` }}
                  >
                    {task.priority}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Legend */}
        <div className="cal-legend">
          <span className="legend-item"><span className="legend-dot" style={{ background: '#10b981' }} />Completed</span>
          <span className="legend-item"><span className="legend-dot" style={{ background: '#3b82f6' }} />In Progress</span>
          <span className="legend-item"><span className="legend-dot" style={{ background: '#f59e0b' }} />Pending</span>
          <span className="legend-item"><span className="legend-dot" style={{ background: '#ef4444' }} />Overdue</span>
        </div>
      </div>
    </Layout>
  );
};

export default Calendar;
