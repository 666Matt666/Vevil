import {
  ArgumentsHost,
  Catch,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let message: string;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        message = JSON.stringify(exceptionResponse);
      } else {
        message = exceptionResponse
          ? String(exceptionResponse)
          : exception.message || 'Error HTTP';
      }
    } else if (exception instanceof Error) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = exception.message;
      this.logger.error(
        `Exception: ${exception.name} - ${exception.message}`,
        exception.stack,
      );
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Unknown error';
      this.logger.error(`Unknown exception: ${JSON.stringify(exception)}`);
    }

    // Log de la petición que falló (solo en desarrollo)
    if (process.env.NODE_ENV !== 'production') {
      this.logger.debug(`Request failed: ${request.method} ${request.url}`, {
        status,
        message,
        ip: request.ip,
        userAgent: request.headers['user-agent'],
      });
    }

    // Respuesta estandarizada
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      error: HttpStatus[status],
      message,
      ...(process.env.NODE_ENV === 'development' && {
        stack: exception instanceof Error ? exception.stack : undefined,
      }),
    });
  }
}
