FROM node:20-slim

# Instalar dependencias del sistema para bcrypt
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copiar package.json y yarn.lock
COPY package.json yarn.lock ./

# Instalar dependencias
RUN npm install -g yarn && yarn install

# Copiar código fuente
COPY . .

# Compilar TypeScript
RUN ./node_modules/.bin/tsc -p tsconfig.build.json

# Verificar que dist existe
RUN ls -la dist/

# Puerto
EXPOSE 3000

# Iniciar
CMD ["node", "dist/main.js"]

