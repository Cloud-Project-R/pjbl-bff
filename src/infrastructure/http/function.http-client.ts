import { FunctionClient } from '../../application/portas';
import { Notificacao, Ocupacao } from '../../domain/dados-agregados';
import { chamarServico } from './chamar-servico';

/**
 * Cliente HTTP da Azure Function.
 * "urlBase" vem de FUNCTION_URL (ex.: https://func-pjbl-notificacoes.azurewebsites.net/api)
 * e a chave de FUNCTION_KEY. A chave vai no cabeçalho x-functions-key:
 * sem ela a Function responde 401.
 */
export class FunctionHttpClient implements FunctionClient {
  constructor(
    private readonly urlBase: string,
    private readonly chave: string,
  ) {}

  calcularOcupacao(totalSalas: number, reservasConfirmadas: number): Promise<Ocupacao> {
    return chamarServico('function', `${this.urlBase}/calcular-ocupacao`, {
      metodo: 'POST',
      corpo: { totalSalas, reservasConfirmadas },
      cabecalhos: { 'x-functions-key': this.chave },
    });
  }

  listarNotificacoes(): Promise<Notificacao[]> {
    return chamarServico('function', `${this.urlBase}/notificacoes`, {
      cabecalhos: { 'x-functions-key': this.chave },
    });
  }
}
