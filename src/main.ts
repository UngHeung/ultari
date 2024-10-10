import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.setGlobalPrefix('api');
  app.useStaticAssets('public', { prefix: '/public/' });
  app.enableCors({
    origin: [
      'https://ultari.xyz',
      'https://www.ultari.xyz',
      'http://localhost:3000',
      'http://localhost:3001',
    ],
    credentials: true,
  });
  await app.listen(3000);
}
bootstrap();
