# Dockerfile simplificado para NestJS
FROM node:20-alpine

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json yarn.lock ./

# Instalar TODAS las dependencias (incluyendo devDependencies para el build)
RUN yarn install --frozen-lockfile

# Copiar código fuente
COPY . .

# Compilar TypeScript
RUN yarn build

# Crear carpeta uploads
RUN mkdir -p uploads

# Limpiar devDependencies después del build
RUN yarn install --production --frozen-lockfile

# Exponer puerto
EXPOSE 3000

# Comando de inicio
CMD ["node", "dist/main.js"]
