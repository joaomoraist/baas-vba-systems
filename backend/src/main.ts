import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('BaaS API - Gateway de Pagamentos')
    .setDescription('Documentação da API de integração com a BranchPay / Lera Box')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document); // Define a rota '/docs'

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();