const fs = require('fs');
const path = require('path');

/**
 * Memperbaiki struktur data JSON untuk jsreport
 * Data harus dibungkus dalam object, bukan array langsung
 */
function fixDataStructure(inputFile, outputFile) {
    try {
        console.log(`Membaca file: ${inputFile}`);
        
        // Baca file JSON
        const jsonContent = fs.readFileSync(inputFile, 'utf8');
        const dataArray = JSON.parse(jsonContent);
        
        console.log(`Data array berisi ${dataArray.length} item`);
        
        // Bungkus array dalam object dengan properti 'data'
        const wrappedData = {
            data: dataArray
        };
        
        // Tulis ke file output
        const jsonString = JSON.stringify(wrappedData, null, 2);
        fs.writeFileSync(outputFile, jsonString, 'utf8');
        
        console.log(`Data berhasil diperbaiki dan disimpan ke: ${outputFile}`);
        console.log(`Struktur baru: { data: [${dataArray.length} items] }`);
        
    } catch (error) {
        console.error('Error memperbaiki struktur data:', error.message);
        throw error;
    }
}

// Jika script dijalankan langsung
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.log('Usage:');
        console.log('  node fix-data-structure.js <input-file> [output-file]');
        console.log('');
        console.log('Examples:');
        console.log('  node fix-data-structure.js "data/input.json" "data/output.json"');
        process.exit(1);
    }
    
    const inputFile = args[0];
    const outputFile = args[1] || inputFile.replace('.json', '_fixed.json');
    fixDataStructure(inputFile, outputFile);
}

module.exports = { fixDataStructure };








