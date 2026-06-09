/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useForm } from 'react-hook-form';

const PRIORITIES = ['Low', 'Medium', 'High'];
const STATUSES = ['Pending', 'In Progress', 'Completed'];

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
      title: initialData?.title || '',
      description: initialData?.description || '',
      priority: initialData?.priority || 'Medium',
      dueDate: initialData?.dueDate || new Date().toISOString().split('T')[0],
      status: initialData?.status || 'Pending',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
          Task Title *
        </label>
        <input
          type="text"
          placeholder="e.g. Schedule Stark industries sync"
          className={'w-full bg-[#18181b] rounded border px-3 py-1.5 text-xs text-white focus:outline-none focus:border-zinc-500 transition-colors ' +
            (errors.title
              ? 'border-rose-500/50'
              : 'border-[#27272a]')
          }
          {...register('title', { required: 'Task title is required' })}
        />
        {errors.title && <p className="mt-1 text-xs text-rose-455 font-medium">{errors.title.message}</p>}
      </div>

      <div>
        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
          Due Date *
        </label>
        <input
          type="date"
          className={'w-full bg-[#18181b] rounded border px-3 py-1.5 text-xs text-white focus:outline-none focus:border-zinc-500 transition-colors ' +
            (errors.dueDate
              ? 'border-rose-500/50'
              : 'border-[#27272a]')
          }
          {...register('dueDate', { required: 'Due date is mandatory' })}
        />
        {errors.dueDate && (
          <p className="mt-1 text-xs text-rose-455 font-medium">{errors.dueDate.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
            Priority Rank
          </label>
          <select
            className="w-full bg-[#18181b] rounded border border-[#27272a] focus:border-zinc-500 px-2.5 py-1.5 text-xs text-white focus:outline-none cursor-pointer"
            {...register('priority')}
          >
            {PRIORITIES.map(pr => (
              <option key={pr} value={pr}>
                {pr} Priority
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
            Progress Status
          </label>
          <select
            className="w-full bg-[#18181b] rounded border border-[#27272a] focus:border-zinc-500 px-2.5 py-1.5 text-xs text-white focus:outline-none cursor-pointer"
            {...register('status')}
          >
            {STATUSES.map(st => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
          Description
        </label>
        <textarea
          rows={3}
          placeholder="Briefly state what must be accomplished..."
          className="w-full bg-[#18181b] rounded border border-[#27272a] focus:border-zinc-500 px-3 py-2 text-xs text-white focus:outline-none transition-colors resize-none"
          {...register('description')}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-[#27272a]">
        <button
          type="button"
          onClick={onCancel}
          className="text-zinc-400 hover:text-white px-4 py-1.5 rounded hover:bg-[#18181b] border border-transparent hover:border-[#27272a] text-xs font-semibold transition-colors duration-150"
        >
          Dismiss
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-1.5 rounded bg-[#6366f1] hover:bg-indigo-500 px-4 py-1.5 text-xs font-bold text-white shadow-sm focus:outline-none transition-colors duration-150 disabled:opacity-60"
        >
          {isSubmitting ? 'Synchronizing...' : 'Save Task'}
        </button>
      </div>
    </form>
  );
};