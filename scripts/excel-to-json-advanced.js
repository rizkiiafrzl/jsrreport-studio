const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

/**
 * Konversi file Excel ke JSON dengan deteksi jenis file yang lebih akurat
 */
function excelToJsonAdvanced(excelFilePath, outputPath = null, sheetName = null) {
    try {
        console.log(`Membaca file Excel: ${excelFilePath}`);
        
        // Baca file Excel
        const workbook = XLSX.readFile(excelFilePath);
        const targetSheet = sheetName || workbook.SheetNames[0];
        const worksheet = workbook.Sheets[targetSheet];
        
        // Konversi ke JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
            header: 1,
            defval: '',
            raw: false
        });
        
        // Deteksi jenis file berdasarkan nama file
        const fileName = path.basename(excelFilePath, '.xlsx');
        let fileType = 'unknown';
        
        if (fileName.includes('KNODIK0001')) {
            fileType = 'ptk_jenjang';
        } else if (fileName.includes('KNODIK0002')) {
            fileType = 'satuan_pendidikan';
        } else if (fileName.includes('KNODIK0003') || fileName.includes('KNODIK0005') || fileName.includes('KNODIK0007')) {
            fileType = 'provinsi';
        } else if (fileName.includes('KNODIK0004')) {
            fileType = 'kabupaten';
        } else if (fileName.includes('KNODIK0006') || fileName.includes('KNODIK0008')) {
            fileType = 'kabupaten_specific';
        }
        
        console.log(`Jenis file terdeteksi: ${fileType}`);
        
        // Cari baris header - untuk KNODIK0002 ada 2 baris header
        let headerRowIndex = -1;
        let headerRow = [];
        
        for (let i = 0; i < jsonData.length; i++) {
            const row = jsonData[i];
            if (row && row.length > 0) {
                const noCell = String(row[2] || '').toLowerCase().trim();
                if (noCell === 'no') {
                    headerRowIndex = i;
                    headerRow = row;
                    break;
                }
            }
        }
        
        // Untuk KNODIK0002, data dimulai dari baris setelah header kedua
        if (fileType === 'satuan_pendidikan' && headerRowIndex !== -1) {
            // Cari baris kedua yang berisi sub-header
            for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
                const row = jsonData[i];
                if (row && row.length > 0 && String(row[6] || '').includes('JUMLAH GTK')) {
                    headerRowIndex = i; // Update ke baris kedua
                    break;
                }
            }
        }
        
        if (headerRowIndex === -1) {
            throw new Error('Header tidak ditemukan dalam file Excel');
        }
        
        console.log(`Header ditemukan di baris: ${headerRowIndex + 1}`);
        
        // Ambil data
        const dataRows = jsonData.slice(headerRowIndex + 1);
        const convertedData = [];
        let rowNumber = 1;
        
        for (const row of dataRows) {
            if (!row || row.length === 0) continue;
            
            const noCell = String(row[2] || '').trim();
            if (!noCell || noCell === '' || isNaN(parseInt(noCell))) continue;
            
            // Skip total rows
            const provinsiCell = String(row[3] || '').toLowerCase().trim();
            if (provinsiCell.includes('total') || provinsiCell.includes('jumlah')) continue;
            
            let dataItem;
            
            switch (fileType) {
                case 'ptk_jenjang':
                    dataItem = convertPTKJenjang(row, rowNumber);
                    break;
                case 'satuan_pendidikan':
                    dataItem = convertSatuanPendidikan(row, rowNumber);
                    break;
                case 'provinsi':
                    dataItem = convertProvinsi(row, rowNumber);
                    break;
                case 'kabupaten':
                    dataItem = convertKabupaten(row, rowNumber);
                    break;
                case 'kabupaten_specific':
                    dataItem = convertKabupatenSpecific(row, rowNumber);
                    break;
                default:
                    dataItem = convertDefault(row, rowNumber);
            }
            
            if (dataItem) {
                convertedData.push(dataItem);
                rowNumber++;
            }
        }
        
        console.log(`Berhasil mengkonversi ${convertedData.length} baris data`);
        
        // Simpan ke file JSON
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
 * Konversi data PTK Per Jenjang (KNODIK0001)
 */
