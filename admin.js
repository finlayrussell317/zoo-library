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
    const data    = await db.select('tests', 'approved=eq.false&order=created_at.desc');
    list.innerHTML = '';
    countEl.textContent = data?.length ? `(${data.length})` : '';
    if (!data || data.length === 0) { empty.style.display = 'block'; return; }
    empty.style.display = 'none';
    data.forEach(t => list.appendChild(makePendingRow(t)));
  }

  async function loadApproved() {
    const list    = document.getElementById('approved-list');
    const empty   = document.getElementById('approved-empty');
    const countEl = document.getElementById('approved-count');
    const data    = await db.select('tests', 'approved=eq.true&order=created_at.desc');
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
    row.innerHTML = `
      <div class="test-info">
        <div class="test-course">${esc(t.course)}</div>
        <div class="test-meta">${esc(t.year)} &bull; ${esc(uploader)} ${isAnon ? '<span class="anon-badge">ANON</span>' : ''}</div>
      </div>
      <div class="admin-actions">
        <a class="btn-admin btn-download" href="${esc(fileUrl)}" target="_blank">Download</a>
        <button class="btn-admin btn-approve" onclick="approveTest('${t.id}','${esc(t.file_path)}')">Approve</button>
        <button class="btn-admin btn-reject" onclick="rejectTest('${t.id}','${esc(t.file_path)}',false)">Delete</button>
      </div>`;
    return row;
  }

  function makeApprovedRow(t) {
    const row = document.createElement('div');
    row.className = 'test-row';
    const fileUrl = db.storage.publicUrl('published', t.file_path);
    row.innerHTML = `
      <div class="test-info">
        <div class="test-course">${esc(t.course)}</div>
        <div class="test-meta">${esc(t.year)} &bull; ${esc(t.uploader || 'Anonymous')}</div>
      </div>
      <div class="admin-actions">
        <a class="btn-admin btn-download" href="${esc(fileUrl)}" target="_blank">View</a>
        <button class="btn-admin btn-reject" onclick="rejectTest('${t.id}','${esc(t.file_path)}',true)">Remove</button>
      </div>`;
    return row;
  }

  window.approveTest = async function(id, filePath) {
    if (!confirm('Approve this test?')) return;
    try {
      const blob = await db.storage.download('pending', filePath);
      await db.storage.upload('published', filePath, blob);
      await db.update('tests', { approved: true, bucket: 'published' }, `id=eq.${id}`);
      await db.storage.remove('pending', [filePath]);
      await loadAll();
    } catch (e) {
      alert('Error: ' + e.message);
    }
  };

  window.rejectTest = async function(id, filePath, isPublished) {
    if (!confirm('Delete this test? Cannot be undone.')) return;
    try {
      const bucket = isPublished ? 'published' : 'pending';
      await db.storage.remove(bucket, [filePath]);
      await db.delete('tests', `id=eq.${id}`);
      await loadAll();
    } catch (e) {
      alert('Error: ' + e.message);
    }
  };

  function esc(str) {
    return String(str||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
})();
