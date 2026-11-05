import React from 'react';
import {
  ArrowRight,
  ChefHat,
  Clock,
  Sparkles,
  Zap,
  Flame,
  ShieldCheck,
  ShoppingBag,
} from 'lucide-react';
import { formatarMoeda } from '../utils/formatadores';

export interface TelaBoasVindasProps {
  alunoNome: string;
  alunoMatricula?: string;
  operadorNome: string;
  tempoMedioPreparoMinutos: number | null;
  aoEntrarComoAluno: (categoria?: string) => void;
  aoEntrarComoCantina: () => void;
  quantidadeTotalCarrinho?: number;
  valorTotalCarrinho?: number;
  aoAbrirCarrinho?: () => void;
}

interface CategoriaAtalho {
  nome: string;
  icone: string;
  subtitulo: string;
  natureza: 'estufa' | 'chapa';
}

const ATALHOS_CARDAPIO: CategoriaAtalho[] = [
  { nome: 'Salgados', icone: '🥟', subtitulo: '~1 a 2 min', natureza: 'estufa' },
  { nome: 'Bebidas', icone: '🥤', subtitulo: 'Geladas', natureza: 'estufa' },
  { nome: 'Tapiocas', icone: '🥞', subtitulo: 'Na Chapa', natureza: 'chapa' },
  { nome: 'Sobremesas', icone: '🍰', subtitulo: 'Prontas', natureza: 'estufa' },
  { nome: 'Sanduíches Naturais', icone: '🥪', subtitulo: 'Frescos', natureza: 'estufa' },
  { nome: 'Hot Dog', icone: '🌭', subtitulo: 'Quente', natureza: 'chapa' },
  { nome: 'Croissant', icone: '🥐', subtitulo: 'Folhado', natureza: 'estufa' },
  { nome: 'Cuscuz Recheado', icone: '🌽', subtitulo: 'Na Hora', natureza: 'chapa' },
];

