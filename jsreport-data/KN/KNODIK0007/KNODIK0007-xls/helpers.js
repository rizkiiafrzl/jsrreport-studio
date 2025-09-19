async function beforeRender(req, res) {
  // === Provide print date/time for header ===
  const now = new Date();
  req.data.printDate = now.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
  req.data.printTime = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  // === Guard minimal data ===
  if (!req.data.period) {
    req.data.period = '01-07-2025';
  }
  if (!req.data.year) {
    req.data.year = '2025';
  }
  if (!req.data.title) {
    req.data.title = 'REKAP GTK PER PROVINSI (PAUD, TK, SD, SMP)';
  }
}

