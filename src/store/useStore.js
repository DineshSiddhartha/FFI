// Zustand store — SuryaQuote global state
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateQuoteNo, formatDate, getValidityDate, calculateQuote } from '../utils/calculator';

const defaultBusiness = {
  name: 'Avion Green Astra Solar Energies',
  tagline: 'Solar Energies',
  address: 'N.TR. Circle, Gollapudi, Vijayawada, NTR Dist., AP – 521225',
  phone: '9676441999',
  altPhone: '8143562666',
  email: 'aviongreenastrasolarenergies@gmail.com',
  website: 'www.aviongreenastra.com',
  gst: '37ACLFA8649JlZQ',
  pan: 'ACLFA8649J',
  state: 'Andhra Pradesh',
  logo: null, // base64 or URL
  // Pricing defaults (₹/kW)
  panelRatePerKw: 30000,
  inverterRatePerKw: 3700,
  structureRatePerKw: 4500,
  bosRatePerKw: 4000,
  civilRatePerKw: 1500,
  safetyRatePerKw: 800,
  icRatePerKw: 1500,
  tariffPerUnit: 6.5,
  peakSunHours: 5,
  panelWattage: 550,
};

export const useStore = create(
  persist(
    (set, get) => ({
      // Authentication
      isAuthenticated: false,
      setAuthenticated: (val) => set({ isAuthenticated: val }),

      // Onboarding
      isOnboarded: false,
      business: defaultBusiness,
      setOnboarded: (val) => set({ isOnboarded: val }),
      updateBusiness: (updates) => set(state => ({ business: { ...state.business, ...updates } })),

      // Quotes list
      quotes: [],

      // Add quote
      addQuote: (quote) => set(state => ({
        quotes: [quote, ...state.quotes],
      })),

      // Update quote
      updateQuote: (id, updates) => set(state => ({
        quotes: state.quotes.map(q => q.id === id ? { ...q, ...updates } : q),
      })),

      // Delete quote — also adds to deletedIds tombstone so sync never re-adds it
      deleteQuote: (id) => set(state => ({
        quotes: state.quotes.filter(q => q.id !== id),
        deletedIds: [...(state.deletedIds || []), id],
      })),

      // Tombstone: IDs of permanently deleted quotes
      deletedIds: [],

      // Push local quotes directly to cloud (used after deletion to avoid merge re-adding deleted quote)
      pushQuotesToCloud: async () => {
        const { quotes, syncCode, business } = get();
        const rawCode = syncCode || business.gst || 'default_surya_sync';
        if (!rawCode) return;
        const safeCode = rawCode.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
        const GLOBAL_BUCKET = 'CdU4BDcBDc1Lk2YGZUjGhz';
        const key = `quotes_${safeCode}`;
        try {
          await fetch(`https://kvdb.io/${GLOBAL_BUCKET}/${key}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(quotes),
          });
        } catch (err) {
          console.error('Push after delete failed:', err);
        }
      },

      // Get quote by id
      getQuote: (id) => get().quotes.find(q => q.id === id),

      // New Quote Draft (in-progress form state)
      draft: null,
      startDraft: (quote = null) => {
        const business = get().business;
        if (quote) {
          set({
            draft: {
              ...quote,
            },
            step: 1
          });
        } else {
          set({
            draft: {
              // Step 1: Customer
              salesPersonName: '',
              customerName: '',
              customerPhone: '',
              customerLocation: '',
              customerState: business.state || 'Andhra Pradesh',
              projectType: 'commercial',
              isGatedCommunity: false,  // Only applicable for residential

              // Step 2: System Config
              systemKw: 500,
              panelWattage: business.panelWattage || 550,
              moduleBrand: 'Waaree / Rayzon / Premier',
              inverterBrand: 'Solis / Polycab (or equivalent Tier-1)',
              structureBrand: 'JSW-Sarvotham / Reputed Make',
              roofPhoto: null,
              aiAnalysis: null,

              // Step 3: Pricing (editable draft — per kW rates)
              // Commercial default panel rate is lower than residential
              panelRatePerKw: business.panelRatePerKw || 27000,
              inverterRatePerKw: business.inverterRatePerKw || 3700,
              structureRatePerKw: business.structureRatePerKw || 4500,
              bosRatePerKw: business.bosRatePerKw || 4000,
              civilRatePerKw: business.civilRatePerKw || 1500,
              safetyRatePerKw: business.safetyRatePerKw || 800,
              icRatePerKw: business.icRatePerKw || 1500,
              tariffPerUnit: business.tariffPerUnit || 6.5,
              peakSunHours: business.peakSunHours || 5,

              // Quote metadata
              quoteNo: generateQuoteNo(business.name?.split(' ').map(w => w[0]).join('').toUpperCase() || 'AGASE'),
              date: formatDate(),
              validUntil: getValidityDate(),
            },
            step: 1
          });
        }
      },
      updateDraft: (updates) => set(state => ({
        draft: state.draft ? { ...state.draft, ...updates } : state.draft,
      })),
      clearDraft: () => set({ draft: null }),

      // Current step in new quote wizard
      step: 1,
      setStep: (step) => set({ step }),

      // Cloud Synchronization
      syncCode: '',
      syncStatus: 'idle', // 'idle' | 'syncing' | 'success' | 'error'
      syncError: '',
      lastSynced: null,
      setSyncCode: (code) => set({ syncCode: code }),
      syncQuotes: async () => {
        const { quotes, syncCode, business } = get();
        const rawCode = syncCode || business.gst || 'default_surya_sync';
        if (!rawCode) return;

        // Clean sync code for safe KV key usage
        const safeCode = rawCode.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
        const GLOBAL_BUCKET = 'CdU4BDcBDc1Lk2YGZUjGhz';
        const key = `quotes_${safeCode}`;

        set({ syncStatus: 'syncing', syncError: '' });
        try {
          const response = await fetch(`https://kvdb.io/${GLOBAL_BUCKET}/${key}`, {
            method: 'GET',
          });

          let remoteQuotes = [];
          if (response.ok) {
            remoteQuotes = await response.json().catch(() => []);
          } else if (response.status !== 404) {
            const errText = await response.text().catch(() => '');
            throw new Error(`Cloud read failed: ${response.status} ${errText}`);
          }

          const quoteMap = new Map();
          quotes.forEach(q => quoteMap.set(q.id, q));

          const deletedIds = get().deletedIds || [];
          remoteQuotes.forEach(rq => {
            // Skip any quote that has been tombstoned (deleted) locally
            if (deletedIds.includes(rq.id)) return;
            const lq = quoteMap.get(rq.id);
            if (!lq) {
              quoteMap.set(rq.id, rq);
            } else {
              const lTime = new Date(lq.updatedAt || lq.createdAt).getTime();
              const rTime = new Date(rq.updatedAt || rq.createdAt).getTime();
              if (rTime > lTime) {
                quoteMap.set(rq.id, rq);
              }
            }
          });

          const mergedQuotes = Array.from(quoteMap.values());
          mergedQuotes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

          const writeResponse = await fetch(`https://kvdb.io/${GLOBAL_BUCKET}/${key}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(mergedQuotes),
          });

          if (!writeResponse.ok) {
            const errText = await writeResponse.text().catch(() => '');
            throw new Error(`Cloud write failed: ${writeResponse.status} ${errText}`);
          }

          set({
            quotes: mergedQuotes,
            syncStatus: 'success',
            lastSynced: new Date().toISOString(),
          });
        } catch (err) {
          console.error('Cloud Sync error:', err);
          set({
            syncStatus: 'error',
            syncError: err.message,
          });
        }
      },

      // App events log (for analytics)
      events: [],
      logEvent: (eventName, meta = {}) => set(state => ({
        events: [...state.events, {
          event: eventName,
          ts: new Date().toISOString(),
          ...meta,
        }],
      })),
    }),
    {
      name: 'suryaquote-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        isOnboarded: state.isOnboarded,
        business: state.business,
        quotes: state.quotes,
        deletedIds: state.deletedIds,
        events: state.events,
        syncCode: state.syncCode,
        lastSynced: state.lastSynced,
      }),
    }
  )
);
