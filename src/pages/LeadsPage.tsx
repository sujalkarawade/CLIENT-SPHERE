/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { leadService } from '../services/api';
import { Lead, LeadStatus, LeadSource } from '../types';
import { Dialog } from '../components/common/Dialog';
import { LeadForm } from '../components/forms/LeadForm';
import { Toast, ToastType } from '../components/common/Toast';
import {
  Search,
  Plus,
  Mail,
  Phone,
  Edit,
  Trash2,
  Filter,
  Flame,
  Globe,
  Users2,
  Inbox,
  Sparkles
} from 'lucide-react';

export const LeadsPage: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('All');

  // Dialog overlays
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  // Toast parameters
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [toastType, setToastType] = useState<ToastType>('success');
  const [syncing, setSyncing] = useState<boolean>(false);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const data = await leadService.getAll({
        search: searchQuery || undefined,
        status: filterStatus || undefined
      });
      setLeads(data);
    } catch (err) {
      triggerToast('Failed to retrieve opportunities listing.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [searchQuery, filterStatus]);

  const triggerToast = (msg: string, type: ToastType) => {
    setToastMsg(msg);
    setToastType(type);
  };

  const handleCreateSubmit = async (data: Omit<Lead, 'id' | 'createdAt'>) => {
    setSyncing(true);
    try {
      await leadService.create(data);
      triggerToast('Prospect registered successfully.', 'success');
      setIsCreateOpen(false);
      fetchLeads();
    } catch (err) {
      triggerToast('Failed to register opportunity.', 'error');
    } finally {
      setSyncing(false);
    }
  };

  const handleEditSubmit = async (data: Omit<Lead, 'id' | 'createdAt'>) => {
    if (!editingLead) return;
    setSyncing(true);
    try {
      await leadService.update(editingLead.id, data);
      triggerToast('Opportunity updated successfully.', 'success');
      setEditingLead(null);
      fetchLeads();
    } catch (err) {
      triggerToast('Failed to update opportunity.', 'error');
    } finally {
      setSyncing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you absolutely sure you want to delete this lead opportunity?')) return;
    try {
      await leadService.delete(id);
      triggerToast('Opportunity deleted.', 'success');
      fetchLeads();
    } catch (err) {
      triggerToast('Failed to delete lead.', 'error');
    }
  };

  // Source badges styling
  const getSourceIcon = (source: LeadSource) => {
    switch (source) {
      case 'Website': return <Globe className="w-3.5 h-3.5" />;
      case 'Referral': return <Users2 className="w-3.5 h-3.5" />;
      default: return <Sparkles className="w-3.5 h-3.5" />;
    }
  };

  // Status badges mapping
  const getStatusBadge = (status: LeadStatus) => {
    const config = {
      New: 'bg-indigo-950/40 text-indigo-400 border border-indigo-500/10',
      Contacted: 'bg-blue-950/40 text-blue-400 border border-blue-500/10',
      Qualified: 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/10',
      Proposal: 'bg-amber-950/40 text-amber-400 border border-amber-500/10',
      Nurturing: 'bg-violet-950/40 text-violet-400 border border-violet-500/10',
      Unqualified: 'bg-gray-900 text-gray-400 border border-gray-800'
    }[status];

    return (
      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${config}`}>
        {status}
      </span>
    );
  };

  // Score horizontal meters design
  const getScoreMeter = (score: number) => {
    let color = 'bg-rose-500';
    let label = 'Cold';
    let text = 'text-rose-400';

    if (score >= 80) {
      color = 'bg-emerald-500';
      label = 'Hot';
      text = 'text-emerald-400';
    } else if (score >= 50) {
      color = 'bg-amber-500';
      label = 'Warm';
      text = 'text-amber-400';
    }

    return (
      <div className="flex flex-col gap-1 w-32">
        <div className="flex justify-between text-[10px] font-semibold leading-none">
          <span className={`${text} uppercase tracking-wider`}>{label}</span>
          <span className="text-gray-400 font-mono">{score}/100</span>
        </div>
        <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <div className={`h-full ${color}`} style={{ width: `${score}%` }} />
        </div>
      </div>
    );
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

      {/* Header operations section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#27272a] pb-4">
        <div>
          <h2 className="font-display text-base font-bold text-white tracking-tight">Leads</h2>
          <p className="text-[11px] text-zinc-500 mt-0.5">Nurture pipeline prospects, classify channels, and gauge lead scores.</p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center justify-center gap-1.5 rounded bg-[#18181b] border border-[#27272a] hover:bg-[#27272a] px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition duration-150 shrink-0 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5 text-[#6366f1]" />
          Add Lead
        </button>
      </div>

      {/* Search and status filter bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#09090b] p-3 border border-[#27272a] rounded-lg">
        <div className="relative w-full md:max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-3.5 w-3.5 text-zinc-500" />
          </div>
          <input
            type="text"
            placeholder="Search leads, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full rounded bg-[#18181b] border border-[#27272a] text-xs text-white pl-9 pr-3 py-1.5 focus:border-zinc-500 focus:outline-none focus:ring-0 transition-colors placeholder:text-zinc-600"
          />
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
          <Filter className="w-3.5 h-3.5 text-zinc-500 hidden sm:block" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded bg-[#18181b] border border-[#27272a] focus:border-zinc-500 px-2.5 py-1.5 text-xs text-white focus:outline-none cursor-pointer"
          >
            <option value="All">All Lead States</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Qualified">Qualified</option>
            <option value="Proposal">Proposal</option>
            <option value="Nurturing">Nurturing</option>
            <option value="Unqualified">Unqualified</option>
          </select>
        </div>
      </div>

      {/* Leads records table list */}
      {loading ? (
        <div className="h-44 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-2 border-[#27272a] border-t-[#6366f1] rounded-full animate-spin" />
            <p className="text-[11px] text-zinc-500 font-mono">Querying prospects...</p>
          </div>
        </div>
      ) : leads.length > 0 ? (
        <div className="overflow-x-auto border border-[#27272a] rounded-lg bg-[#09090b] shadow-sm">
          <table className="min-w-full divide-y divide-[#27272a] font-sans text-left text-xs text-zinc-300">
            <thead className="bg-[#18181b] text-[10px] font-bold uppercase tracking-wider text-zinc-500 border-b border-[#27272a]">
              <tr>
                <th className="px-5 py-3">Prospect</th>
                <th className="px-5 py-3 hidden sm:table-cell">Contact Coordinates</th>
                <th className="px-5 py-3">Attribution Source</th>
                <th className="px-5 py-3">Funnel Staging</th>
                <th className="px-5 py-3">Opportunity Score</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272a] bg-transparent">
              {leads.map((lead) => (
                <tr
                  key={lead.id}
                  className="hover:bg-white/[0.02] transition-colors duration-100"
                >
                  <td className="px-5 py-3.5">
                    <span className="font-semibold text-white tracking-tight">{lead.name}</span>
                  </td>
                  <td className="px-5 py-3.5 hidden sm:table-cell">
                    <div className="flex flex-col gap-0.5 text-[11px]">
                      <span className="flex items-center gap-1 text-zinc-300">
                        <Mail className="w-3 h-3 text-zinc-500" />
                        {lead.email}
                      </span>
                      {lead.phone && (
                        <span className="flex items-center gap-1 text-zinc-500">
                          <Phone className="w-3 h-3 text-zinc-650" />
                          {lead.phone}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center gap-1 text-[10px] text-zinc-400 font-bold bg-[#18181b] px-2 py-0.5 rounded border border-[#27272a]">
                      {getSourceIcon(lead.source)}
                      {lead.source}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">{getStatusBadge(lead.status)}</td>
                  <td className="px-5 py-3.5">{getScoreMeter(lead.leadScore)}</td>
                  <td className="px-5 py-3.5 text-right w-24">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setEditingLead(lead)}
                        className="text-zinc-500 hover:text-white p-1 rounded hover:bg-[#18181b] border border-transparent hover:border-[#27272a] transition duration-150"
                        title="Edit opportunity"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(lead.id)}
                        className="text-zinc-500 hover:text-rose-400 p-1 rounded hover:bg-[#18181b] border border-transparent hover:border-[#27272a] transition duration-150"
                        title="Delete opportunity"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="border border-[#27272a] border-dashed rounded-lg p-10 text-center bg-transparent">
          <Inbox className="w-7 h-7 text-zinc-700 mx-auto mb-2.5" />
          <h3 className="font-display text-xs font-semibold text-white">No lead prospects found</h3>
          <p className="text-[11px] text-zinc-500 mt-0.5 max-w-xs mx-auto">
            Try adjusting searches, removing staging filters, or register a new hot deal.
          </p>
        </div>
      )}

      {/* CREATE MODAL */}
      <Dialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Add Lead"
      >
        <LeadForm
          onSubmit={handleCreateSubmit}
          onCancel={() => setIsCreateOpen(false)}
          isSubmitting={syncing}
        />
      </Dialog>

      {/* EDIT MODAL */}
      <Dialog
        isOpen={!!editingLead}
        onClose={() => setEditingLead(null)}
        title="Edit Lead"
      >
        {editingLead && (
          <LeadForm
            initialData={editingLead}
            onSubmit={handleEditSubmit}
            onCancel={() => setEditingLead(null)}
            isSubmitting={syncing}
          />
        )}
      </Dialog>
    </div>
  );
};
