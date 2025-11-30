FROM node:20-slim
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# Copiar package.json
COPY package*.json ./

# Instalar TODAS las dependencias
RUN npm install

# Copiar código fuente
COPY src ./src
COPY tsconfig*.json ./
COPY nest-cli.json ./

# Compilar con NestJS (resuelve path aliases)
RUN npm run build

# Verificar que el build fue exitoso
RUN ls -la dist/ && ls -la dist/src/ || true

EXPOSE 3000

# El archivo compilado está en dist/src/main.js según nest-cli
CMD ["node", "dist/src/main.js"]
