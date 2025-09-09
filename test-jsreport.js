const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testEndpoints() {
    console.log('🧪 Testing JsReport Integration...\n');

    try {
        // Test health check
        console.log('1. Testing Health Check...');
        const healthResponse = await axios.get(`${BASE_URL}/health`);
        console.log('✅ Health Check:', healthResponse.data.message);
        console.log('');

        // Test report data
        console.log('2. Testing Report Data...');
        const dataResponse = await axios.get(`${BASE_URL}/report/data`);
        console.log('✅ Report Data:', dataResponse.data.message);
        console.log('   Total records:', dataResponse.data.data.datas.length);
        console.log('');

        // Test PDF generation
        console.log('3. Testing PDF Generation...');
        try {
            const pdfResponse = await axios.get(`${BASE_URL}/report/pdf`, {
                responseType: 'arraybuffer'
            });
            console.log('✅ PDF Generated:', pdfResponse.headers['content-type']);
            console.log('   Size:', pdfResponse.data.length, 'bytes');
        } catch (error) {
            console.log('⚠️  PDF Generation:', error.response?.data?.message || error.message);
        }
        console.log('');

        // Test Excel generation
        console.log('4. Testing Excel Generation...');
        try {
            const excelResponse = await axios.get(`${BASE_URL}/report/excel`, {
                responseType: 'arraybuffer'
            });
            console.log('✅ Excel Generated:', excelResponse.headers['content-type']);
            console.log('   Size:', excelResponse.data.length, 'bytes');
        } catch (error) {
            console.log('⚠️  Excel Generation:', error.response?.data?.message || error.message);
        }
        console.log('');

        // Test with parameters
        console.log('5. Testing with Parameters...');
        const paramResponse = await axios.get(`${BASE_URL}/report/data?periode=08-2025&user=TEST`);
        console.log('✅ Report with Parameters:', paramResponse.data.message);
        console.log('   Periode:', paramResponse.data.data.periode);
        console.log('   User:', paramResponse.data.data.user);
        console.log('');

        // Test crops stats
        console.log('6. Testing Crops Statistics...');
        const statsResponse = await axios.get(`${BASE_URL}/crops/stats`);
        console.log('✅ Crops Stats:', statsResponse.data.message);
        console.log('   Total Crops:', statsResponse.data.data.total_crops);
        console.log('');

        console.log('🎉 All tests completed!');
        console.log('');
        console.log('📋 Next Steps:');
        console.log('1. Start jsreport studio: npm run studio:dev');
        console.log('2. Access studio at: http://localhost:5488');
        console.log('3. Create templates: crops-report-pdf and crops-report-excel');
        console.log('4. Test PDF/Excel generation again');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.log('💡 Make sure the server is running: npm run dev');
        }
    }
}

// Run tests
testEndpoints();

