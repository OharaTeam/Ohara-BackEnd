import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Ohara API')
    .setDescription('API REST do ecossistema Ohara: núcleo de integração entre o Discord Bot, Frontend/Dashboard e banco de dados PostgreSQL.')
    .setVersion('1.0.0')
    .addApiKey({ type: 'apiKey', name: 'X-SITE-KEY', in: 'header', description: 'Chave de segurança de comunicação com o site/dashboard' }, 'SITE_KEY')
    .addApiKey({ type: 'apiKey', name: 'X-API-KEY', in: 'header', description: 'Chave de segurança de comunicação com o Discord Bot' }, 'BOT_KEY')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT', description: 'Token de autenticação JWT obtido via /auth/exchange' })
    .addTag('auth', 'Autenticação OAuth2 com Discord, troca de tokens e logout')
    .addTag('membros', 'Sincronização do bot, busca e listagem paginada de membros')
    .addTag('cargos', 'Sincronização de cargos e hierarquia de permissões do Discord')
    .addTag('users', 'Perfis de usuários, vitrine Steam e dados públicos')
    .addTag('postagens', 'Criação de postagens, feed comunitário e upload de imagens')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api-docs', app, document, {
    customCssUrl: '/swagger/swagger-ui.css',
    customJs: [
      '/swagger/swagger-ui-bundle.js',
      '/swagger/swagger-ui-standalone-preset.js',
    ],
    customfavIcon: '/swagger-ui/favicon-32x32.png',
  });

  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
  }));
  app.use(cookieParser());

  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  app.enableCors({
    origin: ['http://localhost:3001', 'http://localhost:3000', 'https://ohara-back-end.vercel.app', 'https://ohara-site.vercel.app'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();