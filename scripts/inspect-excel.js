const XLSX = require('xlsx');

function inspectExcel(filePath) {
    try {
        console.log(`Membaca file Excel: ${filePath}`);
        
        const workbook = XLSX.readFile(filePath);
        console.log('Sheet names:', workbook.SheetNames);
        
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
            header: 1,
            defval: '',
            raw: false
        });
        
        console.log(`Total rows: ${jsonData.length}`);
        console.log('\nFirst 10 rows:');
        
        for (let i = 0; i < Math.min(10, jsonData.length); i++) {
            console.log(`Row ${i + 1}:`, jsonData[i]);
        }
        
        // Cari baris yang mengandung "No"
        console.log('\nMencari baris header...');
        for (let i = 0; i < jsonData.length; i++) {
            const row = jsonData[i];
            if (row && row.length > 0) {
                const firstCell = String(row[0]).toLowerCase().trim();
                if (firstCell.includes('no') || firstCell === '1') {
                    console.log(`Potential header at row ${i + 1}:`, row);
                }
            }
        }
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

const filePath = process.argv[2];
if (!filePath) {
    console.log('Usage: node inspect-excel.js <excel-file>');
    process.exit(1);
}

inspectExcel(filePath);