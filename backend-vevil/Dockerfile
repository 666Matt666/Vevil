FROM node:20-slim

# Instalar dependencias del sistema para bcrypt
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copiar package.json y package-lock.json
COPY package.json package-lock.json ./

# Instalar dependencias con npm
RUN npm ci

# Copiar código fuente
COPY . .

# Compilar TypeScript
RUN npm run build

# Verificar que dist existe
RUN ls -la dist/

# Puerto
EXPOSE 3000

# Iniciar
CMD ["node", "dist/main.js"]
