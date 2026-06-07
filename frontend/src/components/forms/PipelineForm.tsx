/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useForm } from 'react-hook-form';
import { Pipeline, PipelineStage } from '../../types';

interface PipelineFormProps {
  initialData?: Pipeline;
  onSubmit: (data: Omit<Pipeline, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

interface FormInputs {
  title: string;
  value: number;
  stage: PipelineStage;
}

const STAGES: PipelineStage[] = [
  'New Lead',
  'Contacted',
  'Qualified',
  'Proposal Sent',
  'Won',
  'Lost',
];

export const PipelineForm: React.FC<PipelineFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInputs>({
    defaultValues: {
      title: initialData?.title || '',
      value: initialData?.value || 5000,
      stage: initialData?.stage || 'New Lead',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
          Deal Title *
        </label>
        <input
          type="text"
          placeholder="e.g. Acme Enterprise SaaS License"
          className={`w-full bg-[#18181b] rounded border px-3 py-1.5 text-xs text-white focus:outline-none focus:border-zinc-500 transition-colors ${
            errors.title
              ? 'border-rose-500/50'
              : 'border-[#27272a]'
          }`}
          {...register('title', { required: 'Deal title is required' })}
        />
        {errors.title && <p className="mt-1 text-xs text-rose-455 font-medium">{errors.title.message}</p>}
      </div>

      <div>
        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
          Deal Val Financials (USD) *
        </label>
        <input
          type="number"
          step="0.01"
          placeholder="e.g. 15000"
          className={`w-full bg-[#18181b] rounded border px-3 py-1.5 text-xs text-white focus:outline-none focus:border-zinc-500 transition-colors ${
            errors.value
              ? 'border-rose-500/50'
              : 'border-[#27272a]'
          }`}
          {...register('value', {
            required: 'Deal financial value is mandatory',
            min: { value: 0, message: 'Deal value cannot be negative' },
            valueAsNumber: true,
          })}
        />
        {errors.value && <p className="mt-1 text-xs text-rose-455 font-medium">{errors.value.message}</p>}
      </div>

      <div>
        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
          Pipeline Staging Status
        </label>
        <select
          className="w-full bg-[#18181b] rounded border border-[#27272a] focus:border-zinc-500 px-2.5 py-1.5 text-xs text-white focus:outline-none cursor-pointer"
          {...register('stage')}
        >
          {STAGES.map(st => (
            <option key={st} value={st}>
              {st}
            </option>
          ))}
        </select>
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
          {isSubmitting ? 'Synchronizing...' : 'Save Deal'}
        </button>
      </div>
    </form>
  );
};
