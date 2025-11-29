# ---- Build Stage ----
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json yarn.lock ./

# Instalar dependencias
RUN yarn install --frozen-lockfile

# Copiar código fuente
COPY . .

# Compilar TypeScript
RUN yarn build

# ---- Production Stage ----
FROM node:18-alpine AS production

WORKDIR /app

# Copiar solo lo necesario para producción
COPY package*.json yarn.lock ./
RUN yarn install --production --frozen-lockfile

# Copiar el build compilado
COPY --from=builder /app/dist ./dist

# Crear carpeta uploads
RUN mkdir -p uploads

# Exponer puerto
EXPOSE 3000

# Comando de inicio
CMD ["node", "dist/main"]

