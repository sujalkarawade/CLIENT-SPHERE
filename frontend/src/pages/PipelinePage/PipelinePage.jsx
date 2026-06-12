/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import './PipelinePage.css';
import { pipelineService } from '../../services/api';
import { Dialog } from '../../components/common/Dialog';
import { PipelineForm } from '../../components/forms/PipelineForm';
import { Toast } from '../../components/common/Toast';
import {
  Plus, DollarSign, Inbox, Trash2, Edit2,
  TrendingUp, Target, Trophy, XCircle, GripVertical,
  ArrowRight, Layers,
} from 'lucide-react';

const STAGES = ['New Lead', 'Contacted', 'Qualified', 'Proposal Sent', 'Won', 'Lost'];

const STAGE_META = {
  'New Lead':      { mod: 'new-lead',  icon: Layers,      color: '#818cf8', lightColor: '#4f46e5' },
  'Contacted':     { mod: 'contacted', icon: ArrowRight,   color: '#60a5fa', lightColor: '#2563eb' },
  'Qualified':     { mod: 'qualified', icon: Target,       color: '#34d399', lightColor: '#059669' },
  'Proposal Sent': { mod: 'proposal',  icon: TrendingUp,   color: '#fbbf24', lightColor: '#d97706' },
  'Won':           { mod: 'won',       icon: Trophy,       color: '#34d399', lightColor: '#047857' },
  'Lost':          { mod: 'lost',      icon: XCircle,      color: '#f87171', lightColor: '#dc2626' },
};

