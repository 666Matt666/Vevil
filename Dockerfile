FROM node:20-slim
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY backend-vevil/package.json backend-vevil/package-lock.json ./
RUN npm install
COPY backend-vevil/ .
RUN node ./node_modules/typescript/bin/tsc -p tsconfig.build.json
RUN ls -la dist/
EXPOSE 3000
CMD ["node", "dist/main.js"]