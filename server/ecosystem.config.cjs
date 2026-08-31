module.exports = {
    apps: [{
        name: 'cloverton-api',
        script: 'dist/index.js',
        instances: 1,
        autorestart: true,
        watch: false,
        // Tender PDF generation renders a whole document in memory. 256M was low
        // enough that a long tender could trip a restart mid-generation and hand the
        // client a truncated download.
        max_memory_restart: '768M',
        env: {
            NODE_ENV: 'production',
            PORT: 3001
        }
    }]
}
