# Alur Data: Database → Template

## 1. 📊 Database (PostgreSQL)
- Tabel: `crops`
- 30+ kolom data tanaman
- Data: nama, jenis, varietas, hasil, pendapatan, dll

## 2. 🔄 Repository Layer
- Query database: `SELECT * FROM crops`
- Transform data ke format laporan
- Hitung totals dan statistik
- Return object dengan struktur yang sudah ditentukan

## 3. 🚀 Service Layer
- Ambil data dari repository
- Panggil JsReport dengan data
- Kirim data ke template

## 4. 🎨 JsReport Engine
- Terima data dari service
- Terapkan data ke template
- Generate PDF/Excel
- Return hasil

## 5. 📄 Template (HTML/JavaScript)
- Terima data sebagai variabel
- Gunakan Handlebars syntax: `{{variable}}`
- Loop data: `{{#each datas}}`
- Conditional: `{{#if condition}}`

## 6. 📱 User Request
- User: `GET /api/report/pdf`
- API: Ambil data dari database
- API: Kirim ke JsReport
- JsReport: Generate PDF
- User: Terima file PDF

## Variabel yang Tersedia di Template:

### Header Info:
- `{{title}}` - Judul laporan
- `{{code}}` - Kode laporan
- `{{periode}}` - Periode laporan
- `{{user}}` - User yang request

### Data Array:
- `{{datas}}` - Array data tanaman
- `{{#each datas}}` - Loop data
- `{{KODE_TANAMAN}}` - Kode tanaman
- `{{NAMA_TANAMAN}}` - Nama tanaman
- `{{JENIS_TANAMAN}}` - Jenis tanaman
- `{{VARIETAS}}` - Varietas
- `{{HASIL_ESTIMASI}}` - Hasil estimasi
- `{{PENDAPATAN_ESTIMASI}}` - Pendapatan estimasi
- dll (20+ field lainnya)

### Summary:
- `{{totals.totalTarget.TOTAL_TANAMAN}}` - Total tanaman
- `{{totals.totalTarget.TOTAL_HASIL_ESTIMASI}}` - Total hasil
- `{{totals.totalKategori.TANAMAN_TAHUNAN}}` - Tanaman tahunan
- `{{totals.totalKeuangan.TOTAL_PENDAPATAN_ESTIMASI}}` - Total pendapatan

### Info Kantor:
- `{{info.nama_kantor_wilayah}}` - Nama kantor wilayah
- `{{info.kode_kantor_wilayah}}` - Kode kantor wilayah
- `{{info.nama_kantor}}` - Nama kantor
- `{{info.kode_kantor}}` - Kode kantor
