module.exports = {
  apps: [
    {
      name: 'mistypay-api',
      script: 'dist/main.js',
      instances: 'max', // Utilizes all available CPU cores in cluster mode
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M', // Restarts the application if memory usage exceeds 500MB
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
};
