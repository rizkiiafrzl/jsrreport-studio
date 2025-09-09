const pool = require('../config/database');

class Repository {
    constructor() {
        this.pool = pool;
    }

    async getReportData(params = {}) {
        try {
            // Query to get crops data with optional filters
            let query = `
                SELECT 
                    id,
                    name,
                    crop_type,
                    variety,
                    start_method,
                    germination_rate,
                    seed_per_cell,
                    light_profile,
                    soil_condition,
                    days_to_emerge,
                    plant_spacing,
                    row_spacing,
                    planting_depth,
                    average_height,
                    days_to_flower,
                    days_to_maturity,
                    harvest_window,
                    loss_rate,
                    harvest_unit,
                    estimated_revenue,
                    expected_yield,
                    planting_details,
                    pruning_details,
                    botanical_name,
                    is_perennial,
                    auto_create_tasks,
                    created_at,
                    updated_at,
                    created_by,
                    updated_by
                FROM crops
            `;

            const queryParams = [];
            const conditions = [];

            // Add filters if provided
            if (params.crop_type) {
                conditions.push(`crop_type = $${queryParams.length + 1}`);
                queryParams.push(params.crop_type);
            }

            if (params.variety) {
                conditions.push(`variety = $${queryParams.length + 1}`);
                queryParams.push(params.variety);
            }

            if (params.is_perennial !== undefined) {
                conditions.push(`is_perennial = $${queryParams.length + 1}`);
                queryParams.push(params.is_perennial);
            }

            if (conditions.length > 0) {
                query += ` WHERE ${conditions.join(' AND ')}`;
            }

            query += ` ORDER BY name ASC`;

            const result = await this.pool.query(query, queryParams);
            
            // Transform data to match expected format
            const transformedData = this.transformCropsData(result.rows);

            return {
                success: true,
                data: transformedData,
                message: "Crops data retrieved successfully"
            };
        } catch (error) {
            console.error('Database Error:', error);
            return {
                success: false,
                data: null,
                message: error.message
            };
        }
    }

    async getReportDataByPeriode(periode) {
        try {
            // For crops data, we can filter by creation date or other relevant fields
            const query = `
                SELECT 
                    id,
                    name,
                    crop_type,
                    variety,
                    start_method,
                    germination_rate,
                    seed_per_cell,
                    light_profile,
                    soil_condition,
                    days_to_emerge,
                    plant_spacing,
                    row_spacing,
                    planting_depth,
                    average_height,
                    days_to_flower,
                    days_to_maturity,
                    harvest_window,
                    loss_rate,
                    harvest_unit,
                    estimated_revenue,
                    expected_yield,
                    planting_details,
                    pruning_details,
                    botanical_name,
                    is_perennial,
                    auto_create_tasks,
                    created_at,
                    updated_at,
                    created_by,
                    updated_by
                FROM crops
                WHERE EXTRACT(YEAR FROM created_at) = $1
                ORDER BY name ASC
            `;

            const year = periode.split('-')[1]; // Extract year from periode format "08-2025"
            const result = await this.pool.query(query, [year]);
            
            const transformedData = this.transformCropsData(result.rows, periode);

            return {
                success: true,
                data: transformedData,
                message: `Crops data retrieved successfully for periode: ${periode}`
            };
        } catch (error) {
            console.error('Database Error:', error);
            return {
                success: false,
                data: null,
                message: error.message
            };
        }
    }

    async getReportDataByUser(user) {
        try {
            const query = `
                SELECT 
                    id,
                    name,
                    crop_type,
                    variety,
                    start_method,
                    germination_rate,
                    seed_per_cell,
                    light_profile,
                    soil_condition,
                    days_to_emerge,
                    plant_spacing,
                    row_spacing,
                    planting_depth,
                    average_height,
                    days_to_flower,
                    days_to_maturity,
                    harvest_window,
                    loss_rate,
                    harvest_unit,
                    estimated_revenue,
                    expected_yield,
                    planting_details,
                    pruning_details,
                    botanical_name,
                    is_perennial,
                    auto_create_tasks,
                    created_at,
                    updated_at,
                    created_by,
                    updated_by
                FROM crops
                WHERE created_by = $1 OR updated_by = $1
                ORDER BY name ASC
            `;

            const result = await this.pool.query(query, [user]);
            
            const transformedData = this.transformCropsData(result.rows, null, user);

            return {
                success: true,
                data: transformedData,
                message: `Crops data retrieved successfully for user: ${user}`
            };
        } catch (error) {
            console.error('Database Error:', error);
            return {
                success: false,
                data: null,
                message: error.message
            };
        }
    }

