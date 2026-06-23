/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useForm } from 'react-hook-form';

const STAGES = ['New Lead', 'Contacted', 'Qualified', 'Proposal Sent', 'Won', 'Lost'];

const fieldBase   = 'w-full rounded border px-3 py-1.5 text-xs focus:outline-none transition-colors';
const fieldNormal = 'border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:border-indigo-500';
const fieldError  = 'border-rose-500/50 bg-[var(--bg-secondary)] text-[var(--text-primary)]';

export const PipelineForm = ({
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
      value: initialData?.value || 5000,
      stage: initialData?.stage || 'New Lead',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Deal Title */}
      <div>
        <label style={{ color: 'var(--text-subtle)' }} className="block text-xs font-bold uppercase tracking-wider mb-1.5">
          Deal Title *
        </label>
        <input
          type="text"
          placeholder="e.g. Acme Enterprise SaaS License"
          className={`${fieldBase} ${errors.title ? fieldError : fieldNormal}`}
          {...register('title', { required: 'Deal title is required' })}
        />
        {errors.title && <p className="mt-1 text-xs text-rose-400 font-medium">{errors.title.message}</p>}
      </div>

      {/* Deal Value */}
      <div>
        <label style={{ color: 'var(--text-subtle)' }} className="block text-xs font-bold uppercase tracking-wider mb-1.5">
          Deal Value (USD) *
        </label>
        <input
          type="number"
          step="0.01"
          placeholder="e.g. 15000"
          className={`${fieldBase} ${errors.value ? fieldError : fieldNormal}`}
          {...register('value', {
            required: 'Deal financial value is mandatory',
            min: { value: 0, message: 'Deal value cannot be negative' },
            valueAsNumber: true,
          })}
        />
        {errors.value && <p className="mt-1 text-xs text-rose-400 font-medium">{errors.value.message}</p>}
      </div>

      {/* Stage */}
      <div>
        <label style={{ color: 'var(--text-subtle)' }} className="block text-xs font-bold uppercase tracking-wider mb-1.5">
          Pipeline Staging Status
        </label>
        <select
          style={{ colorScheme: 'dark' }}
          className={`${fieldBase} ${fieldNormal} cursor-pointer`}
          {...register('stage')}
        >
          {STAGES.map(st => <option key={st} value={st}>{st}</option>)}
        </select>
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
          {isSubmitting ? 'Synchronizing...' : 'Save Deal'}
        </button>
      </div>
    </form>
  );
};