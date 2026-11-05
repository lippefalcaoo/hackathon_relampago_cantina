import React from 'react';
import { Flame, Zap, Plus, Minus, Ban } from 'lucide-react';
import { LIMITES, Produto } from '../domain/cantinaDomain';
import { formatarMoeda } from '../utils/formatadores';

export interface MenuCardProps {
  produto: Produto;
  tempoEstimadoMinutos: number;
  quantidadeNaSacola: number;
  carrinhoNoLimite: boolean;
  aoPedir: (produto: Produto) => void;
  aoAlterarQuantidade?: (produtoId: string, novaQtd: number) => void;
}

/**
 * Card enxuto de item do cardápio para exibição dentro das categorias sanfonadas (Accordion).
 * Foco em baixa carga visual: nome, tempo estimado dinâmico, preço e botão direto "Pedir".
 */
export function MenuCard({
  produto,
  tempoEstimadoMinutos,
  quantidadeNaSacola,
  carrinhoNoLimite,
  aoPedir,
  aoAlterarQuantidade,
}: MenuCardProps) {
  const disponivel = produto.estaDisponivel();
  const ehCozinha = produto.utilizaGargaloCozinha();
  const noLimiteItem =
    quantidadeNaSacola >= LIMITES.quantidadePorItem || carrinhoNoLimite;

  return (
    <div
      className={`flex items-center justify-between gap-3 p-3.5 rounded-xl border transition-all ${
        !disponivel
          ? 'bg-slate-50 border-slate-200 opacity-60'
          : quantidadeNaSacola > 0
          ? 'bg-orange-50/40 border-[#FF6B00] shadow-2xs'
          : 'bg-white border-slate-200/90 hover:border-slate-300'
      }`}
    >
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <h4 className="text-sm font-bold text-slate-900 leading-snug">
            {produto.obterNome()}
          </h4>

          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold ${
              ehCozinha
                ? 'bg-amber-100/80 text-amber-900'
                : 'bg-emerald-100/80 text-emerald-900'
            }`}
          >
            {ehCozinha ? (
              <Flame className="w-3 h-3 text-amber-600 shrink-0" />
            ) : (
              <Zap className="w-3 h-3 text-emerald-600 shrink-0" />
            )}
            <span>~{tempoEstimadoMinutos} min</span>
          </span>
        </div>

        <p className="text-sm font-extrabold font-mono tabular-nums text-slate-900">
          {formatarMoeda(produto.obterPreco())}
        </p>
      </div>

      <div className="shrink-0">
        {!disponivel ? (
          <span className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-500 bg-slate-100 rounded-lg">
            <Ban className="w-3.5 h-3.5" />
            <span>Esgotado</span>
          </span>
        ) : quantidadeNaSacola > 0 && aoAlterarQuantidade ? (
          <div className="inline-flex items-center gap-1.5 bg-white border border-orange-300 rounded-xl px-1.5 py-1 shadow-2xs">
            <button
              type="button"
              onClick={() =>
                aoAlterarQuantidade(produto.obterId(), quantidadeNaSacola - 1)
              }
              aria-label={`Diminuir ${produto.obterNome()}`}
              className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center cursor-pointer"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-6 text-center font-mono tabular-nums font-extrabold text-xs text-slate-900">
              {quantidadeNaSacola}
            </span>
            <button
              type="button"
              onClick={() => aoPedir(produto)}
              disabled={noLimiteItem}
              aria-label={`Adicionar mais ${produto.obterNome()}`}
              className="w-7 h-7 rounded-lg bg-[#FF6B00] hover:bg-orange-600 disabled:bg-slate-300 text-white flex items-center justify-center cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => aoPedir(produto)}
            disabled={carrinhoNoLimite}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-extrabold text-white bg-slate-900 hover:bg-[#FF6B00] disabled:bg-slate-300 disabled:cursor-not-allowed rounded-xl transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Pedir</span>
          </button>
        )}
      </div>
    </div>
  );
}
