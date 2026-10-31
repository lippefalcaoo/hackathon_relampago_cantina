/**
 * Persistência local da Fast-Track Cantina.
 *
 * - Salva cardápio, pedidos e perfis no localStorage para sobreviver a um F5.
 * - Nunca derruba a aplicação: navegador sem storage (modo privado, cota cheia,
 *   bloqueio de cookies) apenas desativa o salvamento e avisa o usuário.
 * - Dados corrompidos ou de versão antiga são ignorados item a item; o JSON
 *   original é guardado numa chave de backup para análise.
 * - Avisa quando outra aba (ex.: o KDS da cozinha) altera os dados.
 */

import {
  DadosAluno,
  DadosOperador,
  GerenciadorPedidos,
  Pedido,
  Produto,
  validarDadosAluno,
  validarDadosOperador,
} from '../domain/cantinaDomain';

const CHAVE_ESTADO = 'fast-track-cantina:estado';
const CHAVE_BACKUP_CORROMPIDO = 'fast-track-cantina:estado-corrompido';
const VERSAO_ESQUEMA = 1;

export interface EstadoCantina {
  cardapio: Produto[];
  gerenciador: GerenciadorPedidos;
  perfilAluno: DadosAluno | null;
  perfilOperador: DadosOperador | null;
}

export interface ResultadoCarregamento {
  /** null quando não há nada salvo (ou nada aproveitável). */
  estado: EstadoCantina | null;
  avisos: string[];
}

let storageEmCache: Storage | null | undefined;

/** Retorna o localStorage só se ele realmente funcionar (testa escrita). */
export function obterStorage(): Storage | null {
  if (storageEmCache !== undefined) return storageEmCache;
  try {
    const storage = window.localStorage;
    const chaveTeste = '__fast-track-teste__';
    storage.setItem(chaveTeste, '1');
    storage.removeItem(chaveTeste);
    storageEmCache = storage;
  } catch {
    storageEmCache = null;
  }
  return storageEmCache;
}

function ehObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === 'object' && valor !== null && !Array.isArray(valor);
}

function plural(qtd: number, singular: string, pluralTexto: string): string {
  return `${qtd} ${qtd === 1 ? singular : pluralTexto}`;
}

/** Restaura uma lista item a item: um registro ruim não derruba os outros. */
function restaurarLista<T>(dados: unknown, restaurar: (item: unknown) => T): { itens: T[]; descartados: number } {
  if (!Array.isArray(dados)) return { itens: [], descartados: 0 };
  const itens: T[] = [];
  let descartados = 0;
  for (const bruto of dados) {
    try {
      itens.push(restaurar(bruto));
    } catch (erro) {
      descartados += 1;
      console.warn('[persistência] registro descartado:', erro, bruto);
    }
  }
  return { itens, descartados };
}

/** Interpreta o texto salvo. Separado de `carregarEstado` para ser reutilizado na sincronização entre abas. */
export function interpretarEstadoSalvo(
  texto: string | null,
  opcoes: { guardarBackup?: boolean } = {}
): ResultadoCarregamento {
  // Na sincronização entre abas não mexemos no storage: só lemos.
  const guardarBackup = opcoes.guardarBackup ?? true;
  const registrarBackup = (conteudo: string) => {
    if (guardarBackup) guardarBackupCorrompido(conteudo);
  };
  if (texto === null || texto.trim() === '') return { estado: null, avisos: [] };

  let bruto: unknown;
  try {
    bruto = JSON.parse(texto);
  } catch {
    registrarBackup(texto);
    return {
      estado: null,
      avisos: ['Os dados salvos neste navegador estavam corrompidos. A cantina foi reiniciada com o cardápio padrão.'],
    };
  }

  if (!ehObjeto(bruto) || bruto.versao !== VERSAO_ESQUEMA) {
    registrarBackup(texto);
    return {
      estado: null,
      avisos: ['Os dados salvos eram de uma versão antiga do app e foram descartados.'],
    };
  }

  const avisos: string[] = [];
  const cardapio = restaurarLista(bruto.cardapio, (item) => Produto.restaurar(item));
  const pedidos = restaurarLista(bruto.pedidos, (item) => Pedido.restaurar(item));

  if (cardapio.descartados > 0) {
    avisos.push(`${plural(cardapio.descartados, 'produto salvo estava inválido', 'produtos salvos estavam inválidos')} e foi ignorado.`);
  }
  if (pedidos.descartados > 0) {
    avisos.push(`${plural(pedidos.descartados, 'pedido salvo estava inválido', 'pedidos salvos estavam inválidos')} e foi ignorado.`);
  }

  // Sem nenhum produto válido não há como operar: volta para os dados padrão.
  if (cardapio.itens.length === 0) {
    if (cardapio.descartados > 0) registrarBackup(texto);
    return { estado: null, avisos };
  }

  const idsUnicos = new Set<string>();
  const cardapioSemDuplicados = cardapio.itens.filter((produto) => {
    if (idsUnicos.has(produto.obterId())) return false;
    idsUnicos.add(produto.obterId());
    return true;
  });

  const perfilAluno = ehObjeto(bruto.perfilAluno)
    ? validarDadosAluno(bruto.perfilAluno.nome, bruto.perfilAluno.matricula)
    : null;
  const perfilOperador = ehObjeto(bruto.perfilOperador)
    ? validarDadosOperador(bruto.perfilOperador.nome, bruto.perfilOperador.id)
    : null;

  return {
    estado: {
      cardapio: cardapioSemDuplicados,
      gerenciador: new GerenciadorPedidos(pedidos.itens, Number(bruto.sequencialTicket)),
      perfilAluno: perfilAluno?.ok ? perfilAluno.valor : null,
      perfilOperador: perfilOperador?.ok ? perfilOperador.valor : null,
    },
    avisos,
  };
}

