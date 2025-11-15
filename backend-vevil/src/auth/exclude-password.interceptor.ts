import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

function removePassword(data: any) {
  if (data && data.password) {
    delete data.password;
  }
  return data;
}

@Injectable()
export class ExcludePasswordInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(data => Array.isArray(data) ? data.map(removePassword) : removePassword(data))
    );
  }
}