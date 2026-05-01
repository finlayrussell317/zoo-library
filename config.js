// ── Zoo Library — Supabase Config ───────────────────────────
const SUPABASE_URL  = 'https://khawsiazknputwhbxuis.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoYXdzaWF6a25wdXR3aGJ4dWlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NTUzNjUsImV4cCI6MjA5MzEzMTM2NX0.cPcd8vKXQ3ruuOxX7r-VTyuKKrUkO6wbGh1UPgX3sBo';
const ADMIN_PASSWORD = 'zoolib2026';

// ── REST API helpers (no external library needed) ────────────

const db = {
  headers: {
    'apikey': SUPABASE_ANON,
    'Authorization': `Bearer ${SUPABASE_ANON}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  },

  async select(table, filters = '') {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${filters}`, {
      headers: this.headers
    });
    return res.json();
  },

  async insert(table, data) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Insert failed');
    }
    return res.json();
  },

  async update(table, data, filter) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${filter}`, {
      method: 'PATCH',
      headers: { ...this.headers, 'Prefer': 'return=minimal' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Update failed');
  },

  async delete(table, filter) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${filter}`, {
      method: 'DELETE',
      headers: this.headers
    });
    if (!res.ok) throw new Error('Delete failed');
  },

  storage: {
    async upload(bucket, path, file) {
      const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${bucket}/${path}`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON,
          'Authorization': `Bearer ${SUPABASE_ANON}`,
          'Content-Type': file.type || 'application/octet-stream',
          'x-upsert': 'true'
        },
        body: file
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || err.error || 'Upload failed');
      }
      return res.json();
    },

    async download(bucket, path) {
      const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${bucket}/${path}`, {
        headers: {
          'apikey': SUPABASE_ANON,
          'Authorization': `Bearer ${SUPABASE_ANON}`
        }
      });
      if (!res.ok) throw new Error('Download failed');
      return res.blob();
    },

    async remove(bucket, paths) {
      // Try both delete endpoints for compatibility
      try {
        await fetch(`${SUPABASE_URL}/storage/v1/object/${bucket}/${paths[0]}`, {
          method: 'DELETE',
          headers: {
            'apikey': SUPABASE_ANON,
            'Authorization': `Bearer ${SUPABASE_ANON}`
          }
        });
      } catch(e) { /* ignore */ }
    },

    publicUrl(bucket, path) {
      return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
    }
  }
};
