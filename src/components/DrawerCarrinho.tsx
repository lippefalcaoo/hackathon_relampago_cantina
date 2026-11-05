import React from 'react';
import {
  ShoppingBag,
  X,
  Ban,
  Minus,
  Plus,
  Trash2,
  AlertTriangle,
  ArrowRight,
  Clock,
} from 'lucide-react';
import {
  DiagnosticoCarrinho,
  ItemCarrinho,
  LIMITES,
  ProcessadorCheckout,
} from '../domain/cantinaDomain';
import { formatarMoeda } from '../utils/formatadores';

interface DrawerCarrinhoProps {
  aberto: boolean;
  alunoNome: string;
  itensCarrinho: ItemCarrinho[];
  itensIndisponiveis: ItemCarrinho[];
  valorTotal: number;
  carrinhoNoLimite: boolean;
  diagnosticoCarrinho: DiagnosticoCarrinho;
  processadoresCheckout: ProcessadorCheckout[];
  codigoMetodoSelecionado: string;
  aoSelecionarMetodo: (codigo: string) => void;
  aoAlterarQuantidade: (produtoId: string, novaQtd: number) => void;
  aoRemoverItem: (produtoId: string) => void;
  aoSubstituirChapaPorEstufa: () => void;
  aoFinalizarPedido: (e: React.FormEvent) => void;
  aoFechar: () => void;
}

