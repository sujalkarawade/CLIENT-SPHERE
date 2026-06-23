/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useForm } from 'react-hook-form';

const SOURCES  = ['Website', 'Referral', 'Cold Outreach', 'Ad Campaign', 'Partner', 'Other'];
const STATUSES = ['New', 'Contacted', 'Qualified', 'Proposal', 'Nurturing', 'Unqualified'];

const fieldBase   = 'w-full rounded border px-3 py-1.5 text-xs focus:outline-none transition-colors';
const fieldNormal = 'border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:border-indigo-500';
const fieldError  = 'border-rose-500/50 bg-[var(--bg-secondary)] text-[var(--text-primary)]';

export const LeadForm = ({
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
      name:      initialData?.name      || '',
      email:     initialData?.email     || '',
      phone:     initialData?.phone     || '',
      source:    initialData?.source    || 'Website',
      leadScore: initialData?.leadScore || 50,
      status:    initialData?.status    || 'New',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Prospect Name */}
      <div>
        <label style={{ color: 'var(--text-subtle)' }} className="block text-xs font-bold uppercase tracking-wider mb-1.5">
          Prospect Name *
        </label>
        <input
          type="text"
          placeholder="e.g. Clark Kent"
          className={`${fieldBase} ${errors.name ? fieldError : fieldNormal}`}
          {...register('name', { required: 'Prospect name is required' })}
        />
        {errors.name && <p className="mt-1 text-xs text-rose-400 font-medium">{errors.name.message}</p>}
      </div>

      {/* Email + Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label style={{ color: 'var(--text-subtle)' }} className="block text-xs font-bold uppercase tracking-wider mb-1.5">
            Email Coordinates *
          </label>
          <input
            type="email"
            placeholder="clark@dailyplanet.com"
            className={`${fieldBase} ${errors.email ? fieldError : fieldNormal}`}
            {...register('email', {
              required: 'Email address is required',
              pattern: { value: /^\S+@\S+$/i, message: 'Please enter a valid email' },
            })}
          />
          {errors.email && <p className="mt-1 text-xs text-rose-400 font-medium">{errors.email.message}</p>}
        </div>

        <div>
          <label style={{ color: 'var(--text-subtle)' }} className="block text-xs font-bold uppercase tracking-wider mb-1.5">
            Phone Number
          </label>
          <input
            type="text"
            placeholder="+1 (555) 000-0000"
            className={`${fieldBase} ${fieldNormal}`}
            {...register('phone')}
          />
        </div>
      </div>

      {/* Source + Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label style={{ color: 'var(--text-subtle)' }} className="block text-xs font-bold uppercase tracking-wider mb-1.5">
            Lead Source
          </label>
          <select
            style={{ colorScheme: 'dark' }}
            className={`${fieldBase} ${fieldNormal} cursor-pointer`}
            {...register('source')}
          >
            {SOURCES.map(src => <option key={src} value={src}>{src}</option>)}
          </select>
        </div>

        <div>
          <label style={{ color: 'var(--text-subtle)' }} className="block text-xs font-bold uppercase tracking-wider mb-1.5">
            Lead Status
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

      {/* Lead Score */}
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <label style={{ color: 'var(--text-subtle)' }} className="block text-xs font-bold uppercase tracking-wider">
            Lead Score (Prospect Fit) *
          </label>
          <span className="text-xs font-mono font-bold text-indigo-400">0 – 100</span>
        </div>
        <input
          type="number"
          min="0"
          max="100"
          className={`${fieldBase} ${errors.leadScore ? fieldError : fieldNormal}`}
          {...register('leadScore', {
            required: 'Score is required',
            min: { value: 0, message: 'Minimum score is 0' },
            max: { value: 100, message: 'Maximum score is 100' },
            valueAsNumber: true,
          })}
        />
        {errors.leadScore && <p className="mt-1 text-xs text-rose-400 font-medium">{errors.leadScore.message}</p>}
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
          {isSubmitting ? 'Synchronizing...' : 'Save Lead'}
        </button>
      </div>
    </form>
  );
};