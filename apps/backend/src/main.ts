import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import * as bodyParser from 'body-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from 'src/common/filters/rpc-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // 🔹 Глобальный префикс
  app.setGlobalPrefix('api');
  
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Родная Ярмарка')
    .setDescription('Документация REST API')
    .setVersion('1.0.0')
    .build();

  // CORS настройки
  const clientUrl = JSON.parse(configService.get('CLIENT_URL') || '[]');
  const mode = configService.get('NODE_ENV') || 'prod';
  console.log(mode, 'mode');
  console.log(clientUrl, 'clientUrl');

  const isDev = mode === 'dev';

  // В dev разрешаем localhost и LAN, в проде - CLIENT_URL и Vercel домены
  const corsOrigins = isDev
    ? [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        /^http:\/\/192\.168\.\d+\.\d+:5173$/,
        /^http:\/\/10\.\d+\.\d+\.\d+:5173$/,
        /^http:\/\/172\.(1[6-9]|2[0-9]|3[0-1])\.\d+\.\d+:5173$/,
      ]
    : clientUrl;

  app.enableCors({
    credentials: true,
    origin: corsOrigins,
    allowedHeaders: ['Content-Type', 'Authorization', 'x-refresh-token'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  app.useGlobalFilters(new HttpExceptionFilter());
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

  const document = SwaggerModule.createDocument(app, swaggerConfig);

  // Swagger UI
  SwaggerModule.setup('/api/docs', app, document);

  // JSON OpenAPI для генерации типов
  app.getHttpAdapter().get('/api/docs/api-json', (_req, res: any) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    res.json(document);
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const port = configService.get('PORT') || 5000;
  
  // В dev-режиме слушаем все интерфейсы, в проде - только localhost
  const host = isDev ? '0.0.0.0' : 'localhost';

  await app.listen(port, host, () =>
    console.log(`Server started on ${host}:${port}`),
  );
}
void bootstrap();