export function DrawerCarrinho({
  aberto,
  alunoNome,
  itensCarrinho,
  itensIndisponiveis,
  valorTotal,
  carrinhoNoLimite,
  diagnosticoCarrinho,
  processadoresCheckout,
  codigoMetodoSelecionado,
  aoSelecionarMetodo,
  aoAlterarQuantidade,
  aoRemoverItem,
  aoSubstituirChapaPorEstufa,
  aoFinalizarPedido,
  aoFechar,
}: DrawerCarrinhoProps) {
  if (!aberto) return null;

  return (
    <div
      className="fixed inset-0 z-40 flex justify-end bg-slate-950/50 backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget) aoFechar();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Carrinho de compras"
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden"
      >
        {/* Cabeçalho do Drawer */}
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-[#FF6B00]" />
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 font-display">
                Sua Sacola
              </h2>
              <p className="text-xs text-slate-500">{alunoNome}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={aoFechar}
            aria-label="Fechar carrinho"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo do Carrinho */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {itensCarrinho.length === 0 ? (
            <div className="py-14 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-800">
                Sua sacola está vazia
              </p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Escolha um lanche na vitrine para ver a previsão inteligente de preparo.
              </p>
            </div>
          ) : (
            <>
              {itensIndisponiveis.length > 0 && (
                <div
                  role="alert"
                  className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-2.5"
                >
                  <Ban className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-xs font-extrabold text-red-900">
                      Esgotou enquanto você escolhia
                    </p>
                    <p className="text-xs text-red-800 leading-relaxed">
                      Remova{' '}
                      {itensIndisponiveis.map((i) => i.obterNomeProduto()).join(', ')}{' '}
                      para confirmar o pedido.
                    </p>
                  </div>
                </div>
              )}

              {/* Lista de Itens */}
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl px-4">
                {itensCarrinho.map((item) => {
                  const prod = item.obterProduto();
                  const indisponivel = !prod.estaDisponivel();
                  const noLimiteDoItem =
                    item.obterQuantidade() >= LIMITES.quantidadePorItem ||
                    carrinhoNoLimite;

                  return (
                    <div
                      key={item.obterProdutoId()}
                      className="py-3.5 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p
                          className={`text-sm font-bold truncate ${
                            indisponivel
                              ? 'text-red-700 line-through'
                              : 'text-slate-900'
                          }`}
                        >
                          {item.obterNomeProduto()}
                        </p>
                        <p className="text-xs text-slate-500 font-mono tabular-nums">
                          {formatarMoeda(item.obterPrecoUnitario())}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() =>
                            aoAlterarQuantidade(
                              item.obterProdutoId(),
                              item.obterQuantidade() - 1
                            )
                          }
                          aria-label={`Diminuir ${item.obterNomeProduto()}`}
                          className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-mono tabular-nums font-bold">
                          {item.obterQuantidade()}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            aoAlterarQuantidade(
                              item.obterProdutoId(),
                              item.obterQuantidade() + 1
                            )
                          }
                          disabled={noLimiteDoItem || indisponivel}
                          aria-label={`Aumentar ${item.obterNomeProduto()}`}
                          className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => aoRemoverItem(item.obterProdutoId())}
                          aria-label={`Remover ${item.obterNomeProduto()}`}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Estimativa Inteligente enxuta (com Média Móvel) */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-[#FF6B00]" />
                  <div>
                    <p className="text-xs font-extrabold text-slate-900">
                      Previsão baseada no movimento atual
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {diagnosticoCarrinho.mediaMovelPreparoMinutos !== null
                        ? `Média móvel dos últimos pedidos: ~${diagnosticoCarrinho.mediaMovelPreparoMinutos} min`
                        : 'Calculada pela fila atual da cozinha'}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-base font-extrabold font-mono tabular-nums ${
                    diagnosticoCarrinho.ultrapassaLimiteSeguranca
                      ? 'text-red-600'
                      : 'text-emerald-700'
                  }`}
                >
                  ~{diagnosticoCarrinho.tempoTotalEstimadoMinutos} min
                </span>
              </div>

              {/* Alerta de intervalo quando ultrapassa 12 minutos */}
              {diagnosticoCarrinho.ultrapassaLimiteSeguranca && (
                <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 space-y-3">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-xs font-extrabold text-amber-950">
                        Fila alta na chapa (~
                        {diagnosticoCarrinho.tempoTotalEstimadoMinutos} min)
                      </p>
                      <p className="text-xs text-amber-900 leading-relaxed">
                        Para não atrasar no intervalo de 15 min, você pode trocar por um item pronto da estufa (~1 a 2 min).
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={aoSubstituirChapaPorEstufa}
                    className="w-full py-2 px-3 text-xs font-bold text-amber-950 bg-amber-200/80 hover:bg-amber-300/80 rounded-xl transition-colors cursor-pointer"
                  >
                    Trocar por opção rápida da Estufa (~1 a 2 min)
                  </button>
                </div>
              )}

              {/* Escolha direta de pagamento */}
              <div className="space-y-2">
                <p className="text-xs font-extrabold text-slate-900">
                  Como prefere pagar?
                </p>
                <div className="space-y-2">
                  {processadoresCheckout.map((proc) => {
                    const codigo = proc.obterCodigo();
                    const selecionado = codigoMetodoSelecionado === codigo;
                    const ehNoApp = codigo === 'PAGAR_NO_APP';

                    return (
                      <label
                        key={codigo}
                        className={`flex items-start gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                          selecionado
                            ? 'border-[#FF6B00] bg-orange-50/40'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <input
                          type="radio"
                          name="opcaoPagamentoCheckout"
                          value={codigo}
                          checked={selecionado}
                          onChange={() => aoSelecionarMetodo(codigo)}
                          className="mt-1 accent-[#FF6B00]"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-extrabold text-slate-900">
                            {proc.obterNomeExibicao()}
                          </p>
                          <p
                            className={`text-[11px] font-bold mt-0.5 ${
                              ehNoApp ? 'text-emerald-700' : 'text-amber-700'
                            }`}
                          >
                            Retirada: {proc.obterTipoFilaGerada()}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Rodapé do Drawer */}
        <form
          onSubmit={aoFinalizarPedido}
          className="p-6 bg-slate-50 border-t border-slate-200 space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">Total</span>
            <span className="text-xl font-extrabold text-slate-900 font-mono tabular-nums">
              {formatarMoeda(valorTotal)}
            </span>
          </div>

          <button
            type="submit"
            disabled={itensCarrinho.length === 0 || itensIndisponiveis.length > 0}
            className="w-full py-3.5 px-5 text-sm font-extrabold text-white bg-[#FF6B00] hover:bg-orange-600 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Confirmar Pedido</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
