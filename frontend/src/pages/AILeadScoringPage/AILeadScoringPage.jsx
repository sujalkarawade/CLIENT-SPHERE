/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import './AILeadScoringPage.css';
import { aiLeadScoringService, leadService } from '../../services/api';
import { Toast } from '../../components/common/Toast';
import {
  Brain,
  Zap,
  RefreshCw,
  Search,
  Filter,
  Building2,
  ChevronRight,
  X,
  AlertTriangle,
  Inbox,
  TrendingUp,
  Flame,
  Thermometer,
  Snowflake,
  BarChart3,
  Star,
  Lightbulb,
  Calendar,
  Mail,
  MapPin,
  Briefcase,
} from 'lucide-react';

// ── Helpers ──────────────────────────────────────────────────────────────────

function getCategoryMod(cat) {
  if (cat === 'Hot')  return 'hot';
  if (cat === 'Warm') return 'warm';
  if (cat === 'Cold') return 'cold';
  return 'none';
}

function ScoreRing({ score, category }) {
  const mod = getCategoryMod(category);
  const r = 20;
  const circ = 2 * Math.PI * r;
  const offset = circ - (circ * (score || 0)) / 100;
  return (
    <div className="als-score-ring">
      <svg width="52" height="52" className="als-score-ring__svg">
        <circle cx="26" cy="26" r={r} strokeWidth="4" className="als-score-ring__track" />
        <circle
          cx="26" cy="26" r={r} strokeWidth="4"
          className={'als-score-ring__fill als-score-ring__fill--' + mod}
          strokeDasharray={circ}
          strokeDashoffset={offset}
        />
        <text
          x="26" y="26"
          dominantBaseline="central"
          textAnchor="middle"
          transform="rotate(90 26 26)"
          style={{ fontSize: '9px', fontWeight: '700', fontFamily: 'monospace', fill: '#fff' }}
        >
          {score ?? '–'}
        </text>
      </svg>
    </div>
  );
}

function CategoryBadge({ category }) {
  if (!category) return (
    <span className="als-cat-badge als-cat-badge--none">Unscored</span>
  );
  const mod = getCategoryMod(category);
  return (
    <span className={'als-cat-badge als-cat-badge--' + mod}>
      <span className={'als-cat-badge__dot als-cat-badge__dot--' + mod} />
      {category} Lead
    </span>
  );
}

