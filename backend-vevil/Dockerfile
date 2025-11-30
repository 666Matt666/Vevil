# Dockerfile para NestJS
FROM node:20-alpine

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json yarn.lock ./

# Instalar TODAS las dependencias
RUN yarn install --frozen-lockfile

# Copiar código fuente
COPY . .

# Verificar que los archivos existen
RUN echo "=== Archivos en src ===" && ls -la src/

# Compilar TypeScript
RUN yarn build

# Verificar que el build generó archivos
RUN echo "=== Archivos en dist ===" && ls -la dist/ || echo "dist no existe!"

# Crear carpeta uploads
RUN mkdir -p uploads

# Exponer puerto
EXPOSE 3000

# Comando de inicio
CMD ["node", "dist/main.js"]
