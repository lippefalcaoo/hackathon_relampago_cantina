import React from 'react';
import { ArrowRight, ChefHat, Clock, Sparkles, UtensilsCrossed, Zap, Flame, Shield } from 'lucide-react';

interface TelaBoasVindasProps {
  alunoNome: string;
  operadorNome: string;
  tempoMedioPreparoMinutos: number | null;
  aoEntrarComoAluno: () => void;
  aoEntrarComoCantina: () => void;
}

export function TelaBoasVindas({
  alunoNome,
  operadorNome,
  tempoMedioPreparoMinutos,
  aoEntrarComoAluno,
  aoEntrarComoCantina,
}: TelaBoasVindasProps) {
  const primeiroNome = alunoNome.trim().split(' ')[0] || 'Aluno';
  const tempoChapaEstimado = tempoMedioPreparoMinutos ?? 6;

  return (
    <main className="flex-1 flex flex-col justify-center relative overflow-hidden bg-[#FAF9F5] px-4 sm:px-6 py-8 sm:py-12">
      {/* Luz ambiente de fundo (Food-Tech Glow suave) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[620px] h-[360px] bg-gradient-to-b from-orange-200/40 via-amber-100/20 to-transparent blur-3xl rounded-full -z-0"
      />

      <div className="relative z-10 max-w-xl w-full mx-auto space-y-6 sm:space-y-8">
        {/* Barra superior de status: Tag institucional + Botão discreto de Operação */}
        <div className="flex items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 border border-stone-200/80 shadow-2xs backdrop-blur-xs text-[11px] font-bold text-stone-700 tracking-wide">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>CESAR SCHOOL · CANTINA ABERTA</span>
          </div>

          {/* Botão Secundário Administrativo (KDS) - Elegante e Discreto */}
          <button
            type="button"
            onClick={aoEntrarComoCantina}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 hover:bg-stone-100 border border-stone-200 text-stone-600 hover:text-stone-900 text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
            title={`Acesso administrativo da equipe (Operador: ${operadorNome})`}
          >
            <ChefHat className="w-3.5 h-3.5 text-stone-500" />
            <span className="hidden xs:inline">Painel KDS</span>
            <span className="xs:hidden">KDS</span>
          </button>
        </div>

        {/* Headline com Tipografia Pesada e Palavras-Chave Destacadas */}
        <div className="space-y-2.5 text-left sm:text-center">
          <h1 className="text-3xl sm:text-5xl font-black text-stone-900 tracking-tight leading-[1.1] font-display">
            Seu intervalo de{' '}
            <span className="text-[#FF6B00] underline decoration-orange-300/60 decoration-wavy decoration-2">
              15 minutos
            </span>{' '}
            sem perder tempo{' '}
            <span className="text-[#FF6B00]">na fila</span>.
          </h1>
          <p className="text-sm sm:text-base text-stone-600 font-medium leading-relaxed">
            Peça agora pelo celular, retire no balcão e aproveite cada minuto do seu intervalo.
          </p>
        </div>

        {/* HERO CARD: Acesso Principal do Aluno (Design Apetitoso & Magnético) */}
        <div className="relative group bg-white rounded-3xl border border-orange-200/70 p-6 sm:p-8 shadow-xl shadow-orange-500/10 transition-all duration-200 hover:shadow-2xl hover:shadow-orange-500/15 hover:border-orange-300">
          {/* Badge de boas-vindas do aluno logado */}
          <div className="flex items-center justify-between gap-3 pb-5 border-b border-stone-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-[#FF6B00] text-white flex items-center justify-center font-extrabold text-sm shadow-sm shadow-orange-500/30">
                {primeiroNome.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-stone-600">
                  Aluno conectado
                </p>
                <p className="text-sm font-extrabold text-stone-900 leading-none mt-0.5">
                  {alunoNome}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-orange-50 text-[#FF6B00] text-xs font-bold border border-orange-200/60">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Pedido Rápido</span>
            </div>
          </div>

          {/* Destaques de Velocidade (Estufa vs Chapa) - Fácil de bater o olho */}
          <div className="grid grid-cols-2 gap-3 py-5">
            <div className="p-3.5 rounded-2xl bg-stone-50/90 border border-stone-200/70 space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-800 text-xs font-bold">
                <Zap className="w-3.5 h-3.5 text-emerald-600" />
                <span>Prontos / Estufa</span>
              </div>
              <p className="text-lg font-black font-mono text-stone-900 tabular-nums">
                ~1 a 2 <span className="text-xs font-semibold text-stone-600">min</span>
              </p>
              <p className="text-[11px] text-stone-600 leading-snug">
                Só esquentar e retirar no balcão
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-stone-50/90 border border-stone-200/70 space-y-1">
              <div className="flex items-center gap-1.5 text-amber-900 text-xs font-bold">
                <Flame className="w-3.5 h-3.5 text-amber-600" />
                <span>Feitos na Chapa</span>
              </div>
              <p className="text-lg font-black font-mono text-stone-900 tabular-nums">
                ~{tempoChapaEstimado} <span className="text-xs font-semibold text-stone-600">min</span>
              </p>
              <p className="text-[11px] text-stone-600 leading-snug">
                Tapiocas e lanches feitos na hora
              </p>
            </div>
          </div>

          {/* Call to Action Principal (Hero Button) */}
          <button
            type="button"
            onClick={aoEntrarComoAluno}
            className="w-full py-4 sm:py-4.5 px-6 rounded-2xl font-black text-base sm:text-lg text-white bg-gradient-to-r from-[#FF6B00] via-orange-500 to-[#E65100] hover:from-orange-500 hover:to-[#FF6B00] shadow-lg shadow-orange-500/30 hover:shadow-orange-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-between cursor-pointer group/btn"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                <UtensilsCrossed className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <span className="block leading-none">Pedir Meu Lanche Agora</span>
                <span className="text-[11px] font-semibold text-orange-100 font-sans block mt-1">
                  Cardápio completo em 8 categorias
                </span>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-white transition-transform group-hover/btn:translate-x-1" />
          </button>
        </div>

        {/* Rodapé Sutil e Discreto com Acesso da Cantina */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-600 border-t border-stone-200/60">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-[#FF6B00]" />
            <span>Alerta sonoro automático ao ficar pronto</span>
          </div>

          <button
            type="button"
            onClick={aoEntrarComoCantina}
            className="inline-flex items-center gap-1.5 text-stone-600 hover:text-stone-900 font-medium transition-colors cursor-pointer"
          >
            <Shield className="w-3 h-3 text-stone-500" />
            <span>Acesso da equipe: <strong>{operadorNome}</strong></span>
          </button>
        </div>
      </div>
    </main>
  );
}
