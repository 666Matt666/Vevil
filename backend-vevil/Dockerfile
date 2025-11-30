FROM node:20-slim
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY backend-vevil/package.json backend-vevil/package-lock.json ./
RUN npm install --production
COPY backend-vevil/dist ./dist
EXPOSE 3000
CMD ["node", "dist/main.js"]
