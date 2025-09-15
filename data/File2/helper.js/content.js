async function beforeRender(req, res) {
  // === Inject Handlebars helpers ===
  const helpers = `
function formatID(value) {
  if (value == null || isNaN(value)) return '-';
  return new Intl.NumberFormat('id-ID').format(Number(value));
}

function formatPercent(value, options) {
  const digits = (options && options.hash && options.hash.digits) ? options.hash.digits : 2;
  if (value == null || isNaN(value)) return '-';
  const n = Number(value);
  return n.toLocaleString('id-ID', { minimumFractionDigits: digits, maximumFractionDigits: digits }) + '%';
}

// Terima 'YYYY-MM-DD' atau ISO 'YYYY-MM-DDTHH:mm:ss'
function formatDate(input) {
  if (!input) return '-';
  let d;
  if (/^\\d{4}-\\d{2}-\\d{2}$/.test(input)) {
    const [y, m, day] = String(input).split('-').map(Number);
    d = new Date(y, m - 1, day);
  } else {
    d = new Date(input);
  }
  if (isNaN(d)) return String(input);
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatTime(input) {
  if (!input) return '-';
  const d = new Date(input);
  if (isNaN(d)) return '-';
  return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

// period "DD-MM-YYYY" → "YYYY"
function yearFrom(periodDDMMYYYY) {
  if (!periodDDMMYYYY) return '';
  const parts = String(periodDDMMYYYY).split('-');
  return parts.length === 3 ? parts[2] : '';
}

function zero() { return '0'; }
`;

  req.template = req.template || {};
  req.template.helpers = (req.template.helpers || '') + '\n' + helpers;

  // === Sanitize data: convert NaN/Infinity to null, safe for JSON/formatting ===
  function sanitize(v) {
    if (typeof v === 'number' && !Number.isFinite(v)) return null;
    if (Array.isArray(v)) return v.map(sanitize);
    if (v && typeof v === 'object') {
      const o = {};
      for (const k in v) o[k] = sanitize(v[k]);
      return o;
    }
    return v;
  }
  req.data = sanitize(req.data || {});

  // === Provide print date/time for header ===
  const now = new Date();
  req.data.printDate = now.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
  req.data.printTime = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  // === Guard header minimal ===
  if (!req.data.reportInfo) {
    req.data.reportInfo = { title: 'Rekap', province: '-', period: '-', generatedDate: now.toISOString() };
  }
}
