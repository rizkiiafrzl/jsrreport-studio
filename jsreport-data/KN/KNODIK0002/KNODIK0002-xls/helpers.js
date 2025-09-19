function formatID(n){
  if(n==null||n==="") return "-";
  var num = Number(String(n).replace(/[^\d.-]/g, ""));
  if(!isFinite(num)) return "-";
  return num.toLocaleString("id-ID");
}

function formatPercent(n, options){
  if(n==null||n==="") return "-";
  var digits = (options && options.hash && options.hash.digits!=null) ? Number(options.hash.digits) : 2;
  var str = String(n).replace("%","").trim();
  var num = Number(str);
  if(!isFinite(num)) return "-";
  if(Math.abs(num) < 1 && num !== 0) num = num * 100;
  return num.toLocaleString("id-ID", { minimumFractionDigits: digits, maximumFractionDigits: digits }) + "%";
}
