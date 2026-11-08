/**
 * Formatos dos dados que o BFF recebe dos serviços e junta em uma resposta só.
 * O BFF não tem banco: ele só conversa com os serviços.
 */

export interface Sala {
  id: string;
  nome: string;
  capacidade: number;
  universidadeId: string;
  ativa: boolean;
}

export interface Reserva {
  id: string;
  salaId: string;
  alunoId: string;
  universidadeId: string;
  inicio: string;
  fim: string;
  estado: 'CONFIRMADA' | 'CANCELADA';
}

export interface Ocupacao {
  reservasPorSala: number;
  nivel: 'BAIXA' | 'MEDIA' | 'ALTA';
}

export interface Notificacao {
  reservaId: string;
  mensagem: string;
  criadaEm?: string;
}

/**
 * Resposta do GET /aggregated-data.
 * Se um serviço falhar, o campo dele vem null e o motivo aparece em "erros",
 * sem derrubar o resto da resposta.
 */
export interface DadosAgregados {
  salas: Sala[] | null;
  reservas: Reserva[] | null;
  ocupacao: Ocupacao | null;
  notificacoes: Notificacao[] | null;
  erros: string[];
}

/** Conta só as reservas que ainda valem (as canceladas não ocupam sala). */
export function contarReservasConfirmadas(reservas: Reserva[]): number {
  return reservas.filter((reserva) => reserva.estado === 'CONFIRMADA').length;
}
