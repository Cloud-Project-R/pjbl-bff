/**
 * Um serviço chamado pelo BFF respondeu com erro (ex.: 409 do MS Reservas)
 * ou nem respondeu (ex.: fora do ar).
 * O BFF repassa o mesmo status e a mesma mensagem para o front.
 */
export class ErroDoServico extends Error {
  constructor(
    readonly servico: string,
    readonly status: number, // 502 quando o serviço nem respondeu
    readonly corpo: unknown,
  ) {
    super(`${servico} respondeu com status ${status}`);
  }
}
