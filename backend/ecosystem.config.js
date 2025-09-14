module.exports = {
  apps: [
    {
      name: 'atlantic-backend',
      script: 'server.js',
      cwd: '/var/www/altantis/backend',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: '/var/log/pm2/atlantic-backend-error.log',
      out_file: '/var/log/pm2/atlantic-backend-out.log',
      log_file: '/var/log/pm2/atlantic-backend.log',
      time: true,
      // Restart policy
      min_uptime: '10s',
      max_restarts: 10,
      // Graceful shutdown
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
      // Health check
      health_check_grace_period: 3000
    }
  ]
};
