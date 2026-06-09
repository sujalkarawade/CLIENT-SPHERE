/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useForm } from 'react-hook-form';

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
      name: initialData?.name || '',
      company: initialData?.company || '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      status: initialData?.status || 'Pending',
      notes: initialData?.notes || '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
          Contact Name *
        </label>
        <input
          type="text"
          placeholder="e.g. John Doe"
          className={'w-full bg-[#131622] rounded-lg border px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-1 transition duration-150 ' +
            (errors.name
              ? 'border-rose-500/50 focus:ring-rose-500'
              : 'border-gray-800 focus:border-indigo-500 focus:ring-indigo-500')
          }
          {...register('name', { required: 'Contact name is required' })}
        />
        {errors.name && <p className="mt-1 text-xs text-rose-400 font-medium">{errors.name.message}</p>}
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
          Company Name *
        </label>
        <input
          type="text"
          placeholder="e.g. Acme Corp"
          className={'w-full bg-[#131622] rounded-lg border px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-1 transition duration-150 ' +
            (errors.company
              ? 'border-rose-500/50 focus:ring-rose-500'
              : 'border-gray-800 focus:border-indigo-500 focus:ring-indigo-500')
          }
          {...register('company', { required: 'Company name is required' })}
        />
        {errors.company && (
          <p className="mt-1 text-xs text-rose-400 font-medium">{errors.company.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
            Email Address *
          </label>
          <input
            type="email"
            placeholder="john@company.com"
            className={'w-full bg-[#131622] rounded-lg border px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-1 transition duration-150 ' +
              (errors.email
                ? 'border-rose-500/50 focus:ring-rose-500'
                : 'border-gray-800 focus:border-indigo-500 focus:ring-indigo-500')
            }
            {...register('email', {
              required: 'Email coordinates are vital',
              pattern: { value: /^\S+@\S+$/i, message: 'Please input a valid email formatting' },
            })}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-rose-400 font-medium">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
            Phone Number
          </label>
          <input
            type="text"
            placeholder="+1 (555) 000-0000"
            className="w-full bg-[#131622] rounded-lg border border-gray-800 focus:border-indigo-500 focus:ring-indigo-500 px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-1 transition duration-150"
            {...register('phone')}
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
          Lifecycle Status
        </label>
        <select
          className="w-full bg-[#131622] rounded-lg border border-gray-800 focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1"
          {...register('status')}
        >
          <option value="Active">Active Support</option>
          <option value="Pending">Negotiation (Pending)</option>
          <option value="Inactive">Suspended (Inactive)</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
          Internal Annotations / Notes
        </label>
        <textarea
          rows={3}
          placeholder="Enter core notes about account history, requirements, etc..."
          className="w-full bg-[#131622] rounded-lg border border-gray-800 focus:border-indigo-500 focus:ring-indigo-500 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-1 transition duration-150 resize-none animate-none"
          {...register('notes')}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-800/80">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-xs font-medium text-gray-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-gray-800 rounded-lg transition-all"
        >
          Dismiss
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4.5 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-md shadow-indigo-500/15 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50 transition-all duration-150"
        >
          {isSubmitting ? 'Synchronizing...' : 'Save Client'}
        </button>
      </div>
    </form>
  );
};