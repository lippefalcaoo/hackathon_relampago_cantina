import {
  ErroConflito,
  ErroNaoEncontrado,
  ErroRegraNegocio,
  ErroValidacao,
} from './erros';

export * from './erros';

/* ==========================================================================
   Tipos e constantes do domínio
   ========================================================================== */

export const CATEGORIAS_PRODUTO = ['Salgados', 'Lanches na Chapa', 'Bebidas', 'Doces'] as const;
export type CategoriaProduto = (typeof CATEGORIAS_PRODUTO)[number];

export const NATUREZAS_PREPARO = ['ESTUFA_RAPIDO', 'COZINHA_NA_HORA'] as const;
export type TipoNaturezaCodigo = (typeof NATUREZAS_PREPARO)[number];

/** Etapas do fluxo normal de um pedido, em ordem. */
export const ETAPAS_PEDIDO = ['Recebido', 'Fazendo', 'Pronto para Retirada', 'Entregue'] as const;
export type StatusPedido = (typeof ETAPAS_PEDIDO)[number] | 'Cancelado';
const TODOS_STATUS: readonly StatusPedido[] = [...ETAPAS_PEDIDO, 'Cancelado'];

export type TipoFilaRetirada = 'Balcão de Retirada Expressa' | 'Fila do Caixa';
const TIPOS_FILA: readonly TipoFilaRetirada[] = ['Balcão de Retirada Expressa', 'Fila do Caixa'];

export type StatusFinanceiroPedido = 'PAGO_NO_APP' | 'PAGAR_NO_CAIXA';
const STATUS_FINANCEIROS: readonly StatusFinanceiroPedido[] = ['PAGO_NO_APP', 'PAGAR_NO_CAIXA'];

/** Limites de negócio centralizados (usados pelo domínio e pelos formulários). */
export const LIMITES = {
  nomeProduto: { min: 2, max: 60 },
  descricaoProduto: { max: 160 },
  preco: { min: 0.5, max: 500 },
  tempoBase: {
    ESTUFA_RAPIDO: { min: 1, max: 10, padrao: 2 },
    COZINHA_NA_HORA: { min: 3, max: 25, padrao: 6 },
  },
  pesoGargalo: { min: 1, max: 10 },
  quantidadePorItem: 10,
  unidadesPorPedido: 20,
  nomePessoa: { min: 2, max: 60 },
  matricula: { min: 3, max: 20 },
  idOperador: { max: 12 },
  pedidosEmAbertoPorAluno: 3,
  historicoMaximoPedidos: 200,
} as const;

const REGEX_MATRICULA = /^[A-Za-z0-9][A-Za-z0-9./-]*$/;
const REGEX_ID_OPERADOR = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

/* ==========================================================================
   Utilitários de validação
   ========================================================================== */

export type ErrosCampos<C extends string> = Partial<Record<C, string>>;
export type ResultadoValidacao<T, C extends string> =
  | { ok: true; valor: T }
  | { ok: false; erros: ErrosCampos<C> };

function ehObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === 'object' && valor !== null && !Array.isArray(valor);
}

function textoLimpo(valor: unknown): string {
  return typeof valor === 'string' ? valor.trim().replace(/\s+/g, ' ') : '';
}

export function arredondarCentavos(valor: number): number {
  return Math.round((valor + Number.EPSILON) * 100) / 100;
}

/**
 * Converte texto digitado em número. Aceita "10,50", "10.50" e "1.234,56".
 * Retorna null para vazio, texto com letras ("12abc"), NaN e Infinity.
 */
export function lerNumero(valor: unknown): number | null {
  if (typeof valor === 'number') return Number.isFinite(valor) ? valor : null;
  if (typeof valor !== 'string') return null;
  let texto = valor.trim().replace(/\s/g, '');
  if (texto === '') return null;
  if (texto.includes(',')) texto = texto.replace(/\./g, '').replace(',', '.');
  if (!/^-?\d+(\.\d+)?$/.test(texto)) return null;
  const numero = Number(texto);
  return Number.isFinite(numero) ? numero : null;
}