export function carregarEstado(): ResultadoCarregamento {
  const storage = obterStorage();
  if (!storage) return { estado: null, avisos: [] };
  try {
    return interpretarEstadoSalvo(storage.getItem(CHAVE_ESTADO));
  } catch (erro) {
    console.error('[persistência] falha ao ler dados salvos:', erro);
    return { estado: null, avisos: ['Não foi possível ler os dados salvos. A cantina abriu com o cardápio padrão.'] };
  }
}

/** Gera o texto a ser salvo. Determinístico (sem data/hora) para evitar loop entre abas. */
export function serializarEstado(estado: EstadoCantina): string {
  const { pedidos, sequencialTicket } = estado.gerenciador.serializar();
  return JSON.stringify({
    versao: VERSAO_ESQUEMA,
    cardapio: estado.cardapio.map((p) => p.serializar()),
    pedidos,
    sequencialTicket,
    perfilAluno: estado.perfilAluno,
    perfilOperador: estado.perfilOperador,
  });
}

export type ResultadoSalvamento = { ok: true } | { ok: false; motivo: string };

export function salvarTexto(texto: string): ResultadoSalvamento {
  const storage = obterStorage();
  if (!storage) {
    return { ok: false, motivo: 'Este navegador não permite salvar dados (modo privado ou cookies bloqueados).' };
  }
  try {
    storage.setItem(CHAVE_ESTADO, texto);
    return { ok: true };
  } catch (erro) {
    const nome = erro instanceof DOMException ? erro.name : '';
    const motivo =
      nome === 'QuotaExceededError' || nome === 'NS_ERROR_DOM_QUOTA_REACHED'
        ? 'O espaço de armazenamento do navegador está cheio.'
        : 'O navegador recusou o salvamento.';
    console.error('[persistência] falha ao salvar:', erro);
    return { ok: false, motivo };
  }
}

export function limparEstadoSalvo(): void {
  const storage = obterStorage();
  if (!storage) return;
  try {
    storage.removeItem(CHAVE_ESTADO);
  } catch (erro) {
    console.error('[persistência] falha ao limpar dados:', erro);
  }
}

function guardarBackupCorrompido(texto: string): void {
  const storage = obterStorage();
  if (!storage) return;
  try {
    storage.setItem(CHAVE_BACKUP_CORROMPIDO, texto);
    storage.removeItem(CHAVE_ESTADO);
  } catch {
    // Backup é "melhor esforço": se não couber, seguimos sem ele.
  }
}

/**
 * Observa alterações feitas por OUTRA aba/janela do mesmo navegador
 * (o evento `storage` não dispara na aba que fez a alteração).
 */
export function observarAlteracoesExternas(aoAlterar: (novoTexto: string | null) => void): () => void {
  if (typeof window === 'undefined') return () => undefined;
  const ouvinte = (evento: StorageEvent) => {
    if (evento.key === CHAVE_ESTADO || evento.key === null) aoAlterar(evento.newValue);
  };
  window.addEventListener('storage', ouvinte);
  return () => window.removeEventListener('storage', ouvinte);
}
