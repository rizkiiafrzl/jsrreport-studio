const Repository = require('../repository/repository');

// Import jsreport for report generation (without studio)
let jsreport = null;
try {
    jsreport = require('jsreport')({
        dataDirectory: './jsreport-data'
    });
} catch (err) {
    console.log('jsreport not available in service, using fallback mode:', err.message);
}

class Service {
    constructor() {
        this.repository = new Repository();
    }

    async getReportData(params = {}) {
        try {
            const result = await this.repository.getReportData(params);
            
            if (!result.success) {
                throw new Error(result.message);
            }

            return {
                success: true,
                data: result.data,
                message: "Report data retrieved successfully"
            };
        } catch (error) {
            return {
                success: false,
                data: null,
                message: error.message
            };
        }
    }

    async generatePDFReport(params = {}) {
        try {
            const reportData = await this.getReportData(params);
            
            if (!reportData.success) {
                throw new Error(reportData.message);
            }

            // Use jsreport to generate PDF if available
            if (jsreport) {
                try {
                    const report = await jsreport.render({
                        template: {
                            name: 'crops-report-pdf' // Template name in jsreport studio
                        },
                        data: reportData.data
                    });

                    return {
                        success: true,
                        data: report.content,
                        message: "PDF report generated successfully using jsreport",
                        contentType: 'application/pdf'
                    };
                } catch (jsreportError) {
                    console.log('jsreport PDF generation failed, using fallback:', jsreportError.message);
                }
            }
        } catch (error) {
            console.error('jsreport PDF generation error:', error);
        }
        
        // Fallback to HTML if jsreport fails
        const htmlTemplate = this.createHTMLTemplate(reportData.data);
        return {
            success: true,
            data: htmlTemplate,
            message: "HTML report generated (jsreport template not found, using fallback)",
            contentType: 'text/html'
        };
    }

    async generateExcelReport(params = {}) {
        try {
            const reportData = await this.getReportData(params);
            
            if (!reportData.success) {
                throw new Error(reportData.message);
            }

            // Use jsreport to generate Excel if available
            if (jsreport) {
                try {
                    const report = await jsreport.render({
                        template: {
                            name: 'crops-report-excel' // Template name in jsreport studio
                        },
                        data: reportData.data
                    });

                    return {
                        success: true,
                        data: report.content,
                        message: "Excel report generated successfully using jsreport",
                        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                    };
                } catch (jsreportError) {
                    console.log('jsreport Excel generation failed, using fallback:', jsreportError.message);
                }
            }
        } catch (error) {
            console.error('jsreport Excel generation error:', error);
        }
        
        // Fallback to CSV if jsreport fails
        const csvContent = this.createCSVTemplate(reportData.data);
        return {
            success: true,
            data: csvContent,
            message: "CSV report generated (jsreport template not found, using fallback)",
            contentType: 'text/csv'
        };
    }

    createHTMLTemplate(data) {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>${data.title}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; margin-bottom: 30px; }
                .title { font-size: 18px; font-weight: bold; margin-bottom: 10px; }
                .info { margin-bottom: 20px; }
                .info-row { margin-bottom: 5px; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; font-weight: bold; }
                .totals { margin-top: 20px; }
                .total-section { margin-bottom: 15px; }
                .total-title { font-weight: bold; margin-bottom: 5px; }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="title">${data.title}</div>
                <div>Kode: ${data.code}</div>
                <div>Periode: ${data.periode}</div>
                <div>User: ${data.user}</div>
            </div>