export function TelaBoasVindas({
  alunoNome,
  alunoMatricula,
  operadorNome,
  tempoMedioPreparoMinutos,
  aoEntrarComoAluno,
  aoEntrarComoCantina,
  quantidadeTotalCarrinho = 0,
  valorTotalCarrinho = 0,
  aoAbrirCarrinho,
}: TelaBoasVindasProps) {
  const primeiroNome = alunoNome.trim().split(' ')[0] || 'Aluno';
  const tempoChapaEstimado = tempoMedioPreparoMinutos ?? 6;

  return (
    <main className="flex-1 flex flex-col justify-between relative overflow-hidden bg-[#FAF9F5] px-4 sm:px-6 py-6 sm:py-8 max-w-xl w-full mx-auto font-sans">
      {/* Luz ambiente de fundo (Food-Tech Glow suave e convidativo) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-28 left-1/2 -translate-x-1/2 w-[580px] h-[340px] bg-gradient-to-b from-orange-300/25 via-amber-200/15 to-transparent blur-3xl rounded-full -z-0"
      />

      <div className="relative z-10 space-y-6 sm:space-y-7">
        {/* ===================================================================
            HEURÍSTICA 1 (Visibilidade do Status) & HEURÍSTICA 5 (Prevenção de Erros)
            Indicador claro do estado da cantina + Acesso discreto KDS
            =================================================================== */}
        <div className="flex items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/95 border border-emerald-200/80 shadow-2xs backdrop-blur-xs text-xs font-bold text-emerald-900 tracking-tight">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>Cantina Aberta · Intervalo até 20:45</span>
          </div>

          {/* Botão Secundário Administrativo (Heurística 8 - Sem competição visual) */}
          <button
            type="button"
            onClick={aoEntrarComoCantina}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 hover:bg-stone-100 border border-stone-200/80 text-stone-600 hover:text-stone-900 text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
            title={`Acesso administrativo da equipe (Operador: ${operadorNome})`}
          >
            <ChefHat className="w-3.5 h-3.5 text-stone-500" />
            <span>KDS</span>
          </button>
        </div>

        {/* ===================================================================
            SAUDAÇÃO MINIMALISTA & HUMANIZADA (Heurística 8 & Heurística 2)
            Sem caixas gigantes, direto ao ponto
            =================================================================== */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight flex items-center gap-2 font-display">
              <span>Olá, {primeiroNome}</span>
              <span className="text-2xl select-none" aria-hidden="true">
                👋
              </span>
            </h2>

            {quantidadeTotalCarrinho > 0 && aoAbrirCarrinho && (
              <button
                type="button"
                onClick={aoAbrirCarrinho}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-100/80 hover:bg-orange-200/80 text-[#FF6B00] text-xs font-bold transition-all cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>
                  {quantidadeTotalCarrinho} item(ns) · {formatarMoeda(valorTotalCarrinho)}
                </span>
              </button>
            )}
          </div>
          <p className="text-xs sm:text-sm text-stone-600">
            {alunoMatricula ? `Matrícula ${alunoMatricula} · ` : ''}Seu intervalo de 15 min sem filas.
          </p>
        </div>

        {/* ===================================================================
            HERO CARD PRINCIPAL: CALL TO ACTION EXPANSIVO (Heurística 7 e 8)
            Touch target grande (mobile-first), alto contraste e atratividade
            =================================================================== */}
        <div className="relative bg-white rounded-3xl border border-orange-200/80 p-5 sm:p-7 shadow-xl shadow-orange-500/10 space-y-5">
          {/* Headline de Valor & Ritmo ao vivo */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-50 text-[#FF6B00] text-[11px] font-black uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Fast-Pass CESAR</span>
              </span>

              <span className="text-xs font-semibold text-stone-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#FF6B00]" />
                <span>Tempo real</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight leading-tight font-display">
              Faça seu pedido agora e retire{' '}
              <span className="text-[#FF6B00]">direto no balcão</span>.
            </h1>
          </div>

          {/* Comparativo de Velocidade Prática (Heurística 1 e 5) */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/70 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <Zap className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                  Estufa Express
                </p>
                <p className="text-sm font-black font-mono text-stone-900 tabular-nums">
                  ~1 a 2 min
                </p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/70 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center shrink-0">
                <Flame className="w-4 h-4 text-amber-600" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                  Chapa / Tapioca
                </p>
                <p className="text-sm font-black font-mono text-stone-900 tabular-nums">
                  ~{tempoChapaEstimado} min
                </p>
              </div>
            </div>
          </div>

          {/* CTA Principal Hero - Botão Magnético com Área de Toque Generosa (min 52px) */}
          <button
            type="button"
            onClick={() => aoEntrarComoAluno()}
            className="w-full min-h-[54px] py-4 px-6 rounded-2xl font-black text-base text-white bg-gradient-to-r from-[#FF6B00] via-orange-500 to-[#E65100] hover:from-orange-500 hover:to-[#FF6B00] shadow-lg shadow-orange-500/25 hover:shadow-orange-500/35 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-between cursor-pointer group"
          >
            <span className="tracking-tight">Abrir Cardápio Completo</span>
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center transition-transform group-hover:translate-x-1">
              <ArrowRight className="w-4 h-4 text-white" />
            </div>
          </button>
        </div>

        {/* ===================================================================
            HEURÍSTICA 4 (Padrões de Mercado) & HEURÍSTICA 6 (Reconhecimento)
            Atalhos Visuais de Categorias (Padrão iFood / Rappi)
            Touch target mínimo 44x44px, acelerador para 1 toque
            =================================================================== */}
        <section aria-label="Atalhos rápidos do cardápio" className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-black uppercase tracking-wider text-stone-500">
              Ou escolha direto por categoria
            </h3>
            <span className="text-[11px] text-stone-400">1 toque</span>
          </div>

          <div className="grid grid-cols-4 gap-2 sm:gap-2.5">
            {ATALHOS_CARDAPIO.map((item) => (
              <button
                key={item.nome}
                type="button"
                onClick={() => aoEntrarComoAluno(item.nome)}
                className="group/btn min-h-[72px] p-2.5 rounded-2xl bg-white hover:bg-orange-50/60 border border-stone-200/80 hover:border-orange-300 shadow-2xs hover:shadow-sm transition-all flex flex-col items-center justify-center text-center cursor-pointer active:scale-95"
              >
                <span className="text-2xl transition-transform group-hover/btn:scale-110 mb-1" aria-hidden="true">
                  {item.icone}
                </span>
                <span className="text-[11px] font-bold text-stone-900 group-hover/btn:text-[#FF6B00] leading-tight line-clamp-1">
                  {item.nome}
                </span>
                <span className="text-[9px] font-medium text-stone-600 mt-0.5">
                  {item.subtitulo}
                </span>
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* ===================================================================
          RODAPÉ MINIMALISTA: GARANTIA DE RETIRADA & ACESSO OPERACIONAL
          =================================================================== */}
      <footer className="relative z-10 pt-6 mt-6 border-t border-stone-200/60 flex flex-wrap items-center justify-between gap-3 text-[11px] text-stone-600">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Alerta sonoro ao ficar pronto para retirada</span>
        </div>

        <button
          type="button"
          onClick={aoEntrarComoCantina}
          className="text-stone-600 hover:text-stone-900 font-medium hover:underline transition-colors cursor-pointer"
        >
          Operador: <strong>{operadorNome}</strong>
        </button>
      </footer>
    </main>
  );
}
