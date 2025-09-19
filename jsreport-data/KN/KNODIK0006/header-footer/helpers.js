async function beforeRender(req, res) {
  // === Register Handlebars helpers ===
  const handlebars = require('handlebars');
  
  handlebars.registerHelper('formatID', function(value) {
    if (value == null || isNaN(value)) return '-';
    return new Intl.NumberFormat('id-ID').format(Number(value));
  });

  handlebars.registerHelper('formatPercent', function(value, options) {
    const digits = (options && options.hash && options.hash.digits) ? options.hash.digits : 2;
    if (value == null || isNaN(value)) return '-';
    const n = Number(value);
    return n.toLocaleString('id-ID', { minimumFractionDigits: digits, maximumFractionDigits: digits }) + '%';
  });

  handlebars.registerHelper('formatDate', function(input) {
    if (!input) return '-';
    let d;
    if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
      const [y, m, day] = String(input).split('-').map(Number);
      d = new Date(y, m - 1, day);
    } else {
      d = new Date(input);
    }
    if (isNaN(d)) return String(input);
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
  });

  handlebars.registerHelper('formatTime', function(input) {
    if (!input) return '-';
    const d = new Date(input);
    if (isNaN(d)) return '-';
    return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  });

  handlebars.registerHelper('yearFrom', function(periodDDMMYYYY) {
    if (!periodDDMMYYYY) return '';
    const parts = String(periodDDMMYYYY).split('-');
    return parts.length === 3 ? parts[2] : '';
  });

  handlebars.registerHelper('zero', function() { return '0'; });

  // === Provide print date/time for header ===
  const now = new Date();
  req.data.printDate = now.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
  req.data.printTime = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  // === Guard header minimal ===
  if (!req.data.reportInfo) {
    req.data.reportInfo = { title: 'Rekap', province: '-', period: '-', generatedDate: now.toISOString() };
  }
}
