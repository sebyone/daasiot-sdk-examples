import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as session from 'express-session';
import * as passport from 'passport';
import { TypeormStore } from 'connect-typeorm';
import { AppModule } from './app.module';
import { WsAdapter } from '@nestjs/platform-ws';
import { Session } from './auth/session.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DocumentBuilder, SwaggerDocumentOptions, SwaggerModule } from '@nestjs/swagger';
const fs = require('fs');

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { cors: true });

  app.useWebSocketAdapter(new WsAdapter(app));

  app.useGlobalPipes(new ValidationPipe());
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');
  app.set('view options', { layout: 'layout' });

  app.use(
    session({
      secret: process.env.APP_SECRET || 'the_real_session_secret',
      resave: false,
      saveUninitialized: false,
      store: new TypeormStore({
        cleanupLimit: 2,
        limitSubquery: false, // If using MariaDB.
        ttl: 86400,
      }).connect(app.get(getRepositoryToken(Session))),
    })
  );
  app.use(passport.initialize());
  app.use(passport.session());


    const config = new DocumentBuilder().setTitle('Daas Application')
                      .setDescription("API Documentation")
                      .setVersion('v1')
                      .build();

  const document = SwaggerModule.createDocument(app, config);

  fs.writeFileSync("./swagger-spec.json", JSON.stringify(document));
  SwaggerModule.setup('api-docs/', app, document);

  await app.listen(process.env.WEB_SERVER_PORT || 3000);
}
bootstrap();
