/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  CheckSquare,
  Layers,
  LogOut,
  Menu,
  X,
  Plus,
  Mail,
  ShieldCheck
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
    { name: 'Clients', to: '/clients', icon: Users },
    { name: 'Leads', to: '/leads', icon: UserPlus },
    { name: 'Tasks', to: '/tasks', icon: CheckSquare },
    { name: 'Sales Pipeline', to: '/pipeline', icon: Layers },
    { name: 'Email Generator', to: '/email-generator', icon: Mail },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getPageTitle = () => {
    const currentPath = location.pathname;
    if (currentPath === '/email-generator') return 'AI Email Generator';
    const match = navigation.find(item => item.to === currentPath);
    return match ? match.name : 'ClientSphere';
  };

  return (
    <div className="flex min-h-screen bg-[#09090b] text-zinc-100 font-sans selection:bg-[#18181b] selection:text-white">
      {/* Background radial glow removed for high density theme */}

      {/* MOBILE SIDEBAR DRAWERS */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          {/* Drawer content */}
          <div className="relative flex flex-col w-72 max-w-xs bg-[#09090b] border-r border-[#27272a] p-6 z-50">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <span className="font-display font-semibold text-lg tracking-wide bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                  ClientSphere
                </span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-zinc-400 hover:text-white p-1 rounded hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 space-y-1">
              {navigation.map(link => {
                const Icon = link.icon;
                const isActive = location.pathname === link.to;
                return (
                  <NavLink
                    key={link.name}
                    to={link.to}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium transition-all duration-150 ${
                      isActive
                        ? 'bg-[#18181b] text-white border border-[#27272a] shadow-sm'
                        : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0 opacity-70" />
                    {link.name}
                  </NavLink>
                );
              })}
            </nav>

            <div className="mt-auto border-t border-[#27272a] pt-4">
              <div className="flex items-center gap-3 px-2">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#18181b] to-[#27272a] border border-[#27272a] flex items-center justify-center font-display font-bold text-sm text-white">
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-zinc-200 truncate">{user?.name}</p>
                  <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DESKTOP PERMANENT SIDEBAR */}
      <aside className="hidden lg:flex flex-col w-48 bg-[#09090b] border-r border-[#27272a] shrink-0 py-4 px-3 sticky top-0 h-screen z-30">
        <div className="flex items-center gap-2.5 mb-6 px-2">
          <span className="font-display font-bold text-base tracking-wide text-white">
            ClientSphere
          </span>
        </div>

        <nav className="flex-1 space-y-1">
          {navigation.map(link => {
            const Icon = link.icon;
            const isActive = location.pathname === link.to;
            return (
              <NavLink
                key={link.name}
                to={link.to}
                className={`flex items-center gap-3 px-3.5 py-2 rounded-md text-sm font-medium transition-all duration-150 border ${
                  isActive
                    ? 'bg-[#18181b] text-white border-[#27272a] shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5 border-transparent'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0 opacity-75" />
                {link.name}
              </NavLink>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-[#27272a] pt-4">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#18181b] to-[#27272a] flex items-center justify-center font-display font-black text-sm text-white border border-[#27272a]">
              {user?.name?.[0]?.toUpperCase() || 'C'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-zinc-200 truncate">{user?.name}</p>
              <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* CORE WORKSPACE VIEWPORT */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* HEADER BAR */}
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-[#27272a] bg-[#09090b]/80 backdrop-blur-md px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-zinc-400 hover:text-white p-2.5 -ml-2.5 rounded hover:bg-white/5 lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="font-display text-sm font-semibold text-white tracking-tight">
              {getPageTitle()}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-[#27272a]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-mono tracking-tight text-zinc-400 uppercase font-semibold">
                Engine Active
              </span>
            </div>
            <div className="sm:flex h-8 w-px bg-[#27272a] hidden" />
            <div className="hidden sm:flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-zinc-400" />
              <span className="text-xs font-medium text-zinc-400 tracking-tight">Enterprise secure</span>
            </div>
          </div>
        </header>

        {/* WORKSPACE APP BODY */}
        <main className="flex-1 overflow-y-auto px-6 py-5 lg:px-7 lg:py-6 max-w-[1600px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
