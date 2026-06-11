/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import './DashboardPage.css';
import { dashboardService, aiLeadScoringService } from '../../services/api';
import { Toast } from '../../components/common/Toast';
import { Users, UserCheck, ClipboardList, Coins, TrendingUp, Inbox, Brain, Flame, Thermometer, Snowflake, BarChart3, ChevronRight, Bot } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';

const CHR_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#ef4444'];

export const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [aiStats, setAiStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState(null);
  const [toastType, setToastType] = useState('success');
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      dashboardService.getStats(),
      aiLeadScoringService.getScoringStats().catch(() => null),
    ])
      .then(([statsData, aiData]) => {
        setStats(statsData);
        setAiStats(aiData);
      })
      .catch(() => {
        setToastMsg('Failed to load dashboard data.');
        setToastType('error');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="dp-loading">
        <div className="dp-loading__inner">
          <div className="dp-loading__spinner" />
          <p className="dp-loading__text">Aggregating sales intelligence...</p>
        </div>
      </div>
    );
  }

  const formatUSD = (val) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  const statCards = [
    { name: 'Total Active Clients',      value: stats?.totalClients ?? 0,           icon: Users },
    { name: 'Tracked Prospects/Leads',   value: stats?.totalLeads ?? 0,             icon: UserCheck },
    { name: 'Active Sync Tasks',         value: stats?.totalTasks ?? 0,             icon: ClipboardList },
    { name: 'Won Revenue Pipeline',      value: formatUSD(stats?.revenue ?? 0),     icon: Coins },
  ];

  return (
    <div className="dp-root">
      {toastMsg && <Toast message={toastMsg} type={toastType} onClose={() => setToastMsg(null)} />}

      {/* Welcome banner */}
      <div className="dp-banner">
        <div className="dp-banner__inner">
          <div className="dp-banner__tag">
            <TrendingUp className="dp-banner__tag-icon" />
            Active Operations Environment
          </div>
          <h2 className="dp-banner__title">ClientSphere Analytics Cockpit</h2>
          <p className="dp-banner__subtitle">
            Real-time insights aggregated across standard business pipelines.
          </p>
          <button
            className="dp-ask-ai-btn"
            onClick={() => navigate('/ai-assistant')}
            type="button"
          >
            <Bot style={{ width: '0.875rem', height: '0.875rem' }} />
            Ask AI Assistant
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="dp-kpi-grid">
        {statCards.map(({ name, value, icon: Icon }, idx) => (
          <div key={idx} className="dp-kpi-card">
            <div className="dp-kpi-card__top">
              <span className="dp-kpi-card__label">{name}</span>
              <div className="dp-kpi-card__icon-wrap">
                <Icon style={{ width: '0.875rem', height: '0.875rem' }} />
              </div>
            </div>
            <div>
              <p className="dp-kpi-card__value">{value}</p>
              <p className="dp-kpi-card__meta">
                Active in current ledger cycle
                <span className="dp-kpi-card__meta-dot">●</span>
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="dp-charts-grid">
        {/* Revenue area chart */}
        <div className="dp-chart-card">
          <div className="dp-chart-card__header">
            <div>
              <h3 className="dp-chart-card__title">Monthly Income Growth</h3>
              <p className="dp-chart-card__subtitle">Aggregate values from pipeline "Won" deals 2026</p>
            </div>
            <span className="dp-chart-card__badge">Accumulating</span>
          </div>
          <div className="dp-chart-area">
            {stats?.monthlyRevenue?.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.monthlyRevenue} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.3} />
                  <XAxis dataKey="month" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => v / 1000 + 'k'} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '6px', fontSize: '11px' }}
                    labelStyle={{ color: '#a1a1aa', fontWeight: 'bold' }}
                    itemStyle={{ color: '#fafafa' }}
                    formatter={(val) => [val.toLocaleString(), 'Income']}
                  />
                  <Area type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={1.5} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="dp-chart-empty">
                <Inbox className="dp-chart-empty__icon" style={{ width: '2rem', height: '2rem' }} />
                <p className="dp-chart-empty__text">Zero revenue statistics recorded</p>
              </div>
            )}
          </div>
        </div>

        {/* Lead funnel pie */}
        <div className="dp-pie-card">
          <div>
            <h3 className="dp-chart-card__title">Lead Funnel Status</h3>
            <p className="dp-chart-card__subtitle">Current lifecycle placement counts</p>
          </div>
          <div className="dp-pie-area">
            {stats?.leadConversion?.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stats.leadConversion} cx="50%" cy="50%" innerRadius={50} outerRadius={68} paddingAngle={3} dataKey="value">
                    {stats.leadConversion.map((_, index) => (
                      <Cell key={'cell-' + index} fill={CHR_COLORS[index % CHR_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '6px', fontSize: '11px' }}
                    itemStyle={{ color: '#fafafa' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="dp-chart-empty">
                <Inbox className="dp-chart-empty__icon" style={{ width: '2rem', height: '2rem' }} />
                <p className="dp-chart-empty__text">Zero lead conversion indices</p>
              </div>
            )}
          </div>
          <div className="dp-pie-legend">
            {stats?.leadConversion.slice(0, 6).map((item, index) => (
              <div key={item.name} className="dp-pie-legend__item">
                <div className="dp-pie-legend__label-row">
                  <span className="dp-pie-legend__dot" style={{ backgroundColor: CHR_COLORS[index % CHR_COLORS.length] }} />
                  <span className="dp-pie-legend__name">{item.name}</span>
                </div>
                <span className="dp-pie-legend__count">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── AI Lead Scoring Widgets ─────────────────────────────────────── */}
      {aiStats && (
        <>
          {/* AI Score KPI row */}
          <div className="dp-ai-section-header">
            <div className="dp-ai-section-header__left">
              <Brain className="dp-ai-section-header__icon" />
              <div>
                <h3 className="dp-ai-section-header__title">AI Lead Intelligence</h3>
                <p className="dp-ai-section-header__sub">Groq-powered lead scoring summary</p>
              </div>
            </div>
            <button
              className="dp-ai-section-header__link"
              onClick={() => navigate('/ai-lead-scoring')}
            >
              View Scoring Module
              <ChevronRight style={{ width: '0.875rem', height: '0.875rem' }} />
            </button>
          </div>

          <div className="dp-ai-kpi-grid">
            {[
              { label: 'Hot Leads',    value: aiStats.hotLeads,    icon: Flame,       color: '#10b981', bg: 'rgba(6,78,59,0.25)',    border: 'rgba(16,185,129,0.2)', meta: 'Score 80–100' },
              { label: 'Warm Leads',   value: aiStats.warmLeads,   icon: Thermometer, color: '#f59e0b', bg: 'rgba(120,53,15,0.25)',  border: 'rgba(245,158,11,0.2)', meta: 'Score 50–79' },
              { label: 'Cold Leads',   value: aiStats.coldLeads,   icon: Snowflake,   color: '#818cf8', bg: 'rgba(30,27,75,0.25)',   border: 'rgba(99,102,241,0.2)', meta: 'Score 0–49' },
              { label: 'Avg AI Score', value: aiStats.avgScore,    icon: BarChart3,   color: '#c084fc', bg: 'rgba(46,16,101,0.25)',  border: 'rgba(139,92,246,0.2)', meta: 'Across scored leads' },
            ].map(({ label, value, icon: Icon, color, bg, border, meta }) => (
              <div key={label} className="dp-ai-kpi-card" style={{ borderColor: border, background: bg }}>
                <div className="dp-kpi-card__top">
                  <span className="dp-kpi-card__label">{label}</span>
                  <div className="dp-kpi-card__icon-wrap" style={{ borderColor: border }}>
                    <Icon style={{ width: '0.875rem', height: '0.875rem', color }} />
                  </div>
                </div>
                <div>
                  <p className="dp-kpi-card__value" style={{ color }}>{value}</p>
                  <p className="dp-kpi-card__meta">{meta}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Top Scoring Leads table */}
          {aiStats.topLeads?.length > 0 && (
            <div className="dp-chart-card">
              <div className="dp-chart-card__header">
                <div>
                  <h3 className="dp-chart-card__title">Top Scoring Leads</h3>
                  <p className="dp-chart-card__subtitle">Highest AI-scored prospects by conversion potential</p>
                </div>
                <span className="dp-chart-card__badge">AI Ranked</span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ minWidth: '100%', borderCollapse: 'collapse', fontSize: '0.75rem', color: '#d4d4d8', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: '#18181b', fontSize: '0.5625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#71717a', borderBottom: '1px solid #27272a' }}>
                      <th style={{ padding: '0.625rem 1rem' }}>Lead</th>
                      <th style={{ padding: '0.625rem 1rem' }}>Category</th>
                      <th style={{ padding: '0.625rem 1rem' }}>AI Score</th>
                      <th style={{ padding: '0.625rem 1rem' }}>Conv. Prob.</th>
                      <th style={{ padding: '0.625rem 1rem' }}>Next Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {aiStats.topLeads.map((lead) => {
                      const catColor = lead.aiCategory === 'Hot' ? '#34d399' : lead.aiCategory === 'Warm' ? '#fbbf24' : '#818cf8';
                      const catBg    = lead.aiCategory === 'Hot' ? 'rgba(6,78,59,0.4)' : lead.aiCategory === 'Warm' ? 'rgba(120,53,15,0.4)' : 'rgba(30,27,75,0.4)';
                      const catBorder= lead.aiCategory === 'Hot' ? 'rgba(16,185,129,0.2)' : lead.aiCategory === 'Warm' ? 'rgba(245,158,11,0.2)' : 'rgba(99,102,241,0.2)';
                      return (
                        <tr key={lead.id} style={{ borderBottom: '1px solid #27272a', transition: 'background 100ms' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <div style={{ fontWeight: 600, color: '#fff' }}>{lead.name}</div>
                            {lead.company && <div style={{ fontSize: '0.625rem', color: '#71717a' }}>{lead.company}</div>}
                          </td>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <span style={{ display: 'inline-flex', padding: '0.175rem 0.625rem', borderRadius: '9999px', fontSize: '0.625rem', fontWeight: 700, color: catColor, background: catBg, border: '1px solid ' + catBorder }}>
                              {lead.aiCategory} Lead
                            </span>
                          </td>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <span style={{ fontFamily: 'monospace', fontWeight: 700, color: catColor, fontSize: '0.8125rem' }}>
                              {lead.aiScore}
                            </span>
                            <span style={{ color: '#52525b', fontSize: '0.625rem' }}>/100</span>
                          </td>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', width: '6rem' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.5625rem', color: '#71717a' }}>
                                <span>Probability</span>
                                <span style={{ fontFamily: 'monospace', color: catColor }}>{lead.conversionProbability}%</span>
                              </div>
                              <div style={{ height: '0.25rem', background: '#27272a', borderRadius: '9999px', overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: lead.conversionProbability + '%', background: catColor, borderRadius: '9999px' }} />
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '0.75rem 1rem', maxWidth: '14rem' }}>
                            <span style={{ fontSize: '0.6875rem', color: '#a1a1aa', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              {lead.recommendedAction || '—'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};