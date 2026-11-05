import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { formatarMoeda } from '../utils/formatadores';

export type ModuloAtivo = 'boas_vindas' | 'aluno' | 'cantina';

interface BarraNavegacaoProps {
  moduloAtivo: ModuloAtivo;
  aoMudarModulo: (modulo: ModuloAtivo) => void;
  quantidadeTotalCarrinho: number;
  valorTotalCarrinho: number;
  qtdPedidosAtivos: number;
  aoAbrirCarrinho: () => void;
}

export function BarraNavegacao({
  moduloAtivo,
  aoMudarModulo,
  quantidadeTotalCarrinho,
  valorTotalCarrinho,
  qtdPedidosAtivos,
  aoAbrirCarrinho,
}: BarraNavegacaoProps) {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200/80 px-4 sm:px-6 py-2.5">
      <div className="max-w-[1280px] mx-auto flex items-center justify-between gap-4">
        {/* Zona 1: Brand Wordmark */}
        <a
          href="#inicio"
          onClick={(e) => {
            e.preventDefault();
            aoMudarModulo('boas_vindas');
          }}
          className="text-base sm:text-lg font-black tracking-tight text-stone-900 whitespace-nowrap shrink-0 font-display flex items-center gap-1.5"
        >
          <span>Fast-Track</span>
          <span className="text-[#FF6B00]">Cantina</span>
        </a>

        {/* Zona 2: Seletor Rápido de Visões (Pills Compactas) */}
        <nav className="flex items-center gap-1 sm:gap-1.5 bg-stone-100/90 p-1 rounded-xl text-xs font-semibold overflow-x-auto">
          <button
            type="button"
            onClick={() => aoMudarModulo('boas_vindas')}
            className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              moduloAtivo === 'boas_vindas'
                ? 'bg-white text-stone-950 font-bold shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Início
          </button>
          <button
            type="button"
            onClick={() => aoMudarModulo('aluno')}
            className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              moduloAtivo === 'aluno'
                ? 'bg-white text-[#FF6B00] font-bold shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Aluno {qtdPedidosAtivos > 0 ? `(${qtdPedidosAtivos})` : ''}
          </button>
          <button
            type="button"
            onClick={() => aoMudarModulo('cantina')}
            className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              moduloAtivo === 'cantina'
                ? 'bg-stone-900 text-white font-bold shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Cantina (KDS)
          </button>
        </nav>

        {/* Zona 3: CTA / Sacola */}
        <div className="flex items-center shrink-0">
          {moduloAtivo === 'cantina' ? (
            <button
              type="button"
              onClick={() => aoMudarModulo('aluno')}
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-stone-900 hover:bg-[#FF6B00] rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span className="hidden sm:inline">Visão do Aluno</span>
              <span className="sm:hidden">Aluno</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={aoAbrirCarrinho}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-[#FF6B00] hover:bg-orange-600 rounded-xl transition-all whitespace-nowrap shrink-0 cursor-pointer shadow-sm shadow-orange-500/20 active:scale-95"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>
                {quantidadeTotalCarrinho > 0 ? (
                  <>
                    <span className="hidden sm:inline">Sacola </span>({quantidadeTotalCarrinho}) · {formatarMoeda(valorTotalCarrinho)}
                  </>
                ) : (
                  'Sacola (0)'
                )}
              </span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
