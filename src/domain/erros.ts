/**
 * Erros de domínio da Fast-Track Cantina.
 *
 * Toda regra violada no domínio lança um ErroCantina (ou subclasse). Assim a
 * interface consegue diferenciar um erro esperado (dado inválido, regra de
 * negócio) de um bug inesperado, e mostrar a mensagem certa para cada caso.
 */

export type CodigoErroCantina =
  | 'VALIDACAO'
  | 'REGRA_NEGOCIO'
  | 'NAO_ENCONTRADO'
  | 'CONFLITO'
  | 'PERSISTENCIA';

export class ErroCantina extends Error {
  public readonly codigo: CodigoErroCantina;
  /** Campo de formulário relacionado ao erro, quando houver. */
  public readonly campo?: string;

  constructor(codigo: CodigoErroCantina, mensagem: string, campo?: string) {
    super(mensagem);
    this.name = 'ErroCantina';
    this.codigo = codigo;
    this.campo = campo;
    // Garante que `instanceof` funcione mesmo em alvos de compilação antigos.
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/** Dado de entrada inválido (nome curto, preço negativo, quantidade não numérica...). */
export class ErroValidacao extends ErroCantina {
  constructor(mensagem: string, campo?: string) {
    super('VALIDACAO', mensagem, campo);
    this.name = 'ErroValidacao';
  }
}

/** Operação válida em formato, mas proibida pela regra do negócio. */
export class ErroRegraNegocio extends ErroCantina {
  constructor(mensagem: string) {
    super('REGRA_NEGOCIO', mensagem);
    this.name = 'ErroRegraNegocio';
  }
}

/** Pedido, produto ou item que não existe (ou não existe mais). */
export class ErroNaoEncontrado extends ErroCantina {
  constructor(mensagem: string) {
    super('NAO_ENCONTRADO', mensagem);
    this.name = 'ErroNaoEncontrado';
  }
}

/** O estado mudou entre a tela ser desenhada e a ação ser executada (ex.: duplo clique). */
export class ErroConflito extends ErroCantina {
  constructor(mensagem: string) {
    super('CONFLITO', mensagem);
    this.name = 'ErroConflito';
  }
}

export function ehErroCantina(erro: unknown): erro is ErroCantina {
  return erro instanceof ErroCantina;
}

const TITULOS_POR_CODIGO: Record<CodigoErroCantina, string> = {
  VALIDACAO: 'Revise os dados informados',
  REGRA_NEGOCIO: 'Ação não permitida',
  NAO_ENCONTRADO: 'Item não encontrado',
  CONFLITO: 'A tela estava desatualizada',
  PERSISTENCIA: 'Não foi possível salvar',
};

/**
 * Converte qualquer erro em um texto amigável para o usuário.
 * Erros desconhecidos recebem uma mensagem genérica (o detalhe técnico vai só
 * para o console, nunca para a tela).
 */
export function descreverErro(
  erro: unknown,
  contexto: string
): { titulo: string; detalhe: string; esperado: boolean } {
  if (ehErroCantina(erro)) {
    return { titulo: TITULOS_POR_CODIGO[erro.codigo], detalhe: erro.message, esperado: true };
  }
  return {
    titulo: `Erro inesperado ao ${contexto}`,
    detalhe: 'Nada foi alterado. Tente de novo; se continuar, recarregue a página.',
    esperado: false,
  };
}
