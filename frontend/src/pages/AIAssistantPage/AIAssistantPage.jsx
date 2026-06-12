/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import './AIAssistantPage.css';
import { aiAssistantService } from '../../services/api';
import { Toast } from '../../components/common/Toast';
import { Send, Trash2, Copy, Check, AlertTriangle, Bot } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// ── Quick suggestion prompts ──────────────────────────────────────────────────
const SUGGESTIONS = [
  'Show my hottest leads',
  'What are my overdue tasks?',
  'Summarize the sales pipeline',
  'Which clients are inactive?',
  'Who are the top 5 highest scoring leads?',
  'What is my total pipeline value?',
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatTime(iso) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

/** Render message text: convert **bold** to <strong>, newlines to <br /> */
function renderContent(text) {
  // Build entity references at runtime so formatters don't decode them
  const a = String.fromCharCode(38); // &
  // 1. Escape HTML entities to prevent XSS
  const escaped = text
    .replace(new RegExp(a, 'g'), a + 'amp;')
    .replace(/</g, a + 'lt;')
    .replace(/>/g, a + 'gt;')
    .replace(/"/g, a + 'quot;');
  // 2. Convert **text** to <strong>text</strong>
  const withBold = escaped.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  // 3. Convert newlines to <br />
  const withBreaks = withBold.replace(/\n/g, '<br />');
  return withBreaks;
}

function CopyBtn({ text }) {
  const [done, setDone] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 1600); } catch { /* ignore */ }
  };
  return (
    <button type="button" className="aca-copy-btn" onClick={copy}>
      {done
        ? <><Check style={{ width: '0.5rem', height: '0.5rem' }} /> Copied</>
        : <><Copy style={{ width: '0.5rem', height: '0.5rem' }} /> Copy</>}
    </button>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export const AIAssistantPage = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput]       = useState('');
  const [sending, setSending]   = useState(false);
  const [apiWarn, setApiWarn]   = useState(null);
  const [toast, setToast]       = useState(null);

  const endRef      = useRef(null);
  const textareaRef = useRef(null);

  // scroll to bottom whenever messages change
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, sending]);

  // auto-resize textarea
  const resizeTextarea = (el) => {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 112) + 'px';
  };

  const handleInput = (e) => {
    setInput(e.target.value);
    resizeTextarea(e.target);
  };

  // send message
  const send = useCallback(async (text) => {
    const msg = (text ?? input).trim();
    if (!msg || sending) return;

    setInput('');
    setApiWarn(null);
    if (textareaRef.current) { textareaRef.current.style.height = 'auto'; }

    const userMsg = { id: Date.now() + '-u', role: 'user', content: msg, createdAt: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setSending(true);

    try {
      const history = messages
        .filter(m => !m.isError)
        .map(m => ({ role: m.role, content: m.content }));

      const result = await aiAssistantService.chat(msg, history);

      setMessages(prev => [...prev, {
        id: Date.now() + '-a',
        role: 'assistant',
        content: result.response,
        createdAt: new Date().toISOString(),
      }]);
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to get a response.';
      if (errMsg.toLowerCase().includes('api key') || errMsg.toLowerCase().includes('configured')) {
        setApiWarn(errMsg);
      }
      setMessages(prev => [...prev, {
        id: Date.now() + '-e',
        role: 'assistant',
        content: errMsg,
        createdAt: new Date().toISOString(),
        isError: true,
      }]);
    } finally {
      setSending(false);
      setTimeout(() => textareaRef.current?.focus(), 80);
    }
  }, [input, sending, messages]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const handleClear = () => {
    setMessages([]);
    setApiWarn(null);
    setToast({ msg: 'Conversation cleared.', type: 'success' });
  };

  return (
    <div className="aca-root">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* ── Header ── */}
      <div className="aca-header">
        <div className="aca-header__left">
          <span className="aca-header__dot" />
          <h2 className="aca-header__title">AI CRM Assistant</h2>
          <span className="aca-header__subtitle">Ask anything about your CRM data</span>
        </div>
        <div className="aca-header__right">
          <div className="aca-status-badge">
            <span className="aca-status-badge__dot" />
            Groq
          </div>
          <button
            type="button"
            className="aca-clear-btn"
            onClick={handleClear}
            disabled={messages.length === 0}
          >
            <Trash2 style={{ width: '0.6875rem', height: '0.6875rem' }} />
            Clear
          </button>
        </div>
      </div>

      {/* ── API warning ── */}
      {apiWarn && (
        <div className="aca-api-warning">
          <AlertTriangle className="aca-api-warning__icon" />
          <div>
            <p className="aca-api-warning__title">Groq API key missing</p>
            <p className="aca-api-warning__text">
              Add <code style={{ color: '#818cf8' }}>GROQ_API_KEY</code> to your <code style={{ color: '#818cf8' }}>.env</code> file and restart the server.
            </p>
          </div>
        </div>
      )}

      {/* ── Body ── */}
      <div className="aca-body">
        <div className="aca-messages">

          {/* Empty / welcome */}
          {messages.length === 0 && !sending && (
            <div className="aca-welcome">
              <Bot className="aca-welcome__icon" />
              <p className="aca-welcome__title">
                {user?.name ? 'Hello, ' + user.name.split(' ')[0] + '.' : 'Hello.'} How can I help?
              </p>
              <p className="aca-welcome__desc">
                Ask about leads, clients, tasks, pipeline deals, or generate email content.
              </p>
              <div className="aca-suggestions">
                {SUGGESTIONS.map((s, i) => (
                  <button key={i} type="button" className="aca-suggestion" onClick={() => send(s)}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map(msg => (
            <div key={msg.id} className={'aca-row aca-row--' + msg.role}>
              <span className="aca-row__label">
                {msg.role === 'user' ? (user?.name?.split(' ')[0] || 'You') : 'Assistant'}
              </span>
              <div
                className={'aca-bubble' + (msg.isError ? ' aca-bubble--error' : '')}
                dangerouslySetInnerHTML={{ __html: renderContent(msg.content) }}
              />
              <div className="aca-row__meta">
                <span className="aca-row__time">{formatTime(msg.createdAt)}</span>
                {msg.role === 'assistant' && !msg.isError && <CopyBtn text={msg.content} />}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {sending && (
            <div className="aca-typing">
              <span className="aca-typing__label">Assistant</span>
              <div className="aca-typing__dots">
                <div className="aca-typing__dot" />
                <div className="aca-typing__dot" />
                <div className="aca-typing__dot" />
              </div>
            </div>
          )}

          <div ref={endRef} />
        </div>

        {/* ── Input ── */}
        <div className="aca-input-area">
          <form className="aca-input-row" onSubmit={e => { e.preventDefault(); send(); }}>
            <div className="aca-input-wrap">
              <textarea
                ref={textareaRef}
                className="aca-textarea"
                placeholder="Ask about your leads, clients, tasks, or pipeline..."
                value={input}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                disabled={sending}
                rows={1}
                maxLength={2000}
              />
            </div>
            <button
              type="submit"
              className="aca-send-btn"
              disabled={sending || !input.trim()}
              title="Send (Enter)"
            >
              <Send style={{ width: '0.8125rem', height: '0.8125rem' }} />
            </button>
          </form>
          <div className="aca-input-foot">
            <span className="aca-input-foot__left">llama-3.3-70b-versatile</span>
            <div className="aca-input-foot__right">
              <span className="aca-kbd">Enter</span> send &nbsp;
              <span className="aca-kbd">Shift+Enter</span> newline
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
