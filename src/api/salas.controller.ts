import { Body, Controller, Delete, Get, HttpCode, Inject, Param, Post, Put, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { SALAS_CLIENT, SalasClient } from '../application/portas';
import { SalaDto } from './dtos';

/**
 * PROXY das salas: o front chama o BFF e o BFF repassa ao MS Salas.
 * Assim o front não conhece o endereço dos microserviços.
 * Erros do MS Salas (400, 404) voltam para o front com o mesmo status.
 */
@ApiTags('Salas (proxy para o MS Salas)')
@Controller('salas')
export class SalasController {
  constructor(@Inject(SALAS_CLIENT) private readonly salas: SalasClient) {}

  @Post()
  @ApiOperation({ summary: 'Cria uma sala' })
  criar(@Body() dados: SalaDto) {
    return this.salas.criar(dados);
  }

  @Get()
  @ApiOperation({ summary: 'Lista as salas ativas' })
  @ApiQuery({ name: 'universidadeId', required: false, example: 'UNI-001' })
  listar(@Query('universidadeId') universidadeId?: string) {
    return this.salas.listar(universidadeId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca uma sala pelo id' })
  buscar(@Param('id') id: string) {
    return this.salas.buscar(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualiza uma sala' })
  atualizar(@Param('id') id: string, @Body() dados: SalaDto) {
    return this.salas.atualizar(id, dados);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Desativa uma sala (ativa = false)' })
  async desativar(@Param('id') id: string) {
    await this.salas.desativar(id);
  }
}
