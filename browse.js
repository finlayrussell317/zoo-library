// ── Zoo Library — Browse Logic ───────────────────────────────

(function () {

  const grid      = document.getElementById('test-grid');
  const emptyMsg  = document.getElementById('empty-msg');
  const searchEl  = document.getElementById('search');
  const yearEl    = document.getElementById('year-filter');

  // Populate year dropdown from data
  const years = [...new Set(TESTS.map(t => t.year))].sort((a, b) => b - a);
  years.forEach(y => {
    const opt = document.createElement('option');
    opt.value = y;
    opt.textContent = y;
    yearEl.appendChild(opt);
  });

  function render() {
    const query = searchEl.value.trim().toLowerCase();
    const year  = yearEl.value;

    const filtered = TESTS.filter(t => {
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
      const row = document.createElement('div');
      row.className = 'test-row';

      const uploaderText = t.uploader === 'Anonymous'
        ? 'Anonymous'
        : t.uploader;

      row.innerHTML = `
        <span class="test-type">${escHtml(t.type)}</span>
        <div class="test-info">
          <div class="test-course">${escHtml(t.course)}</div>
          <div class="test-meta">${escHtml(t.year)} &bull; ${escHtml(uploaderText)}</div>
        </div>
        <a class="test-link" href="${escHtml(t.url)}" target="_blank" rel="noopener">View &rarr;</a>
      `;

      grid.appendChild(row);
    });
  }

  function escHtml(str) {
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
