"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const cookieParser = __importStar(require("cookie-parser"));
async function bootstrap() {
    try {
        if (process.env.NODE_ENV !== 'production') {
            console.log('🚀 Iniciando aplicación Vevil...');
        }
        const app = await core_1.NestFactory.create(app_module_1.AppModule);
        app.use(cookieParser());
        const defaultOrigins = [
            /^http:\/\/localhost(:\d+)?$/,
            'http://localhost:3000',
            /^https:\/\/[^.]+\.vercel\.app$/,
            /\.vercel\.dev$/,
        ];
        const envOrigins = process.env.CORS_ORIGINS
            ? process.env.CORS_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean)
            : [];
        const corsOrigins = [...envOrigins, ...defaultOrigins];
        app.enableCors({
            origin: corsOrigins,
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization'],
        });
        if (process.env.NODE_ENV !== 'production') {
            app.use((req, _res, next) => {
                const origin = req.headers?.origin ?? req.headers?.Origin ?? '(none)';
                console.log(`[Vevil] ${req.method} ${req.url} | Origin: ${origin}`);
                next();
            });
        }
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
        console.log('✅ Aplicación iniciada correctamente');
        if (process.env.NODE_ENV !== 'production') {
            console.log(`🚀 Servidor en http://localhost:${port}`);
            console.log(`📚 Swagger: http://localhost:${port}/api/docs`);
        }
        else {
            console.log(`🚀 Servidor en puerto ${port}`);
        }
    }
    catch (error) {
        console.error('❌ Error al iniciar la aplicación:', error.message);
        if (error.message?.includes('ECONNREFUSED') || error.message?.includes('Connection refused')) {
            console.error('\n💡 PROBLEMA: No se puede conectar a la base de datos');
            console.error('   Soluciones posibles:');
            console.error('   1. Verifica que PostgreSQL esté corriendo (docker-compose up -d)');
            console.error('   2. Verifica las variables de entorno (DB_HOST, DB_PORT, etc.)');
            console.error('   3. Verifica que el host y puerto sean correctos');
        }
        else if (error.message?.includes('password authentication failed')) {
            console.error('\n💡 PROBLEMA: Autenticación fallida');
            console.error('   Soluciones posibles:');
            console.error('   1. Verifica DB_USERNAME y DB_PASSWORD en las variables de entorno');
            console.error('   2. Verifica que las credenciales coincidan con tu base de datos');
        }
        else if (error.message?.includes('Variables de entorno faltantes')) {
            console.error('\n💡 PROBLEMA: Faltan variables de entorno requeridas');
            console.error('   Soluciones posibles:');
            console.error('   1. Crea un archivo .env con las variables necesarias');
            console.error('   2. Configura las variables en tu plataforma de despliegue');
            console.error('   3. Revisa el archivo .env.example para ver qué variables necesitas');
        }
        process.exit(1);
    }
}
bootstrap();
//# sourceMappingURL=main.js.map