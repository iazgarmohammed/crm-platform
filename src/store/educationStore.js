import { create } from 'zustand';
import { supabase } from '../supabaseClient';

export const EDUCATION_STAGES = [
  'Identified', 'Contacted', 'Responded', 'Deck Sent',
  'Meeting Requested', 'Proposal Submitted', 'Negotiating',
  'Confirmed', 'Delivered', 'Not Interested',
];
export const INSTITUTION_TYPES = ['School', 'Junior College', 'Degree College', 'MBA Institute'];
export const CONTACT_ROLES = ['Principal', 'HOD', 'Placement Officer', 'Dean', 'Teacher'];
export const PROGRAM_INTERESTS = ['Junior MBA', 'Webinar', 'Seminar', 'Workshop'];
export const EDUCATION_STATUS = ['Active', 'Confirmed', 'Delivered', 'Not Interested', 'Paused'];
export const REFERRAL_SOURCES = ['Intern', 'Network', 'Cold Outreach', 'Event'];

const toInstitution = (r) => ({
  id: r.id,
  createdAt: r.created_at,
  institutionName: r.institution_name,
  type: r.type,
  city: r.city,
  contactPerson: r.contact_person,
  role: r.role,
  phone: r.phone,
  email: r.email,
  linkedIn: r.linked_in,
  programInterest: r.program_interest || [],
  batchSize: r.batch_size,
  pipelineStage: r.pipeline_stage,
  lastContact: r.last_contact,
  nextFollowUp: r.next_follow_up,
  programDate: r.program_date,
  feeAgreed: r.fee_agreed,
  referralSource: r.referral_source,
  notes: r.notes,
  status: r.status,
});

const fromInstitution = (d) => ({
  institution_name: d.institutionName,
  type: d.type,
  city: d.city,
  contact_person: d.contactPerson,
  role: d.role,
  phone: d.phone,
  email: d.email,
  linked_in: d.linkedIn,
  program_interest: d.programInterest || [],
  batch_size: d.batchSize || null,
  pipeline_stage: d.pipelineStage,
  last_contact: d.lastContact || null,
  next_follow_up: d.nextFollowUp || null,
  program_date: d.programDate || null,
  fee_agreed: d.feeAgreed || null,
  referral_source: d.referralSource,
  notes: d.notes,
  status: d.status,
});

const useEducationStore = create((set, get) => ({
  institutions: [],
  loading: false,

  fetchInstitutions: async () => {
    set({ loading: true });
    const { data, error } = await supabase
      .from('institutions')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) { set({ loading: false }); return; }
    set({ institutions: data.map(toInstitution), loading: false });
  },

  addInstitution: async (data) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data: inserted, error } = await supabase
      .from('institutions').insert([{ ...fromInstitution(data), created_by: user.id }]).select().single();
    if (error) { alert('Error: ' + error.message); return; }
    set((s) => ({ institutions: [toInstitution(inserted), ...s.institutions] }));
  },

  updateInstitution: async (id, data) => {
    const { error } = await supabase
      .from('institutions').update({ ...fromInstitution(data), updated_at: new Date().toISOString() }).eq('id', id);
    if (error) { alert('Error: ' + error.message); return; }
    set((s) => ({ institutions: s.institutions.map((x) => x.id === id ? { ...x, ...data } : x) }));
  },

  deleteInstitution: async (id) => {
    const { error } = await supabase.from('institutions').delete().eq('id', id);
    if (error) { alert('Error: ' + error.message); return; }
    set((s) => ({ institutions: s.institutions.filter((x) => x.id !== id) }));
  },

  updateInstitutionStage: async (id, newStage) => {
    const { error } = await supabase
      .from('institutions').update({ pipeline_stage: newStage, updated_at: new Date().toISOString() }).eq('id', id);
    if (error) { alert('Error: ' + error.message); return; }
    set((s) => ({ institutions: s.institutions.map((x) => x.id === id ? { ...x, pipelineStage: newStage } : x) }));
  },
}));

export default useEducationStore;