function convertPTKJenjang(row, rowNumber) {
    // Dua kemungkinan layout:
    // 1) Layout sederhana (tanpa NEGERI/SWASTA)
    // 2) Layout lengkap: setiap blok (JUMLAH, BPJS, %) berisi NON ASN -> NEGERI (TK..SLB, SUBTOTAL) dan SWASTA (TK..SLB, SUBTOTAL)

    const base = {
        No: rowNumber,
        Provinsi: row[3] || '',
        Kabupaten_Kota: row[4] || ''
    };

    // Deteksi layout lengkap berdasarkan jumlah kolom data setelah kolom 4
    // Jika kolom > 45 kita asumsikan ada split NEGERI/SWASTA
    const colsAfterMeta = row.length - 5; // mulai dari index 5
    const isSplitLayout = colsAfterMeta >= 45;

    if (!isSplitLayout) {
        // Layout sederhana (indeks seperti sebelumnya)
        return {
            ...base,
            Jenjang: {
                TK: parseNumber(row[5]) || 0,
                PAUD: parseNumber(row[6]) || 0,
                KB: parseNumber(row[7]) || 0,
                SD: parseNumber(row[8]) || 0,
                SMP: parseNumber(row[9]) || 0,
                SMA: parseNumber(row[10]) || 0,
                SMK: parseNumber(row[11]) || 0,
                SLB: parseNumber(row[12]) || 0,
                Subtotal: parseNumber(row[13]) || 0
            },
            BPJS: {
                TK: parseNumber(row[14]) || 0,
                PAUD: parseNumber(row[15]) || 0,
                KB: parseNumber(row[16]) || 0,
                SD: parseNumber(row[17]) || 0,
                SMP: parseNumber(row[18]) || 0,
                SMA: parseNumber(row[19]) || 0,
                SMK: parseNumber(row[20]) || 0,
                SLB: parseNumber(row[21]) || 0,
                Subtotal: parseNumber(row[22]) || 0
            },
            Kepesertaan_Aktif: {
                TK: parseNumber(row[23]) || 0,
                PAUD: parseNumber(row[24]) || 0,
                KB: parseNumber(row[25]) || 0,
                SD: parseNumber(row[26]) || 0,
                SMP: parseNumber(row[27]) || 0,
                SMA: parseNumber(row[28]) || 0,
                SMK: parseNumber(row[29]) || 0,
                SLB: parseNumber(row[30]) || 0,
                Subtotal: parseNumber(row[31]) || 0
            }
        };
    }

    // Helper untuk membaca 10 kolom: 8 jenjang + subtotal untuk satu sisi (Negeri/Swasta)
    const readSide = (startIdx) => ({
        TK: parseNumber(row[startIdx + 0]) || 0,
        PAUD: parseNumber(row[startIdx + 1]) || 0,
        KB: parseNumber(row[startIdx + 2]) || 0,
        SD: parseNumber(row[startIdx + 3]) || 0,
        SMP: parseNumber(row[startIdx + 4]) || 0,
        SMA: parseNumber(row[startIdx + 5]) || 0,
        SMK: parseNumber(row[startIdx + 6]) || 0,
        SLB: parseNumber(row[startIdx + 7]) || 0,
        Subtotal: parseNumber(row[startIdx + 8]) || 0
    });

    // Susunan indeks untuk layout lengkap:
    // Setelah kolom 4 (kab/kota), urutannya per blok: NEGERI(8+1), SWASTA(8+1) = 18 kolom per blok.
    const JUMLAH_START = 5;
    const BPJS_START = JUMLAH_START + 18;
    const PERSEN_START = BPJS_START + 18;

    const jumlahNegeri = readSide(JUMLAH_START);
    const jumlahSwasta = readSide(JUMLAH_START + 9);
    const bpjsNegeri = readSide(BPJS_START);
    const bpjsSwasta = readSide(BPJS_START + 9);
    const persenNegeri = readSide(PERSEN_START);
    const persenSwasta = readSide(PERSEN_START + 9);

    return {
        ...base,
        Jumlah: {
            Non_ASN: {
                Negeri: {
                    TK: jumlahNegeri.TK, PAUD: jumlahNegeri.PAUD, KB: jumlahNegeri.KB, SD: jumlahNegeri.SD,
                    SMP: jumlahNegeri.SMP, SMA: jumlahNegeri.SMA, SMK: jumlahNegeri.SMK, SLB: jumlahNegeri.SLB
                },
                Swasta: {
                    TK: jumlahSwasta.TK, PAUD: jumlahSwasta.PAUD, KB: jumlahSwasta.KB, SD: jumlahSwasta.SD,
                    SMP: jumlahSwasta.SMP, SMA: jumlahSwasta.SMA, SMK: jumlahSwasta.SMK, SLB: jumlahSwasta.SLB
                }
            },
            Subtotal_Non_ASN_Negeri: jumlahNegeri.Subtotal,
            Subtotal_Non_ASN_Swasta: jumlahSwasta.Subtotal,
            // Turunkan total gabungan juga untuk kompatibilitas
            Subtotal: (jumlahNegeri.Subtotal || 0) + (jumlahSwasta.Subtotal || 0)
        },
        BPJS: {
            Non_ASN: {
                Negeri: {
                    TK: bpjsNegeri.TK, PAUD: bpjsNegeri.PAUD, KB: bpjsNegeri.KB, SD: bpjsNegeri.SD,
                    SMP: bpjsNegeri.SMP, SMA: bpjsNegeri.SMA, SMK: bpjsNegeri.SMK, SLB: bpjsNegeri.SLB
                },
                Swasta: {
                    TK: bpjsSwasta.TK, PAUD: bpjsSwasta.PAUD, KB: bpjsSwasta.KB, SD: bpjsSwasta.SD,
                    SMP: bpjsSwasta.SMP, SMA: bpjsSwasta.SMA, SMK: bpjsSwasta.SMK, SLB: bpjsSwasta.SLB
                }
            },
            Subtotal_Non_ASN_Negeri: bpjsNegeri.Subtotal,
            Subtotal_Non_ASN_Swasta: bpjsSwasta.Subtotal,
            Subtotal: (bpjsNegeri.Subtotal || 0) + (bpjsSwasta.Subtotal || 0)
        },
        Kepesertaan_Aktif: {
            Non_ASN: {
                Negeri: {
                    TK: persenNegeri.TK, PAUD: persenNegeri.PAUD, KB: persenNegeri.KB, SD: persenNegeri.SD,
                    SMP: persenNegeri.SMP, SMA: persenNegeri.SMA, SMK: persenNegeri.SMK, SLB: persenNegeri.SLB
                },
                Swasta: {
                    TK: persenSwasta.TK, PAUD: persenSwasta.PAUD, KB: persenSwasta.KB, SD: persenSwasta.SD,
                    SMP: persenSwasta.SMP, SMA: persenSwasta.SMA, SMK: persenSwasta.SMK, SLB: persenSwasta.SLB
                }
            },
            Subtotal_Non_ASN_Negeri: persenNegeri.Subtotal,
            Subtotal_Non_ASN_Swasta: persenSwasta.Subtotal,
            Subtotal: (persenNegeri.Subtotal || 0) + (persenSwasta.Subtotal || 0)
        },
        // Tambahkan turunan datar agar kompatibel dengan template lama (opsional)
        Jenjang: {
            TK: (parseNumber(row[5]) || jumlahNegeri.TK + jumlahSwasta.TK),
            PAUD: (parseNumber(row[6]) || jumlahNegeri.PAUD + jumlahSwasta.PAUD),
            KB: (parseNumber(row[7]) || jumlahNegeri.KB + jumlahSwasta.KB),
            SD: (parseNumber(row[8]) || jumlahNegeri.SD + jumlahSwasta.SD),
            SMP: (parseNumber(row[9]) || jumlahNegeri.SMP + jumlahSwasta.SMP),
            SMA: (parseNumber(row[10]) || jumlahNegeri.SMA + jumlahSwasta.SMA),
            SMK: (parseNumber(row[11]) || jumlahNegeri.SMK + jumlahSwasta.SMK),
            SLB: (parseNumber(row[12]) || jumlahNegeri.SLB + jumlahSwasta.SLB),
            Subtotal: ((parseNumber(row[13]) || 0) || ((jumlahNegeri.Subtotal || 0) + (jumlahSwasta.Subtotal || 0)))
        }
    };
}

