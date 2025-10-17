module.exports = {
  apps: [{
    name: 'ecommerce-rwanda',
    script: 'server.js',
    instances: process.env.NODE_ENV === 'production' ? 'max' : 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    merge_logs: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    // Graceful shutdown
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 10000,
    // Clustering for better performance
    exec_mode: 'cluster',
    // Monitoring
    monitoring: true,
    // Restart policy
    min_uptime: '10s',
    max_restarts: 10,
    restart_delay: 4000,
  }]
};