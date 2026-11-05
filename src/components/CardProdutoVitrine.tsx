import React from 'react';
import { Flame, Zap, Plus, Ban } from 'lucide-react';
import { CategoriaProduto, LIMITES, Produto } from '../domain/cantinaDomain';
import { formatarMoeda } from '../utils/formatadores';

interface CardProdutoVitrineProps {
  produto: Produto;
  tempoEstimadoMinutos: number;
  carrinhoNoLimite: boolean;
  aoAdicionar: (produto: Produto) => void;
}

function IlustracaoProduto({
  categoria,
  ehCozinha,
  tempoEstimadoMinutos,
  nome,
}: {
  categoria: CategoriaProduto;
  ehCozinha: boolean;
  tempoEstimadoMinutos: number;
  nome: string;
}) {
  return (
    <div
      className={`relative w-full h-36 flex items-center justify-center overflow-hidden border-b border-slate-100 ${
        ehCozinha
          ? 'bg-gradient-to-br from-amber-50/90 via-orange-50/40 to-slate-100'
          : 'bg-gradient-to-br from-emerald-50/60 via-slate-50 to-orange-50/20'
      }`}
    >
      {/* Indicadores minimalistas: Natureza e Tempo Estimado */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold ${
            ehCozinha
              ? 'bg-amber-950/90 text-amber-100'
              : 'bg-emerald-900/90 text-emerald-100'
          }`}
        >
          {ehCozinha ? (
            <>
              <Flame className="w-3 h-3 text-amber-400 shrink-0" />
              <span>Na Hora</span>
            </>
          ) : (
            <>
              <Zap className="w-3 h-3 text-emerald-300 shrink-0" />
              <span>Pronto</span>
            </>
          )}
        </span>

        <span className="px-2.5 py-1 rounded-md bg-white/95 text-slate-900 text-xs font-mono tabular-nums font-bold border border-slate-200/80">
          ~{tempoEstimadoMinutos} min
        </span>
      </div>

      {/* Ícone vetorial gastronômico */}
      <svg
        className="w-16 h-16 text-[#FF6B00]/85 transition-transform duration-200 group-hover:scale-105 mt-3"
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label={nome}
      >
        <circle cx="40" cy="40" r="30" fill="currentColor" fillOpacity="0.08" />
        {categoria === 'Salgados' && (
          <>
            <path
              d="M40 16C31 26 24 36 24 46C24 55.3888 31.1634 62 40 62C48.8366 62 56 55.3888 56 46C56 36 49 26 40 16Z"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="currentColor"
              fillOpacity="0.15"
            />
            <path
              d="M33 46C33 50 36 53 40 53"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </>
        )}
        {categoria === 'Lanches na Chapa' && (
          <>
            <rect
              x="18"
              y="28"
              width="44"
              height="10"
              rx="5"
              stroke="currentColor"
              strokeWidth="2.5"
              fill="currentColor"
              fillOpacity="0.15"
            />
            <path
              d="M16 43H64"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <rect
              x="20"
              y="48"
              width="40"
              height="9"
              rx="4.5"
              stroke="currentColor"
              strokeWidth="2.5"
              fill="currentColor"
              fillOpacity="0.15"
            />
          </>
        )}
        {categoria === 'Bebidas' && (
          <>
            <path
              d="M27 24H53L49 60H31L27 24Z"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinejoin="round"
              fill="currentColor"
              fillOpacity="0.15"
            />
            <path
              d="M24 24H56"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d="M40 24V15L47 12"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        )}
        {categoria === 'Doces' && (
          <>
            <path
              d="M22 36L40 24L58 36V54L40 60L22 54V36Z"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinejoin="round"
              fill="currentColor"
              fillOpacity="0.15"
            />
            <path
              d="M22 45L40 51L58 45"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </>
        )}
      </svg>
    </div>
  );
}

export function CardProdutoVitrine({
  produto,
  tempoEstimadoMinutos,
  carrinhoNoLimite,
  aoAdicionar,
}: CardProdutoVitrineProps) {
  const disponivel = produto.estaDisponivel();
  const ehCozinha = produto.utilizaGargaloCozinha();

  return (
    <article
      className={`group bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-150 ${
        disponivel ? 'hover:-translate-y-0.5 hover:shadow-md' : 'opacity-60'
      }`}
    >
      <div>
        <IlustracaoProduto
          categoria={produto.obterCategoria()}
          ehCozinha={ehCozinha}
          tempoEstimadoMinutos={tempoEstimadoMinutos}
          nome={produto.obterNome()}
        />

        <div className="p-4 space-y-1.5">
          <h3 className="text-base font-extrabold text-slate-900 font-display leading-snug">
            {produto.obterNome()}
          </h3>
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {produto.obterDescricao()}
          </p>
        </div>
      </div>

      <div className="px-4 py-3.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-3">
        <span className="text-lg font-extrabold text-slate-900 font-mono tabular-nums">
          {formatarMoeda(produto.obterPreco())}
        </span>

        {disponivel ? (
          <button
            type="button"
            onClick={() => aoAdicionar(produto)}
            disabled={carrinhoNoLimite}
            title={
              carrinhoNoLimite
                ? `Limite de ${LIMITES.unidadesPorPedido} unidades por pedido`
                : undefined
            }
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#0F172A] hover:bg-[#FF6B00] disabled:bg-slate-300 disabled:cursor-not-allowed rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Pedir</span>
          </button>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-500 bg-slate-100 rounded-xl whitespace-nowrap shrink-0">
            <Ban className="w-3.5 h-3.5" />
            <span>Esgotado</span>
          </span>
        )}
      </div>
    </article>
  );
}
