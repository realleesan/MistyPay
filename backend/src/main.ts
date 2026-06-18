import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ limit: '10mb', extended: true }));
  app.setGlobalPrefix('api/v1');

  // Redirect root path to bankhub-link page (retains Cas/BankHub OAuth redirect parameters)
  const server = app.getHttpAdapter().getInstance();
  server.get('/', (req, res) => {
    const query = new URLSearchParams(req.query as any).toString();
    res.redirect(`/api/v1/admin/bankhub-link${query ? '?' + query : ''}`);
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.enableCors();

  const port = process.env.PORT || process.env.APP_PORT || 3000;
  await app.listen(port);
  console.log(`MistyPay Backend starting on port ${port}`);
}
bootstrap();
