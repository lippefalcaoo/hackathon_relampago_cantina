import React from 'react';
import { limparEstadoSalvo } from '../infra/persistenciaCantina';

interface Props {
  children: React.ReactNode;
}

interface Estado {
  erro: Error | null;
  confirmandoLimpeza: boolean;
}

/**
 * Captura erros de renderização para que um bug em um componente mostre uma
 * tela de recuperação em vez de deixar a página inteira em branco.
 *
 * Observação: erros dentro de handlers (onClick, onSubmit) não chegam aqui;
 * esses são tratados no App por `executarAcao`.
 */
export class ErrorBoundary extends React.Component<Props, Estado> {
  public state: Estado = { erro: null, confirmandoLimpeza: false };

  public static getDerivedStateFromError(erro: Error): Partial<Estado> {
    return { erro };
  }

  public componentDidCatch(erro: Error, info: React.ErrorInfo): void {
    console.error('[Fast-Track Cantina] erro de renderização:', erro, info.componentStack);
  }

  private tentarNovamente = () => {
    this.setState({ erro: null, confirmandoLimpeza: false });
  };

  private recarregar = () => {
    window.location.reload();
  };

  // Confirmação em dois cliques (window.confirm é bloqueado em iframes como o preview do AI Studio).
  private apagarDadosERecarregar = () => {
    if (!this.state.confirmandoLimpeza) {
      this.setState({ confirmandoLimpeza: true });
      return;
    }
    limparEstadoSalvo();
    window.location.reload();
  };

  public render(): React.ReactNode {
    if (!this.state.erro) return this.props.children;

    return (
      <div role="alert" className="min-h-screen flex items-center justify-center bg-[#F8FAFC] px-6">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-7 space-y-5 shadow-sm">
          <div className="space-y-2">
            <h1 className="text-xl font-extrabold text-slate-900 font-display">
              Esta tela parou de funcionar
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              Um erro inesperado interrompeu a página. Os pedidos já enviados continuam salvos
              neste navegador. Tente abrir a tela de novo; se o erro voltar, recarregue a página.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={this.tentarNovamente}
              className="w-full py-3 px-4 text-sm font-extrabold text-white bg-[#FF6B00] hover:bg-orange-600 rounded-xl cursor-pointer"
            >
              Tentar novamente
            </button>
            <button
              type="button"
              onClick={this.recarregar}
              className="w-full py-3 px-4 text-sm font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
            >
              Recarregar a página
            </button>
            <button
              type="button"
              onClick={this.apagarDadosERecarregar}
              className="w-full py-2 px-4 text-xs font-semibold text-slate-500 hover:text-red-700 cursor-pointer"
            >
              {this.state.confirmandoLimpeza
                ? 'Clique de novo para apagar cardápio e pedidos salvos'
                : 'Apagar dados salvos e recomeçar'}
            </button>
          </div>

          <details className="text-xs text-slate-500">
            <summary className="cursor-pointer">Detalhes técnicos</summary>
            <pre className="mt-2 p-3 bg-slate-50 rounded-lg overflow-x-auto whitespace-pre-wrap break-words">
              {this.state.erro.message}
            </pre>
          </details>
        </div>
      </div>
    );
  }
}
