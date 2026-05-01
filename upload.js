// ── Zoo Library — Upload ─────────────────────────────────────

(function () {
  const dropZone   = document.getElementById('drop-zone');
  const fileInput  = document.getElementById('file-input');
  const fileNameEl = document.getElementById('file-name');
  const submitBtn  = document.getElementById('submit-btn');
  const statusMsg  = document.getElementById('status-msg');
  const courseEl   = document.getElementById('course');
  const suggestBox = document.getElementById('course-suggestions');

  let selectedFile = null;

  // ── Course autocomplete ──────────────────────────────────
  courseEl.addEventListener('input', () => {
    const val = courseEl.value.trim().toLowerCase();
    suggestBox.innerHTML = '';
    if (!val || !window.COURSES) { suggestBox.style.display = 'none'; return; }

    const matches = COURSES.filter(c => c.toLowerCase().includes(val)).slice(0, 8);
    if (matches.length === 0) { suggestBox.style.display = 'none'; return; }

    matches.forEach(c => {
      const item = document.createElement('div');
      item.className = 'suggestion-item';
      item.textContent = c;
      item.addEventListener('mousedown', () => {
        courseEl.value = c;
        suggestBox.style.display = 'none';
      });
      suggestBox.appendChild(item);
    });
    suggestBox.style.display = 'block';
  });

  document.addEventListener('click', e => {
    if (!courseEl.contains(e.target)) suggestBox.style.display = 'none';
  });

  // ── File drop zone ───────────────────────────────────────
  dropZone.addEventListener('click', () => fileInput.click());
  dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('drag-over'); });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
  dropZone.addEventListener('drop', e => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    if (e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]);
  });
  fileInput.addEventListener('change', () => { if (fileInput.files[0]) setFile(fileInput.files[0]); });

  function setFile(file) {
    selectedFile = file;
    fileNameEl.textContent = '✓ ' + file.name;
    fileNameEl.style.display = 'block';
  }

  // ── Submit ───────────────────────────────────────────────
  submitBtn.addEventListener('click', async () => {
    const course   = courseEl.value.trim();
    const testName = document.getElementById('test-name').value.trim();
    const year     = document.getElementById('year').value;
    const uploader = document.getElementById('uploader').value.trim();

    if (!course)       return showStatus('Please enter a course name.', 'error');
    if (!testName)     return showStatus('Please enter a test name (e.g. WPR 3).', 'error');
    if (!year)         return showStatus('Please select a year.', 'error');
    if (!selectedFile) return showStatus('Please select a file to upload.', 'error');
    if (selectedFile.size > 10 * 1024 * 1024) return showStatus('File too large. Max 10MB.', 'error');

    const isAnonymous = uploader === '';
    const bucket      = isAnonymous ? 'pending' : 'published';
    const safeName    = selectedFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath    = `${Date.now()}_${safeName}`;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Uploading...';
    showStatus('Uploading your file...', 'info');

    try {
      await db.storage.upload(bucket, filePath, selectedFile);
    } catch (e) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Test →';
      return showStatus('Upload failed: ' + e.message, 'error');
    }

    try {
      await db.insert('tests', {
        course,
        test_name: testName,
        year,
        uploader: uploader || null,
        file_path: filePath,
        bucket,
        approved: !isAnonymous
      });
    } catch (e) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Test →';
      return showStatus('Failed to save info: ' + e.message, 'error');
    }

    if (isAnonymous) {
      showStatus('✓ Uploaded! Your submission is under review. The academics officer will remove your name before publishing.', 'success');
    } else {
      showStatus('✓ Uploaded and published! Your test is now live on Zoo Library.', 'success');
    }
    submitBtn.textContent = 'Submitted!';
  });

  function showStatus(msg, type) {
    statusMsg.textContent = msg;
    statusMsg.className = 'status-msg status-' + type;
    statusMsg.style.display = 'block';
  }
})();
