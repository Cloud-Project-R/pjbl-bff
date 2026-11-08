import { contarReservasConfirmadas, DadosAgregados } from '../../domain/dados-agregados';
import { FunctionClient, ReservasClient, SalasClient } from '../portas';

/** Transforma qualquer falha em uma frase curta para a lista "erros". */
function descreverFalha(servico: string, motivo: unknown): string {
  return `${servico}: ${motivo instanceof Error ? motivo.message : String(motivo)}`;
}

/**
 * Caso de uso: GET /aggregated-data
 * Junta, em uma resposta só, dados do MS Salas, do MS Reservas e da Azure Function.
 * Se um serviço falhar, o campo dele vem null e o resto continua funcionando.
 */
export class BuscarDadosAgregadosUseCase {
  constructor(
    private readonly salasClient: SalasClient,
    private readonly reservasClient: ReservasClient,
    private readonly functionClient: FunctionClient,
  ) {}

  async executar(universidadeId?: string): Promise<DadosAgregados> {
    const resposta: DadosAgregados = { salas: null, reservas: null, ocupacao: null, notificacoes: null, erros: [] };

    // 1. Chama os 3 serviços AO MESMO TEMPO (mais rápido que um depois do outro).
    //    "allSettled" espera todos, mesmo que algum falhe.
    const [salas, reservas, notificacoes] = await Promise.allSettled([
      this.salasClient.listar(universidadeId),
      this.reservasClient.listar({}),
      this.functionClient.listarNotificacoes(),
    ]);

    if (salas.status === 'fulfilled') resposta.salas = salas.value;
    else resposta.erros.push(descreverFalha('salas', salas.reason));

    if (reservas.status === 'fulfilled') resposta.reservas = reservas.value;
    else resposta.erros.push(descreverFalha('reservas', reservas.reason));

    if (notificacoes.status === 'fulfilled') resposta.notificacoes = notificacoes.value;
    else resposta.erros.push(descreverFalha('notificacoes', notificacoes.reason));

    // 2. A ocupação depende das salas e das reservas, então vem depois.
    if (resposta.salas && resposta.reservas) {
      try {
        resposta.ocupacao = await this.functionClient.calcularOcupacao(
          resposta.salas.length,
          contarReservasConfirmadas(resposta.reservas),
        );
      } catch (erro) {
        resposta.erros.push(descreverFalha('ocupacao', erro));
      }
    } else {
      resposta.erros.push('ocupacao: não calculada porque salas ou reservas não responderam');
    }

    return resposta;
  }
}
