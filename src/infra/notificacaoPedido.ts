/**
 * Serviço de Notificação Sonora (HTML5 Audio API) e Visual (Browser Notification API)
 * para alertar o aluno quando o pedido muda para "Pronto para Retirada".
 */

import { Pedido } from '../domain/cantinaDomain';

let urlAudioEmCache: string | null = null;

/**
 * Gera um arquivo WAV em memória (acorde duplo de sino de balcão: Dó6 -> Sol6)
 * para ser reproduzido via elemento nativo `new Audio(url)` da API de Áudio do HTML5.
 */
function obterUrlSomNotificacaoWav(): string {
  if (urlAudioEmCache) return urlAudioEmCache;

  const taxaAmostragem = 22050;
  const duracaoSegundos = 0.55;
  const totalAmostras = Math.floor(taxaAmostragem * duracaoSegundos);
  const buffer = new ArrayBuffer(44 + totalAmostras * 2);
  const view = new DataView(buffer);

  const escreverTexto = (offset: number, texto: string) => {
    for (let i = 0; i < texto.length; i++) {
      view.setUint8(offset + i, texto.charCodeAt(i));
    }
  };

  // Cabeçalho RIFF/WAV padrão PCM 16-bit mono
  escreverTexto(0, 'RIFF');
  view.setUint32(4, 36 + totalAmostras * 2, true);
  escreverTexto(8, 'WAVE');
  escreverTexto(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // 1 canal (Mono)
  view.setUint32(24, taxaAmostragem, true);
  view.setUint32(28, taxaAmostragem * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  escreverTexto(36, 'data');
  view.setUint32(40, totalAmostras * 2, true);

  for (let i = 0; i < totalAmostras; i++) {
    const t = i / taxaAmostragem;
    // Duas notas suaves estilo sino de retirada: 880Hz (A5) -> 1318.5Hz (E6)
    const frequencia = t < 0.22 ? 880 : 1318.5;
    const tNota = t < 0.22 ? t : t - 0.22;
    const envelope = Math.exp(-tNota * 9);
    const amostra = Math.sin(2 * Math.PI * frequencia * t) * envelope * 0.45;
    const pcm16 = Math.max(-1, Math.min(1, amostra)) * 32767;
    view.setInt16(44 + i * 2, Math.floor(pcm16), true);
  }

  const blob = new Blob([buffer], { type: 'audio/wav' });
  urlAudioEmCache = URL.createObjectURL(blob);
  return urlAudioEmCache;
}

/** Toca o alerta sonoro usando a API de Áudio do HTML5 (`new Audio()`). */
export function tocarSomPedidoPronto(): void {
  if (typeof window === 'undefined' || typeof window.Audio === 'undefined') return;
  try {
    const audio = new window.Audio(obterUrlSomNotificacaoWav());
    audio.volume = 0.85;
    const promessa = audio.play();
    if (promessa && typeof promessa.catch === 'function') {
      promessa.catch(() => {
        // Caso o navegador bloqueie autoplay sem interação prévia, falha silenciosamente.
      });
    }
  } catch {
    // Ignora falhas de dispositivo sem saída de áudio.
  }
}

/** Solicita permissão da Notification API do navegador quando oportuno. */
export async function solicitarPermissaoNotificacaoNavegador(): Promise<NotificationPermission | 'indisponivel'> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'indisponivel';
  }
  if (Notification.permission === 'granted' || Notification.permission === 'denied') {
    return Notification.permission;
  }
  try {
    return await Notification.requestPermission();
  } catch {
    return 'indisponivel';
  }
}

/** Dispara uma notificação nativa do navegador (Notification API) para o pedido pronto. */
export function dispararNotificacaoNavegadorPedidoPronto(pedido: Pedido): void {
  if (typeof window === 'undefined' || !('Notification' in window)) return;

  const emitir = () => {
    try {
      new Notification(`Pedido ${pedido.obterCodigoTicket()} Pronto para Retirada!`, {
        body: `${pedido.obterAlunoNome()}, retire agora em: ${pedido.obterTipoFila()}.`,
        tag: `pedido-pronto-${pedido.obterId()}`,
      });
    } catch {
      // Alguns navegadores mobile exigem ServiceWorker para Notification; o toast visual cobre o fallback.
    }
  };

  if (Notification.permission === 'granted') {
    emitir();
  } else if (Notification.permission === 'default') {
    Notification.requestPermission()
      .then((permissao) => {
        if (permissao === 'granted') emitir();
      })
      .catch(() => undefined);
  }
}
