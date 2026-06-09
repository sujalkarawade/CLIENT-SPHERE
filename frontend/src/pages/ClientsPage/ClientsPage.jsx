/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import './ClientsPage.css';
import { clientService } from '../../services/api';
import { Dialog } from '../../components/common/Dialog';
import { ClientForm } from '../../components/forms/ClientForm';
import { Toast } from '../../components/common/Toast';
import { Search, Plus, Mail, Phone, Building, Edit, Trash2, Filter, Inbox } from 'lucide-react';

export const ClientsPage = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);
  const [toastType, setToastType] = useState('success');
  const [syncing, setSyncing] = useState(false);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const data = await clientService.getAll({
        search: searchQuery || undefined,
        status: filterStatus || undefined,
      });
      setClients(data);
    } catch {
      triggerToast('Failed to fetch clients records.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchClients(); }, [searchQuery, filterStatus]);

  const triggerToast = (msg, type) => {
    setToastMsg(msg);
    setToastType(type);
  };

  const handleCreateSubmit = async (data) => {
    setSyncing(true);
    try {
      await clientService.create(data);
      triggerToast('Client profile established successfully.', 'success');
      setIsCreateOpen(false);
      fetchClients();
    } catch {
      triggerToast('Failed to create new client.', 'error');
    } finally {
      setSyncing(false);
    }
  };

  const handleEditSubmit = async (data) => {
    if (!editingClient) return;
    setSyncing(true);
    try {
      await clientService.update(editingClient.id, data);
      triggerToast('Client profile updated successfully.', 'success');
      setEditingClient(null);
      fetchClients();
    } catch {
      triggerToast('Failed to update client profile.', 'error');
    } finally {
      setSyncing(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you absolutely sure you want to delete this client?')) return;
    try {
      await clientService.delete(id);
      triggerToast('Client deleted successfully.', 'success');
      fetchClients();
    } catch {
      triggerToast('Failed to delete client profile.', 'error');
    }
  };

  const getStatusBadge = (status) => {
    const modMap = {
      Active: 'cp-badge--active',
      Pending: 'cp-badge--pending',
      Inactive: 'cp-badge--inactive',
    };
    const dotMap = {
      Active: 'cp-badge__dot cp-badge__dot--active',
      Pending: 'cp-badge__dot cp-badge__dot--pending',
      Inactive: 'cp-badge__dot cp-badge__dot--inactive',
    };
    return (
      <span className={'cp-badge ' + modMap[status]}>
        <span className={dotMap[status]} />
        {status}
      </span>
    );
  };

  return (
    <div className="cp-root">
      {toastMsg && (
        <Toast message={toastMsg} type={toastType} onClose={() => setToastMsg(null)} />
      )}

      {/* Header */}
      <div className="cp-header">
        <div>
          <h2 className="cp-header__title">Clients</h2>
          <p className="cp-header__subtitle">Manage, search, and audit your established clientele accounts.</p>
        </div>
        <button className="cp-header__btn" onClick={() => setIsCreateOpen(true)}>
          <Plus className="cp-header__btn-icon" />
          Add Client
        </button>
      </div>

      {/* Filters */}
      <div className="cp-filters">
        <div className="cp-filters__search-wrap">
          <div className="cp-filters__search-icon">
            <Search />
          </div>
          <input
            type="text"
            className="cp-filters__input"
            placeholder="Search clients, company, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="cp-filters__right">
          <Filter className="cp-filters__filter-icon" />
          <select
            className="cp-filters__select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="All">All Lifecycles</option>
            <option value="Active">Active</option>
            <option value="Pending">Pending</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="cp-loading">
          <div className="cp-loading__inner">
            <div className="cp-loading__spinner" />
            <p className="cp-loading__text">Querying directories...</p>
          </div>
        </div>
      ) : clients.length > 0 ? (
        <div className="cp-table-wrap">
          <table className="cp-table">
            <thead>
              <tr>
                <th>Contact & Company</th>
                <th className="hide-sm">Contact Coordinates</th>
                <th>Lifecycle Status</th>
                <th className="hide-lg">Notes</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id}>
                  <td>
                    <div>
                      <div className="col-contact-name">{client.name}</div>
                      <div className="col-contact-company">
                        <Building style={{ width: '0.75rem', height: '0.75rem' }} />
                        {client.company}
                      </div>
                    </div>
                  </td>
                  <td className="hide-sm">
                    <div className="col-coords">
                      <span className="col-email">
                        <Mail style={{ width: '0.75rem', height: '0.75rem', color: '#71717a' }} />
                        {client.email}
                      </span>
                      {client.phone && (
                        <span className="col-phone">
                          <Phone style={{ width: '0.75rem', height: '0.75rem' }} />
                          {client.phone}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>{getStatusBadge(client.status)}</td>
                  <td className="hide-lg">
                    <p className="col-notes" title={client.notes}>{client.notes || '\u2014'}</p>
                  </td>
                  <td className="col-actions">
                    <div className="col-actions-inner">
                      <button className="cp-btn-edit" onClick={() => setEditingClient(client)} title="Edit">
                        <Edit style={{ width: '0.875rem', height: '0.875rem' }} />
                      </button>
                      <button className="cp-btn-delete" onClick={() => handleDelete(client.id)} title="Delete">
                        <Trash2 style={{ width: '0.875rem', height: '0.875rem' }} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="cp-empty">
          <Inbox className="cp-empty__icon" style={{ width: '1.75rem', height: '1.75rem' }} />
          <h3 className="cp-empty__title">No clients found</h3>
          <p className="cp-empty__text">Try adjusting searches, removing status filters, or create a brand new client.</p>
        </div>
      )}

      <Dialog isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Add Client">
        <ClientForm onSubmit={handleCreateSubmit} onCancel={() => setIsCreateOpen(false)} isSubmitting={syncing} />
      </Dialog>

      <Dialog isOpen={!!editingClient} onClose={() => setEditingClient(null)} title="Edit Client">
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