/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import './DashboardPage.css';
import { dashboardService } from '../../services/api';
import { DashboardStats } from '../../types';
import { Toast, ToastType } from '../../components/common/Toast';
import { Users, UserCheck, ClipboardList, Coins, TrendingUp, Inbox } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';

const CHR_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#ef4444'];

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [toastType, setToastType] = useState<ToastType>('success');

  useEffect(() => {
    dashboardService.getStats()
      .then(setStats)
      .catch(() => {
        setToastMsg('Failed to load dashboard stats.');
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

  const formatUSD = (val: number) =>
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
                  <YAxis stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '6px', fontSize: '11px' }}
                    labelStyle={{ color: '#a1a1aa', fontWeight: 'bold' }}
                    itemStyle={{ color: '#fafafa' }}
                    formatter={(val: number) => [val.toLocaleString(), 'Income']}
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
                      <Cell key={`cell-${index}`} fill={CHR_COLORS[index % CHR_COLORS.length]} />
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
    </div>
  );
};
