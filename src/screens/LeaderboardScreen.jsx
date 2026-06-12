import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { formatINRFull } from '../utils/calculator';

const MEDALS = ['🥇', '🥈', '🥉'];
const RANK_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32'];

function StatPill({ label, value, color }) {
  return (
    <div style={{ textAlign: 'center', flex: 1 }}>
      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' }}>{label}</div>
      <div style={{ fontSize: '13px', fontWeight: 700, color: color || 'var(--text)' }}>{value}</div>
    </div>
  );
}

export default function LeaderboardScreen() {
  const navigate = useNavigate();
  const { quotes } = useStore();
  const [metric, setMetric] = useState('revenue'); // 'revenue' | 'won' | 'total'

  const leaderboard = useMemo(() => {
    const map = new Map();
    quotes.forEach(q => {
      const name = q.salesPersonName?.trim() || 'Unknown';
      if (!map.has(name)) {
        map.set(name, { name, total: 0, won: 0, revenue: 0 });
      }
      const s = map.get(name);
      s.total += 1;
      if (q.status === 'won') {
        s.won += 1;
        s.revenue += q.calc?.grandTotal || 0;
      }
    });

    return Array.from(map.values()).sort((a, b) => {
      if (metric === 'revenue') return b.revenue - a.revenue;
      if (metric === 'won') return b.won - a.won;
      return b.total - a.total;
    });
  }, [quotes, metric]);

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  // Podium heights (tallest = #1)
  const podiumHeights = [100, 75, 55];
  // Re-order for visual podium: 2nd, 1st, 3rd
  const podiumOrder = [top3[1], top3[0], top3[2]];
  const podiumPositions = [1, 0, 2]; // their actual rank indices

  return (
    <div className="app-shell">
      {/* Top Nav */}
      <nav className="top-nav">
        <button className="top-nav__back" onClick={() => navigate('/')} id="leaderboard-back-btn">←</button>
        <span className="top-nav__title">🏆 Leaderboard</span>
        <div />
      </nav>

      <div className="main-content" style={{ paddingBottom: '100px' }}>

        {/* Metric Toggle */}
        <div style={{
          display: 'flex',
          gap: '8px',
          padding: '4px',
          background: 'var(--surface-2)',
          borderRadius: '12px',
          marginBottom: '20px',
        }}>
          {[
            { key: 'revenue', label: '💰 Revenue' },
            { key: 'won', label: '✅ Won' },
            { key: 'total', label: '📋 Quotes' },
          ].map(m => (
            <button
              key={m.key}
              onClick={() => setMetric(m.key)}
              style={{
                flex: 1,
                padding: '8px 4px',
                border: 'none',
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                background: metric === m.key ? 'var(--brand)' : 'transparent',
                color: metric === m.key ? 'white' : 'var(--text-secondary)',
              }}
            >
              {m.label}
            </button>
          ))}
        </div>

        {leaderboard.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state__icon">🏆</span>
            <p className="empty-state__title">No data yet</p>
            <p className="empty-state__sub">Start creating quotes with a Sales Person name to see the leaderboard!</p>
            <button className="btn btn--primary mt-md" onClick={() => navigate('/new-quote/step1')}>
              + Create Quote
            </button>
          </div>
        ) : (
          <>
            {/* Podium Section */}
            {top3.length > 0 && (
              <div style={{
                background: 'linear-gradient(135deg, var(--brand-dark, #1a4a2e) 0%, #0d2b1a 100%)',
                borderRadius: '20px',
                padding: '24px 16px 0',
                marginBottom: '20px',
                overflow: 'hidden',
                position: 'relative',
              }}>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                  <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', letterSpacing: '2px', textTransform: 'uppercase' }}>
                    Sales Champions
                  </div>
                </div>

                {/* Podium */}
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '8px', paddingBottom: '0' }}>
                  {podiumOrder.map((person, idx) => {
                    if (!person) return <div key={idx} style={{ flex: 1 }} />;
                    const rank = podiumPositions[idx];
                    const h = podiumHeights[rank];
                    const isFirst = rank === 0;
                    return (
                      <div key={person.name} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        {/* Avatar + Name above podium */}
                        <div style={{ textAlign: 'center', marginBottom: '8px', maxWidth: '90px' }}>
                          <div style={{
                            width: isFirst ? '60px' : '48px',
                            height: isFirst ? '60px' : '48px',
                            borderRadius: '50%',
                            background: `linear-gradient(135deg, ${RANK_COLORS[rank]}, ${RANK_COLORS[rank]}88)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: isFirst ? '28px' : '22px',
                            margin: '0 auto 6px',
                            border: `2px solid ${RANK_COLORS[rank]}`,
                            boxShadow: isFirst ? `0 0 20px ${RANK_COLORS[rank]}44` : 'none',
                          }}>
                            {MEDALS[rank]}
                          </div>
                          <div style={{
                            fontSize: isFirst ? '13px' : '11px',
                            fontWeight: 700,
                            color: 'white',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '90px',
                          }}>
                            {person.name}
                          </div>
                          <div style={{ fontSize: '10px', color: RANK_COLORS[rank], fontWeight: 600, marginTop: '2px' }}>
                            {metric === 'revenue' ? formatINRFull(person.revenue)
                              : metric === 'won' ? `${person.won} won`
                              : `${person.total} quotes`}
                          </div>
                        </div>

                        {/* Podium block */}
                        <div style={{
                          width: '100%',
                          height: `${h}px`,
                          background: `linear-gradient(180deg, ${RANK_COLORS[rank]}33, ${RANK_COLORS[rank]}11)`,
                          border: `1px solid ${RANK_COLORS[rank]}44`,
                          borderBottom: 'none',
                          borderRadius: '8px 8px 0 0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <span style={{ fontSize: '20px', fontWeight: 800, color: RANK_COLORS[rank] }}>
                            #{rank + 1}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Full Rankings */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700 }}>📊 Full Rankings</h3>
              </div>
              {leaderboard.map((person, idx) => {
                const medal = idx < 3 ? MEDALS[idx] : null;
                const rankColor = idx < 3 ? RANK_COLORS[idx] : 'var(--text-muted)';
                const winRate = person.total > 0 ? Math.round((person.won / person.total) * 100) : 0;
                return (
                  <div
                    key={person.name}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                      borderBottom: idx < leaderboard.length - 1 ? '1px solid var(--border)' : 'none',
                      background: idx === 0 ? 'linear-gradient(90deg, rgba(255,215,0,0.05), transparent)' : 'transparent',
                    }}
                  >
                    {/* Rank */}
                    <div style={{
                      width: '32px',
                      textAlign: 'center',
                      fontSize: medal ? '20px' : '14px',
                      fontWeight: 800,
                      color: rankColor,
                      flexShrink: 0,
                    }}>
                      {medal || `#${idx + 1}`}
                    </div>

                    {/* Name + winrate */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {person.name}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Win rate: {winRate}%
                        <span style={{
                          display: 'inline-block',
                          width: `${winRate}%`,
                          maxWidth: '60px',
                          height: '3px',
                          background: 'var(--brand)',
                          borderRadius: '2px',
                          marginLeft: '6px',
                          verticalAlign: 'middle',
                        }} />
                      </div>
                    </div>

                    {/* Stats */}
                    <div style={{ display: 'flex', gap: '12px', flexShrink: 0 }}>
                      <StatPill label="Total" value={person.total} />
                      <StatPill label="Won" value={person.won} color="var(--green)" />
                      <StatPill
                        label="Revenue"
                        value={person.revenue > 0 ? `₹${(person.revenue / 100000).toFixed(1)}L` : '—'}
                        color="var(--brand)"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Motivation Banner */}
            <div style={{
              marginTop: '16px',
              padding: '16px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, var(--brand)22, var(--purple, #6c3db5)22)',
              border: '1px solid var(--brand)33',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '20px', marginBottom: '6px' }}>⚡</div>
              <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>
                Keep closing! Every quote brings you closer to the top.
              </p>
            </div>
          </>
        )}
      </div>

      {/* Bottom Tab Bar */}
      <nav className="tab-bar">
        <button id="tab-home-lb" className="tab-bar__item" onClick={() => navigate('/')}>
          <span className="tab-bar__icon">🏠</span>
          <span className="tab-bar__label">Home</span>
        </button>
        <button id="tab-quotes-lb" className="tab-bar__item" onClick={() => navigate('/quotes')}>
          <span className="tab-bar__icon">📋</span>
          <span className="tab-bar__label">Quotes</span>
        </button>
        <button id="tab-leaderboard-lb" className="tab-bar__item active">
          <span className="tab-bar__icon">🏆</span>
          <span className="tab-bar__label">Leaders</span>
        </button>
        <button id="tab-settings-lb" className="tab-bar__item" onClick={() => navigate('/settings')}>
          <span className="tab-bar__icon">⚙️</span>
          <span className="tab-bar__label">Settings</span>
        </button>
      </nav>
    </div>
  );
}
