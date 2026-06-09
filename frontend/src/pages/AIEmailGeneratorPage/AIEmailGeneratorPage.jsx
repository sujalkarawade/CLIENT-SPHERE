/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { aiEmailService } from '../../services/api';
import { Toast } from '../../components/common/Toast';
import './AIEmailGeneratorPage.css';
import {
  Zap,
  Copy,
  Check,
  RotateCw,
  Save,
  AlertTriangle,
  Inbox,
  Send,
  FileText,
  Calendar,
  Heart,
  ChevronRight,
  Pencil,
  X
} from 'lucide-react';

const PURPOSES = [
  { name: 'Cold Emails', label: 'Cold Outreach', icon: Send, description: 'Initiate a conversation with a new prospect.' },
  { name: 'Follow-Up Emails', label: 'Follow Up', icon: RotateCw, description: 'Follow up on previous discussions.' },
  { name: 'Proposal Emails', label: 'Proposal Pitch', icon: FileText, description: 'Present services, scopes, or pricing.' },
  { name: 'Meeting Reminder Emails', label: 'Meeting Sync', icon: Calendar, description: 'Remind client of upcoming events.' },
  { name: 'Thank You Emails', label: 'Thank You Note', icon: Heart, description: 'Express gratitude post-interaction.' }
];

const TONES = ['Professional', 'Friendly', 'Formal', 'Sales'];

