/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export const Dialog = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 pointer-events-auto"
        onClick={onClose}
      />

      {/* Modal panel */}
      <div
        style={{
          background: 'var(--bg-primary)',
          border: '1px solid var(--border-light)',
          boxShadow: '0 24px 64px -12px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.08)',
        }}
        className="relative rounded-xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh] animate-slide-in"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div
          style={{
            background: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--border-color)',
          }}
          className="flex items-center justify-between px-6 py-4"
        >
          <h2
            style={{ color: 'var(--text-primary)' }}
            className="font-display text-sm font-semibold tracking-tight"
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{ color: 'var(--text-muted)' }}
            className="p-1 rounded hover:bg-white/5 transition-colors duration-150 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {children}
        </div>
      </div>
    </div>
  );
};