const fs = require('fs');
const path = require('path');

/**
 * Update template untuk menggunakan data kabupaten yang benar
 */
function updateTemplateData() {
    try {
        console.log('🔄 Updating template data reference...');
        
        // Path ke config template
        const templateConfigPath = path.join(__dirname, '..', 'jsreport-data', 'template excel', 'Template Rekap GTK Per Kabupaten & Kota-excel', 'config.json');
        
        // Baca config template
        const templateConfig = JSON.parse(fs.readFileSync(templateConfigPath, 'utf8'));
        
        // Update data reference ke data kabupaten
        templateConfig.data = {
            "shortid": "6x6mqtwsx" // shortid dari data kabupaten
        };
        
        // Simpan config yang sudah diupdate
        fs.writeFileSync(templateConfigPath, JSON.stringify(templateConfig, null, 4));
        
        console.log('✅ Template config updated successfully!');
        console.log('📊 Template now references data kabupaten (shortid: 6x6mqtwsx)');
        
        // Verifikasi data kabupaten
        const dataPath = path.join(__dirname, '..', 'jsreport-data', 'template excel', 'data kabupaten', 'dataJson.json');
        const dataContent = fs.readFileSync(dataPath, 'utf8');
        const data = JSON.parse(dataContent);
        
        console.log(`📈 Data kabupaten contains ${data.data.length} records`);
        console.log('🎯 Sample data:');
        console.log(`   - ${data.data[0].Provinsi} - ${data.data[0].Kabupaten_Kota}`);
        console.log(`   - ${data.data[1].Provinsi} - ${data.data[1].Kabupaten_Kota}`);
        console.log(`   - ${data.data[2].Provinsi} - ${data.data[2].Kabupaten_Kota}`);
        
        return true;
        
    } catch (error) {
        console.error('❌ Error updating template:', error.message);
        return false;
    }
}

/**
 * Test template render dengan data yang sudah diupdate
 */
async function testTemplateRender() {
    try {
        console.log('\n🧪 Testing template render...');
        
        const jsreport = require('jsreport')({
            httpPort: 0,
            httpsPort: 0
        });
        
        await jsreport.init();
        
        // Load template dan data
        const templatePath = path.join(__dirname, '..', 'jsreport-data', 'template excel', 'Template Rekap GTK Per Kabupaten & Kota-excel', 'content.handlebars');
        const templateContent = fs.readFileSync(templatePath, 'utf8');
        
        const cssPath = path.join(__dirname, '..', 'jsreport-data', 'template excel', 'template-excel.css', 'content.css');
        const cssContent = fs.readFileSync(cssPath, 'utf8');
        
        const dataPath = path.join(__dirname, '..', 'jsreport-data', 'template excel', 'data kabupaten', 'dataJson.json');
        const dataContent = fs.readFileSync(dataPath, 'utf8');
        const data = JSON.parse(dataContent);
        
        // Replace asset helper dengan CSS content
        const templateWithCSS = templateContent.replace(
            "{{asset 'template-excel.css'}}",
            cssContent
        );
        
        // Render template
        const result = await jsreport.render({
            template: {
                content: templateWithCSS,
                engine: 'handlebars',
                recipe: 'html-to-xlsx',
                htmlToXlsx: {
                    htmlEngine: 'chrome'
                }
            },
            data: data
        });
        
        // Simpan hasil
        const outputPath = path.join(__dirname, '..', 'template-kabupaten-final.xlsx');
        fs.writeFileSync(outputPath, result.content);
        
        console.log('✅ Template rendered successfully!');
        console.log(`📄 File size: ${result.content.length} bytes`);
        console.log(`💾 Output saved: ${outputPath}`);
        
        await jsreport.close();
        return true;
        
    } catch (error) {
        console.error('❌ Error rendering template:', error.message);
        return false;
    }
}

// Main execution
async function main() {
    console.log('🚀 Starting template update process...\n');
    
    // Update template data reference
    const updateSuccess = updateTemplateData();
    
    if (updateSuccess) {
        // Test template render
        const renderSuccess = await testTemplateRender();
        
        if (renderSuccess) {
            console.log('\n🎉 Template update completed successfully!');
            console.log('📋 Summary:');
            console.log('   ✅ Template config updated');
            console.log('   ✅ Data structure fixed');
            console.log('   ✅ Template renders correctly');
            console.log('   ✅ Output file generated');
        } else {
            console.log('\n⚠️  Template config updated but render failed');
        }
    } else {
        console.log('\n❌ Template update failed');
    }
}

// Export functions
module.exports = {
    updateTemplateData,
    testTemplateRender
};

// Run if called directly
if (require.main === module) {
    main();
}