            <div class="info">
                <div class="info-row">Kantor Wilayah: ${data.info.nama_kantor_wilayah} (${data.info.kode_kantor_wilayah})</div>
                <div class="info-row">Kantor: ${data.info.nama_kantor} (${data.info.kode_kantor})</div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Kode Tanaman</th>
                        <th>Nama Tanaman</th>
                        <th>Jenis Tanaman</th>
                        <th>Varietas</th>
                        <th>Metode Pembibitan</th>
                        <th>Tingkat Perkecambahan</th>
                        <th>Benih per Sel</th>
                        <th>Profil Cahaya</th>
                        <th>Kondisi Tanah</th>
                        <th>Hari Muncul</th>
                        <th>Jarak Tanam</th>
                        <th>Jarak Baris</th>
                        <th>Kedalaman Tanam</th>
                        <th>Tinggi Rata-rata</th>
                        <th>Hari Berbunga</th>
                        <th>Hari Panen</th>
                        <th>Jendela Panen</th>
                        <th>Tingkat Kehilangan</th>
                        <th>Satuan Panen</th>
                        <th>Pendapatan Estimasi</th>
                        <th>Hasil Estimasi</th>
                        <th>Tanaman Tahunan</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.datas.map(item => `
                    <tr>
                        <td>${item.KODE_TANAMAN}</td>
                        <td>${item.NAMA_TANAMAN}</td>
                        <td>${item.JENIS_TANAMAN}</td>
                        <td>${item.VARIETAS}</td>
                        <td>${item.METODE_PEMBIBITAN}</td>
                        <td>${item.TINGKAT_PERKECAMBAHAN}</td>
                        <td>${item.BENIH_PER_SEL}</td>
                        <td>${item.PROFIL_CAHAYA}</td>
                        <td>${item.KONDISI_TANAH}</td>
                        <td>${item.HARI_MUNCUL}</td>
                        <td>${item.JARAK_TANAM}</td>
                        <td>${item.JARAK_BARIS}</td>
                        <td>${item.KEDALAMAN_TANAM}</td>
                        <td>${item.TINGGI_RATA_RATA}</td>
                        <td>${item.HARI_BERBUNGA}</td>
                        <td>${item.HARI_PANEN}</td>
                        <td>${item.JENDELA_PANEN}</td>
                        <td>${item.TINGKAT_KEHILANGAN}</td>
                        <td>${item.SATUAN_PANEN}</td>
                        <td>${item.PENDAPATAN_ESTIMASI}</td>
                        <td>${item.HASIL_ESTIMASI}</td>
                        <td>${item.TANAMAN_TAHUNAN}</td>
                    </tr>
                    `).join('')}
                </tbody>
            </table>

            <div class="totals">
                <div class="total-section">
                    <div class="total-title">Total Target:</div>
                    <div>Total Tanaman: ${data.totals.totalTarget.TOTAL_TANAMAN}</div>
                    <div>Total Hasil Estimasi: ${data.totals.totalTarget.TOTAL_HASIL_ESTIMASI}</div>
                    <div>Rata-rata Perkecambahan: ${data.totals.totalTarget.RATA_RATA_PERKECAMBAHAN.toFixed(2)}%</div>
                </div>
                <div class="total-section">
                    <div class="total-title">Total Kategori:</div>
                    <div>Tanaman Tahunan: ${data.totals.totalKategori.TANAMAN_TAHUNAN}</div>
                    <div>Tanaman Musiman: ${data.totals.totalKategori.TANAMAN_MUSIMAN}</div>
                    <div>Dengan Varietas: ${data.totals.totalKategori.DENGAN_VARIETAS}</div>
                    <div>Dengan Metode Pembibitan: ${data.totals.totalKategori.DENGAN_METODE_PEMBIBITAN}</div>
                    <div>Dengan Profil Cahaya: ${data.totals.totalKategori.DENGAN_PROFIL_CAHAYA}</div>
                </div>
                <div class="total-section">
                    <div class="total-title">Total Keuangan:</div>
                    <div>Total Pendapatan Estimasi: ${data.totals.totalKeuangan.TOTAL_PENDAPATAN_ESTIMASI}</div>
                    <div>Rata-rata Pendapatan: ${data.totals.totalKeuangan.RATA_RATA_PENDAPATAN.toFixed(2)}</div>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    createCSVTemplate(data) {
        const headers = [
            'Kode Tanaman',
            'Nama Tanaman',
            'Jenis Tanaman',
            'Varietas',
            'Metode Pembibitan',
            'Tingkat Perkecambahan',
            'Benih per Sel',
            'Profil Cahaya',
            'Kondisi Tanah',
            'Hari Muncul',
            'Jarak Tanam',
            'Jarak Baris',
            'Kedalaman Tanam',
            'Tinggi Rata-rata',
            'Hari Berbunga',
            'Hari Panen',
            'Jendela Panen',
            'Tingkat Kehilangan',
            'Satuan Panen',
            'Pendapatan Estimasi',
            'Hasil Estimasi',
            'Tanaman Tahunan'
        ];

        const csvRows = [
            headers.join(','),
            ...data.datas.map(item => [
                item.KODE_TANAMAN,
                item.NAMA_TANAMAN,
                item.JENIS_TANAMAN,
                item.VARIETAS,
                item.METODE_PEMBIBITAN,
                item.TINGKAT_PERKECAMBAHAN,
                item.BENIH_PER_SEL,
                item.PROFIL_CAHAYA,
                item.KONDISI_TANAH,
                item.HARI_MUNCUL,
                item.JARAK_TANAM,
                item.JARAK_BARIS,
                item.KEDALAMAN_TANAM,
                item.TINGGI_RATA_RATA,
                item.HARI_BERBUNGA,
                item.HARI_PANEN,
                item.JENDELA_PANEN,
                item.TINGKAT_KEHILANGAN,
                item.SATUAN_PANEN,
                item.PENDAPATAN_ESTIMASI,
                item.HASIL_ESTIMASI,
                item.TANAMAN_TAHUNAN
            ].join(','))
        ];

        return csvRows.join('\n');
    }

    async getReportDataByPeriode(periode) {
        try {
            const result = await this.repository.getReportDataByPeriode(periode);
            
            if (!result.success) {
                throw new Error(result.message);
            }

            return {
                success: true,
                data: result.data,
                message: result.message
            };
        } catch (error) {
            return {
                success: false,
                data: null,
                message: error.message
            };
        }
    }

    async getReportDataByUser(user) {
        try {
            const result = await this.repository.getReportDataByUser(user);
            
            if (!result.success) {
                throw new Error(result.message);
            }

            return {
                success: true,
                data: result.data,
                message: result.message
            };
        } catch (error) {
            return {
                success: false,
                data: null,
                message: error.message
            };
        }
    }

    async getCropsByType(cropType) {
        try {
            const result = await this.repository.getCropsByType(cropType);
            
            if (!result.success) {
                throw new Error(result.message);
            }

            return {
                success: true,
                data: result.data,
                message: result.message
            };
        } catch (error) {
            return {
                success: false,
                data: null,
                message: error.message
            };
        }
    }

    async getCropsStats() {
        try {
            const result = await this.repository.getCropsStats();
            
            if (!result.success) {
                throw new Error(result.message);
            }

            return {
                success: true,
                data: result.data,
                message: result.message
            };
        } catch (error) {
            return {
                success: false,
                data: null,
                message: error.message
            };
        }
    }
}

module.exports = Service;
