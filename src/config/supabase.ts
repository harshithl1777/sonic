import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vmsjtveboctuylqpznka.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
console.log(supabaseKey);
const supabase = createClient(supabaseUrl, supabaseKey as string);

export default supabase;
