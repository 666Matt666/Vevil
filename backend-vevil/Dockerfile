FROM node:20-slim
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY backend-vevil/package.json backend-vevil/package-lock.json ./
RUN npm install
COPY backend-vevil/ .
RUN echo "=== Archivos en /app ===" && ls -la
RUN echo "=== tsconfig.build.json ===" && cat tsconfig.build.json
RUN node ./node_modules/typescript/bin/tsc -p tsconfig.build.json 2>&1 || echo "TSC ERROR"
RUN echo "=== Verificando dist ===" && ls -la dist/ || echo "DIST NO EXISTE"
EXPOSE 3000
CMD ["node", "dist/main.js"]
