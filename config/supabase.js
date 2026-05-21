const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'https://nbwdfljtcgmubkhjxzbi.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5id2RmbGp0Y2dtdWJraGp4emJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxOTgxMDEsImV4cCI6MjA5NDc3NDEwMX0.HX3KyZdRWyReTJRXcApZbfxut9N5wfvZRxaSuMDN3MY';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5id2RmbGp0Y2dtdWJraGp4emJpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTE5ODEwMSwiZXhwIjoyMDk0Nzc0MTAxfQ.jeHjhauNGe-_HarQTbVR_BMVB-rTgiuqNTnuVGbYQKk';

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  console.error('❌ Missing essential Supabase Environment Variables.');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

module.exports = { supabase, supabaseAdmin };