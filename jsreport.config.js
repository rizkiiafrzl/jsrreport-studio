module.exports = {
    // Studio configuration
    studio: {
        enabled: true,
        port: 5488,
        // Allow access from any IP (for development)
        allowedOrigins: ['*']
    },
    
    // Extensions configuration (removed CLI to avoid conflicts)
    extensions: {
        'chrome-pdf': {
            launchOptions: {
                args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
            }
        },
        'xlsx': {
            // Excel export configuration
        }
    },
    
    // Data directory for templates and data (fs-store root)
    dataDirectory: './jsreport-data',
    
    // Templates configuration
    templates: {
        allowedModules: ['*']
    },
    
    // Security configuration
    security: {
        // Allow all modules for development
        allowedModules: ['*']
    },
    
    // Store configuration
    store: {
        provider: 'fs'
    },
    
    // Blob storage configuration
    blobStorage: {
        provider: 'fs'
    }
};

