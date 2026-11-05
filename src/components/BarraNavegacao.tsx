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
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 px-6 py-3.5">
      <div className="max-w-[1280px] mx-auto flex items-center justify-between gap-8">
        {/* Zona 1: Brand Wordmark */}
        <a
          href="#inicio"
          onClick={(e) => {
            e.preventDefault();
            aoMudarModulo('boas_vindas');
          }}
          className="text-lg font-extrabold tracking-tight text-slate-900 whitespace-nowrap shrink-0 font-display"
        >
          Fast-Track <span className="text-[#FF6B00]">Cantina</span>
        </a>

        {/* Zona 2: Seletor Rápido de Visões */}
        <nav className="flex items-center gap-6 text-sm font-medium text-slate-600 overflow-x-auto">
          <button
            type="button"
            onClick={() => aoMudarModulo('boas_vindas')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 cursor-pointer ${
              moduloAtivo === 'boas_vindas'
                ? 'border-[#FF6B00] text-slate-950 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Início
          </button>
          <button
            type="button"
            onClick={() => aoMudarModulo('aluno')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 cursor-pointer ${
              moduloAtivo === 'aluno'
                ? 'border-[#FF6B00] text-slate-950 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Visão do Aluno {qtdPedidosAtivos > 0 ? `(${qtdPedidosAtivos})` : ''}
          </button>
          <button
            type="button"
            onClick={() => aoMudarModulo('cantina')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 cursor-pointer ${
              moduloAtivo === 'cantina'
                ? 'border-[#FF6B00] text-slate-950 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Painel da Cantina (KDS)
          </button>
        </nav>

        {/* Zona 3: 1 Primary CTA Button */}
        <div className="flex items-center shrink-0">
          {moduloAtivo === 'cantina' ? (
            <button
              type="button"
              onClick={() => aoMudarModulo('aluno')}
              className="px-4 py-2 text-xs font-bold text-white bg-[#0F172A] hover:bg-[#FF6B00] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Alternar para Visão do Aluno
            </button>
          ) : (
            <button
              type="button"
              onClick={aoAbrirCarrinho}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#FF6B00] hover:bg-orange-600 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-xs"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>
                Sacola ({quantidadeTotalCarrinho}) · {formatarMoeda(valorTotalCarrinho)}
              </span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
