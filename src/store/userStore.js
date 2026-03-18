import { create } from 'zustand';
import { supabase } from '../supabaseClient';

const toSnapshot = (r) => ({
  id: r.id,
  recordedAt: r.recorded_at,
  weekLabel: r.week_label,
  totalSignups: r.total_signups,
  newSignupsWeek: r.new_signups_week,
  dau: r.dau,
  mau: r.mau,
  deactivated: r.deactivated,
  deleted: r.deleted,
  startupUsers: r.startup_users,
  investorUsers: r.investor_users,
  creatorUsers: r.creator_users,
  studentUsers: r.student_users,
  signupSourceTop: r.signup_source_top,
  profileCompletionRate: r.profile_completion_rate,
  connectionsMade: r.connections_made,
  postsCreated: r.posts_created,
  notes: r.notes,
});

const fromSnapshot = (d) => ({
  week_label: d.weekLabel,
  total_signups: d.totalSignups || null,
  new_signups_week: d.newSignupsWeek || null,
  dau: d.dau || null,
  mau: d.mau || null,
  deactivated: d.deactivated || null,
  deleted: d.deleted || null,
  startup_users: d.startupUsers || null,
  investor_users: d.investorUsers || null,
  creator_users: d.creatorUsers || null,
  student_users: d.studentUsers || null,
  signup_source_top: d.signupSourceTop,
  profile_completion_rate: d.profileCompletionRate,
  connections_made: d.connectionsMade || null,
  posts_created: d.postsCreated || null,
  notes: d.notes,
});

const useUserStore = create((set) => ({
  snapshots: [],
  loading: false,

  fetchSnapshots: async () => {
    set({ loading: true });
    const { data, error } = await supabase
      .from('user_snapshots').select('*').order('recorded_at', { ascending: false });
    if (error) { set({ loading: false }); return; }
    set({ snapshots: data.map(toSnapshot), loading: false });
  },

  addSnapshot: async (data) => {
    const { data: inserted, error } = await supabase
      .from('user_snapshots').insert([fromSnapshot(data)]).select().single();
    if (error) { alert('Error: ' + error.message); return; }
    set((s) => ({ snapshots: [toSnapshot(inserted), ...s.snapshots] }));
  },

  updateSnapshot: async (id, data) => {
    const { error } = await supabase
      .from('user_snapshots').update(fromSnapshot(data)).eq('id', id);
    if (error) { alert('Error: ' + error.message); return; }
    set((s) => ({ snapshots: s.snapshots.map((x) => x.id === id ? { ...x, ...data } : x) }));
  },

  deleteSnapshot: async (id) => {
    const { error } = await supabase.from('user_snapshots').delete().eq('id', id);
    if (error) { alert('Error: ' + error.message); return; }
    set((s) => ({ snapshots: s.snapshots.filter((x) => x.id !== id) }));
  },
}));

export default useUserStore;