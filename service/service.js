const Repository = require('../repository/repository');
const path = require('path');

// Import jsreport for report generation (without studio)
let jsreport = null;
let jsreportInitialized = false;

async function initializeJsReport() {
    if (jsreportInitialized) return jsreport;
    
    try {
        const dataDir = path.resolve(__dirname, '../jsreport-data');
        jsreport = require('jsreport')({
            dataDirectory: dataDir,
            studio: { enabled: false },
            store: { provider: 'fs' },
            blobStorage: { provider: 'fs' },
            extensions: {
                express: { enabled: false },
                studio: { enabled: false },
                'fs-store': { dataDirectory: dataDir }
            }
        });
        await jsreport.init();
        jsreportInitialized = true;
        console.log('JsReport initialized. Using data directory:', dataDir);
        return jsreport;
    } catch (err) {
        console.log('jsreport not available in service, using fallback mode:', err.message);
        return null;
    }
}

class Service {
    constructor() {
        this.repository = new Repository();
    }

    async ensureTemplateExists(jsreportInstance, templateName, templateContent) {
        try {
            // Check if template exists
            const existingTemplate = await jsreportInstance.documentStore.collection('templates').findOne({ name: templateName });
            
            if (!existingTemplate) {
                console.log(`Creating template: ${templateName}`);
                // Create template
                await jsreportInstance.documentStore.collection('templates').insert({
                    name: templateName,
                    content: templateContent,
                    engine: 'handlebars',
                    recipe: 'chrome-pdf',
                    isSystem: false
                });
                console.log(`Template ${templateName} created successfully`);
            } else {
                console.log(`Template ${templateName} already exists`);
            }
        } catch (error) {
            console.log(`Error ensuring template ${templateName}:`, error.message);
        }
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

            const templateName = process.env.JSREPORT_TEMPLATE_NAME || 'template-pdf';

            const jsreportInstance = await initializeJsReport();
            if (jsreportInstance) {
                try {
                    // TEMP: list visible templates for diagnostics
                    try {
                        const list = await jsreportInstance.documentStore.collection('templates').find({});
                        console.log('Visible templates:', list.map(t => t.name));
                    } catch (e) {
                        console.log('Unable to list templates:', e.message);
                    }
                    let report;
                    try {
                        console.log(`Attempting to use template: ${templateName}`);
                        report = await jsreportInstance.render({
                            template: { name: templateName },
                            data: reportData.data
                        });
                        console.log(`Successfully used template: ${templateName}`);
                    } catch (templateError) {
                        throw new Error(`Template not found or failed: ${templateName}. ${templateError.message}`);
                    }

                    return {
                        success: true,
                        data: report.content,
                        message: "PDF report generated successfully using jsreport",
                        contentType: 'application/pdf'
                    };
                } catch (jsreportError) {
                    return {
                        success: false,
                        data: null,
                        message: `PDF generation failed: ${jsreportError.message}`
                    };
                }
            }
        } catch (error) {
            console.error('jsreport PDF generation error:', error);
            return { success: false, data: null, message: error.message };
        }
    }

    async generateExcelReport(params = {}) {
        try {
            const reportData = await this.getReportData(params);
            
            if (!reportData.success) {
                throw new Error(reportData.message);
            }

            // Use jsreport to generate Excel if available
            const jsreportInstance = await initializeJsReport();
            if (jsreportInstance) {
                try {
                    const report = await jsreportInstance.render({
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
        try {
            const reportData = await this.getReportData(params);
            if (!reportData.success) {
                throw new Error(reportData.message);
            }
            
            const csvContent = this.createCSVTemplate(reportData.data);
            return {
                success: true,
                data: csvContent,
                message: "CSV report generated (jsreport template not found, using fallback)",
                contentType: 'text/csv'
            };
        } catch (fallbackError) {
            return {
                success: false,
                data: null,
                message: fallbackError.message
            };
        }
    }

    createHTMLTemplate(data) {
        const kantor = data.info?.nama_kantor || 'KANTOR PUSAT';
        const periodeText = data.periode || '-';
        const codeLeft = data.code || 'KNODIK003';
        const codeRight = data.reportCode || 'REKAP2025';
        return `
        <!DOCTYPE html>
        <html lang="id">
        <head>
          <meta charset="utf-8">
          <title>${data.title || 'REKAP GTK PER PROVINSI'}</title>
          <style>
            @page { size: A4 landscape; margin: 16mm 12mm 16mm 12mm; }
            html, body { margin: 0; padding: 0; }
            body { font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #000; }
            .page-header { display: grid; grid-template-columns: 1fr auto; align-items: center; gap: 12px; margin-bottom: 8px; }
            .brand { display: flex; align-items: center; gap: 10px; }
            .brand-logo { width: 120px; height: 32px; background: url('https://upload.wikimedia.org/wikipedia/commons/5/5e/BPJS_Ketenagakerjaan_logo.svg') no-repeat left center/contain; }
            .brand-title { font-weight: bold; text-align: center; width: 100%; }
            .brand-title .title-line-1 { font-weight: 700; }
            .brand-title .title-line-2 { font-weight: 700; }
            .brand-title .periode { margin-top: 2px; }
            .meta { line-height: 1.25; text-align: right; font-size: 11px; }
            .meta-row { white-space: nowrap; }
            .section { margin-top: 8px; margin-bottom: 6px; display: grid; grid-template-columns: auto 1fr; gap: 8px; align-items: center; }
            .section .label { font-weight: bold; }
            .section .value { font-weight: 600; }
            .section .underline { grid-column: 1 / -1; height: 2px; background: #1e90ff; margin-top: 6px; margin-bottom: 2px; border-radius: 2px; }
            table { width: 100%; border-collapse: collapse; table-layout: fixed; }
            thead th { background: #efefef; font-weight: 700; border: 1px solid #cfcfcf; padding: 6px 8px; text-align: center; }
            tbody td { border: 1px solid #d9d9d9; padding: 6px 8px; vertical-align: middle; }
            .col-no { width: 38px; text-align: center; }
            .col-work { width: auto; }
            .col-aktif { width: 80px; text-align: center; }
            .col-tambah { width: 100px; text-align: center; }
            .page-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 8px; font-size: 11px; }
            .code-left { font-weight: 600; }
            .code-right { font-weight: 700; padding: 2px 8px; border-radius: 10px; border: 2px solid #27ae60; color: #27ae60; }
            @media print { .page-header { position: running(pageHeader); } .page-footer { position: running(pageFooter); } .print-header { display: block; height: 0; } .print-footer { display: block; height: 0; } .with-header { margin-top: 8px; } .with-footer { margin-bottom: 8px; } }
          </style>
        </head>
        <body>
          <div class="page-header">
            <div class="brand">
              <div class="brand-logo" aria-hidden="true"></div>
              <div class="brand-title">
                <div class="title-line-1">${data.title || 'REKAP GTK PER PROVINSI'}</div>
                <div class="title-line-2">${data.subtitle || 'SEMUA JENIS KEPEGAWAIAN'}</div>
                <div class="periode">Periode: ${periodeText}</div>
              </div>
            </div>
            <div class="meta">
              <div class="meta-row">Halaman : 1/1</div>
              <div class="meta-row">Tanggal Cetak : ${new Date().toLocaleDateString('id-ID')}</div>
              <div class="meta-row">Waktu Cetak : ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
          </div>

          <div class="section">
            <div class="label">NAMA KANTOR :</div>
            <div class="value">${kantor}</div>
            <div class="underline"></div>
          </div>

          <table class="with-header with-footer">
            <thead>
              <tr>
                <th class="col-no">NO.</th>
                <th class="col-work">WORKDESC</th>
                <th class="col-aktif">TK AKTIF</th>
                <th class="col-tambah">PENAMBAHAN</th>
              </tr>
            </thead>
            <tbody>
              ${data.datas.map((item, idx) => {
                const work = item.WORKDESC || item.NAMA_TANAMAN || item.name || '-';
                const aktif = item.TK_AKTIF ?? item.HASIL_ESTIMASI ?? item.expected_yield ?? 0;
                const tambah = item.PENAMBAHAN ?? item.PENDAPATAN_ESTIMASI ?? item.estimated_revenue ?? 0;
                return `<tr><td class="col-no">${idx + 1}</td><td class="col-work">${work}</td><td class="col-aktif">${aktif}</td><td class="col-tambah">${tambah}</td></tr>`;
              }).join('')}
            </tbody>
          </table>

          <div class="page-footer">
            <div class="code-left">${codeLeft}</div>
            <div class="code-right">${codeRight}</div>
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
