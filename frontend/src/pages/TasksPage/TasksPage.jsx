/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import './TasksPage.css';
import { taskService } from '../../services/api';
import { Dialog } from '../../components/common/Dialog';
import { TaskForm } from '../../components/forms/TaskForm';
import { Toast } from '../../components/common/Toast';
import { Plus, Calendar, CheckCircle, Clock, Edit, Trash2, CheckSquare, Square, Inbox, AlertCircle } from 'lucide-react';

export const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);
  const [toastType, setToastType] = useState('success');
  const [syncing, setSyncing] = useState(false);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await taskService.getAll({ status: filterStatus || undefined });
      setTasks(data);
    } catch {
      triggerToast('Failed to retrieve task directory.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTasks(); }, [filterStatus]);

  const triggerToast = (msg, type) => { setToastMsg(msg); setToastType(type); };

  const handleCreateSubmit = async (data) => {
    setSyncing(true);
    try {
      await taskService.create(data);
      triggerToast('Task registered successfully.', 'success');
      setIsCreateOpen(false);
      fetchTasks();
    } catch { triggerToast('Failed to create new task.', 'error'); }
    finally { setSyncing(false); }
  };

  const handleEditSubmit = async (data) => {
    if (!editingTask) return;
    setSyncing(true);
    try {
      await taskService.update(editingTask.id, data);
      triggerToast('Task updated.', 'success');
      setEditingTask(null);
      fetchTasks();
    } catch { triggerToast('Failed to update task records.', 'error'); }
    finally { setSyncing(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await taskService.delete(id);
      triggerToast('Task deleted successfully.', 'success');
      fetchTasks();
    } catch { triggerToast('Failed to delete task.', 'error'); }
  };

  const toggleComplete = async (task) => {
    try {
      const nextStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
      await taskService.update(task.id, { title: task.title, description: task.description, priority: task.priority, dueDate: task.dueDate, status: nextStatus });
      triggerToast(nextStatus === 'Completed' ? 'Task marked complete!' : 'Task returned to queue.', 'success');
      fetchTasks();
    } catch { triggerToast('Failed to update status.', 'error'); }
  };

  const priorityModMap = {
    High: 'tp-card__priority--high',
    Medium: 'tp-card__priority--medium',
    Low: 'tp-card__priority--low',
  };

  const getStatusIcon = (status) => {
    if (status === 'Completed')  return <CheckCircle className="tp-status-icon--done"     style={{ width: '0.875rem', height: '0.875rem' }} />;
    if (status === 'In Progress')return <Clock       className="tp-status-icon--progress" style={{ width: '0.875rem', height: '0.875rem' }} />;
    return                               <AlertCircle className="tp-status-icon--pending"  style={{ width: '0.875rem', height: '0.875rem' }} />;
  };

  const STATUS_TABS = ['All', 'Pending', 'In Progress', 'Completed'];

  return (
    <div className="tp-root">
      {toastMsg && <Toast message={toastMsg} type={toastType} onClose={() => setToastMsg(null)} />}

      {/* Header */}
      <div className="tp-header">
        <div>
          <h2 className="tp-header__title">Tasks</h2>
          <p className="tp-header__subtitle">Coordinate agenda schedules, follow-up callbacks, and prioritize tasks.</p>
        </div>
        <button className="tp-header__btn" onClick={() => setIsCreateOpen(true)}>
          <Plus className="tp-header__btn-icon" />
          Add Task
        </button>
      </div>

      {/* Filter tabs */}
      <div className="tp-filter-bar">
        {STATUS_TABS.map((st) => (
          <button
            key={st}
            className={'tp-filter-tab ' + (filterStatus === st ? 'tp-filter-tab--active' : '')}
            onClick={() => setFilterStatus(st)}
          >
            {st} Tasks
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="tp-loading">
          <div className="tp-loading__inner">
            <div className="tp-loading__spinner" />
            <p className="tp-loading__text">Querying tasks...</p>
          </div>
        </div>
      ) : tasks.length > 0 ? (
        <div className="tp-cards-grid">
          {tasks.map((task) => {
            const done = task.status === 'Completed';
            return (
              <div key={task.id} className={'tp-card ' + (done ? 'tp-card--completed' : '')}>
                <button
                  className={'tp-card__checkbox ' + (done ? 'tp-card__checkbox--done' : '')}
                  onClick={() => toggleComplete(task)}
                  title={done ? 'Mark incomplete' : 'Mark complete'}
                >
                  {done
                    ? <CheckSquare style={{ width: '1.125rem', height: '1.125rem' }} />
                    : <Square      style={{ width: '1.125rem', height: '1.125rem' }} />
                  }
                </button>

                <div className="tp-card__body">
                  <div>
                    <div className="tp-card__tags">
                      <span className={'tp-card__priority ' + priorityModMap[task.priority]}>{task.priority}</span>
                      <span className="tp-card__status-tag">
                        {getStatusIcon(task.status)}
                        {task.status}
                      </span>
                    </div>
                    <h3 className={'tp-card__title ' + (done ? 'tp-card__title--done' : '')}>{task.title}</h3>
                    {task.description && (
                      <p className={'tp-card__desc ' + (done ? 'tp-card__desc--done' : '')}>{task.description}</p>
                    )}
                  </div>
                  <div className="tp-card__footer">
                    <span className="tp-card__due">
                      <Calendar style={{ width: '0.875rem', height: '0.875rem' }} />
                      Due {task.dueDate}
                    </span>
                    <div className="tp-card__actions">
                      <button className="tp-btn-edit" onClick={() => setEditingTask(task)} title="Edit">
                        <Edit style={{ width: '0.875rem', height: '0.875rem' }} />
                      </button>
                      <button className="tp-btn-delete" onClick={() => handleDelete(task.id)} title="Delete">
                        <Trash2 style={{ width: '0.875rem', height: '0.875rem' }} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="tp-empty">
          <Inbox className="tp-empty__icon" style={{ width: '1.75rem', height: '1.75rem' }} />
          <h3 className="tp-empty__title">No active tasks found</h3>
          <p className="tp-empty__text">You're all clear! Switch filters or register a new task.</p>
        </div>
      )}

      <Dialog isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Add Task">
        <TaskForm onSubmit={handleCreateSubmit} onCancel={() => setIsCreateOpen(false)} isSubmitting={syncing} />
      </Dialog>
      <Dialog isOpen={!!editingTask} onClose={() => setEditingTask(null)} title="Edit Task">
        {editingTask && (
          <TaskForm initialData={editingTask} onSubmit={handleEditSubmit} onCancel={() => setEditingTask(null)} isSubmitting={syncing} />
        )}
      </Dialog>
    </div>
  );
};