/**
 * Konversi data Satuan Pendidikan (KNODIK0002)
 */
function convertSatuanPendidikan(row, rowNumber) {
    return {
        No: rowNumber,
        Provinsi: row[3] || '',
        Kabupaten_Kota: row[4] || '',
        Nama_Satuan_Pendidikan: row[5] || '',
        PTK_Dapodik: parseNumber(row[6]) || 0,
        GTK: parseNumber(row[7]) || 0,
        Terdaftar_BPJS: parseNumber(row[8]) || 0,
        Belum_Terdaftar: parseNumber(row[9]) || 0,
        Persen_Terdaftar: parseNumber(row[10]) || 0,
        Alamat: row[10] || '',
        Email: row[11] || '',
        No_HP: row[12] || ''
    };
}

/**
 * Konversi data Provinsi (KNODIK0003, 0005, 0007)
 */
function convertProvinsi(row, rowNumber) {
    return {
        No: rowNumber,
        Provinsi: row[3] || '',
        Kabupaten_Kota: row[3] || '', // Sama dengan provinsi
        Jumlah: {
            ASN: parseNumber(row[4]) || 0,
            PPPK: parseNumber(row[5]) || 0,
            Non_ASN: {
                Negeri: parseNumber(row[6]) || 0,
                Swasta: parseNumber(row[7]) || 0
            },
            Subtotal: parseNumber(row[8]) || 0
        },
        BPJS: {
            ASN: parseNumber(row[9]) || 0,
            PPPK: parseNumber(row[10]) || 0,
            Non_ASN: {
                Negeri: parseNumber(row[11]) || 0,
                Swasta: parseNumber(row[12]) || 0
            },
            Subtotal: parseNumber(row[13]) || 0
        },
        Kepesertaan_Aktif: {
            ASN: parseNumber(row[14]) || 0,
            PPPK: parseNumber(row[15]) || 0,
            Non_ASN: {
                Negeri: parseNumber(row[16]) || 0,
                Swasta: parseNumber(row[17]) || 0
            },
            Subtotal: parseNumber(row[18]) || 0
        }
    };
}

