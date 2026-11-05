import React from 'react';
import { BadgeCheck, Receipt, Wallet } from 'lucide-react';
import { Pedido, StatusPedido } from '../domain/cantinaDomain';
import { formatarMoeda } from '../utils/formatadores';

interface CardPedidoProps {
  pedido: Pedido;
  confirmandoCancelamento: boolean;
  aoAvancarStatus: (pedidoId: string, statusEsperado: StatusPedido) => void;
  aoConfirmarPagamento: (pedidoId: string) => void;
  aoCancelarPedido: (pedido: Pedido) => void;
  aoDesistirCancelamento: () => void;
}

export function CardPedido({
  pedido,
  confirmandoCancelamento,
  aoAvancarStatus,
  aoConfirmarPagamento,
  aoCancelarPedido,
  aoDesistirCancelamento,
}: CardPedidoProps) {
  const status = pedido.obterStatus();
  const pagoNoApp = pedido.ehFilaExpressa();
  const pagamentoConfirmado = pedido.estaPagamentoConfirmado();
  const tempoReal = pedido.obterTempoRealPreparoMinutos();

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-2xs">
      <div className="space-y-3.5">
        {/* Topo do Card: Número do Pedido, Nome do Aluno e Status */}
        <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono tabular-nums text-slate-500">
              <span className="text-sm font-extrabold text-slate-900">
                #{pedido.obterCodigoTicket()}
              </span>
              <span>·</span>
              <span>{pedido.obterHorarioCriacao()}</span>
              <span>·</span>
              <span>Prev: ~{pedido.obterTempoEstimadoInicial()}m</span>
              {tempoReal !== undefined && (
                <>
                  <span>·</span>
                  <span className="text-emerald-700 font-bold">Real: {tempoReal}m</span>
                </>
              )}
            </div>
            <h3 className="text-base font-extrabold text-slate-900 font-display mt-0.5">
              {pedido.obterAlunoNome()}
            </h3>
            <p className="text-[11px] font-mono tabular-nums text-slate-400">
              Matrícula: {pedido.obterAlunoMatricula()}
            </p>
          </div>

          <span
            className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap ${
              status === 'Recebido'
                ? 'bg-amber-100 text-amber-900'
                : status === 'Fazendo'
                ? 'bg-orange-100 text-[#FF6B00]'
                : status === 'Pronto para Retirada'
                ? 'bg-emerald-100 text-emerald-900'
                : status === 'Cancelado'
                ? 'bg-red-100 text-red-800'
                : 'bg-slate-100 text-slate-500'
            }`}
          >
            {status === 'Fazendo' ? 'Em Preparo' : status}
          </span>
        </div>

        {/* Etiqueta de Pagamento */}
        <div
          className={`p-3 rounded-xl border text-xs font-extrabold flex items-center gap-2 ${
            pagamentoConfirmado
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-amber-50 border-amber-300 text-amber-950'
          }`}
        >
          {pagamentoConfirmado ? (
            <BadgeCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <Receipt className="w-4 h-4 text-amber-600 shrink-0" />
          )}
          <span>{pedido.obterEtiquetaOperacionalKDS()}</span>
        </div>

        {/* Lista de Itens */}
        <div className="space-y-1.5 pt-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Itens do Pedido
          </p>
          <ul className="divide-y divide-slate-100 border border-slate-100 rounded-xl bg-slate-50/60 px-3 py-1">
            {pedido.obterItens().map((item) => (
              <li
                key={item.obterProdutoId()}
                className="py-2 flex items-center justify-between text-xs"
              >
                <span className="font-semibold text-slate-900">
                  <strong className="font-mono tabular-nums text-[#FF6B00] mr-1.5">
                    {item.obterQuantidade()}x
                  </strong>
                  {item.obterNomeProduto()}
                </span>
                <span className="text-[11px] font-medium text-slate-500 whitespace-nowrap ml-2">
                  {item.utilizaGargaloCozinha() ? 'Chapa' : 'Estufa'}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Botões de Ação Rápida com Proteção de Status Esperado */}
      <div className="pt-3 border-t border-slate-100 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500">Valor do Pedido</span>
          <span className="font-mono tabular-nums font-extrabold text-slate-900 text-sm">
            {formatarMoeda(pedido.obterValorTotal())}
          </span>
        </div>

        {status === 'Recebido' && (
          <button
            type="button"
            onClick={() => aoAvancarStatus(pedido.obterId(), status)}
            className="w-full py-3 px-4 text-xs font-extrabold text-white bg-[#FF6B00] hover:bg-orange-600 rounded-xl transition-colors cursor-pointer shadow-2xs"
          >
            Iniciar Preparo (Marcar como Fazendo)
          </button>
        )}
        {status === 'Fazendo' && (
          <button
            type="button"
            onClick={() => aoAvancarStatus(pedido.obterId(), status)}
            className="w-full py-3 px-4 text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors cursor-pointer shadow-2xs"
          >
            Marcar como Pronto para Retirada
          </button>
        )}
        {!pagoNoApp && !pagamentoConfirmado && pedido.estaEmAberto() && (
          <button
            type="button"
            onClick={() => aoConfirmarPagamento(pedido.obterId())}
            className="w-full py-2.5 px-4 text-xs font-extrabold text-amber-950 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-xl transition-colors cursor-pointer inline-flex items-center justify-center gap-2"
          >
            <Wallet className="w-4 h-4" />
            <span>
              Registrar pagamento de {formatarMoeda(pedido.obterValorTotal())}
            </span>
          </button>
        )}
        {status === 'Pronto para Retirada' && (
          <button
            type="button"
            onClick={() => aoAvancarStatus(pedido.obterId(), status)}
            disabled={!pagamentoConfirmado}
            title={
              !pagamentoConfirmado
                ? 'Registre o pagamento no caixa antes de entregar'
                : undefined
            }
            className="w-full py-3 px-4 text-xs font-extrabold text-white bg-[#0F172A] hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-xl transition-colors cursor-pointer"
          >
            {pagamentoConfirmado
              ? 'Marcar como Entregue'
              : 'Aguardando pagamento no caixa'}
          </button>
        )}
        {status === 'Entregue' && (
          <div className="py-2 text-center text-xs font-bold text-slate-400 bg-slate-50 rounded-xl">
            Pedido Finalizado e Entregue
          </div>
        )}
        {status === 'Cancelado' && (
          <div className="py-2 text-center text-xs font-bold text-red-700 bg-red-50 rounded-xl">
            Pedido cancelado
          </div>
        )}
        {pedido.estaEmAberto() && (
          <div className="flex items-center justify-end gap-2">
            {confirmandoCancelamento && (
              <button
                type="button"
                onClick={aoDesistirCancelamento}
                className="px-2.5 py-1 text-[11px] font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Manter pedido
              </button>
            )}
            <button
              type="button"
              onClick={() => aoCancelarPedido(pedido)}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg cursor-pointer ${
                confirmandoCancelamento
                  ? 'text-white bg-red-600 hover:bg-red-700'
                  : 'text-slate-400 hover:text-red-700'
              }`}
            >
              {confirmandoCancelamento
                ? 'Confirmar cancelamento'
                : 'Cancelar pedido'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
