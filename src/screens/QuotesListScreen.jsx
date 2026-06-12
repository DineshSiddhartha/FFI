import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { formatINRFull, formatDate } from '../utils/calculator';

const statusConfig = {
  draft: { label: 'Draft', cls: 'pill--gray' },
  sent: { label: 'Sent', cls: 'pill--orange' },
  won: { label: 'Won ✓', cls: 'pill--green' },
  lost: { label: 'Lost', cls: 'pill--red' },
};

export default function QuotesListScreen() {
  const navigate = useNavigate();
  const { quotes, startDraft, logEvent } = useStore();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = quotes.filter(q => {
    const matchStatus = filter === 'all' || q.status === filter;
    const matchSearch = !search || (q.customerName || '').toLowerCase().includes(search.toLowerCase())
      || (q.quoteNo || '').toLowerCase().includes(search.toLowerCase())
      || (q.customerLocation || '').toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  function handleNewQuote() {
    startDraft();
    logEvent('quote_started');
    navigate('/new-quote/step1');
  }

  return (
    <div className="app-shell">
      <nav className="top-nav">
        <div className="top-nav__logo">
          <div className="top-nav__logo-icon">☀️</div>
          <span className="top-nav__logo-text">All Quotes</span>
        </div>
      </nav>

      <div className="main-content" style={{ paddingBottom: '100px' }}>
        {/* Search */}
        <div className="form-group mb-md">
          <input
            id="search-quotes"
            className="form-input"
            type="search"
            placeholder="🔍 Search by name, location, quote no..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Filter Pills */}
        <div className="flex gap-sm mb-md" style={{ flexWrap: 'wrap' }}>
          {[['all', 'All'], ['draft', 'Draft'], ['sent', 'Sent'], ['won', 'Won'], ['lost', 'Lost']].map(([key, label]) => (
            <button
              key={key}
              id={`filter-${key}`}
              className={`pill ${filter === key ? 'pill--orange' : 'pill--gray'}`}
              onClick={() => setFilter(key)}
              style={{ cursor: 'pointer', border: 'none', background: filter === key ? 'rgba(255,107,0,0.15)' : 'rgba(152,152,176,0.1)' }}
            >
              {label} {quotes.filter(q => key === 'all' || q.status === key).length}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state__icon">{search ? '🔍' : '📋'}</span>
            <p className="empty-state__title">{search ? 'No results' : 'No quotes'}</p>
            <p className="empty-state__sub">{search ? `No quotes match "${search}"` : 'Create your first quote to get started'}</p>
            {!search && (
              <button id="first-quote-btn" className="btn btn--primary mt-md" onClick={handleNewQuote}>
                ➕ Create Quote
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-sm">
            {filtered.map(quote => {
              const sc = statusConfig[quote.status] || statusConfig.draft;
              return (
                <div
                  key={quote.id}
                  className="quote-item"
                  id={`quote-list-${quote.id}`}
                  onClick={() => navigate(`/quote/${quote.id}`)}
                >
                  <div className="quote-item__header">
                    <div>
                      <p className="quote-item__name">{quote.customerName || 'Unnamed Customer'}</p>
                      <p className="quote-item__info">{quote.quoteNo}</p>
                    </div>
                    <span className={`pill ${sc.cls}`}>{sc.label}</span>
                  </div>
                  <div className="quote-item__meta">
                    <span className="quote-item__info">📍 {quote.customerLocation || quote.customerState}</span>
                    <span className="quote-item__info">⚡ {quote.systemKw} kW</span>
                    <span className="quote-item__info">📅 {formatDate(quote.createdAt)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="quote-item__amount">
                      {formatINRFull(quote.calc?.grandTotal || 0)}
                      <span> incl. GST</span>
                    </span>
                    <span className="text-secondary text-sm">→</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FAB */}
      <button id="new-quote-fab" className="fab" onClick={handleNewQuote} title="New Quote">
        ➕
      </button>

      {/* Bottom Tab Bar */}
      <nav className="tab-bar">
        <button id="tab-home" className="tab-bar__item" onClick={() => navigate('/')}>
          <span className="tab-bar__icon">🏠</span>
          <span className="tab-bar__label">Home</span>
        </button>
        <button id="tab-quotes" className="tab-bar__item active">
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
