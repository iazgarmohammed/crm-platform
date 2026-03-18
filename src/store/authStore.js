import { create } from 'zustand';
import { supabase } from '../supabaseClient';

const useAuthStore = create((set) => ({
  user: null,
  profile: null,
  loading: true,

  // ── Initialize — check if already logged in ──
  init: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const { data: profile } = await supabase
        .from('profiles').select('*').eq('id', session.user.id).single();
      set({ user: session.user, profile, loading: false });
    } else {
      set({ user: null, profile: null, loading: false });
    }

    // Listen for auth changes
    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles').select('*').eq('id', session.user.id).single();
        set({ user: session.user, profile, loading: false });
      } else {
        set({ user: null, profile: null, loading: false });
      }
    });
  },

  // ── Login ──
  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return { data };
  },

  // ── Register ──
  register: async (email, password, fullName) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { error: error.message };
    if (data.user) {
      await supabase.from('profiles').insert([{
        id: data.user.id,
        full_name: fullName,
        role: 'user',
      }]);
    }
    return { data };
  },

  // ── Logout ──
  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, profile: null });
  },
}));

export default useAuthStore;