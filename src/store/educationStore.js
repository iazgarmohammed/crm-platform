import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

export const EDUCATION_STAGES = [
  'Identified',
  'Contacted',
  'Responded',
  'Deck Sent',
  'Meeting Requested',
  'Proposal Submitted',
  'Negotiating',
  'Confirmed',
  'Delivered',
  'Not Interested',
];

export const INSTITUTION_TYPES = ['School', 'Junior College', 'Degree College', 'MBA Institute'];
export const CONTACT_ROLES = ['Principal', 'HOD', 'Placement Officer', 'Dean', 'Teacher'];
export const PROGRAM_INTERESTS = ['Junior MBA', 'Webinar', 'Seminar', 'Workshop'];
export const EDUCATION_STATUS = ['Active', 'Confirmed', 'Delivered', 'Not Interested', 'Paused'];
export const REFERRAL_SOURCES = ['Intern', 'Network', 'Cold Outreach', 'Event'];

const loadFromStorage = (key, fallback) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
};

const saveToStorage = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const useEducationStore = create((set, get) => ({

  institutions: loadFromStorage('crm_institutions', []),

  addInstitution: (data) => {
    const record = { id: uuidv4(), createdAt: new Date().toISOString(), ...data };
    const updated = [record, ...get().institutions];
    saveToStorage('crm_institutions', updated);
    set({ institutions: updated });
  },

  updateInstitution: (id, data) => {
    const updated = get().institutions.map((i) =>
      i.id === id ? { ...i, ...data, updatedAt: new Date().toISOString() } : i
    );
    saveToStorage('crm_institutions', updated);
    set({ institutions: updated });
  },

  deleteInstitution: (id) => {
    const updated = get().institutions.filter((i) => i.id !== id);
    saveToStorage('crm_institutions', updated);
    set({ institutions: updated });
  },

  updateInstitutionStage: (id, newStage) => {
    const updated = get().institutions.map((i) =>
      i.id === id ? { ...i, pipelineStage: newStage, updatedAt: new Date().toISOString() } : i
    );
    saveToStorage('crm_institutions', updated);
    set({ institutions: updated });
  },
}));

export default useEducationStore;