/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import './CalendarPage.css';
import { taskService } from '../../services/api';
import { Dialog } from '../../components/common/Dialog';
import { TaskForm } from '../../components/forms/TaskForm';
import { Toast } from '../../components/common/Toast';
import {
  ChevronLeft, ChevronRight, CalendarDays, Plus,
  CheckCircle, Clock, AlertCircle, CheckSquare2,
} from 'lucide-react';

/* ─── helpers ─────────────────────────────────────────────────── */
const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

const toYMD = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const buildCalendarDays = (year, month) => {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells = [];

  // Previous month filler days
  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ date: new Date(year, month - 1, daysInPrevMonth - i), filler: true });
  }
  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(year, month, d), filler: false });
  }
  // Next month filler to complete the last row
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    cells.push({ date: new Date(year, month + 1, d), filler: true });
  }

  return cells;
};

const PRIORITY_CLS = {
  High:   'cal-chip--high',
  Medium: 'cal-chip--medium',
  Low:    'cal-chip--low',
};

const StatusIcon = ({ status }) => {
  if (status === 'Completed')  return <CheckCircle  className="cal-chip__icon" />;
  if (status === 'In Progress') return <Clock        className="cal-chip__icon cal-chip__icon--spin" />;
  return <AlertCircle className="cal-chip__icon" />;
};

