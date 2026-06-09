/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import './AILeadScoringPage.css';
import { leadService, aiLeadScoringService } from '../../services/api';
import { Toast } from '../../components/common/Toast';
import { Dialog } from '../../components/common/Dialog';
import {
  BrainCircuit,
  Zap,
  RefreshCw,
  BarChart3,
  TrendingUp,
  Users,
  Flame,
  Snowflake,
  Thermometer,
  Search,
  ChevronRight,
  Target,
  Lightbulb,
  Clock,
  AlertTriangle,
  Inbox,
  Sparkles,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  XCircle,
  Loader2,
} from 'lucide-react';

const CATEGORY_CONFIG = {
  Hot: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)', icon: Flame, label: 'Hot Lead', glow: '0 0 20px rgba(239,68,68,0.15)' },
  Warm: { color: '#eab308', bg: 'rgba(234,179,8,0.12)', border: 'rgba(234,179,8,0.3)', icon: Thermometer, label: 'Warm Lead', glow: '0 0 20px rgba(234,179,8,0.15)' },
  Cold: { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.3)', icon: Snowflake, label: 'Cold Lead', glow: '0 0 20px rgba(59,130,246,0.15)' },
};

export const AILeadScoringPage = () => {
  const [leads, setLeads] = useState([]);
  const [scoringStats, setScoringStats] = useState(null);
  const [selectedLead, setSelectedLead] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scoringLoading, setScoringLoading] = useState(false);
  const [scoringAll, setScoringAll] = useState(false);
  const [insightLoading, setInsightLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMsg, setToastMsg] = useState(null);
  const [toastType, setToastType] = useState('success');
  const [insightDialogOpen, setInsightDialogOpen] = useState(false);

  const triggerToast = useCallback((msg, type) => {
    setToastMsg(msg);
    setToastType(type);
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [leadsData, statsData] = await Promise.all([
        leadService.getAll({ search: searchQuery || undefined }),
        aiLeadScoringService.getStats(),
      ]);
      setLeads(leadsData);
      setScoringStats(statsData);
    } catch {
      triggerToast('Failed to load leads and scoring data.', 'error');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, triggerToast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleScoreLead = async (leadId) => {
    setScoringLoading(true);
    try {
      const result = await aiLeadScoringService.scoreLead(leadId);
      triggerToast('Lead scored successfully!', 'success');
      fetchData();
      if (selectedLead?.id === leadId) {
        setInsights({
          ...result.lead,
          reasons: result.reasons,
          score: result.score,
          category: result.category,
          conversionProbability: result.conversionProbability,
          recommendedAction: result.recommendedAction,
        });
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to score lead';
      triggerToast(msg, 'error');
    } finally {
      setScoringLoading(false);
    }
  };

  const handleScoreAllLeads = async () => {
    setScoringAll(true);
    try {
      const result = await aiLeadScoringService.scoreAllLeads();
      triggerToast('All leads scored! ' + result.scored + ' processed.', 'success');
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to score all leads';
      triggerToast(msg, 'error');
    } finally {
      setScoringAll(false);
    }
  };

  const handleViewInsights = async (lead) => {
    setSelectedLead(lead);
    setInsightLoading(true);
    setInsightDialogOpen(true);
    try {
      const data = await aiLeadScoringService.getLeadInsights(lead.id);
      setInsights(data);
    } catch {
      triggerToast('Failed to load insights.', 'error');
    } finally {
      setInsightLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#ef4444';
    if (score >= 50) return '#eab308';
    return '#3b82f6';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Never';
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  const getScoreMeter = (score) => {
    const pct = Math.min(100, Math.max(0, score || 0));
    const color = getScoreColor(pct);
    return (
      <div className="als-score-meter">
        <div className="als-score-meter__track">
          <div className="als-score-meter__fill" style={{ width: pct + '%', backgroundColor: color }} />
        </div>
        <span className="als-score-meter__value" style={{ color }}>{pct}</span>
      </div>
    );
  };

  return (
    <div className="als-root">
      {toastMsg && <Toast message={toastMsg} type={toastType} onClose={() => setToastMsg(null)} />}

      {/* Header */}
      <div className="als-header">
        <div className="als-header__left">
          <div className="als-header__icon">
            <BrainCircuit className="als-header__icon-svg" />
          </div>
          <div>
            <h2 className="als-header__title">AI Lead Scoring</h2>
            <p className="als-header__subtitle">Intelligent lead evaluation powered by Groq AI</p>
          </div>
        </div>
        <div className="als-header__actions">
          <button
            className="als-btn als-btn--primary"
            onClick={handleScoreAllLeads}
            disabled={scoringAll || scoringLoading}
          >
            {scoringAll ? (
              <><Loader2 className="als-btn__icon als-spin" /> Scoring All...</>
            ) : (
              <><Zap className="als-btn__icon" /> Score All Leads</>
            )}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {scoringStats && (
        <div className="als-stats-grid">
          <div className="als-stat-card als-stat-card--hot">
            <div className="als-stat-card__top">
              <span className="als-stat-card__label">Hot Leads</span>
              <Flame className="als-stat-card__icon" style={{ color: '#ef4444' }} />
            </div>
            <span className="als-stat-card__value">{scoringStats.hotCount || 0}</span>
          </div>
          <div className="als-stat-card als-stat-card--warm">
            <div className="als-stat-card__top">
              <span className="als-stat-card__label">Warm Leads</span>
              <Thermometer className="als-stat-card__icon" style={{ color: '#eab308' }} />
            </div>
            <span className="als-stat-card__value">{scoringStats.warmCount || 0}</span>
          </div>
          <div className="als-stat-card als-stat-card--cold">
            <div className="als-stat-card__top">
              <span className="als-stat-card__label">Cold Leads</span>
              <Snowflake className="als-stat-card__icon" style={{ color: '#3b82f6' }} />
            </div>
            <span className="als-stat-card__value">{scoringStats.coldCount || 0}</span>
          </div>
          <div className="als-stat-card">
            <div className="als-stat-card__top">
              <span className="als-stat-card__label">Avg Score</span>
              <BarChart3 className="als-stat-card__icon" style={{ color: '#a78bfa' }} />
            </div>
            <span className="als-stat-card__value">{scoringStats.averageScore || 0}</span>
          </div>
        </div>
      )}

      {/* API Key Warning placeholder */}
      {!loading && leads.length > 0 && scoringStats?.scoredLeads === 0 && (
        <div className="als-warning">
          <AlertTriangle className="als-warning__icon" />
          <div>
            <h4 className="als-warning__title">Leads Not Yet Scored</h4>
            <p className="als-warning__text">Click "Score All Leads" or score individual leads using the AI button.</p>
          </div>
        </div>
      )}

      {/* Search & Filter */}
      <div className="als-toolbar">
        <div className="als-search">
          <Search className="als-search__icon" />
          <input
            type="text"
            className="als-search__input"
            placeholder="Search leads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Leads Table */}
      {loading ? (
        <div className="als-loading">
          <div className="als-loading__inner">
            <div className="als-loading__spinner" />
            <p className="als-loading__text">Loading leads...</p>
          </div>
        </div>
      ) : leads.length > 0 ? (
        <div className="als-table-wrap">
          <table className="als-table">
            <thead>
              <tr>
                <th>Lead Name</th>
                <th>Source</th>
                <th>AI Score</th>
                <th>Category</th>
                <th>Probability</th>
                <th>Last Scored</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => {
                const catConfig = CATEGORY_CONFIG[lead.aiCategory] || null;
                const CatIcon = catConfig?.icon || Sparkles;
                const score = lead.aiScore ?? lead.leadScore;
                return (
                  <tr key={lead.id} className="als-row">
                    <td>
                      <div className="als-cell-name">
                        <div className="als-avatar">{lead.name.charAt(0).toUpperCase()}</div>
                        <div>
                          <span className="als-name">{lead.name}</span>
                          <span className="als-email">{lead.email}</span>
                        </div>
                      </div>
                    </td>
                    <td><span className="als-source-badge">{lead.source}</span></td>
                    <td>{getScoreMeter(score)}</td>
                    <td>
                      {catConfig ? (
                        <div className="als-category-badge" style={{
                          backgroundColor: catConfig.bg,
                          borderColor: catConfig.border,
                          color: catConfig.color,
                          boxShadow: catConfig.glow,
                        }}>
                          <CatIcon className="als-category-badge__icon" />
                          {catConfig.label}
                        </div>
                      ) : (
                        <span className="als-category-badge als-category-badge--pending">
                          <Clock className="als-category-badge__icon" />
                          Pending
                        </span>
                      )}
                    </td>
                    <td>
                      {lead.conversionProbability ? (
                        <span className="als-probability">{lead.conversionProbability}</span>
                      ) : (
                        <span className="als-text-muted">—</span>
                      )}
                    </td>
                    <td>
                      <span className="als-date">{formatDate(lead.lastScoredAt)}</span>
                    </td>
                    <td className="als-actions-cell">
                      <div className="als-actions">
                        <button
                          className="als-btn als-btn--sm als-btn--score"
                          onClick={() => handleScoreLead(lead.id)}
                          disabled={scoringLoading}
                          title="Score with AI"
                        >
                          {scoringLoading ? (
                            <Loader2 className="als-spin" size={14} />
                          ) : (
                            <Zap size={14} />
                          )}
                          Score
                        </button>
                        <button
                          className="als-btn als-btn--sm als-btn--insight"
                          onClick={() => handleViewInsights(lead)}
                          title="View AI Insights"
                        >
                          <BrainCircuit size={14} />
                          Insights
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="als-empty">
          <Inbox className="als-empty__icon" />
          <h3 className="als-empty__title">No Leads Found</h3>
          <p className="als-empty__text">Create leads first to start AI-powered scoring.</p>
        </div>
      )}

      {/* Insights Dialog */}
      <Dialog isOpen={insightDialogOpen && selectedLead} onClose={() => { setInsightDialogOpen(false); setInsights(null); }} title="AI Lead Insights">
        {insightLoading ? (
          <div className="als-dialog-loading">
            <Loader2 className="als-spin" size={24} />
            <p>Loading AI analysis...</p>
          </div>
        ) : insights ? (
          <div className="als-insights">
            {/* Score Circle */}
            <div className="als-insights__score-section">
              <div className="als-insights__score-ring" style={{ '--score-color': getScoreColor(insights.aiScore) }}>
                <svg viewBox="0 0 100 100" className="als-insights__score-svg">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#27272a" strokeWidth="8" />
                  <circle
                    cx="50" cy="50" r="45" fill="none"
                    stroke={getScoreColor(insights.aiScore)}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 45}`}
                    strokeDashoffset={`${2 * Math.PI * 45 * (1 - (insights.aiScore || 0) / 100)}`}
                    transform="rotate(-90, 50, 50)"
                    style={{ transition: 'stroke-dashoffset 1s ease' }}
                  />
                </svg>
                <div className="als-insights__score-value" style={{ color: getScoreColor(insights.aiScore) }}>
                  {insights.aiScore}
                </div>
              </div>
              <div className="als-insights__score-info">
                <div className="als-insights__category-badge" style={{
                  backgroundColor: CATEGORY_CONFIG[insights.aiCategory]?.bg || 'rgba(59,130,246,0.12)',
                  color: CATEGORY_CONFIG[insights.aiCategory]?.color || '#3b82f6',
                  borderColor: CATEGORY_CONFIG[insights.aiCategory]?.border || 'rgba(59,130,246,0.3)',
                }}>
                  {insights.aiCategory === 'Hot' && <Flame size={14} />}
                  {insights.aiCategory === 'Warm' && <Thermometer size={14} />}
                  {insights.aiCategory === 'Cold' && <Snowflake size={14} />}
                  {insights.aiCategory || 'Unscored'} Lead
                </div>
                <div className="als-insights__stat">
                  <Target size={14} />
                  <span>Conversion Probability: <strong>{insights.conversionProbability || 'N/A'}</strong></span>
                </div>
                <div className="als-insights__stat">
                  <Clock size={14} />
                  <span>Last Scored: {formatDate(insights.lastScoredAt)}</span>
                </div>
              </div>
            </div>

            {/* Lead Info */}
            <div className="als-insights__section">
              <h4 className="als-insights__section-title">
                <Users size={14} /> Lead Information
              </h4>
              <div className="als-insights__info-grid">
                <div><span className="als-insights__label">Name</span><span>{insights.name}</span></div>
                <div><span className="als-insights__label">Email</span><span>{insights.email}</span></div>
                <div><span className="als-insights__label">Source</span><span>{insights.source}</span></div>
                <div><span className="als-insights__label">Status</span><span>{insights.status}</span></div>
              </div>
            </div>

            {/* Reasons */}
            {insights.reasons?.length > 0 && (
              <div className="als-insights__section">
                <h4 className="als-insights__section-title">
                  <Lightbulb size={14} /> Key Reasons for Score
                </h4>
                <ul className="als-insights__reasons">
                  {insights.reasons.map((reason, i) => (
                    <li key={i} className="als-insights__reason-item">
                      <CheckCircle2 size={12} className="als-insights__reason-icon" />
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommended Action */}
            {insights.recommendedAction && (
              <div className="als-insights__section als-insights__action-section">
                <h4 className="als-insights__section-title">
                  <Target size={14} /> Recommended Next Action
                </h4>
                <div className="als-insights__action">
                  <Sparkles size={16} />
                  {insights.recommendedAction}
                </div>
              </div>
            )}

            {/* Refresh */}
            <div className="als-insights__footer">
              <button
                className="als-btn als-btn--sm"
                onClick={() => handleScoreLead(insights.id)}
                disabled={scoringLoading}
              >
                <RefreshCw size={14} className={scoringLoading ? 'als-spin' : ''} />
                Refresh Score
              </button>
            </div>
          </div>
        ) : (
          <p className="als-text-muted">No insights available.</p>
        )}
      </Dialog>
    </div>
  );
};