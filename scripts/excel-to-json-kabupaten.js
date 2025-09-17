const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

/**
 * Konversi file Excel kabupaten/kota ke JSON
 * @param {string} excelFilePath - Path ke file Excel
 * @param {string} outputPath - Path untuk menyimpan file JSON (optional)
 * @param {string} sheetName - Nama sheet yang akan dikonversi (optional, default: sheet pertama)
 * @returns {Object} Data JSON hasil konversi
 */
function excelKabupatenToJson(excelFilePath, outputPath = null, sheetName = null) {
    try {
        console.log(`Membaca file Excel: ${excelFilePath}`);
        
        // Baca file Excel
        const workbook = XLSX.readFile(excelFilePath);
        
        // Ambil nama sheet
        const targetSheet = sheetName || workbook.SheetNames[0];
        console.log(`Menggunakan sheet: ${targetSheet}`);
        
        // Baca data dari sheet
        const worksheet = workbook.Sheets[targetSheet];
        
        // Konversi ke JSON dengan header
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
            header: 1, // Menggunakan array of arrays
            defval: '', // Default value untuk cell kosong
            raw: false // Mengkonversi semua data ke string
        });
        
        // Cari baris header (baris yang berisi "No", "NAMA PROVINSI", "NAMA KABUPATEN/KOTA")
        let headerRowIndex = -1;
        let headerRow = [];
        
        for (let i = 0; i < jsonData.length; i++) {
            const row = jsonData[i];
            if (row && row.length > 0) {
                // Cek apakah baris ini adalah header - cari "No" di kolom ke-3 (index 2)
                const noCell = String(row[2] || '').toLowerCase().trim();
                if (noCell === 'no') {
                    headerRowIndex = i;
                    headerRow = row;
                    break;
                }
            }
        }
        
        if (headerRowIndex === -1) {
            throw new Error('Header tidak ditemukan dalam file Excel');
        }
        
        console.log(`Header ditemukan di baris: ${headerRowIndex + 1}`);
        console.log('Header:', headerRow);
        
        // Ambil data mulai dari baris setelah header
        const dataRows = jsonData.slice(headerRowIndex + 1);
        
        // Konversi ke format yang sesuai dengan template
        const convertedData = [];
        let rowNumber = 1;
        
        for (const row of dataRows) {
            // Skip baris kosong atau baris yang tidak memiliki data
            if (!row || row.length === 0) {
                continue;
            }
            
            // Cek apakah baris ini berisi data (No di kolom ke-3, index 2)
            const noCell = String(row[2] || '').trim();
            if (!noCell || noCell === '' || isNaN(parseInt(noCell))) {
                continue;
            }
            
            // Skip baris yang berisi total atau summary
            const provinsiCell = String(row[3] || '').toLowerCase().trim();
            if (provinsiCell.includes('total') || provinsiCell.includes('jumlah') || provinsiCell.includes('subtotal')) {
                continue;
            }
            
            // Mapping data sesuai dengan struktur template kabupaten
            // Data dimulai dari kolom ke-3 (index 2) untuk No, ke-4 (index 3) untuk Provinsi, ke-5 (index 4) untuk Kabupaten
            const dataItem = {
                No: rowNumber,
                Provinsi: row[3] || '',
                Kabupaten_Kota: row[4] || '', // Kolom terpisah untuk kabupaten/kota
                Jumlah: {
                    ASN: parseNumber(row[5]) || 0,
                    PPPK: parseNumber(row[6]) || 0,
                    Non_ASN: {
                        Negeri: parseNumber(row[7]) || 0,
                        Swasta: parseNumber(row[8]) || 0
                    },
                    Subtotal: parseNumber(row[9]) || 0
                },
                BPJS: {
                    ASN: parseNumber(row[10]) || 0,
                    PPPK: parseNumber(row[11]) || 0,
                    Non_ASN: {
                        Negeri: parseNumber(row[12]) || 0,
                        Swasta: parseNumber(row[13]) || 0
                    },
                    Subtotal: parseNumber(row[14]) || 0
                },
                Kepesertaan_Aktif: {
                    ASN: parseNumber(row[15]) || 0,
                    PPPK: parseNumber(row[16]) || 0,
                    Non_ASN: {
                        Negeri: parseNumber(row[17]) || 0,
                        Swasta: parseNumber(row[18]) || 0
                    },
                    Subtotal: parseNumber(row[19]) || 0
                }
            };
            
            convertedData.push(dataItem);
            rowNumber++;
        }
        
        console.log(`Berhasil mengkonversi ${convertedData.length} baris data`);
        
        // Simpan ke file JSON jika outputPath diberikan
        if (outputPath) {
            const jsonString = JSON.stringify(convertedData, null, 2);
            fs.writeFileSync(outputPath, jsonString, 'utf8');
            console.log(`Data JSON disimpan ke: ${outputPath}`);
        }
        
        return convertedData;
        
    } catch (error) {
        console.error('Error mengkonversi Excel ke JSON:', error.message);
        throw error;
    }
}

/**
 * Parse number dari string Excel
 * @param {any} value - Value dari Excel
 * @returns {number} Parsed number
 */
function parseNumber(value) {
    if (value === null || value === undefined || value === '') {
        return 0;
    }
    
    // Hapus karakter non-numeric kecuali titik dan koma
    const cleaned = String(value).replace(/[^\d.,-]/g, '');
    
    // Konversi koma menjadi titik untuk decimal
    const normalized = cleaned.replace(',', '.');
    
    const parsed = parseFloat(normalized);
    return isNaN(parsed) ? 0 : parsed;
}

// Export functions
module.exports = {
    excelKabupatenToJson,
    parseNumber
};

// Jika script dijalankan langsung
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.log('Usage:');
        console.log('  node excel-to-json-kabupaten.js <excel-file> [output-file]');
        console.log('');
        console.log('Examples:');
        console.log('  node excel-to-json-kabupaten.js "excel/KNODIK0004.xlsx" "data/KNODIK0004.json"');
        process.exit(1);
    }
    
    const excelFile = args[0];
    const outputFile = args[1] || excelFile.replace(/\.(xlsx|xls)$/i, '.json');
    excelKabupatenToJson(excelFile, outputFile);
}








