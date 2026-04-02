/** PM2 on VPS: from /var/www/fomowiki run: pm2 start deploy/ecosystem.config.cjs */
module.exports = {
  apps: [
    {
      name: "fomowiki",
      cwd: "/var/www/fomowiki",
      script: "npm",
      args: "start",
      interpreter: "none",
      env: {
        NODE_ENV: "production",
        PORT: "3000",
      },
    },
  ],
};
