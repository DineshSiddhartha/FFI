// Calculation Engine — SuryaQuote
// Based on actual Avion Green Astra Solar Energies quotation structure

// STATE_SUBSIDIES — kept as a state list for dropdowns.
// Rates are no longer applied in calculations (business decision).
export const STATE_SUBSIDIES = {
  "Andhra Pradesh": { name: "Andhra Pradesh" },
  "Telangana": { name: "Telangana" },
  "Tamil Nadu": { name: "Tamil Nadu" },
  "Karnataka": { name: "Karnataka" },
  "Kerala": { name: "Kerala" },
  "Maharashtra": { name: "Maharashtra" },
  "Gujarat": { name: "Gujarat" },
  "Rajasthan": { name: "Rajasthan" },
  "Madhya Pradesh": { name: "Madhya Pradesh" },
  "Uttar Pradesh": { name: "Uttar Pradesh" },
  "Delhi": { name: "Delhi" },
  "Haryana": { name: "Haryana" },
  "Punjab": { name: "Punjab" },
  "West Bengal": { name: "West Bengal" },
  "Odisha": { name: "Odisha" },
  "Bihar": { name: "Bihar" },
  "Chhattisgarh": { name: "Chhattisgarh" },
  "Jharkhand": { name: "Jharkhand" },
  "Goa": { name: "Goa" },
  "Himachal Pradesh": { name: "Himachal Pradesh" },
  "Uttarakhand": { name: "Uttarakhand" },
  "Assam": { name: "Assam" },
  "Meghalaya": { name: "Meghalaya" },
  "Manipur": { name: "Manipur" },
  "Nagaland": { name: "Nagaland" },
  "Mizoram": { name: "Mizoram" },
  "Arunachal Pradesh": { name: "Arunachal Pradesh" },
  "Tripura": { name: "Tripura" },
  "Sikkim": { name: "Sikkim" },
  "J&K": { name: "J&K" },
  "Ladakh": { name: "Ladakh" },
  "Chandigarh": { name: "Chandigarh" },
  "Puducherry": { name: "Puducherry" },
  "Andaman & Nicobar": { name: "Andaman & Nicobar" },
  "Lakshadweep": { name: "Lakshadweep" },
  "Dadra & Nagar Haveli": { name: "Dadra & Nagar Haveli" },
};


// PM Surya Ghar Central Subsidy (Residential only)
export function getCentralSubsidy(kw, projectType = 'residential') {
  if (projectType !== 'residential') return 0;
  if (kw <= 1) return 30000;
  if (kw <= 2) return 60000;
  if (kw <= 3) return 78000;
  // 3kW+ gets ₹78,000 flat (not per kW beyond 3)
  return 78000;
}

// Gated Community discount — ₹18,000/kW for residential gated communities
export function getGatedCommunityDiscount(kw, projectType, isGatedCommunity) {
  if (projectType !== 'residential') return 0;
  if (!isGatedCommunity) return 0;
  return kw * 18000;
}

// GST effective rate
export function getGSTRate(projectType) {
  // 12% on modules, 18% on services, effective ~8.9% blended for commercial
  return projectType === 'residential' ? 0.12 : 0.089;
}

