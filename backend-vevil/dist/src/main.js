"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const helmet_1 = __importDefault(require("helmet"));
const app_module_1 = require("./app.module");
const http_exception_filter_1 = require("./http-exception.filter");
const security_headers_middleware_1 = require("./common/middleware/security-headers.middleware");
function buildCorsOrigins() {
    const defaultOrigins = [
        /^http:\/\/localhost(:\d+)?$/,
        'http://localhost:3000',
        /^https:\/\/[^.]+\.vercel\.app$/,
        /\.vercel\.dev$/,
        'https://vevil-dtt7ta.fly.dev',
        /^https:\/\/vevil\.fly\.dev$/,
        'https://vevil-qa.fly.dev',
        /^https:\/\/vevil-dev\.fly\.dev$/,
    ];
    const envOrigins = process.env.CORS_ORIGINS
        ? process.env.CORS_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean)
        : [];
    return [...envOrigins, ...defaultOrigins];
}
function isOriginAllowed(origin, allowedOrigins) {
    return allowedOrigins.some((allowed) => {
        if (typeof allowed === 'string') {
            return allowed === origin;
        }
        if (allowed instanceof RegExp) {
            return allowed.test(origin);
        }
        return false;
    });
}
async function bootstrap() {
    try {
        const logger = new common_1.Logger('Bootstrap');
        if (process.env.NODE_ENV !== 'production') {
            logger.log('Iniciando aplicación Vevil...');
        }
        else {
            logger.log('Iniciando en PRODUCCIÓN...');
        }
        const app = await core_1.NestFactory.create(app_module_1.AppModule);
        app.use((0, helmet_1.default)({
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    scriptSrc: ["'self'", "'unsafe-inline'"],
                    styleSrc: ["'self'", "'unsafe-inline'"],
                    imgSrc: ["'self'", "data:", "https:"],
                    connectSrc: ["'self'", process.env.API_URL || 'http://localhost:3000'],
                },
            },
            crossOriginEmbedderPolicy: false,
        }));
        app.use((0, cookie_parser_1.default)());
        const securityHeadersMiddleware = new security_headers_middleware_1.SecurityHeadersMiddleware();
        app.use(securityHeadersMiddleware.use.bind(securityHeadersMiddleware));
        const corsOrigins = buildCorsOrigins();
        app.enableCors({
            origin: (requestOrigin, callback) => {
                if (!requestOrigin) {
                    return callback(null, true);
                }
                const isAllowed = isOriginAllowed(requestOrigin, corsOrigins);
                if (isAllowed) {
                    callback(null, true);
                }
                else {
                    logger.warn(`CORS: Origen bloqueado - ${requestOrigin}`);
                    callback(new Error('Origin not allowed'), false);
                }
            },
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
            exposedHeaders: ['Set-Cookie'],
        });
        if (process.env.NODE_ENV !== 'production') {
            app.use((req, _res, next) => {
                const origin = req.headers?.origin ?? req.headers?.Origin ?? '(none)';
                logger.debug(`${req.method} ${req.url} | Origin: ${origin}`);
                next();
            });
        }
        app.setGlobalPrefix('api');
        app.useGlobalPipes(new common_1.ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }));
        app.useGlobalFilters(new http_exception_filter_1.AllExceptionsFilter());
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
        logger.log('Aplicación iniciada correctamente');
        if (process.env.NODE_ENV !== 'production') {
            logger.log(`Servidor en http://localhost:${port}`);
            logger.log(`Swagger: http://localhost:${port}/api/docs`);
        }
        else {
            logger.log(`Servidor en puerto ${port}`);
        }
    }
    catch (error) {
        const errorLogger = new common_1.Logger('BootstrapError');
        errorLogger.error(`Error al iniciar la aplicación: ${error.message}`);
        const errorMessage = error.message || '';
        if (errorMessage.includes('ECONNREFUSED') || errorMessage.includes('Connection refused')) {
            errorLogger.error('\n💡 PROBLEMA: No se puede conectar a la base de datos');
            errorLogger.error('   Soluciones posibles:');
            errorLogger.error('   1. Verifica que PostgreSQL esté corriendo (docker-compose up -d)');
            errorLogger.error('   2. Verifica las variables de entorno (DB_HOST, DB_PORT, etc.)');
            errorLogger.error('   3. Verifica que el host y puerto sean correctos');
        }
        else if (errorMessage.includes('password authentication failed')) {
            errorLogger.error('\n💡 PROBLEMA: Autenticación fallida');
            errorLogger.error('   Soluciones posibles:');
            errorLogger.error('   1. Verifica DB_USERNAME y DB_PASSWORD en las variables de entorno');
            errorLogger.error('   2. Verifica que las credenciales coincidan con tu base de datos');
        }
        else if (errorMessage.includes('Variables de entorno faltantes')) {
            errorLogger.error('\n💡 PROBLEMA: Faltan variables de entorno requeridas');
            errorLogger.error('   Soluciones posibles:');
            errorLogger.error('   1. Crea un archivo .env con las variables necesarias');
            errorLogger.error('   2. Configura las variables en tu plataforma de despliegue');
            errorLogger.error('   3. Revisa el archivo .env.example para ver qué variables necesitas');
        }
        process.exit(1);
    }
}
bootstrap();
//# sourceMappingURL=main.js.map