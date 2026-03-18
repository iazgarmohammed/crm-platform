import { create } from 'zustand';
import { supabase } from '../supabaseClient';

export const STARTUP_STAGES = [
  'Identified', 'Contacted', 'Responded', 'Demo Done',
  'Interested', 'Validated', 'Onboarded', 'Rejected', 'Ghosted',
];

export const INVESTOR_STAGES = [
  'Identified', 'Contacted', 'Responded', 'Call Done',
  'Reviewing', 'Onboarded', 'Not Interested', 'Follow Later',
];

export const INDUSTRIES = ['Fintech', 'Edtech', 'Agri', 'Health', 'SaaS', 'Other'];
export const STARTUP_STAGE_OPTIONS = ['Idea', 'MVP', 'Revenue', 'Scaling'];
export const INVESTOR_TYPES = ['Angel', 'VC', 'HNI', 'Family Office', 'Corporate'];
export const STATUS_OPTIONS = ['Active', 'Onboarded', 'Rejected', 'Ghosted', 'Paused'];

// ── Converts Supabase snake_case to camelCase for frontend ──
const toStartup = (r) => ({
  id: r.id,
  createdAt: r.created_at,
  startupName: r.startup_name,
  founderName: r.founder_name,
  phone: r.phone,
  email: r.email,
  linkedIn: r.linked_in,
  industry: r.industry,
  startupStage: r.startup_stage,
  source: r.source,
  pipelineStage: r.pipeline_stage,
  lastContactDate: r.last_contact_date,
  nextFollowUpDate: r.next_follow_up_date,
  validationScore: r.validation_score,
  investorMatch: r.investor_match,
  notes: r.notes,
  status: r.status,
});

const toInvestor = (r) => ({
  id: r.id,
  createdAt: r.created_at,
  investorName: r.investor_name,
  fund: r.fund,
  email: r.email,
  linkedIn: r.linked_in,
  type: r.type,
  ticketSizeMin: r.ticket_size_min,
  ticketSizeMax: r.ticket_size_max,
  sectors: r.sectors,
  source: r.source,
  pipelineStage: r.pipeline_stage,
  lastContact: r.last_contact,
  nextFollowUp: r.next_follow_up,
  startupsShown: r.startups_shown,
  matchesMade: r.matches_made,
  notes: r.notes,
  status: r.status,
});

// ── Converts camelCase to snake_case for Supabase ──
const fromStartup = (d) => ({
  startup_name: d.startupName,
  founder_name: d.founderName,
  phone: d.phone,
  email: d.email,
  linked_in: d.linkedIn,
  industry: d.industry,
  startup_stage: d.startupStage,
  source: d.source,
  pipeline_stage: d.pipelineStage,
  last_contact_date: d.lastContactDate || null,
  next_follow_up_date: d.nextFollowUpDate || null,
  validation_score: d.validationScore || null,
  investor_match: d.investorMatch,
  notes: d.notes,
  status: d.status,
});

const fromInvestor = (d) => ({
  investor_name: d.investorName,
  fund: d.fund,
  email: d.email,
  linked_in: d.linkedIn,
  type: d.type,
  ticket_size_min: d.ticketSizeMin || null,
  ticket_size_max: d.ticketSizeMax || null,
  sectors: d.sectors,
  source: d.source,
  pipeline_stage: d.pipelineStage,
  last_contact: d.lastContact || null,
  next_follow_up: d.nextFollowUp || null,
  startups_shown: d.startupsShown || 0,
  matches_made: d.matchesMade || 0,
  notes: d.notes,
  status: d.status,
});

const useInvestmentStore = create((set, get) => ({
  startups: [],
  investors: [],
  activeTab: 'startups',
  loading: false,
  error: null,

  setActiveTab: (tab) => set({ activeTab: tab }),

  // ── FETCH ──
  fetchStartups: async () => {
    set({ loading: true });
    const { data, error } = await supabase
      .from('startups')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) { set({ error: error.message, loading: false }); return; }
    set({ startups: data.map(toStartup), loading: false });
  },

  fetchInvestors: async () => {
    set({ loading: true });
    const { data, error } = await supabase
      .from('investors')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) { set({ error: error.message, loading: false }); return; }
    set({ investors: data.map(toInvestor), loading: false });
  },

  // ── STARTUP ACTIONS ──
  addStartup: async (data) => {
  const { data: { user } } = await supabase.auth.getUser();
  const { data: inserted, error } = await supabase
    .from('startups').insert([{ ...fromStartup(data), created_by: user.id }]).select().single();
    if (error) { alert('Error adding startup: ' + error.message); return; }
    set((s) => ({ startups: [toStartup(inserted), ...s.startups] }));
  },

  updateStartup: async (id, data) => {
    const { error } = await supabase
      .from('startups').update({ ...fromStartup(data), updated_at: new Date().toISOString() }).eq('id', id);
    if (error) { alert('Error updating startup: ' + error.message); return; }
    set((s) => ({ startups: s.startups.map((x) => x.id === id ? { ...x, ...data } : x) }));
  },

  deleteStartup: async (id) => {
    const { error } = await supabase.from('startups').delete().eq('id', id);
    if (error) { alert('Error deleting startup: ' + error.message); return; }
    set((s) => ({ startups: s.startups.filter((x) => x.id !== id) }));
  },

  updateStartupStage: async (id, newStage) => {
    const { error } = await supabase
      .from('startups').update({ pipeline_stage: newStage, updated_at: new Date().toISOString() }).eq('id', id);
    if (error) { alert('Error updating stage: ' + error.message); return; }
    set((s) => ({ startups: s.startups.map((x) => x.id === id ? { ...x, pipelineStage: newStage } : x) }));
  },

  // ── INVESTOR ACTIONS ──
  addInvestor: async (data) => {
  const { data: { user } } = await supabase.auth.getUser();
  const { data: inserted, error } = await supabase
    .from('investors').insert([{ ...fromInvestor(data), created_by: user.id }]).select().single();
    if (error) { alert('Error adding investor: ' + error.message); return; }
    set((s) => ({ investors: [toInvestor(inserted), ...s.investors] }));
  },

  updateInvestor: async (id, data) => {
    const { error } = await supabasee
      .from('investors').update({ ...fromInvestor(data), updated_at: new Date().toISOString() }).eq('id', id);
    if (error) { alert('Error updating investor: ' + error.message); return; }
    set((s) => ({ investors: s.investors.map((x) => x.id === id ? { ...x, ...data } : x) }));
  },

  deleteInvestor: async (id) => {
    const { error } = await supabase.from('investors').delete().eq('id', id);
    if (error) { alert('Error deleting investor: ' + error.message); return; }
    set((s) => ({ investors: s.investors.filter((x) => x.id !== id) }));
  },

  updateInvestorStage: async (id, newStage) => {
    const { error } = await supabase
      .from('investors').update({ pipeline_stage: newStage, updated_at: new Date().toISOString() }).eq('id', id);
    if (error) { alert('Error updating stage: ' + error.message); return; }
    set((s) => ({ investors: s.investors.map((x) => x.id === id ? { ...x, pipelineStage: newStage } : x) }));
  },
}));

export default useInvestmentStore;