// Main Calculation Engine
export function calculateQuote(params) {
  const {
    systemKw,
    panelWattage = 550,         // Watts per panel
    panelRatePerKw = 30000,     // ₹/kW for modules
    inverterRatePerKw = 3700,   // ₹/kW for inverters
    structureRatePerKw = 4500,  // ₹/kW for MMS
    bosRatePerKw = 4000,        // ₹/kW for BOS (cables, DC/AC)
    civilRatePerKw = 1500,      // ₹/kW for civil works
    safetyRatePerKw = 800,      // ₹/kW for safety (earthing, SPD)
    icRatePerKw = 1500,         // ₹/kW for I&C (installation)
    tariffPerUnit = 6.5,        // ₹/kWh electricity rate
    peakSunHours = 5,           // hours/day
    performanceRatio = 0.78,
    state = 'Andhra Pradesh',
    projectType = 'commercial',
    isGatedCommunity = false,   // Gated community discount for residential
  } = params;

  // Number of panels
  const numPanels = Math.ceil((systemKw * 1000) / panelWattage);

  // Component-wise costs
  const panelCost = systemKw * panelRatePerKw;
  const inverterCost = systemKw * inverterRatePerKw;
  const structureCost = systemKw * structureRatePerKw;
  const bosCost = systemKw * bosRatePerKw;
  const civilCost = systemKw * civilRatePerKw;
  const safetyCost = systemKw * safetyRatePerKw;
  const icCost = systemKw * icRatePerKw;

  // Total before GST
  const totalExGST = panelCost + inverterCost + structureCost + bosCost + civilCost + safetyCost + icCost;

  // GST
  const gstRate = getGSTRate(projectType);
  const gstAmount = Math.round(totalExGST * gstRate);
  const grandTotal = totalExGST + gstAmount;

  // Subsidies and discounts
  const centralSubsidy = getCentralSubsidy(systemKw, projectType);
  // No state subsidy applied — only central PM Surya Ghar scheme
  const stateSubsidy = 0;
  // Gated community discount (residential only)
  const gatedCommunityDiscount = getGatedCommunityDiscount(systemKw, projectType, isGatedCommunity);
  const totalSubsidy = centralSubsidy + gatedCommunityDiscount;
  const netCost = grandTotal - totalSubsidy;

  // Energy generation
  const dailyGen_low = Math.round(systemKw * peakSunHours * performanceRatio * 0.9);
  const dailyGen_high = Math.round(systemKw * peakSunHours * performanceRatio * 1.1);
  const monthlyGen_low = dailyGen_low * 30;
  const monthlyGen_high = dailyGen_high * 30;
  const annualGen_low = dailyGen_low * 365;
  const annualGen_high = dailyGen_high * 365;
  const gen25yr_low = Math.round(annualGen_low * 23.5); // accounting for degradation
  const gen25yr_high = Math.round(annualGen_high * 23.5);

  // Financial
  const annualSavings_low = Math.round(annualGen_low * tariffPerUnit);
  const annualSavings_high = Math.round(annualGen_high * tariffPerUnit);
  const payback_low = netCost / annualSavings_high;
  const payback_high = netCost / annualSavings_low;
  const savings25yr_low = Math.round(annualSavings_low * 23.5);
  const savings25yr_high = Math.round(annualSavings_high * 23.5);

  // CO2 reduction (0.82 kg CO2/kWh — India grid emission factor)
  const co2PerYear_low = Math.round((annualGen_low * 0.82) / 1000); // tonnes
  const co2PerYear_high = Math.round((annualGen_high * 0.82) / 1000);

  // Payment milestones
  const milestone1 = Math.round(grandTotal * 0.30);
  const milestone2 = Math.round(grandTotal * 0.40);
  const milestone3 = Math.round(grandTotal * 0.20);
  const milestone4 = grandTotal - milestone1 - milestone2 - milestone3;

  return {
    // Inputs (for editable draft)
    systemKw, panelWattage, numPanels,
    panelRatePerKw, inverterRatePerKw, structureRatePerKw,
    bosRatePerKw, civilRatePerKw, safetyRatePerKw, icRatePerKw,
    tariffPerUnit, peakSunHours, performanceRatio,
    state, projectType, gstRate,

    // Costs
    panelCost, inverterCost, structureCost, bosCost, civilCost, safetyCost, icCost,
    totalExGST, gstAmount, grandTotal,
    centralSubsidy, stateSubsidy, gatedCommunityDiscount, totalSubsidy, netCost,

    // Generation
    dailyGen_low, dailyGen_high,
    monthlyGen_low, monthlyGen_high,
    annualGen_low, annualGen_high,
    gen25yr_low, gen25yr_high,

    // Financial
    annualSavings_low, annualSavings_high,
    payback_low, payback_high,
    savings25yr_low, savings25yr_high,
    co2PerYear_low, co2PerYear_high,

    // Payment milestones
    milestone1, milestone2, milestone3, milestone4,
  };
}

// Format Indian currency
export function formatINR(amount) {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)} L`;
  }
  return '₹' + amount.toLocaleString('en-IN');
}

// Format INR full with commas
export function formatINRFull(amount) {
  return '₹' + Math.round(amount).toLocaleString('en-IN');
}

// Generate quote number
export function generateQuoteNo(businessCode = 'AGASE') {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 900) + 100;
  return `${businessCode}/${year}/Q-${random}`;
}

// Get validity date (30 days from now)
export function getValidityDate() {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// Format date
export function formatDate(date = new Date()) {
  return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// kW presets for selector
export const KW_PRESETS_RESIDENTIAL = [1, 2, 3, 4, 5, 6, 8, 10];
export const KW_PRESETS_COMMERCIAL = [10, 20, 50, 100, 200, 300, 500, 1000];

export const PROJECT_TYPES = [
  { value: 'residential', label: 'Residential', emoji: '🏠' },
  { value: 'commercial', label: 'Commercial', emoji: '🏢' },
];