export const AIEmailGeneratorPage = () => {
  const [clientName, setClientName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [emailPurpose, setEmailPurpose] = useState('Cold Emails');
  const [tone, setTone] = useState('Professional');
  const [additionalContext, setAdditionalContext] = useState('');

  const [generatedSubject, setGeneratedSubject] = useState('');
  const [generatedBody, setGeneratedBody] = useState('');

  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [selectedHistoryId, setSelectedHistoryId] = useState(null);

  const [apiKeyWarning, setApiKeyWarning] = useState(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editSubject, setEditSubject] = useState('');
  const [editBody, setEditBody] = useState('');

  const [toastMsg, setToastMsg] = useState(null);
  const [toastType, setToastType] = useState('success');

  const triggerToast = (msg, type) => {
    setToastMsg(msg);
    setToastType(type);
  };

  const fetchHistory = async () => {
    try {
      setLoadingHistory(true);
      const data = await aiEmailService.getHistory();
      setHistory(data);
    } catch {
      triggerToast('Could not load email generation history.', 'error');
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    if (!clientName.trim() || !companyName.trim()) {
      triggerToast('Client Name and Company Name are required to generate an email.', 'error');
      return;
    }

    setGenerating(true);
    setApiKeyWarning(null);
    setSaved(false);
    setSelectedHistoryId(null);
    setIsEditing(false);

    try {
      const result = await aiEmailService.generate({
        clientName,
        companyName,
        emailPurpose,
        tone,
        additionalContext
      });

      setGeneratedSubject(result.subject);
      setGeneratedBody(result.body);
      triggerToast('Email content draft successfully compiled.', 'success');
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || err.message || '';
      if (errMsg.includes('API key') || errMsg.includes('configured')) {
        setApiKeyWarning(errMsg);
        triggerToast('Groq API key configuration missing.', 'error');
      } else {
        triggerToast(errMsg || 'Failed to generate email content. Please try again.', 'error');
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!generatedSubject || !generatedBody) return;
    const fullText = 'Subject: ' + generatedSubject + '\n\n' + generatedBody;
    try {
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      triggerToast('Email subject and body copied to clipboard.', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      triggerToast('Failed to copy text.', 'error');
    }
  };

  const handleSave = async () => {
    if (!generatedSubject || !generatedBody) return;
    setSaving(true);
    try {
      const savedEmail = await aiEmailService.save({
        clientName,
        companyName,
        emailPurpose,
        tone,
        additionalContext,
        subject: generatedSubject,
        body: generatedBody
      });

      setHistory(prev => [savedEmail, ...prev]);
      setSelectedHistoryId(savedEmail.id);
      setSaved(true);
      triggerToast('Email generated record saved in CRM logs.', 'success');
    } catch {
      triggerToast('Failed to save email to CRM databases.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSelectHistoryItem = (email) => {
    setSelectedHistoryId(email.id);
    setGeneratedSubject(email.subject);
    setGeneratedBody(email.body);
    setSaved(true);
    setIsEditing(false);

    setClientName(email.clientName);
    setCompanyName(email.companyName);
    setEmailPurpose(email.emailPurpose);
    setTone(email.tone);
    setAdditionalContext(email.additionalContext || '');
    setApiKeyWarning(null);
  };

  const handleStartEdit = () => {
    setEditSubject(generatedSubject);
    setEditBody(generatedBody);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditSubject('');
    setEditBody('');
  };

  const handleSaveEdit = () => {
    if (!editSubject.trim() && !editBody.trim()) return;
    setGeneratedSubject(editSubject);
    setGeneratedBody(editBody);
    setSaved(false);
    setIsEditing(false);
    triggerToast('Changes applied. Save to CRM to persist.', 'success');
  };

  return (
    <div className="eg-root">
      {toastMsg && (
        <Toast message={toastMsg} type={toastType} onClose={() => setToastMsg(null)} />
      )}

      {/* Header */}
      <div className="eg-header">
        <h2 className="eg-header__title">
          Email Generator
        </h2>
      </div>

      {/* API Key Warning Banner if missing config */}
      {apiKeyWarning && (
        <div className="eg-warning-card">
          <AlertTriangle className="eg-warning-card__icon" />
          <div>
            <h4 className="eg-warning-card__title">Groq API Configuration Missing</h4>
            <p className="eg-warning-card__text">
              The backend has encountered an authentication issue. To activate the email generation engine, configure a valid API key inside the root directory `.env` file and restart the server:
            </p>
            <code className="eg-warning-card__code">GROQ_API_KEY="gsk_yourKeyHere..."</code>
          </div>
        </div>
      )}

      {/* Main 3-Column Grid */}
      <div className="eg-grid">
        {/* Column 1 - History Logger section */}
        <div className="eg-card eg-card--history">
          <h3 className="eg-card__title">
            <Inbox className="eg-card__title-icon" />
            Generation History
          </h3>

          {loadingHistory ? (
            <p style={{ fontSize: '0.75rem', color: '#71717a' }}>Loading past records...</p>
          ) : history.length > 0 ? (
            <div className="eg-history-list">
              {history.map(item => {
                const isActive = selectedHistoryId === item.id;
                const dateFormatted = new Date(item.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                });
                return (
                  <div
                    key={item.id}
                    className={'eg-history-item ' + (isActive ? 'eg-history-item--active' : '')}
                    onClick={() => handleSelectHistoryItem(item)}
                  >
                    <div className="eg-history-item__left">
                      <span className="eg-history-item__title">{item.clientName}</span>
                      <span style={{ fontSize: '0.6875rem', color: '#a1a1aa' }} className="truncate">{item.companyName}</span>
                      <div className="eg-history-item__meta">
                        <span className="eg-history-item__tag">{item.emailPurpose.replace(' Emails', '').replace('Meeting Reminder', 'Reminder')}</span>
                        <span className="eg-history-item__date">{dateFormatted}</span>
                      </div>
                    </div>
                    <button type="button" className="eg-history-item__view-btn">
                      View
                      <ChevronRight style={{ width: '0.75rem', height: '0.75rem', display: 'inline', marginLeft: '2px' }} />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={{ fontSize: '0.75rem', color: '#71717a', textAlign: 'center', padding: '1rem' }}>
              No history found.
            </p>
          )}
        </div>

        {/* Column 2 - Parameters Form */}
        <form onSubmit={handleGenerate} className="eg-card eg-card--form">
          <h3 className="eg-card__title">
            <Zap className="eg-card__title-icon" />
            Parameters
          </h3>

          <div className="eg-form-scroll">
            <div className="eg-form-group">
              <label className="eg-label">Client Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Tony Stark"
                className="eg-input"
                value={clientName}
                onChange={e => setClientName(e.target.value)}
              />
            </div>

            <div className="eg-form-group">
              <label className="eg-label">Company Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Stark Industries"
                className="eg-input"
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
              />
            </div>

            <div className="eg-form-group">
              <label className="eg-label">Email Purpose</label>
              <div className="eg-purpose-grid">
                {PURPOSES.map(p => {
                  const Icon = p.icon;
                  const isActive = emailPurpose === p.name;
                  return (
                    <button
                      key={p.name}
                      type="button"
                      className={'eg-purpose-btn ' + (isActive ? 'eg-purpose-btn--active' : '')}
                      onClick={() => setEmailPurpose(p.name)}
                    >
                      <Icon className="eg-purpose-btn__icon" />
                      <span>{p.label.replace(' outreach', '').replace(' Note', '').replace(' Pitch', '').replace(' Sync', '')}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="eg-form-group">
              <label className="eg-label">Tone Preference</label>
              <div className="eg-tone-row">
                {TONES.map(t => {
                  const isActive = tone === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      className={'eg-tone-btn ' + (isActive ? 'eg-tone-btn--active' : '')}
                      onClick={() => setTone(t)}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="eg-form-group">
              <label className="eg-label">Additional Context (Optional)</label>
              <textarea
                placeholder="Provide extra details such as specific pain points, next steps..."
                className="eg-textarea"
                rows={3}
                value={additionalContext}
                onChange={e => setAdditionalContext(e.target.value)}
              />
            </div>

            <button type="submit" disabled={generating} className="eg-submit-btn">
              <Zap className="eg-submit-btn__icon" />
              {generating ? 'Drafting Copy...' : 'Generate AI Copy'}
            </button>
          </div>
        </form>

        {/* Column 3 - Output Viewer Card */}
        <div className="eg-card eg-card--output">
          <div className="eg-output-header">
            <h3 className="eg-card__title">Generated Output</h3>

            {generatedSubject && generatedBody && !generating && (
              <div className="eg-output-actions">
                {!isEditing && (
                  <>
                    <button type="button" className="eg-action-btn" onClick={handleCopy} title="Copy Email">
                      {copied ? (
                        <>
                          <Check className="eg-action-btn__icon text-emerald-400" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="eg-action-btn__icon" />
                          Copy
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      disabled={saving || saved}
                      className={'eg-action-btn ' + (saved ? 'eg-action-btn--success' : 'eg-action-btn--primary')}
                      onClick={handleSave}
                    >
                      <Save className="eg-action-btn__icon" />
                      {saved ? 'Saved' : saving ? 'Saving...' : 'Save to CRM'}
                    </button>

                    <button type="button" className="eg-action-btn" onClick={handleStartEdit} title="Edit">
                      <Pencil className="eg-action-btn__icon" />
                      Edit
                    </button>

                    <button type="button" className="eg-action-btn" onClick={() => handleGenerate()} title="Regenerate">
                      <RotateCw className="eg-action-btn__icon" />
                      Regenerate
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {generating ? (
            <div className="eg-skeleton">
              <div className="eg-skeleton-bar eg-skeleton-bar--title" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
                <div className="eg-skeleton-bar eg-skeleton-bar--body1" />
                <div className="eg-skeleton-bar eg-skeleton-bar--body2" />
                <div className="eg-skeleton-bar eg-skeleton-bar--body3" />
                <div className="eg-skeleton-bar eg-skeleton-bar--body4" />
              </div>
            </div>
          ) : generatedSubject || generatedBody ? (
            <div className="eg-output-content">
              {isEditing ? (
                <div className="eg-edit-box">
                  <div className="eg-edit-field">
                    <label className="eg-label">Subject</label>
                    <input
                      className="eg-input"
                      value={editSubject}
                      onChange={e => setEditSubject(e.target.value)}
                      placeholder="Email subject..."
                    />
                  </div>
                  <div className="eg-edit-field eg-edit-field--body">
                    <label className="eg-label">Body</label>
                    <textarea
                      className="eg-textarea eg-textarea--edit"
                      value={editBody}
                      onChange={e => setEditBody(e.target.value)}
                      placeholder="Email body..."
                    />
                  </div>
                  <div className="eg-edit-actions">
                    <button type="button" className="eg-action-btn" onClick={handleCancelEdit}>
                      <X className="eg-action-btn__icon" />
                      Cancel
                    </button>
                    <button type="button" className="eg-action-btn eg-action-btn--primary" onClick={handleSaveEdit}>
                      <Check className="eg-action-btn__icon" />
                      Apply Changes
                    </button>
                  </div>
                </div>
              ) : (
                <div className="eg-generated-box">
                  <div className="eg-generated-subject">
                    <span className="eg-generated-subject__label">Subject:</span>
                    <span className="eg-generated-subject__text">{generatedSubject}</span>
                  </div>
                  <div className="eg-generated-body">{generatedBody}</div>
                </div>
              )}
            </div>
          ) : (
            <div className="eg-empty-state">
              <Inbox className="eg-empty-state__icon" />
              <h4 className="eg-empty-state__title">No Draft Compiled Yet</h4>
              <p className="eg-empty-state__desc">
                Fill in the client credentials and purpose parameters, then trigger the AI engine to generate copy.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};