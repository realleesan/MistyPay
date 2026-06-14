import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest<Request>();
    const method = req.method;
    const url = req.url;
    const ip = req.ip || req.socket.remoteAddress;
    const now = Date.now();

    const sanitizedBody = this.sanitizePayload(req.body);

    return next.handle().pipe(
      tap(() => {
        const delay = Date.now() - now;
        this.logger.log(
          `[${method}] ${url} - IP: ${ip} - Latency: ${delay}ms - Payload: ${JSON.stringify(sanitizedBody)}`,
        );
      }),
    );
  }

  private sanitizePayload(body: any): any {
    if (!body) return body;
    const sanitized = { ...body };
    const sensitiveKeys = ['password', 'passwordConfirm', 'pin', 'newPin', 'oldPin', 'token'];
    
    for (const key of sensitiveKeys) {
      if (key in sanitized) {
        sanitized[key] = '********';
      }
    }
    return sanitized;
  }
}
