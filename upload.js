// ── Zoo Library — Upload ─────────────────────────────────────

(function () {

  const dropZone   = document.getElementById('drop-zone');
  const fileInput  = document.getElementById('file-input');
  const fileNameEl = document.getElementById('file-name');
  const submitBtn  = document.getElementById('submit-btn');
  const statusMsg  = document.getElementById('status-msg');

  let selectedFile = null;

  // Drop zone click
  dropZone.addEventListener('click', () => fileInput.click());

  // Drag over styling
  dropZone.addEventListener('dragover', e => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
  });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));

  // Drop file
  dropZone.addEventListener('drop', e => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file) setFile(file);
  });

  // Browse file
  fileInput.addEventListener('change', () => {
    if (fileInput.files[0]) setFile(fileInput.files[0]);
  });

  function setFile(file) {
    selectedFile = file;
    fileNameEl.textContent = '✓ ' + file.name;
    fileNameEl.style.display = 'block';
  }

  // Submit
  submitBtn.addEventListener('click', async () => {
    const course   = document.getElementById('course').value.trim();
    const year     = document.getElementById('year').value;
    const uploader = document.getElementById('uploader').value.trim();

    // Validation
    if (!course) return showStatus('Please enter a course name.', 'error');
    if (!year)   return showStatus('Please select a year.', 'error');
    if (!selectedFile) return showStatus('Please select a file to upload.', 'error');

    // File size check (10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      return showStatus('File is too large. Max size is 10MB.', 'error');
    }

    const isAnonymous = uploader === '';
    const bucket      = isAnonymous ? 'pending' : 'published';
    const safeName    = selectedFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath    = `${Date.now()}_${safeName}`;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Uploading...';
    showStatus('Uploading your file...', 'info');

    // Upload file to Supabase storage
    const { error: uploadError } = await db.storage
      .from(bucket)
      .upload(filePath, selectedFile);

    if (uploadError) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Test →';
      return showStatus('Upload failed: ' + uploadError.message, 'error');
    }

    // Insert record into database
    const { error: dbError } = await supabase
      .from('tests')
      .insert({
        course,
        year,
        uploader: uploader || null,
        file_path: filePath,
        bucket,
        approved: !isAnonymous
      });

    if (dbError) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Test →';
      return showStatus('Failed to save test info: ' + dbError.message, 'error');
    }

    // Success
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
