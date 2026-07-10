/**
 * PM2 Production Ecosystem Config
 * Usage: pm2 start pm2.ecosystem.config.js --env production
 */
module.exports = {
  apps: [
    {
      name: "domelink-api",
      script: "dist/server.js",
      instances: "max",           // cluster mode — one per CPU core
      exec_mode: "cluster",
      watch: false,
      exp_backoff_restart_delay: 100,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "development",
        PORT: 5000,
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 5000,
      },
      error_file: "logs/err.log",
      out_file: "logs/out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      // Graceful shutdown
      kill_timeout: 10000,
      wait_ready: true,
      listen_timeout: 10000,
    },
  ],
};
