import { create } from 'zustand';
import { supabase } from '../supabaseClient';

export const CREATOR_STAGES = [
  'Identified', 'Contacted', 'Responded', 'Briefed',
  'Agreed', 'Onboarded', 'Active', 'Inactive', 'Churned',
];
export const CONTENT_NICHES = ['Startup', 'Finance', 'Marketing', 'Tech', 'Education', 'Other'];
export const CREATOR_STATUS = ['Active', 'Inactive', 'Onboarded', 'Churned', 'Blocked'];
export const QUALITY_OPTIONS = ['High', 'Medium', 'Low'];
export const SOURCE_OPTIONS = ['Instagram', 'LinkedIn', 'YouTube', 'Podcast', 'Referral'];

const toCreator = (r) => ({
  id: r.id,
  createdAt: r.created_at,
  creatorName: r.creator_name,
  platformHandle: r.platform_handle,
  contentNiche: r.content_niche || [],
  followerCount: r.follower_count,
  contact: r.contact,
  source: r.source,
  pipelineStage: r.pipeline_stage,
  onboardDate: r.onboard_date,
  totalPosts: r.total_posts,
  lastPostDate: r.last_post_date,
  postsThisWeek: r.posts_this_week,
  contentQuality: r.content_quality,
  engagementRate: r.engagement_rate,
  notes: r.notes,
  status: r.status,
});

const fromCreator = (d) => ({
  creator_name: d.creatorName,
  platform_handle: d.platformHandle,
  content_niche: d.contentNiche || [],
  follower_count: d.followerCount || null,
  contact: d.contact,
  source: d.source,
  pipeline_stage: d.pipelineStage,
  onboard_date: d.onboardDate || null,
  total_posts: d.totalPosts || 0,
  last_post_date: d.lastPostDate || null,
  posts_this_week: d.postsThisWeek || 0,
  content_quality: d.contentQuality,
  engagement_rate: d.engagementRate,
  notes: d.notes,
  status: d.status,
});

const useCreatorStore = create((set) => ({
  creators: [],
  loading: false,

  fetchCreators: async () => {
    set({ loading: true });
    const { data, error } = await supabase
      .from('creators').select('*').order('created_at', { ascending: false });
    if (error) { set({ loading: false }); return; }
    set({ creators: data.map(toCreator), loading: false });
  },

  addCreator: async (data) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data: inserted, error } = await supabase
      .from('creators').insert([{ ...fromCreator(data), created_by: user.id }]).select().single();
    if (error) { alert('Error: ' + error.message); return; }
    set((s) => ({ creators: [toCreator(inserted), ...s.creators] }));
  },

  updateCreator: async (id, data) => {
    if (error) { alert('Error: ' + error.message); return; }
    set((s) => ({ creators: [toCreator(inserted), ...s.creators] }));
  },

  updateCreator: async (id, data) => {
    const { error } = await supabase
      .from('creators').update({ ...fromCreator(data), updated_at: new Date().toISOString() }).eq('id', id);
    if (error) { alert('Error: ' + error.message); return; }
    set((s) => ({ creators: s.creators.map((x) => x.id === id ? { ...x, ...data } : x) }));
  },

  deleteCreator: async (id) => {
    const { error } = await supabase.from('creators').delete().eq('id', id);
    if (error) { alert('Error: ' + error.message); return; }
    set((s) => ({ creators: s.creators.filter((x) => x.id !== id) }));
  },

  updateCreatorStage: async (id, newStage) => {
    const { error } = await supabase
      .from('creators').update({ pipeline_stage: newStage, updated_at: new Date().toISOString() }).eq('id', id);
    if (error) { alert('Error: ' + error.message); return; }
    set((s) => ({ creators: s.creators.map((x) => x.id === id ? { ...x, pipelineStage: newStage } : x) }));
  },
}));

export default useCreatorStore;