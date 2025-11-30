FROM node:20-alpine

WORKDIR /app

# Instalar dependencias del sistema necesarias para bcrypt
RUN apk add --no-cache python3 make g++

# Copiar archivos de dependencias
COPY package.json yarn.lock ./

# Instalar dependencias
RUN yarn install

# Copiar todo el código
COPY . .

# Compilar con npx directamente (evita problemas con nest cli)
RUN npx nest build

# Crear carpeta uploads
RUN mkdir -p uploads

# Exponer puerto
EXPOSE 3000

# Iniciar la aplicación
CMD ["node", "dist/main.js"]

