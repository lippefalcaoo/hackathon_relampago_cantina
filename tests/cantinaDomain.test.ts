/**
 * Testes do domínio e da persistência. Rodar com: npm test
 * (usa o test runner nativo do Node + tsx, sem dependências extras).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  Carrinho,
  CalculadoraGargaloFila,
  ErroConflito,
  ErroRegraNegocio,
  ErroValidacao,
  GerenciadorPedidos,
  ItemCarrinho,
  LIMITES,
  PagamentoOnlineApp,
  PagamentoPresencialLoja,
  Pedido,
  PreparoNaHoraCozinha,
  PreparoRapidoEstufa,
  Produto,
  criarCardapioInicial,
  criarCardapioRealCantina,
  CATEGORIAS_CARDAPIO_REAL,
  criarDadosIniciaisCantina,
  descreverErro,
  lerNumero,
  validarDadosAluno,
  validarEntradaProduto,
} from '../src/domain/cantinaDomain';
import { interpretarEstadoSalvo, serializarEstado } from '../src/infra/persistenciaCantina';

const aluno = { nome: 'Ana Souza', matricula: '2026.1.010' };
const calc = new CalculadoraGargaloFila();
const app = new PagamentoOnlineApp();
const loja = new PagamentoPresencialLoja();

function cardapio() {
  const lista = criarCardapioInicial();
  return { coxinha: lista[0], tapioca: lista[4], burger: lista[5], suco: lista[7], lista };
}

test('lerNumero aceita vírgula e rejeita lixo, NaN e Infinity', () => {
  assert.equal(lerNumero('10,50'), 10.5);
  assert.equal(lerNumero('10.50'), 10.5);
  assert.equal(lerNumero('1.234,56'), 1234.56);
  assert.equal(lerNumero('12abc'), null);
  assert.equal(lerNumero(''), null);
  assert.equal(lerNumero(NaN), null);
  assert.equal(lerNumero(Infinity), null);
});

test('Produto rejeita preço Infinity, negativo e com mais de 2 casas', () => {
  const base = { nome: 'Teste', categoria: 'Doces' as const, naturezaPreparo: new PreparoRapidoEstufa(1) };
  assert.throws(() => new Produto({ ...base, preco: Infinity }), ErroValidacao);
  assert.throws(() => new Produto({ ...base, preco: -1 }), ErroValidacao);
  assert.throws(() => new Produto({ ...base, preco: 1.555 }), ErroValidacao);
  assert.throws(() => new Produto({ ...base, preco: 5, categoria: 'Pizza' as never }), ErroValidacao);
  assert.equal(new Produto({ ...base, preco: 5 }).obterDescricao(), '');
});

test('Natureza de preparo rejeita NaN e tempo fora da faixa (antes virava NaN/era corrigido em silêncio)', () => {
  assert.throws(() => new PreparoRapidoEstufa(NaN), ErroValidacao);
  assert.throws(() => new PreparoNaHoraCozinha(1), ErroValidacao);
  assert.throws(() => new PreparoNaHoraCozinha(6, -3), ErroValidacao);
});

test('validarEntradaProduto devolve TODOS os erros de uma vez', () => {
  const r = validarEntradaProduto({ nome: 'a', preco: 'abc', categoria: 'Doces', natureza: 'COZINHA_NA_HORA', tempoBase: '1' });
  assert.equal(r.ok, false);
  if (!r.ok) assert.deepEqual(Object.keys(r.erros).sort(), ['nome', 'preco', 'tempoBase']);
});

test('ItemCarrinho e Carrinho não aceitam quantidade NaN (antes a quantidade virava NaN)', () => {
  const { coxinha } = cardapio();
  assert.throws(() => new ItemCarrinho(coxinha, NaN), ErroValidacao);
  const carrinho = new Carrinho();
  carrinho.adicionarProduto(coxinha);
  assert.throws(() => carrinho.alterarQuantidade(coxinha.obterId(), NaN), ErroValidacao);
  assert.equal(carrinho.obterQuantidadeTotalItens(), 1);
  assert.throws(() => carrinho.alterarQuantidade('nao-existe', 2));
});

test('Carrinho respeita limite por item e por pedido', () => {
  const { coxinha, suco } = cardapio();
  const carrinho = new Carrinho();
  carrinho.adicionarProduto(coxinha, LIMITES.quantidadePorItem);
  assert.throws(() => carrinho.adicionarProduto(coxinha), ErroRegraNegocio);
  carrinho.adicionarProduto(suco, LIMITES.quantidadePorItem);
  const lista = criarCardapioInicial();
  assert.throws(() => carrinho.adicionarProduto(lista[1]), ErroRegraNegocio);
});

test('Produto esgotado não entra no carrinho e trava o checkout de quem já tinha', () => {
  const { coxinha, suco } = cardapio();
  const carrinho = new Carrinho();
  carrinho.adicionarProduto(coxinha);
  carrinho.adicionarProduto(suco);
  coxinha.definirDisponibilidade(false);
  assert.throws(() => carrinho.adicionarProduto(coxinha), ErroRegraNegocio);
  const ger = new GerenciadorPedidos();
  assert.throws(() => ger.finalizarPedido(aluno, carrinho, app, calc), /Esgotou/);
  assert.equal(carrinho.obterQuantidadeTotalItens(), 2, 'carrinho continua intacto após falha');
});

test('Editar o cardápio NÃO altera pedidos já feitos (bug de referência compartilhada)', () => {
  const { tapioca } = cardapio();
  const carrinho = new Carrinho();
  carrinho.adicionarProduto(tapioca);
  const ger = new GerenciadorPedidos();
  const pedido = ger.finalizarPedido(aluno, carrinho, app, calc);
  tapioca.atualizarDados({
    nome: 'Tapioca Nova',
    preco: 99,
    categoria: 'Doces',
    naturezaPreparo: new PreparoRapidoEstufa(1),
  });
  const item = pedido.obterItens()[0];
  assert.equal(item.obterNomeProduto(), 'Tapioca Recife (Carne de Sol & Coalho)');
  assert.equal(item.obterPrecoUnitario(), 19.5);
  assert.equal(pedido.contemItensCozinha(), true);
});

test('Duplo clique no KDS não pula etapas (status esperado)', () => {
  const { tapioca } = cardapio();
  const carrinho = new Carrinho();
  carrinho.adicionarProduto(tapioca);
  const ger = new GerenciadorPedidos();
  const pedido = ger.finalizarPedido(aluno, carrinho, app, calc);
  ger.avancarStatusPedido(pedido.obterId(), 'Op', 'Recebido');
  assert.throws(() => ger.avancarStatusPedido(pedido.obterId(), 'Op', 'Recebido'), ErroConflito);
  assert.equal(pedido.obterStatus(), 'Fazendo');
});

test('Pedido "Pagar no caixa" só é entregue depois do pagamento registrado', () => {
  const { coxinha } = cardapio();
  const carrinho = new Carrinho();
  carrinho.adicionarProduto(coxinha);
  const ger = new GerenciadorPedidos();
  const p = ger.finalizarPedido(aluno, carrinho, loja, calc);
  ger.avancarStatusPedido(p.obterId(), 'Op', 'Recebido');
  ger.avancarStatusPedido(p.obterId(), 'Op', 'Fazendo');
  assert.throws(() => ger.avancarStatusPedido(p.obterId(), 'Op', 'Pronto para Retirada'), /Registre o pagamento/);
  ger.confirmarPagamentoPedido(p.obterId(), 'Op');
  assert.throws(() => ger.confirmarPagamentoPedido(p.obterId(), 'Op'), ErroRegraNegocio);
  ger.avancarStatusPedido(p.obterId(), 'Op', 'Pronto para Retirada');
  assert.equal(p.obterStatus(), 'Entregue');
  assert.throws(() => p.avancarStatus('Op'), ErroRegraNegocio);
});

test('Cancelamento tira o pedido da carga da chapa e bloqueia avanço', () => {
  const { burger } = cardapio();
  const carrinho = new Carrinho();
  carrinho.adicionarProduto(burger);
  const ger = new GerenciadorPedidos();
  const p = ger.finalizarPedido(aluno, carrinho, app, calc);
  assert.ok(calc.calcularMinutosGargaloCozinha(ger.obterTodosPedidos()) > 0);
  ger.cancelarPedido(p.obterId(), 'Op', 'Recebido');
  assert.equal(calc.calcularMinutosGargaloCozinha(ger.obterTodosPedidos()), 0);
  assert.throws(() => p.avancarStatus('Op'), ErroRegraNegocio);
});

test('finalizarPedido é atômico: falha não consome número de ticket nem limpa carrinho', () => {
  const { coxinha } = cardapio();
  const carrinho = new Carrinho();
  carrinho.adicionarProduto(coxinha);
  const ger = new GerenciadorPedidos([], 200);
  assert.throws(() => ger.finalizarPedido({ nome: '', matricula: 'x' }, carrinho, app, calc), ErroValidacao);
  assert.equal(ger.obterSequencialTicket(), 200);
  assert.equal(carrinho.estaVazio(), false);
  const ok = ger.finalizarPedido(aluno, carrinho, app, calc);
  assert.equal(ok.obterCodigoTicket(), 'FP-201');
  assert.equal(carrinho.estaVazio(), true);
});

test('Limite de pedidos em aberto por matrícula', () => {
  const { coxinha } = cardapio();
  const ger = new GerenciadorPedidos();
  for (let i = 0; i < LIMITES.pedidosEmAbertoPorAluno; i++) {
    const c = new Carrinho();
    c.adicionarProduto(coxinha);
    ger.finalizarPedido(aluno, c, app, calc);
  }
  const c = new Carrinho();
  c.adicionarProduto(coxinha);
  assert.throws(() => ger.finalizarPedido(aluno, c, app, calc), /já tem 3 pedidos/);
});

test('Aluno com nome vazio é rejeitado (antes virava "Filipe Falcão" em silêncio)', () => {
  assert.equal(validarDadosAluno('', '2026.1.001').ok, false);
  assert.equal(validarDadosAluno('Ana', 'a b').ok, false);
  assert.equal(validarDadosAluno('  Ana   Souza ', '2026.1.001').ok, true);
});

test('descreverErro esconde detalhe técnico de erros inesperados', () => {
  const r = descreverErro(new TypeError('x is undefined'), 'salvar');
  assert.equal(r.esperado, false);
  assert.ok(!r.detalhe.includes('undefined'));
});

test('Persistência: ida e volta preserva pedidos, status, pagamento e esgotados', () => {
  const dados = criarDadosIniciaisCantina();
  dados.cardapioInicial[2].definirDisponibilidade(false);
  dados.gerenciadorInicial.confirmarPagamentoPedido('ped-102', 'Op');
  const texto = serializarEstado({
    cardapio: dados.cardapioInicial,
    gerenciador: dados.gerenciadorInicial,
    perfilAluno: aluno,
    perfilOperador: null,
  });
  const { estado, avisos } = interpretarEstadoSalvo(texto, { guardarBackup: false });
  assert.ok(estado);
  assert.deepEqual(avisos, []);
  assert.equal(estado!.cardapio.length, 10);
  assert.equal(estado!.cardapio[2].estaDisponivel(), false);
  const p102 = estado!.gerenciador.buscarPedidoPorId('ped-102')!;
  assert.equal(p102.estaPagamentoConfirmado(), true);
  assert.equal(estado!.gerenciador.obterSequencialTicket(), 102);
  assert.deepEqual(estado!.perfilAluno, aluno);
  assert.equal(serializarEstado(estado!), texto, 'serialização determinística (evita loop entre abas)');
});

test('Persistência: JSON corrompido, versão antiga e registros inválidos não derrubam o app', () => {
  assert.equal(interpretarEstadoSalvo('{quebrado', { guardarBackup: false }).estado, null);
  assert.equal(interpretarEstadoSalvo('{"versao":0}', { guardarBackup: false }).estado, null);

  const dados = criarDadosIniciaisCantina();
  const bruto = JSON.parse(
    serializarEstado({ cardapio: dados.cardapioInicial, gerenciador: dados.gerenciadorInicial, perfilAluno: null, perfilOperador: null })
  );
  bruto.cardapio[0].preco = 'grátis';
  bruto.pedidos[0].itens = [];
  bruto.perfilAluno = { nome: '', matricula: '' };
  const r = interpretarEstadoSalvo(JSON.stringify(bruto), { guardarBackup: false });
  assert.ok(r.estado);
  assert.equal(r.estado!.cardapio.length, 9);
  assert.equal(r.estado!.gerenciador.obterTodosPedidos().length, 1);
  assert.equal(r.estado!.perfilAluno, null);
  assert.equal(r.avisos.length, 2);
});

test('Pedido.restaurar recusa status e pagamento desconhecidos', () => {
  const { pedidos } = criarDadosIniciaisCantina().gerenciadorInicial.serializar();
  assert.throws(() => Pedido.restaurar({ ...pedidos[0], status: 'Voando' }), ErroValidacao);
  assert.throws(
    () => Pedido.restaurar({ ...pedidos[0], resultadoCheckout: { ...pedidos[0].resultadoCheckout, statusFinanceiro: 'FIADO' } }),
    ErroValidacao
  );
});

test('Cardápio Real da Entrega 2 carrega todos os 44 itens nas 8 categorias oficiais', () => {
  const cardapioReal = criarCardapioRealCantina();
  assert.equal(cardapioReal.length, 44);
  const categoriasPresentes = new Set(cardapioReal.map((p) => p.obterCategoria()));
  assert.deepEqual([...categoriasPresentes], [...CATEGORIAS_CARDAPIO_REAL]);
});

test('Previsão Inteligente registra timestamps de Em Preparo e Pronto para Retirada e calcula média móvel', () => {
  const { tapioca } = cardapio();
  const carrinho = new Carrinho();
  carrinho.adicionarProduto(tapioca);
  const ger = new GerenciadorPedidos();
  const p = ger.finalizarPedido(aluno, carrinho, app, calc);

  const tInicio = 1_700_000_000_000;
  const tPronto = tInicio + 6 * 60 * 1000; // 6 minutos reais

  ger.avancarStatusPedido(p.obterId(), 'Op', 'Recebido', tInicio);
  assert.equal(p.obterIniciadoPreparoEm(), tInicio);

  ger.avancarStatusPedido(p.obterId(), 'Op', 'Fazendo', tPronto);
  assert.equal(p.obterProntoParaRetiradaEm(), tPronto);
  assert.equal(p.obterTempoRealPreparoMinutos(), 6);

  const media = calc.calcularMediaMovelPreparo(ger.obterTodosPedidos(), ger.obterHistoricoTemposReaisMinutos());
  assert.equal(media, 6);
});

