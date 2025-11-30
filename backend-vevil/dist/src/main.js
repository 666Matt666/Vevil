"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const corsOrigins = process.env.CORS_ORIGINS
        ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
        : [
            'http://localhost:5173',
            'http://localhost:3000',
            /\.vercel\.app$/,
            /\.vercel\.dev$/,
        ];
    app.enableCors({
        origin: corsOrigins,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    });
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Vevil API')
        .setDescription('API del sistema Vevil')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document);
    const port = process.env.PORT || 3000;
    await app.listen(port, '0.0.0.0');
    console.log(`🚀 Servidor corriendo en puerto ${port}`);
    console.log(`🌐 Accesible en http://localhost:${port} y http://192.168.1.38:${port}`);
    console.log(`📚 Documentación disponible en /api/docs`);
}
bootstrap();
//# sourceMappingURL=main.js.map