import React from 'react';
import { AlertTriangle, Check, Info, X } from 'lucide-react';
import { NotificacaoToast } from '../hooks/useToasts';

interface BarraToastsProps {
  toasts: NotificacaoToast[];
  aoFechar: (id: number) => void;
}

export function BarraToasts({ toasts, aoFechar }: BarraToastsProps) {
  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role={t.tipo === 'erro' || t.tipo === 'aviso' ? 'alert' : 'status'}
          data-tipo-toast={t.tipo}
          className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-lg border backdrop-blur-md transition-all duration-200 ${
            t.tipo === 'sucesso'
              ? 'bg-slate-900/95 text-white border-slate-800'
              : t.tipo === 'aviso'
              ? 'bg-amber-950/95 text-amber-100 border-amber-800'
              : t.tipo === 'erro'
              ? 'bg-red-950/95 text-red-50 border-red-800'
              : 'bg-slate-900/95 text-white border-slate-700'
          }`}
        >
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
              t.tipo === 'sucesso'
                ? 'bg-[#FF6B00] text-white'
                : t.tipo === 'aviso'
                ? 'bg-amber-500 text-slate-950'
                : t.tipo === 'erro'
                ? 'bg-red-500 text-white'
                : 'bg-emerald-500 text-slate-950'
            }`}
          >
            {t.tipo === 'aviso' || t.tipo === 'erro' ? (
              <AlertTriangle className="w-3.5 h-3.5" />
            ) : t.tipo === 'info' ? (
              <Info className="w-3.5 h-3.5" />
            ) : (
              <Check className="w-3.5 h-3.5" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold leading-snug">{t.titulo}</p>
            {t.subtitulo && (
              <p className="text-[11px] opacity-80 mt-0.5 leading-relaxed">
                {t.subtitulo}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => aoFechar(t.id)}
            aria-label="Fechar notificação"
            className="shrink-0 -mr-1 -mt-1 w-6 h-6 rounded-md flex items-center justify-center opacity-60 hover:opacity-100 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
