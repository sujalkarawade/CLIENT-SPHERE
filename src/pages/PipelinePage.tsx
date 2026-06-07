/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { pipelineService } from '../services/api';
import { Pipeline, PipelineStage } from '../types';
import { Dialog } from '../components/common/Dialog';
import { PipelineForm } from '../components/forms/PipelineForm';
import { Toast, ToastType } from '../components/common/Toast';
import {
  Plus,
  TrendingDown,
  TrendingUp,
  Clock,
  Trash2,
  Edit2,
  DollarSign,
  Briefcase,
  Inbox
} from 'lucide-react';

const STAGES: PipelineStage[] = [
  'New Lead',
  'Contacted',
  'Qualified',
  'Proposal Sent',
  'Won',
  'Lost',
];

export const PipelinePage: React.FC = () => {
  const [deals, setDeals] = useState<Pipeline[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  // Dialog parameters
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [isCreateAtStage, setIsCreateAtStage] = useState<PipelineStage>('New Lead');
  const [editingDeal, setEditingDeal] = useState<Pipeline | null>(null);

  // Toast parameters
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [toastType, setToastType] = useState<ToastType>('success');
  const [syncing, setSyncing] = useState<boolean>(false);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      const data = await pipelineService.getAll();
      setDeals(data);
    } catch (err) {
      triggerToast('Failed to retrieve sales pipeline deals ledger.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  const triggerToast = (msg: string, type: ToastType) => {
    setToastMsg(msg);
    setToastType(type);
  };

  const handleCreateSubmit = async (data: Omit<Pipeline, 'id' | 'createdAt'>) => {
    setSyncing(true);
    try {
      await pipelineService.create({
        ...data,
        stage: isCreateAtStage
      });
      triggerToast('Sales deal entered into pipeline index.', 'success');
      setIsCreateOpen(false);
      fetchDeals();
    } catch (err) {
      triggerToast('Failed to register pipeline deal.', 'error');
    } finally {
      setSyncing(false);
    }
  };

  const handleEditSubmit = async (data: Omit<Pipeline, 'id' | 'createdAt'>) => {
    if (!editingDeal) return;
    setSyncing(true);
    try {
      await pipelineService.update(editingDeal.id, data);
      triggerToast('Pipeline deal metrics updated.', 'success');
      setEditingDeal(null);
      fetchDeals();
    } catch (err) {
      triggerToast('Failed to sync pipeline deal changes.', 'error');
    } finally {
      setSyncing(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to retract this deal from your sales records?')) return;
    try {
      await pipelineService.delete(id);
      triggerToast('Sales deal removed from books.', 'success');
      fetchDeals();
    } catch (err) {
      triggerToast('Failed to remove deal from pipeline.', 'error');
    }
  };

  // HTML5 Drag Handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggingId(id);
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggingId(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Required to allow dropping
  };

  const handleDrop = async (e: React.DragEvent, targetStage: PipelineStage) => {
    e.preventDefault();
    const dealId = e.dataTransfer.getData('text/plain');
    if (!dealId) return;

    // Local state optimistic update for zero delay feel
    const matchIdx = deals.findIndex(d => d.id === dealId);
    if (matchIdx === -1 || deals[matchIdx].stage === targetStage) return;

    const originalStage = deals[matchIdx].stage;
    const optimisticDeals = [...deals];
    optimisticDeals[matchIdx] = { ...optimisticDeals[matchIdx], stage: targetStage };
    setDeals(optimisticDeals);

    try {
      await pipelineService.update(dealId, { stage: targetStage });
      triggerToast(`Deal moved to ${targetStage} stage.`, 'success');
    } catch (err) {
      triggerToast('Failed to update stage location on the registry. Reverting state.', 'error');
      // Rollback on error
      fetchDeals();
    }
  };

  // Utilities
  const formatUSD = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Get stage column styling details
  const getStageHeaderStyles = (stage: PipelineStage) => {
    switch (stage) {
      case 'Won': return 'text-emerald-400 border-b border-[#27272a] bg-emerald-950/20';
      case 'Lost': return 'text-rose-450 border-b border-[#27272a] bg-rose-950/10';
      case 'Proposal Sent': return 'text-amber-450 border-b border-[#27272a] bg-amber-950/10';
      default: return 'text-zinc-300 border-b border-[#27272a] bg-[#18181b]/60';
    }
  };

  const openAddAtStage = (stage: PipelineStage) => {
    setIsCreateAtStage(stage);
    setIsCreateOpen(true);
  };

  return (
    <div className="space-y-6 animate-none max-w-full overflow-hidden select-none">
      {toastMsg && (
        <Toast
          message={toastMsg}
          type={toastType}
          onClose={() => setToastMsg(null)}
        />
      )}

      {/* Header operations row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#27272a] pb-4">
        <div>
          <h2 className="font-display text-base font-bold text-white tracking-tight">Pipeline</h2>
          <p className="text-[11px] text-zinc-500 mt-0.5">Staging deal cycles. Drag and drop cards to update conversion steps.</p>
        </div>
        <button
          onClick={() => openAddAtStage('New Lead')}
          className="inline-flex items-center justify-center gap-1.5 rounded bg-[#18181b] border border-[#27272a] hover:bg-[#27272a] px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition duration-150 shrink-0 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5 text-[#6366f1]" />
          Add Deal
        </button>
      </div>

      {/* Kanban Board Scrollable block */}
      <div className="overflow-x-auto pb-4 -mx-6 px-6 lg:-mx-8 lg:px-8">
        <div className="flex gap-4 min-w-[1200px] h-[calc(100vh-270px)] min-h-[500px]">
          {STAGES.map(stage => {
            const stageDeals = deals.filter(d => d.stage === stage);
            const totalValue = stageDeals.reduce((sum, d) => sum + d.value, 0);

            return (
              <div
                key={stage}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage)}
                className={`flex flex-col w-[255px] bg-[#09090b] border border-[#27272a] rounded-lg relative overflow-hidden shrink-0 pb-3 shadow-none ${
                  draggingId ? 'ring-1 ring-[#27272a] bg-[#18181b]/30' : ''
                }`}
              >
                {/* Column header panel */}
                <div className={`px-4 py-3 flex items-center justify-between ${getStageHeaderStyles(stage)}`}>
                  <div className="min-w-0">
                    <h3 className="text-[11px] font-bold font-display tracking-tight truncate">{stage}</h3>
                    <p className="text-[9px] text-zinc-500 mt-0.5 font-mono">{stageDeals.length} {stageDeals.length === 1 ? 'deal' : 'deals'}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono font-bold leading-none">{formatUSD(totalValue)}</span>
                  </div>
                </div>

                {/* Column workspace cards list container */}
                <div className="flex-1 overflow-y-auto px-2.5 py-2.5 space-y-2">
                  {stageDeals.length > 0 ? (
                    stageDeals.map(deal => {
                      const idDraggingThis = draggingId === deal.id;
                      return (
                        <div
                          key={deal.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, deal.id)}
                          onDragEnd={handleDragEnd}
                          onClick={() => setEditingDeal(deal)}
                          className={`bg-[#18181b] border border-[#27272a] rounded p-3 transition-all duration-120 cursor-grab hover:border-zinc-400 active:cursor-grabbing group shadow-sm relative overflow-hidden ${
                            idDraggingThis ? 'opacity-30 border-dashed border-[#6366f1]/40' : ''
                          }`}
                        >
                          <div className="flex justify-between items-start gap-2 mb-2">
                            <h4 className="text-[11px] font-semibold tracking-tight text-zinc-200 group-hover:text-[#6366f1] transition-colors leading-snug">
                              {deal.title}
                            </h4>
                          </div>

                          <div className="flex items-center justify-between mt-2.5 border-t border-[#27272a]/60 pt-2 bg-transparent text-[10px] font-semibold text-zinc-500">
                            <span className="font-mono text-zinc-200 flex items-center font-bold">
                              <DollarSign className="w-3 h-3 text-[#6366f1] -mr-0.5" />
                              {deal.value.toLocaleString()}
                            </span>
                            <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => handleDelete(deal.id, e)}
                                className="text-zinc-500 hover:text-rose-400 p-0.5 rounded hover:bg-[#18181b]"
                                title="Remove deal"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="h-24 flex flex-col items-center justify-center border border-dashed border-[#27272a]/70 rounded text-center p-3">
                      <Inbox className="w-4 h-4 text-zinc-850 mb-1" />
                      <p className="text-[9px] text-zinc-600 font-medium">Stage holds no deals</p>
                    </div>
                  )}

                  {/* Add deal at stage button layout */}
                  <button
                    onClick={() => openAddAtStage(stage)}
                    className="w-full py-1.5 border border-dashed border-[#27272a] hover:border-zinc-700 text-zinc-500 hover:text-white bg-transparent flex items-center justify-center gap-1 rounded text-[11px] leading-none transition duration-150 cursor-pointer"
                  >
                    <Plus className="w-3 h-3 text-[#6366f1]" />
                    Enter deal
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CREATE DIALOG OVERLAY */}
      <Dialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Add Deal"
      >
        <PipelineForm
          onSubmit={handleCreateSubmit}
          onCancel={() => setIsCreateOpen(false)}
          isSubmitting={syncing}
        />
      </Dialog>

      {/* EDIT DIALOG OVERLAY */}
      <Dialog
        isOpen={!!editingDeal}
        onClose={() => setEditingDeal(null)}
        title="Edit Deal"
      >
        {editingDeal && (
          <PipelineForm
            initialData={editingDeal}
            onSubmit={handleEditSubmit}
            onCancel={() => setEditingDeal(null)}
            isSubmitting={syncing}
          />
        )}
      </Dialog>
    </div>
  );
};