/* ─── main component ──────────────────────────────────────────── */
export const CalendarPage = () => {
  const today = new Date();
  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [tasks,     setTasks]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [syncing,   setSyncing]   = useState(false);

  // Dialog state
  const [createDate,   setCreateDate]   = useState(null);  // string YYYY-MM-DD
  const [editingTask,  setEditingTask]  = useState(null);
  const [overflowDay,  setOverflowDay]  = useState(null);  // string YYYY-MM-DD

  // Toast
  const [toastMsg,  setToastMsg]  = useState(null);
  const [toastType, setToastType] = useState('success');
  const triggerToast = (msg, type = 'success') => { setToastMsg(msg); setToastType(type); };

  /* fetch all tasks (no filter — we need every date) */
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const data = await taskService.getAll();
      setTasks(data);
    } catch {
      triggerToast('Failed to load tasks.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  /* navigation */
  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };
  const goToday = () => { setViewYear(today.getFullYear()); setViewMonth(today.getMonth()); };

  /* task map: "YYYY-MM-DD" → Task[] */
  const taskMap = tasks.reduce((acc, t) => {
    if (!t.dueDate) return acc;
    const key = t.dueDate.slice(0, 10);
    if (!acc[key]) acc[key] = [];
    acc[key].push(t);
    return acc;
  }, {});

  /* month stats */
  const monthTasks = tasks.filter(t => {
    if (!t.dueDate) return false;
    const d = new Date(t.dueDate);
    return d.getFullYear() === viewYear && d.getMonth() === viewMonth;
  });
  const monthPending   = monthTasks.filter(t => t.status === 'Pending').length;
  const monthProgress  = monthTasks.filter(t => t.status === 'In Progress').length;
  const monthDone      = monthTasks.filter(t => t.status === 'Completed').length;

  /* CRUD */
  const handleCreateSubmit = async (data) => {
    setSyncing(true);
    try {
      await taskService.create(data);
      triggerToast('Task added to calendar!');
      setCreateDate(null);
      fetchTasks();
    } catch { triggerToast('Failed to create task.', 'error'); }
    finally { setSyncing(false); }
  };

  const handleEditSubmit = async (data) => {
    if (!editingTask) return;
    setSyncing(true);
    try {
      await taskService.update(editingTask.id, data);
      triggerToast('Task updated.');
      setEditingTask(null);
      fetchTasks();
    } catch { triggerToast('Failed to update task.', 'error'); }
    finally { setSyncing(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await taskService.delete(id);
      triggerToast('Task deleted.');
      setEditingTask(null);
      fetchTasks();
    } catch { triggerToast('Failed to delete task.', 'error'); }
  };

  const cells = buildCalendarDays(viewYear, viewMonth);
  const todayYMD = toYMD(today);

  return (
    <div className="cal-root">
      {toastMsg && <Toast message={toastMsg} type={toastType} onClose={() => setToastMsg(null)} />}

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="cal-header">
        <div className="cal-header__left">
          <CalendarDays className="cal-header__icon" />
          <div>
            <h2 className="cal-header__title">Calendar</h2>
            <p className="cal-header__sub">Schedule and track tasks across time.</p>
          </div>
        </div>
        <div className="cal-header__controls">
          <button className="cal-nav-btn" onClick={prevMonth} title="Previous month">
            <ChevronLeft style={{ width: '1rem', height: '1rem' }} />
          </button>
          <button className="cal-today-btn" onClick={goToday}>Today</button>
          <button className="cal-nav-btn" onClick={nextMonth} title="Next month">
            <ChevronRight style={{ width: '1rem', height: '1rem' }} />
          </button>
          <span className="cal-month-label">{MONTHS[viewMonth]} {viewYear}</span>
        </div>
      </div>

      {/* ── Stat Strip ─────────────────────────────────────────── */}
      <div className="cal-stat-strip">
        <div className="cal-stat">
          <span className="cal-stat__lbl">This Month</span>
          <span className="cal-stat__val">{monthTasks.length}</span>
        </div>
        <div className="cal-stat-divider" />
        <div className="cal-stat">
          <span className="cal-stat__dot" style={{ background: '#94a3b8' }} />
          <span className="cal-stat__lbl">Pending</span>
          <span className="cal-stat__val">{monthPending}</span>
        </div>
        <div className="cal-stat-divider" />
        <div className="cal-stat">
          <span className="cal-stat__dot" style={{ background: '#818cf8' }} />
          <span className="cal-stat__lbl">In Progress</span>
          <span className="cal-stat__val">{monthProgress}</span>
        </div>
        <div className="cal-stat-divider" />
        <div className="cal-stat">
          <span className="cal-stat__dot" style={{ background: '#34d399' }} />
          <span className="cal-stat__lbl">Completed</span>
          <span className="cal-stat__val">{monthDone}</span>
        </div>
        <button
          className="cal-add-btn"
          onClick={() => setCreateDate(toYMD(today))}
        >
          <Plus style={{ width: '0.875rem', height: '0.875rem' }} />
          Add Task
        </button>
      </div>

      {/* ── Day-of-week headers ─────────────────────────────────── */}
      <div className="cal-grid-header">
        {DAYS_OF_WEEK.map(d => (
          <div key={d} className="cal-grid-header__cell">{d}</div>
        ))}
      </div>

      {/* ── Calendar Grid ──────────────────────────────────────── */}
      {loading ? (
        <div className="cal-loading">
          <div className="cal-loading__spinner" />
          <p className="cal-loading__text">Loading calendar data…</p>
        </div>
      ) : (
        <div className="cal-grid">
          {cells.map((cell, idx) => {
            const ymd = toYMD(cell.date);
            const dayTasks = taskMap[ymd] || [];
            const isToday = ymd === todayYMD;
            const visible = dayTasks.slice(0, 3);
            const overflow = dayTasks.length - visible.length;
            const isOverflowOpen = overflowDay === ymd;

            return (
              <div
                key={idx}
                className={
                  'cal-cell' +
                  (cell.filler ? ' cal-cell--filler' : '') +
                  (isToday ? ' cal-cell--today' : '')
                }
                onClick={() => !cell.filler && setCreateDate(ymd)}
              >
                {/* Day number */}
                <div className={`cal-cell__num${isToday ? ' cal-cell__num--today' : ''}`}>
                  {cell.date.getDate()}
                  {!cell.filler && (
                    <span className="cal-cell__add-hint">
                      <Plus style={{ width: '0.625rem', height: '0.625rem' }} />
                    </span>
                  )}
                </div>

                {/* Task chips */}
                <div className="cal-cell__chips">
                  {visible.map(task => (
                    <button
                      key={task.id}
                      className={`cal-chip ${PRIORITY_CLS[task.priority] || ''} ${task.status === 'Completed' ? 'cal-chip--done' : ''}`}
                      onClick={e => { e.stopPropagation(); setEditingTask(task); }}
                      title={task.title}
                    >
                      <StatusIcon status={task.status} />
                      <span className="cal-chip__label">{task.title}</span>
                    </button>
                  ))}
                  {overflow > 0 && (
                    <div className="cal-overflow-wrap">
                      <button
                        className="cal-chip cal-chip--overflow"
                        onClick={e => { e.stopPropagation(); setOverflowDay(isOverflowOpen ? null : ymd); }}
                      >
                        +{overflow} more
                      </button>
                      {isOverflowOpen && (
                        <div
                          className="cal-overflow-popover"
                          onClick={e => e.stopPropagation()}
                        >
                          <div className="cal-overflow-popover__title">{ymd}</div>
                          {dayTasks.map(task => (
                            <button
                              key={task.id}
                              className={`cal-chip cal-chip--popover ${PRIORITY_CLS[task.priority] || ''} ${task.status === 'Completed' ? 'cal-chip--done' : ''}`}
                              onClick={() => { setOverflowDay(null); setEditingTask(task); }}
                            >
                              <StatusIcon status={task.status} />
                              <span className="cal-chip__label">{task.title}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Dialogs ────────────────────────────────────────────── */}
      <Dialog
        isOpen={!!createDate}
        onClose={() => setCreateDate(null)}
        title="Add Task"
      >
        <TaskForm
          initialData={{ dueDate: createDate || toYMD(today) }}
          onSubmit={handleCreateSubmit}
          onCancel={() => setCreateDate(null)}
          isSubmitting={syncing}
        />
      </Dialog>

      <Dialog
        isOpen={!!editingTask}
        onClose={() => setEditingTask(null)}
        title="Edit Task"
      >
        {editingTask && (
          <div>
            <TaskForm
              initialData={editingTask}
              onSubmit={handleEditSubmit}
              onCancel={() => setEditingTask(null)}
              isSubmitting={syncing}
            />
            <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '0.25rem', paddingTop: '0.75rem' }}>
              <button
                onClick={() => handleDelete(editingTask.id)}
                style={{
                  fontSize: '0.6875rem', fontWeight: 600,
                  color: '#f87171', background: 'transparent',
                  border: 'none', cursor: 'pointer', padding: '0.25rem 0',
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                onMouseLeave={e => e.currentTarget.style.color = '#f87171'}
              >
                Delete this task
              </button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
};
