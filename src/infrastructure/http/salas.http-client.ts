import { DadosDaSala, SalasClient } from '../../application/portas';
import { Sala } from '../../domain/dados-agregados';
import { chamarServico, montarQuery } from './chamar-servico';

/** Cliente HTTP do Microserviço de Salas. "urlBase" vem da variável SALAS_URL. */
export class SalasHttpClient implements SalasClient {
  constructor(private readonly urlBase: string) {}

  listar(universidadeId?: string): Promise<Sala[]> {
    return chamarServico('salas', `${this.urlBase}/salas${montarQuery({ universidadeId })}`);
  }

  buscar(id: string): Promise<Sala> {
    // encodeURIComponent: impede que alguém mande "../" no id para chamar outra rota
    return chamarServico('salas', `${this.urlBase}/salas/${encodeURIComponent(id)}`);
  }

  criar(dados: DadosDaSala): Promise<Sala> {
    return chamarServico('salas', `${this.urlBase}/salas`, { metodo: 'POST', corpo: dados });
  }

  atualizar(id: string, dados: DadosDaSala): Promise<Sala> {
    return chamarServico('salas', `${this.urlBase}/salas/${encodeURIComponent(id)}`, { metodo: 'PUT', corpo: dados });
  }

  desativar(id: string): Promise<void> {
    return chamarServico('salas', `${this.urlBase}/salas/${encodeURIComponent(id)}`, { metodo: 'DELETE' });
  }
}
