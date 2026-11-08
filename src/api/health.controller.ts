import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

/** Rota simples para saber se o BFF está no ar (e "acordá-lo" antes da demo). */
@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOkResponse({ schema: { example: { status: 'ok', servico: 'bff' } } })
  verificar() {
    return { status: 'ok', servico: 'bff' };
  }
}
