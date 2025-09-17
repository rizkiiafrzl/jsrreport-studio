# Excel to JSON Converter

Script untuk mengkonversi file Excel menjadi format JSON yang sesuai dengan template jsreport.

## Script yang Tersedia

### 1. `excel-to-json-universal.js` (Recommended)
Script universal yang dapat mendeteksi jenis file secara otomatis (provinsi atau kabupaten/kota).

**Fitur:**
- Auto-detect jenis file berdasarkan header
- Mendukung format provinsi dan kabupaten/kota
- Mapping data otomatis sesuai struktur template
- Konversi batch untuk multiple files

### 2. `excel-to-json.js`
Script khusus untuk file provinsi.

### 3. `excel-to-json-kabupaten.js`
Script khusus untuk file kabupaten/kota.

### 4. `inspect-excel.js`
Script untuk memeriksa struktur file Excel (debugging).

## Penggunaan

### Konversi Single File
```bash
# Menggunakan script universal (recommended)
node scripts/excel-to-json-universal.js "excel/KNODIK0003.xlsx" "data/KNODIK0003.json"

# Script khusus provinsi
node scripts/excel-to-json.js "excel/KNODIK0003.xlsx" "data/KNODIK0003.json"

# Script khusus kabupaten
node scripts/excel-to-json-kabupaten.js "excel/KNODIK0004.xlsx" "data/KNODIK0004.json"
```

### Konversi Batch (Semua File)
```bash
# Konversi semua file Excel dalam folder
node scripts/excel-to-json-universal.js --all "excel" "data"
```

### Inspect File Excel
```bash
# Periksa struktur file Excel
node scripts/inspect-excel.js "excel/KNODIK0003.xlsx"
```

## Format Output JSON

Data JSON yang dihasilkan memiliki struktur sebagai berikut:

```json
[
  {
    "No": 1,
    "Provinsi": "Prov. Aceh",
    "Kabupaten_Kota": "Prov. Aceh", // Untuk provinsi, sama dengan provinsi
    "Jumlah": {
      "ASN": 51432,
      "PPPK": 17980,
      "Non_ASN": {
        "Negeri": 53181,
        "Swasta": 31946
      },
      "Subtotal": 154539
    },
    "BPJS": {
      "ASN": 2321,
      "PPPK": 1633,
      "Non_ASN": {
        "Negeri": 15549,
        "Swasta": 4835
      },
      "Subtotal": 24338
    },
    "Kepesertaan_Aktif": {
      "ASN": 4.51,
      "PPPK": 9.08,
      "Non_ASN": {
        "Negeri": 29.24,
        "Swasta": 15.13
      },
      "Subtotal": 15.75
    }
  }
]
```

## Jenis File yang Didukung

### File Provinsi
- Format: `KNODIK0003`, `KNODIK0005`
- Header: No, NAMA PROVINSI, data...
- Kabupaten_Kota = Provinsi (sama)

### File Kabupaten/Kota
- Format: `KNODIK0004`, `KNODIK0006`
- Header: No, NAMA PROVINSI, NAMA KABUPATEN/KOTA, data...
- Kabupaten_Kota = kolom terpisah

## Dependencies

- `xlsx`: ^0.18.5 (sudah tersedia di package.json)

## Error Handling

Script akan menangani:
- File Excel yang tidak dapat dibaca
- Header yang tidak ditemukan
- Data kosong atau invalid
- Format number yang tidak standar (koma vs titik)

## Contoh Output

Setelah konversi, file JSON dapat digunakan langsung dengan template jsreport:

```javascript
// Menggunakan data JSON dengan template
const data = require('./data/KNODIK0003.json');
// Data siap digunakan dengan handlebars template
```

## Troubleshooting

1. **Header tidak ditemukan**: Pastikan file Excel memiliki header "No" di kolom ke-3
2. **Data kosong**: Periksa apakah ada data valid setelah header
3. **Format number error**: Script otomatis menangani koma dan titik decimal
4. **File tidak terbaca**: Pastikan file Excel tidak corrupt dan dapat dibuka








