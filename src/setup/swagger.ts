import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export const setupSwagger = (app: INestApplication) => {
  const config = new DocumentBuilder()
    .setTitle('Inventory Management API')
    .setDescription('API for Inventory Management')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  // await SwaggerModule.loadPluginMetadata(metadata); // <-- here
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('documentation', app, documentFactory, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });
};
