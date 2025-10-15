import {
  HttpStatus,
  INestApplication,
  UnprocessableEntityException,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { useContainer } from 'class-validator';
import compression from 'compression';
import { config } from 'dotenv';
import { middleware as expressCtx } from 'express-ctx';
import helmet from 'helmet';
import morgan from 'morgan';

import { AppModule } from './app.module';
import { formatValidationErrors } from './error';
import { setupSwagger } from './setup/swagger';

config();

function registerGlobalMiddleware(app: INestApplication) {
  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps)
      if (!origin) {
        return callback(null, true);
      }

      const allowedOrigins = [
        process.env.FRONTEND_URL,
        process.env.ADMIN_URL,
        // Add your ngrok domain pattern if it's consistent
        /\.ngrok-free\.app$/,
        // for lovable
        /lovable\.app$/,
        // for bolt
        /local-credentialless\.webcontainer-api\.io/,
        // add localhost patterns for development
        /^http:\/\/localhost(:\d+)?$/,
        // add 127.0.0.1 patterns for development
        /^http:\/\/127\.0\.0\.1(:\d+)?$/,
      ];

      // Check if origin matches any allowed pattern
      const allowed = allowedOrigins.some((allowedOrigin) => {
        if (allowedOrigin instanceof RegExp) {
          return allowedOrigin.test(origin);
        }
        return allowedOrigin === origin;
      });

      callback(null, allowed);
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'x-csrf-token',
      'x-session-id',
    ],
    exposedHeaders: ['set-cookie', 'x-csrf-token', 'x-session-id'],
  });
  app.use(helmet());
  app.use(compression());
  app.use(morgan('combined'));
  app.use(expressCtx);
  app.enableVersioning({
    type: VersioningType.URI,
    prefix: 'v',
  });

  // app.use(Sentry.Handlers.requestHandler());
  // app.use(Sentry.Handlers.tracingHandler());
}
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  registerGlobalMiddleware(app);

  // setup documentation
  setupSwagger(app);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      transform: true,
      dismissDefaultMessages: false,
      enableDebugMessages: true,
      disableErrorMessages: false,
      exceptionFactory: (errors) =>
        // const errorList = Object.values(errors[0]?.constraints || {});
        // const error =
        //   errorList.length > 0 ? errorList[0] : '';

        new UnprocessableEntityException(
          formatValidationErrors(errors),
          'Unable to validate request',
        ),
      stopAtFirstError: true,
      forbidUnknownValues: true,
      validationError: {
        target: false,
        value: false,
      },
      forbidNonWhitelisted: true,
    }),
  );

  // Enabling service container for custom validator constraint classes (class-validator)
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
