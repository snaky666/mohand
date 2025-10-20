
// Supabase Configuration for GitHub Pages
// تكوين Supabase للعمل على GitHub Pages

const SUPABASE_URL = 'https://uqirjzszhxgqecdinuot.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxaXJqenN6aHhncWVjZGludW90Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5Njk0NDksImV4cCI6MjA3NjU0NTQ0OX0.BPYKL2TaeIZayOPdI7-E0OHM3FuCZP15bsfPNSj_Zjk';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxaXJqenN6aHhncWVjZGludW90Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDk2OTQ0OSwiZXhwIjoyMDc2NTQ1NDQ5fQ.hgO_aBKdVkQCNx8mlGF_c34fPPZCewL5xEiRNe_BRig';

// نسخة واحدة فقط من Supabase client (للاستخدام العام)
let supabase = null;

// نسخة واحدة فقط من Admin client (للاستخدام في صفحة الإدارة)
let supabaseAdmin = null;

// Initialize Supabase client
function initSupabase() {
  if (supabase) return supabase;
  
  try {
    if (typeof window !== 'undefined' && window.supabase && window.supabase.createClient) {
      const options = {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
        global: {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      };
      
      supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, options);
      console.log('✅ Supabase client initialized');
      return supabase;
    }
  } catch (error) {
    console.error('❌ Failed to initialize Supabase:', error);
  }
  return null;
}

// Initialize Supabase Admin client
function initSupabaseAdmin() {
  if (supabaseAdmin) return supabaseAdmin;
  
  try {
    if (typeof window !== 'undefined' && window.supabase && window.supabase.createClient) {
      const options = {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
        global: {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      };
      
      supabaseAdmin = window.supabase.createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, options);
      console.log('✅ Supabase Admin client initialized');
      return supabaseAdmin;
    }
  } catch (error) {
    console.error('❌ Failed to initialize Supabase Admin:', error);
  }
  return null;
}

// Auto-initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSupabase);
} else {
  initSupabase();
}
