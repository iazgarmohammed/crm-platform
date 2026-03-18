import { create } from 'zustand';
import { supabase } from '../supabaseClient';

export const FUNNEL_STAGES = ['Awareness', 'Interest', 'Lead', 'Nurturing', 'Converted', 'Lost'];
export const LEAD_TYPES = ['Startup', 'Investor', 'School', 'Creator', 'Student'];
export const SOURCE_CHANNELS = ['LinkedIn', 'Instagram', 'WhatsApp', 'Referral', 'Cold Email', 'Event'];
export const MARKETING_STATUS = ['Active', 'Converted', 'Lost', 'Paused'];

const toLead = (r) => ({
  id: r.id,
  createdAt: r.created_at,
  leadName: r.lead_name,
  leadType: r.lead_type,
  contact: r.contact,
  sourceChannel: r.source_channel,
  campaignName: r.campaign_name,
  assignedTo: r.assigned_to,
  funnelStage: r.funnel_stage,
  leadDate: r.lead_date,
  lastTouchpoint: r.last_touchpoint,
  nextActionDate: r.next_action_date,
  conversionDate: r.conversion_date,
  notes: r.notes,
  status: r.status,
});

const fromLead = (d) => ({
  lead_name: d.leadName,
  lead_type: d.leadType,
  contact: d.contact,
  source_channel: d.sourceChannel,
  campaign_name: d.campaignName,
  assigned_to: d.assignedTo,
  funnel_stage: d.funnelStage,
  lead_date: d.leadDate || null,
  last_touchpoint: d.lastTouchpoint || null,
  next_action_date: d.nextActionDate || null,
  conversion_date: d.conversionDate || null,
  notes: d.notes,
  status: d.status,
});

const toCampaign = (r) => ({
  id: r.id,
  createdAt: r.created_at,
  campaignName: r.campaign_name,
  channel: r.channel,
  targetAudience: r.target_audience,
  startDate: r.start_date,
  endDate: r.end_date,
  reach: r.reach,
  clicks: r.clicks,
  leadsGenerated: r.leads_generated,
  conversions: r.conversions,
  cost: r.cost,
  notes: r.notes,
});

const fromCampaign = (d) => ({
  campaign_name: d.campaignName,
  channel: d.channel,
  target_audience: d.targetAudience,
  start_date: d.startDate || null,
  end_date: d.endDate || null,
  reach: d.reach || null,
  clicks: d.clicks || null,
  leads_generated: d.leadsGenerated || null,
  conversions: d.conversions || null,
  cost: d.cost || null,
  notes: d.notes,
});

const useMarketingStore = create((set, get) => ({
  leads: [],
  campaigns: [],
  loading: false,

  fetchLeads: async () => {
    set({ loading: true });
    const { data, error } = await supabase
      .from('leads').select('*').order('created_at', { ascending: false });
    if (error) { set({ loading: false }); return; }
    set({ leads: data.map(toLead), loading: false });
  },

  fetchCampaigns: async () => {
    const { data, error } = await supabase
      .from('campaigns').select('*').order('created_at', { ascending: false });
    if (error) return;
    set({ campaigns: data.map(toCampaign) });
  },

  addLead: async (data) => {
  const { data: { user } } = await supabase.auth.getUser();
  const { data: inserted, error } = await supabase
    .from('leads').insert([{ ...fromLead(data), created_by: user.id }]).select().single();
  if (error) { alert('Error: ' + error.message); return; }
  set((s) => ({ leads: [toLead(inserted), ...s.leads] }));
},
    if (error) { alert('Error: ' + error.message); return; }
    set((s) => ({ leads: [toLead(inserted), ...s.leads] }));
  },

  updateLead: async (id, data) => {
    const { error } = await supabase
      .from('leads').update({ ...fromLead(data), updated_at: new Date().toISOString() }).eq('id', id);
    if (error) { alert('Error: ' + error.message); return; }
    set((s) => ({ leads: s.leads.map((x) => x.id === id ? { ...x, ...data } : x) }));
  },

  deleteLead: async (id) => {
    const { error } = await supabase.from('leads').delete().eq('id', id);
    if (error) { alert('Error: ' + error.message); return; }
    set((s) => ({ leads: s.leads.filter((x) => x.id !== id) }));
  },

  updateLeadStage: async (id, newStage) => {
    const { error } = await supabase
      .from('leads').update({ funnel_stage: newStage, updated_at: new Date().toISOString() }).eq('id', id);
    if (error) { alert('Error: ' + error.message); return; }
    set((s) => ({ leads: s.leads.map((x) => x.id === id ? { ...x, funnelStage: newStage } : x) }));
  },

  addCampaign: async (data) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data: inserted, error } = await supabase
      .from('campaigns').insert([{ ...fromCampaign(data), created_by: user.id }]).select().single();
    if (error) { alert('Error: ' + error.message); return; }
    set((s) => ({ campaigns: [toCampaign(inserted), ...s.campaigns] }));
  },
    if (error) { alert('Error: ' + error.message); return; }
    set((s) => ({ campaigns: [toCampaign(inserted), ...s.campaigns] }));
  },

  updateCampaign: async (id, data) => {
    const { error } = await supabase
      .from('campaigns').update(fromCampaign(data)).eq('id', id);
    if (error) { alert('Error: ' + error.message); return; }
    set((s) => ({ campaigns: s.campaigns.map((x) => x.id === id ? { ...x, ...data } : x) }));
  },

  deleteCampaign: async (id) => {
    const { error } = await supabase.from('campaigns').delete().eq('id', id);
    if (error) { alert('Error: ' + error.message); return; }
    set((s) => ({ campaigns: s.campaigns.filter((x) => x.id !== id) }));
  },
}));

export default useMarketingStore;