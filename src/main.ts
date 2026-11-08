import 'reflect-metadata';
import { existsSync } from 'fs';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ErroDoServicoFilter } from './api/erro-do-servico.filter';
import { AppModule } from './app.module';

/** Variáveis obrigatórias: sem elas o BFF nem sobe (veja o .env.example). */
const VARIAVEIS_OBRIGATORIAS = ['SALAS_URL', 'RESERVAS_URL', 'FUNCTION_URL', 'FUNCTION_KEY'];

/** Sobe o servidor HTTP e o Swagger em /docs. */
async function iniciar() {
  // Em ambiente local lê o arquivo .env. Na nuvem as variáveis já vêm do Azure.
  if (existsSync('.env')) {
    process.loadEnvFile('.env');
  }

  const faltando = VARIAVEIS_OBRIGATORIAS.filter((nome) => !process.env[nome]);
  if (faltando.length > 0) {
    throw new Error(`Faltam variáveis de ambiente: ${faltando.join(', ')} (veja o .env.example).`);
  }

  const app = await NestFactory.create(AppModule);

  // Segurança: recusa campos desconhecidos e dados em formato errado
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
  app.useGlobalFilters(new ErroDoServicoFilter());

  // CORS só para uso local: na nuvem quem cuida disso é o API Gateway
  // (se os dois responderem, o navegador recebe o cabeçalho duplicado e bloqueia)
  if (process.env.ENABLE_CORS === 'true') {
    app.enableCors();
  }

  const configSwagger = new DocumentBuilder()
    .setTitle('BFF - Plataforma de Reservas')
    .setDescription(
      'Backend for Frontend: única porta de entrada do front. ' +
        'Repassa o CRUD aos microserviços (proxy) e junta tudo em GET /aggregated-data.',
    )
    .setVersion('1.0')
    .build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, configSwagger));

  const porta = Number(process.env.PORT ?? 3000);
  await app.listen(porta);
  console.log(`BFF rodando na porta ${porta}. Swagger em /docs`);
}

iniciar();
