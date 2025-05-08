
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Supabase URL or Anon Key is missing!");
    throw new Error("Supabase URL or Anon Key must be provided");
}

export const supabase = createClient(supabaseUrl, supabaseKey);

