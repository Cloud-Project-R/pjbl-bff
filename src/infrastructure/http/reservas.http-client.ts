import { DadosDaReserva, ReservasClient } from '../../application/portas';
import { Reserva } from '../../domain/dados-agregados';
import { chamarServico, montarQuery } from './chamar-servico';

/** Cliente HTTP do Microserviço de Reservas. "urlBase" vem da variável RESERVAS_URL. */
export class ReservasHttpClient implements ReservasClient {
  constructor(private readonly urlBase: string) {}

  listar(filtro: { salaId?: string; alunoId?: string }): Promise<Reserva[]> {
    return chamarServico('reservas', `${this.urlBase}/reservas${montarQuery(filtro)}`);
  }

  buscar(id: string): Promise<Reserva> {
    return chamarServico('reservas', `${this.urlBase}/reservas/${encodeURIComponent(id)}`);
  }

  criar(dados: DadosDaReserva): Promise<Reserva> {
    return chamarServico('reservas', `${this.urlBase}/reservas`, { metodo: 'POST', corpo: dados });
  }

  atualizar(id: string, horario: { inicio: string; fim: string }): Promise<Reserva> {
    return chamarServico('reservas', `${this.urlBase}/reservas/${encodeURIComponent(id)}`, {
      metodo: 'PUT',
      corpo: horario,
    });
  }

  cancelar(id: string): Promise<Reserva> {
    return chamarServico('reservas', `${this.urlBase}/reservas/${encodeURIComponent(id)}`, { metodo: 'DELETE' });
  }
}
