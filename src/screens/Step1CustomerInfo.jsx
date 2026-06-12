import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { STATE_SUBSIDIES, PROJECT_TYPES } from '../utils/calculator';

export default function Step1CustomerInfo() {
  const navigate = useNavigate();
  const { draft, updateDraft, step, setStep } = useStore();
  const [errors, setErrors] = useState({});

  if (!draft) {
    navigate('/');
    return null;
  }

  const states = Object.keys(STATE_SUBSIDIES).sort();

  function validate() {
    const e = {};
    if (!draft.salesPersonName?.trim()) e.salesPersonName = 'Sales person name is required';
    if (!draft.customerName.trim()) e.customerName = 'Customer name is required';
    if (!draft.customerPhone.trim()) e.customerPhone = 'Phone number is required';
    if (!draft.customerLocation.trim()) e.customerLocation = 'Location is required';
    return e;
  }

  function handleNext() {
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    setStep(2);
    navigate('/new-quote/step2');
  }

  return (
    <div className="app-shell">
      <nav className="top-nav">
        <button className="top-nav__back" onClick={() => navigate('/')} id="back-btn">←</button>
        <span className="top-nav__title">New Quotation</span>
      </nav>

      <div className="main-content" style={{ paddingBottom: '100px' }}>
        {/* Progress Steps */}
        <div className="progress-steps">
          <div className="progress-step active">
            <div className="progress-step__dot">1</div>
            <span className="progress-step__label">Customer</span>
          </div>
          <div className="progress-step">
            <div className="progress-step__dot">2</div>
            <span className="progress-step__label">System</span>
          </div>
          <div className="progress-step">
            <div className="progress-step__dot">3</div>
            <span className="progress-step__label">Review</span>
          </div>
          <div className="progress-step">
            <div className="progress-step__dot">4</div>
            <span className="progress-step__label">PDF</span>
          </div>
        </div>

        <div className="card mb-md">
          <h2 className="section-title mb-md">👤 Customer Information</h2>

          <div className="flex flex-col gap-md">
            <div className="form-group">
              <label className="form-label" htmlFor="salesPersonName">
                🧑‍💼 Sales Person Name <span className="required">*</span>
              </label>
              <input
                id="salesPersonName"
                className="form-input"
                type="text"
                placeholder="e.g. Ravi Kumar"
                value={draft.salesPersonName || ''}
                onChange={e => { updateDraft({ salesPersonName: e.target.value }); setErrors(v => ({ ...v, salesPersonName: '' })); }}
              />
              {errors.salesPersonName && <span className="form-error">{errors.salesPersonName}</span>}
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="customerName">
                Customer Name <span className="required">*</span>
              </label>
              <input
                id="customerName"
                className="form-input"
                type="text"
                placeholder="e.g. Chandana Ramesh Garu"
                value={draft.customerName}
                onChange={e => { updateDraft({ customerName: e.target.value }); setErrors(v => ({ ...v, customerName: '' })); }}
              />
              {errors.customerName && <span className="form-error">{errors.customerName}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="customerPhone">
                Phone Number <span className="required">*</span>
              </label>
              <input
                id="customerPhone"
                className="form-input"
                type="tel"
                placeholder="e.g. 9876543210"
                value={draft.customerPhone}
                onChange={e => { updateDraft({ customerPhone: e.target.value }); setErrors(v => ({ ...v, customerPhone: '' })); }}
              />
              {errors.customerPhone && <span className="form-error">{errors.customerPhone}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="customerLocation">
                Project Location <span className="required">*</span>
              </label>
              <input
                id="customerLocation"
                className="form-input"
                type="text"
                placeholder="e.g. Vijayawada, Andhra Pradesh"
                value={draft.customerLocation}
                onChange={e => { updateDraft({ customerLocation: e.target.value }); setErrors(v => ({ ...v, customerLocation: '' })); }}
              />
              {errors.customerLocation && <span className="form-error">{errors.customerLocation}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="customerState">State</label>
              <select
                id="customerState"
                className="form-select"
                value={draft.customerState}
                onChange={e => updateDraft({ customerState: e.target.value })}
              >
                {states.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Project Type</label>
              <div className="flex gap-sm">
                {PROJECT_TYPES.map(pt => (
                  <button
                    key={pt.value}
                    id={`project-type-${pt.value}`}
                    className={`btn btn--sm flex-1 ${draft.projectType === pt.value ? 'btn--primary' : 'btn--secondary'}`}
                    onClick={() => updateDraft({
                      projectType: pt.value,
                      isGatedCommunity: false,
                      // Auto-adjust panel rate based on project type
                      panelRatePerKw: pt.value === 'residential' ? 30000 : 27000,
                    })}
                    type="button"
                  >
                    {pt.emoji} {pt.label}
                  </button>
                ))}
              </div>
              {draft.projectType === 'residential' && (
                <p className="form-hint mt-sm">
                  ✅ PM Surya Ghar central subsidy (up to ₹78,000) will be applied automatically
                </p>
              )}
              {draft.projectType === 'commercial' && (
                <p className="form-hint mt-sm">
                  ℹ️ Commercial projects: No subsidies or discounts applied
                </p>
              )}
            </div>

            {/* Gated Community Toggle — Residential only */}
            {draft.projectType === 'residential' && (
              <div className="form-group">
                <label className="form-label">🏘️ Gated Community?</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    id="gated-yes-btn"
                    type="button"
                    className={`btn btn--sm flex-1 ${draft.isGatedCommunity ? 'btn--primary' : 'btn--secondary'}`}
                    onClick={() => updateDraft({ isGatedCommunity: true })}
                  >
                    ✅ Yes — Gated Community
                  </button>
                  <button
                    id="gated-no-btn"
                    type="button"
                    className={`btn btn--sm flex-1 ${!draft.isGatedCommunity ? 'btn--primary' : 'btn--secondary'}`}
                    onClick={() => updateDraft({ isGatedCommunity: false })}
                  >
                    ❌ No
                  </button>
                </div>
                {draft.isGatedCommunity && (
                  <p className="form-hint mt-sm" style={{ color: 'var(--green)' }}>
                    🎉 Gated community discount of ₹18,000/kW will be applied!
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Quote Details Card */}
        <div className="card">
          <h3 className="section-title--sm mb-md">📄 Quote Details</h3>
          <div className="flex flex-col gap-sm">
            <div className="flex justify-between">
              <span className="text-secondary text-sm">Quote No.</span>
              <span className="text-sm font-bold">{draft.quoteNo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary text-sm">Date</span>
              <span className="text-sm">{draft.date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary text-sm">Valid Until</span>
              <span className="text-sm">{draft.validUntil}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Next Button */}
      <div className="bottom-cta">
        <button id="next-step1-btn" className="btn btn--primary btn--full btn--lg" onClick={handleNext}>
          Continue to System Configuration
        </button>
      </div>
    </div>
  );
}
