FROM node:20-slim
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# Copiar package.json
COPY backend-vevil/package*.json ./

# Instalar TODAS las dependencias
RUN npm install

# Copiar código fuente
COPY backend-vevil/src ./src
COPY backend-vevil/tsconfig*.json ./
COPY backend-vevil/nest-cli.json ./

# Compilar con NestJS (resuelve path aliases)
RUN npm run build

# Verificar
RUN ls -la dist/

EXPOSE 3000
CMD ["node", "dist/main.js"]
