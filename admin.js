// ── Zoo Library — Admin ──────────────────────────────────────

(function () {

  const gate        = document.getElementById('admin-gate');
  const panel       = document.getElementById('admin-panel');
  const loginBtn    = document.getElementById('login-btn');
  const loginError  = document.getElementById('login-error');
  const passwordEl  = document.getElementById('password-input');

  // Password gate
  loginBtn.addEventListener('click', () => {
    if (passwordEl.value === ADMIN_PASSWORD) {
      gate.style.display  = 'none';
      panel.style.display = 'block';
      loadAll();
    } else {
      loginError.style.display = 'block';
    }
  });

  passwordEl.addEventListener('keydown', e => {
    if (e.key === 'Enter') loginBtn.click();
  });

  async function loadAll() {
    await loadPending();
    await loadApproved();
  }

  async function loadPending() {
    const list     = document.getElementById('pending-list');
    const empty    = document.getElementById('pending-empty');
    const countEl  = document.getElementById('pending-count');

    const { data } = await supabase
      .from('tests')
      .select('*')
      .eq('approved', false)
      .order('created_at', { ascending: false });

    list.innerHTML = '';
    countEl.textContent = data?.length ? `(${data.length})` : '';

    if (!data || data.length === 0) {
      empty.style.display = 'block';
      return;
    }

    empty.style.display = 'none';
    data.forEach(t => list.appendChild(makePendingRow(t)));
  }

  async function loadApproved() {
    const list    = document.getElementById('approved-list');
    const empty   = document.getElementById('approved-empty');
    const countEl = document.getElementById('approved-count');

    const { data } = await supabase
      .from('tests')
      .select('*')
      .eq('approved', true)
      .order('created_at', { ascending: false });

    list.innerHTML = '';
    countEl.textContent = data?.length ? `(${data.length})` : '';

    if (!data || data.length === 0) {
      empty.style.display = 'block';
      return;
    }

    empty.style.display = 'none';
    data.forEach(t => list.appendChild(makeApprovedRow(t)));
  }

  function makePendingRow(t) {
    const row = document.createElement('div');
    row.className = 'test-row';
    row.id = 'row-' + t.id;

    const uploader = t.uploader || 'Anonymous';
    const isAnon   = !t.uploader;

    // Get download URL from pending bucket
    const { data: urlData } = db.storage
      .from('pending')
      .getPublicUrl(t.file_path);

    row.innerHTML = `
      <div class="test-info">
        <div class="test-course">${esc(t.course)}</div>
        <div class="test-meta">${esc(t.year)} &bull; ${esc(uploader)} ${isAnon ? '<span class="anon-badge">ANON</span>' : ''}</div>
      </div>
      <div class="admin-actions">
        <a class="btn-admin btn-download" href="${esc(urlData?.publicUrl || '#')}" target="_blank">Download</a>
        <button class="btn-admin btn-approve" onclick="approveTest('${t.id}', '${esc(t.file_path)}', '${esc(t.course)}', '${esc(t.year)}', '${esc(uploader)}')">Approve</button>
        <button class="btn-admin btn-reject" onclick="rejectTest('${t.id}', '${esc(t.file_path)}')">Delete</button>
      </div>
    `;
    return row;
  }

  function makeApprovedRow(t) {
    const row = document.createElement('div');
    row.className = 'test-row';
    row.id = 'row-' + t.id;

    const uploader = t.uploader || 'Anonymous';

    const { data: urlData } = db.storage
      .from('published')
      .getPublicUrl(t.file_path);

    row.innerHTML = `
      <div class="test-info">
        <div class="test-course">${esc(t.course)}</div>
        <div class="test-meta">${esc(t.year)} &bull; ${esc(uploader)}</div>
      </div>
      <div class="admin-actions">
        <a class="btn-admin btn-download" href="${esc(urlData?.publicUrl || '#')}" target="_blank">View</a>
        <button class="btn-admin btn-reject" onclick="rejectTest('${t.id}', '${esc(t.file_path)}', true)">Remove</button>
      </div>
    `;
    return row;
  }

  // Expose to inline onclick handlers
  window.approveTest = async function(id, filePath, course, year, uploader) {
    if (!confirm(`Approve "${course}" (${year}) by ${uploader}?`)) return;

    // Move file from pending to published bucket
    const { error: copyError } = await db.storage
      .from('pending')
      .move(filePath, filePath);  // Can't cross-bucket move in client; we update DB and re-upload

    // Download from pending
    const { data: fileData, error: dlError } = await db.storage
      .from('pending')
      .download(filePath);

    if (dlError) { alert('Failed to download file: ' + dlError.message); return; }

    // Upload to published
    const { error: upError } = await db.storage
      .from('published')
      .upload(filePath, fileData, { upsert: true });

    if (upError) { alert('Failed to move file: ' + upError.message); return; }

    // Update DB record
    const { error: dbError } = await supabase
      .from('tests')
      .update({ approved: true, bucket: 'published' })
      .eq('id', id);

    if (dbError) { alert('Failed to update record: ' + dbError.message); return; }

    // Delete from pending
    await db.storage.from('pending').remove([filePath]);

    await loadAll();
  };

  window.rejectTest = async function(id, filePath, isPublished = false) {
    if (!confirm('Are you sure you want to delete this test? This cannot be undone.')) return;

    const bucket = isPublished ? 'published' : 'pending';
    await db.storage.from(bucket).remove([filePath]);
    await db.from('tests').delete().eq('id', id);
    await loadAll();
  };

  function esc(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

})();
