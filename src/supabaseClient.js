import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.https://spighipsqzgluvzkloyx.supabase.co;
const SUPABASE_ANON_KEY = import.meta.env.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwaWdoaXBzcXpnbHV2emtsb3l4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4MjA3ODQsImV4cCI6MjA4OTM5Njc4NH0.wGuCtbElANXnPR06MIau4EZSfc8SgXjXw_dJp1UOl-Q;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);