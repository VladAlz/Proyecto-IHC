import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';
import { describeDatabase } from './database/db-config';
import { AiService } from './ai/ai.service';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  // Validación global de DTOs con class-validator (firewall de entrada)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new GlobalExceptionFilter());

  const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
  app.enableCors({
    origin: corsOrigin.split(',').map((origin) => origin.trim()),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Usability Test Dashboard — IHC AI 1.0 — API REST')
    .setDescription(
      'Evaluaciones de usabilidad (ISO 9241-11), planes de prueba, hallazgos, dashboard, comparativa antes/después, Asistente IA (Gemini / Groq / OpenRouter / motor local) y módulo SCRUM.',
    )
    .setVersion('1.0.0')
    .build();
  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, config), {
    customSiteTitle: 'Swagger UI — Usability Dashboard API',
  });

  const port = process.env.PORT || 3000;
  try {
    await app.listen(port);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'EADDRINUSE') {
      logger.error(
        `El puerto ${port} ya está en uso (probablemente una instancia anterior del backend). ` +
          'Ejecuta "npm run stop" en la raíz del proyecto y luego "npm run dev".',
      );
      process.exit(1);
    }
    throw err;
  }

  const ai = app.get(AiService).getStatus();
  logger.log(`🟢 API activa en: http://localhost:${port}/api`);
  logger.log(`📚 Swagger UI en: http://localhost:${port}/api/docs`);
  logger.log(`🗄️  Base de datos: ${describeDatabase()}`);
  logger.log(
    `🤖 IA: ${ai.chain.map((c) => `${c.provider}${c.configured ? '' : ' (sin key)'}`).join(' → ')} · activo: ${ai.primary}`,
  );
}

bootstrap();
