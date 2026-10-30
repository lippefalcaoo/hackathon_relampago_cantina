export type CategoriaProduto =
  | 'Salgados'
  | 'Lanches na Chapa'
  | 'Bebidas'
  | 'Doces';

export type TipoNaturezaCodigo = 'ESTUFA_RAPIDO' | 'COZINHA_NA_HORA';

export type StatusPedido =
  | 'Recebido'
  | 'Fazendo'
  | 'Pronto para Retirada'
  | 'Entregue';

export type TipoFilaRetirada =
  | 'Balcão de Retirada Expressa'
  | 'Fila do Caixa';

export type StatusFinanceiroPedido = 'PAGO_NO_APP' | 'PAGAR_NO_CAIXA';

export interface DadosCriacaoProduto {
  id?: string;
  nome: string;
  descricao: string;
  preco: number;
  categoria: CategoriaProduto;
  naturezaPreparo: NaturezaPreparo;
}

export interface DadosAtualizacaoProduto {
  nome: string;
  descricao?: string;
  preco: number;
  categoria: CategoriaProduto;
  naturezaPreparo: NaturezaPreparo;
}

export interface NaturezaPreparo {
  obterCodigo(): TipoNaturezaCodigo;
  obterRotulo(): string;
  obterSubtituloVelocidade(): string;
  obterTempoBaseMinutos(): number;
  utilizaGargaloCozinha(): boolean;
  calcularCargaUnidadeMinutos(): number;
}

export class PreparoRapidoEstufa implements NaturezaPreparo {
  private readonly tempoBaseMinutos: number;

  constructor(tempoBaseMinutos: number = 2) {
    this.tempoBaseMinutos = Math.max(1, Math.round(tempoBaseMinutos));
  }

  public obterCodigo(): TipoNaturezaCodigo {
    return 'ESTUFA_RAPIDO';
  }

  public obterRotulo(): string {
    return 'Pronto / Estufa';
  }

  public obterSubtituloVelocidade(): string {
    return 'Só esquentar ou pegar';
  }

  public obterTempoBaseMinutos(): number {
    return this.tempoBaseMinutos;
  }

  public utilizaGargaloCozinha(): boolean {
    return false;
  }

  public calcularCargaUnidadeMinutos(): number {
    return 0;
  }
}

export class PreparoNaHoraCozinha implements NaturezaPreparo {
  private readonly tempoBaseMinutos: number;
  private readonly pesoGargaloPorUnidade: number;

  constructor(tempoBaseMinutos: number = 6, pesoGargaloPorUnidade: number = 3) {
    this.tempoBaseMinutos = Math.max(3, Math.round(tempoBaseMinutos));
    this.pesoGargaloPorUnidade = pesoGargaloPorUnidade;
  }

  public obterCodigo(): TipoNaturezaCodigo {
    return 'COZINHA_NA_HORA';
  }

  public obterRotulo(): string {
    return 'Feito na Hora (Cozinha/Chapa)';
  }

  public obterSubtituloVelocidade(): string {
    return 'Preparado na chapa sob demanda';
  }

  public obterTempoBaseMinutos(): number {
    return this.tempoBaseMinutos;
  }

  public utilizaGargaloCozinha(): boolean {
    return true;
  }

  public calcularCargaUnidadeMinutos(): number {
    return this.pesoGargaloPorUnidade;
  }
}

export class Produto {
  private readonly id: string;
  private nome: string;
  private descricao: string;
  private preco: number;
  private categoria: CategoriaProduto;
  private naturezaPreparo: NaturezaPreparo;

