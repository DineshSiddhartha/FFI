import React from 'react';
import {
  Document, Page, Text, View, StyleSheet, Svg, Path, pdf, Image
} from '@react-pdf/renderer';
import { formatDate } from '../utils/calculator';

// Exact Avion Green Astra Solar color scheme and layout styles
const S = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 8.5,
    color: '#222222',
    backgroundColor: '#FFFFFF',
    paddingTop: 30,
    paddingBottom: 75, // space for fixed footer
    paddingHorizontal: 36,
  },
  // Top Header (repeated on pages)
  headerContainer: {
    borderBottom: '1.5 solid #4B3F72',
    paddingBottom: 4,
    marginBottom: 14,
  },
  headerImage: {
    width: '100%',
  },
  // Page Title (Page 1)
  titleBlock: {
    alignItems: 'center',
    marginVertical: 12,
  },
  titleQuotation: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#1E5631',
    letterSpacing: 2.5,
  },
  titleFor: {
    fontSize: 9,
    color: '#555555',
    marginVertical: 3,
  },
  titleSystem: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#111111',
    textTransform: 'uppercase',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  titleSub: {
    fontSize: 8,
    color: '#666666',
    marginTop: 3,
  },
  // Metadata Box (Page 1)
  metaBox: {
    border: '1 solid #1E5631',
    flexDirection: 'row',
    marginVertical: 12,
  },
  metaColLeft: {
    flex: 1,
    padding: 10,
    borderRight: '1 solid #1E5631',
  },
  metaColRight: {
    flex: 1,
    padding: 10,
  },
  metaTitle: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#1E5631',
    marginBottom: 4.5,
  },
  metaText: {
    fontSize: 8,
    color: '#222222',
    lineHeight: 1.4,
  },
  metaTextBold: {
    fontFamily: 'Helvetica-Bold',
  },
  // Sub-header Card (Page 1 & 6)
  subCard: {
    alignItems: 'center',
    marginVertical: 6,
  },
  subCardTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#1E5631',
    marginBottom: 2.5,
  },
  subCardText: {
    fontSize: 8,
    color: '#444444',
    marginBottom: 2,
  },
  subCardMeta: {
    fontSize: 7.5,
    color: '#777777',
    fontStyle: 'italic',
    marginTop: 1.5,
  },
  // Sections
  section: {
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 9.5,
    fontFamily: 'Helvetica-Bold',
    color: '#111111',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  sectionSubTitle: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: '#222222',
    marginTop: 8,
    marginBottom: 6,
  },
  bodyText: {
    fontSize: 8,
    color: '#333333',
    lineHeight: 1.4,
    marginBottom: 8,
  },
  // Table styling
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    border: '0.5 solid #CCCCCC',
    marginBottom: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderBottom: '1 solid #CCCCCC',
  },
  tableHeaderCell: {
    fontSize: 7.8,
    fontFamily: 'Helvetica-Bold',
    color: '#111111',
    padding: '5 7',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '0.5 solid #E0E0E0',
  },
  tableRowAlt: {
    backgroundColor: '#FAF9F6',
  },
  tableCell: {
    fontSize: 7.8,
    color: '#333333',
    padding: '5 7',
  },
  tableCellBold: {
    fontSize: 7.8,
    fontFamily: 'Helvetica-Bold',
    color: '#111111',
    padding: '5 7',
  },
  // Total row
  totalRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottom: '0.5 solid #CCCCCC',
    borderTop: '1 solid #CCCCCC',
  },
  // Grand total row
  grandTotalRow: {
    flexDirection: 'row',
    backgroundColor: '#FAF9F6',
    borderTop: '1 solid #1E5631',
    borderBottom: '1 solid #1E5631',
  },
  // Footer (Repeated)
  footerContainer: {
    position: 'absolute',
    bottom: 20,
    left: 36,
    right: 36,
    alignItems: 'center',
  },
  footerLine: {
    width: '100%',
    borderTop: '1 solid #4B3F72',
    marginBottom: 5,
  },
  footerAddress: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: '#9D814A',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  footerPhone: {
    fontSize: 9.5,
    fontFamily: 'Helvetica-Bold',
    color: '#9D814A',
    textAlign: 'center',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  pageNumber: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    fontSize: 7.5,
    color: '#888888',
  },
  note: {
    fontSize: 7.2,
    color: '#666666',
    fontStyle: 'italic',
    marginTop: 4,
    lineHeight: 1.25,
  },
  bulletList: {
    marginLeft: 4,
    marginBottom: 8,
  },
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 3.5,
    alignItems: 'flex-start',
  },
  bulletDot: {
    fontSize: 8,
    color: '#1E5631',
    marginRight: 6,
  },
  bulletDotOpen: {
    fontSize: 8,
    color: '#999999',
    marginRight: 6,
  },
  bulletText: {
    fontSize: 7.8,
    color: '#333333',
    flex: 1,
    lineHeight: 1.35,
  },
});

