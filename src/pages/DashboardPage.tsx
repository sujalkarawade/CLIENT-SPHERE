/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { dashboardService } from '../services/api';
import { DashboardStats } from '../types';
import { Toast, ToastType } from '../components/common/Toast';
import {
  Users,
  UserCheck,
  CalendarDays,
  Coins,
  TrendingUp,
  Inbox,
  ArrowUpRight,
  ClipboardList
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [toastType, setToastType] = useState<ToastType>('success');

  const fetchDashboardStats = async () => {
    try {
      const data = await dashboardService.getStats();
      setStats(data);
    } catch (err) {
      setToastMsg('Failed to aggregate live dashboard intelligence. Using cached layout.');
      setToastType('error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const triggerToast = (msg: string, type: ToastType) => {
    setToastMsg(msg);
    setToastType(type);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-xs text-gray-400 font-medium">Aggregating sales intelligence...</p>
        </div>
      </div>
    );
  }

  // Format currency
  const formatUSD = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val);
  };

  const statCards = [
    {
      name: 'Total Active Clients',
      value: stats?.totalClients || 0,
      icon: Users,
      glow: 'shadow-indigo-500/5',
      accent: 'text-indigo-400 bg-indigo-500/10'
    },
    {
      name: 'Tracked Prospects/Leads',
      value: stats?.totalLeads || 0,
      icon: UserCheck,
      glow: 'shadow-emerald-500/5',
      accent: 'text-emerald-400 bg-emerald-500/10'
    },
    {
      name: 'Active Sync Tasks',
      value: stats?.totalTasks || 0,
      icon: ClipboardList,
      glow: 'shadow-amber-500/5',
      accent: 'text-amber-400 bg-amber-500/10'
    },
    {
      name: 'Won Revenue Pipeline',
      value: formatUSD(stats?.revenue || 0),
      icon: Coins,
      glow: 'shadow-violet-500/5',
      accent: 'text-violet-400 bg-violet-500/10'
    }
  ];

  // Colors for Lead Pie slice distribution
  const CHR_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#ef4444'];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Toast Notice alerts */}
      {toastMsg && (
        <Toast
          message={toastMsg}
          type={toastType}
          onClose={() => setToastMsg(null)}
        />
      )}

      {/* Main welcome ribbon banner */}
      <div className="border border-[#27272a] rounded-lg bg-[#09090b] p-5 lg:p-6 relative overflow-hidden shadow-sm">
        <div className="relative z-10 max-w-2xl animate-none">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-[#18181b] border border-[#27272a] text-[11px] text-zinc-400 mb-3 font-semibold uppercase tracking-wider">
            <TrendingUp className="w-3.5 h-3.5 text-[#6366f1]" />
            <span>Active Operations Environment</span>
          </div>
          <h2 className="font-display text-lg font-bold text-white tracking-tight">
            ClientSphere Analytics Cockpit
          </h2>
          <p className="mt-1 text-xs text-zinc-400 leading-relaxed max-w-xl">
            Real-time insights aggregated across standard business pipelines. Modify cards, schedule client activities, or edit pipeline stages directly.
          </p>
        </div>
      </div>

      {/* Grid KPI widgets list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="bg-[#09090b] border border-[#27272a] rounded-lg p-5 shadow-sm relative overflow-hidden transition-colors duration-200 hover:border-[#3f3f46] flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-semibold text-zinc-500 tracking-wider uppercase">
                  {card.name}
                </span>
                <div className="p-1.5 rounded bg-[#18181b] border border-[#27272a] text-zinc-400">
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>
              <div>
                <h3 className="font-display text-xl font-bold tracking-tight text-white mb-0.5">
                  {card.value}
                </h3>
                <p className="text-[10px] text-zinc-500 font-medium flex items-center gap-1">
                  Active in current ledger cycle 
                  <span className="inline-flex text-[#6366f1] font-semibold">●</span>
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dynamic graphic charts bento grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* REVENUE OVERVIEW GRAPH */}
        <div className="lg:col-span-2 bg-[#09090b] border border-[#27272a] rounded-lg p-5 shadow-sm relative">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h3 className="font-display text-xs font-semibold text-white tracking-tight">
                Monthly Income Growth
              </h3>
              <p className="text-[10px] text-zinc-500 mt-0.5">
                Aggregate values derived from pipeline "Won" deals 2026
              </p>
            </div>
            <span className="text-[10px] font-mono font-bold text-zinc-450 bg-[#18181b] px-2 py-0.5 rounded border border-[#27272a]">
              Accumulating
            </span>
          </div>

          <div className="h-64 w-full">
            {stats && stats.monthlyRevenue && stats.monthlyRevenue.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={stats.monthlyRevenue}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.3} />
                  <XAxis
                    dataKey="month"
                    stroke="#71717a"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#71717a"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `$${v / 1000}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18181b',
                      border: '1px solid #27272a',
                      borderRadius: '6px',
                      fontSize: '11px',
                    }}
                    labelStyle={{ color: '#a1a1aa', fontWeight: 'bold' }}
                    itemStyle={{ color: '#fafafa' }}
                    formatter={(val: any) => [`$${val.toLocaleString()}`, 'Income']}
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#6366f1"
                    strokeWidth={1.5}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center gap-2">
                <Inbox className="w-8 h-8 text-zinc-800" />
                <p className="text-xs text-zinc-500">Zero revenue statistics recorded</p>
              </div>
            )}
          </div>
        </div>

        {/* PROSPECTS LIFE MATRICES */}
        <div className="bg-[#09090b] border border-[#27272a] rounded-lg p-5 shadow-sm relative flex flex-col justify-between">
          <div>
            <h3 className="font-display text-xs font-semibold text-white tracking-tight">
              Lead Funnel Status
            </h3>
            <p className="text-[10px] text-zinc-500 mt-0.5">
              Current lifecycle placement counts
            </p>
          </div>

          <div className="h-48 w-full flex items-center justify-center my-3">
            {stats && stats.leadConversion && stats.leadConversion.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.leadConversion}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={68}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {stats.leadConversion.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CHR_COLORS[index % CHR_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18181b',
                      border: '1px solid #27272a',
                      borderRadius: '6px',
                      fontSize: '11px',
                    }}
                    itemStyle={{ color: '#fafafa' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center gap-2">
                <Inbox className="w-8 h-8 text-zinc-800" />
                <p className="text-xs text-zinc-500">Zero lead conversion indices</p>
              </div>
            )}
          </div>

          {/* Custom legends alignment */}
          <div className="grid grid-cols-3 gap-2 border-t border-[#27272a] pt-4 text-center">
            {stats?.leadConversion.slice(0, 6).map((item, index) => (
              <div key={item.name} className="flex flex-col items-center">
                <div className="flex items-center gap-1.5 justify-center">
                  <span
                    className="w-1.5 h-1.5 rounded-full inline-block"
                    style={{ backgroundColor: CHR_COLORS[index % CHR_COLORS.length] }}
                  />
                  <span className="text-[9px] font-semibold text-zinc-400 truncate max-w-[55px]">
                    {item.name}
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-white mt-0.5">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
