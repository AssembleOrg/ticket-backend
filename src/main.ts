import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';
import { ResponseInterceptor } from './common/interceptors/response.interceptor.js';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter.js';
import cookieParser from 'cookie-parser';
import basicAuth from 'express-basic-auth';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  app.use(cookieParser());
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3001',
    credentials: true,
  });
  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new GlobalExceptionFilter());

  const swaggerPassword = process.env.SWAGGER_PASSWORD;

  if (swaggerPassword) {
    app.use(
      '/api/docs',
      basicAuth({
        challenge: true,
        users: { admin: swaggerPassword },
      }),
    );
  }

  const config = new DocumentBuilder()
    .setTitle('Ticket Backend')
    .setDescription('Sistema de tickets de soporte vía WhatsApp')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  logger.log(`Server running on http://localhost:${port}`);
  if (swaggerPassword) {
    logger.log(`Swagger docs on http://localhost:${port}/api/docs (protected)`);
  } else {
    logger.log(`Swagger docs on http://localhost:${port}/api/docs`);
  }
}
bootstrap();
