
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

# Use PM2 to manage the application
RUN npm install pm2 -g

CMD ["pm2-runtime", "src/server.js"]
