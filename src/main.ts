import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: ['http://localhost', 'http://localhost:80', 'http://frontend', 'http://frontend:80'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
    credentials: true,
    exposedHeaders: ['Authorization'],
  });

  console.log(process.env.DATABASE_URL);

  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  console.log(`Starting server on port ${port}`);
  
  await app.listen(port, '0.0.0.0'); // Listen on all network interfaces
}

bootstrap();
