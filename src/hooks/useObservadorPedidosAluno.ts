import { useEffect, useRef } from 'react';
import { Pedido, StatusPedido } from '../domain/cantinaDomain';
import {
  tocarSomPedidoPronto,
  dispararNotificacaoNavegadorPedidoPronto,
} from '../infra/notificacaoPedido';

/**
 * Observer (useEffect) exclusivo da visão do aluno.
 * Escuta mudanças de status dos pedidos e, quando um pedido transita para
 * "Pronto para Retirada", toca o alerta sonoro (HTML5 Audio API), dispara
 * uma notificação nativa (Notification API) e aciona o callback visual.
 *
 * A lógica do painel da cantina permanece 100% desacoplada deste observer.
 */
export function useObservadorPedidosAluno(
  pedidos: Pedido[],
  versaoEstado: number,
  aoFicarPronto?: (pedido: Pedido) => void
): void {
  const statusAnteriorPorPedido = useRef<Map<string, StatusPedido> | null>(null);
  const callbackRef = useRef(aoFicarPronto);
  callbackRef.current = aoFicarPronto;

  useEffect(() => {
    // Na primeira montagem, registra a fotografia inicial para não tocar som de pedidos antigos
    if (statusAnteriorPorPedido.current === null) {
      const mapaInicial = new Map<string, StatusPedido>();
      for (const pedido of pedidos) {
        mapaInicial.set(pedido.obterId(), pedido.obterStatus());
      }
      statusAnteriorPorPedido.current = mapaInicial;
      return;
    }

    const mapaAnterior = statusAnteriorPorPedido.current;
    const proximoMapa = new Map<string, StatusPedido>();

    for (const pedido of pedidos) {
      const id = pedido.obterId();
      const statusAtual = pedido.obterStatus();
      const statusAntes = mapaAnterior.get(id);

      proximoMapa.set(id, statusAtual);

      // Detecta transição real para "Pronto para Retirada"
      if (
        statusAntes !== undefined &&
        statusAntes !== 'Pronto para Retirada' &&
        statusAtual === 'Pronto para Retirada'
      ) {
        tocarSomPedidoPronto();
        dispararNotificacaoNavegadorPedidoPronto(pedido);
        callbackRef.current?.(pedido);
      }
    }

    statusAnteriorPorPedido.current = proximoMapa;
  }, [pedidos, versaoEstado]);
}
