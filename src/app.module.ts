import { Module } from '@nestjs/common';
import { DadosAgregadosController } from './api/dados-agregados.controller';
import { HealthController } from './api/health.controller';
import { ReservasController } from './api/reservas.controller';
import { SalasController } from './api/salas.controller';
import { BuscarDadosAgregadosUseCase } from './application/buscar-dados-agregados/buscar-dados-agregados.use-case';
import {
  FUNCTION_CLIENT,
  FunctionClient,
  RESERVAS_CLIENT,
  ReservasClient,
  SALAS_CLIENT,
  SalasClient,
} from './application/portas';
import { FunctionHttpClient } from './infrastructure/http/function.http-client';
import { ReservasHttpClient } from './infrastructure/http/reservas.http-client';
import { SalasHttpClient } from './infrastructure/http/salas.http-client';

/**
 * Liga todas as peças. É o ÚNICO arquivo que conhece todas as camadas.
 * Aqui dizemos qual cliente HTTP implementa cada porta e com qual URL.
 */
@Module({
  controllers: [DadosAgregadosController, SalasController, ReservasController, HealthController],
  providers: [
    { provide: SALAS_CLIENT, useFactory: () => new SalasHttpClient(process.env.SALAS_URL!) },
    { provide: RESERVAS_CLIENT, useFactory: () => new ReservasHttpClient(process.env.RESERVAS_URL!) },
    {
      provide: FUNCTION_CLIENT,
      useFactory: () => new FunctionHttpClient(process.env.FUNCTION_URL!, process.env.FUNCTION_KEY!),
    },
    {
      provide: BuscarDadosAgregadosUseCase,
      useFactory: (salas: SalasClient, reservas: ReservasClient, funcao: FunctionClient) =>
        new BuscarDadosAgregadosUseCase(salas, reservas, funcao),
      inject: [SALAS_CLIENT, RESERVAS_CLIENT, FUNCTION_CLIENT],
    },
  ],
})
export class AppModule {}
