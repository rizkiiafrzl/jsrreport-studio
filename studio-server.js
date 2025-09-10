const jsreport = require('jsreport');

console.log('🚀 Starting JsReport Studio...');

// Initialize jsreport with minimal configuration
const jsreportInstance = jsreport({
    studio: {
        enabled: true,
        port: 5488
    },
    dataDirectory: './jsreport-data',
    // Ensure templates are saved to disk
    store: {
        provider: 'fs'
    },
    blobStorage: {
        provider: 'fs'
    },
    // Enable template persistence
    extensions: {
        'fs-store': {
            dataDirectory: './jsreport-data'
        }
    }
});

// Initialize and start jsreport
jsreportInstance.init().then(() => {
    console.log('🎉 JsReport Studio started successfully!');
    console.log('📊 Studio URL: http://localhost:5488');
    console.log('👤 Username: admin');
    console.log('🔑 Password: password');
    console.log('');
    console.log('📋 Next steps:');
    console.log('1. Open http://localhost:5488 in your browser');
    console.log('2. Login with admin/password');
    console.log('3. Create templates: crops-report-pdf and crops-report-excel');
    console.log('4. Test PDF/Excel generation from your Express app');
    console.log('');
    console.log('Press Ctrl+C to stop the studio');
}).catch((err) => {
    console.error('❌ Failed to start JsReport Studio:');
    console.error(err);
    process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down JsReport Studio...');
    if (jsreportInstance && jsreportInstance.close) {
        jsreportInstance.close().then(() => {
            console.log('✅ Studio stopped successfully');
            process.exit(0);
        }).catch((err) => {
            console.error('❌ Error stopping studio:', err.message);
            process.exit(1);
        });
    } else {
        process.exit(0);
    }
});
