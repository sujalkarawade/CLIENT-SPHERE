/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import './PipelinePage.css';
import { pipelineService } from '../../services/api';
import { Pipeline, PipelineStage } from '../../types';
import { Dialog } from '../../components/common/Dialog';
import { PipelineForm } from '../../components/forms/PipelineForm';
import { Toast, ToastType } from '../../components/common/Toast';
import { Plus, DollarSign, Inbox, Trash2 } from 'lucide-react';

const STAGES: PipelineStage[] = ['New Lead', 'Contacted', 'Qualified', 'Proposal Sent', 'Won', 'Lost'];

const stageHeaderMod = (stage: PipelineStage): string => {
  if (stage === 'Won')           return 'pp-col-header--won';
  if (stage === 'Lost')          return 'pp-col-header--lost';
  if (stage === 'Proposal Sent') return 'pp-col-header--proposal';
  return 'pp-col-header--default';
};

export const PipelinePage: React.FC = () => {
  const [deals, setDeals] = useState<Pipeline[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [isCreateAtStage, setIsCreateAtStage] = useState<PipelineStage>('New Lead');
  const [editingDeal, setEditingDeal] = useState<Pipeline | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [toastType, setToastType] = useState<ToastType>('success');
  const [syncing, setSyncing] = useState<boolean>(false);

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

  const triggerToast = (msg: string, type: ToastType) => { setToastMsg(msg); setToastType(type); };

  const handleCreateSubmit = async (data: Omit<Pipeline, 'id' | 'createdAt'>) => {
    setSyncing(true);
    try {
      await pipelineService.create({ ...data, stage: isCreateAtStage });
      triggerToast('Deal added to pipeline.', 'success');
      setIsCreateOpen(false);
      fetchDeals();
    } catch { triggerToast('Failed to register pipeline deal.', 'error'); }
    finally { setSyncing(false); }
  };

  const handleEditSubmit = async (data: Omit<Pipeline, 'id' | 'createdAt'>) => {
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

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Remove this deal from pipeline?')) return;
    try {
      await pipelineService.delete(id);
      triggerToast('Deal removed.', 'success');
      fetchDeals();
    } catch { triggerToast('Failed to remove deal.', 'error'); }
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggingId(id);
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetStage: PipelineStage) => {
    e.preventDefault();
    const dealId = e.dataTransfer.getData('text/plain');
    if (!dealId) return;
    const idx = deals.findIndex((d) => d.id === dealId);
    if (idx === -1 || deals[idx].stage === targetStage) return;

    const updated = [...deals];
    updated[idx] = { ...updated[idx], stage: targetStage };
    setDeals(updated);

    try {
      await pipelineService.update(dealId, { stage: targetStage });
      triggerToast(`Moved to ${targetStage}.`, 'success');
    } catch {
      triggerToast('Failed to update stage. Reverting.', 'error');
      fetchDeals();
    }
  };

  const formatUSD = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  const openAddAtStage = (stage: PipelineStage) => { setIsCreateAtStage(stage); setIsCreateOpen(true); };

  if (loading) return null;

  return (
    <div className="pp-root">
      {toastMsg && <Toast message={toastMsg} type={toastType} onClose={() => setToastMsg(null)} />}

      {/* Header */}
      <div className="pp-header">
        <div>
          <h2 className="pp-header__title">Pipeline</h2>
          <p className="pp-header__subtitle">Staging deal cycles. Drag and drop cards to update conversion steps.</p>
        </div>
        <button className="pp-header__btn" onClick={() => openAddAtStage('New Lead')}>
          <Plus className="pp-header__btn-icon" />
          Add Deal
        </button>
      </div>

      {/* Kanban board */}
      <div className="pp-board-scroll">
        <div className="pp-board">
          {STAGES.map((stage) => {
            const stageDeals = deals.filter((d) => d.stage === stage);
            const totalValue = stageDeals.reduce((sum, d) => sum + d.value, 0);

            return (
              <div
                key={stage}
                className={`pp-column ${draggingId ? 'pp-column--drag-over' : ''}`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, stage)}
              >
                {/* Column header */}
                <div className={`pp-col-header ${stageHeaderMod(stage)}`}>
                  <div className="pp-col-header__left">
                    <span className="pp-col-header__title">{stage}</span>
                    <span className="pp-col-header__count">{stageDeals.length} {stageDeals.length === 1 ? 'deal' : 'deals'}</span>
                  </div>
                  <span className="pp-col-header__value">{formatUSD(totalValue)}</span>
                </div>

                {/* Cards */}
                <div className="pp-cards-container">
                  {stageDeals.length > 0 ? (
                    stageDeals.map((deal) => (
                      <div
                        key={deal.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, deal.id)}
                        onDragEnd={() => setDraggingId(null)}
                        onClick={() => setEditingDeal(deal)}
                        className={`pp-deal-card ${draggingId === deal.id ? 'pp-deal-card--dragging' : ''}`}
                      >
                        <p className="pp-deal-card__title">{deal.title}</p>
                        <div className="pp-deal-card__footer">
                          <span className="pp-deal-card__value">
                            <DollarSign className="pp-deal-card__value-icon" style={{ width: '0.75rem', height: '0.75rem' }} />
                            {deal.value.toLocaleString()}
                          </span>
                          <div className="pp-deal-card__actions">
                            <button className="pp-btn-delete" onClick={(e) => handleDelete(deal.id, e)} title="Delete">
                              <Trash2 style={{ width: '0.875rem', height: '0.875rem' }} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="pp-col-empty">
                      <Inbox className="pp-col-empty__icon" style={{ width: '1rem', height: '1rem' }} />
                      <p className="pp-col-empty__text">No deals in this stage</p>
                    </div>
                  )}

                  <button className="pp-col-add-btn" onClick={() => openAddAtStage(stage)}>
                    <Plus className="pp-col-add-btn__icon" style={{ width: '0.75rem', height: '0.75rem' }} />
                    Enter deal
                  </button>
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
