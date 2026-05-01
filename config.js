// ── Zoo Library — Supabase Config ───────────────────────────
const SUPABASE_URL  = 'https://khawsiazknputwhbxuis.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoYXdzaWF6a25wdXR3aGJ4dWlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NTUzNjUsImV4cCI6MjA5MzEzMTM2NX0.cPcd8vKXQ3ruuOxX7r-VTyuKKrUkO6wbGh1UPgX3sBo';

// Change this to whatever password you want for the admin page
const ADMIN_PASSWORD = 'zoolib2026';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
