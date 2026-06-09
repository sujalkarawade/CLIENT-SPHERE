/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useForm } from 'react-hook-form';

const SOURCES = ['Website', 'Referral', 'Cold Outreach', 'Ad Campaign', 'Partner', 'Other'];
const STATUSES = ['New', 'Contacted', 'Qualified', 'Proposal', 'Nurturing', 'Unqualified'];

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
      name: initialData?.name || '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      source: initialData?.source || 'Website',
      leadScore: initialData?.leadScore || 50,
      status: initialData?.status || 'New',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
          Prospect Name *
        </label>
        <input
          type="text"
          placeholder="e.g. Clark Kent"
          className={'w-full bg-[#18181b] rounded border px-3 py-1.5 text-xs text-white focus:outline-none focus:border-zinc-500 transition-colors ' +
            (errors.name
              ? 'border-rose-500/50'
              : 'border-[#27272a]')
          }
          {...register('name', { required: 'Prospect name is required' })}
        />
        {errors.name && <p className="mt-1 text-xs text-rose-455 font-medium">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
            Email Coordinates *
          </label>
          <input
            type="email"
            placeholder="clark@dailyplanet.com"
            className={'w-full bg-[#18181b] rounded border px-3 py-1.5 text-xs text-white focus:outline-none focus:border-zinc-500 transition-colors ' +
              (errors.email
                ? 'border-rose-500/50'
                : 'border-[#27272a]')
            }
            {...register('email', {
              required: 'Email address is required',
              pattern: { value: /^\S+@\S+$/i, message: 'Please input a valid email formatting' },
            })}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-rose-455 font-medium">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
            Phone Number
          </label>
          <input
            type="text"
            placeholder="+1 (555) 000-0000"
            className="w-full bg-[#18181b] rounded border border-[#27272a] focus:border-zinc-500 px-3 py-1.5 text-xs text-white focus:outline-none transition-colors"
            {...register('phone')}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
            Lead Source
          </label>
          <select
            className="w-full bg-[#18181b] rounded border border-[#27272a] focus:border-zinc-500 px-2.5 py-1.5 text-xs text-white focus:outline-none cursor-pointer"
            {...register('source')}
          >
            {SOURCES.map(src => (
              <option key={src} value={src}>
                {src}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
            Lead Status
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
        <div className="flex justify-between items-center mb-1.5">
          <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider">
            Lead Score (Prospect Fit) *
          </label>
          <span className="text-xs font-mono font-bold text-indigo-400">0 - 100</span>
        </div>
        <input
          type="number"
          min="0"
          max="100"
          className={'w-full bg-[#18181b] rounded border px-3 py-1.5 text-xs text-white focus:outline-none focus:border-zinc-500 transition-colors ' +
            (errors.leadScore
              ? 'border-rose-500/50'
              : 'border-[#27272a]')
          }
          {...register('leadScore', {
            required: 'Score is required',
            min: { value: 0, message: 'Minimum score is 0' },
            max: { value: 100, message: 'Maximum score is 100' },
            valueAsNumber: true,
          })}
        />
        {errors.leadScore && (
          <p className="mt-1 text-xs text-rose-455 font-medium">{errors.leadScore.message}</p>
        )}
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
          {isSubmitting ? 'Synchronizing...' : 'Save Lead'}
        </button>
      </div>
    </form>
  );
};