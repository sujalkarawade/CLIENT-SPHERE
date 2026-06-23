/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useForm } from 'react-hook-form';

const PRIORITIES = ['Low', 'Medium', 'High'];
const STATUSES   = ['Pending', 'In Progress', 'Completed'];

const fieldBase   = 'w-full rounded border px-3 py-1.5 text-xs focus:outline-none transition-colors';
const fieldNormal = 'border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:border-indigo-500';
const fieldError  = 'border-rose-500/50 bg-[var(--bg-secondary)] text-[var(--text-primary)]';

export const TaskForm = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title:       initialData?.title       || '',
      description: initialData?.description || '',
      priority:    initialData?.priority    || 'Medium',
      dueDate:     initialData?.dueDate     || new Date().toISOString().split('T')[0],
      status:      initialData?.status      || 'Pending',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Task Title */}
      <div>
        <label style={{ color: 'var(--text-subtle)' }} className="block text-xs font-bold uppercase tracking-wider mb-1.5">
          Task Title *
        </label>
        <input
          type="text"
          placeholder="e.g. Schedule Stark industries sync"
          className={`${fieldBase} ${errors.title ? fieldError : fieldNormal}`}
          {...register('title', { required: 'Task title is required' })}
        />
        {errors.title && <p className="mt-1 text-xs text-rose-400 font-medium">{errors.title.message}</p>}
      </div>

      {/* Due Date */}
      <div>
        <label style={{ color: 'var(--text-subtle)' }} className="block text-xs font-bold uppercase tracking-wider mb-1.5">
          Due Date *
        </label>
        <input
          type="date"
          style={{ colorScheme: 'dark' }}
          className={`${fieldBase} ${errors.dueDate ? fieldError : fieldNormal}`}
          {...register('dueDate', { required: 'Due date is mandatory' })}
        />
        {errors.dueDate && <p className="mt-1 text-xs text-rose-400 font-medium">{errors.dueDate.message}</p>}
      </div>

      {/* Priority + Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label style={{ color: 'var(--text-subtle)' }} className="block text-xs font-bold uppercase tracking-wider mb-1.5">
            Priority Rank
          </label>
          <select
            style={{ colorScheme: 'dark' }}
            className={`${fieldBase} ${fieldNormal} cursor-pointer`}
            {...register('priority')}
          >
            {PRIORITIES.map(pr => <option key={pr} value={pr}>{pr} Priority</option>)}
          </select>
        </div>

        <div>
          <label style={{ color: 'var(--text-subtle)' }} className="block text-xs font-bold uppercase tracking-wider mb-1.5">
            Progress Status
          </label>
          <select
            style={{ colorScheme: 'dark' }}
            className={`${fieldBase} ${fieldNormal} cursor-pointer`}
            {...register('status')}
          >
            {STATUSES.map(st => <option key={st} value={st}>{st}</option>)}
          </select>
        </div>
      </div>

      {/* Description */}
      <div>
        <label style={{ color: 'var(--text-subtle)' }} className="block text-xs font-bold uppercase tracking-wider mb-1.5">
          Description
        </label>
        <textarea
          rows={3}
          placeholder="Briefly state what must be accomplished..."
          className={`${fieldBase} ${fieldNormal} resize-none`}
          {...register('description')}
        />
      </div>

      {/* Actions */}
      <div
        style={{ borderTop: '1px solid var(--border-color)' }}
        className="flex justify-end gap-3 pt-4"
      >
        <button
          type="button"
          onClick={onCancel}
          style={{ color: 'var(--text-muted)', borderColor: 'transparent' }}
          className="px-4 py-1.5 rounded border text-xs font-semibold transition-colors duration-150 hover:border-[var(--border-color)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
        >
          Dismiss
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-1.5 rounded bg-indigo-600 hover:bg-indigo-500 px-4 py-1.5 text-xs font-bold text-white shadow-sm focus:outline-none transition-colors duration-150 disabled:opacity-60"
        >
          {isSubmitting ? 'Synchronizing...' : 'Save Task'}
        </button>
      </div>
    </form>
  );
};