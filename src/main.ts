import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 3000;
  const config = new DocumentBuilder()
    .setTitle('DrivenPass - Rest API')
    .setDescription('DrivenPass API description')
    .setVersion('1.0')
    .addTag('drivenpass')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('drivenpass-api', app, document);

  app.useGlobalPipes(new ValidationPipe());
  app.enableCors()
  await app.listen(3000);
}
bootstrap();
