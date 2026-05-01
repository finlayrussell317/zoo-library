// ── Zoo Library — Browse ─────────────────────────────────────

(async function () {

  const grid       = document.getElementById('test-grid');
  const emptyMsg   = document.getElementById('empty-msg');
  const loadingMsg = document.getElementById('loading-msg');
  const searchEl   = document.getElementById('search');
  const yearEl     = document.getElementById('year-filter');

  let allTests = [];

  // Load approved tests from Supabase
  const { data, error } = await supabase
    .from('tests')
    .select('*')
    .eq('approved', true)
    .order('created_at', { ascending: false });

  loadingMsg.style.display = 'none';

  if (error) {
    emptyMsg.textContent = 'Failed to load tests. Please try again later.';
    emptyMsg.style.display = 'block';
    return;
  }

  allTests = data || [];

  // Populate year dropdown
  const years = [...new Set(allTests.map(t => t.year))].sort((a, b) => b - a);
  years.forEach(y => {
    const opt = document.createElement('option');
    opt.value = y;
    opt.textContent = y;
    yearEl.appendChild(opt);
  });

  function getFileType(path) {
    const ext = path.split('.').pop().toLowerCase();
    if (['jpg','jpeg','png','gif','webp'].includes(ext)) return 'IMG';
    if (['doc','docx'].includes(ext)) return 'DOC';
    return 'PDF';
  }

  function render() {
    const query = searchEl.value.trim().toLowerCase();
    const year  = yearEl.value;

    const filtered = allTests.filter(t => {
      const matchCourse = t.course.toLowerCase().includes(query);
      const matchYear   = year ? t.year === year : true;
      return matchCourse && matchYear;
    });

    grid.innerHTML = '';

    if (filtered.length === 0) {
      emptyMsg.style.display = 'block';
      return;
    }
    emptyMsg.style.display = 'none';

    filtered.forEach(t => {
      // Get public URL from published bucket
      const { data: urlData } = db.storage
        .from('published')
        .getPublicUrl(t.file_path);

      const fileUrl  = urlData?.publicUrl || '#';
      const fileType = getFileType(t.file_path);
      const uploader = t.uploader || 'Anonymous';

      const row = document.createElement('div');
      row.className = 'test-row';
      row.innerHTML = `
        <span class="test-type">${esc(fileType)}</span>
        <div class="test-info">
          <div class="test-course">${esc(t.course)}</div>
          <div class="test-meta">${esc(t.year)} &bull; ${esc(uploader)}</div>
        </div>
        <a class="test-link" href="${esc(fileUrl)}" target="_blank" rel="noopener">View &rarr;</a>
      `;
      grid.appendChild(row);
    });
  }

  function esc(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  searchEl.addEventListener('input', render);
  yearEl.addEventListener('change', render);
  render();

})();
