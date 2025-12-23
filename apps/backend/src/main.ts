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
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Родная Ярмарка')
    .setDescription('Документация REST API')
    .setVersion('1.0.0')
    .build();

  app.enableCors({
    credentials: true,
    origin: [
      'capacitor://localhost',
      'http://localhost',
      configService.get('CLIENT_URL'),
    ],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-refresh-token'],
    methods: 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
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

  await app.listen(configService.get('PORT') || 5000, () =>
    console.log(`Server started on port = ${configService.get('PORT')}`),
  );
}
void bootstrap();