function ProbabilityBar({ probability, category }) {
  const mod = getCategoryMod(category);
  return (
    <div className="als-prob-row">
      <div className="als-prob-row__top">
        <span>Conversion Probability</span>
        <span className="als-prob-row__pct">{probability ?? 0}%</span>
      </div>
      <div className="als-prob-track">
        <div
          className={'als-prob-fill als-prob-fill--' + mod}
          style={{ width: (probability ?? 0) + '%' }}
        />
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export const AILeadScoringPage = () => {
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scoringId, setScoringId] = useState(null);       // single lead scoring
  const [bulkScoring, setBulkScoring] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [insightLead, setInsightLead] = useState(null);    // panel lead
  const [apiWarning, setApiWarning] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);
  const [toastType, setToastType] = useState('success');

  const triggerToast = (msg, type = 'success') => { setToastMsg(msg); setToastType(type); };

  // ── Fetch leads + stats ─────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [leadsData, statsData] = await Promise.all([
        leadService.getAll(),
        aiLeadScoringService.getScoringStats().catch(() => null),
      ]);
      setLeads(leadsData);
      setStats(statsData);
    } catch {
      triggerToast('Failed to load lead scoring data.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Score single lead ───────────────────────────────────────────────────────
  const handleScoreLead = async (lead) => {
    setScoringId(lead.id);
    setApiWarning(null);
    try {
      const result = await aiLeadScoringService.scoreLead(lead.id);
      setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, ...result.lead } : l));
      // Refresh stats
      const statsData = await aiLeadScoringService.getScoringStats().catch(() => null);
      if (statsData) setStats(statsData);
      triggerToast('Lead scored successfully.', 'success');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to score lead.';
      if (msg.toLowerCase().includes('api key') || msg.toLowerCase().includes('configured')) {
        setApiWarning(msg);
      }
      triggerToast(msg, 'error');
    } finally {
      setScoringId(null);
    }
  };

  // ── Score all leads ─────────────────────────────────────────────────────────
  const handleScoreAll = async () => {
    if (!window.confirm('This will analyze all leads using the Groq AI. Large lead lists may take a minute. Continue?')) return;
    setBulkScoring(true);
    setBulkProgress({ current: 0, total: leads.length });
    setApiWarning(null);
    try {
      // Stream progress updates by polling after POST kicks off
      // The bulk endpoint handles sequential scoring server-side
      const result = await aiLeadScoringService.scoreAllLeads();
      await fetchData();
      triggerToast(
        'Scored ' + result.scored + ' lead' + (result.scored !== 1 ? 's' : '') +
        (result.failed > 0 ? '. ' + result.failed + ' failed.' : '.'),
        result.failed > 0 ? 'error' : 'success'
      );
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Bulk scoring failed.';
      if (msg.toLowerCase().includes('api key') || msg.toLowerCase().includes('configured')) {
        setApiWarning(msg);
      }
      triggerToast(msg, 'error');
    } finally {
      setBulkScoring(false);
      setBulkProgress({ current: 0, total: 0 });
    }
  };

  // ── View Insights panel ─────────────────────────────────────────────────────
  const handleViewInsights = async (lead) => {
    try {
      const data = await aiLeadScoringService.getLeadInsights(lead.id);
      setInsightLead({ ...data.lead, insights: data.insights });
    } catch {
      triggerToast('Failed to load insights.', 'error');
    }
  };

  // ── Derived filtered leads ──────────────────────────────────────────────────
  const filteredLeads = leads.filter(l => {
    const q = searchQuery.toLowerCase();
    const matchSearch = !q ||
      (l.name || '').toLowerCase().includes(q) ||
      (l.company || '').toLowerCase().includes(q) ||
      (l.email || '').toLowerCase().includes(q);
    const matchCat = filterCategory === 'All' || l.aiCategory === filterCategory;
    return matchSearch && matchCat;
  });

  // ── Render helpers ──────────────────────────────────────────────────────────
  const renderStatCards = () => {
    if (!stats && !loading) return null;
    const cards = [
      { label: 'Hot Leads',    value: stats?.hotLeads ?? 0,   mod: 'hot',   icon: Flame,       meta: 'Score 80–100' },
      { label: 'Warm Leads',   value: stats?.warmLeads ?? 0,  mod: 'warm',  icon: Thermometer, meta: 'Score 50–79' },
      { label: 'Cold Leads',   value: stats?.coldLeads ?? 0,  mod: 'cold',  icon: Snowflake,   meta: 'Score 0–49' },
      { label: 'Avg AI Score', value: stats?.avgScore ?? '–', mod: 'avg',   icon: BarChart3,   meta: 'Scored leads' },
      { label: 'Total Scored', value: stats?.totalScored ?? 0,mod: 'total', icon: Brain,       meta: 'AI analyzed' },
    ];
    return (
      <div className="als-stats-grid">
        {cards.map(({ label, value, mod, icon: Icon, meta }) => (
          <div key={label} className={'als-stat-card als-stat-card--' + mod}>
            <div className="als-stat-card__top">
              <span className="als-stat-card__label">{label}</span>
              <div className="als-stat-card__icon">
                <Icon style={{ width: '0.875rem', height: '0.875rem', color: '#a1a1aa' }} />
              </div>
            </div>
            <div className="als-stat-card__value">{value}</div>
            <div className="als-stat-card__meta">{meta}</div>
          </div>
        ))}
      </div>
    );
  };

  const renderLeadCard = (lead) => {
    const isScoring = scoringId === lead.id;
    const hasScore = lead.aiScore !== null && lead.aiScore !== undefined;
    const mod = getCategoryMod(lead.aiCategory);

    let reasons = [];
    if (lead.aiReasoning) {
      try { reasons = JSON.parse(lead.aiReasoning); } catch { reasons = [lead.aiReasoning]; }
    }

    const lastScored = lead.lastScoredAt
      ? new Date(lead.lastScoredAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
      : null;

    return (
      <div
        key={lead.id}
        className={'als-lead-card als-lead-card--' + (hasScore ? mod : 'unscored') + (isScoring ? ' als-lead-card--scoring' : '')}
      >
        {isScoring && (
          <div className="als-scoring-overlay">
            <div className="als-scoring-overlay__spinner" />
            <span className="als-scoring-overlay__text">Analyzing with AI...</span>
          </div>
        )}

        {/* Top row */}
        <div className="als-lead-card__top">
          <div className="als-lead-card__info">
            <div className="als-lead-card__name">{lead.name}</div>
            <div className="als-lead-card__company">
              <Building2 style={{ width: '0.75rem', height: '0.75rem' }} />
              {lead.company || lead.email}
            </div>
            <div style={{ marginTop: '0.5rem' }}>
              <CategoryBadge category={lead.aiCategory} />
            </div>
          </div>
          <ScoreRing score={hasScore ? lead.aiScore : null} category={lead.aiCategory} />
        </div>

        {/* Scored content */}
        {hasScore ? (
          <>
            <ProbabilityBar probability={lead.conversionProbability} category={lead.aiCategory} />

            {reasons.length > 0 && (
              <div className="als-reasons">
                <div className="als-reasons__title">Key Signals</div>
                {reasons.slice(0, 3).map((r, i) => (
                  <div key={i} className="als-reasons__item">
                    <span className="als-reasons__dot" />
                    {r}
                  </div>
                ))}
              </div>
            )}

            {lead.recommendedAction && (
              <div className="als-action-box">
                <Lightbulb className="als-action-box__icon" style={{ width: '0.875rem', height: '0.875rem' }} />
                <div className="als-action-box__content">
                  <div className="als-action-box__label">Next Action</div>
                  <div className="als-action-box__text">{lead.recommendedAction}</div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="als-unscored-box">
            <Brain className="als-unscored-box__icon" style={{ width: '1.5rem', height: '1.5rem' }} />
            <div className="als-unscored-box__text">No AI analysis yet. Click Analyze to score this lead.</div>
          </div>
        )}

        {/* Footer */}
        <div className="als-lead-card__footer">
          <span className="als-lead-card__meta">
            {lastScored ? 'Scored ' + lastScored : 'Never scored'}
          </span>
          <div className="als-lead-card__footer-actions">
            {hasScore && (
              <button
                className="als-icon-btn"
                onClick={() => handleViewInsights(lead)}
                title="View full insights"
              >
                <ChevronRight style={{ width: '0.75rem', height: '0.75rem' }} />
                Insights
              </button>
            )}
            <button
              className="als-icon-btn als-icon-btn--primary"
              onClick={() => handleScoreLead(lead)}
              disabled={isScoring || bulkScoring}
              title={hasScore ? 'Refresh AI score' : 'Analyze lead'}
            >
              {hasScore
                ? <><RefreshCw style={{ width: '0.75rem', height: '0.75rem' }} /> Refresh</>
                : <><Zap style={{ width: '0.75rem', height: '0.75rem' }} /> Analyze</>
              }
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderInsightsPanel = () => {
    if (!insightLead) return null;
    const lead = insightLead;
    const mod = getCategoryMod(lead.aiCategory);
    let reasons = [];
    if (lead.aiReasoning) {
      try { reasons = JSON.parse(lead.aiReasoning); } catch { reasons = [lead.aiReasoning]; }
    }

    const infoRows = [
      { key: 'Email',        val: lead.email,           icon: Mail },
      { key: 'Company',      val: lead.company,          icon: Building2 },
      { key: 'Industry',     val: lead.industry,         icon: Briefcase },
      { key: 'Company Size', val: lead.companySize,      icon: TrendingUp },
      { key: 'Budget',       val: lead.budget,           icon: Star },
      { key: 'Job Title',    val: lead.jobTitle,         icon: Briefcase },
      { key: 'Region',       val: lead.region,           icon: MapPin },
      { key: 'Engagement',   val: lead.engagementLevel,  icon: Zap },
      { key: 'Source',       val: lead.source,           icon: ChevronRight },
      { key: 'Status',       val: lead.status,           icon: Filter },
    ].filter(r => r.val);

    return (
      <>
        <div className="als-insights-panel__overlay" onClick={() => setInsightLead(null)} />
        <aside className="als-insights-panel">
          <div className="als-insights-panel__header">
            <h3 className="als-insights-panel__title">AI Insights — {lead.name}</h3>
            <button className="als-insights-panel__close" onClick={() => setInsightLead(null)}>
              <X style={{ width: '0.875rem', height: '0.875rem' }} />
            </button>
          </div>

          <div className="als-insights-panel__body">
            {/* Score summary */}
            <div className="als-panel-section">
              <div className="als-panel-section__label">Score Summary</div>
              <div className="als-panel-score-row">
                <div className={'als-panel-big-score als-panel-big-score--' + mod}>
                  {lead.aiScore ?? '–'}
                </div>
                <div className="als-panel-score-meta">
                  <div className="als-panel-score-meta__cat">
                    <CategoryBadge category={lead.aiCategory} />
                  </div>
                  <div className="als-panel-score-meta__prob">
                    {lead.conversionProbability ?? 0}% conversion probability
                  </div>
                </div>
              </div>
              <div style={{ marginTop: '0.75rem' }}>
                <ProbabilityBar probability={lead.conversionProbability} category={lead.aiCategory} />
              </div>
            </div>

            {/* Key reasons */}
            {reasons.length > 0 && (
              <div className="als-panel-section">
                <div className="als-panel-section__label">Key Scoring Signals</div>
                <div className="als-reasons">
                  {reasons.map((r, i) => (
                    <div key={i} className="als-reasons__item">
                      <span className="als-reasons__dot" />
                      {r}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommended action */}
            {lead.recommendedAction && (
              <div className="als-panel-section">
                <div className="als-panel-section__label">Recommended Action</div>
                <div className="als-action-box">
                  <Lightbulb className="als-action-box__icon" style={{ width: '0.875rem', height: '0.875rem' }} />
                  <div className="als-action-box__content">
                    <div className="als-action-box__text">{lead.recommendedAction}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Lead profile */}
            <div className="als-panel-section">
              <div className="als-panel-section__label">Lead Profile</div>
              <div className="als-panel-lead-info">
                {infoRows.map(({ key, val }) => (
                  <div key={key} className="als-panel-info-row">
                    <span className="als-panel-info-row__key">{key}</span>
                    <span className="als-panel-info-row__val">{val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            {lead.notes && (
              <div className="als-panel-section">
                <div className="als-panel-section__label">Notes</div>
                <p style={{ fontSize: '0.6875rem', color: '#a1a1aa', lineHeight: '1.6' }}>{lead.notes}</p>
              </div>
            )}

            {/* Re-score button */}
            <button
              className="als-btn als-btn--primary"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={async () => {
                await handleScoreLead(lead);
                // Refresh panel data
                const data = await aiLeadScoringService.getLeadInsights(lead.id).catch(() => null);
                if (data) setInsightLead({ ...data.lead, insights: data.insights });
              }}
              disabled={scoringId === lead.id}
            >
              <RefreshCw className="als-btn__icon" />
              {scoringId === lead.id ? 'Analyzing...' : 'Refresh AI Score'}
            </button>

            {lead.lastScoredAt && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', justifyContent: 'center' }}>
                <Calendar style={{ width: '0.75rem', height: '0.75rem', color: '#52525b' }} />
                <span style={{ fontSize: '0.5625rem', color: '#52525b', fontFamily: 'monospace' }}>
                  Last scored {new Date(lead.lastScoredAt).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </aside>
      </>
    );
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="als-root">
      {toastMsg && <Toast message={toastMsg} type={toastType} onClose={() => setToastMsg(null)} />}
      {renderInsightsPanel()}

      {/* Header */}
      <div className="als-header">
        <div className="als-header__left">
          <div className="als-header__tag">
            <Brain className="als-header__tag-icon" />
            AI-Powered Module
          </div>
          <h2 className="als-header__title">AI Lead Scoring</h2>
          <p className="als-header__subtitle">Analyze and rank leads by conversion potential using Groq AI.</p>
        </div>
        <div className="als-header__actions">
          <button
            className="als-btn"
            onClick={fetchData}
            disabled={loading || bulkScoring}
            title="Refresh data"
          >
            <RefreshCw className="als-btn__icon als-btn__icon--accent" />
            Refresh
          </button>
          <button
            className="als-btn als-btn--primary"
            onClick={handleScoreAll}
            disabled={bulkScoring || loading || leads.length === 0}
          >
            <Zap className="als-btn__icon" />
            {bulkScoring ? 'Analyzing All...' : 'Analyze All Leads'}
          </button>
        </div>
      </div>

      {/* API Warning banner */}
      {apiWarning && (
        <div style={{
          display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
          background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)',
          borderRadius: '0.5rem', padding: '0.875rem 1rem',
        }}>
          <AlertTriangle style={{ width: '1rem', height: '1rem', color: '#f59e0b', flexShrink: 0, marginTop: '0.125rem' }} />
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fbbf24', marginBottom: '0.25rem' }}>
              Groq API Configuration Issue
            </div>
            <p style={{ fontSize: '0.6875rem', color: '#a1a1aa', lineHeight: 1.6, margin: 0 }}>
              {apiWarning} — Add <code style={{ background: '#18181b', padding: '0 4px', borderRadius: 3, color: '#818cf8' }}>GROQ_API_KEY</code> to your <code style={{ background: '#18181b', padding: '0 4px', borderRadius: 3, color: '#818cf8' }}>.env</code> file and restart the server.
            </p>
          </div>
        </div>
      )}

      {/* Bulk scoring progress */}
      {bulkScoring && (
        <div className="als-bulk-progress">
          <div className="als-bulk-progress__header">
            <span className="als-bulk-progress__label">
              <div className="als-loading__spinner" style={{ width: '0.875rem', height: '0.875rem', border: '2px solid #27272a', borderTopColor: '#6366f1', borderRadius: '9999px', animation: 'alsSpin 0.65s linear infinite', display: 'inline-block' }} />
              Processing leads with Groq AI...
            </span>
            <span className="als-bulk-progress__count">{leads.length} leads</span>
          </div>
          <div className="als-bulk-progress__track">
            <div className="als-bulk-progress__fill" style={{ width: '60%' }} />
          </div>
        </div>
      )}

      {/* Stats strip */}
      {renderStatCards()}

      {/* Filters */}
      <div className="als-filters">
        <div className="als-filters__search-wrap">
          <div className="als-filters__search-icon">
            <Search style={{ width: '0.875rem', height: '0.875rem' }} />
          </div>
          <input
            type="text"
            className="als-filters__input"
            placeholder="Search leads by name, company, email..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="als-filters__right">
          <Filter style={{ color: '#71717a', width: '0.875rem', height: '0.875rem' }} />
          <select
            className="als-filters__select"
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
          >
            <option value="All">All Categories</option>
            <option value="Hot">Hot Leads</option>
            <option value="Warm">Warm Leads</option>
            <option value="Cold">Cold Leads</option>
          </select>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="als-loading">
          <div className="als-loading__inner">
            <div className="als-loading__spinner" />
            <p className="als-loading__text">Loading lead intelligence...</p>
          </div>
        </div>
      ) : filteredLeads.length > 0 ? (
        <>
          <div className="als-section-head">
            <div className="als-section-head__title">
              <Brain className="als-section-head__icon" />
              Lead Intelligence
            </div>
            <span className="als-section-head__count">{filteredLeads.length} leads</span>
          </div>
          <div className="als-leads-grid">
            {filteredLeads.map(renderLeadCard)}
          </div>
        </>
      ) : (
        <div className="als-empty">
          <Inbox className="als-empty__icon" style={{ width: '1.75rem', height: '1.75rem' }} />
          <h3 className="als-empty__title">No leads found</h3>
          <p className="als-empty__text">
            {leads.length === 0
              ? 'Add leads in the Leads section, then come back to analyze them.'
              : 'No leads match your current search or category filter.'}
          </p>
        </div>
      )}
    </div>
  );
};
