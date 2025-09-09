# JsReport Studio Integration Guide

## 🚀 Setup JsReport Studio

### 1. Install Dependencies
```bash
npm install jsreport jsreport-cli
```

### 2. Start JsReport Studio
```bash
# Start studio in development mode
npm run studio:dev

# Or start studio normally
npm run studio
```

### 3. Access Studio
- **Studio URL**: http://localhost:5488
- **Username**: admin
- **Password**: password (default)

## 📋 Template Creation

### 1. Create PDF Template

1. **Login ke Studio** di http://localhost:5488
2. **Klik "New Template"**
3. **Pilih "Chrome PDF"** sebagai engine
4. **Beri nama**: `crops-report-pdf`
5. **Copy template HTML** dari file `service/service.js` method `createHTMLTemplate()`
6. **Paste ke editor** dan customize sesuai kebutuhan
7. **Save template**

### 2. Create Excel Template

1. **Klik "New Template"**
2. **Pilih "XLSX"** sebagai engine
3. **Beri nama**: `crops-report-excel`
4. **Buat template Excel** dengan data dari `datas` array
5. **Save template**

## 🔧 Template Data Structure

Data yang dikirim ke template memiliki struktur:

```javascript
{
    template: "/KN/KNRKKP008/KNRKKP008-main",
    responseCode: 200,
    message: "Berhasil",
    code: "KNRKKP008",
    title: "REKAPITULASI DATA TANAMAN DAN PRODUKTIVITAS PERTANIAN",
    user: "SYSTEM",
    periode: "08-2025",
    datas: [
        {
            KODE_TANAMAN: "1",
            NAMA_TANAMAN: "Tomat Cherry",
            JENIS_TANAMAN: "Sayuran",
            VARIETAS: "Sweet 100",
            // ... other fields
        }
    ],
    info: {
        kode_kantor_wilayah: "903",
        nama_kantor_wilayah: "KANWIL DKI JAKARTA",
        kode_kantor: "J0P",
        nama_kantor: "GRHA BPJAMSOSTEK"
    },
    totals: {
        totalTarget: { /* ... */ },
        totalKategori: { /* ... */ },
        totalKeuangan: { /* ... */ }
    }
}
```

## 📝 Template Examples

### PDF Template (HTML)
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{title}}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .title { font-size: 18px; font-weight: bold; margin-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; font-weight: bold; }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">{{title}}</div>
        <div>Kode: {{code}}</div>
        <div>Periode: {{periode}}</div>
        <div>User: {{user}}</div>
    </div>

    <table>
        <thead>
            <tr>
                <th>Kode Tanaman</th>
                <th>Nama Tanaman</th>
                <th>Jenis Tanaman</th>
                <th>Varietas</th>
                <!-- Add more headers as needed -->
            </tr>
        </thead>
        <tbody>
            {{#each datas}}
            <tr>
                <td>{{KODE_TANAMAN}}</td>
                <td>{{NAMA_TANAMAN}}</td>
                <td>{{JENIS_TANAMAN}}</td>
                <td>{{VARIETAS}}</td>
                <!-- Add more data fields as needed -->
            </tr>
            {{/each}}
        </tbody>
    </table>

    <div class="totals">
        <h3>Total Target</h3>
        <p>Total Tanaman: {{totals.totalTarget.TOTAL_TANAMAN}}</p>
        <p>Total Hasil Estimasi: {{totals.totalTarget.TOTAL_HASIL_ESTIMASI}}</p>
    </div>
</body>
</html>
```

### Excel Template (XLSX)
```javascript
// In jsreport studio, create XLSX template with:
// - Header row with column names
// - Data rows using {{#each datas}} loop
// - Summary section with totals
```

## 🚀 Usage

### 1. Start Application
```bash
# Terminal 1: Start jsreport studio
npm run studio:dev

# Terminal 2: Start express app
npm run dev
```

### 2. Test Endpoints
```bash
# Test PDF generation
curl "http://localhost:3000/api/report/pdf" -o report.pdf

# Test Excel generation
curl "http://localhost:3000/api/report/excel" -o report.xlsx

# Test with parameters
curl "http://localhost:3000/api/report/pdf?periode=08-2025&user=TEST" -o report.pdf
```

## 🔧 Configuration

### Environment Variables
Add to `.env`:
```env
# JsReport Configuration
JREPORT_PORT=5488
JREPORT_STUDIO_ENABLED=true
```

### Custom Configuration
Edit `jsreport.config.js` untuk mengubah konfigurasi jsreport.

## 📁 File Structure
```
express-report/
├── config/
│   ├── database.js
│   └── jsreport.js          # JsReport configuration
├── jsreport.config.js       # JsReport main config
├── jsreport-data/           # JsReport data directory (auto-created)
│   ├── templates/           # Template files
│   └── data/               # Template data
└── JREPORT_STUDIO_GUIDE.md # This guide
```

## 🐛 Troubleshooting

### Common Issues

1. **Studio tidak bisa diakses**
   - Pastikan port 5488 tidak digunakan aplikasi lain
   - Check firewall settings

2. **Template tidak ditemukan**
   - Pastikan template sudah dibuat di studio
   - Check nama template di service layer

3. **PDF generation gagal**
   - Install Chrome/Chromium
   - Check Chrome PDF extension settings

4. **Excel generation gagal**
   - Install XLSX extension
   - Check template format

### Debug Mode
```bash
# Start with debug logging
DEBUG=jsreport* npm run studio:dev
```

## 📚 Resources

- [JsReport Documentation](https://jsreport.net/learn)
- [JsReport Studio Guide](https://jsreport.net/learn/studio)
- [Template Examples](https://jsreport.net/learn/templating-engines)

