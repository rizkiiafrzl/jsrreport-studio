const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx');

function inspectExcel(filePath) {
  const resolved = path.resolve(filePath);
  if (!fs.existsSync(resolved)) {
    console.error(`File not found: ${resolved}`);
    process.exit(1);
  }

  const wb = XLSX.readFile(resolved);
  const sheetName = wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];

  // Read header row using header:1 to get arrays
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });
  const headers = (rows[0] || []).map((h, i) => (h == null || h === '') ? `COL_${i + 1}` : String(h).trim());

  const preview = rows.slice(1, 6); // first 5 data rows

  console.log(JSON.stringify({ sheet: sheetName, headers, preview }, null, 2));
}

const input = process.argv[2];
if (!input) {
  console.error('Usage: node scripts/inspect-excel.js <path-to-xlsx>');
  process.exit(1);
}

inspectExcel(input);


