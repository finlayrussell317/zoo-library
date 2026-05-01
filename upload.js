// ── Zoo Library — Upload ─────────────────────────────────────

(function () {
  const dropZone   = document.getElementById('drop-zone');
  const fileInput  = document.getElementById('file-input');
  const fileNameEl = document.getElementById('file-name');
  const submitBtn  = document.getElementById('submit-btn');
  const statusMsg  = document.getElementById('status-msg');

  let selectedFile = null;

  dropZone.addEventListener('click', () => fileInput.click());

  dropZone.addEventListener('dragover', e => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
  });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
  dropZone.addEventListener('drop', e => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    if (e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]);
  });

  fileInput.addEventListener('change', () => {
    if (fileInput.files[0]) setFile(fileInput.files[0]);
  });

  function setFile(file) {
    selectedFile = file;
    fileNameEl.textContent = '✓ ' + file.name;
    fileNameEl.style.display = 'block';
  }

  submitBtn.addEventListener('click', async () => {
    const course   = document.getElementById('course').value.trim();
    const year     = document.getElementById('year').value;
    const uploader = document.getElementById('uploader').value.trim();

    if (!course)        return showStatus('Please enter a course name.', 'error');
    if (!year)          return showStatus('Please select a year.', 'error');
    if (!selectedFile)  return showStatus('Please select a file to upload.', 'error');
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
