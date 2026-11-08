import { Notificacao, Ocupacao, Reserva, Sala } from '../domain/dados-agregados';

/**
 * "Portas" para os serviços que o BFF chama.
 * Dizem O QUE o BFF precisa de cada serviço, sem dizer COMO (HTTP, URL, chave...).
 * Quem implementa são os clientes HTTP da camada infrastructure.
 */

/** Dados de uma sala enviados pelo front (criar/atualizar). */
export interface DadosDaSala {
  nome: string;
  capacidade: number;
  universidadeId: string;
}

/** Dados de uma reserva enviados pelo front. */
export interface DadosDaReserva {
  salaId: string;
  alunoId: string;
  universidadeId: string;
  inicio: string;
  fim: string;
}

/** Porta do Microserviço de Salas (MongoDB). */
export interface SalasClient {
  listar(universidadeId?: string): Promise<Sala[]>;
  buscar(id: string): Promise<Sala>;
  criar(dados: DadosDaSala): Promise<Sala>;
  atualizar(id: string, dados: DadosDaSala): Promise<Sala>;
  desativar(id: string): Promise<void>;
}

/** Porta do Microserviço de Reservas (Azure SQL). */
export interface ReservasClient {
  listar(filtro: { salaId?: string; alunoId?: string }): Promise<Reserva[]>;
  buscar(id: string): Promise<Reserva>;
  criar(dados: DadosDaReserva): Promise<Reserva>;
  atualizar(id: string, horario: { inicio: string; fim: string }): Promise<Reserva>;
  cancelar(id: string): Promise<Reserva>;
}

/** Porta da Azure Function (cálculo de ocupação e notificações). */
export interface FunctionClient {
  calcularOcupacao(totalSalas: number, reservasConfirmadas: number): Promise<Ocupacao>;
  listarNotificacoes(): Promise<Notificacao[]>;
}

/** Nomes usados para "ligar" cada porta à sua implementação (no app.module.ts). */
export const SALAS_CLIENT = 'SalasClient';
export const RESERVAS_CLIENT = 'ReservasClient';
export const FUNCTION_CLIENT = 'FunctionClient';
