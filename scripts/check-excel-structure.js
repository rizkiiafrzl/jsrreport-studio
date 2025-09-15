const XLSX = require('xlsx');

function checkExcelStructure(filePath) {
    try {
        console.log(`Membaca file Excel: ${filePath}`);
        
        const workbook = XLSX.readFile(filePath);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
            header: 1,
            defval: '',
            raw: false
        });
        
        console.log(`Total rows: ${jsonData.length}`);
        
        // Cari baris header
        let headerRowIndex = -1;
        for (let i = 0; i < jsonData.length; i++) {
            const row = jsonData[i];
            if (row && row.length > 0) {
                const noCell = String(row[2] || '').toLowerCase().trim();
                if (noCell === 'no') {
                    headerRowIndex = i;
                    break;
                }
            }
        }
        
        if (headerRowIndex !== -1) {
            console.log(`\nHeader ditemukan di baris: ${headerRowIndex + 1}`);
            console.log('Header row:', jsonData[headerRowIndex]);
            
            // Tampilkan beberapa baris data
            console.log('\nData rows:');
            for (let i = headerRowIndex + 1; i < Math.min(headerRowIndex + 4, jsonData.length); i++) {
                console.log(`Row ${i + 1}:`, jsonData[i]);
            }
        } else {
            console.log('Header tidak ditemukan');
        }
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

const filePath = process.argv[2];
if (!filePath) {
    console.log('Usage: node check-excel-structure.js <excel-file>');
    process.exit(1);
}

checkExcelStructure(filePath);




