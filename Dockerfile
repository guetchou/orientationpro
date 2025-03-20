
# Étape de build - Frontend
FROM node:20-alpine as frontend-builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Étape de build - Backend
FROM node:20-alpine as backend-builder

# Création du répertoire backend
WORKDIR /app/backend
COPY backend/package*.json ./

# Installation des dépendances de production uniquement
RUN npm ci

# Copie du code source backend
COPY backend .

# Build du backend
RUN npm run build

# Étape de production avec Nginx et Node
FROM nginx:alpine

# Installation de Node.js et PM2
RUN apk add --update nodejs npm
RUN npm install pm2 -g

# Copier la configuration nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Créer la structure de répertoires
WORKDIR /app

# Copier les fichiers frontend buildés
COPY --from=frontend-builder /app/dist /usr/share/nginx/html

# Copier les fichiers backend
COPY --from=backend-builder /app/backend/dist /app/backend/dist
COPY --from=backend-builder /app/backend/node_modules /app/backend/node_modules
COPY --from=backend-builder /app/backend/package.json /app/backend/package.json

# Copier le script de démarrage
COPY ./start.sh /app/start.sh
RUN chmod +x /app/start.sh

EXPOSE 80
EXPOSE 3000

# Démarrer Nginx et le serveur Node.js via PM2
CMD ["/app/start.sh"]
