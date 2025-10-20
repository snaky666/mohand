
// Supabase Configuration
const SUPABASE_URL = 'https://uqirjzszhxgqecdinuot.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxaXJqenN6aHhncWVjZGludW90Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5Njk0NDksImV4cCI6MjA3NjU0NTQ0OX0.BPYKL2TaeIZayOPdI7-E0OHM3FuCZP15bsfPNSj_Zjk';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
