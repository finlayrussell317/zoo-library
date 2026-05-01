// ── Zoo Library — Browse ─────────────────────────────────────

(async function () {
  const foldersEl = document.getElementById('course-folders');
  const emptyMsg  = document.getElementById('empty-msg');
  const loadingMsg= document.getElementById('loading-msg');
  const searchEl  = document.getElementById('search');
  const yearEl    = document.getElementById('year-filter');

  let allTests = [];

  try {
    allTests = await db.select('tests', 'approved=eq.true&order=created_at.desc&select=*');
  } catch (e) {
    loadingMsg.style.display = 'none';
    emptyMsg.textContent = 'Failed to load tests.';
    emptyMsg.style.display = 'block';
    return;
  }

  loadingMsg.style.display = 'none';

  // Populate year dropdown
  const years = [...new Set(allTests.map(t => t.year))].sort((a, b) => b - a);
  years.forEach(y => {
    const opt = document.createElement('option');
    opt.value = y;
    opt.textContent = y;
    yearEl.appendChild(opt);
  });

  function getFileType(path) {
    const ext = (path || '').split('.').pop().toLowerCase();
    if (['jpg','jpeg','png','gif','webp'].includes(ext)) return 'IMG';
    if (['doc','docx'].includes(ext)) return 'DOC';
    return 'PDF';
  }

  function render() {
    const query = searchEl.value.trim().toLowerCase();
    const year  = yearEl.value;

    const filtered = allTests.filter(t => {
      const matchCourse = (t.course || '').toLowerCase().includes(query);
      const matchYear   = year ? t.year === year : true;
      return matchCourse && matchYear;
    });

    foldersEl.innerHTML = '';

    if (filtered.length === 0) {
      emptyMsg.style.display = 'block';
      return;
    }
    emptyMsg.style.display = 'none';

    // Group by course
    const groups = {};
    filtered.forEach(t => {
      const key = t.course || 'Unknown';
      if (!groups[key]) groups[key] = [];
      groups[key].push(t);
    });

    // Sort courses alphabetically
    const sortedCourses = Object.keys(groups).sort();

    sortedCourses.forEach(course => {
      const tests = groups[course].sort((a, b) => {
        // Sort by year desc, then test_name asc
        if (b.year !== a.year) return b.year.localeCompare(a.year);
        return (a.test_name || '').localeCompare(b.test_name || '');
      });

      const folder = document.createElement('div');
      folder.className = 'course-folder';

      const header = document.createElement('div');
      header.className = 'folder-header';
      header.innerHTML = `
        <span class="folder-icon">&#9654;</span>
        <span class="folder-name">${esc(course)}</span>
        <span class="folder-count">${tests.length} test${tests.length !== 1 ? 's' : ''}</span>
      `;

      const body = document.createElement('div');
      body.className = 'folder-body';
      body.style.display = 'none';

      const grid = document.createElement('div');
      grid.className = 'test-grid';

      tests.forEach(t => {
        const fileUrl  = db.storage.publicUrl(t.bucket || 'published', t.file_path);
        const fileType = getFileType(t.file_path);
        const uploader = t.uploader || 'Anonymous';
        const testLabel = t.test_name ? t.test_name : 'Test';

        const row = document.createElement('div');
        row.className = 'test-row';
        row.innerHTML = `
          <span class="test-type">${esc(fileType)}</span>
          <div class="test-info">
            <div class="test-course">${esc(testLabel)}</div>
            <div class="test-meta">${esc(t.year)} &bull; ${esc(uploader)}</div>
          </div>
          <a class="test-link" href="${esc(fileUrl)}" target="_blank" rel="noopener">View &rarr;</a>
        `;
        grid.appendChild(row);
      });

      body.appendChild(grid);
      folder.appendChild(header);
      folder.appendChild(body);
      foldersEl.appendChild(folder);

      // Toggle open/close
      header.addEventListener('click', () => {
        const isOpen = body.style.display !== 'none';
        body.style.display = isOpen ? 'none' : 'block';
        header.querySelector('.folder-icon').innerHTML = isOpen ? '&#9654;' : '&#9660;';
        folder.classList.toggle('folder-open', !isOpen);
      });
    });
  }

  function esc(str) {
    return String(str||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  searchEl.addEventListener('input', render);
  yearEl.addEventListener('change', render);
  render();
})();
