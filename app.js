const bodyEl = document.body;
const statusEl = document.getElementById('status');
const viewerHost = document.getElementById('viewerHost');
const openBtn = document.getElementById('openBtn');
const picker = document.getElementById('picker');

function setStatus(text, isWarn = false) {
  statusEl.textContent = text;
  statusEl.className = isWarn ? 'warn' : '';
}

function setHasFile(value) {
  bodyEl.classList.toggle('has-file', !!value);
}

async function renderCsvText(text, name = 'CSV') {
  setStatus(name);
  setHasFile(true);

  viewerHost.innerHTML = '';
  const viewer = document.createElement('csv-viewer');
  viewer.style.display = 'block';
  viewer.style.height = '100%';

  // Pass the file name to Grist so it can use it as the document name,
  // instead of showing the generic label.
  viewer.setAttribute('initial-content', text);
  viewer.setAttribute('name', name);
  viewer.setAttribute('single-page', '');
  viewer.setAttribute('loader', '');

  viewerHost.appendChild(viewer);
}

async function renderFromFile(file) {
  const text = await file.text();
  await renderCsvText(text, file.name || 'CSV');
}

async function renderFromHandle(fileHandle) {
  const file = await fileHandle.getFile();
  await renderFromFile(file);
}

openBtn.addEventListener('click', () => picker.click());

picker.addEventListener('change', async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    await renderFromFile(file);
  } catch (err) {
    console.error(err);
    setStatus('Errore aprendo il file', true);
  }
});

// File Handling API: the installed PWA receives the CSV here.
if ('launchQueue' in window) {
  launchQueue.setConsumer(async (launchParams) => {
    const handles = launchParams.files || [];
    if (!handles.length) return;
    try {
      await renderFromHandle(handles[0]);
    } catch (err) {
      console.error(err);
      setStatus('Errore aprendo il file', true);
    }
  });
}
