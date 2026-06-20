import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { generatePDFBlob } from '../components/QuotePDF';
import { generateWordHTML } from '../utils/wordGenerator';
import { formatINRFull, formatDate } from '../utils/calculator';

const statusConfig = {
  draft: { label: 'Draft', cls: 'pill--gray' },
  sent: { label: 'Sent', cls: 'pill--orange' },
  won: { label: 'Won ✓', cls: 'pill--green' },
  lost: { label: 'Lost', cls: 'pill--red' },
};

export default function QuoteDetailScreen() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { getQuote, updateQuote, deleteQuote, pushQuotesToCloud, business, logEvent, startDraft, syncQuotes } = useStore();
  const quote = getQuote(id);

  const [pdfLoading, setPdfLoading] = useState(false);
  const [wordLoading, setWordLoading] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  function showToast(message, type = 'success') {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast(v => ({ ...v, visible: false })), 3000);
  }

  if (!quote) {
    return (
      <div className="app-shell">
        <nav className="top-nav">
          <button className="top-nav__back" onClick={() => navigate('/')}>←</button>
          <span className="top-nav__title">Quote Not Found</span>
        </nav>
        <div className="empty-state">
          <span className="empty-state__icon">❓</span>
          <p className="empty-state__title">Quote not found</p>
          <button className="btn btn--primary" onClick={() => navigate('/')}>Go Home</button>
        </div>
      </div>
    );
  }

  const calc = quote.calc;
  const sc = statusConfig[quote.status] || statusConfig.draft;

  async function handleDownloadPDF() {
    setPdfLoading(true);
    logEvent('pdf_generated', { quote_id: id });
    try {
      const blob = await generatePDFBlob(quote, business);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SuryaQuote_${quote.quoteNo}_${quote.customerName?.replace(/\s+/g, '_')}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      updateQuote(id, { status: 'sent' });
      syncQuotes();
      showToast('✅ PDF downloaded!');
    } catch (err) {
      console.error(err);
      showToast('❌ PDF generation failed', 'error');
    } finally {
      setPdfLoading(false);
    }
  }

  async function handleDownloadWord() {
    setWordLoading(true);
    logEvent('word_generated', { quote_id: id });
    try {
      let base64HeaderStr = '';
      try {
        const response = await fetch('/header.png');
        if (response.ok) {
          const blob = await response.blob();
          base64HeaderStr = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
          });
        }
      } catch (e) {
        console.error("Failed to fetch header.png as base64", e);
      }

      const htmlContent = generateWordHTML(quote, business, base64HeaderStr);
      const blob = new Blob(['\ufeff' + htmlContent], { type: 'application/msword;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SuryaQuote_${quote.quoteNo}_${quote.customerName?.replace(/\s+/g, '_')}.doc`;
      a.click();
      URL.revokeObjectURL(url);

      updateQuote(id, { status: 'sent' });
      syncQuotes();
      showToast('✅ Word document downloaded!');
    } catch (err) {
      console.error(err);
      showToast('❌ Word generation failed', 'error');
    } finally {
      setWordLoading(false);
    }
  }

  async function handleWhatsAppShare() {
    logEvent('quote_shared', { quote_id: id, channel: 'whatsapp' });
    const phone = quote.customerPhone?.replace(/\D/g, '');
    const text = encodeURIComponent(
      `Dear ${quote.customerName},\n\nPlease find your solar quotation from ${business.name}:\n\n` +
      `Quote No: ${quote.quoteNo}\n` +
      `System: ${quote.systemKw} kW Grid-Tied Solar\n` +
      `Total Investment: ${formatINRFull(calc?.grandTotal || 0)} (incl. GST)\n` +
      `Estimated Annual Savings: ${formatINRFull(calc?.annualSavings_low || 0)} – ${formatINRFull(calc?.annualSavings_high || 0)}\n` +
      `Payback Period: ${calc?.payback_low?.toFixed(1)} – ${calc?.payback_high?.toFixed(1)} Years\n\n` +
      `Quote valid until: ${quote.validUntil}\n\n` +
      `For detailed PDF quotation, please contact:\n${business.phone} | ${business.email}\n\n` +
      `Thank you for considering ${business.name}! ☀️`
    );

    // Try Web Share API first, else open WhatsApp
    if (navigator.share) {
      try {
        const blob = await generatePDFBlob(quote, business);
        const file = new File([blob], `${quote.quoteNo}.pdf`, { type: 'application/pdf' });
        await navigator.share({
          title: `Solar Quotation — ${quote.quoteNo}`,
          text: decodeURIComponent(text),
          files: [file],
        });
        updateQuote(id, { status: 'sent' });
        syncQuotes();
        showToast('✅ Shared via WhatsApp!');
        return;
      } catch (err) {
        // Fallback
      }
    }

    // Fallback: open WhatsApp with pre-filled message
    const waUrl = phone
      ? `https://wa.me/91${phone}?text=${text}`
      : `https://wa.me/?text=${text}`;
    window.open(waUrl, '_blank');
    updateQuote(id, { status: 'sent' });
    syncQuotes();
  }

  function handleEditQuote() {
    startDraft(quote);
    navigate('/new-quote/step1');
  }

  function handleStatusChange(newStatus) {
    updateQuote(id, { status: newStatus });
    setShowStatusMenu(false);
    logEvent('quote_status_changed', { quote_id: id, status: newStatus });
    syncQuotes();
    showToast(`Status updated to ${newStatus}`);
  }

  async function handleDelete() {
    if (window.confirm('Delete this quote? This cannot be undone.')) {
      deleteQuote(id);
      await pushQuotesToCloud(); // Wait for cloud write to finish BEFORE navigating
      navigate('/');             // HomeScreen auto-syncs on mount — must finish push first
    }
  }

  return (
    <div className="app-shell">
      {/* Toast */}
      <div className={`toast ${toast.visible ? 'visible' : ''} toast--${toast.type}`}>
        {toast.message}
      </div>

      <nav className="top-nav">
        <button className="top-nav__back" onClick={() => navigate('/')} id="back-btn">←</button>
        <span className="top-nav__title">Quote Detail</span>
        <button
          id="status-menu-btn"
          className="top-nav__back"
          onClick={() => setShowStatusMenu(true)}
          title="Change Status"
        >
          ⋯
        </button>
      </nav>

      <div className="main-content" style={{ paddingBottom: '100px' }}>
        {/* Quote Header Card */}
        <div className="card mb-md" style={{ background: 'linear-gradient(135deg, rgba(255,107,0,0.08), rgba(255,184,0,0.05))', border: '1px solid rgba(255,107,0,0.2)' }}>
          <div className="flex items-center justify-between mb-sm">
            <span className={`pill ${sc.cls}`}>{sc.label}</span>
            <span className="text-secondary text-sm">{quote.quoteNo}</span>
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 800, marginBottom: '4px' }}>
            {quote.customerName}
          </h2>
          <p className="text-secondary text-sm mb-md">
            📍 {quote.customerLocation}, {quote.customerState} &nbsp;|&nbsp; 📞 {quote.customerPhone}
          </p>
          {quote.salesPersonName && (
            <div style={{ marginBottom: '12px' }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 600,
                background: 'rgba(var(--brand-rgb, 34,120,68), 0.12)',
                color: 'var(--brand)',
                border: '1px solid rgba(var(--brand-rgb, 34,120,68), 0.25)',
              }}>
                🧑‍💼 {quote.salesPersonName}
              </span>
            </div>
          )}
          <div className="grid-3">
            <div className="stat-card">
              <span className="stat-card__label">System</span>
              <span className="stat-card__value" style={{ fontSize: '16px' }}>{quote.systemKw} kW</span>
            </div>
            <div className="stat-card">
              <span className="stat-card__label">Total</span>
              <span className="stat-card__value" style={{ fontSize: '14px', color: 'var(--orange)' }}>
                {formatINRFull(calc?.grandTotal || 0)}
              </span>
            </div>
            <div className="stat-card">
              <span className="stat-card__label">Payback</span>
              <span className="stat-card__value" style={{ fontSize: '14px' }}>
                {calc?.payback_low?.toFixed(1)}yr
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-sm mb-md">
          <button
            id="download-pdf-btn"
            className="btn btn--primary btn--full btn--lg"
            onClick={handleDownloadPDF}
            disabled={pdfLoading}
          >
            {pdfLoading ? '⏳ Generating PDF...' : '📄 Download PDF'}
          </button>
          <button
            id="download-word-btn"
            className="btn btn--navy btn--full"
            onClick={handleDownloadWord}
            disabled={wordLoading}
          >
            {wordLoading ? '⏳ Generating Word...' : '📝 Download Word Doc'}
          </button>
          <button
            id="whatsapp-share-btn"
            className="btn btn--green btn--full"
            onClick={handleWhatsAppShare}
          >
            💬 Share on WhatsApp
          </button>
          <button
            id="edit-quote-btn"
            className="btn btn--secondary btn--full"
            onClick={handleEditQuote}
          >
            ✏️ Edit Quote
          </button>
        </div>

        {/* Cost Breakdown */}
        <div className="card mb-md">
          <h3 className="section-title--sm mb-md">💰 Investment Summary</h3>
          <div className="flex flex-col gap-xs">
            {[
              ['Solar PV Modules', calc?.panelCost],
              ['Inverters', calc?.inverterCost],
              ['Mounting Structure', calc?.structureCost],
              ['Balance of System', calc?.bosCost],
              ['Civil Works', calc?.civilCost],
              ['Safety System', calc?.safetyCost],
              ['Installation & Commissioning', calc?.icCost],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between">
                <span className="text-secondary text-sm">{label}</span>
                <span className="text-sm">{formatINRFull(val || 0)}</span>
              </div>
            ))}
            <div className="divider mt-sm mb-sm" />
            <div className="flex justify-between">
              <span className="text-secondary text-sm">Total (excl. GST)</span>
              <span className="text-sm font-bold">{formatINRFull(calc?.totalExGST || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary text-sm">GST ({((calc?.gstRate || 0) * 100).toFixed(1)}%)</span>
              <span className="text-sm">{formatINRFull(calc?.gstAmount || 0)}</span>
            </div>
            <div className="flex justify-between" style={{ marginTop: '8px', padding: '10px', background: 'rgba(255,107,0,0.08)', borderRadius: '8px' }}>
              <span className="font-bold" style={{ color: 'var(--text-primary)' }}>Grand Total (incl. GST)</span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 800, color: 'var(--orange)' }}>
                {formatINRFull(calc?.grandTotal || 0)}/-
              </span>
            </div>
            {calc?.totalSubsidy > 0 && (
              <div className="flex justify-between" style={{ padding: '10px', background: 'rgba(34,197,94,0.06)', borderRadius: '8px', border: '1px solid rgba(34,197,94,0.2)' }}>
                <span className="font-bold" style={{ color: 'var(--text-primary)' }}>Net After Subsidies</span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 800, color: 'var(--green)' }}>
                  {formatINRFull(calc?.netCost || 0)}/-
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Financial Benefits */}
        <div className="card mb-md">
          <h3 className="section-title--sm mb-md">📈 Financial Benefits</h3>
          <div className="flex flex-col gap-sm">
            {[
              ['Annual Savings', `${formatINRFull(calc?.annualSavings_low || 0)} – ${formatINRFull(calc?.annualSavings_high || 0)} / yr`],
              ['Payback Period', `${calc?.payback_low?.toFixed(1)} – ${calc?.payback_high?.toFixed(1)} Years`],
              ['25-Year Savings', `${formatINRFull(calc?.savings25yr_low || 0)}+`],
              ['CO₂ Reduction', `~${calc?.co2PerYear_low || 0} – ${calc?.co2PerYear_high || 0} Tonnes/Year`],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between">
                <span className="text-secondary text-sm">{label}</span>
                <span className="text-sm font-bold text-green">{val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Milestones */}
        <div className="card mb-md">
          <h3 className="section-title--sm mb-md">💳 Payment Milestones</h3>
          {[
            ['Advance (30%)', formatINRFull(calc?.milestone1 || 0)],
            ['Material Readiness (40%)', formatINRFull(calc?.milestone2 || 0)],
            ['Mechanical Completion (20%)', formatINRFull(calc?.milestone3 || 0)],
            ['Final Commissioning (10%)', formatINRFull(calc?.milestone4 || 0)],
          ].map(([label, val]) => (
            <div key={label} className="flex justify-between" style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <span className="text-secondary text-sm">{label}</span>
              <span className="text-sm font-bold">{val}</span>
            </div>
          ))}
        </div>

        {/* Quote Info */}
        <div className="card mb-md">
          <h3 className="section-title--sm mb-md">📋 Quote Info</h3>
          <div className="flex flex-col gap-xs">
            {[
              ['Date', formatDate(quote.createdAt)],
              ['Valid Until', quote.validUntil],
              ['Project Type', quote.projectType],
              ['Module Brand', quote.moduleBrand],
              ['Inverter Brand', quote.inverterBrand],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between">
                <span className="text-secondary text-sm">{label}</span>
                <span className="text-sm">{val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Danger Zone */}
        <button
          id="delete-quote-btn"
          className="btn btn--ghost btn--full"
          onClick={handleDelete}
          style={{ borderColor: 'rgba(239,68,68,0.4)', color: 'var(--red)' }}
        >
          🗑️ Delete Quote
        </button>
      </div>

      {/* Status Menu Bottom Sheet */}
      {showStatusMenu && (
        <div className="modal-overlay" onClick={() => setShowStatusMenu(false)}>
          <div className="bottom-sheet" onClick={e => e.stopPropagation()}>
            <div className="bottom-sheet__handle"></div>
            <p className="bottom-sheet__title">Update Status</p>
            <div className="flex flex-col gap-sm">
              {Object.entries(statusConfig).map(([key, { label, cls }]) => (
                <button
                  key={key}
                  id={`status-${key}`}
                  className={`btn btn--secondary ${quote.status === key ? 'btn--ghost' : ''}`}
                  onClick={() => handleStatusChange(key)}
                  style={{ justifyContent: 'flex-start', gap: '12px' }}
                >
                  <span className={`pill ${cls}`}>{label}</span>
                  {quote.status === key && <span style={{ marginLeft: 'auto', color: 'var(--orange)' }}>← Current</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