  constructor(dados: DadosCriacaoProduto) {
    this.validarDados(dados.nome, dados.preco);
    this.id = dados.id ?? `prod-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    this.nome = dados.nome.trim();
    this.descricao = dados.descricao.trim();
    this.preco = Number(dados.preco);
    this.categoria = dados.categoria;
    this.naturezaPreparo = dados.naturezaPreparo;
  }

  private validarDados(nome: string, preco: number): void {
    if (!nome || nome.trim().length < 2) {
      throw new Error('O nome do produto deve possuir pelo menos 2 caracteres.');
    }
    if (Number.isNaN(preco) || preco <= 0) {
      throw new Error('O preço do produto deve ser maior que zero.');
    }
  }

  public atualizarDados(novosDados: DadosAtualizacaoProduto): void {
    this.validarDados(novosDados.nome, novosDados.preco);
    this.nome = novosDados.nome.trim();
    if (novosDados.descricao !== undefined) {
      this.descricao = novosDados.descricao.trim();
    }
    this.preco = Number(novosDados.preco);
    this.categoria = novosDados.categoria;
    this.naturezaPreparo = novosDados.naturezaPreparo;
  }

  public obterId(): string {
    return this.id;
  }

  public obterNome(): string {
    return this.nome;
  }

  public obterDescricao(): string {
    return this.descricao;
  }

  public obterPreco(): number {
    return this.preco;
  }

  public obterCategoria(): CategoriaProduto {
    return this.categoria;
  }

  public obterTempoBaseMinutos(): number {
    return this.naturezaPreparo.obterTempoBaseMinutos();
  }

  public utilizaGargaloCozinha(): boolean {
    return this.naturezaPreparo.utilizaGargaloCozinha();
  }

  public obterCargaCozinhaPorUnidade(): number {
    return this.naturezaPreparo.calcularCargaUnidadeMinutos();
  }

  public obterCodigoNatureza(): TipoNaturezaCodigo {
    return this.naturezaPreparo.obterCodigo();
  }

  public obterRotuloNatureza(): string {
    return this.naturezaPreparo.obterRotulo();
  }

  public obterSubtituloVelocidade(): string {
    return this.naturezaPreparo.obterSubtituloVelocidade();
  }
}

export class ItemCarrinho {
  private readonly produto: Produto;
  private quantidade: number;

  constructor(produto: Produto, quantidade: number = 1) {
    this.produto = produto;
    this.quantidade = Math.max(1, Math.floor(quantidade));
  }

  public incrementar(delta: number = 1): void {
    this.quantidade += Math.max(1, Math.floor(delta));
  }

  public alterarQuantidade(novaQuantidade: number): void {
    this.quantidade = Math.max(0, Math.floor(novaQuantidade));
  }

  public obterQuantidade(): number {
    return this.quantidade;
  }

  public obterProduto(): Produto {
    return this.produto;
  }

  public obterProdutoId(): string {
    return this.produto.obterId();
  }

  public obterNomeProduto(): string {
    return this.produto.obterNome();
  }

  public obterPrecoUnitario(): number {
    return this.produto.obterPreco();
  }

  public calcularSubtotal(): number {
    return this.produto.obterPreco() * this.quantidade;
  }

  public utilizaGargaloCozinha(): boolean {
    return this.produto.utilizaGargaloCozinha();
  }

  public obterTempoBaseItem(): number {
    return this.produto.obterTempoBaseMinutos();
  }

  public calcularCargaCozinhaTotalItem(): number {
    if (!this.produto.utilizaGargaloCozinha()) {
      return 0;
    }
    return this.produto.obterCargaCozinhaPorUnidade() * this.quantidade;
  }

  public clonar(): ItemCarrinho {
    return new ItemCarrinho(this.produto, this.quantidade);
  }
}

export class Carrinho {
  private itens: Map<string, ItemCarrinho> = new Map();

  public adicionarProduto(produto: Produto, quantidade: number = 1): void {
    const id = produto.obterId();
    const existente = this.itens.get(id);
    if (existente) {
      existente.incrementar(quantidade);
    } else {
      this.itens.set(id, new ItemCarrinho(produto, quantidade));
    }
  }

  public alterarQuantidade(produtoId: string, novaQuantidade: number): void {
    const item = this.itens.get(produtoId);
    if (!item) return;
    if (novaQuantidade <= 0) {
      this.itens.delete(produtoId);
    } else {
      item.alterarQuantidade(novaQuantidade);
    }
  }

  public removerProduto(produtoId: string): void {
    this.itens.delete(produtoId);
  }

  public limpar(): void {
    this.itens.clear();
  }

  public estaVazio(): boolean {
    return this.itens.size === 0;
  }

  public obterItens(): ItemCarrinho[] {
    return Array.from(this.itens.values()).map((item) => item.clonar());
  }

  public obterQuantidadeTotalItens(): number {
    let total = 0;
    for (const item of this.itens.values()) {
      total += item.obterQuantidade();
    }
    return total;
  }

  public calcularValorTotal(): number {
    let subtotal = 0;
    for (const item of this.itens.values()) {
      subtotal += item.calcularSubtotal();
    }
    return subtotal;
  }

  public contemItensDeCozinha(): boolean {
    for (const item of this.itens.values()) {
      if (item.utilizaGargaloCozinha()) {
        return true;
      }
    }
    return false;
  }
}

export interface ResultadoCheckout {
  codigoMetodo: string;
  tituloMetodo: string;
  statusFinanceiro: StatusFinanceiroPedido;
  etiquetaOperacionalKDS: string;
  tipoFila: TipoFilaRetirada;
  nomeTicketFila: string;
  codigoTicket: string;
  instrucaoAluno: string;
}

export interface ProcessadorCheckout {
  obterCodigo(): string;
  obterNomeExibicao(): string;
  obterSubtituloExibicao(): string;
  obterDestaqueFila(): string;
  obterTipoFilaGerada(): TipoFilaRetirada;
  processarCheckout(valorTotal: number, sequencialTicket: number): ResultadoCheckout;
}

export class PagamentoOnlineApp implements ProcessadorCheckout {
  public obterCodigo(): string {
    return 'PAGAR_NO_APP';
  }

  public obterNomeExibicao(): string {
    return 'Pagar pelo App/Site (Pix ou Cartão Online)';
  }

  public obterSubtituloExibicao(): string {
    return 'Confirma na hora e gera Ticket de Fila Expressa (Fast-Pass) para retirada direta.';
  }

  public obterDestaqueFila(): string {
    return 'Ticket de Fila Expressa (Fast-Pass)';
  }

  public obterTipoFilaGerada(): TipoFilaRetirada {
    return 'Balcão de Retirada Expressa';
  }

  public processarCheckout(_valorTotal: number, sequencialTicket: number): ResultadoCheckout {
    return {
      codigoMetodo: this.obterCodigo(),
      tituloMetodo: 'Pago pelo App (Pix / Cartão Online)',
      statusFinanceiro: 'PAGO_NO_APP',
      etiquetaOperacionalKDS: 'PAGO NO APP — Liberar no Balcão Expresso',
      tipoFila: 'Balcão de Retirada Expressa',
      nomeTicketFila: 'Ticket de Fila Expressa (Fast-Pass)',
      codigoTicket: `FP-${String(sequencialTicket).padStart(3, '0')}`,
      instrucaoAluno:
        'Pagamento confirmado! Dirija-se direto ao Balcão de Retirada Expressa assim que seu pedido estiver Pronto.',
    };
  }
}

export class PagamentoPresencialLoja implements ProcessadorCheckout {
  public obterCodigo(): string {
    return 'PAGAR_NA_LOJA';
  }

  public obterNomeExibicao(): string {
    return 'Pagar na Loja Física (Presencial)';
  }

  public obterSubtituloExibicao(): string {
    return 'Envia para a cozinha adiantar o preparo e gera Ticket de Fila do Caixa.';
  }

  public obterDestaqueFila(): string {
    return 'Ticket de Fila do Caixa';
  }

  public obterTipoFilaGerada(): TipoFilaRetirada {
    return 'Fila do Caixa';
  }

  public processarCheckout(valorTotal: number, sequencialTicket: number): ResultadoCheckout {
    const valorFormatado = valorTotal.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
    return {
      codigoMetodo: this.obterCodigo(),
      tituloMetodo: 'Pagar na Loja Física (Presencial)',
      statusFinanceiro: 'PAGAR_NO_CAIXA',
      etiquetaOperacionalKDS: `PAGAR NO CAIXA — Cobrar ${valorFormatado} na entrega`,
      tipoFila: 'Fila do Caixa',
      nomeTicketFila: 'Ticket de Fila do Caixa',
      codigoTicket: `CX-${String(sequencialTicket).padStart(3, '0')}`,
      instrucaoAluno: `Seu pedido já foi enviado para a cozinha adiantar o preparo! Dirija-se à Fila do Caixa para realizar o pagamento de ${valorFormatado} e retirar.`,
    };
  }
}

export interface DadosAluno {
  nome: string;
  matricula: string;
}

export class Pedido {
  private readonly id: string;
  private readonly alunoNome: string;
  private readonly alunoMatricula: string;
  private readonly itens: ItemCarrinho[];
  private readonly valorTotal: number;
  private readonly resultadoCheckout: ResultadoCheckout;
  private readonly tempoEstimadoNoFechamentoMinutos: number;
  private readonly horarioCriacao: string;
  private status: StatusPedido;
  private ultimoOperadorResponsavel: string;

  constructor(
    id: string,
    aluno: DadosAluno,
    itens: ItemCarrinho[],
    valorTotal: number,
    resultadoCheckout: ResultadoCheckout,
    tempoEstimadoMinutos: number,
    statusInicial: StatusPedido = 'Recebido',
    horarioCriacao?: string
  ) {
    this.id = id;
    this.alunoNome = aluno.nome.trim();
    this.alunoMatricula = aluno.matricula.trim();
    this.itens = itens.map((item) => item.clonar());
    this.valorTotal = valorTotal;
    this.resultadoCheckout = resultadoCheckout;
    this.tempoEstimadoNoFechamentoMinutos = tempoEstimadoMinutos;
    this.status = statusInicial;
    this.ultimoOperadorResponsavel = 'Autoatendimento Digital';
    this.horarioCriacao =
      horarioCriacao ??
      new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  public avancarStatus(nomeOperador?: string): StatusPedido {
    if (nomeOperador && nomeOperador.trim().length > 0) {
      this.ultimoOperadorResponsavel = nomeOperador.trim();
    }

    if (this.status === 'Recebido') {
      this.status = 'Fazendo';
    } else if (this.status === 'Fazendo') {
      this.status = 'Pronto para Retirada';
    } else if (this.status === 'Pronto para Retirada') {
      this.status = 'Entregue';
    }
    return this.status;
  }

  public estaAtivoNaCozinha(): boolean {
    return this.status === 'Recebido' || this.status === 'Fazendo';
  }

  public calcularCargaCozinhaAtivaMinutos(): number {
    if (!this.estaAtivoNaCozinha()) {
      return 0;
    }
    let cargaTotal = 0;
    for (const item of this.itens) {
      cargaTotal += item.calcularCargaCozinhaTotalItem();
    }
    if (this.status === 'Fazendo') {
      return Math.ceil(cargaTotal * 0.65);
    }
    return cargaTotal;
  }

  public contemItensCozinha(): boolean {
    return this.itens.some((item) => item.utilizaGargaloCozinha());
  }

  public obterId(): string {
    return this.id;
  }

  public obterCodigoTicket(): string {
    return this.resultadoCheckout.codigoTicket;
  }

  public obterNomeTicketFila(): string {
    return this.resultadoCheckout.nomeTicketFila;
  }

  public obterAlunoNome(): string {
    return this.alunoNome;
  }

  public obterAlunoMatricula(): string {
    return this.alunoMatricula;
  }

  public obterItens(): ItemCarrinho[] {
    return this.itens.map((item) => item.clonar());
  }

  public obterValorTotal(): number {
    return this.valorTotal;
  }

  public obterStatus(): StatusPedido {
    return this.status;
  }

  public obterTipoFila(): TipoFilaRetirada {
    return this.resultadoCheckout.tipoFila;
  }

  public obterStatusFinanceiro(): StatusFinanceiroPedido {
    return this.resultadoCheckout.statusFinanceiro;
  }

  public obterEtiquetaOperacionalKDS(): string {
    return this.resultadoCheckout.etiquetaOperacionalKDS;
  }

  public obterTituloMetodoPagamento(): string {
    return this.resultadoCheckout.tituloMetodo;
  }

  public obterInstrucaoAluno(): string {
    return this.resultadoCheckout.instrucaoAluno;
  }

  public obterTempoEstimadoInicial(): number {
    return this.tempoEstimadoNoFechamentoMinutos;
  }

  public obterHorarioCriacao(): string {
    return this.horarioCriacao;
  }

  public obterUltimoOperador(): string {
    return this.ultimoOperadorResponsavel;
  }

  public ehFilaExpressa(): boolean {
    return this.resultadoCheckout.statusFinanceiro === 'PAGO_NO_APP';
  }
}

export class CalculadoraGargaloFila {
  private readonly limiteAlertaIntervaloMinutos: number = 12;

  public calcularMinutosGargaloCozinha(pedidos: Pedido[]): number {
    let cargaAcumuladaMinutos = 0;
    for (const pedido of pedidos) {
      cargaAcumuladaMinutos += pedido.calcularCargaCozinhaAtivaMinutos();
    }
    return cargaAcumuladaMinutos;
  }

  public contarPedidosAtivosNaCozinha(pedidos: Pedido[]): number {
    return pedidos.filter(
      (p) => p.estaAtivoNaCozinha() && p.contemItensCozinha()
    ).length;
  }

  public calcularTempoEstimadoProduto(produto: Produto, pedidosAtivos: Pedido[]): number {
    const tempoBase = produto.obterTempoBaseMinutos();
    if (!produto.utilizaGargaloCozinha()) {
      return tempoBase;
    }
    const gargaloAtual = this.calcularMinutosGargaloCozinha(pedidosAtivos);
    return tempoBase + gargaloAtual;
  }

  public diagnosticarCarrinho(
    carrinho: Carrinho,
    pedidosAtivos: Pedido[]
  ): {
    tempoBaseItens: number;
    acrescimoGargaloCozinha: number;
    tempoTotalEstimadoMinutos: number;
    ultrapassaLimiteSeguranca: boolean;
    pedidosAtivosNaChapa: number;
  } {
    const itens = carrinho.obterItens();
    const gargaloCozinhaAtual = this.calcularMinutosGargaloCozinha(pedidosAtivos);
    const pedidosNaChapa = this.contarPedidosAtivosNaCozinha(pedidosAtivos);

    if (itens.length === 0) {
      return {
        tempoBaseItens: 0,
        acrescimoGargaloCozinha: gargaloCozinhaAtual,
        tempoTotalEstimadoMinutos: 0,
        ultrapassaLimiteSeguranca: false,
        pedidosAtivosNaChapa: pedidosNaChapa,
      };
    }

    let maiorTempoBase = 0;
    let cargaIncrementalProprioCarrinho = 0;
    const usaCozinha = carrinho.contemItensDeCozinha();

    for (const item of itens) {
      const baseItem = item.obterTempoBaseItem();
      if (baseItem > maiorTempoBase) {
        maiorTempoBase = baseItem;
      }
      if (item.utilizaGargaloCozinha() && item.obterQuantidade() > 1) {
        cargaIncrementalProprioCarrinho += (item.obterQuantidade() - 1) * 1.5;
      }
    }

    const tempoBaseItens = Math.round(maiorTempoBase + cargaIncrementalProprioCarrinho);
    const acrescimo = usaCozinha ? gargaloCozinhaAtual : 0;
    const tempoTotal = tempoBaseItens + acrescimo;

    return {
      tempoBaseItens,
      acrescimoGargaloCozinha: acrescimo,
      tempoTotalEstimadoMinutos: tempoTotal,
      ultrapassaLimiteSeguranca: tempoTotal > this.limiteAlertaIntervaloMinutos,
      pedidosAtivosNaChapa: pedidosNaChapa,
    };
  }
}

export class GerenciadorPedidos {
  private pedidos: Pedido[] = [];
  private sequencialTicket: number = 102;

  constructor(pedidosIniciais: Pedido[] = []) {
    this.pedidos = [...pedidosIniciais];
  }

  public finalizarPedido(
    aluno: DadosAluno,
    carrinho: Carrinho,
    processadorCheckout: ProcessadorCheckout,
    calculadoraGargalo: CalculadoraGargaloFila
  ): Pedido {
    this.sequencialTicket += 1;
    const valorTotal = carrinho.calcularValorTotal();
    const diagnosticoTempo = calculadoraGargalo.diagnosticarCarrinho(
      carrinho,
      this.pedidos
    );

    const resultadoCheckout = processadorCheckout.processarCheckout(
      valorTotal,
      this.sequencialTicket
    );

    const novoPedido = new Pedido(
      `ped-${this.sequencialTicket}`,
      aluno,
      carrinho.obterItens(),
      valorTotal,
      resultadoCheckout,
      diagnosticoTempo.tempoTotalEstimadoMinutos,
      'Recebido'
    );

    this.pedidos = [novoPedido, ...this.pedidos];
    carrinho.limpar();
    return novoPedido;
  }

  public avancarStatusPedido(pedidoId: string, operadorNome: string): Pedido | undefined {
    const pedido = this.pedidos.find((p) => p.obterId() === pedidoId);
    if (pedido) {
      pedido.avancarStatus(operadorNome);
    }
    return pedido;
  }

  public obterTodosPedidos(): Pedido[] {
    return [...this.pedidos];
  }

  public buscarPedidoPorId(pedidoId: string): Pedido | undefined {
    return this.pedidos.find((p) => p.obterId() === pedidoId);
  }
}

export function criarDadosIniciaisCantina(): {
  cardapioInicial: Produto[];
  gerenciadorInicial: GerenciadorPedidos;
  processadoresDisponiveis: ProcessadorCheckout[];
} {
  const cardapioInicial: Produto[] = [
    new Produto({
      id: 'prod-1',
      nome: 'Coxinha de Frango com Catupiry',
      descricao: 'Massa artesanal dourada, mantida quentinha na estufa para retirada imediata.',
      preco: 9.5,
      categoria: 'Salgados',
      naturezaPreparo: new PreparoRapidoEstufa(1),
    }),
    new Produto({
      id: 'prod-2',
      nome: 'Empada Pernambucana de Camarão',
      descricao: 'Massa amanteigada com recheio cremoso de camarão, pronta na estufa.',
      preco: 11.0,
      categoria: 'Salgados',
      naturezaPreparo: new PreparoRapidoEstufa(2),
    }),
    new Produto({
      id: 'prod-3',
      nome: 'Croissant Queijo do Reino & Peito de Peru',
      descricao: 'Folhado francês aquecido rapidamente na estufa expressa.',
      preco: 13.5,
      categoria: 'Salgados',
      naturezaPreparo: new PreparoRapidoEstufa(2),
    }),
    new Produto({
      id: 'prod-4',
      nome: 'Sanduíche Ciabatta Queijo Coalho na Chapa',
      descricao: 'Pão ciabatta tostado na hora na prensa com queijo coalho derretido, tomate seco e orégano.',
      preco: 18.9,
      categoria: 'Lanches na Chapa',
      naturezaPreparo: new PreparoNaHoraCozinha(6, 3),
    }),
    new Produto({
      id: 'prod-5',
      nome: 'Tapioca Recife (Carne de Sol & Coalho)',
      descricao: 'Goma fresca peneirada na hora na chapa quente com carne de sol na manteiga de garrafa.',
      preco: 19.5,
      categoria: 'Lanches na Chapa',
      naturezaPreparo: new PreparoNaHoraCozinha(7, 3),
    }),
    new Produto({
      id: 'prod-6',
      nome: 'Smash Burger Porto Digital Duplo',
      descricao: 'Dois blends bovinos 80g selados na chapa, cheddar inglês e molho especial no brioche.',
      preco: 24.0,
      categoria: 'Lanches na Chapa',
      naturezaPreparo: new PreparoNaHoraCozinha(8, 4),
    }),
    new Produto({
      id: 'prod-7',
      nome: 'Café Expresso / Iced Latte',
      descricao: 'Extração rápida de grãos selecionados ou versão gelada pronta no balcão.',
      preco: 7.5,
      categoria: 'Bebidas',
      naturezaPreparo: new PreparoRapidoEstufa(1),
    }),
    new Produto({
      id: 'prod-8',
      nome: 'Suco Natural Prensado (Laranja & Acerola)',
      descricao: 'Garrafa 300ml gelada no expositor rápido — só pegar e levar.',
      preco: 9.0,
      categoria: 'Bebidas',
      naturezaPreparo: new PreparoRapidoEstufa(1),
    }),
    new Produto({
      id: 'prod-9',
      nome: 'Bolo de Rolo Pernambucano (Fatia)',
      descricao: 'Clássico fininho com camadas de goiabada derretida, pronto na vitrine.',
      preco: 10.5,
      categoria: 'Doces',
      naturezaPreparo: new PreparoRapidoEstufa(1),
    }),
    new Produto({
      id: 'prod-10',
      nome: 'Brownie Belga 70% com Castanha',
      descricao: 'Aquecido rapidamente na estufa para retirada imediata no intervalo.',
      preco: 11.5,
      categoria: 'Doces',
      naturezaPreparo: new PreparoRapidoEstufa(1),
    }),
  ];

  const pagamentoApp = new PagamentoOnlineApp();
  const pagamentoLoja = new PagamentoPresencialLoja();

  // 2 pedidos já em andamento na fila para que o sistema abra vivo e pronto para demonstração imediata
  const pedidoEmAndamento1 = new Pedido(
    'ped-101',
    { nome: 'Filipe Falcão', matricula: '2026.2.001' },
    [
      new ItemCarrinho(cardapioInicial[4], 1), // Tapioca Recife (Feito na Hora - Chapa)
      new ItemCarrinho(cardapioInicial[7], 1), // Suco Natural (Estufa)
    ],
    28.5,
    pagamentoApp.processarCheckout(28.5, 101),
    9,
    'Fazendo',
    '10:12'
  );

  const pedidoEmAndamento2 = new Pedido(
    'ped-102',
    { nome: 'Beatriz Cavalcanti', matricula: '2026.1.048' },
    [
      new ItemCarrinho(cardapioInicial[5], 1), // Smash Burger Duplo (Feito na Hora - Chapa)
      new ItemCarrinho(cardapioInicial[0], 1), // Coxinha de Frango (Estufa)
    ],
    33.5,
    pagamentoLoja.processarCheckout(33.5, 102),
    14,
    'Recebido',
    '10:14'
  );

  const gerenciadorInicial = new GerenciadorPedidos([
    pedidoEmAndamento2,
    pedidoEmAndamento1,
  ]);

  return {
    cardapioInicial,
    gerenciadorInicial,
    processadoresDisponiveis: [pagamentoApp, pagamentoLoja],
  };
}