    transformCropsData(cropsData, periode = "08-2025", user = "SYSTEM") {
        // Transform crops data to match the expected report format
        const transformedDatas = cropsData.map(crop => ({
            KODE_TANAMAN: crop.id.toString(),
            NAMA_TANAMAN: crop.name,
            JENIS_TANAMAN: crop.crop_type || "-",
            VARIETAS: crop.variety || "-",
            METODE_PEMBIBITAN: crop.start_method || "-",
            TINGKAT_PERKECAMBAHAN: crop.germination_rate?.toString() || "0",
            BENIH_PER_SEL: crop.seed_per_cell?.toString() || "0",
            PROFIL_CAHAYA: crop.light_profile || "-",
            KONDISI_TANAH: crop.soil_condition || "-",
            HARI_MUNCUL: crop.days_to_emerge?.toString() || "0",
            JARAK_TANAM: crop.plant_spacing?.toString() || "0",
            JARAK_BARIS: crop.row_spacing?.toString() || "0",
            KEDALAMAN_TANAM: crop.planting_depth?.toString() || "0",
            TINGGI_RATA_RATA: crop.average_height?.toString() || "0",
            HARI_BERBUNGA: crop.days_to_flower?.toString() || "0",
            HARI_PANEN: crop.days_to_maturity?.toString() || "0",
            JENDELA_PANEN: crop.harvest_window?.toString() || "0",
            TINGKAT_KEHILANGAN: crop.loss_rate?.toString() || "0",
            SATUAN_PANEN: crop.harvest_unit || "-",
            PENDAPATAN_ESTIMASI: crop.estimated_revenue?.toString() || "0",
            HASIL_ESTIMASI: crop.expected_yield?.toString() || "0",
            DETAIL_PENANAMAN: crop.planting_details || "-",
            DETAIL_PEMANGKASAN: crop.pruning_details || "-",
            NAMA_BOTANIS: crop.botanical_name || "-",
            TANAMAN_TAHUNAN: crop.is_perennial ? "Ya" : "Tidak",
            BUAT_TUGAS_OTOMATIS: crop.auto_create_tasks ? "Ya" : "Tidak"
        }));

        // Calculate totals
        const totalTarget = {
            TOTAL_TANAMAN: cropsData.length,
            TOTAL_HASIL_ESTIMASI: cropsData.reduce((sum, crop) => sum + (crop.expected_yield || 0), 0),
            RATA_RATA_PERKECAMBAHAN: cropsData.reduce((sum, crop) => sum + (crop.germination_rate || 0), 0) / cropsData.length || 0
        };

        const totalKategori = {
            TANAMAN_TAHUNAN: cropsData.filter(crop => crop.is_perennial).length,
            TANAMAN_MUSIMAN: cropsData.filter(crop => !crop.is_perennial).length,
            DENGAN_VARIETAS: cropsData.filter(crop => crop.variety).length,
            DENGAN_METODE_PEMBIBITAN: cropsData.filter(crop => crop.start_method).length,
            DENGAN_PROFIL_CAHAYA: cropsData.filter(crop => crop.light_profile).length
        };

        const totalKeuangan = {
            TOTAL_PENDAPATAN_ESTIMASI: cropsData.reduce((sum, crop) => sum + (crop.estimated_revenue || 0), 0),
            RATA_RATA_PENDAPATAN: cropsData.reduce((sum, crop) => sum + (crop.estimated_revenue || 0), 0) / cropsData.length || 0
        };

        return {
            template: "/KN/KNRKKP008/KNRKKP008-main",
            responseCode: 200,
            message: "Berhasil",
            code: "KNRKKP008",
            title: "REKAPITULASI DATA TANAMAN DAN PRODUKTIVITAS PERTANIAN",
            user: user,
            periode: periode,
            datas: transformedDatas,
            info: {
                kode_kantor_wilayah: "903",
                nama_kantor_wilayah: "KANWIL DKI JAKARTA",
                kode_kantor: "J0P",
                nama_kantor: "GRHA BPJAMSOSTEK"
            },
            totals: {
                totalTarget,
                totalKategori,
                totalKeuangan
            }
        };
    }

    // Additional methods for crops-specific operations
    async getCropsByType(cropType) {
        try {
            const query = `
                SELECT * FROM crops 
                WHERE crop_type = $1 
                ORDER BY name ASC
            `;
            
            const result = await this.pool.query(query, [cropType]);
            
            return {
                success: true,
                data: result.rows,
                message: `Crops retrieved successfully for type: ${cropType}`
            };
        } catch (error) {
            console.error('Database Error:', error);
            return {
                success: false,
                data: null,
                message: error.message
            };
        }
    }

    async getCropsStats() {
        try {
            const query = `
                SELECT 
                    COUNT(*) as total_crops,
                    COUNT(CASE WHEN is_perennial = true THEN 1 END) as perennial_crops,
                    COUNT(CASE WHEN is_perennial = false THEN 1 END) as annual_crops,
                    AVG(expected_yield) as avg_yield,
                    SUM(estimated_revenue) as total_revenue
                FROM crops
            `;
            
            const result = await this.pool.query(query);
            
            return {
                success: true,
                data: result.rows[0],
                message: "Crops statistics retrieved successfully"
            };
        } catch (error) {
            console.error('Database Error:', error);
            return {
                success: false,
                data: null,
                message: error.message
            };
        }
    }
}

module.exports = Repository;