export const PipelinePage = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draggingId, setDraggingId] = useState(null);
  const [dragOverStage, setDragOverStage] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreateAtStage, setIsCreateAtStage] = useState('New Lead');
  const [editingDeal, setEditingDeal] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);
  const [toastType, setToastType] = useState('success');
  const [syncing, setSyncing] = useState(false);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      setDeals(await pipelineService.getAll());
    } catch {
      triggerToast('Failed to retrieve pipeline deals.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDeals(); }, []);

  const triggerToast = (msg, type) => { setToastMsg(msg); setToastType(type); };

  const handleCreateSubmit = async (data) => {
    setSyncing(true);
    try {
      await pipelineService.create({ ...data, stage: isCreateAtStage });
      triggerToast('Deal added to pipeline.', 'success');
      setIsCreateOpen(false);
      fetchDeals();
    } catch { triggerToast('Failed to register pipeline deal.', 'error'); }
    finally { setSyncing(false); }
  };

  const handleEditSubmit = async (data) => {
    if (!editingDeal) return;
    setSyncing(true);
    try {
      await pipelineService.update(editingDeal.id, data);
      triggerToast('Pipeline deal updated.', 'success');
      setEditingDeal(null);
      fetchDeals();
    } catch { triggerToast('Failed to sync deal changes.', 'error'); }
    finally { setSyncing(false); }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Remove this deal from pipeline?')) return;
    try {
      await pipelineService.delete(id);
      triggerToast('Deal removed.', 'success');
      fetchDeals();
    } catch { triggerToast('Failed to remove deal.', 'error'); }
  };

  const handleDragStart = (e, id) => {
    setDraggingId(id);
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, stage) => {
    e.preventDefault();
    setDragOverStage(stage);
  };

  const handleDrop = async (e, targetStage) => {
    e.preventDefault();
    setDragOverStage(null);
    const dealId = e.dataTransfer.getData('text/plain');
    if (!dealId) return;
    const idx = deals.findIndex((d) => d.id === dealId);
    if (idx === -1 || deals[idx].stage === targetStage) return;

    const updated = [...deals];
    updated[idx] = { ...updated[idx], stage: targetStage };
    setDeals(updated);

    try {
      await pipelineService.update(dealId, { stage: targetStage });
      triggerToast('Moved to ' + targetStage + '.', 'success');
    } catch {
      triggerToast('Failed to update stage. Reverting.', 'error');
      fetchDeals();
    }
  };

  const formatUSD = (val) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  const openAddAtStage = (stage) => { setIsCreateAtStage(stage); setIsCreateOpen(true); };

  // ── Derived stats ──────────────────────────────────────────────
  const totalPipeline  = deals.filter(d => d.stage !== 'Lost').reduce((s, d) => s + d.value, 0);
  const wonValue       = deals.filter(d => d.stage === 'Won').reduce((s, d) => s + d.value, 0);
  const wonCount       = deals.filter(d => d.stage === 'Won').length;
  const lostCount      = deals.filter(d => d.stage === 'Lost').length;
  const closedCount    = wonCount + lostCount;
  const winRate        = closedCount > 0 ? Math.round((wonCount / closedCount) * 100) : 0;
  const activeCount    = deals.filter(d => d.stage !== 'Won' && d.stage !== 'Lost').length;

  if (loading) {
    return (
      <div className="pp-loading">
        <div className="pp-loading__spinner" />
        <p className="pp-loading__text">Loading pipeline...</p>
      </div>
    );
  }

  return (
    <div className="pp-root">
      {toastMsg && <Toast message={toastMsg} type={toastType} onClose={() => setToastMsg(null)} />}

      {/* Header */}
      <div className="pp-header">
        <div>
          <h2 className="pp-header__title">Sales Pipeline</h2>
          <p className="pp-header__subtitle">Drag and drop deals across stages to track conversion progress.</p>
        </div>
        <button className="pp-header__btn" onClick={() => openAddAtStage('New Lead')}>
          <Plus className="pp-header__btn-icon" />
          Add Deal
        </button>
      </div>

      {/* Summary bar */}
      <div className="pp-summary-bar">
        <div className="pp-summary-item">
          <span className="pp-summary-item__label">Total Pipeline</span>
          <span className="pp-summary-item__value">{formatUSD(totalPipeline)}</span>
          <span className="pp-summary-item__meta">{activeCount} active deals</span>
        </div>
        <div className="pp-summary-divider" />
        <div className="pp-summary-item">
          <span className="pp-summary-item__label">Won Revenue</span>
          <span className="pp-summary-item__value pp-summary-item__value--won">{formatUSD(wonValue)}</span>
          <span className="pp-summary-item__meta">{wonCount} deals closed</span>
        </div>
        <div className="pp-summary-divider" />
        <div className="pp-summary-item">
          <span className="pp-summary-item__label">Win Rate</span>
          <span className="pp-summary-item__value pp-summary-item__value--rate">{winRate}%</span>
          <span className="pp-summary-item__meta">{closedCount} deals evaluated</span>
        </div>
        <div className="pp-summary-divider" />
        <div className="pp-summary-item">
          <span className="pp-summary-item__label">Total Deals</span>
          <span className="pp-summary-item__value">{deals.length}</span>
          <span className="pp-summary-item__meta">{lostCount} lost</span>
        </div>

        {/* Funnel progress strip */}
        <div className="pp-summary-funnel">
          {STAGES.filter(s => s !== 'Lost').map((stage) => {
            const count = deals.filter(d => d.stage === stage).length;
            const pct   = deals.length > 0 ? Math.round((count / deals.length) * 100) : 0;
            const meta  = STAGE_META[stage];
            return (
              <div key={stage} className="pp-funnel-seg" title={stage + ': ' + count + ' deals'}>
                <div
                  className={'pp-funnel-seg__bar pp-funnel-seg__bar--' + meta.mod}
                  style={{ width: Math.max(pct, 4) + '%' }}
                />
                <span className="pp-funnel-seg__label">{stage}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Kanban board */}
      <div className="pp-board-scroll">
        <div className="pp-board">
          {STAGES.map((stage) => {
            const meta       = STAGE_META[stage];
            const StageIcon  = meta.icon;
            const stageDeals = deals.filter((d) => d.stage === stage);
            const totalValue = stageDeals.reduce((sum, d) => sum + d.value, 0);
            const isOver     = dragOverStage === stage && draggingId;

            return (
              <div
                key={stage}
                className={'pp-column pp-column--' + meta.mod + (isOver ? ' pp-column--drop-active' : '')}
                onDragOver={(e) => handleDragOver(e, stage)}
                onDragLeave={() => setDragOverStage(null)}
                onDrop={(e) => handleDrop(e, stage)}
              >
                {/* Column header */}
                <div className={'pp-col-header pp-col-header--' + meta.mod}>
                  <div className="pp-col-header__left">
                    <div className="pp-col-header__title-row">
                      <StageIcon className="pp-col-header__icon" style={{ width: '0.75rem', height: '0.75rem' }} />
                      <span className="pp-col-header__title">{stage}</span>
                    </div>
                    <div className="pp-col-header__stats">
                      <span className="pp-col-header__count-pill">{stageDeals.length}</span>
                      <span className="pp-col-header__value">{formatUSD(totalValue)}</span>
                    </div>
                  </div>
                  <button
                    className="pp-col-header__add"
                    onClick={() => openAddAtStage(stage)}
                    title={'Add deal to ' + stage}
                  >
                    <Plus style={{ width: '0.75rem', height: '0.75rem' }} />
                  </button>
                </div>

                {/* Cards container */}
                <div className="pp-cards-container">
                  {stageDeals.length > 0 ? (
                    stageDeals.map((deal) => (
                      <DealCard
                        key={deal.id}
                        deal={deal}
                        isDragging={draggingId === deal.id}
                        onDragStart={handleDragStart}
                        onDragEnd={() => { setDraggingId(null); setDragOverStage(null); }}
                        onEdit={() => setEditingDeal(deal)}
                        onDelete={handleDelete}
                        formatUSD={formatUSD}
                        stageMod={meta.mod}
                      />
                    ))
                  ) : (
                    <div className={'pp-col-empty' + (isOver ? ' pp-col-empty--active' : '')}>
                      <Inbox className="pp-col-empty__icon" style={{ width: '1.25rem', height: '1.25rem' }} />
                      <p className="pp-col-empty__text">Drop a deal here</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Dialog isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Add Deal">
        <PipelineForm onSubmit={handleCreateSubmit} onCancel={() => setIsCreateOpen(false)} isSubmitting={syncing} />
      </Dialog>
      <Dialog isOpen={!!editingDeal} onClose={() => setEditingDeal(null)} title="Edit Deal">
        {editingDeal && (
          <PipelineForm initialData={editingDeal} onSubmit={handleEditSubmit} onCancel={() => setEditingDeal(null)} isSubmitting={syncing} />
        )}
      </Dialog>
    </div>
  );
};

// ── Deal Card ─────────────────────────────────────────────────────────────────
function DealCard({ deal, isDragging, onDragStart, onDragEnd, onEdit, onDelete, formatUSD, stageMod }) {
  const valueColor = deal.stage === 'Won' ? '#34d399' : deal.stage === 'Lost' ? '#f87171' : '#6366f1';

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, deal.id)}
      onDragEnd={onDragEnd}
      className={'pp-deal-card pp-deal-card--' + stageMod + (isDragging ? ' pp-deal-card--dragging' : '')}
    >
      {/* Drag handle */}
      <div className="pp-deal-card__grip">
        <GripVertical style={{ width: '0.75rem', height: '0.75rem' }} />
      </div>

      <div className="pp-deal-card__body">
        <p className="pp-deal-card__title">{deal.title}</p>

        {/* Value badge */}
        <div className="pp-deal-card__value-row">
          <span className="pp-deal-card__value-badge" style={{ color: valueColor, borderColor: valueColor + '33', background: valueColor + '11' }}>
            <DollarSign style={{ width: '0.625rem', height: '0.625rem' }} />
            {deal.value.toLocaleString()}
          </span>
        </div>

        {/* Actions */}
        <div className="pp-deal-card__actions">
          <button className="pp-btn-action pp-btn-action--edit" onClick={(e) => { e.stopPropagation(); onEdit(); }} title="Edit deal">
            <Edit2 style={{ width: '0.75rem', height: '0.75rem' }} />
          </button>
          <button className="pp-btn-action pp-btn-action--delete" onClick={(e) => onDelete(deal.id, e)} title="Delete deal">
            <Trash2 style={{ width: '0.75rem', height: '0.75rem' }} />
          </button>
        </div>
      </div>
    </div>
  );
}
