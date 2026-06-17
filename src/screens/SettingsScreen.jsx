import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { STATE_SUBSIDIES } from '../utils/calculator';

export default function SettingsScreen() {
  const navigate = useNavigate();
  const { 
    business, updateBusiness, setOnboarded, setAuthenticated, quotes, events,
    syncCode, setSyncCode, syncQuotes, syncStatus, syncError, lastSynced 
  } = useStore();

  function handleLogout() {
    if (window.confirm('Log out? Your quotes and settings will be saved on this device.')) {
      setAuthenticated(false);
      navigate('/login');
    }
  }
  const [saved, setSaved] = useState(false);
  const [localSyncCode, setLocalSyncCode] = useState(syncCode || business.gst || '');
  const states = Object.keys(STATE_SUBSIDIES).sort();

  function handleSaveSyncCode() {
    setSyncCode(localSyncCode);
    setTimeout(() => {
      syncQuotes();
    }, 50);
  }

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleReset() {
    if (window.confirm('Reset all data? This will delete all quotes and settings.')) {
      localStorage.clear();
      window.location.reload();
    }
  }

  // Export analytics CSV
  function handleExportCSV() {
    if (events.length === 0) {
      alert('No events logged yet');
      return;
    }
    const header = 'event,timestamp\n';
    const rows = events.map(e => `${e.event},${e.ts}`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SuryaQuote_analytics_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function upd(field) {
    return (e) => updateBusiness({ [field]: e.target.type === 'number' ? Number(e.target.value) : e.target.value });
  }

  return (
    <div className="app-shell">
      <nav className="top-nav">
        <button className="top-nav__back" onClick={() => navigate('/')} id="back-btn">←</button>
        <span className="top-nav__title">Settings</span>
      </nav>

      <div className="main-content" style={{ paddingBottom: '100px' }}>
        {/* Business Profile */}
        <div className="card mb-md">
          <h2 className="section-title mb-md">🏢 Business Profile</h2>
          <div className="flex flex-col gap-md">
            <div className="form-group">
              <label className="form-label" htmlFor="biz-name">Business Name</label>
              <input id="biz-name" className="form-input" value={business.name} onChange={upd('name')} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="biz-address">Address</label>
              <textarea id="biz-address" className="form-textarea" value={business.address} onChange={upd('address')} />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="biz-phone">Phone</label>
                <input id="biz-phone" className="form-input" value={business.phone} onChange={upd('phone')} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="biz-altphone">Alt Phone</label>
                <input id="biz-altphone" className="form-input" value={business.altPhone} onChange={upd('altPhone')} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="biz-email">Email</label>
              <input id="biz-email" className="form-input" type="email" value={business.email} onChange={upd('email')} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="biz-website">Website</label>
              <input id="biz-website" className="form-input" value={business.website} onChange={upd('website')} />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="biz-gst">GST Number</label>
                <input id="biz-gst" className="form-input" value={business.gst} onChange={upd('gst')} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="biz-pan">PAN</label>
                <input id="biz-pan" className="form-input" value={business.pan} onChange={upd('pan')} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="biz-state">Default State</label>
              <select id="biz-state" className="form-select" value={business.state} onChange={upd('state')}>
                {states.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Cloud Synchronization */}
        <div className="card mb-md">
          <h2 className="section-title mb-sm">☁️ Cloud Synchronization</h2>
          <p className="text-secondary text-sm mb-md">
            Enter a shared Company Sync Code to sync quotes across multiple team members' devices instantly.
          </p>
          <div className="flex flex-col gap-md">
            <div className="form-group">
              <label className="form-label" htmlFor="sync-code-input">Company Sync Code</label>
              <div className="flex gap-sm">
                <input
                  id="sync-code-input"
                  className="form-input"
                  placeholder="e.g. AVION_SOLAR_TEAM"
                  value={localSyncCode}
                  onChange={e => setLocalSyncCode(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button 
                  id="save-sync-code-btn"
                  className="btn btn--secondary" 
                  onClick={handleSaveSyncCode}
                >
                  Save Code
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between" style={{ marginTop: '8px', padding: '10px', background: 'rgba(255,107,0,0.06)', borderRadius: '8px', border: '1px solid rgba(255,107,0,0.2)' }}>
              <div>
                <p style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>Sync Status: 
                  <span style={{ 
                    marginLeft: '6px', 
                    color: syncStatus === 'syncing' ? 'var(--orange)' : syncStatus === 'error' ? 'var(--red)' : syncStatus === 'success' ? 'var(--green)' : 'var(--text-secondary)'
                  }}>
                    {syncStatus === 'syncing' ? 'Syncing...' : syncStatus === 'error' ? 'Error ⚠️' : syncStatus === 'success' ? 'Synced ✅' : 'Idle'}
                  </span>
                </p>
                {lastSynced && (
                  <p className="text-secondary" style={{ fontSize: '11px', marginTop: '2px' }}>
                    Last Synced: {new Date(lastSynced).toLocaleTimeString()} {new Date(lastSynced).toLocaleDateString()}
                  </p>
                )}
                {syncStatus === 'error' && syncError && (
                  <p className="form-error" style={{ fontSize: '11px', marginTop: '4px' }}>
                    {syncError}
                  </p>
                )}
              </div>
              <button 
                id="manual-sync-btn"
                className="btn btn--primary" 
                onClick={syncQuotes}
                disabled={syncStatus === 'syncing'}
              >
                Sync Now 🔄
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Defaults */}
        <div className="card mb-md">
          <h2 className="section-title mb-sm">💰 Default Pricing (₹/kW)</h2>
          <p className="text-secondary text-sm mb-md">These become the default values for every new quote. You can override per-quote in the draft screen.</p>
          <div className="flex flex-col gap-md">
            {[
              ['Solar PV Modules', 'panelRatePerKw'],
              ['Inverters', 'inverterRatePerKw'],
              ['Mounting Structure (MMS)', 'structureRatePerKw'],
              ['Balance of System (BOS)', 'bosRatePerKw'],
              ['Civil Works', 'civilRatePerKw'],
              ['Safety System', 'safetyRatePerKw'],
              ['Installation & Commissioning', 'icRatePerKw'],
            ].map(([label, field]) => (
              <div key={field} className="flex items-center gap-md">
                <span className="text-sm flex-1" style={{ color: 'var(--text-secondary)' }}>{label}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="text-secondary text-sm">₹</span>
                  <input
                    id={`pricing-${field}`}
                    className="form-input"
                    type="number"
                    value={business[field]}
                    onChange={upd(field)}
                    style={{ width: '120px', textAlign: 'right' }}
                  />
                </div>
              </div>
            ))}

            <div className="divider" />

            <div className="flex items-center gap-md">
              <span className="text-sm flex-1" style={{ color: 'var(--text-secondary)' }}>Electricity Tariff (₹/kWh)</span>
              <input
                id="pricing-tariff"
                className="form-input"
                type="number"
                step="0.1"
                value={business.tariffPerUnit}
                onChange={upd('tariffPerUnit')}
                style={{ width: '120px', textAlign: 'right' }}
              />
            </div>
            <div className="flex items-center gap-md">
              <span className="text-sm flex-1" style={{ color: 'var(--text-secondary)' }}>Peak Sun Hours/day</span>
              <input
                id="pricing-sun"
                className="form-input"
                type="number"
                step="0.1"
                value={business.peakSunHours}
                onChange={upd('peakSunHours')}
                style={{ width: '120px', textAlign: 'right' }}
              />
            </div>
            <div className="flex items-center gap-md">
              <span className="text-sm flex-1" style={{ color: 'var(--text-secondary)' }}>Default Panel Wattage (W)</span>
              <input
                id="pricing-wattage"
                className="form-input"
                type="number"
                value={business.panelWattage}
                onChange={upd('panelWattage')}
                style={{ width: '120px', textAlign: 'right' }}
              />
            </div>
          </div>

          <button
            id="save-settings-btn"
            className={`btn btn--full mt-lg ${saved ? 'btn--green' : 'btn--primary'}`}
            onClick={handleSave}
          >
            {saved ? '✅ Saved!' : '💾 Save Settings'}
          </button>
        </div>

        {/* Analytics */}
        <div className="card mb-md">
          <h2 className="section-title mb-md">📊 Analytics</h2>
          <div className="flex flex-col gap-sm mb-md">
            <div className="flex justify-between">
              <span className="text-secondary text-sm">Total Quotes Created</span>
              <span className="text-sm font-bold">{quotes.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary text-sm">Events Logged</span>
              <span className="text-sm font-bold">{events.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary text-sm">Quotes Won</span>
              <span className="text-sm font-bold text-green">{quotes.filter(q => q.status === 'won').length}</span>
            </div>
          </div>
          <button id="export-csv-btn" className="btn btn--secondary btn--full" onClick={handleExportCSV}>
            📥 Export Usage Log (CSV)
          </button>
        </div>

        {/* Log Out */}
        <div className="card mb-md" style={{ border: '1px solid rgba(255,107,0,0.2)', background: 'rgba(255,107,0,0.03)' }}>
          <h2 className="section-title mb-sm">🔒 Session</h2>
          <p className="text-secondary text-sm mb-md">
            Log out of SuryaQuote. Your quotes and settings remain saved on this device.
          </p>
          <button
            id="logout-btn"
            className="btn btn--full"
            onClick={handleLogout}
            style={{ background: 'transparent', border: '1px solid rgba(255,107,0,0.4)', color: 'var(--orange)' }}
          >
            🔓 Log Out
          </button>
        </div>

        {/* Danger Zone */}
        <div className="card" style={{ border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.03)' }}>
          <h2 className="section-title mb-sm" style={{ color: 'var(--red)' }}>⚠️ Danger Zone</h2>
          <p className="text-secondary text-sm mb-md">This will delete all quotes and reset the app. Cannot be undone.</p>
          <button id="reset-app-btn" className="btn btn--full" onClick={handleReset}
            style={{ background: 'transparent', border: '1px solid rgba(239,68,68,0.5)', color: 'var(--red)' }}>
            🗑️ Reset All Data
          </button>
        </div>
      </div>

      {/* Bottom Tab Bar */}
      <nav className="tab-bar">
        <button id="tab-home" className="tab-bar__item" onClick={() => navigate('/')}>
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
        <button id="tab-settings" className="tab-bar__item active">
          <span className="tab-bar__icon">⚙️</span>
          <span className="tab-bar__label">Settings</span>
        </button>
      </nav>
    </div>
  );
}
