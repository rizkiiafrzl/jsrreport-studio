const XLSX = require('xlsx');

function debugExcel(filePath) {
    try {
        console.log(`Membaca file Excel: ${filePath}`);
        
        const workbook = XLSX.readFile(filePath);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
            header: 1,
            defval: '',
            raw: false
        });
        
        // Tampilkan baris 8 secara detail
        console.log('\nBaris 8 (data pertama):');
        const row8 = jsonData[7]; // Index 7 untuk baris 8
        console.log('Length:', row8.length);
        for (let i = 0; i < row8.length; i++) {
            console.log(`  [${i}]: "${row8[i]}"`);
        }
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

const filePath = process.argv[2];
if (!filePath) {
    console.log('Usage: node debug-excel.js <excel-file>');
    process.exit(1);
}

debugExcel(filePath);




