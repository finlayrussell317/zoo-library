// ── Zoo Library — Admin ──────────────────────────────────────

(function () {
  const gate       = document.getElementById('admin-gate');
  const panel      = document.getElementById('admin-panel');
  const loginBtn   = document.getElementById('login-btn');
  const loginError = document.getElementById('login-error');
  const passwordEl = document.getElementById('password-input');

  loginBtn.addEventListener('click', () => {
    if (passwordEl.value === ADMIN_PASSWORD) {
      gate.style.display  = 'none';
      panel.style.display = 'block';
      loadAll();
    } else {
      loginError.style.display = 'block';
    }
  });
  passwordEl.addEventListener('keydown', e => { if (e.key === 'Enter') loginBtn.click(); });

  async function loadAll() {
    await loadPending();
    await loadApproved();
  }

  async function loadPending() {
    const list    = document.getElementById('pending-list');
    const empty   = document.getElementById('pending-empty');
    const countEl = document.getElementById('pending-count');
    const data    = await db.select('tests', 'approved=eq.false&order=created_at.desc&select=*');
    list.innerHTML = '';
    countEl.textContent = data?.length ? `(${data.length})` : '';
    if (!data || data.length === 0) { empty.style.display = 'block'; return; }
    empty.style.display = 'none';
    data.forEach(t => {
      console.log('pending row:', t); // debug
      list.appendChild(makePendingRow(t));
    });
  }

  async function loadApproved() {
    const list    = document.getElementById('approved-list');
    const empty   = document.getElementById('approved-empty');
    const countEl = document.getElementById('approved-count');
    const data    = await db.select('tests', 'approved=eq.true&order=created_at.desc&select=*');
    list.innerHTML = '';
    countEl.textContent = data?.length ? `(${data.length})` : '';
    if (!data || data.length === 0) { empty.style.display = 'block'; return; }
    empty.style.display = 'none';
    data.forEach(t => list.appendChild(makeApprovedRow(t)));
  }

  function makePendingRow(t) {
    const row = document.createElement('div');
    row.className = 'test-row';
    const uploader = t.uploader || 'Anonymous';
    const isAnon   = !t.uploader;
    const fileUrl  = db.storage.publicUrl('pending', t.file_path);

    const downloadBtn = document.createElement('a');
    downloadBtn.className = 'btn-admin btn-download';
    downloadBtn.href = fileUrl;
    downloadBtn.target = '_blank';
    downloadBtn.textContent = 'Download';

    const approveBtn = document.createElement('button');
    approveBtn.className = 'btn-admin btn-approve';
    approveBtn.textContent = 'Approve';
    approveBtn.addEventListener('click', () => {
      console.log('approving id:', t.id, 'path:', t.file_path);
      approveTest(t.id, t.file_path);
    });

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn-admin btn-reject';
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => {
      console.log('deleting id:', t.id, 'path:', t.file_path);
      rejectTest(t.id, t.file_path, false);
    });

    const actions = document.createElement('div');
    actions.className = 'admin-actions';
    actions.append(downloadBtn, approveBtn, deleteBtn);

    const info = document.createElement('div');
    info.className = 'test-info';
    info.innerHTML = `
      <div class="test-course">${esc(t.course)}</div>
      <div class="test-meta">${esc(t.year)} &bull; ${esc(uploader)} ${isAnon ? '<span class="anon-badge">ANON</span>' : ''}</div>
    `;

    row.append(info, actions);
    return row;
  }

  function makeApprovedRow(t) {
    const row = document.createElement('div');
    row.className = 'test-row';
    const fileUrl = db.storage.publicUrl('published', t.file_path);

    const viewBtn = document.createElement('a');
    viewBtn.className = 'btn-admin btn-download';
    viewBtn.href = fileUrl;
    viewBtn.target = '_blank';
    viewBtn.textContent = 'View';

    const removeBtn = document.createElement('button');
    removeBtn.className = 'btn-admin btn-reject';
    removeBtn.textContent = 'Remove';
    removeBtn.addEventListener('click', () => {
      console.log('removing id:', t.id, 'path:', t.file_path);
      rejectTest(t.id, t.file_path, true);
    });

    const actions = document.createElement('div');
    actions.className = 'admin-actions';
    actions.append(viewBtn, removeBtn);

    const info = document.createElement('div');
    info.className = 'test-info';
    info.innerHTML = `
      <div class="test-course">${esc(t.course)}</div>
      <div class="test-meta">${esc(t.year)} &bull; ${esc(t.uploader || 'Anonymous')}</div>
    `;

    row.append(info, actions);
    return row;
  }

  async function approveTest(id, filePath) {
    if (!id) { alert('Error: missing test ID'); return; }
    if (!confirm('Approve this test?')) return;
    try {
      const blob = await db.storage.download('pending', filePath);
      await db.storage.upload('published', filePath, blob);
      await db.update('tests', { approved: true, bucket: 'published' }, `id=eq.${id}`);
      try { await db.storage.remove('pending', filePath); } catch(e) {}
      await loadAll();
    } catch (e) {
      alert('Approve error: ' + e.message);
    }
  }

  async function rejectTest(id, filePath, isPublished) {
    if (!id) { alert('Error: missing test ID'); return; }
    if (!confirm('Delete this test? Cannot be undone.')) return;
    const bucket = isPublished ? 'published' : 'pending';
    try { await db.storage.remove(bucket, filePath); } catch(e) {}
    try {
      await db.delete('tests', `id=eq.${id}`);
      await loadAll();
    } catch (e) {
      alert('Delete error: ' + e.message);
    }
  }

  function esc(str) {
    return String(str||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
})();
