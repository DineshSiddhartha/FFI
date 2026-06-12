import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { formatINRFull, formatDate } from '../utils/calculator';

const statusConfig = {
  draft: { label: 'Draft', cls: 'pill--gray' },
  sent: { label: 'Sent', cls: 'pill--orange' },
  won: { label: 'Won ✓', cls: 'pill--green' },
  lost: { label: 'Lost', cls: 'pill--red' },
};

export default function HomeScreen() {
  const navigate = useNavigate();
  const { quotes, business, startDraft, logEvent, syncQuotes, syncStatus } = useStore();

  useEffect(() => {
    syncQuotes();
  }, [syncQuotes]);

  const totalQuotes = quotes.length;
  const wonQuotes = quotes.filter(q => q.status === 'won').length;
  const totalRevenue = quotes.filter(q => q.status === 'won').reduce((sum, q) => sum + (q.calc?.grandTotal || 0), 0);
  const recentQuotes = quotes.slice(0, 20);

  function handleNewQuote() {
    startDraft();
    logEvent('quote_started');
    navigate('/new-quote/step1');
  }

  return (
    <div className="app-shell">
      {/* Top Nav */}
      <nav className="top-nav">
        <div className="top-nav__logo">
          <div className="top-nav__logo-icon">☀️</div>
          <span className="top-nav__logo-text">Surya<span>Quote</span></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={syncQuotes}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '16px',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title={syncStatus === 'syncing' ? 'Syncing...' : syncStatus === 'error' ? 'Sync error' : 'Synced'}
          >
            {syncStatus === 'syncing' ? '🔄' : syncStatus === 'error' ? '⚠️' : '☁️'}
          </button>
          <button id="settings-btn" className="top-nav__back" onClick={() => navigate('/settings')} title="Settings">
            ⚙️
          </button>
        </div>
      </nav>

      <div className="main-content" style={{ paddingBottom: '100px' }}>
        {/* Hero Banner */}
        <div className="hero-banner">
          <div className="hero-banner__content">
            <span className="hero-banner__emoji">☀️</span>
            <h1 className="hero-banner__title">
              Good to see you,<br />
              <span>{business.name?.split(' ')[0] || 'Avion'}</span>
            </h1>
            <p className="hero-banner__sub">Professional solar quotations in under 3 minutes</p>
            <button
              id="hero-new-quote-btn"
              onClick={handleNewQuote}
              style={{
                marginTop: '16px',
                background: 'var(--brand)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 20px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              + New Quote
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid-3 mb-md">
          <div className="stat-card">
            <span className="stat-card__label">Total</span>
            <span className="stat-card__value">{totalQuotes}</span>
            <span className="stat-card__sub">Quotes</span>
          </div>
          <div className="stat-card">
            <span className="stat-card__label">Won</span>
            <span className="stat-card__value" style={{ color: 'var(--green)' }}>{wonQuotes}</span>
            <span className="stat-card__sub">Deals closed</span>
          </div>
          <div className="stat-card">
            <span className="stat-card__label">Revenue</span>
            <span className="stat-card__value" style={{ color: 'var(--brand)', fontSize: '14px' }}>
              {totalRevenue > 0 ? formatINRFull(totalRevenue) : '—'}
            </span>
            <span className="stat-card__sub">Won value</span>
          </div>
        </div>

        {/* Recent Quotes */}
        <div className="section-header">
          <h2 className="section-title">Recent Quotes</h2>
          {quotes.length > 0 && (
            <button className="btn btn--sm btn--secondary" onClick={() => navigate('/quotes')}>
              View all
            </button>
          )}
        </div>

        {recentQuotes.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state__icon">📋</span>
            <p className="empty-state__title">No quotes yet</p>
            <p className="empty-state__sub">Create your first professional solar quotation to get started</p>
            <button id="first-quote-btn" className="btn btn--primary mt-md" onClick={handleNewQuote}>
              + Create First Quote
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-sm">
            {recentQuotes.map(quote => {
              const sc = statusConfig[quote.status] || statusConfig.draft;
              return (
                <div
                  key={quote.id}
                  className="quote-item"
                  id={`quote-${quote.id}`}
                  onClick={() => navigate(`/quote/${quote.id}`)}
                >
                  <div className="quote-item__header">
                    <div>
                      <p className="quote-item__name">{quote.customerName || 'Unnamed Customer'}</p>
                      <p className="quote-item__info">{quote.quoteNo} · {formatDate(quote.createdAt)}</p>
                    </div>
                    <span className={`pill ${sc.cls}`}>{sc.label}</span>
                  </div>
                  <div className="quote-item__meta">
                    <span className="quote-item__info">📍 {quote.customerLocation || quote.customerState}</span>
                    <span className="quote-item__info">⚡ {quote.systemKw} kW</span>
                    {quote.salesPersonName && (
                      <span className="quote-item__info" style={{ color: 'var(--brand)', fontWeight: 600 }}>
                        🧑‍💼 {quote.salesPersonName}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="quote-item__amount">
                      {formatINRFull(quote.calc?.grandTotal || 0)}
                      <span> incl. GST</span>
                    </span>
                    <span className="text-muted" style={{ fontSize: '18px' }}>›</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FAB */}
      <button id="new-quote-fab" className="fab" onClick={handleNewQuote} title="New Quote">
        +
      </button>

      {/* Bottom Tab Bar */}
      <nav className="tab-bar">
        <button id="tab-home" className="tab-bar__item active">
          <span className="tab-bar__icon">🏠</span>
          <span className="tab-bar__label">Home</span>
        </button>
        <button id="tab-quotes" className="tab-bar__item" onClick={() => navigate('/quotes')}>
          <span className="tab-bar__icon">📋</span>
          <span className="tab-bar__label">Quotes</span>
        </button>
        <button id="tab-leaderboard" className="tab-bar__item" onClick={() => navigate('/leaderboard')}>
          <span className="tab-bar__icon">🏆</span>
          <span className="tab-bar__label">Leaders</span>
        </button>
        <button id="tab-settings" className="tab-bar__item" onClick={() => navigate('/settings')}>
          <span className="tab-bar__icon">⚙️</span>
          <span className="tab-bar__label">Settings</span>
        </button>
      </nav>
    </div>
  );
}
