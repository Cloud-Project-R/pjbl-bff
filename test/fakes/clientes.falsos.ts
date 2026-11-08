import { DadosDaReserva, DadosDaSala, FunctionClient, ReservasClient, SalasClient } from '../../src/application/portas';
import { Notificacao, Ocupacao, Reserva, Sala } from '../../src/domain/dados-agregados';

/**
 * Clientes FALSOS, usados só nos testes: respondem na hora, sem chamar nenhum serviço.
 * "foraDoAr = true" simula o serviço caído.
 */

export class SalasClientFalso implements SalasClient {
  foraDoAr = false;
  salas: Sala[] = [{ id: 's1', nome: 'Sala 101', capacidade: 30, universidadeId: 'UNI-001', ativa: true }];

  async listar(): Promise<Sala[]> {
    if (this.foraDoAr) throw new Error('MS Salas fora do ar');
    return this.salas;
  }
  async buscar(): Promise<Sala> {
    return this.salas[0];
  }
  async criar(dados: DadosDaSala): Promise<Sala> {
    return { id: 'nova', ativa: true, ...dados };
  }
  async atualizar(id: string, dados: DadosDaSala): Promise<Sala> {
    return { id, ativa: true, ...dados };
  }
  async desativar(): Promise<void> {}
}

export class ReservasClientFalso implements ReservasClient {
  foraDoAr = false;
  reservas: Reserva[] = [
    { id: 'r1', salaId: 's1', alunoId: 'A-10', universidadeId: 'UNI-001', inicio: '2026-11-10T13:00:00Z', fim: '2026-11-10T14:00:00Z', estado: 'CONFIRMADA' },
    { id: 'r2', salaId: 's1', alunoId: 'A-20', universidadeId: 'UNI-001', inicio: '2026-11-10T15:00:00Z', fim: '2026-11-10T16:00:00Z', estado: 'CANCELADA' },
  ];

  async listar(): Promise<Reserva[]> {
    if (this.foraDoAr) throw new Error('MS Reservas fora do ar');
    return this.reservas;
  }
  async buscar(): Promise<Reserva> {
    return this.reservas[0];
  }
  async criar(dados: DadosDaReserva): Promise<Reserva> {
    return { id: 'nova', estado: 'CONFIRMADA', ...dados };
  }
  async atualizar(): Promise<Reserva> {
    return this.reservas[0];
  }
  async cancelar(): Promise<Reserva> {
    return { ...this.reservas[0], estado: 'CANCELADA' };
  }
}

export class FunctionClientFalso implements FunctionClient {
  foraDoAr = false;
  /** Guarda os números recebidos, para o teste conferir. */
  ultimaChamada: { totalSalas: number; reservasConfirmadas: number } | null = null;

  async calcularOcupacao(totalSalas: number, reservasConfirmadas: number): Promise<Ocupacao> {
    if (this.foraDoAr) throw new Error('Function fora do ar');
    this.ultimaChamada = { totalSalas, reservasConfirmadas };
    return { reservasPorSala: 1, nivel: 'MEDIA' };
  }
  async listarNotificacoes(): Promise<Notificacao[]> {
    if (this.foraDoAr) throw new Error('Function fora do ar');
    return [{ reservaId: 'r1', mensagem: 'E-mail simulado enviado ao aluno A-10' }];
  }
}
