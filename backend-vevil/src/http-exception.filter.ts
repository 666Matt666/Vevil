import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Error interno del servidor';
    let errors: string[] | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const resp = exceptionResponse as Record<string, unknown>;
        message = (resp.message as string) || exception.message;
        
        // Si es un array de mensajes (validation errors)
        if (Array.isArray(resp.message)) {
          errors = resp.message;
          message = 'Error de validación';
        }
      } else {
        message = exception.message;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      
      // Loggear errores no manejados en desarrollo
      if (process.env.NODE_ENV !== 'production') {
        this.logger.error(`Unhandled error: ${exception.message}`, exception.stack);
      } else {
        this.logger.error(`Unhandled error: ${exception.message}`);
      }
    }

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      ...(errors && { errors }),
    };

    // No exponer detalles de errores en producción
    if (process.env.NODE_ENV === 'production' && status === HttpStatus.INTERNAL_SERVER_ERROR) {
      errorResponse.message = 'Error interno del servidor';
      delete (errorResponse as Record<string, unknown>).path;
      delete (errorResponse as Record<string, unknown>).method;
    }

    response.status(status).json(errorResponse);
  }
}
