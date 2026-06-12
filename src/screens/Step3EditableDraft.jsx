import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { calculateQuote, formatINRFull } from '../utils/calculator';

function EditableRow({ label, sub, fieldKey, value, onChange, prefix = '₹', suffix = '' }) {
  const [editing, setEditing] = useState(false);
  const [local, setLocal] = useState(String(value));

  function commit() {
    const num = parseFloat(local.replace(/[^0-9.]/g, ''));
    if (!isNaN(num) && num >= 0) onChange(num);
    setEditing(false);
  }

  return (
    <div className="line-item">
      <div className="line-item__label">
        <strong>{label}</strong>
        {sub && <small>{sub}</small>}
      </div>
      {editing ? (
        <input
          className="line-item__input"
          value={local}
          onChange={e => setLocal(e.target.value)}
          onBlur={commit}
          onKeyDown={e => e.key === 'Enter' && commit()}
          autoFocus
        />
      ) : (
        <button
          className="line-item__value"
          onClick={() => { setLocal(String(value)); setEditing(true); }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}
          title="Tap to edit"
        >
          {prefix}{Math.round(value).toLocaleString('en-IN')}{suffix} ✏️
        </button>
      )}
    </div>
  );
}

export default function Step3EditableDraft() {
  const navigate = useNavigate();
  const { draft, updateDraft, addQuote, updateQuote, clearDraft, setStep, business, logEvent, syncQuotes } = useStore();

  if (!draft) { navigate('/'); return null; }

  // Re-calculate whenever draft changes
  const calc = useMemo(() => calculateQuote({
    systemKw: draft.systemKw,
    panelWattage: draft.panelWattage,
    panelRatePerKw: draft.panelRatePerKw,
    inverterRatePerKw: draft.inverterRatePerKw,
    structureRatePerKw: draft.structureRatePerKw,
    bosRatePerKw: draft.bosRatePerKw,
    civilRatePerKw: draft.civilRatePerKw,
    safetyRatePerKw: draft.safetyRatePerKw,
    icRatePerKw: draft.icRatePerKw,
    tariffPerUnit: draft.tariffPerUnit,
    peakSunHours: draft.peakSunHours,
    state: draft.customerState,
    projectType: draft.projectType,
    isGatedCommunity: draft.isGatedCommunity || false,
  }), [draft]);

  function handleConfirmAndGenerate() {
    if (draft.id) {
      // Update existing quote
      updateQuote(draft.id, {
        ...draft,
        calc,
        updatedAt: new Date().toISOString(),
      });
      clearDraft();
      setStep(1);
      logEvent('quote_updated', { quote_id: draft.id, kw: draft.systemKw, total: calc.grandTotal });
      syncQuotes(); // trigger sync in background
      navigate(`/quote/${draft.id}`);
    } else {
      // Save new quote to store
      const quote = {
        id: `q_${Date.now()}`,
        ...draft,
        calc,
        status: 'draft',
        createdAt: new Date().toISOString(),
      };
      addQuote(quote);
      clearDraft();
      setStep(1);
      logEvent('quote_generated', { kw: draft.systemKw, total: calc.grandTotal });
      syncQuotes(); // trigger sync in background
      navigate(`/quote/${quote.id}`);
    }
  }

  function upd(field) {
    return (val) => updateDraft({ [field]: val });
  }

  return (
    <div className="app-shell">
      <nav className="top-nav">
        <button className="top-nav__back" onClick={() => navigate('/new-quote/step2')} id="back-btn">←</button>
        <span className="top-nav__title">Review & Edit Draft</span>
      </nav>

      <div className="main-content" style={{ paddingBottom: '120px' }}>
        {/* Progress */}
        <div className="progress-steps">
          <div className="progress-step completed">
            <div className="progress-step__dot">✓</div>
            <span className="progress-step__label">Customer</span>
          </div>
          <div className="progress-step completed">
            <div className="progress-step__dot">✓</div>
            <span className="progress-step__label">System</span>
          </div>
          <div className="progress-step active">
            <div className="progress-step__dot">3</div>
            <span className="progress-step__label">Review</span>
          </div>
          <div className="progress-step">
            <div className="progress-step__dot">4</div>
            <span className="progress-step__label">PDF</span>
          </div>
        </div>

        <div className="info-box info-box--brand mb-md">
          <span>✏️</span>
          <p><strong>Tap any value to edit</strong> — all line items are adjustable before generating the PDF</p>
        </div>

        {/* Customer Summary */}
        <div className="card mb-md">
          <h3 className="section-title--sm mb-md">👤 Customer</h3>
          <div className="flex flex-col gap-xs">
            <div className="flex justify-between">
              <span className="text-secondary text-sm">Name</span>
              <span className="text-sm font-bold">{draft.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary text-sm">Phone</span>
              <span className="text-sm">{draft.customerPhone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary text-sm">Location</span>
              <span className="text-sm">{draft.customerLocation}, {draft.customerState}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary text-sm">System</span>
              <span className="text-sm font-bold text-brand">{draft.systemKw} kW — {draft.projectType}</span>
            </div>
          </div>
        </div>

        {/* 1. Per-kW Rate Inputs */}
        <div className="card mb-md">
          <h3 className="section-title--sm mb-sm">⚙️ Per-kW Rates (Edit to adjust pricing)</h3>
          <p className="text-sm text-secondary mb-md">All amounts are ₹/kW × {draft.systemKw} kW</p>

          <EditableRow label="Solar PV Modules" sub={`${calc.numPanels} panels × ${draft.panelWattage}W`}
            fieldKey="panelRatePerKw" value={draft.panelRatePerKw} onChange={upd('panelRatePerKw')} />
          <EditableRow label="Inverters" sub={`Grid-Tied, 3-Phase`}
            fieldKey="inverterRatePerKw" value={draft.inverterRatePerKw} onChange={upd('inverterRatePerKw')} />
          <EditableRow label="Mounting Structure (MMS)" sub="HDG Fixed Tilt"
            fieldKey="structureRatePerKw" value={draft.structureRatePerKw} onChange={upd('structureRatePerKw')} />
          <EditableRow label="Balance of System (BOS)" sub="DC/AC Cables, DCDB, ACDB"
            fieldKey="bosRatePerKw" value={draft.bosRatePerKw} onChange={upd('bosRatePerKw')} />
          <EditableRow label="Civil Works" sub="Foundation, Cable Trench"
            fieldKey="civilRatePerKw" value={draft.civilRatePerKw} onChange={upd('civilRatePerKw')} />
          <EditableRow label="Safety System" sub="Lightning Arrestor, Earthing"
            fieldKey="safetyRatePerKw" value={draft.safetyRatePerKw} onChange={upd('safetyRatePerKw')} />
          <EditableRow label="Installation & Commissioning" sub="Testing, Handover"
            fieldKey="icRatePerKw" value={draft.icRatePerKw} onChange={upd('icRatePerKw')} />
        </div>

        {/* 2. Computed Cost Breakdown */}
        <div className="card mb-md">
          <h3 className="section-title--sm mb-md">💰 Cost Breakdown (Calculated)</h3>

          <div className="line-item">
            <div className="line-item__label"><strong>Solar PV Modules</strong></div>
            <span className="line-item__value">{formatINRFull(calc.panelCost)}</span>
          </div>
          <div className="line-item">
            <div className="line-item__label"><strong>Inverters</strong></div>
            <span className="line-item__value">{formatINRFull(calc.inverterCost)}</span>
          </div>
          <div className="line-item">
            <div className="line-item__label"><strong>Mounting Structure</strong></div>
            <span className="line-item__value">{formatINRFull(calc.structureCost)}</span>
          </div>
          <div className="line-item">
            <div className="line-item__label"><strong>Balance of System</strong></div>
            <span className="line-item__value">{formatINRFull(calc.bosCost)}</span>
          </div>
          <div className="line-item">
            <div className="line-item__label"><strong>Civil Works</strong></div>
            <span className="line-item__value">{formatINRFull(calc.civilCost)}</span>
          </div>
          <div className="line-item">
            <div className="line-item__label"><strong>Safety System</strong></div>
            <span className="line-item__value">{formatINRFull(calc.safetyCost)}</span>
          </div>
          <div className="line-item">
            <div className="line-item__label"><strong>Installation & Commissioning</strong></div>
            <span className="line-item__value">{formatINRFull(calc.icCost)}</span>
          </div>

          <div style={{ borderTop: '1px solid var(--border)', marginTop: '12px', paddingTop: '12px' }}>
            <div className="line-item">
              <div className="line-item__label"><strong>Total — Excl. GST</strong></div>
              <span className="line-item__value">{formatINRFull(calc.totalExGST)}</span>
            </div>
            <div className="line-item">
              <div className="line-item__label"><strong>GST ({(calc.gstRate * 100).toFixed(1)}% effective)</strong></div>
              <span className="line-item__value">{formatINRFull(calc.gstAmount)}</span>
            </div>
          </div>

          <div className="line-item line-item--total">
            <div className="line-item__label"><strong>GRAND TOTAL — GST Inclusive</strong></div>
            <span className="line-item__value">{formatINRFull(calc.grandTotal)}/-</span>
          </div>

          {calc.totalSubsidy > 0 && (
            <>
              {calc.centralSubsidy > 0 && (
                <div className="line-item" style={{ marginTop: '12px' }}>
                  <div className="line-item__label"><strong>Central Subsidy (PM Surya Ghar)</strong></div>
                  <span className="line-item__value" style={{ color: 'var(--green)' }}>− {formatINRFull(calc.centralSubsidy)}</span>
                </div>
              )}
              {calc.gatedCommunityDiscount > 0 && (
                <div className="line-item">
                  <div className="line-item__label"><strong>🏘️ Gated Community Discount (₹18,000/kW)</strong></div>
                  <span className="line-item__value" style={{ color: 'var(--green)' }}>− {formatINRFull(calc.gatedCommunityDiscount)}</span>
                </div>
              )}
              <div className="line-item line-item--total" style={{ borderColor: 'rgba(34,197,94,0.3)', background: 'rgba(34,197,94,0.05)' }}>
                <div className="line-item__label"><strong>Net Cost After Discounts</strong></div>
                <span className="line-item__value" style={{ color: 'var(--green)' }}>{formatINRFull(calc.netCost)}/-</span>
              </div>
            </>
          )}
        </div>

        {/* 3. Energy Generation */}
        <div className="card mb-md">
          <h3 className="section-title--sm mb-md">⚡ Energy Generation Estimates</h3>
          <div className="flex flex-col gap-sm">
            {[
              ['Daily', `${calc.dailyGen_low.toLocaleString('en-IN')} – ${calc.dailyGen_high.toLocaleString('en-IN')} kWh`],
              ['Monthly', `${calc.monthlyGen_low.toLocaleString('en-IN')} – ${calc.monthlyGen_high.toLocaleString('en-IN')} kWh`],
              ['Annual', `${calc.annualGen_low.toLocaleString('en-IN')} – ${calc.annualGen_high.toLocaleString('en-IN')} kWh`],
              ['25-Year (Est.)', `${(calc.gen25yr_low / 10000000).toFixed(2)} – ${(calc.gen25yr_high / 10000000).toFixed(2)} Crore kWh`],
            ].map(([period, gen]) => (
              <div key={period} className="flex justify-between">
                <span className="text-secondary text-sm">{period}</span>
                <span className="text-sm font-bold">{gen}</span>
              </div>
            ))}
          </div>

          <div className="divider mt-md mb-md" />

          <h3 className="section-title--sm mb-md">📈 Financial Benefits</h3>
          <div className="flex flex-col gap-xs">
            <EditableRow label="Electricity Tariff" sub="₹/kWh"
              fieldKey="tariffPerUnit" value={draft.tariffPerUnit} onChange={upd('tariffPerUnit')} prefix="₹" suffix="/kWh" />
          </div>
          <div className="flex flex-col gap-sm mt-md">
            {[
              ['Annual Savings', `${formatINRFull(calc.annualSavings_low)} – ${formatINRFull(calc.annualSavings_high)} / Year`],
              ['Simple Payback', `~${calc.payback_low.toFixed(1)} – ${calc.payback_high.toFixed(1)} Years`],
              ['25-Year Savings (Est.)', `${formatINRFull(calc.savings25yr_low)} – ${formatINRFull(calc.savings25yr_high)}`],
              ['CO₂ Reduction', `~${calc.co2PerYear_low} – ${calc.co2PerYear_high} Tonnes/Year`],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between">
                <span className="text-secondary text-sm">{label}</span>
                <span className="text-sm font-bold">{val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Payment Terms */}
        <div className="card mb-md">
          <h3 className="section-title--sm mb-md">💳 Payment Milestones</h3>
          {[
            ['Advance (30%)', 'With Purchase Order / Agreement', calc.milestone1],
            ['Material (40%)', 'Before Dispatch of Modules & Inverters', calc.milestone2],
            ['Mechanical (20%)', 'MMS + Module + DC Wiring Complete', calc.milestone3],
            ['Final (10%)', 'Commissioning, Grid Sync & Handover', calc.milestone4],
          ].map(([title, desc, amount], i) => (
            <div key={i} className="line-item">
              <div className="line-item__label">
                <strong>{title}</strong>
                <small>{desc}</small>
              </div>
              <span className="line-item__value">{formatINRFull(amount)}</span>
            </div>
          ))}
        </div>

        {/* Summary Banner */}
        <div className="summary-banner">
          <div className="summary-banner__row">
            <span className="summary-banner__label">System Size</span>
            <span className="summary-banner__value">{draft.systemKw} kW</span>
          </div>
          <div className="summary-banner__row">
            <span className="summary-banner__label">Annual Savings</span>
            <span className="summary-banner__value">
              {formatINRFull(calc.annualSavings_low)} – {formatINRFull(calc.annualSavings_high)} / yr
            </span>
          </div>
          <div className="summary-banner__row">
            <span className="summary-banner__label">Payback Period</span>
            <span className="summary-banner__value">{calc.payback_low.toFixed(1)} – {calc.payback_high.toFixed(1)} years</span>
          </div>
          <div className="divider" />
          <div className="summary-banner__row">
            <span className="summary-banner__total-label">Grand Total (incl. GST)</span>
            <span className="summary-banner__total-value">{formatINRFull(calc.grandTotal)}/-</span>
          </div>
          {calc.totalSubsidy > 0 && (
            <div className="summary-banner__row">
              <span className="summary-banner__label">After Subsidies</span>
              <span className="summary-banner__value" style={{ color: 'var(--green)', fontWeight: 700 }}>
                {formatINRFull(calc.netCost)}/-
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="bottom-cta">
        <button id="generate-pdf-btn" className="btn btn--primary btn--full btn--lg" onClick={handleConfirmAndGenerate}>
          Confirm & Generate PDF
        </button>
      </div>
    </div>
  );
}
