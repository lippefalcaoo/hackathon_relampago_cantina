import { useState, useRef, useCallback, useEffect } from 'react';

export type TipoToast = 'sucesso' | 'aviso' | 'info' | 'erro';

export interface NotificacaoToast {
  id: number;
  titulo: string;
  subtitulo?: string;
  tipo: TipoToast;
}

const MAX_TOASTS_VISIVEIS = 4;

export function useToasts() {
  const [toasts, setToasts] = useState<NotificacaoToast[]>([]);
  const timersToast = useRef(new Map<number, number>());

  const fecharToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timersToast.current.get(id);
    if (timer !== undefined) {
      window.clearTimeout(timer);
      timersToast.current.delete(id);
    }
  }, []);

  const dispararToast = useCallback(
    (titulo: string, subtitulo?: string, tipo: TipoToast = 'sucesso') => {
      const id = Date.now() + Math.random();
      setToasts((prev) => {
        const semRepetidos = prev.filter(
          (t) => !(t.titulo === titulo && t.subtitulo === subtitulo)
        );
        return [...semRepetidos, { id, titulo, subtitulo, tipo }].slice(-MAX_TOASTS_VISIVEIS);
      });
      const duracao = tipo === 'erro' || tipo === 'aviso' ? 6500 : 3800;
      timersToast.current.set(
        id,
        window.setTimeout(() => fecharToast(id), duracao)
      );
    },
    [fecharToast]
  );

  useEffect(() => {
    const timers = timersToast.current;
    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      timers.clear();
    };
  }, []);

  return { toasts, dispararToast, fecharToast };
}
