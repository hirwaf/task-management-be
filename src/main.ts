import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import configuration from './config/configuration';
import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  // enable helmet
  app.use(helmet());
  // -- Cors setup
  app.enableCors({
    origin: false,
  });

  app.useGlobalPipes(new ValidationPipe());

  await app.listen(configuration().port);
}
bootstrap();
