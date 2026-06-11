/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import './AIAssistantPage.css';
import { assistantService } from '../../services/api';
import { Toast } from '../../components/common/Toast';
import { Brain, Send, Trash2, Copy, Sparkles, BarChart3, CheckCircle, Mail, Users, AlertTriangle } from 'lucide-react';

export const AIAssistantPage = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [toastMsg, setToastMsg] = useState(null);
  const [toastType, setToastType] = useState('success');
  const [apiKeyWarning, setApiKeyWarning] = useState(null);
  const messagesEndRef = useRef(null);

  // Suggested prompts
  const suggestions = [
    { text: "Show my hottest leads", icon: Sparkles },
    { text: "Which clients haven't been contacted recently?", icon: Users },
    { text: "What are my overdue tasks?", icon: CheckCircle },
    { text: "Summarize my sales pipeline", icon: BarChart3 },
    { text: "Generate a follow-up email for a client", icon: Mail },
    { text: "Who are my top 5 highest scoring leads?", icon: Sparkles },
  ];

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Load conversation history
  useEffect(() => {
    setLoadingHistory(true);
    assistantService.getHistory()
      .then((history) => {
        setMessages(history);
      })
      .catch(() => {
        setToastMsg('Failed to load conversation history.');
        setToastType('error');
      })
      .finally(() => setLoadingHistory(false));
  }, []);

  // Send message
  const handleSend = async (text = input) => {
    if (!text.trim() || loading) return;

    const userMessage = text.trim();
    setInput('');
    setLoading(true);
    setApiKeyWarning(null);

    try {
      const result = await assistantService.chat(userMessage);
      
      // Refresh messages to get the full history
      const history = await assistantService.getHistory();
      setMessages(history);
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || err.message || '';
      if (errMsg.includes('API key') || errMsg.includes('configured')) {
        setApiKeyWarning(errMsg);
        setToastMsg('Groq API key configuration missing.', 'error');
      } else {
        setToastMsg(errMsg || 'Failed to get response from assistant.');
        setToastType('error');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Enter key
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Copy message to clipboard
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setToastMsg('Copied to clipboard!');
        setToastType('success');
      })
      .catch(() => {
        setToastMsg('Failed to copy to clipboard.');
        setToastType('error');
      });
  };

  // Clear history
  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear all conversation history?')) {
      assistantService.clearHistory()
        .then(() => {
          setMessages([]);
          setToastMsg('Conversation history cleared!');
          setToastType('success');
        })
        .catch(() => {
          setToastMsg('Failed to clear history.');
          setToastType('error');
        });
    }
  };

  return (
    <div className="aia-root">
      {toastMsg && <Toast message={toastMsg} type={toastType} onClose={() => setToastMsg(null)} />}

      {/* API Key Warning Banner if missing config */}
      {apiKeyWarning && (
        <div className="aia-warning-card">
          <AlertTriangle className="aia-warning-card__icon" />
          <div>
            <h4 className="aia-warning-card__title">Groq API Configuration Missing</h4>
            <p className="aia-warning-card__text">
              The backend has encountered an authentication issue. To activate the AI assistant, configure a valid API key inside the root directory .env file and restart the server:
            </p>
            <code className="aia-warning-card__code">GROQ_API_KEY="gsk_yourKeyHere..."</code>
          </div>
        </div>
      )}
      {/* Chat Container */}
      <div className="aia-chat-container">
        {/* Messages */}
        <div className="aia-messages">
          {loadingHistory ? (
            <div className="aia-welcome">
              <div className="dp-loading__spinner" />
              <p className="dp-loading__text">Loading conversation...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="aia-welcome">
              <div className="aia-welcome__icon">
                <Brain style={{ width: '2rem', height: '2rem' }} />
              </div>
              <h3 className="aia-welcome__title">Welcome to ClientSphere AI</h3>
              <p className="aia-welcome__subtitle">
                Your intelligent CRM assistant is ready to help. Ask questions about your leads, clients, tasks, or pipeline.
              </p>

              {/* Suggestions */}
              <div className="aia-suggestions">
                {suggestions.map((s, idx) => {
                  const Icon = s.icon;
                  return (
                    <button
                      key={idx}
                      className="aia-suggestion"
                      onClick={() => handleSend(s.text)}
                    >
                      <Icon className="aia-suggestion__icon" style={{ width: '1rem', height: '1rem' }} />
                      <p className="aia-suggestion__text">{s.text}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div key={idx} className={`aia-message aia-message--${msg.role}`}>
                <div className={`aia-message__avatar aia-message__avatar--${msg.role}`}>
                  {msg.role === 'assistant' ? (
                    <Brain style={{ width: '1rem', height: '1rem' }} />
                  ) : (
                    <Users style={{ width: '1rem', height: '1rem' }} />
                  )}
                </div>
                <div className={`aia-message__content aia-message__content--${msg.role}`}>
                  <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                  {msg.role === 'assistant' && (
                    <div className="aia-message__actions">
                      <button
                        className="aia-copy-btn"
                        onClick={() => handleCopy(msg.content)}
                      >
                        <Copy style={{ width: '0.75rem', height: '0.75rem' }} />
                        Copy
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}

          {/* Typing indicator */}
          {loading && (
            <div className="aia-typing">
              <div className="aia-message__avatar aia-message__avatar--assistant">
                <Brain style={{ width: '1rem', height: '1rem' }} />
              </div>
              <div className="aia-typing__content">
                <div className="aia-typing__dot" />
                <div className="aia-typing__dot" />
                <div className="aia-typing__dot" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="aia-input-area">
          <textarea
            className="aia-input"
            placeholder="Ask a question about your CRM..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            rows={1}
          />
          <button
            className="aia-send-btn"
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
          >
            <Send style={{ width: '1rem', height: '1rem' }} />
            Send
          </button>
        </div>
      </div>
    </div>
  );
};
