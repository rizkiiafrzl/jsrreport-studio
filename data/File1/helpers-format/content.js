function beforeRender(req, res) {
  // append helper code ke template.helpers tanpa backtick/template literal
  req.template.helpers = (req.template.helpers || '') +
    '\n' +
    'function formatID(n){\n' +
    '  if(n==null||n==="") return "-";\n' +
    '  var num = Number(String(n).replace(/[^\\d.-]/g, ""));\n' +
    '  if(!isFinite(num)) return "-";\n' +
    '  return num.toLocaleString("id-ID");\n' +
    '}\n' +
    '\n' +
    'function formatPercent(n, options){\n' +
    '  if(n==null||n==="") return "-";\n' +
    '  var digits = (options && options.hash && options.hash.digits!=null) ? Number(options.hash.digits) : 2;\n' +
    '  var str = String(n).replace("%","").trim();\n' +
    '  var num = Number(str);\n' +
    '  if(!isFinite(num)) return "-";\n' +
    '  if(Math.abs(num) < 1 && num !== 0) num = num * 100;\n' +
    '  return num.toLocaleString("id-ID", { minimumFractionDigits: digits, maximumFractionDigits: digits }) + "%";\n' +
    '}\n';
}
