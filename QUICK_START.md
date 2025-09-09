# 🚀 Quick Start Guide - JsReport Integration

## ⚡ Quick Setup (5 minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Services
```bash
# Terminal 1: Start Express App
npm run dev

# Terminal 2: Start JsReport Studio
npm run studio:dev
```

### 3. Access Services
- **Express API**: http://localhost:3000
- **JsReport Studio**: http://localhost:5488
  - Username: `admin`
  - Password: `password`

### 4. Test Integration
```bash
# Test all endpoints
npm test
```

## 📋 Create Your First Template

### 1. Login to JsReport Studio
- Go to http://localhost:5488
- Login with admin/password

### 2. Create PDF Template
1. Click **"New Template"**
2. Select **"Chrome PDF"** engine
3. Name: `crops-report-pdf`
4. Copy HTML template from `JREPORT_STUDIO_GUIDE.md`
5. Paste and customize
6. **Save**

### 3. Create Excel Template
1. Click **"New Template"**
2. Select **"XLSX"** engine
3. Name: `crops-report-excel`
4. Create Excel layout
5. **Save**

### 4. Test Report Generation
```bash
# Test PDF
curl "http://localhost:3000/api/report/pdf" -o report.pdf

# Test Excel
curl "http://localhost:3000/api/report/excel" -o report.xlsx
```

## 🎯 Available Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/report/data` | GET | Get report data (JSON) |
| `/api/report/pdf` | GET | Generate PDF report |
| `/api/report/excel` | GET | Generate Excel report |
| `/api/report/periode/:periode` | GET | Report by periode |
| `/api/report/user/:user` | GET | Report by user |
| `/api/crops/type/:cropType` | GET | Crops by type |
| `/api/crops/stats` | GET | Crops statistics |

## 🔧 Configuration

### Environment Variables (.env)
```env
PORT=3000
NODE_ENV=development

# Database
POSTGRES_USER=postgres
POSTGRES_HOST=localhost
POSTGRES_DATABASE=farm-management
POSTGRES_PASSWORD=123
POSTGRES_PORT=5432

# JsReport
JREPORT_PORT=5488
JREPORT_STUDIO_ENABLED=true
```

### JsReport Configuration
- Main config: `jsreport.config.js`
- Server config: `config/jsreport.js`

## 📊 Data Structure

Your templates will receive this data structure:

```javascript
{
    title: "REKAPITULASI DATA TANAMAN DAN PRODUKTIVITAS PERTANIAN",
    code: "KNRKKP008",
    periode: "08-2025",
    user: "SYSTEM",
    datas: [
        {
            KODE_TANAMAN: "1",
            NAMA_TANAMAN: "Tomat Cherry",
            JENIS_TANAMAN: "Sayuran",
            // ... more fields
        }
    ],
    totals: {
        totalTarget: { /* ... */ },
        totalKategori: { /* ... */ },
        totalKeuangan: { /* ... */ }
    }
}
```

## 🐛 Troubleshooting

### Common Issues

1. **Studio tidak bisa diakses**
   ```bash
   # Check if port 5488 is free
   netstat -an | findstr 5488
   ```

2. **Template tidak ditemukan**
   - Pastikan template sudah dibuat di studio
   - Check nama template di service layer

3. **PDF generation gagal**
   - Install Chrome/Chromium
   - Check Chrome PDF extension

4. **Database connection error**
   - Check PostgreSQL is running
   - Verify database credentials in .env

### Debug Commands
```bash
# Check logs
tail -f logs/daily-log-$(date +%Y-%m-%d).log

# Test database connection
npm run test

# Debug jsreport
DEBUG=jsreport* npm run studio:dev
```

## 📚 Next Steps

1. **Customize Templates**: Edit templates in JsReport Studio
2. **Add More Data**: Extend repository layer for more data sources
3. **Styling**: Improve PDF/Excel styling and layout
4. **Authentication**: Add user authentication if needed
5. **Production**: Deploy with proper environment configuration

## 📖 Documentation

- **Full Guide**: `JREPORT_STUDIO_GUIDE.md`
- **API Documentation**: `README.md`
- **JsReport Docs**: https://jsreport.net/learn

## 🆘 Support

If you encounter issues:
1. Check the logs in `logs/` directory
2. Verify all services are running
3. Check database connection
4. Review template configuration in studio

Happy reporting! 🎉

