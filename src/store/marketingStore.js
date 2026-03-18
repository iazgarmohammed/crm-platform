import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

export const FUNNEL_STAGES = ['Awareness', 'Interest', 'Lead', 'Nurturing', 'Converted', 'Lost'];
export const LEAD_TYPES = ['Startup', 'Investor', 'School', 'Creator', 'Student'];
export const SOURCE_CHANNELS = ['LinkedIn', 'Instagram', 'WhatsApp', 'Referral', 'Cold Email', 'Event'];
export const MARKETING_STATUS = ['Active', 'Converted', 'Lost', 'Paused'];

const loadFromStorage = (key, fallback) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch { return fallback; }
};

const saveToStorage = (key, value) => localStorage.setItem(key, JSON.stringify(value));

const useMarketingStore = create((set, get) => ({
  leads: loadFromStorage('crm_leads', []),
  campaigns: loadFromStorage('crm_campaigns', []),

  addLead: (data) => {
    const record = { id: uuidv4(), createdAt: new Date().toISOString(), ...data };
    const updated = [record, ...get().leads];
    saveToStorage('crm_leads', updated);
    set({ leads: updated });
  },
  updateLead: (id, data) => {
    const updated = get().leads.map((l) => l.id === id ? { ...l, ...data, updatedAt: new Date().toISOString() } : l);
    saveToStorage('crm_leads', updated);
    set({ leads: updated });
  },
  deleteLead: (id) => {
    const updated = get().leads.filter((l) => l.id !== id);
    saveToStorage('crm_leads', updated);
    set({ leads: updated });
  },
  updateLeadStage: (id, newStage) => {
    const updated = get().leads.map((l) => l.id === id ? { ...l, funnelStage: newStage, updatedAt: new Date().toISOString() } : l);
    saveToStorage('crm_leads', updated);
    set({ leads: updated });
  },

  addCampaign: (data) => {
    const record = { id: uuidv4(), createdAt: new Date().toISOString(), ...data };
    const updated = [record, ...get().campaigns];
    saveToStorage('crm_campaigns', updated);
    set({ campaigns: updated });
  },
  updateCampaign: (id, data) => {
    const updated = get().campaigns.map((c) => c.id === id ? { ...c, ...data } : c);
    saveToStorage('crm_campaigns', updated);
    set({ campaigns: updated });
  },
  deleteCampaign: (id) => {
    const updated = get().campaigns.filter((c) => c.id !== id);
    saveToStorage('crm_campaigns', updated);
    set({ campaigns: updated });
  },
}));

export default useMarketingStore;