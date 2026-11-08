import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { ErroDoServico } from '../domain/erros';

/**
 * Quando um microserviço responde com erro, o BFF devolve ao front
 * o MESMO status e a MESMA mensagem (ex.: o 409 de conflito do MS Reservas).
 * Se o serviço nem respondeu, devolve 502 Bad Gateway.
 */
@Catch(ErroDoServico)
export class ErroDoServicoFilter implements ExceptionFilter {
  catch(erro: ErroDoServico, host: ArgumentsHost) {
    const resposta = host.switchToHttp().getResponse();
    resposta.status(erro.status).json(erro.corpo ?? { statusCode: erro.status, message: erro.message });
  }
}
