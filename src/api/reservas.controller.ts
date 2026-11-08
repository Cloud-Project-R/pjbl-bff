import { Body, Controller, Delete, Get, Inject, Param, Post, Put, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { RESERVAS_CLIENT, ReservasClient } from '../application/portas';
import { AtualizarReservaDto, CriarReservaDto } from './dtos';

/**
 * PROXY das reservas: o front chama o BFF e o BFF repassa ao MS Reservas.
 * A regra de conflito fica no MS Reservas: o 409 dele volta para o front sem mudança.
 */
@ApiTags('Reservas (proxy para o MS Reservas)')
@Controller('reservas')
export class ReservasController {
  constructor(@Inject(RESERVAS_CLIENT) private readonly reservas: ReservasClient) {}

  @Post()
  @ApiOperation({ summary: 'Reserva uma sala (409 se o horário já estiver ocupado)' })
  criar(@Body() dados: CriarReservaDto) {
    return this.reservas.criar(dados);
  }

  @Get()
  @ApiOperation({ summary: 'Lista as reservas' })
  @ApiQuery({ name: 'salaId', required: false })
  @ApiQuery({ name: 'alunoId', required: false, example: 'A-10' })
  listar(@Query('salaId') salaId?: string, @Query('alunoId') alunoId?: string) {
    return this.reservas.listar({ salaId, alunoId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca uma reserva pelo id' })
  buscar(@Param('id') id: string) {
    return this.reservas.buscar(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Muda o horário de uma reserva (confere o conflito de novo)' })
  atualizar(@Param('id') id: string, @Body() horario: AtualizarReservaDto) {
    return this.reservas.atualizar(id, horario);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancela uma reserva (estado = CANCELADA)' })
  cancelar(@Param('id') id: string) {
    return this.reservas.cancelar(id);
  }
}
