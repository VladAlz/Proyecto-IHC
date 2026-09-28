import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Prefijo global de API
  app.setGlobalPrefix('api');

  // Validación global de DTOs con class-validator
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Filtro global de excepciones para respuestas de error consistentes
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Habilitar CORS para integración con Frontend Vite/React
  const corsOrigin = process.env.CORS_ORIGIN || '*';
  app.enableCors({
    origin: corsOrigin.split(',').map((origin) => origin.trim()),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Configuración de Documentación OpenAPI con Swagger
  const config = new DocumentBuilder()
    .setTitle('Usability Test Dashboard 2.0 — API REST')
    .setDescription(
      'Documentación de endpoints backend para registro de pruebas de usabilidad (ISO 9241-11), cálculo de KPIs agregados, matriz de hallazgos heurísticos y Asistente IA con Google Gemini.',
    )
    .setVersion('2.0.0')
    .addTag('Pruebas de Usabilidad', 'Operaciones CRUD para sesiones de pruebas')
    .addTag('Dashboard', 'Métricas agregadas ISO 9241-11 y hallazgos heurísticos')
    .addTag('Asistente IA', 'Análisis inteligente cualitativo asistido por Google Gemini')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Swagger UI — Usability Dashboard API',
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);

  logger.log(`\n======================================================`);
  logger.log(`🟢 Backend NestJS activo en: http://localhost:${port}/api`);
  logger.log(`📚 Documentación Swagger UI en: http://localhost:${port}/api/docs`);
  logger.log(`🐘 Conexión PostgreSQL: ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}/${process.env.DB_DATABASE || 'usability_db'}`);
  logger.log(`======================================================\n`);
}

bootstrap();
