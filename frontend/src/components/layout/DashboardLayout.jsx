/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  CheckSquare,
  CalendarDays,
  Layers,
  Menu,
  X,
  Mail,
  ShieldCheck,
  Brain,
  Bot,
  Sun,
  Moon,
} from 'lucide-react';

export const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard',    to: '/dashboard',      icon: LayoutDashboard },
    { name: 'Clients',      to: '/clients',        icon: Users },
    { name: 'Leads',        to: '/leads',          icon: UserPlus },
    { name: 'Tasks',        to: '/tasks',          icon: CheckSquare },
    { name: 'Calendar',     to: '/calendar',       icon: CalendarDays },
    { name: 'Sales Pipeline', to: '/pipeline',     icon: Layers },
    { name: 'Email Generator', to: '/email-generator', icon: Mail },
    { name: 'Lead Scoring', to: '/ai-lead-scoring', icon: Brain },
    { name: 'AI Assistant', to: '/ai-assistant',   icon: Bot },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getPageTitle = () => {
    const currentPath = location.pathname;
    if (currentPath === '/email-generator') return 'AI Email Generator';
    if (currentPath === '/ai-lead-scoring') return 'AI Lead Scoring';
    if (currentPath === '/ai-assistant') return 'AI CRM Assistant';
    if (currentPath === '/calendar') return 'Calendar';
    const match = navigation.find(item => item.to === currentPath);
    return match ? match.name : 'ClientSphere';
  };

  return (
    <div className="flex min-h-screen font-sans"
      style={{
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
      }}
    >
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
          <div className="relative flex flex-col w-72 max-w-xs p-6 z-50"
            style={{
              backgroundColor: 'var(--sidebar-bg)',
              borderRight: '1px solid var(--border-color)',
            }}
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <span className="font-display font-semibold text-lg tracking-wide"
                  style={{
                    background: 'linear-gradient(to right, var(--text-primary), var(--text-muted))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  ClientSphere
                </span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1 rounded"
                style={{ color: 'var(--text-subtle)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-subtle)'}
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
                    className={'flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium transition-all duration-150 border ' +
                      (isActive
                        ? 'shadow-sm'
                        : 'border-transparent')}
                    style={{
                      backgroundColor: isActive ? 'var(--nav-active-bg)' : 'transparent',
                      color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                      borderColor: isActive ? 'var(--border-color)' : 'transparent',
                    }}
                    onMouseEnter={e => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                        e.currentTarget.style.color = 'var(--text-primary)';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = 'var(--text-muted)';
                      }
                    }}
                  >
                    <Icon className="w-4 h-4 shrink-0 opacity-70" />
                    {link.name}
                  </NavLink>
                );
              })}
            </nav>

            <div className="mt-auto pt-4"
              style={{ borderTop: '1px solid var(--border-color)' }}
            >
              <div className="flex items-center gap-3 px-2">
                <div className="w-9 h-9 rounded-full flex items-center justify-center font-display font-bold text-sm"
                  style={{
                    background: 'linear-gradient(to top right, var(--bg-secondary), var(--bg-tertiary))',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                  }}
                >
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {user?.name}
                  </p>
                  <p className="text-xs truncate"
                    style={{ color: 'var(--text-subtle)' }}
                  >
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DESKTOP PERMANENT SIDEBAR */}
      <aside className="hidden lg:flex flex-col w-48 shrink-0 py-4 px-3 sticky top-0 h-screen z-30"
        style={{
          backgroundColor: 'var(--sidebar-bg)',
          borderRight: '1px solid var(--border-color)',
        }}
      >
        <div className="flex items-center gap-2.5 mb-6 px-2">
          <span className="font-display font-bold text-base tracking-wide"
            style={{ color: 'var(--text-primary)' }}
          >
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
                className={'flex items-center gap-3 px-3.5 py-2 rounded-md text-sm font-medium transition-all duration-150 border ' +
                  (isActive ? 'shadow-sm' : 'border-transparent')}
                style={{
                  backgroundColor: isActive ? 'var(--nav-active-bg)' : 'transparent',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                  borderColor: isActive ? 'var(--border-color)' : 'transparent',
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--text-muted)';
                  }
                }}
              >
                <Icon className="w-4 h-4 shrink-0 opacity-75" />
                {link.name}
              </NavLink>
            );
          })}
        </nav>

        <div className="mt-auto pt-4"
          style={{ borderTop: '1px solid var(--border-color)' }}
        >
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-full flex items-center justify-center font-display font-black text-sm"
              style={{
                background: 'linear-gradient(to top right, var(--bg-secondary), var(--bg-tertiary))',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
              }}
            >
              {user?.name?.[0]?.toUpperCase() || 'C'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold truncate"
                style={{ color: 'var(--text-secondary)' }}
              >
                {user?.name}
              </p>
              <p className="text-xs truncate"
                style={{ color: 'var(--text-subtle)' }}
              >
                {user?.email}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* CORE WORKSPACE VIEWPORT */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* HEADER BAR */}
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b backdrop-blur-md px-6 lg:px-8"
          style={{
            borderColor: 'var(--border-color)',
            backgroundColor: 'var(--header-bg)',
          }}
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2.5 -ml-2.5 rounded lg:hidden"
              style={{ color: 'var(--text-subtle)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-subtle)'}
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="font-display text-sm font-semibold tracking-tight"
              style={{ color: 'var(--text-primary)' }}
            >
              {getPageTitle()}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full transition-all duration-200"
              style={{
                color: 'var(--text-muted)',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = 'var(--text-primary)';
                e.currentTarget.style.borderColor = 'var(--border-light)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = 'var(--text-muted)';
                e.currentTarget.style.borderColor = 'var(--border-color)';
              }}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>

            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full border"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-color)',
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ backgroundColor: 'var(--status-dot)' }}
              />
              <span className="text-[10px] font-mono tracking-tight uppercase font-semibold"
                style={{ color: 'var(--text-subtle)' }}
              >
                Engine Active
              </span>
            </div>
            <div className="sm:flex h-8 w-px hidden"
              style={{ backgroundColor: 'var(--border-color)' }}
            />
            <div className="hidden sm:flex items-center gap-2">
              <ShieldCheck className="w-4 h-4"
                style={{ color: 'var(--text-muted)' }}
              />
              <span className="text-xs font-medium tracking-tight"
                style={{ color: 'var(--text-subtle)' }}
              >
                Enterprise secure
              </span>
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