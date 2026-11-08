import { FunctionClientFalso, ReservasClientFalso, SalasClientFalso } from '../../../test/fakes/clientes.falsos';
import { BuscarDadosAgregadosUseCase } from './buscar-dados-agregados.use-case';

describe('Buscar dados agregados (GET /aggregated-data)', () => {
  let salas: SalasClientFalso;
  let reservas: ReservasClientFalso;
  let funcao: FunctionClientFalso;
  let buscarDadosAgregados: BuscarDadosAgregadosUseCase;

  beforeEach(() => {
    salas = new SalasClientFalso();
    reservas = new ReservasClientFalso();
    funcao = new FunctionClientFalso();
    buscarDadosAgregados = new BuscarDadosAgregadosUseCase(salas, reservas, funcao);
  });

  it('junta salas, reservas, ocupação e notificações em um único JSON', async () => {
    const dados = await buscarDadosAgregados.executar();

    expect(dados.salas).toHaveLength(1);
    expect(dados.reservas).toHaveLength(2);
    expect(dados.ocupacao).toEqual({ reservasPorSala: 1, nivel: 'MEDIA' });
    expect(dados.notificacoes).toHaveLength(1);
    expect(dados.erros).toEqual([]);
  });

  it('manda para a Function só as reservas CONFIRMADAS', async () => {
    await buscarDadosAgregados.executar();

    expect(funcao.ultimaChamada).toEqual({ totalSalas: 1, reservasConfirmadas: 1 });
  });

  it('se o MS Salas cair, salas vem null e o resto continua', async () => {
    salas.foraDoAr = true;

    const dados = await buscarDadosAgregados.executar();

    expect(dados.salas).toBeNull();
    expect(dados.reservas).toHaveLength(2);
    expect(dados.notificacoes).toHaveLength(1);
    expect(dados.ocupacao).toBeNull(); // sem salas não dá para calcular
    expect(dados.erros).toContain('salas: MS Salas fora do ar');
  });

  it('se a Function cair, ocupação e notificações vêm null e o resto continua', async () => {
    funcao.foraDoAr = true;

    const dados = await buscarDadosAgregados.executar();

    expect(dados.salas).toHaveLength(1);
    expect(dados.reservas).toHaveLength(2);
    expect(dados.ocupacao).toBeNull();
    expect(dados.notificacoes).toBeNull();
    expect(dados.erros).toHaveLength(2);
  });

  it('se tudo cair, responde mesmo assim com a lista de erros', async () => {
    salas.foraDoAr = true;
    reservas.foraDoAr = true;
    funcao.foraDoAr = true;

    const dados = await buscarDadosAgregados.executar();

    expect(dados).toMatchObject({ salas: null, reservas: null, ocupacao: null, notificacoes: null });
    expect(dados.erros.length).toBeGreaterThanOrEqual(3);
  });
});
