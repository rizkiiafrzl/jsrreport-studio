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
