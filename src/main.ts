import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  // enable helmet
  app.use(helmet());
  // -- Cors setup
  app.enableCors({
    origin: false,
  });

  await app.listen(3000);
}
bootstrap();
