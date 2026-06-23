/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useForm } from 'react-hook-form';

/* Shared field class helpers */
const fieldBase = 'w-full rounded-lg border px-3.5 py-2 text-sm focus:outline-none focus:ring-1 transition duration-150';
const fieldNormal = 'border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:border-indigo-500 focus:ring-indigo-500/40';
const fieldError  = 'border-rose-500/50 bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:ring-rose-500/40';

export const ClientForm = ({
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
      name:    initialData?.name    || '',
      company: initialData?.company || '',
      email:   initialData?.email   || '',
      phone:   initialData?.phone   || '',
      status:  initialData?.status  || 'Pending',
      notes:   initialData?.notes   || '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Contact Name */}
      <div>
        <label style={{ color: 'var(--text-subtle)' }} className="block text-xs font-semibold uppercase tracking-wider mb-1.5">
          Contact Name *
        </label>
        <input
          type="text"
          placeholder="e.g. John Doe"
          className={`${fieldBase} ${errors.name ? fieldError : fieldNormal}`}
          {...register('name', { required: 'Contact name is required' })}
        />
        {errors.name && <p className="mt-1 text-xs text-rose-400 font-medium">{errors.name.message}</p>}
      </div>

      {/* Company Name */}
      <div>
        <label style={{ color: 'var(--text-subtle)' }} className="block text-xs font-semibold uppercase tracking-wider mb-1.5">
          Company Name *
        </label>
        <input
          type="text"
          placeholder="e.g. Acme Corp"
          className={`${fieldBase} ${errors.company ? fieldError : fieldNormal}`}
          {...register('company', { required: 'Company name is required' })}
        />
        {errors.company && <p className="mt-1 text-xs text-rose-400 font-medium">{errors.company.message}</p>}
      </div>

      {/* Email + Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label style={{ color: 'var(--text-subtle)' }} className="block text-xs font-semibold uppercase tracking-wider mb-1.5">
            Email Address *
          </label>
          <input
            type="email"
            placeholder="john@company.com"
            className={`${fieldBase} ${errors.email ? fieldError : fieldNormal}`}
            {...register('email', {
              required: 'Email is required',
              pattern: { value: /^\S+@\S+$/i, message: 'Please enter a valid email' },
            })}
          />
          {errors.email && <p className="mt-1 text-xs text-rose-400 font-medium">{errors.email.message}</p>}
        </div>

        <div>
          <label style={{ color: 'var(--text-subtle)' }} className="block text-xs font-semibold uppercase tracking-wider mb-1.5">
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

      {/* Status */}
      <div>
        <label style={{ color: 'var(--text-subtle)' }} className="block text-xs font-semibold uppercase tracking-wider mb-1.5">
          Lifecycle Status
        </label>
        <select
          style={{ colorScheme: 'dark' }}
          className={`${fieldBase} ${fieldNormal} cursor-pointer`}
          {...register('status')}
        >
          <option value="Active">Active Support</option>
          <option value="Pending">Negotiation (Pending)</option>
          <option value="Inactive">Suspended (Inactive)</option>
        </select>
      </div>

      {/* Notes */}
      <div>
        <label style={{ color: 'var(--text-subtle)' }} className="block text-xs font-semibold uppercase tracking-wider mb-1.5">
          Internal Annotations / Notes
        </label>
        <textarea
          rows={3}
          placeholder="Enter core notes about account history, requirements, etc..."
          className={`${fieldBase} ${fieldNormal} resize-none`}
          {...register('notes')}
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
          className="px-4 py-2 text-xs font-medium rounded-lg border transition-all hover:border-[var(--border-color)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
        >
          Dismiss
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-md shadow-indigo-500/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50 transition-all duration-150"
        >
          {isSubmitting ? 'Synchronizing...' : 'Save Client'}
        </button>
      </div>
    </form>
  );
};