import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { BuscarDadosAgregadosUseCase } from '../application/buscar-dados-agregados/buscar-dados-agregados.use-case';

/** Endpoint obrigatório do enunciado: junta tudo em um único JSON. */
@ApiTags('Dados agregados')
@Controller('aggregated-data')
export class DadosAgregadosController {
  constructor(private readonly buscarDadosAgregados: BuscarDadosAgregadosUseCase) {}

  @Get()
  @ApiOperation({
    summary: 'Junta MS Salas + MS Reservas + Azure Function em uma resposta',
    description:
      'Chama os 3 serviços ao mesmo tempo. Se um falhar, o campo dele vem null e o motivo aparece em "erros", sem derrubar o resto.',
  })
  @ApiQuery({ name: 'universidadeId', required: false, example: 'UNI-001' })
  @ApiOkResponse({
    schema: {
      example: {
        salas: [{ id: 's1', nome: 'Sala 101', capacidade: 30, universidadeId: 'UNI-001', ativa: true }],
        reservas: [
          {
            id: 'r1',
            salaId: 's1',
            alunoId: 'A-10',
            universidadeId: 'UNI-001',
            inicio: '2026-11-10T13:00:00.000Z',
            fim: '2026-11-10T14:00:00.000Z',
            estado: 'CONFIRMADA',
          },
        ],
        ocupacao: { reservasPorSala: 1, nivel: 'MEDIA' },
        notificacoes: [{ reservaId: 'r1', mensagem: 'E-mail simulado enviado ao aluno A-10' }],
        erros: [],
      },
    },
  })
  buscar(@Query('universidadeId') universidadeId?: string) {
    return this.buscarDadosAgregados.executar(universidadeId);
  }
}