function formatarMoedaDominio(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/** Lança o primeiro erro de um resultado de validação, ou devolve o valor validado. */
export function exigirValido<T, C extends string>(resultado: ResultadoValidacao<T, C>): T {
  if (resultado.ok) return resultado.valor;
  const [campo, mensagem] = Object.entries(resultado.erros)[0] as [C, string];
  throw new ErroValidacao(mensagem, campo);
}

function mensagemTempoBase(codigo: TipoNaturezaCodigo, tempo: number | null): string | null {
  const { min, max } = LIMITES.tempoBase[codigo];
  const rotulo = codigo === 'ESTUFA_RAPIDO' ? 'Itens de estufa' : 'Itens de chapa';
  if (tempo === null || !Number.isInteger(tempo)) return 'Informe o tempo em minutos inteiros.';
  if (tempo < min || tempo > max) return `${rotulo} levam de ${min} a ${max} minutos.`;
  return null;
}

function mensagemPreco(preco: number | null): string | null {
  const { min, max } = LIMITES.preco;
  if (preco === null) return 'Informe um preço válido, por exemplo 10,50.';
  if (preco < min) return `O preço mínimo é ${formatarMoedaDominio(min)}.`;
  if (preco > max) return `O preço máximo é ${formatarMoedaDominio(max)}.`;
  if (Math.abs(arredondarCentavos(preco) - preco) > 1e-9) return 'Use no máximo 2 casas decimais.';
  return null;
}

function mensagemNomeProduto(nome: string): string | null {
  const { min, max } = LIMITES.nomeProduto;
  if (nome.length < min) return `O nome precisa ter pelo menos ${min} caracteres.`;
  if (nome.length > max) return `O nome pode ter no máximo ${max} caracteres.`;
  return null;
}

function mensagemDescricao(descricao: string): string | null {
  const { max } = LIMITES.descricaoProduto;
  return descricao.length > max ? `A descrição pode ter no máximo ${max} caracteres.` : null;
}

function ehCategoria(valor: unknown): valor is CategoriaProduto {
  return typeof valor === 'string' && (CATEGORIAS_PRODUTO as readonly string[]).includes(valor);
}

function ehNatureza(valor: unknown): valor is TipoNaturezaCodigo {
  return typeof valor === 'string' && (NATUREZAS_PREPARO as readonly string[]).includes(valor);
}

function ehStatusPedido(valor: unknown): valor is StatusPedido {
  return typeof valor === 'string' && (TODOS_STATUS as readonly string[]).includes(valor);
}

function gerarId(prefixo: string): string {
  const cripto = typeof globalThis !== 'undefined' ? globalThis.crypto : undefined;
  // randomUUID só existe em contexto seguro (https/localhost); fora dele usamos o fallback.
  if (cripto && typeof cripto.randomUUID === 'function') {
    return `${prefixo}-${cripto.randomUUID().slice(0, 8)}`;
  }
  return `${prefixo}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/* ==========================================================================
   Natureza de preparo (Strategy)
   ========================================================================== */

export interface NaturezaSerializada {
  codigo: TipoNaturezaCodigo;
  tempoBaseMinutos: number;
  pesoGargaloPorUnidade?: number;
}

export interface NaturezaPreparo {
  obterCodigo(): TipoNaturezaCodigo;
  obterRotulo(): string;
  obterSubtituloVelocidade(): string;
  obterTempoBaseMinutos(): number;
  utilizaGargaloCozinha(): boolean;
  calcularCargaUnidadeMinutos(): number;
  serializar(): NaturezaSerializada;
}

function exigirTempoBase(codigo: TipoNaturezaCodigo, tempo: unknown): number {
  const numero = typeof tempo === 'number' && Number.isFinite(tempo) ? tempo : null;
  const erro = mensagemTempoBase(codigo, numero);
  if (erro) throw new ErroValidacao(erro, 'tempoBase');
  return numero as number;
}

export class PreparoRapidoEstufa implements NaturezaPreparo {
  private readonly tempoBaseMinutos: number;

  constructor(tempoBaseMinutos: number = LIMITES.tempoBase.ESTUFA_RAPIDO.padrao) {
    this.tempoBaseMinutos = exigirTempoBase('ESTUFA_RAPIDO', tempoBaseMinutos);
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

  public serializar(): NaturezaSerializada {
    return { codigo: 'ESTUFA_RAPIDO', tempoBaseMinutos: this.tempoBaseMinutos };
  }
}

export class PreparoNaHoraCozinha implements NaturezaPreparo {
  private readonly tempoBaseMinutos: number;
  private readonly pesoGargaloPorUnidade: number;

  constructor(
    tempoBaseMinutos: number = LIMITES.tempoBase.COZINHA_NA_HORA.padrao,
    pesoGargaloPorUnidade: number = 3
  ) {
    this.tempoBaseMinutos = exigirTempoBase('COZINHA_NA_HORA', tempoBaseMinutos);
    const { min, max } = LIMITES.pesoGargalo;
    if (
      !Number.isFinite(pesoGargaloPorUnidade) ||
      pesoGargaloPorUnidade < min ||
      pesoGargaloPorUnidade > max
    ) {
      throw new ErroValidacao(`O peso na chapa deve ficar entre ${min} e ${max} minutos.`);
    }
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

  public serializar(): NaturezaSerializada {
    return {
      codigo: 'COZINHA_NA_HORA',
      tempoBaseMinutos: this.tempoBaseMinutos,
      pesoGargaloPorUnidade: this.pesoGargaloPorUnidade,
    };
  }
}

/** Fábrica única de naturezas (usada pelos formulários e pela restauração de dados). */
export function criarNaturezaPreparo(
  codigo: TipoNaturezaCodigo,
  tempoBaseMinutos: number,
  pesoGargaloPorUnidade?: number
): NaturezaPreparo {
  if (codigo === 'ESTUFA_RAPIDO') return new PreparoRapidoEstufa(tempoBaseMinutos);
  if (codigo === 'COZINHA_NA_HORA') {
    return new PreparoNaHoraCozinha(tempoBaseMinutos, pesoGargaloPorUnidade ?? 3);
  }
  throw new ErroValidacao('Natureza de preparo desconhecida.', 'natureza');
}

function restaurarNatureza(dados: unknown): NaturezaPreparo {
  if (!ehObjeto(dados) || !ehNatureza(dados.codigo)) {
    throw new ErroValidacao('Natureza de preparo inválida nos dados salvos.');
  }
  const peso = typeof dados.pesoGargaloPorUnidade === 'number' ? dados.pesoGargaloPorUnidade : undefined;
  return criarNaturezaPreparo(dados.codigo, Number(dados.tempoBaseMinutos), peso);
}

/* ==========================================================================
   Produto
   ========================================================================== */

export interface DadosCriacaoProduto {
  id?: string;
  nome: string;
  descricao?: string;
  preco: number;
  categoria: CategoriaProduto;
  naturezaPreparo: NaturezaPreparo;
  disponivel?: boolean;
}

export interface DadosAtualizacaoProduto {
  nome: string;
  descricao?: string;
  preco: number;
  categoria: CategoriaProduto;
  naturezaPreparo: NaturezaPreparo;
}

export interface ProdutoSerializado {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  categoria: CategoriaProduto;
  natureza: NaturezaSerializada;
  disponivel: boolean;
}

/** Entrada crua vinda de um formulário (strings ainda não convertidas). */
export interface EntradaProduto {
  nome: unknown;
  descricao?: unknown;
  preco: unknown;
  categoria: unknown;
  natureza: unknown;
  tempoBase: unknown;
}

export type CampoProduto = 'nome' | 'descricao' | 'preco' | 'categoria' | 'natureza' | 'tempoBase';

/**
 * Valida TODOS os campos de um formulário de produto de uma vez, para a tela
 * conseguir destacar cada campo com problema (em vez de um erro por vez).
 */
export function validarEntradaProduto(
  entrada: EntradaProduto
): ResultadoValidacao<Omit<DadosCriacaoProduto, 'id' | 'disponivel'>, CampoProduto> {
  const erros: ErrosCampos<CampoProduto> = {};
  const nome = textoLimpo(entrada.nome);
  const descricao = textoLimpo(entrada.descricao);
  const preco = lerNumero(entrada.preco);
  const tempo = lerNumero(entrada.tempoBase);

  const erroNome = mensagemNomeProduto(nome);
  if (erroNome) erros.nome = erroNome;
  const erroDescricao = mensagemDescricao(descricao);
  if (erroDescricao) erros.descricao = erroDescricao;
  const erroPreco = mensagemPreco(preco);
  if (erroPreco) erros.preco = erroPreco;
  if (!ehCategoria(entrada.categoria)) erros.categoria = 'Escolha uma categoria da lista.';
  if (!ehNatureza(entrada.natureza)) {
    erros.natureza = 'Escolha a natureza de preparo.';
  } else {
    const erroTempo = mensagemTempoBase(entrada.natureza, tempo);
    if (erroTempo) erros.tempoBase = erroTempo;
  }

  if (Object.keys(erros).length > 0) return { ok: false, erros };

  return {
    ok: true,
    valor: {
      nome,
      descricao,
      preco: arredondarCentavos(preco as number),
      categoria: entrada.categoria as CategoriaProduto,
      naturezaPreparo: criarNaturezaPreparo(entrada.natureza as TipoNaturezaCodigo, tempo as number),
    },
  };
}

export class Produto {
  private readonly id: string;
  private nome: string;
  private descricao: string;
  private preco: number;
  private categoria: CategoriaProduto;
  private naturezaPreparo: NaturezaPreparo;
  private disponivel: boolean;

  constructor(dados: DadosCriacaoProduto) {
    if (!ehObjeto(dados)) throw new ErroValidacao('Dados do produto ausentes.');
    const normalizado = Produto.normalizar(dados);
    const idInformado = textoLimpo(dados.id);
    this.id = idInformado || gerarId('prod');
    this.nome = normalizado.nome;
    this.descricao = normalizado.descricao ?? '';
    this.preco = normalizado.preco;
    this.categoria = normalizado.categoria;
    this.naturezaPreparo = normalizado.naturezaPreparo;
    this.disponivel = dados.disponivel ?? true;
  }

  /** Valida e normaliza os dados ANTES de qualquer atribuição (atualização atômica). */
  private static normalizar(dados: DadosAtualizacaoProduto): DadosAtualizacaoProduto {
    const nome = textoLimpo(dados.nome);
    const erroNome = mensagemNomeProduto(nome);
    if (erroNome) throw new ErroValidacao(erroNome, 'nome');

    const descricao = dados.descricao === undefined ? undefined : textoLimpo(dados.descricao);
    const erroDescricao = descricao === undefined ? null : mensagemDescricao(descricao);
    if (erroDescricao) throw new ErroValidacao(erroDescricao, 'descricao');

    const preco = lerNumero(dados.preco);
    const erroPreco = mensagemPreco(preco);
    if (erroPreco) throw new ErroValidacao(erroPreco, 'preco');

    if (!ehCategoria(dados.categoria)) throw new ErroValidacao('Categoria inválida.', 'categoria');
    if (!dados.naturezaPreparo || typeof dados.naturezaPreparo.obterCodigo !== 'function') {
      throw new ErroValidacao('Natureza de preparo inválida.', 'natureza');
    }

    return {
      nome,
      descricao,
      preco: arredondarCentavos(preco as number),
      categoria: dados.categoria,
      naturezaPreparo: dados.naturezaPreparo,
    };
  }

  public atualizarDados(novosDados: DadosAtualizacaoProduto): void {
    const normalizado = Produto.normalizar(novosDados);
    this.nome = normalizado.nome;
    if (normalizado.descricao !== undefined) this.descricao = normalizado.descricao;
    this.preco = normalizado.preco;
    this.categoria = normalizado.categoria;
    this.naturezaPreparo = normalizado.naturezaPreparo;
  }

  public estaDisponivel(): boolean {
    return this.disponivel;
  }

  public definirDisponibilidade(disponivel: boolean): void {
    this.disponivel = Boolean(disponivel);
  }

  /** Cópia independente: editar o cardápio depois não altera pedidos já feitos. */
  public criarRetrato(): Produto {
    return new Produto({
      id: this.id,
      nome: this.nome,
      descricao: this.descricao,
      preco: this.preco,
      categoria: this.categoria,
      naturezaPreparo: this.naturezaPreparo,
      disponivel: this.disponivel,
    });
  }

  public serializar(): ProdutoSerializado {
    return {
      id: this.id,
      nome: this.nome,
      descricao: this.descricao,
      preco: this.preco,
      categoria: this.categoria,
      natureza: this.naturezaPreparo.serializar(),
      disponivel: this.disponivel,
    };
  }

  public static restaurar(dados: unknown): Produto {
    if (!ehObjeto(dados) || typeof dados.id !== 'string' || dados.id.trim() === '') {
      throw new ErroValidacao('Produto salvo sem identificador.');
    }
    return new Produto({
      id: dados.id,
      nome: String(dados.nome ?? ''),
      descricao: typeof dados.descricao === 'string' ? dados.descricao : '',
      preco: Number(dados.preco),
      categoria: dados.categoria as CategoriaProduto,
      naturezaPreparo: restaurarNatureza(dados.natureza),
      disponivel: dados.disponivel !== false,
    });
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

/* ==========================================================================
   Carrinho
   ========================================================================== */

function exigirQuantidade(quantidade: unknown): number {
  if (typeof quantidade !== 'number' || !Number.isInteger(quantidade)) {
    throw new ErroValidacao('A quantidade precisa ser um número inteiro.');
  }
  if (quantidade < 1) throw new ErroValidacao('A quantidade mínima é 1.');
  if (quantidade > LIMITES.quantidadePorItem) {
    throw new ErroRegraNegocio(`Cada item aceita até ${LIMITES.quantidadePorItem} unidades por pedido.`);
  }
  return quantidade;
}

export interface ItemSerializado {
  produto: ProdutoSerializado;
  quantidade: number;
}

export class ItemCarrinho {
  private readonly produto: Produto;
  private quantidade: number;

  constructor(produto: Produto, quantidade: number = 1) {
    if (!(produto instanceof Produto)) throw new ErroValidacao('Produto inválido para o carrinho.');
    this.produto = produto;
    this.quantidade = exigirQuantidade(quantidade);
  }

  public incrementar(delta: number = 1): void {
    const incremento = exigirQuantidade(delta);
    this.quantidade = exigirQuantidade(this.quantidade + incremento);
  }

  public alterarQuantidade(novaQuantidade: number): void {
    this.quantidade = exigirQuantidade(novaQuantidade);
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
    return arredondarCentavos(this.produto.obterPreco() * this.quantidade);
  }

  public utilizaGargaloCozinha(): boolean {
    return this.produto.utilizaGargaloCozinha();
  }

  public obterTempoBaseItem(): number {
    return this.produto.obterTempoBaseMinutos();
  }

  public calcularCargaCozinhaTotalItem(): number {
    if (!this.produto.utilizaGargaloCozinha()) return 0;
    return this.produto.obterCargaCozinhaPorUnidade() * this.quantidade;
  }

  public clonar(): ItemCarrinho {
    return new ItemCarrinho(this.produto, this.quantidade);
  }

  /** Clona congelando os dados do produto (preço, nome, preparo) neste momento. */
  public congelar(): ItemCarrinho {
    return new ItemCarrinho(this.produto.criarRetrato(), this.quantidade);
  }

  public serializar(): ItemSerializado {
    return { produto: this.produto.serializar(), quantidade: this.quantidade };
  }

  public static restaurar(dados: unknown): ItemCarrinho {
    if (!ehObjeto(dados)) throw new ErroValidacao('Item de pedido inválido nos dados salvos.');
    return new ItemCarrinho(Produto.restaurar(dados.produto), Number(dados.quantidade));
  }
}

export class Carrinho {
  private itens: Map<string, ItemCarrinho> = new Map();

  public adicionarProduto(produto: Produto, quantidade: number = 1): void {
    if (!(produto instanceof Produto)) throw new ErroValidacao('Produto inválido.');
    if (!produto.estaDisponivel()) {
      throw new ErroRegraNegocio(`${produto.obterNome()} está esgotado no momento.`);
    }
    const incremento = exigirQuantidade(quantidade);
    this.garantirLimiteTotal(incremento);

    const id = produto.obterId();
    const existente = this.itens.get(id);
    if (existente) {
      existente.incrementar(incremento);
    } else {
      this.itens.set(id, new ItemCarrinho(produto, incremento));
    }
  }

  public alterarQuantidade(produtoId: string, novaQuantidade: number): void {
    const item = this.itens.get(produtoId);
    if (!item) throw new ErroNaoEncontrado('Este item não está mais no carrinho.');
    if (typeof novaQuantidade !== 'number' || !Number.isInteger(novaQuantidade)) {
      throw new ErroValidacao('A quantidade precisa ser um número inteiro.');
    }
    if (novaQuantidade <= 0) {
      this.itens.delete(produtoId);
      return;
    }
    const diferenca = novaQuantidade - item.obterQuantidade();
    if (diferenca > 0) this.garantirLimiteTotal(diferenca);
    item.alterarQuantidade(novaQuantidade);
  }

  private garantirLimiteTotal(acrescimo: number): void {
    if (this.obterQuantidadeTotalItens() + acrescimo > LIMITES.unidadesPorPedido) {
      throw new ErroRegraNegocio(
        `Cada pedido aceita até ${LIMITES.unidadesPorPedido} unidades. Finalize este e faça outro pedido.`
      );
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

  public obterItensIndisponiveis(): ItemCarrinho[] {
    return this.obterItens().filter((item) => !item.obterProduto().estaDisponivel());
  }

  public obterQuantidadeTotalItens(): number {
    let total = 0;
    for (const item of this.itens.values()) total += item.obterQuantidade();
    return total;
  }

  public calcularValorTotal(): number {
    let subtotal = 0;
    for (const item of this.itens.values()) subtotal += item.calcularSubtotal();
    return arredondarCentavos(subtotal);
  }

  public contemItensDeCozinha(): boolean {
    for (const item of this.itens.values()) {
      if (item.utilizaGargaloCozinha()) return true;
    }
    return false;
  }

  /**
   * Quando o cardápio é recarregado (outra aba, dados restaurados), os itens do
   * carrinho passam a apontar para os produtos novos. Itens cujo produto sumiu
   * são removidos e seus nomes devolvidos para avisar o aluno.
   */
  public reconciliarComCardapio(cardapio: Produto[]): string[] {
    const porId = new Map(cardapio.map((p) => [p.obterId(), p]));
    const removidos: string[] = [];
    const novosItens = new Map<string, ItemCarrinho>();
    for (const [id, item] of this.itens) {
      const atual = porId.get(id);
      if (atual) {
        novosItens.set(id, new ItemCarrinho(atual, item.obterQuantidade()));
      } else {
        removidos.push(item.obterNomeProduto());
      }
    }
    this.itens = novosItens;
    return removidos;
  }
}

/* ==========================================================================
   Checkout (Strategy de pagamento)
   ========================================================================== */

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

function validarEntradaCheckout(valorTotal: number, sequencialTicket: number): void {
  if (!Number.isFinite(valorTotal) || valorTotal <= 0) {
    throw new ErroValidacao('O valor do pedido precisa ser maior que zero.');
  }
  if (!Number.isInteger(sequencialTicket) || sequencialTicket <= 0) {
    throw new ErroValidacao('Número de ticket inválido.');
  }
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

  public processarCheckout(valorTotal: number, sequencialTicket: number): ResultadoCheckout {
    validarEntradaCheckout(valorTotal, sequencialTicket);
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
    validarEntradaCheckout(valorTotal, sequencialTicket);
    const valorFormatado = formatarMoedaDominio(valorTotal);
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

function validarResultadoCheckout(dados: unknown): ResultadoCheckout {
  if (!ehObjeto(dados)) throw new ErroValidacao('Dados de pagamento ausentes.');
  const campos = [
    'codigoMetodo',
    'tituloMetodo',
    'etiquetaOperacionalKDS',
    'nomeTicketFila',
    'codigoTicket',
    'instrucaoAluno',
  ] as const;
  for (const campo of campos) {
    if (typeof dados[campo] !== 'string' || (dados[campo] as string).trim() === '') {
      throw new ErroValidacao(`Dados de pagamento incompletos (${campo}).`);
    }
  }
  if (!STATUS_FINANCEIROS.includes(dados.statusFinanceiro as StatusFinanceiroPedido)) {
    throw new ErroValidacao('Status financeiro desconhecido.');
  }
  if (!TIPOS_FILA.includes(dados.tipoFila as TipoFilaRetirada)) {
    throw new ErroValidacao('Tipo de fila desconhecido.');
  }
  return { ...(dados as unknown as ResultadoCheckout) };
}

/* ==========================================================================
   Pessoas (aluno e operador)
   ========================================================================== */

export interface DadosAluno {
  nome: string;
  matricula: string;
}

export interface DadosOperador {
  nome: string;
  id: string;
}

export type CampoAluno = 'nome' | 'matricula';
export type CampoOperador = 'nome' | 'id';

function mensagemNomePessoa(nome: string, quem: string): string | null {
  const { min, max } = LIMITES.nomePessoa;
  if (nome.length < min) return `Informe o nome ${quem} (mínimo ${min} letras).`;
  if (nome.length > max) return `O nome pode ter no máximo ${max} caracteres.`;
  return null;
}

export function validarDadosAluno(
  nome: unknown,
  matricula: unknown
): ResultadoValidacao<DadosAluno, CampoAluno> {
  const erros: ErrosCampos<CampoAluno> = {};
  const nomeLimpo = textoLimpo(nome);
  const matriculaLimpa = textoLimpo(matricula).replace(/\s/g, '');
  const erroNome = mensagemNomePessoa(nomeLimpo, 'do aluno');
  if (erroNome) erros.nome = erroNome;
  const { min, max } = LIMITES.matricula;
  if (matriculaLimpa.length < min || matriculaLimpa.length > max) {
    erros.matricula = `A matrícula deve ter de ${min} a ${max} caracteres.`;
  } else if (!REGEX_MATRICULA.test(matriculaLimpa)) {
    erros.matricula = 'Use apenas letras, números, ponto, barra ou hífen na matrícula.';
  }
  if (Object.keys(erros).length > 0) return { ok: false, erros };
  return { ok: true, valor: { nome: nomeLimpo, matricula: matriculaLimpa } };
}

export function validarDadosOperador(
  nome: unknown,
  id: unknown
): ResultadoValidacao<DadosOperador, CampoOperador> {
  const erros: ErrosCampos<CampoOperador> = {};
  const nomeLimpo = textoLimpo(nome);
  const idLimpo = textoLimpo(id).replace(/\s/g, '').toUpperCase();
  const erroNome = mensagemNomePessoa(nomeLimpo, 'do operador');
  if (erroNome) erros.nome = erroNome;
  if (idLimpo.length === 0 || idLimpo.length > LIMITES.idOperador.max || !REGEX_ID_OPERADOR.test(idLimpo)) {
    erros.id = `Informe um ID de até ${LIMITES.idOperador.max} caracteres (ex.: OP-01).`;
  }
  if (Object.keys(erros).length > 0) return { ok: false, erros };
  return { ok: true, valor: { nome: nomeLimpo, id: idLimpo } };
}

/* ==========================================================================
   Pedido
   ========================================================================== */

export interface PedidoSerializado {
  id: string;
  aluno: DadosAluno;
  itens: ItemSerializado[];
  valorTotal: number;
  resultadoCheckout: ResultadoCheckout;
  tempoEstimadoMinutos: number;
  status: StatusPedido;
  horarioCriacao: string;
  ultimoOperador: string;
  pagamentoConfirmado: boolean;
}

export interface OpcoesPedido {
  pagamentoConfirmado?: boolean;
  ultimoOperador?: string;
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
  private pagamentoConfirmado: boolean;

  constructor(
    id: string,
    aluno: DadosAluno,
    itens: ItemCarrinho[],
    valorTotal: number,
    resultadoCheckout: ResultadoCheckout,
    tempoEstimadoMinutos: number,
    statusInicial: StatusPedido = 'Recebido',
    horarioCriacao?: string,
    opcoes: OpcoesPedido = {}
  ) {
    if (typeof id !== 'string' || id.trim() === '') throw new ErroValidacao('Pedido sem identificador.');
    const dadosAluno = exigirValido(validarDadosAluno(aluno?.nome, aluno?.matricula));
    if (!Array.isArray(itens) || itens.length === 0) {
      throw new ErroRegraNegocio('Um pedido precisa ter pelo menos um item.');
    }
    if (!itens.every((item) => item instanceof ItemCarrinho)) {
      throw new ErroValidacao('Itens do pedido inválidos.');
    }
    if (!Number.isFinite(valorTotal) || valorTotal < 0) {
      throw new ErroValidacao('Valor total do pedido inválido.');
    }
    if (!Number.isFinite(tempoEstimadoMinutos) || tempoEstimadoMinutos < 0) {
      throw new ErroValidacao('Tempo estimado do pedido inválido.');
    }
    if (!ehStatusPedido(statusInicial)) throw new ErroValidacao('Status de pedido desconhecido.');

    this.id = id.trim();
    this.alunoNome = dadosAluno.nome;
    this.alunoMatricula = dadosAluno.matricula;
    // Congela os itens: editar o cardápio depois não muda o que foi pedido.
    this.itens = itens.map((item) => item.congelar());
    this.valorTotal = arredondarCentavos(valorTotal);
    this.resultadoCheckout = validarResultadoCheckout(resultadoCheckout);
    this.tempoEstimadoNoFechamentoMinutos = Math.round(tempoEstimadoMinutos);
    this.status = statusInicial;
    this.ultimoOperadorResponsavel = textoLimpo(opcoes.ultimoOperador) || 'Autoatendimento Digital';
    this.pagamentoConfirmado =
      statusInicial === 'Entregue' ||
      (opcoes.pagamentoConfirmado ?? this.resultadoCheckout.statusFinanceiro === 'PAGO_NO_APP');
    this.horarioCriacao =
      textoLimpo(horarioCriacao) ||
      new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  private garantirStatusEsperado(statusEsperado?: StatusPedido): void {
    if (statusEsperado !== undefined && statusEsperado !== this.status) {
      throw new ErroConflito(
        `O pedido ${this.obterCodigoTicket()} já estava como "${this.status}". A tela foi atualizada.`
      );
    }
  }

  private registrarOperador(nomeOperador?: string): void {
    const nome = textoLimpo(nomeOperador);
    if (nome) this.ultimoOperadorResponsavel = nome;
  }

  /**
   * Avança uma etapa. `statusEsperado` evita que um duplo clique (ou outra aba)
   * pule etapas: se o pedido já mudou, a ação é recusada com ErroConflito.
   */
  public avancarStatus(nomeOperador?: string, statusEsperado?: StatusPedido): StatusPedido {
    this.garantirStatusEsperado(statusEsperado);
    const ticket = this.obterCodigoTicket();

    switch (this.status) {
      case 'Recebido':
        this.status = 'Fazendo';
        break;
      case 'Fazendo':
        this.status = 'Pronto para Retirada';
        break;
      case 'Pronto para Retirada':
        if (!this.pagamentoConfirmado) {
          throw new ErroRegraNegocio(
            `Registre o pagamento de ${formatarMoedaDominio(this.valorTotal)} no caixa antes de entregar o pedido ${ticket}.`
          );
        }
        this.status = 'Entregue';
        break;
      case 'Entregue':
        throw new ErroRegraNegocio(`O pedido ${ticket} já foi entregue.`);
      case 'Cancelado':
        throw new ErroRegraNegocio(`O pedido ${ticket} foi cancelado e não pode avançar.`);
    }

    this.registrarOperador(nomeOperador);
    return this.status;
  }

  public confirmarPagamentoNoCaixa(nomeOperador?: string): void {
    const ticket = this.obterCodigoTicket();
    if (this.status === 'Cancelado') throw new ErroRegraNegocio(`O pedido ${ticket} foi cancelado.`);
    if (this.pagamentoConfirmado) {
      throw new ErroRegraNegocio(`O pagamento do pedido ${ticket} já estava confirmado.`);
    }
    this.pagamentoConfirmado = true;
    this.registrarOperador(nomeOperador);
  }

  public cancelar(nomeOperador?: string, statusEsperado?: StatusPedido): void {
    this.garantirStatusEsperado(statusEsperado);
    const ticket = this.obterCodigoTicket();
    if (this.status === 'Entregue') throw new ErroRegraNegocio(`O pedido ${ticket} já foi entregue.`);
    if (this.status === 'Cancelado') throw new ErroRegraNegocio(`O pedido ${ticket} já estava cancelado.`);
    this.status = 'Cancelado';
    this.registrarOperador(nomeOperador);
  }

  public estaAtivoNaCozinha(): boolean {
    return this.status === 'Recebido' || this.status === 'Fazendo';
  }

  /** Ainda não foi entregue nem cancelado. */
  public estaEmAberto(): boolean {
    return this.status !== 'Entregue' && this.status !== 'Cancelado';
  }

  public calcularCargaCozinhaAtivaMinutos(): number {
    if (!this.estaAtivoNaCozinha()) return 0;
    let cargaTotal = 0;
    for (const item of this.itens) cargaTotal += item.calcularCargaCozinhaTotalItem();
    if (this.status === 'Fazendo') return Math.ceil(cargaTotal * 0.65);
    return cargaTotal;
  }

  public contemItensCozinha(): boolean {
    return this.itens.some((item) => item.utilizaGargaloCozinha());
  }

  public serializar(): PedidoSerializado {
    return {
      id: this.id,
      aluno: { nome: this.alunoNome, matricula: this.alunoMatricula },
      itens: this.itens.map((item) => item.serializar()),
      valorTotal: this.valorTotal,
      resultadoCheckout: { ...this.resultadoCheckout },
      tempoEstimadoMinutos: this.tempoEstimadoNoFechamentoMinutos,
      status: this.status,
      horarioCriacao: this.horarioCriacao,
      ultimoOperador: this.ultimoOperadorResponsavel,
      pagamentoConfirmado: this.pagamentoConfirmado,
    };
  }

  public static restaurar(dados: unknown): Pedido {
    if (!ehObjeto(dados)) throw new ErroValidacao('Pedido salvo em formato inválido.');
    if (!Array.isArray(dados.itens)) throw new ErroValidacao('Pedido salvo sem itens.');
    const aluno = ehObjeto(dados.aluno) ? dados.aluno : {};
    return new Pedido(
      String(dados.id ?? ''),
      { nome: String(aluno.nome ?? ''), matricula: String(aluno.matricula ?? '') },
      dados.itens.map((item) => ItemCarrinho.restaurar(item)),
      Number(dados.valorTotal),
      dados.resultadoCheckout as ResultadoCheckout,
      Number(dados.tempoEstimadoMinutos),
      dados.status as StatusPedido,
      typeof dados.horarioCriacao === 'string' ? dados.horarioCriacao : undefined,
      {
        pagamentoConfirmado:
          typeof dados.pagamentoConfirmado === 'boolean' ? dados.pagamentoConfirmado : undefined,
        ultimoOperador: typeof dados.ultimoOperador === 'string' ? dados.ultimoOperador : undefined,
      }
    );
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

  public estaPagamentoConfirmado(): boolean {
    return this.pagamentoConfirmado;
  }

  public obterEtiquetaOperacionalKDS(): string {
    if (this.resultadoCheckout.statusFinanceiro === 'PAGAR_NO_CAIXA' && this.pagamentoConfirmado) {
      return 'PAGO NO CAIXA — Liberar na Fila do Caixa';
    }
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

/* ==========================================================================
   Cálculo de gargalo da cozinha
   ========================================================================== */

export interface DiagnosticoCarrinho {
  tempoBaseItens: number;
  acrescimoGargaloCozinha: number;
  tempoTotalEstimadoMinutos: number;
  ultrapassaLimiteSeguranca: boolean;
  pedidosAtivosNaChapa: number;
}

export class CalculadoraGargaloFila {
  private readonly limiteAlertaIntervaloMinutos: number = 12;

  public calcularMinutosGargaloCozinha(pedidos: Pedido[]): number {
    let cargaAcumuladaMinutos = 0;
    for (const pedido of pedidos) {
      const carga = pedido.calcularCargaCozinhaAtivaMinutos();
      if (Number.isFinite(carga) && carga > 0) cargaAcumuladaMinutos += carga;
    }
    return cargaAcumuladaMinutos;
  }

  public contarPedidosAtivosNaCozinha(pedidos: Pedido[]): number {
    return pedidos.filter((p) => p.estaAtivoNaCozinha() && p.contemItensCozinha()).length;
  }

  public calcularTempoEstimadoProduto(produto: Produto, pedidosAtivos: Pedido[]): number {
    const tempoBase = produto.obterTempoBaseMinutos();
    if (!produto.utilizaGargaloCozinha()) return tempoBase;
    return tempoBase + this.calcularMinutosGargaloCozinha(pedidosAtivos);
  }

  public diagnosticarCarrinho(carrinho: Carrinho, pedidosAtivos: Pedido[]): DiagnosticoCarrinho {
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
      maiorTempoBase = Math.max(maiorTempoBase, item.obterTempoBaseItem());
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

/* ==========================================================================
   Gerenciador de pedidos
   ========================================================================== */

function numeroDoPedido(pedido: Pedido): number {
  const encontrado = /(\d+)$/.exec(pedido.obterId());
  return encontrado ? Number(encontrado[1]) : 0;
}

export interface EstadoPedidosSerializado {
  pedidos: PedidoSerializado[];
  sequencialTicket: number;
}

export class GerenciadorPedidos {
  private pedidos: Pedido[] = [];
  private sequencialTicket: number = 102;

  constructor(pedidosIniciais: Pedido[] = [], sequencialInicial: number = 102) {
    this.substituirEstado(pedidosIniciais, sequencialInicial);
  }

  /** Troca todo o estado (usado ao restaurar dados salvos ou sincronizar abas). */
  public substituirEstado(pedidos: Pedido[], sequencialTicket: number): void {
    const idsVistos = new Set<string>();
    this.pedidos = pedidos.filter((pedido) => {
      if (!(pedido instanceof Pedido) || idsVistos.has(pedido.obterId())) return false;
      idsVistos.add(pedido.obterId());
      return true;
    });
    const maiorExistente = this.pedidos.reduce((maior, p) => Math.max(maior, numeroDoPedido(p)), 0);
    const informado = Number.isInteger(sequencialTicket) && sequencialTicket > 0 ? sequencialTicket : 0;
    this.sequencialTicket = Math.max(informado, maiorExistente);
  }

  public finalizarPedido(
    aluno: DadosAluno,
    carrinho: Carrinho,
    processadorCheckout: ProcessadorCheckout,
    calculadoraGargalo: CalculadoraGargaloFila
  ): Pedido {
    // 1) Validações — nada é alterado até todas passarem.
    const dadosAluno = exigirValido(validarDadosAluno(aluno?.nome, aluno?.matricula));
    if (carrinho.estaVazio()) {
      throw new ErroRegraNegocio('Seu carrinho está vazio. Adicione pelo menos um item.');
    }
    const indisponiveis = carrinho.obterItensIndisponiveis();
    if (indisponiveis.length > 0) {
      const nomes = indisponiveis.map((i) => i.obterNomeProduto()).join(', ');
      throw new ErroRegraNegocio(`Esgotou enquanto você escolhia: ${nomes}. Remova do carrinho para continuar.`);
    }
    if (!processadorCheckout || typeof processadorCheckout.processarCheckout !== 'function') {
      throw new ErroValidacao('Escolha uma forma de pagamento.', 'pagamento');
    }
    const matricula = dadosAluno.matricula.toLowerCase();
    const emAbertoDoAluno = this.pedidos.filter(
      (p) => p.estaEmAberto() && p.obterAlunoMatricula().toLowerCase() === matricula
    ).length;
    if (emAbertoDoAluno >= LIMITES.pedidosEmAbertoPorAluno) {
      throw new ErroRegraNegocio(
        `A matrícula ${dadosAluno.matricula} já tem ${emAbertoDoAluno} pedidos em andamento. Retire um deles antes de fazer outro.`
      );
    }

    // 2) Monta o pedido usando o PRÓXIMO número, sem consumi-lo ainda.
    let proximoNumero = this.sequencialTicket + 1;
    while (this.buscarPedidoPorId(`ped-${proximoNumero}`)) proximoNumero += 1;

    const valorTotal = carrinho.calcularValorTotal();
    const diagnosticoTempo = calculadoraGargalo.diagnosticarCarrinho(carrinho, this.pedidos);
    const resultadoCheckout = processadorCheckout.processarCheckout(valorTotal, proximoNumero);
    const novoPedido = new Pedido(
      `ped-${proximoNumero}`,
      dadosAluno,
      carrinho.obterItens(),
      valorTotal,
      resultadoCheckout,
      diagnosticoTempo.tempoTotalEstimadoMinutos,
      'Recebido'
    );

    // 3) Só agora confirma as mudanças (se algo acima falhar, o carrinho continua intacto).
    this.sequencialTicket = proximoNumero;
    this.pedidos = [novoPedido, ...this.pedidos];
    this.aplicarLimiteHistorico();
    carrinho.limpar();
    return novoPedido;
  }

  private exigirPedido(pedidoId: string): Pedido {
    const pedido = this.buscarPedidoPorId(pedidoId);
    if (!pedido) throw new ErroNaoEncontrado('Este pedido não existe mais. A lista foi atualizada.');
    return pedido;
  }

  public avancarStatusPedido(pedidoId: string, operadorNome: string, statusEsperado?: StatusPedido): Pedido {
    const pedido = this.exigirPedido(pedidoId);
    pedido.avancarStatus(operadorNome, statusEsperado);
    return pedido;
  }

  public confirmarPagamentoPedido(pedidoId: string, operadorNome: string): Pedido {
    const pedido = this.exigirPedido(pedidoId);
    pedido.confirmarPagamentoNoCaixa(operadorNome);
    return pedido;
  }

  public cancelarPedido(pedidoId: string, operadorNome: string, statusEsperado?: StatusPedido): Pedido {
    const pedido = this.exigirPedido(pedidoId);
    pedido.cancelar(operadorNome, statusEsperado);
    return pedido;
  }

  /** Mantém todos os pedidos em aberto e só os finalizados mais recentes. */
  private aplicarLimiteHistorico(): void {
    const limite = LIMITES.historicoMaximoPedidos;
    if (this.pedidos.length <= limite) return;
    const emAberto = this.pedidos.filter((p) => p.estaEmAberto());
    const vagas = Math.max(0, limite - emAberto.length);
    const finalizadosMantidos = new Set(
      this.pedidos.filter((p) => !p.estaEmAberto()).slice(0, vagas)
    );
    this.pedidos = this.pedidos.filter((p) => p.estaEmAberto() || finalizadosMantidos.has(p));
  }

  public obterTodosPedidos(): Pedido[] {
    return [...this.pedidos];
  }

  public obterSequencialTicket(): number {
    return this.sequencialTicket;
  }

  public buscarPedidoPorId(pedidoId: string): Pedido | undefined {
    return this.pedidos.find((p) => p.obterId() === pedidoId);
  }

  public serializar(): EstadoPedidosSerializado {
    return {
      pedidos: this.pedidos.map((p) => p.serializar()),
      sequencialTicket: this.sequencialTicket,
    };
  }
}

/* ==========================================================================
   Dados de demonstração
   ========================================================================== */

export function criarCardapioInicial(): Produto[] {
  return [
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
}

export function criarDadosIniciaisCantina(): {
  cardapioInicial: Produto[];
  gerenciadorInicial: GerenciadorPedidos;
  processadoresDisponiveis: ProcessadorCheckout[];
} {
  const cardapioInicial = criarCardapioInicial();
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

  return {
    cardapioInicial,
    gerenciadorInicial: new GerenciadorPedidos([pedidoEmAndamento2, pedidoEmAndamento1], 102),
    processadoresDisponiveis: [pagamentoApp, pagamentoLoja],
  };
}
