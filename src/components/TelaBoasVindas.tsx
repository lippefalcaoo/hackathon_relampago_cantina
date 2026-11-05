import React from 'react';
import { Utensils, ChefHat, ArrowRight } from 'lucide-react';

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
  return (
    <main className="flex-1 flex flex-col justify-center px-6 py-12 bg-gradient-to-b from-white via-[#F8FAFC] to-slate-100/70">
      <div className="max-w-4xl w-full mx-auto text-center space-y-10">
        {/* Hero Header */}
        <div className="space-y-4 max-w-2xl mx-auto">
          <p className="text-xs font-bold tracking-wider uppercase text-[#FF6B00]">
            CESAR School · Autoatendimento Inteligente
          </p>
          <h1
            className="text-3xl sm:text-5xl font-extrabold text-slate-950 font-display tracking-tight leading-tight"
            style={{ textWrap: 'balance' }}
          >
            Faça seu intervalo de 15 minutos render sem filas.
          </h1>
          <p className="text-base text-slate-600 leading-relaxed">
            Escolha seu lanche em segundos, acompanhe o preparo com estimativa inteligente e receba um alerta sonoro assim que estiver pronto para retirar.
          </p>
        </div>

        {/* Dois Cards de Seleção de Perfil */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          {/* Card 1: Entrar como Comprador (Aluno) */}
          <div className="group bg-white border-2 border-slate-200 hover:border-[#FF6B00] rounded-2xl p-7 flex flex-col justify-between space-y-6 transition-all duration-150 shadow-xs hover:shadow-md">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-orange-50 text-[#FF6B00] flex items-center justify-center">
                <Utensils className="w-6 h-6" />
              </div>

              <div className="space-y-1.5">
                <h2 className="text-xl font-extrabold text-slate-900 font-display">
                  Pedir Agora (Aluno)
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Cardápio rápido separado entre itens prontos de estufa e lanches na chapa, com status em tempo real e aviso sonoro de retirada.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                <span className="text-slate-500">Conectado como</span>
                <span className="font-bold text-slate-900">{alunoNome}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={aoEntrarComoAluno}
              className="w-full py-3.5 px-5 text-sm font-bold text-white bg-[#FF6B00] hover:bg-orange-600 rounded-xl transition-colors flex items-center justify-between cursor-pointer shadow-xs"
            >
              <span>Entrar como Comprador (Aluno)</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          {/* Card 2: Entrar como Vendedor (Cantina) */}
          <div className="group bg-white border-2 border-slate-200 hover:border-slate-900 rounded-2xl p-7 flex flex-col justify-between space-y-6 transition-all duration-150 shadow-xs hover:shadow-md">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                <ChefHat className="w-6 h-6" />
              </div>

              <div className="space-y-1.5">
                <h2 className="text-xl font-extrabold text-slate-900 font-display">
                  Operação da Cantina (KDS)
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Gerencie a fila de pedidos com 1 clique, registre pagamentos no caixa e atualize disponibilidade e itens do cardápio.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                <span className="text-slate-500">Operador ativo</span>
                <span className="font-bold text-slate-900">{operadorNome}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={aoEntrarComoCantina}
              className="w-full py-3.5 px-5 text-sm font-bold text-white bg-[#0F172A] hover:bg-slate-800 rounded-xl transition-colors flex items-center justify-between cursor-pointer shadow-xs"
            >
              <span>Entrar como Vendedor (Cantina)</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>

        {/* Indicador minimalista de ritmo da cozinha */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
          <span>
            Estufa Expressa:{' '}
            <strong className="text-emerald-700 font-mono tabular-nums">
              ~1 a 2 min
            </strong>
          </span>
          <span aria-hidden="true">·</span>
          <span>
            Ritmo médio atual da chapa:{' '}
            <strong className="text-slate-900 font-mono tabular-nums">
              {tempoMedioPreparoMinutos !== null
                ? `~${tempoMedioPreparoMinutos} min (média móvel)`
                : '~6 a 10 min'}
            </strong>
          </span>
        </div>
      </div>
    </main>
  );
}