// Stylized Green & Gold vector logo
const LogoSvg = () => (
  <Svg width={52} height={52} viewBox="0 0 100 100">
    <Path
      d="M25 80 C20 60, 35 30, 50 15 C55 25, 45 55, 35 80 Z"
      fill="#1E5631"
    />
    <Path
      d="M75 80 C80 60, 65 30, 50 15 C45 25, 55 55, 65 80 Z"
      fill="#9D814A"
    />
    <Path
      d="M38 52 C45 50, 55 50, 62 52 C58 58, 42 58, 38 52 Z"
      fill="#9D814A"
    />
  </Svg>
);

// Stylized blue ink signature vector
const SignatureSvg = () => (
  <Svg width={110} height={35} viewBox="0 0 120 35">
    <Path
      d="M15 24 C10 18, 12 8, 18 10 C24 12, 18 28, 26 22 C28 20, 32 12, 35 24 C38 18, 42 16, 44 24 C46 22, 48 18, 54 12 C60 12, 65 18, 70 19 C80 20, 90 15, 100 17"
      fill="none"
      stroke="#0B3C85"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Standardized Page Header component
const PageHeader = () => (
  <View style={S.headerContainer} fixed>
    <Image src="/header.png" style={S.headerImage} />
  </View>
);

// Standardized Page Footer component
const PageFooter = ({ pageNum }) => (
  <View style={S.footerContainer} fixed>
    <View style={S.footerLine} />
    <Text style={S.footerAddress}>N.TR. CIRCLE, GOLLAPUDI, VIJAYAWADA, NTR Dist., AP – 521225</Text>
    <Text style={S.footerPhone}>9676 441 999</Text>
    <Text style={S.pageNumber}>{pageNum}</Text>
  </View>
);

// Helper for formatting Currency exactly as desired in final PDF
const formatPDFINR = (val, hasDash = false) => {
  if (!val && val !== 0) return '₹ —';
  const formatted = Math.round(val).toLocaleString('en-IN');
  return `₹ ${formatted}${hasDash ? '/-' : ''}`;
};

function QuotePDF({ quote, business }) {
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

  return (
    <Document title={`Solar Quotation - ${customerName} - ${quoteNo}`} author={business.name}>

      {/* ========== PAGE 1: Cover + Overview ========== */}
      <Page size="A4" style={S.page}>
        <PageHeader business={business} />

        <View style={S.titleBlock}>
          <Text style={S.titleQuotation}>QUOTATION</Text>
          <Text style={S.titleFor}>FOR</Text>
          <Text style={S.titleSystem}>{systemKw} KW GRID-TIED SOLAR POWER SYSTEM</Text>
          <Text style={S.titleSub}>Turnkey Supply, Installation & Commissioning</Text>
        </View>

        <View style={S.metaBox}>
          <View style={S.metaColLeft}>
            <Text style={S.metaTitle}>SUBMITTED TO</Text>
            <Text style={[S.metaText, S.metaTextBold, { fontSize: 9.5 }]}>{customerName.toUpperCase()}</Text>
            <Text style={[S.metaText, { marginTop: 4 }]}>{customerLocation}, {customerState}</Text>
          </View>
          <View style={S.metaColRight}>
            <Text style={S.metaTitle}>QUOTATION DETAILS</Text>
            <Text style={S.metaText}><Text style={S.metaTextBold}>Quote No.:</Text> {quoteNo}</Text>
            <Text style={S.metaText}><Text style={S.metaTextBold}>Date:</Text> {date}</Text>
            <Text style={S.metaText}><Text style={S.metaTextBold}>Valid Until:</Text> {validUntil}</Text>
            <Text style={S.metaText}><Text style={S.metaTextBold}>System Capacity:</Text> {systemKw} KW (Grid-Tied)</Text>
            <Text style={S.metaText}><Text style={S.metaTextBold}>Prepared by:</Text> AVION GREEN ASTRA SOLAR ENERGIES</Text>
          </View>
        </View>

        <View style={S.subCard}>
          <Text style={S.subCardTitle}>Avion Green Astra Solar Energies</Text>
          <Text style={S.subCardText}>Gollapudi, Vijayawada – 521225 | Andhra Pradesh</Text>
          <Text style={S.subCardText}>8143562666 | abhinav@avion.solar | www.aviongreenastra.com</Text>
          <Text style={S.subCardMeta}>Quote No.: {quoteNo} | Confidential</Text>
        </View>

        {/* Disclaimer Banner */}
        <View style={{
          border: '1.5 solid #B91C1C',
          backgroundColor: '#FFF5F5',
          padding: '8 10',
          marginVertical: 10,
          borderRadius: 3,
        }}>
          <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#B91C1C', textAlign: 'center', marginBottom: 3, letterSpacing: 0.5 }}>
            ⚠ FOR DEMONSTRATION PURPOSES ONLY — STRICTLY CONFIDENTIAL
          </Text>
          <Text style={{ fontSize: 7, color: '#7F1D1D', textAlign: 'center', lineHeight: 1.4 }}>
            This document has been prepared solely for demonstration and evaluation purposes. It is strictly confidential and the exclusive property of Avion Green Astra Solar Energies. Any reproduction, distribution, disclosure, or use of this document — in whole or in part — for any purpose other than the intended evaluation, without prior written consent, is strictly prohibited and may result in severe legal consequences.
          </Text>
        </View>

        <View style={S.section}>
          <Text style={S.sectionTitle}>1. SYSTEM OVERVIEW & QUICK SUMMARY</Text>
          <Text style={S.bodyText}>
            This quotation has been prepared by Avion Green Astra Solar Energies for the complete turnkey supply, installation
            of a {systemKw} KW grid-tied solar photovoltaic power system at the above-mentioned project site. The system utilises high-efficiency Bifacial solar panels with a {systemKw >= 100 ? `${Math.ceil(systemKw/125)}-unit ${Math.round(systemKw/Math.ceil(systemKw/125))} KW` : 'single'} inverter configuration to deliver optimum energy output and long-term reliability.
          </Text>

          <View style={S.table}>
            <View style={S.tableHeader}>
              <Text style={[S.tableHeaderCell, { flex: 2.2 }]}>PARAMETER</Text>
              <Text style={[S.tableHeaderCell, { flex: 3 }]}>SPECIFICATION</Text>
            </View>
            {[
              ['System Capacity', `${systemKw} KW (Grid-Tied Solar PV)`],
              ['Module Technology', 'High-Efficiency Bifacial'],
              ['Inverter Configuration', inverterConfig],
              ['Mounting Structure', 'Hot-Dip Galvanized (HDG) Fixed Tilt'],
              ['Daily Generation (Estimated)', `${calc.dailyGen_low.toLocaleString('en-IN')} – ${calc.dailyGen_high.toLocaleString('en-IN')} Units (kWh)`],
              ['Monthly Generation (Est.)', `${calc.monthlyGen_low.toLocaleString('en-IN')} – ${calc.monthlyGen_high.toLocaleString('en-IN')} Units (kWh)`],
              ['Annual Generation (Est.)', `${calc.annualGen_low.toLocaleString('en-IN')} – ${calc.annualGen_high.toLocaleString('en-IN')} Units (kWh)`],
              ['Quotation Total (Incl. GST)', formatPDFINR(calc.grandTotal, true)],
              ['Quotation Validity', '30 Days from Quotation Date'],
              ['Execution Timeline', '8 – 12 Weeks from PO / Advance'],
            ].map(([param, spec], i) => (
              <View key={i} style={[S.tableRow, i % 2 === 1 ? S.tableRowAlt : {}]}>
                <Text style={[S.tableCell, { flex: 2.2 }]}>{param}</Text>
                <Text style={[S.tableCellBold, { flex: 3 }]}>{spec}</Text>
              </View>
            ))}
          </View>
          <Text style={S.note}>
            Generation estimates are based on standard solar irradiation data for the project location. Actual yield may vary depending on site irradiation, shading, module orientation, temperature, and grid availability.
          </Text>
        </View>

        <PageFooter pageNum={1} />
      </Page>

      {/* ========== PAGE 2: BOM + Energy Generation ========== */}
      <Page size="A4" style={S.page}>
        <PageHeader business={business} />

        <View style={S.section}>
          <Text style={S.sectionTitle}>2. TECHNICAL SPECIFICATIONS — BILL OF MATERIALS</Text>
          <View style={S.table}>
            <View style={S.tableHeader}>
              <Text style={[S.tableHeaderCell, { width: 16 }]}>SL</Text>
              <Text style={[S.tableHeaderCell, { flex: 1.5 }]}>COMPONENT</Text>
              <Text style={[S.tableHeaderCell, { flex: 3.5 }]}>DESCRIPTION / SPECIFICATIONS</Text>
              <Text style={[S.tableHeaderCell, { flex: 1.2 }]}>QTY</Text>
              <Text style={[S.tableHeaderCell, { flex: 1.8 }]}>MAKE / BRAND</Text>
            </View>
            {[
              {
                sl: '1', comp: 'Solar PV Modules',
                desc: 'High-Efficiency TOPCon Module Efficiency: ≥ 21% Power Tolerance: 0/+5W PID Resistant, IEC 61215 / IEC 61730 Certified',
                qty: `${numPanels} Panels (${panelWattage}W each)`,
                brand: moduleBrand,
              },
              {
                sl: '2', comp: 'Solar Inverter',
                desc: 'Grid-Tied String Inverter, 3-Phase Efficiency: ≥ 98.4% multi-MPPT, IP65, Anti-Islanding Protection RS485/Modbus Communication',
                qty: inverterConfig,
                brand: inverterBrand,
              },
              {
                sl: '3', comp: 'Mounting Structure',
                desc: 'Hot-Dip Galvanized (HDG) Fixed Tilt Structure Galvanization: ≥ 85 µm Design Wind Speed: ≥ 150 km/h IS 2062 Steel',
                qty: '1 Set (Full plant)',
                brand: 'JSW-Sarvotham / Reputed Make',
              },
              {
                sl: '4', comp: 'Balance of System',
                desc: 'DC/AC Cables: Cu UV-Resistant/Armoured MC4 Connectors: IP68 DCDB: IP65 with SPD & Isolation ACDB/MDB: MCCB, SPD, meters',
                qty: '1 Complete Set',
                brand: 'Polycab / Finolex / RR Kabel',
              },
              {
                sl: '5', comp: 'Civil Works',
                desc: 'Structure foundation / pedestal civil works Cable duct / trench excavation and backfilling Site finishing',
                qty: 'As per design',
                brand: '—',
              },
              {
                sl: '6', comp: 'Safety System',
                desc: 'Lightning Arrestor: ESE Type with Down Conductor Chemical Earthing: ≥ 3 Earth Pits with Copper Rods IS 3043 Compliant',
                qty: '1 Complete Set',
                brand: 'Reputed Make',
              },
            ].map((row, i) => (
              <View key={i} style={[S.tableRow, i % 2 === 1 ? S.tableRowAlt : {}, { alignItems: 'flex-start' }]}>
                <Text style={[S.tableCell, { width: 16 }]}>{row.sl}</Text>
                <Text style={[S.tableCellBold, { flex: 1.5 }]}>{row.comp}</Text>
                <Text style={[S.tableCell, { flex: 3.5 }]}>{row.desc}</Text>
                <Text style={[S.tableCell, { flex: 1.2 }]}>{row.qty}</Text>
                <Text style={[S.tableCell, { flex: 1.8 }]}>{row.brand}</Text>
              </View>
            ))}
          </View>
          <Text style={S.note}>
            The above BOM is indicative. Final specifications, module wattage, and quantities are subject to revision after detailed site survey and system design.
          </Text>
        </View>

        <View style={S.section}>
          <Text style={S.sectionTitle}>3. ESTIMATED ENERGY GENERATION</Text>
          <View style={S.table}>
            <View style={S.tableHeader}>
              <Text style={[S.tableHeaderCell, { flex: 1.2 }]}>PERIOD</Text>
              <Text style={[S.tableHeaderCell, { flex: 2.2 }]}>ESTIMATED GENERATION (kWh)</Text>
              <Text style={[S.tableHeaderCell, { flex: 2.2 }]}>EQUIVALENT UNITS (Approx.)</Text>
            </View>
            {[
              ['Daily', `${calc.dailyGen_low.toLocaleString('en-IN')} – ${calc.dailyGen_high.toLocaleString('en-IN')} kWh`, `${calc.dailyGen_low.toLocaleString('en-IN')} – ${calc.dailyGen_high.toLocaleString('en-IN')} Units`],
              ['Monthly', `${calc.monthlyGen_low.toLocaleString('en-IN')} – ${calc.monthlyGen_high.toLocaleString('en-IN')} kWh`, `${calc.monthlyGen_low.toLocaleString('en-IN')} – ${calc.monthlyGen_high.toLocaleString('en-IN')} Units`],
              ['Annual', `${calc.annualGen_low.toLocaleString('en-IN')} – ${calc.annualGen_high.toLocaleString('en-IN')} kWh`, `${(calc.annualGen_low / 100000).toFixed(2)} – ${(calc.annualGen_high / 100000).toFixed(2)} Lakh Units`],
              ['25-Year (Estimated)', `${(calc.gen25yr_low / 10000000).toFixed(2)} – ${(calc.gen25yr_high / 10000000).toFixed(2)} Crore kWh`, 'Subject to annual 0.5% TOPCon degradation'],
            ].map(([period, gen, units], i) => (
              <View key={i} style={[S.tableRow, i % 2 === 1 ? S.tableRowAlt : {}]}>
                <Text style={[S.tableCellBold, { flex: 1.2 }]}>{period}</Text>
                <Text style={[S.tableCell, { flex: 2.2 }]}>{gen}</Text>
                <Text style={[S.tableCell, { flex: 2.2 }]}>{units}</Text>
              </View>
            ))}
          </View>
        </View>

        <PageFooter pageNum={2} />
      </Page>

      {/* ========== PAGE 3: Key Assumptions & Investment Breakup ========== */}
      <Page size="A4" style={S.page}>
        <PageHeader business={business} />

        <View style={S.section}>
          <Text style={S.sectionTitle}>Key Generation Assumptions</Text>
          <View style={S.bulletList}>
            <View style={S.bulletItem}>
              <Text style={S.bulletDot}>•</Text>
              <Text style={S.bulletText}>Solar irradiation data based on MNRE / NASA-PVGIS data for the project location.</Text>
            </View>
            <View style={S.bulletItem}>
              <Text style={S.bulletDot}>•</Text>
              <Text style={S.bulletText}>Performance Ratio (PR): ~0.78 (accounting for cable losses, soiling, temperature, and inverter losses).</Text>
            </View>
            <View style={S.bulletItem}>
              <Text style={S.bulletDot}>•</Text>
              <Text style={S.bulletText}>TOPCon module annual degradation: 0.5% per year (Year 1: 1%, thereafter 0.5%).</Text>
            </View>
            <View style={S.bulletItem}>
              <Text style={S.bulletDot}>•</Text>
              <Text style={S.bulletText}>Plant availability: 98% (subject to utility grid uptime).</Text>
            </View>
            <View style={S.bulletItem}>
              <Text style={S.bulletDot}>•</Text>
              <Text style={S.bulletText}>Actual generation may vary based on site-specific shading, dust accumulation, and local weather patterns.</Text>
            </View>
          </View>
        </View>

        <View style={S.section}>
          <Text style={S.sectionTitle}>4. INVESTMENT SUMMARY & COST BREAKUP</Text>
          <Text style={S.sectionSubTitle}>4.1 Component-Wise Cost Breakup</Text>
          <View style={S.table}>
            <View style={S.tableHeader}>
              <Text style={[S.tableHeaderCell, { width: 20 }]}>SL</Text>
              <Text style={[S.tableHeaderCell, { flex: 3.5 }]}>DESCRIPTION</Text>
              <Text style={[S.tableHeaderCell, { flex: 1.5, textAlign: 'right' }]}>ESTIMATED AMOUNT (₹)</Text>
            </View>
            {[
              ['1', `Solar PV Modules — ${systemKw} KW TOPCon (Supply)`, calc.panelCost],
              ['2', `Inverters — ${inverterConfig}`, calc.inverterCost],
              ['3', 'Module Mounting Structures (HDG Fixed Tilt)', calc.structureCost],
              ['4', 'Balance of System — DC/AC Cables, MC4, DCDB, ACDB', calc.bosCost],
              ['5', 'Civil Works — Foundations, Cable Trenching, Site Finishing', calc.civilCost],
              ['6', 'Safety System — Lightning Arrestor & Chemical Earthing', calc.safetyCost],
              ['7', 'Installation, Testing & Commissioning (I&C)', calc.icCost],
            ].map(([no, desc, amt], i) => (
              <View key={i} style={[S.tableRow, i % 2 === 1 ? S.tableRowAlt : {}]}>
                <Text style={[S.tableCell, { width: 20 }]}>{no}</Text>
                <Text style={[S.tableCell, { flex: 3.5 }]}>{desc}</Text>
                <Text style={[S.tableCellBold, { flex: 1.5, textAlign: 'right' }]}>{formatPDFINR(amt)}</Text>
              </View>
            ))}
            <View style={[S.tableRow, { backgroundColor: '#F5F5F5' }]}>
              <Text style={[S.tableCellBold, { width: 20 }]}></Text>
              <Text style={[S.tableCellBold, { flex: 3.5 }]}>TOTAL — Excluding GST</Text>
              <Text style={[S.tableCellBold, { flex: 1.5, textAlign: 'right' }]}>{formatPDFINR(calc.totalExGST)}</Text>
            </View>
            <View style={[S.tableRow, { backgroundColor: '#FAF9F6' }]}>
              <Text style={[S.tableCell, { width: 20 }]}></Text>
              <Text style={[S.tableCell, { flex: 3.5 }]}>GST (Approx. @ {(calc.gstRate * 100).toFixed(1)}% Effective Rate)</Text>
              <Text style={[S.tableCell, { flex: 1.5, textAlign: 'right' }]}>{formatPDFINR(calc.gstAmount)}</Text>
            </View>
            <View style={S.grandTotalRow}>
              <Text style={[S.tableCellBold, { width: 20 }]}></Text>
              <Text style={[S.tableCellBold, { flex: 3.5, color: '#1E5631' }]}>GRAND TOTAL — GST Inclusive</Text>
              <Text style={[S.tableCellBold, { flex: 1.5, textAlign: 'right', color: '#1E5631' }]}>{formatPDFINR(calc.grandTotal, true)}</Text>
            </View>
            {/* Central Subsidy row */}
            {calc.centralSubsidy > 0 && (
              <View style={[S.tableRow, { backgroundColor: '#F0FFF4' }]}>
                <Text style={[S.tableCell, { width: 20 }]}></Text>
                <Text style={[S.tableCell, { flex: 3.5, color: '#166534' }]}>Less: Central Subsidy (PM Surya Ghar)</Text>
                <Text style={[S.tableCellBold, { flex: 1.5, textAlign: 'right', color: '#166534' }]}>− {formatPDFINR(calc.centralSubsidy)}</Text>
              </View>
            )}
            {/* Gated Community Discount row */}
            {calc.gatedCommunityDiscount > 0 && (
              <View style={[S.tableRow, { backgroundColor: '#F0FFF4' }]}>
                <Text style={[S.tableCell, { width: 20 }]}></Text>
                <Text style={[S.tableCell, { flex: 3.5, color: '#166534' }]}>Less: Gated Community Discount (₹18,000/kW)</Text>
                <Text style={[S.tableCellBold, { flex: 1.5, textAlign: 'right', color: '#166534' }]}>− {formatPDFINR(calc.gatedCommunityDiscount)}</Text>
              </View>
            )}
            {/* Net cost after discounts */}
            {calc.totalSubsidy > 0 && (
              <View style={[S.grandTotalRow, { backgroundColor: '#DCFCE7', borderColor: '#166534' }]}>
                <Text style={[S.tableCellBold, { width: 20 }]}></Text>
                <Text style={[S.tableCellBold, { flex: 3.5, color: '#166534' }]}>NET COST AFTER DISCOUNTS / SUBSIDIES</Text>
                <Text style={[S.tableCellBold, { flex: 1.5, textAlign: 'right', color: '#166534' }]}>{formatPDFINR(calc.netCost, true)}</Text>
              </View>
            )}
          </View>
          <Text style={S.note}>
            GST applicable as per prevailing statutory rates on supply of goods and services. The above effective GST rate is indicative; actual tax breakup will be as per applicable HSN/SAC codes on the final invoice. Prices include supply, freight, insurance, installation, and commissioning.
          </Text>
        </View>

        <View style={S.section}>
          <Text style={S.sectionSubTitle}>4.2 Financial Benefits Summary</Text>
          <View style={S.table}>
            {[
              ['Total Investment (Incl. GST)', formatPDFINR(calc.grandTotal, true)],
              ['Assumed Tariff / Avoided Cost', `₹ ${calc.tariffPerUnit.toFixed(2)} / kWh (Industrial)`],
              ['Estimated Annual Savings', `${formatPDFINR(calc.annualSavings_low)} – ${formatPDFINR(calc.annualSavings_high)} / Year`],
              ['Simple Payback Period', `~${calc.payback_low.toFixed(1)} – ${calc.payback_high.toFixed(1)} Years`],
              ['25-Year Cumulative Savings (Est.)', `${formatPDFINR(calc.savings25yr_low)} – ${formatPDFINR(calc.savings25yr_high)} (without escalation)`],
              ['CO₂ Emission Reduction', `~${calc.co2PerYear_low} – ${calc.co2PerYear_high} Tonnes per Annum`],
              ['Plant Expected Life', '25+ Years'],
            ].map(([label, val], i) => (
              <View key={i} style={[S.tableRow, i % 2 === 1 ? S.tableRowAlt : {}]}>
                <Text style={[S.tableCell, { flex: 3 }]}>{label}</Text>
                <Text style={[S.tableCellBold, { flex: 2, textAlign: 'right' }]}>{val}</Text>
              </View>
            ))}
          </View>
        </View>

        <PageFooter pageNum={3} />
      </Page>

      {/* ========== PAGE 4: Warranty + Scope ========== */}
      <Page size="A4" style={S.page}>
        <PageHeader business={business} />

        <View style={S.section}>
          <Text style={S.sectionTitle}>5. WARRANTY</Text>
          <View style={S.table}>
            <View style={S.tableHeader}>
              <Text style={[S.tableHeaderCell, { flex: 1.5 }]}>COMPONENT</Text>
              <Text style={[S.tableHeaderCell, { flex: 1.8 }]}>WARRANTY TYPE</Text>
              <Text style={[S.tableHeaderCell, { flex: 1.2 }]}>PERIOD</Text>
              <Text style={[S.tableHeaderCell, { flex: 2.5 }]}>COVERAGE</Text>
            </View>
            {[
              ['Solar PV Modules', 'Performance Warranty (Linear)', '25 – 30 Years', '≥ 90% output at Year 10; ≥ 85% at Year 25/30'],
              ['Solar PV Modules', 'Product / Manufacturer Warranty', '12 – 15 Years', 'Replacement of defective modules at no cost'],
              ['Solar Inverter', 'Product Warranty', '8 Years (Standard)', 'Repair / replacement within warranty period'],
              ['Workmanship', 'Comprehensive Service Support', '5 Years', 'Free rectification of installation-related defects'],
              ['Overall Plant', 'Defect Liability Period (DLP)', '12 Months', 'Free rectification of all workmanship defects'],
            ].map((row, i) => (
              <View key={i} style={[S.tableRow, i % 2 === 1 ? S.tableRowAlt : {}, { alignItems: 'flex-start' }]}>
                <Text style={[S.tableCellBold, { flex: 1.5 }]}>{row[0]}</Text>
                <Text style={[S.tableCell, { flex: 1.8 }]}>{row[1]}</Text>
                <Text style={[S.tableCell, { flex: 1.2 }]}>{row[2]}</Text>
                <Text style={[S.tableCell, { flex: 2.5 }]}>{row[3]}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={S.section}>
          <Text style={S.sectionTitle}>6. SCOPE OF WORK</Text>
          <Text style={S.sectionSubTitle}>Included in This Quotation</Text>
          <View style={S.bulletList}>
            {[
              'Detailed site survey, shadow analysis, and system design layout.',
              'Supply of all major equipment and materials as per approved BOM (Section 2).',
              'Civil foundation works for module mounting structures.',
              'Cable trench/duct excavation and backfilling.',
              'Erection of HDG Module Mounting Structures (MMS) and installation of solar panels.',
              'DC cabling — string combiner boxes / DCDB to inverter input.',
              'AC cabling — inverter output to ACDB / Main LT Panel interface.',
              'Installation, testing, and commissioning of all string inverters.',
              'Earthing and bonding of all module frames, MMS, and inverter enclosures.',
              'Installation of Lightning Arresting System and SPDs.',
              'Net metering / grid synchronization support documentation (DISCOM application assistance).',
              'Pre-commissioning tests — IR test, Voc/Isc, polarity check, earth resistance test.',
              'Handover of as-built drawings, test reports, and equipment warranty cards.',
            ].map((item, i) => (
              <View key={i} style={S.bulletItem}>
                <Text style={S.bulletDot}>•</Text>
                <Text style={S.bulletText}>{item}</Text>
              </View>
            ))}
          </View>

          <Text style={S.sectionSubTitle}>Exclusions (Client's Scope)</Text>
          <View style={S.bulletList}>
            {[
              '3-phase LT power supply for construction activities during installation.',
              'Internet / broadband connectivity for remote plant monitoring (if applicable).',
              'DISCOM net metering security deposits and utility grid connection charges.',
              'Civil strengthening of existing roof / structure if found inadequate.',
              'Any statutory charges imposed by local authorities beyond those listed in scope.',
              'Fire-fighting equipment (client\'s responsibility under applicable regulations).',
            ].map((item, i) => (
              <View key={i} style={S.bulletItem}>
                <Text style={S.bulletDotOpen}>○</Text>
                <Text style={S.bulletText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        <PageFooter pageNum={4} />
      </Page>

      {/* ========== PAGE 5: Payment Terms + Terms & Conditions ========== */}
      <Page size="A4" style={S.page}>
        <PageHeader business={business} />

        <View style={S.section}>
          <Text style={S.sectionTitle}>7. PAYMENT TERMS</Text>
          <View style={S.table}>
            <View style={S.tableHeader}>
              <Text style={[S.tableHeaderCell, { width: 20 }]}>SL</Text>
              <Text style={[S.tableHeaderCell, { flex: 2.5 }]}>MILESTONE</Text>
              <Text style={[S.tableHeaderCell, { flex: 1.2, textAlign: 'center' }]}>PAYMENT (%)</Text>
              <Text style={[S.tableHeaderCell, { flex: 1.8, textAlign: 'right' }]}>AMOUNT (₹)</Text>
            </View>
            {[
              ['1', 'Advance with Purchase Order / Agreement', '30%', calc.milestone1],
              ['2', 'Material Readiness — Prior to Dispatch of Modules & Inverters', '40%', calc.milestone2],
              ['3', 'Mechanical Completion (MMS + Module Mounting + DC Wiring)', '20%', calc.milestone3],
              ['4', 'Final Commissioning, Grid Synchronization & Handover', '10%', calc.milestone4],
            ].map(([sl, milestone, pct, amt], i) => (
              <View key={i} style={[S.tableRow, i % 2 === 1 ? S.tableRowAlt : {}]}>
                <Text style={[S.tableCell, { width: 20 }]}>{sl}</Text>
                <Text style={[S.tableCellBold, { flex: 2.5 }]}>{milestone}</Text>
                <Text style={[S.tableCell, { flex: 1.2, textAlign: 'center', color: '#1E5631' }]}>{pct}</Text>
                <Text style={[S.tableCellBold, { flex: 1.8, textAlign: 'right' }]}>{formatPDFINR(amt)}</Text>
              </View>
            ))}
            <View style={S.totalRow}>
              <Text style={[S.tableCell, { width: 20 }]}></Text>
              <Text style={[S.tableCellBold, { flex: 2.5 }]}>TOTAL</Text>
              <Text style={[S.tableCellBold, { flex: 1.2, textAlign: 'center', color: '#1E5631' }]}>100%</Text>
              <Text style={[S.tableCellBold, { flex: 1.8, textAlign: 'right' }]}>{formatPDFINR(calc.grandTotal, true)}</Text>
            </View>
          </View>
        </View>

        <View style={S.section}>
          <Text style={S.sectionTitle}>8. TERMS & CONDITIONS</Text>
          <View style={{ gap: 6 }}>
            {[
              ['8.1 Quotation Validity', 'This quotation is valid for 30 (thirty) calendar days from the date of issue. Post expiry, prices are subject to revision. Extension possible upon mutual written agreement.'],
              ['8.2 Taxes & Duties', 'All prices are inclusive of GST as indicated. Any new or enhanced levies or duties imposed by Government authorities after the date of this quotation shall be to the client\'s account.'],
              ['8.3 Delivery & Execution Timeline', 'Total execution time is estimated at 8 – 12 weeks from receipt of advance payment and signed PO. Timeline is subject to site readiness, material availability, and DISCOM coordination.'],
              ['8.4 Site Readiness', 'The client shall ensure site access, civil clearances, and 3-phase power availability for construction prior to AGASE mobilization. Delays caused by site unreadiness shall not be attributed to AGASE.'],
              ['8.5 Design Finalization', 'The final system design, module wattage, string configuration, and BOM shall be confirmed after a detailed site survey and shadow analysis. This quotation is based on preliminary assumptions.'],
              ['8.6 Force Majeure', 'Neither party shall be liable for delay or failure arising from acts of God, natural disasters, floods, government actions, or other extraordinary circumstances beyond reasonable control.'],
              ['8.7 Dispute Resolution', 'This quotation and any resultant contract shall be governed by the laws of India. Disputes shall first be resolved by mutual negotiation. Failing resolution, disputes shall be referred to arbitration under the Arbitration and Conciliation Act, 1996. Jurisdiction: Vijayawada.'],
              ['8.8 Confidentiality', 'This quotation is confidential and submitted solely for evaluation. It shall not be reproduced, shared, or disclosed to any third party without prior written consent of Avion Green Astra Solar Energies.'],
            ].map(([title, desc], i) => (
              <View key={i}>
                <Text style={{ fontSize: 7.8, fontFamily: 'Helvetica-Bold', color: '#111111', marginBottom: 1 }}>{title}</Text>
                <Text style={{ fontSize: 7.5, color: '#444444', lineHeight: 1.3 }}>{desc}</Text>
              </View>
            ))}
          </View>
        </View>

        <PageFooter pageNum={5} />
      </Page>

      {/* ========== PAGE 6: Acceptance & Authorized Signatories ========== */}
      <Page size="A4" style={S.page}>
        <PageHeader business={business} />

        <View style={[S.section, { marginTop: 20 }]}>
          <Text style={[S.sectionTitle, { fontSize: 11, textAlign: 'center', marginBottom: 15 }]}>Acceptance & Authorized Signatories</Text>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 }}>
            <View style={{ flex: 1, paddingRight: 20 }}>
              <Text style={{ fontSize: 8.5, fontFamily: 'Helvetica-Bold', color: '#0B3C85', marginBottom: 6 }}>For M/s.Avion Green Astra Solar Energies</Text>
              <View style={{ marginVertical: 6 }}>
                <SignatureSvg />
              </View>
              <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#333333', marginTop: 4 }}>[GADIPARTHI SRINIVASARAO]</Text>
              <Text style={{ fontSize: 7.5, color: '#666666', marginTop: 2 }}>[Managing Partner]</Text>
              <Text style={{ fontSize: 7.5, color: '#666666', marginTop: 4 }}>Date: {date}</Text>
            </View>

            <View style={{ flex: 1, paddingLeft: 20, borderLeft: '1 solid #CCCCCC' }}>
              <Text style={{ fontSize: 8.5, fontFamily: 'Helvetica-Bold', color: '#333333', marginBottom: 50 }}>ACCEPTED BY CLIENT</Text>
              <Text style={{ borderBottom: '1 solid #CCCCCC', width: '100%', marginVertical: 10 }} />
              <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#333333' }}>[Authorized Signatory — Client]</Text>
              <Text style={{ fontSize: 7.5, color: '#666666' }}>[Designation]</Text>
              <Text style={{ fontSize: 7.5, color: '#666666', marginTop: 4 }}>Date: ____________________</Text>
            </View>
          </View>
        </View>

        <View style={[S.subCard, { marginTop: 80, borderTop: '0.5 solid #CCCCCC', paddingTop: 20 }]}>
          <Text style={S.subCardTitle}>Avion Green Astra Solar Energies</Text>
          <Text style={S.subCardText}>Gollapudi, Vijayawada – 521225 | Andhra Pradesh</Text>
          <Text style={S.subCardText}>8143562666 | abhinav@avion.solar | www.aviongreenastra.com</Text>
          <Text style={S.subCardMeta}>Quote No.: {quoteNo} | Confidential</Text>
        </View>

        <PageFooter pageNum={6} />
      </Page>

    </Document>
  );
}

// Export async PDF blob generator
export async function generatePDFBlob(quote, business) {
  const doc = <QuotePDF quote={quote} business={business} />;
  const blob = await pdf(doc).toBlob();
  return blob;
}

export default QuotePDF;
