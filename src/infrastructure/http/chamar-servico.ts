import { ErroDoServico } from '../../domain/erros';

/** Tempo máximo esperando um serviço (serviços "dormindo" na nuvem demoram para acordar). */
const TEMPO_LIMITE_MS = 30000;

interface Opcoes {
  metodo?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  corpo?: unknown;
  cabecalhos?: Record<string, string>;
}

/**
 * Faz uma chamada HTTP para um serviço e devolve o JSON da resposta.
 * - Se o serviço responder com erro (400, 404, 409...), lança ErroDoServico com o mesmo status.
 * - Se o serviço nem responder (fora do ar, tempo esgotado), lança ErroDoServico com 502.
 */
export async function chamarServico<T>(servico: string, url: string, opcoes: Opcoes = {}): Promise<T> {
  let resposta: Response;
  try {
    resposta = await fetch(url, {
      method: opcoes.metodo ?? 'GET',
      headers: { 'Content-Type': 'application/json', ...opcoes.cabecalhos },
      body: opcoes.corpo === undefined ? undefined : JSON.stringify(opcoes.corpo),
      signal: AbortSignal.timeout(TEMPO_LIMITE_MS),
    });
  } catch {
    throw new ErroDoServico(servico, 502, { statusCode: 502, message: `${servico} não respondeu` });
  }

  // 204 No Content: deu certo, mas não tem corpo
  if (resposta.status === 204) {
    return undefined as T;
  }

  const texto = await resposta.text();
  const corpo = texto ? JSON.parse(texto) : undefined;

  if (!resposta.ok) {
    throw new ErroDoServico(servico, resposta.status, corpo);
  }
  return corpo as T;
}

/** Monta "?chave=valor&..." ignorando os valores vazios. */
export function montarQuery(parametros: Record<string, string | undefined>): string {
  const query = new URLSearchParams();
  for (const [chave, valor] of Object.entries(parametros)) {
    if (valor) query.set(chave, valor);
  }
  const texto = query.toString();
  return texto ? `?${texto}` : '';
}
