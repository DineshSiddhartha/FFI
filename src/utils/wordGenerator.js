import { formatDate } from './calculator';

// Helper for formatting Currency in exported Word Doc
const formatWordINR = (val, hasDash = false) => {
  if (!val && val !== 0) return '₹ —';
  const formatted = Math.round(val).toLocaleString('en-IN');
  return `₹ ${formatted}${hasDash ? '/-' : ''}`;
};

export function generateWordHTML(quote, business, base64HeaderStr) {
  const { calc, draft: q } = quote;
  const customerName = quote.customerName || q?.customerName || '';
  const quoteNo = quote.quoteNo || q?.quoteNo || '';
  const date = quote.date || q?.date || '';
  const validUntil = quote.validUntil || q?.validUntil || '';
  const systemKw = quote.systemKw || q?.systemKw || 0;
  const customerLocation = quote.customerLocation || q?.customerLocation || '';
  const customerState = quote.customerState || q?.customerState || '';
  const projectType = quote.projectType || q?.projectType || 'commercial';
  const moduleBrand = quote.moduleBrand || q?.moduleBrand || '';
  const inverterBrand = quote.inverterBrand || q?.inverterBrand || '';
  const panelWattage = quote.panelWattage || 550;
  const numPanels = calc.numPanels;

  // Determine inverter configuration matching sample
  let inverterConfig = '';
  if (systemKw >= 100) {
    const numInv = Math.ceil(systemKw / 125);
    inverterConfig = `${numInv} × ${Math.round(systemKw / numInv)} KW Grid-Tied String Inverters`;
  } else {
    inverterConfig = `${systemKw} KW Grid-Tied String Inverter`;
  }

  // Pre-compiled header block to ensure pixel-perfect alignment and scaling in MS Word
  const headerHtml = `
    <div style="text-align: center; width: 100%; margin-bottom: 10px;">
      ${base64HeaderStr ? `<img src="${base64HeaderStr}" style="width: 7.07in; max-width: 100%; height: auto;" width="678" />` : ''}
      <div style="border-bottom: 2px solid #4B3F72; margin-top: 5px; margin-bottom: 15px;"></div>
    </div>
  `;

  return `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
    <meta charset="utf-8">
    <title>Solar Quotation - ${customerName} - ${quoteNo}</title>
    <!--[if gte mso 9]>
    <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
    </w:WordDocument>
    </xml>
    <![endif]-->
    <style>
      @page {
        size: 8.27in 11.69in; /* A4 size */
        margin: 0.8in 0.6in 0.8in 0.6in;
      }
      body {
        font-family: 'Segoe UI', Arial, sans-serif;
        font-size: 9.5pt;
        color: #222222;
        line-height: 1.4;
      }
      h1 {
        font-size: 15pt;
        font-family: 'Segoe UI', Arial, sans-serif;
        font-weight: bold;
        color: #1E5631;
        text-align: center;
        margin-top: 15px;
        margin-bottom: 5px;
        letter-spacing: 2px;
      }
      .title-sub {
        font-size: 10pt;
        color: #555555;
        text-align: center;
        margin-bottom: 20px;
      }
      .meta-box {
        width: 100%;
        border: 1.5px solid #1E5631;
        border-collapse: collapse;
        margin-top: 15px;
        margin-bottom: 20px;
      }
      .meta-box td {
        padding: 10px;
        vertical-align: top;
        font-size: 9pt;
      }
      .meta-title {
        font-weight: bold;
        color: #1E5631;
        font-size: 9pt;
        margin-bottom: 5px;
        text-transform: uppercase;
      }
      .meta-val-name {
        font-size: 10.5pt;
        font-weight: bold;
        color: #222222;
      }
      .brand-card {
        text-align: center;
        margin-top: 20px;
        margin-bottom: 20px;
      }
      .brand-card-title {
        font-size: 10pt;
        font-weight: bold;
        color: #1E5631;
      }
      .brand-card-text {
        font-size: 9pt;
        color: #444444;
      }
      .brand-card-meta {
        font-size: 8pt;
        color: #777777;
        font-style: italic;
        margin-top: 3px;
      }
      h2 {
        font-size: 11pt;
        font-family: 'Segoe UI', Arial, sans-serif;
        font-weight: bold;
        color: #111111;
        margin-top: 20px;
        margin-bottom: 10px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      h3 {
        font-size: 10pt;
        font-family: 'Segoe UI', Arial, sans-serif;
        font-weight: bold;
        color: #222222;
        margin-top: 15px;
        margin-bottom: 8px;
      }
      table.data-table {
        width: 100%;
        border-collapse: collapse;
        border: 1px solid #CCCCCC;
        margin-bottom: 10px;
      }
      table.data-table th {
        background-color: #F5F5F5;
        border: 1px solid #CCCCCC;
        padding: 6px 8px;
        font-size: 9pt;
        font-weight: bold;
        color: #111111;
        text-align: left;
      }
      table.data-table td {
        border: 1px solid #E0E0E0;
        padding: 6px 8px;
        font-size: 9pt;
        color: #333333;
        vertical-align: top;
      }
      table.data-table tr.alt {
        background-color: #FAF9F6;
      }
      .text-bold {
        font-weight: bold;
      }
      .text-right {
        text-align: right;
      }
      .text-center {
        text-align: center;
      }
      .note {
        font-size: 8pt;
        color: #666666;
        font-style: italic;
        margin-top: 5px;
        line-height: 1.3;
      }
      .page-break {
        page-break-before: always;
        clear: both;
      }
      ul, ol {
        margin-top: 5px;
        margin-bottom: 10px;
        padding-left: 20px;
      }
      li {
        font-size: 9pt;
        color: #333333;
        margin-bottom: 5px;
        line-height: 1.4;
      }
      .footer-section {
        border-top: 1px solid #4B3F72;
        margin-top: 30px;
        padding-top: 5px;
        text-align: center;
      }
      .footer-address {
        font-size: 8.5pt;
        font-weight: bold;
        color: #9D814A;
        letter-spacing: 0.5px;
      }
      .footer-phone {
        font-size: 10pt;
        font-weight: bold;
        color: #9D814A;
        margin-top: 2px;
      }
      .signature-table {
        width: 100%;
        border-collapse: collapse;
        border: none;
        margin-top: 25px;
      }
      .signature-table td {
        border: none;
        padding: 10px;
        vertical-align: top;
        font-size: 9pt;
      }
    </style>
    </head>
    <body>

      <!-- ==================== PAGE 1 ==================== -->
      ${headerHtml}

      <h1>QUOTATION</h1>
      <div class="title-sub">FOR ${systemKw} KW GRID-TIED SOLAR POWER SYSTEM<br/>Turnkey Supply, Installation & Commissioning</div>

      <table class="meta-box">
        <tr>
          <td style="width: 50%; border-right: 1.5px solid #1E5631;">
            <div class="meta-title">SUBMITTED TO</div>
            <div class="meta-val-name">${customerName.toUpperCase()}</div>
            <div style="margin-top: 5px;">${customerLocation}, ${customerState}</div>
          </td>
          <td style="width: 50%;">
            <div class="meta-title">QUOTATION DETAILS</div>
            <div><span class="text-bold">Quote No.:</span> ${quoteNo}</div>
            <div><span class="text-bold">Date:</span> ${date}</div>
            <div><span class="text-bold">Valid Until:</span> ${validUntil}</div>
            <div><span class="text-bold">System Capacity:</span> ${systemKw} KW (Grid-Tied)</div>
            <div><span class="text-bold">Prepared by:</span> AVION GREEN ASTRA SOLAR ENERGIES</div>
          </td>
        </tr>
      </table>

      <div class="brand-card">
        <div class="brand-card-title">Avion Green Astra Solar Energies</div>
        <div class="brand-card-text">Gollapudi, Vijayawada – 521225 | Andhra Pradesh</div>
        <div class="brand-card-text">8143562666 | abhinav@avion.solar | www.aviongreenastra.com</div>
        <div class="brand-card-meta">Quote No.: ${quoteNo} | Confidential</div>
      </div>

      <!-- Disclaimer Banner -->
      <div style="border: 2px solid #B91C1C; background-color: #FFF5F5; padding: 10px 14px; margin: 14px 0; border-radius: 3px; text-align: center;">
        <div style="font-size: 9pt; font-weight: bold; color: #B91C1C; letter-spacing: 0.5px; margin-bottom: 5px;">
          ⚠ FOR DEMONSTRATION PURPOSES ONLY — STRICTLY CONFIDENTIAL
        </div>
        <div style="font-size: 8pt; color: #7F1D1D; line-height: 1.5;">
          This document has been prepared solely for demonstration and evaluation purposes. It is strictly confidential and the exclusive property of Avion Green Astra Solar Energies. Any reproduction, distribution, disclosure, or use of this document — in whole or in part — for any purpose other than the intended evaluation, without prior written consent, is strictly prohibited and may result in severe legal consequences.
        </div>
      </div>

      <h2>1. SYSTEM OVERVIEW &amp; QUICK SUMMARY</h2>
      <p>This quotation has been prepared by Avion Green Astra Solar Energies for the complete turnkey supply, installation of a ${systemKw} KW grid-tied solar photovoltaic power system at the above-mentioned project site. The system utilises high-efficiency Bifacial solar panels with a ${systemKw >= 100 ? `${Math.ceil(systemKw/125)}-unit ${Math.round(systemKw/Math.ceil(systemKw/125))} KW` : 'single'} inverter configuration to deliver optimum energy output and long-term reliability.</p>

      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 45%;">PARAMETER</th>
            <th style="width: 55%;">SPECIFICATION</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>System Capacity</td><td class="text-bold">${systemKw} KW (Grid-Tied Solar PV)</td></tr>
          <tr class="alt"><td>Module Technology</td><td class="text-bold">High-Efficiency Bifacial</td></tr>
          <tr><td>Inverter Configuration</td><td class="text-bold">${inverterConfig}</td></tr>
          <tr class="alt"><td>Mounting Structure</td><td class="text-bold">Hot-Dip Galvanized (HDG) Fixed Tilt</td></tr>
          <tr><td>Daily Generation (Estimated)</td><td class="text-bold">${calc.dailyGen_low.toLocaleString('en-IN')} – ${calc.dailyGen_high.toLocaleString('en-IN')} Units (kWh)</td></tr>
          <tr class="alt"><td>Monthly Generation (Est.)</td><td class="text-bold">${calc.monthlyGen_low.toLocaleString('en-IN')} – ${calc.monthlyGen_high.toLocaleString('en-IN')} Units (kWh)</td></tr>
          <tr><td>Annual Generation (Est.)</td><td class="text-bold">${calc.annualGen_low.toLocaleString('en-IN')} – ${calc.annualGen_high.toLocaleString('en-IN')} Units (kWh)</td></tr>
          <tr class="alt"><td>Quotation Total (Incl. GST)</td><td class="text-bold" style="color: #1E5631;">${formatWordINR(calc.grandTotal, true)}</td></tr>
          <tr><td>Quotation Validity</td><td class="text-bold">30 Days from Quotation Date</td></tr>
          <tr class="alt"><td>Execution Timeline</td><td class="text-bold">8 – 12 Weeks from PO / Advance</td></tr>
        </tbody>
      </table>
      <div class="note">Generation estimates are based on standard solar irradiation data for the project location. Actual yield may vary depending on site irradiation, shading, module orientation, temperature, and grid availability.</div>

      <div class="footer-section">
        <div class="footer-address">N.TR. CIRCLE, GOLLAPUDI, VIJAYAWADA, NTR Dist., AP – 521225</div>
        <div class="footer-phone">9676 441 999 &nbsp;|&nbsp; Page 1</div>
      </div>

      <br class="page-break" />

      <!-- ==================== PAGE 2 ==================== -->
      ${headerHtml}

      <h2>2. TECHNICAL SPECIFICATIONS — BILL OF MATERIALS</h2>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 6%;">SL</th>
            <th style="width: 24%;">COMPONENT</th>
            <th style="width: 44%;">DESCRIPTION / SPECIFICATIONS</th>
            <th style="width: 13%;">QTY</th>
            <th style="width: 13%;">MAKE / BRAND</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1</td>
            <td class="text-bold">Solar PV Modules</td>
            <td>High-Efficiency TOPCon Module Efficiency: &ge; 21% Power Tolerance: 0/+5W PID Resistant, IEC 61215 / IEC 61730 Certified</td>
            <td>${numPanels} Panels (${panelWattage}W each)</td>
            <td>${moduleBrand}</td>
          </tr>
          <tr class="alt">
            <td>2</td>
            <td class="text-bold">Solar Inverter</td>
            <td>Grid-Tied String Inverter, 3-Phase Efficiency: &ge; 98.4% multi-MPPT, IP65, Anti-Islanding Protection RS485/Modbus Communication</td>
            <td>${inverterConfig}</td>
            <td>${inverterBrand}</td>
          </tr>
          <tr>
            <td>3</td>
            <td class="text-bold">Mounting Structure</td>
            <td>Hot-Dip Galvanized (HDG) Fixed Tilt Structure Galvanization: &ge; 85 µm Design Wind Speed: &ge; 150 km/h IS 2062 Steel</td>
            <td>1 Set (Full plant)</td>
            <td>JSW-Sarvotham / Reputed Make</td>
          </tr>
          <tr class="alt">
            <td>4</td>
            <td class="text-bold">Balance of System</td>
            <td>DC/AC Cables: Cu UV-Resistant/Armoured MC4 Connectors: IP68 DCDB: IP65 with SPD & Isolation ACDB/MDB: MCCB, SPD, meters</td>
            <td>1 Complete Set</td>
            <td>Polycab / Finolex / RR Kabel</td>
          </tr>
          <tr>
            <td>5</td>
            <td class="text-bold">Civil Works</td>
            <td>Structure foundation / pedestal civil works Cable duct / trench excavation and backfilling Site finishing</td>
            <td>As per design</td>
            <td>—</td>
          </tr>
          <tr class="alt">
            <td>6</td>
            <td class="text-bold">Safety System</td>
            <td>Lightning Arrestor: ESE Type with Down Conductor Chemical Earthing: &ge; 3 Earth Pits with Copper Rods IS 3043 Compliant</td>
            <td>1 Complete Set</td>
            <td>Reputed Make</td>
          </tr>
        </tbody>
      </table>
      <div class="note">The above BOM is indicative. Final specifications, module wattage, and quantities are subject to revision after detailed site survey and system design.</div>

      <h2>3. ESTIMATED ENERGY GENERATION</h2>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 25%;">PERIOD</th>
            <th style="width: 37%;">ESTIMATED GENERATION (kWh)</th>
            <th style="width: 38%;">EQUIVALENT UNITS (Approx.)</th>
          </tr>
        </thead>
        <tbody>
          <tr><td class="text-bold">Daily</td><td>${calc.dailyGen_low.toLocaleString('en-IN')} – ${calc.dailyGen_high.toLocaleString('en-IN')} kWh</td><td>${calc.dailyGen_low.toLocaleString('en-IN')} – ${calc.dailyGen_high.toLocaleString('en-IN')} Units</td></tr>
          <tr class="alt"><td class="text-bold">Monthly</td><td>${calc.monthlyGen_low.toLocaleString('en-IN')} – ${calc.monthlyGen_high.toLocaleString('en-IN')} kWh</td><td>${calc.monthlyGen_low.toLocaleString('en-IN')} – ${calc.monthlyGen_high.toLocaleString('en-IN')} Units</td></tr>
          <tr><td class="text-bold">Annual</td><td>${calc.annualGen_low.toLocaleString('en-IN')} – ${calc.annualGen_high.toLocaleString('en-IN')} kWh</td><td>${(calc.annualGen_low / 100000).toFixed(2)} – ${(calc.annualGen_high / 100000).toFixed(2)} Lakh Units</td></tr>
          <tr class="alt"><td class="text-bold">25-Year (Estimated)</td><td>${(calc.gen25yr_low / 10000000).toFixed(2)} – ${(calc.gen25yr_high / 10000000).toFixed(2)} Crore kWh</td><td>Subject to annual 0.5% TOPCon degradation</td></tr>
        </tbody>
      </table>

      <div class="footer-section">
        <div class="footer-address">N.TR. CIRCLE, GOLLAPUDI, VIJAYAWADA, NTR Dist., AP – 521225</div>
        <div class="footer-phone">9676 441 999 &nbsp;|&nbsp; Page 2</div>
      </div>

      <br class="page-break" />

      <!-- ==================== PAGE 3 ==================== -->
      ${headerHtml}

      <h2>Key Generation Assumptions</h2>
      <ul>
        <li>Solar irradiation data based on MNRE / NASA-PVGIS data for the project location.</li>
        <li>Performance Ratio (PR): ~0.78 (accounting for cable losses, soiling, temperature, and inverter losses).</li>
        <li>TOPCon module annual degradation: 0.5% per year (Year 1: 1%, thereafter 0.5%).</li>
        <li>Plant availability: 98% (subject to utility grid uptime).</li>
        <li>Actual generation may vary based on site-specific shading, dust accumulation, and local weather patterns.</li>
      </ul>

      <h2>4. INVESTMENT SUMMARY & COST BREAKUP</h2>
      <h3>4.1 Component-Wise Cost Breakup</h3>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 8%;">SL</th>
            <th style="width: 62%;">DESCRIPTION</th>
            <th style="width: 30%; text-align: right;">ESTIMATED AMOUNT (₹)</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>1</td><td>Solar PV Modules — ${systemKw} KW TOPCon (Supply)</td><td class="text-right text-bold">${formatWordINR(calc.panelCost)}</td></tr>
          <tr class="alt"><td>2</td><td>Inverters — ${inverterConfig}</td><td class="text-right text-bold">${formatWordINR(calc.inverterCost)}</td></tr>
          <tr><td>3</td><td>Module Mounting Structures (HDG Fixed Tilt)</td><td class="text-right text-bold">${formatWordINR(calc.structureCost)}</td></tr>
          <tr class="alt"><td>4</td><td>Balance of System — DC/AC Cables, MC4, DCDB, ACDB</td><td class="text-right text-bold">${formatWordINR(calc.bosCost)}</td></tr>
          <tr><td>5</td><td>Civil Works — Foundations, Cable Trenching, Site Finishing</td><td class="text-right text-bold">${formatWordINR(calc.civilCost)}</td></tr>
          <tr class="alt"><td>6</td><td>Safety System — Lightning Arrestor & Chemical Earthing</td><td class="text-right text-bold">${formatWordINR(calc.safetyCost)}</td></tr>
          <tr><td>7</td><td>Installation, Testing & Commissioning (I&C)</td><td class="text-right text-bold">${formatWordINR(calc.icCost)}</td></tr>
          <tr style="background-color: #F5F5F5; font-weight: bold;">
            <td></td><td>TOTAL — Excluding GST</td><td class="text-right">${formatWordINR(calc.totalExGST)}</td></tr>
          <tr style="background-color: #FAF9F6;">
            <td></td><td>GST (Approx. @ ${(calc.gstRate * 100).toFixed(1)}% Effective Rate)</td><td class="text-right">${formatWordINR(calc.gstAmount)}</td></tr>
          <tr style="background-color: #FAF9F6; border-top: 1.5px solid #1E5631; border-bottom: 1.5px solid #1E5631; font-weight: bold; color: #1E5631;">
            <td></td><td>GRAND TOTAL — GST Inclusive</td><td class="text-right">${formatWordINR(calc.grandTotal, true)}</td>
          </tr>
        </tbody>
      </table>
      <div class="note">GST applicable as per prevailing statutory rates on supply of goods and services. The above effective GST rate is indicative; actual tax breakup will be as per applicable HSN/SAC codes on the final invoice. Prices include supply, freight, insurance, installation, and commissioning.</div>

      <h3>4.2 Financial Benefits Summary</h3>
      <table class="data-table">
        <tbody>
          <tr><td style="width: 55%;">Total Investment (Incl. GST)</td><td class="text-right text-bold" style="width: 45%;">${formatWordINR(calc.grandTotal, true)}</td></tr>
          <tr class="alt"><td>Assumed Tariff / Avoided Cost</td><td class="text-right text-bold">₹ ${calc.tariffPerUnit.toFixed(2)} / kWh (Industrial)</td></tr>
          <tr><td>Estimated Annual Savings</td><td class="text-right text-bold">${formatWordINR(calc.annualSavings_low)} – ${formatWordINR(calc.annualSavings_high)} / Year</td></tr>
          <tr class="alt"><td>Simple Payback Period</td><td class="text-right text-bold">~${calc.payback_low.toFixed(1)} – ${calc.payback_high.toFixed(1)} Years</td></tr>
          <tr><td>25-Year Cumulative Savings (Est.)</td><td class="text-right text-bold">${formatWordINR(calc.savings25yr_low)} – ${formatWordINR(calc.savings25yr_high)} (without escalation)</td></tr>
          <tr class="alt"><td>CO₂ Emission Reduction</td><td class="text-right text-bold">~${calc.co2PerYear_low} – ${calc.co2PerYear_high} Tonnes per Annum</td></tr>
          <tr><td>Plant Expected Life</td><td class="text-right text-bold">25+ Years</td></tr>
        </tbody>
      </table>

      <div class="footer-section">
        <div class="footer-address">N.TR. CIRCLE, GOLLAPUDI, VIJAYAWADA, NTR Dist., AP – 521225</div>
        <div class="footer-phone">9676 441 999 &nbsp;|&nbsp; Page 3</div>
      </div>

      <br class="page-break" />

      <!-- ==================== PAGE 4 ==================== -->
      ${headerHtml}

      <h2>5. WARRANTY</h2>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 25%;">COMPONENT</th>
            <th style="width: 25%;">WARRANTY TYPE</th>
            <th style="width: 15%;">PERIOD</th>
            <th style="width: 35%;">COVERAGE</th>
          </tr>
        </thead>
        <tbody>
          <tr><td class="text-bold">Solar PV Modules</td><td>Performance Warranty (Linear)</td><td>25 – 30 Years</td><td>&ge; 90% output at Year 10; &ge; 85% at Year 25/30</td></tr>
          <tr class="alt"><td class="text-bold">Solar PV Modules</td><td>Product / Manufacturer Warranty</td><td>12 – 15 Years</td><td>Replacement of defective modules at no cost</td></tr>
          <tr><td class="text-bold">Solar Inverter</td><td>Product Warranty</td><td>8 Years (Standard)</td><td>Repair / replacement within warranty period</td></tr>
          <tr class="alt"><td class="text-bold">Workmanship</td><td>Comprehensive Service Support</td><td>5 Years</td><td>Free rectification of installation-related defects</td></tr>
          <tr><td class="text-bold">Overall Plant</td><td>Defect Liability Period (DLP)</td><td>12 Months</td><td>Free rectification of all workmanship defects</td></tr>
        </tbody>
      </table>

      <h2>6. SCOPE OF WORK</h2>
      <h3>Included in This Quotation</h3>
      <ul>
        <li>Detailed site survey, shadow analysis, and system design layout.</li>
        <li>Supply of all major equipment and materials as per approved BOM (Section 2).</li>
        <li>Civil foundation works for module mounting structures.</li>
        <li>Cable trench/duct excavation and backfilling.</li>
        <li>Erection of HDG Module Mounting Structures (MMS) and installation of solar panels.</li>
        <li>DC cabling — string combiner boxes / DCDB to inverter input.</li>
        <li>AC cabling — inverter output to ACDB / Main LT Panel interface.</li>
        <li>Installation, testing, and commissioning of all string inverters.</li>
        <li>Earthing and bonding of all module frames, MMS, and inverter enclosures.</li>
        <li>Installation of Lightning Arresting System and SPDs.</li>
        <li>Net metering / grid synchronization support documentation (DISCOM application assistance).</li>
        <li>Pre-commissioning tests — IR test, Voc/Isc, polarity check, earth resistance test.</li>
        <li>Handover of as-built drawings, test reports, and equipment warranty cards.</li>
      </ul>

      <h3>Exclusions (Client's Scope)</h3>
      <ul style="list-style-type: circle;">
        <li>3-phase LT power supply for construction activities during installation.</li>
        <li>Internet / broadband connectivity for remote plant monitoring (if applicable).</li>
        <li>DISCOM net metering security deposits and utility grid connection charges.</li>
        <li>Civil strengthening of existing roof / structure if found inadequate.</li>
        <li>Any statutory charges imposed by local authorities beyond those listed in scope.</li>
        <li>Fire-fighting equipment (client's responsibility under applicable regulations).</li>
      </ul>

      <div class="footer-section">
        <div class="footer-address">N.TR. CIRCLE, GOLLAPUDI, VIJAYAWADA, NTR Dist., AP – 521225</div>
        <div class="footer-phone">9676 441 999 &nbsp;|&nbsp; Page 4</div>
      </div>

      <br class="page-break" />

      <!-- ==================== PAGE 5 ==================== -->
      ${headerHtml}

      <h2>7. PAYMENT TERMS</h2>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 8%;">SL</th>
            <th style="width: 50%;">MILESTONE</th>
            <th style="width: 17%; text-align: center;">PAYMENT (%)</th>
            <th style="width: 25%; text-align: right;">AMOUNT (₹)</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>1</td><td class="text-bold">Advance with Purchase Order / Agreement</td><td class="text-center" style="color: #1E5631; font-weight: bold;">30%</td><td class="text-right text-bold">${formatWordINR(calc.milestone1)}</td></tr>
          <tr class="alt"><td>2</td><td class="text-bold">Material Readiness — Prior to Dispatch of Modules & Inverters</td><td class="text-center" style="color: #1E5631; font-weight: bold;">40%</td><td class="text-right text-bold">${formatWordINR(calc.milestone2)}</td></tr>
          <tr><td>3</td><td class="text-bold">Mechanical Completion (MMS + Module Mounting + DC Wiring)</td><td class="text-center" style="color: #1E5631; font-weight: bold;">20%</td><td class="text-right text-bold">${formatWordINR(calc.milestone3)}</td></tr>
          <tr class="alt"><td>4</td><td class="text-bold">Final Commissioning, Grid Synchronization & Handover</td><td class="text-center" style="color: #1E5631; font-weight: bold;">10%</td><td class="text-right text-bold">${formatWordINR(calc.milestone4)}</td></tr>
          <tr style="background-color: #FFFFFF; border-top: 1.5px solid #CCCCCC; border-bottom: 1.5px solid #CCCCCC; font-weight: bold;">
            <td></td><td>TOTAL</td><td class="text-center" style="color: #1E5631;">100%</td><td class="text-right">${formatWordINR(calc.grandTotal, true)}</td>
          </tr>
        </tbody>
      </table>

      <h2>8. TERMS & CONDITIONS</h2>
      <ol style="padding-left: 15px; margin-left: 0;">
        <li style="margin-bottom: 6px;"><span class="text-bold">8.1 Quotation Validity:</span> This quotation is valid for 30 (thirty) calendar days from the date of issue. Post expiry, prices are subject to revision. Extension possible upon mutual written agreement.</li>
        <li style="margin-bottom: 6px;"><span class="text-bold">8.2 Taxes & Duties:</span> All prices are inclusive of GST as indicated. Any new or enhanced levies or duties imposed by Government authorities after the date of this quotation shall be to the client's account.</li>
        <li style="margin-bottom: 6px;"><span class="text-bold">8.3 Delivery & Execution Timeline:</span> Total execution time is estimated at 8 – 12 weeks from receipt of advance payment and signed PO. Timeline is subject to site readiness, material availability, and DISCOM coordination.</li>
        <li style="margin-bottom: 6px;"><span class="text-bold">8.4 Site Readiness:</span> The client shall ensure site access, civil clearances, and 3-phase power availability for construction prior to AGASE mobilization. Delays caused by site unreadiness shall not be attributed to AGASE.</li>
        <li style="margin-bottom: 6px;"><span class="text-bold">8.5 Design Finalization:</span> The final system design, module wattage, string configuration, and BOM shall be confirmed after a detailed site survey and shadow analysis. This quotation is based on preliminary assumptions.</li>
        <li style="margin-bottom: 6px;"><span class="text-bold">8.6 Force Majeure:</span> Neither party shall be liable for delay or failure arising from acts of God, natural disasters, floods, government actions, or other extraordinary circumstances beyond reasonable control.</li>
        <li style="margin-bottom: 6px;"><span class="text-bold">8.7 Dispute Resolution:</span> This quotation and any resultant contract shall be governed by the laws of India. Disputes shall first be resolved by mutual negotiation. Failing resolution, disputes shall be referred to arbitration under the Arbitration and Conciliation Act, 1996. Jurisdiction: Vijayawada.</li>
        <li style="margin-bottom: 6px;"><span class="text-bold">8.8 Confidentiality:</span> This quotation is confidential and submitted solely for evaluation. It shall not be reproduced, shared, or disclosed to any third party without prior written consent of Avion Green Astra Solar Energies.</li>
      </ol>

      <div class="footer-section">
        <div class="footer-address">N.TR. CIRCLE, GOLLAPUDI, VIJAYAWADA, NTR Dist., AP – 521225</div>
        <div class="footer-phone">9676 441 999 &nbsp;|&nbsp; Page 5</div>
      </div>

      <br class="page-break" />

      <!-- ==================== PAGE 6 ==================== -->
      ${headerHtml}

      <h2 style="font-size: 13pt; text-align: center; margin-top: 15px; margin-bottom: 25px;">Acceptance & Authorized Signatories</h2>

      <table class="signature-table">
        <tr>
          <td style="width: 50%; padding-right: 15px;">
            <div style="font-size: 9.5pt; font-weight: bold; color: #0B3C85; margin-bottom: 10px;">For M/s.Avion Green Astra Solar Energies</div>
            <div style="margin-top: 10px; margin-bottom: 10px; height: 35px;">
              <!-- Embedded blue ink vector signature -->
              <svg width="110" height="35" viewBox="0 0 120 35">
                <path d="M15 24 C10 18, 12 8, 18 10 C24 12, 18 28, 26 22 C28 20, 32 12, 35 24 C38 18, 42 16, 44 24 C46 22, 48 18, 54 12 C60 12, 65 18, 70 19 C80 20, 90 15, 100 17" fill="none" stroke="#0B3C85" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
            <div style="font-size: 9pt; font-weight: bold; color: #333333; margin-top: 5px;">[GADIPARTHI SRINIVASARAO]</div>
            <div style="font-size: 8pt; color: #666666;">[Managing Partner]</div>
            <div style="font-size: 8pt; color: #666666; margin-top: 4px;">Date: ${date}</div>
          </td>
          <td style="width: 50%; padding-left: 15px; border-left: 1px solid #CCCCCC;">
            <div style="font-size: 9.5pt; font-weight: bold; color: #333333; margin-bottom: 40px;">ACCEPTED BY CLIENT</div>
            <div style="border-bottom: 1px solid #CCCCCC; width: 100%; margin-bottom: 5px;"></div>
            <div style="font-size: 9pt; font-weight: bold; color: #333333;">[Authorized Signatory — Client]</div>
            <div style="font-size: 8pt; color: #666666;">[Designation]</div>
            <div style="font-size: 8pt; color: #666666; margin-top: 4px;">Date: ____________________</div>
          </td>
        </tr>
      </table>

      <div class="brand-card" style="margin-top: 70px; border-top: 1px solid #E0E0E0; padding-top: 15px;">
        <div class="brand-card-title">Avion Green Astra Solar Energies</div>
        <div class="brand-card-text">Gollapudi, Vijayawada – 521225 | Andhra Pradesh</div>
        <div class="brand-card-text">8143562666 | abhinav@avion.solar | www.aviongreenastra.com</div>
        <div class="brand-card-meta">Quote No.: ${quoteNo} | Confidential</div>
      </div>

      <div class="footer-section">
        <div class="footer-address">N.TR. CIRCLE, GOLLAPUDI, VIJAYAWADA, NTR Dist., AP – 521225</div>
        <div class="footer-phone">9676 441 999 &nbsp;|&nbsp; Page 6</div>
      </div>

    </body>
    </html>
  `;
}
