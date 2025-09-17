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

function getPageNumber (pageIndex) {
    if (pageIndex == null) {
        return ''
    }

    const pageNumber = pageIndex + 1
    return pageNumber
}

function getTotalPages (pages) {
    if (!pages) {
        return ''
    }

    return pages.length
}

function getFormattedDateWithTimezone() {
    const now = new Date();
    
    // Adjust for timezone UTC+7 (i.e., add 7 hours)
    now.setHours(now.getHours() + 7);

    // Get the day, month, year, hours, minutes, and seconds
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    // Format the result with the timezone +07
    const formattedDate = `${day}-${month}-${year} : ${hours}:${minutes}:${seconds}`;
    return formattedDate;
}
