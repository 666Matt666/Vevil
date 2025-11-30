FROM node:20-alpine

WORKDIR /app

# Instalar dependencias del sistema
RUN apk add --no-cache python3 make g++

# Copiar archivos de dependencias
COPY package.json yarn.lock ./

# Instalar dependencias
RUN yarn install

# Copiar todo el código
COPY . .

# DEBUG: Ver contenido de src
RUN echo "=== Contenido de /app ===" && ls -la
RUN echo "=== Contenido de /app/src ===" && ls -la src/

# Compilar con tsc directamente
RUN ./node_modules/.bin/tsc -p tsconfig.build.json

# DEBUG: Ver si se generó dist
RUN echo "=== Contenido de /app/dist ===" && ls -la dist/ && ls -la dist/

# Crear carpeta uploads
RUN mkdir -p uploads

EXPOSE 3000

CMD ["node", "dist/main.js"]