/**
 * Konversi data Kabupaten (KNODIK0004)
 */
function convertKabupaten(row, rowNumber) {
    return {
        No: rowNumber,
        Provinsi: row[3] || '',
        Kabupaten_Kota: row[4] || '',
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
}

/**
 * Konversi data Kabupaten Specific (KNODIK0006, 0008)
 */
function convertKabupatenSpecific(row, rowNumber) {
    return {
        No: rowNumber,
        Provinsi: 'Prov. Aceh', // Hardcoded karena file ini khusus Aceh
        Kabupaten_Kota: row[3] || '',
        Jumlah: {
            ASN: parseNumber(row[4]) || 0,
            PPPK: parseNumber(row[5]) || 0,
            Non_ASN: {
                Negeri: parseNumber(row[6]) || 0,
                Swasta: parseNumber(row[7]) || 0
            },
            Subtotal: parseNumber(row[8]) || 0
        },
        BPJS: {
            ASN: parseNumber(row[9]) || 0,
            PPPK: parseNumber(row[10]) || 0,
            Non_ASN: {
                Negeri: parseNumber(row[11]) || 0,
                Swasta: parseNumber(row[12]) || 0
            },
            Subtotal: parseNumber(row[13]) || 0
        },
        Kepesertaan_Aktif: {
            ASN: parseNumber(row[14]) || 0,
            PPPK: parseNumber(row[15]) || 0,
            Non_ASN: {
                Negeri: parseNumber(row[16]) || 0,
                Swasta: parseNumber(row[17]) || 0
            },
            Subtotal: parseNumber(row[18]) || 0
        }
    };
}

/**
 * Konversi default
 */
function convertDefault(row, rowNumber) {
    return {
        No: rowNumber,
        Provinsi: row[3] || '',
        Kabupaten_Kota: row[4] || row[3] || '',
        Data: row.slice(5) // Ambil semua data setelah kolom 4
    };
}

/**
 * Parse number dari string Excel
 */
function parseNumber(value) {
    if (value === null || value === undefined || value === '') {
        return 0;
    }
    
    const cleaned = String(value).replace(/[^\d.,-]/g, '');
    const normalized = cleaned.replace(',', '.');
    const parsed = parseFloat(normalized);
    return isNaN(parsed) ? 0 : parsed;
}

/**
 * Konversi semua file Excel dalam folder
 */
function convertAllExcelFilesAdvanced(inputDir, outputDir) {
    try {
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        const files = fs.readdirSync(inputDir).filter(file => 
            file.toLowerCase().endsWith('.xlsx') || file.toLowerCase().endsWith('.xls')
        );
        
        console.log(`Ditemukan ${files.length} file Excel untuk dikonversi`);
        
        for (const file of files) {
            const inputPath = path.join(inputDir, file);
            const outputFile = file.replace(/\.(xlsx|xls)$/i, '.json');
            const outputPath = path.join(outputDir, outputFile);
            
            console.log(`\nMengkonversi: ${file}`);
            try {
                excelToJsonAdvanced(inputPath, outputPath);
                console.log(`✓ Berhasil: ${outputFile}`);
            } catch (error) {
                console.error(`✗ Error: ${file} - ${error.message}`);
            }
        }
        
    } catch (error) {
        console.error('Error mengkonversi semua file:', error.message);
    }
}

// Export functions
module.exports = {
    excelToJsonAdvanced,
    convertAllExcelFilesAdvanced,
    parseNumber
};

// Jika script dijalankan langsung
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.log('Usage:');
        console.log('  node excel-to-json-advanced.js <excel-file> [output-file]');
        console.log('  node excel-to-json-advanced.js --all <input-dir> <output-dir>');
        console.log('');
        console.log('Examples:');
        console.log('  node excel-to-json-advanced.js "data/xlsx/KNODIK0001.xlsx" "data/KNODIK0001.json"');
        console.log('  node excel-to-json-advanced.js --all "data/xlsx" "data"');
        process.exit(1);
    }
    
    if (args[0] === '--all') {
        if (args.length < 3) {
            console.error('Error: --all memerlukan input-dir dan output-dir');
            process.exit(1);
        }
        convertAllExcelFilesAdvanced(args[1], args[2]);
    } else {
        const excelFile = args[0];
        const outputFile = args[1] || excelFile.replace(/\.(xlsx|xls)$/i, '.json');
        excelToJsonAdvanced(excelFile, outputFile);
    }
}
