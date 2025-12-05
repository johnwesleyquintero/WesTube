import { createClient } from '@supabase/supabase-js';

// Credentials provided for WesTube Engine v2.0
const SUPABASE_URL = "https://axxdmrxkuhnxoszooawa.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_YHoe1YXmF7F1kKvTWIzuiQ_l4yNNUW6"; // Using the key provided in prompt

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
