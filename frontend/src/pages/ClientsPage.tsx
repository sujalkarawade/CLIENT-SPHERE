/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { clientService } from '../services/api';
import { Client, ClientStatus } from '../types';
import { Dialog } from '../components/common/Dialog';
import { ClientForm } from '../components/forms/ClientForm';
import { Toast, ToastType } from '../components/common/Toast';
import {
  Search,
  Plus,
  Mail,
  Phone,
  Building,
  Edit,
  Trash2,
  Filter,
  UserCheck,
  MoreVertical,
  Inbox,
  Sparkles
} from 'lucide-react';

export const ClientsPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('All');

  // Dialog controls
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  // Toast controls
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [toastType, setToastType] = useState<ToastType>('success');
  const [syncing, setSyncing] = useState<boolean>(false);

  // Load clients list based on searches/filters
  const fetchClients = async () => {
    try {
      setLoading(true);
      const data = await clientService.getAll({
        search: searchQuery || undefined,
        status: filterStatus || undefined
      });
      setClients(data);
    } catch (err) {
      triggerToast('Failed to fetch clients records.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [searchQuery, filterStatus]);

  const triggerToast = (msg: string, type: ToastType) => {
    setToastMsg(msg);
    setToastType(type);
  };

  const handleCreateSubmit = async (data: Omit<Client, 'id' | 'createdAt'>) => {
    setSyncing(true);
    try {
      await clientService.create(data);
      triggerToast('Client profile established successfully.', 'success');
      setIsCreateOpen(false);
      fetchClients();
    } catch (err) {
      triggerToast('Failed to create new client.', 'error');
    } finally {
      setSyncing(false);
    }
  };

  const handleEditSubmit = async (data: Omit<Client, 'id' | 'createdAt'>) => {
    if (!editingClient) return;
    setSyncing(true);
    try {
      await clientService.update(editingClient.id, data);
      triggerToast('Client profile updated successfully.', 'success');
      setEditingClient(null);
      fetchClients();
    } catch (err) {
      triggerToast('Failed to update client profile.', 'error');
    } finally {
      setSyncing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you absolutely sure you want to delete this client?')) return;
    try {
      await clientService.delete(id);
      triggerToast('Client deleted successfully.', 'success');
      fetchClients();
    } catch (err) {
      triggerToast('Failed to delete client profile.', 'error');
    }
  };

  // Status visual colors mapper
  const getStatusBadge = (status: ClientStatus) => {
    const config = {
      Active: 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/10 shadow-[0_0_12px_-5px_rgba(16,185,129,0.1)]',
      Pending: 'bg-amber-950/40 text-amber-400 border border-amber-500/10 shadow-[0_0_12px_-5px_rgba(245,158,11,0.1)]',
      Inactive: 'bg-gray-900 border border-gray-800 text-gray-400',
    }[status];

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${config}`}>
        {status === 'Active' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
        {status === 'Pending' && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
        {status === 'Inactive' && <span className="w-1.5 h-1.5 rounded-full bg-gray-500" />}
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {toastMsg && (
        <Toast
          message={toastMsg}
          type={toastType}
          onClose={() => setToastMsg(null)}
        />
      )}

      {/* List Header and quick creation triggers */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#27272a] pb-4 animate-none">
        <div>
          <h2 className="font-display text-base font-bold text-white tracking-tight">Clients</h2>
          <p className="text-[11px] text-zinc-500 mt-0.5">Manage, search, and audit your established clientele accounts.</p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center justify-center gap-1.5 rounded bg-[#18181b] border border-[#27272a] hover:bg-[#27272a] px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition duration-150 shrink-0 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5 text-[#6366f1]" />
          Add Client
        </button>
      </div>

      {/* Query Filters blocks bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#09090b] p-3 border border-[#27272a] rounded-lg">
        <div className="relative w-full md:max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-3.5 w-3.5 text-zinc-500" />
          </div>
          <input
            type="text"
            placeholder="Search clients, company, email..."
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
            <option value="All">All Lifecycles</option>
            <option value="Active">Active Support</option>
            <option value="Pending">Negotiation (Pending)</option>
            <option value="Inactive">Suspended (Inactive)</option>
          </select>
        </div>
      </div>

      {/* Clients core details table */}
      {loading ? (
        <div className="h-44 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-2 border-[#27272a] border-t-[#6366f1] rounded-full animate-spin" />
            <p className="text-[11px] text-zinc-500 font-mono">Querying directories...</p>
          </div>
        </div>
      ) : clients.length > 0 ? (
        <div className="overflow-x-auto border border-[#27272a] rounded-lg bg-[#09090b] shadow-sm">
          <table className="min-w-full divide-y divide-[#27272a] font-sans text-left text-xs text-zinc-300">
            <thead className="bg-[#18181b] text-[10px] font-bold uppercase tracking-wider text-zinc-500 border-b border-[#27272a]">
              <tr>
                <th className="px-5 py-3">Contact & Company</th>
                <th className="px-5 py-3 hidden sm:table-cell">Contact Coordinates</th>
                <th className="px-5 py-3">Lifecycle Status</th>
                <th className="px-5 py-3 hidden lg:table-cell">Notes</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272a] bg-transparent">
              {clients.map((client) => (
                <tr
                  key={client.id}
                  className="hover:bg-white/[0.02] transition-colors duration-100"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex flex-col">
                      <span className="font-semibold text-white tracking-tight">{client.name}</span>
                      <span className="text-[11px] text-zinc-500 flex items-center gap-1 mt-0.5">
                        <Building className="w-3 h-3 text-zinc-650" />
                        {client.company}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 hidden sm:table-cell">
                    <div className="flex flex-col gap-0.5 text-[11px]">
                      <span className="flex items-center gap-1 text-zinc-300">
                        <Mail className="w-3 h-3 text-zinc-500" />
                        {client.email}
                      </span>
                      {client.phone && (
                        <span className="flex items-center gap-1 text-zinc-500">
                          <Phone className="w-3 h-3 text-zinc-650" />
                          {client.phone}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">{getStatusBadge(client.status)}</td>
                  <td className="px-5 py-3.5 hidden lg:table-cell max-w-[280px]">
                    <p className="text-[11px] text-zinc-500 truncate" title={client.notes}>
                      {client.notes || '—'}
                    </p>
                  </td>
                  <td className="px-5 py-3.5 text-right w-24">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setEditingClient(client)}
                        className="text-zinc-500 hover:text-white p-1 rounded hover:bg-[#18181b] border border-transparent hover:border-[#27272a] transition duration-150"
                        title="Edit entry"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(client.id)}
                        className="text-zinc-500 hover:text-rose-400 p-1 rounded hover:bg-[#18181b] border border-transparent hover:border-[#27272a] transition duration-150"
                        title="Delete entry"
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
          <h3 className="font-display text-xs font-semibold text-white">No clients found</h3>
          <p className="text-[11px] text-zinc-500 mt-0.5 max-w-xs mx-auto">
            Try adjusting searches, removing status filters, or create a brand new client.
          </p>
        </div>
      )}

      {/* CREATE MODAL OVERLAY */}
      <Dialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Add Client"
      >
        <ClientForm
          onSubmit={handleCreateSubmit}
          onCancel={() => setIsCreateOpen(false)}
          isSubmitting={syncing}
        />
      </Dialog>

      {/* EDIT MODAL OVERLAY */}
      <Dialog
        isOpen={!!editingClient}
        onClose={() => setEditingClient(null)}
        title="Edit Client"
      >
        {editingClient && (
          <ClientForm
            initialData={editingClient}
            onSubmit={handleEditSubmit}
            onCancel={() => setEditingClient(null)}
            isSubmitting={syncing}
          />
        )}
      </Dialog>
    </div>
  );
};
