import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { STATE_SUBSIDIES } from '../utils/calculator';

export default function OnboardingScreen() {
  const navigate = useNavigate();
  const { updateBusiness, setOnboarded, business, logEvent } = useStore();
  const [step, setStep] = useState(1);
  const states = Object.keys(STATE_SUBSIDIES).sort();

  function handleStart() {
    setOnboarded(true);
    logEvent('onboarding_complete');
    navigate('/');
  }

  return (
    <div className="app-shell" style={{ justifyContent: 'flex-start' }}>
      {step === 1 ? (
        <>
          {/* Welcome Page */}
          <div className="onboarding-hero">
            <span className="onboarding-hero__sun">☀️</span>
            <h1 className="onboarding-hero__title">
              Welcome to<br /><span>SuryaQuote</span>
            </h1>
            <p className="onboarding-hero__tagline">
              Generate professional solar quotations in under 3 minutes — branded PDF, AI-powered sizing, instant WhatsApp share.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="main-content">
            <div className="flex flex-col gap-sm mb-lg">
              {[
                { icon: '🤖', title: 'AI Roof Sizing', desc: 'Upload a rooftop photo — Gemini Vision estimates the ideal system size' },
                { icon: '📄', title: 'Branded PDF', desc: 'Professional multi-page quotation matching your company\'s format' },
                { icon: '💬', title: 'WhatsApp Ready', desc: 'Share PDF directly on WhatsApp with one tap' },
                { icon: '📊', title: 'Quote History', desc: 'Track all quotes — Won, Sent, Lost — with conversion analytics' },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="card flex items-center gap-md" style={{ padding: '14px 16px' }}>
                  <span style={{ fontSize: '28px', flexShrink: 0 }}>{icon}</span>
                  <div>
                    <p style={{ fontWeight: 600, marginBottom: '2px' }}>{title}</p>
                    <p className="text-secondary text-sm">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <button id="onboard-next-btn" className="btn btn--primary btn--full btn--lg" onClick={() => setStep(2)}>
              Get Started →
            </button>
          </div>
        </>
      ) : (
        <>
          {/* Business Setup */}
          <nav className="top-nav">
            <button className="top-nav__back" onClick={() => setStep(1)}>←</button>
            <span className="top-nav__title">Your Business</span>
          </nav>

          <div className="main-content" style={{ paddingBottom: '100px' }}>
            <div className="card mb-md" style={{ border: '1px solid rgba(255,107,0,0.2)', background: 'rgba(255,107,0,0.03)', padding: '12px 16px' }}>
              <p className="text-sm text-secondary">
                ✅ Pre-filled with <strong style={{ color: 'var(--text-primary)' }}>Avion Green Astra Solar Energies</strong> details.
                Edit below if needed.
              </p>
            </div>

            <div className="card mb-md">
              <h2 className="section-title mb-md">🏢 Business Details</h2>
              <div className="flex flex-col gap-md">
                <div className="form-group">
                  <label className="form-label" htmlFor="ob-name">Business Name <span className="required">*</span></label>
                  <input id="ob-name" className="form-input" value={business.name}
                    onChange={e => updateBusiness({ name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="ob-phone">Phone <span className="required">*</span></label>
                  <input id="ob-phone" className="form-input" type="tel" value={business.phone}
                    onChange={e => updateBusiness({ phone: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="ob-email">Email</label>
                  <input id="ob-email" className="form-input" type="email" value={business.email}
                    onChange={e => updateBusiness({ email: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="ob-gst">GST Number</label>
                  <input id="ob-gst" className="form-input" value={business.gst}
                    onChange={e => updateBusiness({ gst: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="ob-state">Your State</label>
                  <select id="ob-state" className="form-select" value={business.state}
                    onChange={e => updateBusiness({ state: e.target.value })}>
                    {states.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <button id="start-btn" className="btn btn--primary btn--full btn--lg" onClick={handleStart}>
              ☀️ Start Creating Quotes
            </button>
          </div>
        </>
      )}
    </div>
  );
}
