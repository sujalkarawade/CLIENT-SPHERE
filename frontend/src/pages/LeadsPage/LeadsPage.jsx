/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import './LeadsPage.css';
import { leadService } from '../../services/api';
import { Dialog } from '../../components/common/Dialog';
import { LeadForm } from '../../components/forms/LeadForm';
import { Toast } from '../../components/common/Toast';
import { Search, Plus, Mail, Phone, Edit, Trash2, Filter, Globe, Users2, Sparkles, Inbox } from 'lucide-react';

export const LeadsPage = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);
  const [toastType, setToastType] = useState('success');
  const [syncing, setSyncing] = useState(false);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const data = await leadService.getAll({ search: searchQuery || undefined, status: filterStatus || undefined });
      setLeads(data);
    } catch {
      triggerToast('Failed to retrieve opportunities listing.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLeads(); }, [searchQuery, filterStatus]);

  const triggerToast = (msg, type) => { setToastMsg(msg); setToastType(type); };

  const handleCreateSubmit = async (data) => {
    setSyncing(true);
    try {
      await leadService.create(data);
      triggerToast('Prospect registered successfully.', 'success');
      setIsCreateOpen(false);
      fetchLeads();
    } catch { triggerToast('Failed to register opportunity.', 'error'); }
    finally { setSyncing(false); }
  };

  const handleEditSubmit = async (data) => {
    if (!editingLead) return;
    setSyncing(true);
    try {
      await leadService.update(editingLead.id, data);
      triggerToast('Opportunity updated successfully.', 'success');
      setEditingLead(null);
      fetchLeads();
    } catch { triggerToast('Failed to update opportunity.', 'error'); }
    finally { setSyncing(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this lead opportunity?')) return;
    try {
      await leadService.delete(id);
      triggerToast('Opportunity deleted.', 'success');
      fetchLeads();
    } catch { triggerToast('Failed to delete lead.', 'error'); }
  };

  const getSourceIcon = (source) => {
    if (source === 'Website') return <Globe style={{ width: '0.875rem', height: '0.875rem' }} />;
    if (source === 'Referral') return <Users2 style={{ width: '0.875rem', height: '0.875rem' }} />;
    return <Sparkles style={{ width: '0.875rem', height: '0.875rem' }} />;
  };

  const statusModMap = {
    New: 'lp-badge--new', Contacted: 'lp-badge--contacted', Qualified: 'lp-badge--qualified',
    Proposal: 'lp-badge--proposal', Nurturing: 'lp-badge--nurturing', Unqualified: 'lp-badge--unqualified',
    Lost: 'lp-badge--lost',
  };

  const getScoreMeter = (score) => {
    const isHot = score >= 80, isWarm = score >= 50;
    const mod = isHot ? 'hot' : isWarm ? 'warm' : 'cold';
    const label = isHot ? 'Hot' : isWarm ? 'Warm' : 'Cold';
    return (
      <div className="lp-score">
        <div className="lp-score__labels">
          <span className={'lp-score__label--' + mod}>{label}</span>
          <span className="lp-score__number">{score}/100</span>
        </div>
        <div className="lp-score__track">
          <div className={'lp-score__fill lp-score__fill--' + mod} style={{ width: score + '%' }} />
        </div>
      </div>
    );
  };

  return (
    <div className="lp-root">
      {toastMsg && <Toast message={toastMsg} type={toastType} onClose={() => setToastMsg(null)} />}

      {/* Header */}
      <div className="lp-header">
        <div>
          <h2 className="lp-header__title">Leads</h2>
          <p className="lp-header__subtitle">Nurture pipeline prospects, classify channels, and gauge lead scores.</p>
        </div>
        <button className="lp-header__btn" onClick={() => setIsCreateOpen(true)}>
          <Plus className="lp-header__btn-icon" />
          Add Lead
        </button>
      </div>

      {/* Filters */}
      <div className="lp-filters">
        <div className="lp-filters__search-wrap">
          <div className="lp-filters__search-icon">
            <Search style={{ width: '0.875rem', height: '0.875rem' }} />
          </div>
          <input
            type="text"
            className="lp-filters__input"
            placeholder="Search leads, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="lp-filters__right">
          <Filter className="lp-filters__filter-icon" style={{ width: '0.875rem', height: '0.875rem' }} />
          <select className="lp-filters__select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
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

      {/* Content */}
      {loading ? (
        <div className="lp-loading">
          <div className="lp-loading__inner">
            <div className="lp-loading__spinner" />
            <p className="lp-loading__text">Querying prospects...</p>
          </div>
        </div>
      ) : leads.length > 0 ? (
        <div className="lp-table-wrap">
          <table className="lp-table">
            <thead>
              <tr>
                <th>Prospect</th>
                <th className="hide-sm">Contact Coordinates</th>
                <th>Source</th>
                <th>Status</th>
                <th>Score</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id}>
                  <td><span className="col-name">{lead.name}</span></td>
                  <td className="hide-sm">
                    <div className="col-coords">
                      <span className="col-email">
                        <Mail style={{ width: '0.75rem', height: '0.75rem', color: '#71717a' }} />
                        {lead.email}
                      </span>
                      {lead.phone && (
                        <span className="col-phone">
                          <Phone style={{ width: '0.75rem', height: '0.75rem' }} />
                          {lead.phone}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className="lp-source-badge">
                      {getSourceIcon(lead.source)}
                      {lead.source}
                    </span>
                  </td>
                  <td>
                    <span className={'lp-badge ' + statusModMap[lead.status]}>{lead.status}</span>
                  </td>
                  <td>{getScoreMeter(lead.leadScore)}</td>
                  <td className="col-actions">
                    <div className="col-actions-inner">
                      <button className="lp-btn-edit" onClick={() => setEditingLead(lead)} title="Edit">
                        <Edit style={{ width: '0.875rem', height: '0.875rem' }} />
                      </button>
                      <button className="lp-btn-delete" onClick={() => handleDelete(lead.id)} title="Delete">
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
        <div className="lp-empty">
          <Inbox className="lp-empty__icon" style={{ width: '1.75rem', height: '1.75rem' }} />
          <h3 className="lp-empty__title">No lead prospects found</h3>
          <p className="lp-empty__text">Try adjusting searches, removing staging filters, or register a new deal.</p>
        </div>
      )}

      <Dialog isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Add Lead">
        <LeadForm onSubmit={handleCreateSubmit} onCancel={() => setIsCreateOpen(false)} isSubmitting={syncing} />
      </Dialog>
      <Dialog isOpen={!!editingLead} onClose={() => setEditingLead(null)} title="Edit Lead">
        {editingLead && (
          <LeadForm initialData={editingLead} onSubmit={handleEditSubmit} onCancel={() => setEditingLead(null)} isSubmitting={syncing} />
        )}
      </Dialog>
    </div>
  );
};