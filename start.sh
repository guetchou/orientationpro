
#!/bin/sh

# Démarrer le backend avec PM2
cd /app/backend
pm2 start server.js --name api

# Démarrer Nginx
nginx -g "daemon off;"
