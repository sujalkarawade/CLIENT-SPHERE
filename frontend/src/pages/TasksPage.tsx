/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { taskService } from '../services/api';
import { Task, TaskPriority, TaskStatus } from '../types';
import { Dialog } from '../components/common/Dialog';
import { TaskForm } from '../components/forms/TaskForm';
import { Toast, ToastType } from '../components/common/Toast';
import {
  Plus,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  Edit,
  Trash2,
  Filter,
  CheckSquare,
  Square,
  Inbox,
  AlertTriangle,
  Play
} from 'lucide-react';

export const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterStatus, setFilterStatus] = useState<string>('All');

  // Dialog parameters
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Toast parameters
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [toastType, setToastType] = useState<ToastType>('success');
  const [syncing, setSyncing] = useState<boolean>(false);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await taskService.getAll({
        status: filterStatus || undefined
      });
      setTasks(data);
    } catch (err) {
      triggerToast('Failed to retrieve task directory.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [filterStatus]);

  const triggerToast = (msg: string, type: ToastType) => {
    setToastMsg(msg);
    setToastType(type);
  };

  const handleCreateSubmit = async (data: Omit<Task, 'id' | 'createdAt'>) => {
    setSyncing(true);
    try {
      await taskService.create(data);
      triggerToast('Task registered successfully.', 'success');
      setIsCreateOpen(false);
      fetchTasks();
    } catch (err) {
      triggerToast('Failed to create new task.', 'error');
    } finally {
      setSyncing(false);
    }
  };

  const handleEditSubmit = async (data: Omit<Task, 'id' | 'createdAt'>) => {
    if (!editingTask) return;
    setSyncing(true);
    try {
      await taskService.update(editingTask.id, data);
      triggerToast('Task updated.', 'success');
      setEditingTask(null);
      fetchTasks();
    } catch (err) {
      triggerToast('Failed to update task records.', 'error');
    } finally {
      setSyncing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you absolutely sure you want to delete this task?')) return;
    try {
      await taskService.delete(id);
      triggerToast('Task deleted successfully.', 'success');
      fetchTasks();
    } catch (err) {
      triggerToast('Failed to delete task.', 'error');
    }
  };

  // Check off completion trigger
  const toggleComplete = async (task: Task) => {
    try {
      const nextStatus: TaskStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
      await taskService.update(task.id, {
        title: task.title,
        description: task.description,
        priority: task.priority,
        dueDate: task.dueDate,
        status: nextStatus
      });
      triggerToast(
        nextStatus === 'Completed' ? 'Task marked complete!' : 'Task returned to queue.',
        'success'
      );
      fetchTasks();
    } catch (err) {
      triggerToast('Failed to update status hooks.', 'error');
    }
  };

  // Check priority badgings
  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case 'High':
        return 'text-rose-400 bg-rose-500/10 border border-rose-500/20';
      case 'Medium':
        return 'text-amber-400 bg-amber-500/10 border border-amber-500/20';
      default:
        return 'text-zinc-400 bg-[#18181b] border border-[#27272a]';
    }
  };

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />;
      case 'In Progress':
        return <Clock className="w-3.5 h-3.5 text-[#6366f1] animate-spin" style={{ animationDuration: '3s' }} />;
      default:
        return <AlertCircle className="w-3.5 h-3.5 text-zinc-500" />;
    }
  };

  return (
    <div className="space-y-6 animate-none">
      {toastMsg && (
        <Toast
          message={toastMsg}
          type={toastType}
          onClose={() => setToastMsg(null)}
        />
      )}

      {/* Header and create triggers */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#27272a] pb-4">
        <div>
          <h2 className="font-display text-base font-bold text-white tracking-tight">Tasks</h2>
          <p className="text-[11px] text-zinc-500 mt-0.5">Coordinate agenda schedules, follow-up callbacks, and prioritize tasks.</p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center justify-center gap-1.5 rounded bg-[#18181b] border border-[#27272a] hover:bg-[#27272a] px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition duration-150 shrink-0 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5 text-[#6366f1]" />
          Add Task
        </button>
      </div>

      {/* Filter and stats selectors overview */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#09090b] p-2 border border-[#27272a] rounded-lg">
        <div className="flex flex-wrap items-center gap-1">
          {['All', 'Pending', 'In Progress', 'Completed'].map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1 rounded text-xs font-semibold transition-all duration-150 border ${
                (st === 'All' && filterStatus === 'All') || filterStatus === st
                  ? 'bg-[#18181b] text-white border-[#27272a] shadow-sm'
                  : 'text-zinc-400 bg-transparent hover:text-white border-transparent'
              }`}
            >
              {st} Tasks
            </button>
          ))}
        </div>
      </div>

      {/* Task core listing dashboard container */}
      {loading ? (
        <div className="h-44 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-2 border-[#27272a] border-t-[#6366f1] rounded-full animate-spin" />
            <p className="text-[11px] text-zinc-500 font-mono">Querying tasks...</p>
          </div>
        </div>
      ) : tasks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tasks.map((task) => {
            const isCompleted = task.status === 'Completed';
            return (
              <div
                key={task.id}
                className={`bg-[#09090b] border p-4 rounded-lg shadow-sm hover:border-[#3f3f46] transition-all duration-120 flex items-start gap-3 relative overflow-hidden group border-[#27272a] ${
                  isCompleted ? 'bg-[#18181b]/40 border-[#27272a]/70 opacity-80' : ''
                }`}
              >
                {/* Checkbox trigger panel */}
                <button
                  onClick={() => toggleComplete(task)}
                  className="mt-0.5 shrink-0 text-zinc-500 hover:text-zinc-300 transition-colors duration-150 cursor-pointer"
                  title={isCompleted ? 'Mark incomplete' : 'Mark completed'}
                >
                  {isCompleted ? (
                    <CheckSquare className="w-4.5 h-4.5 text-emerald-400" />
                  ) : (
                    <Square className="w-4.5 h-4.5 text-zinc-700 hover:text-zinc-500" />
                  )}
                </button>

                <div className="min-w-0 flex-1 flex flex-col justify-between h-full min-h-[84px]">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap mb-1">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${getPriorityBadge(task.priority)}`}>
                        {task.priority}
                      </span>
                      <span className="flex items-center gap-1 text-[9px] font-semibold text-zinc-500 bg-[#18181b] px-1.5 py-0.5 rounded border border-[#27272a]">
                        {getStatusIcon(task.status)}
                        {task.status}
                      </span>
                    </div>

                    <h3 className={`font-display text-sm font-semibold tracking-tight leading-snug ${
                      isCompleted ? 'line-through text-zinc-600' : 'text-zinc-100'
                    }`}>
                      {task.title}
                    </h3>
                    
                    {task.description && (
                      <p className={`text-[11px] mt-1 leading-relaxed ${isCompleted ? 'text-zinc-700' : 'text-zinc-500'}`}>
                        {task.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between border-t border-[#27272a]/60 pt-2.5 mt-3">
                    <span className="flex items-center gap-1 text-[10px] font-mono font-semibold text-zinc-500">
                      <Calendar className="w-3.5 h-3.5 text-zinc-655" />
                      Due {task.dueDate}
                    </span>
                    <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        onClick={() => setEditingTask(task)}
                        className="text-zinc-500 hover:text-white p-1 rounded hover:bg-[#18181b] border border-transparent hover:border-[#27272a]"
                        title="Edit task"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(task.id)}
                        className="text-zinc-500 hover:text-rose-450 p-1 rounded hover:bg-[#18181b] border border-transparent hover:border-[#27272a]"
                        title="Delete task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="border border-[#27272a] border-dashed rounded-lg p-10 text-center bg-transparent">
          <Inbox className="w-7 h-7 text-zinc-700 mx-auto mb-2.5" />
          <h3 className="font-display text-xs font-semibold text-white">No active tasks found</h3>
          <p className="text-[11px] text-zinc-500 mt-0.5 max-w-xs mx-auto">
            You're all clear! Switch filters or register a new task.
          </p>
        </div>
      )}

      {/* CREATE DIALOG OVERLAY */}
      <Dialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Add Task"
      >
        <TaskForm
          onSubmit={handleCreateSubmit}
          onCancel={() => setIsCreateOpen(false)}
          isSubmitting={syncing}
        />
      </Dialog>

      {/* EDIT DIALOG OVERLAY */}
      <Dialog
        isOpen={!!editingTask}
        onClose={() => setEditingTask(null)}
        title="Edit Task"
      >
        {editingTask && (
          <TaskForm
            initialData={editingTask}
            onSubmit={handleEditSubmit}
            onCancel={() => setEditingTask(null)}
            isSubmitting={syncing}
          />
        )}
      </Dialog>
    </div>
  );
};
