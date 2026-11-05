import React, { useMemo, useState } from 'react';
import {
  Search,
  CheckCircle2,
  BadgeCheck,
  Store,
  Bell,
  Clock,
  Ban,
  ChevronDown,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import {
  CalculadoraGargaloFila,
  CampoAluno,
  CategoriaProduto,
  CATEGORIAS_CARDAPIO_REAL,
  CATEGORIAS_PRODUTO,
  DadosAluno,
  ErrosCampos,
  ETAPAS_PEDIDO,
  ItemCarrinho,
  LIMITES,
  Pedido,
  Produto,
  StatusPedido,
} from '../domain/cantinaDomain';
import { useObservadorPedidosAluno } from '../hooks/useObservadorPedidosAluno';
import {
  solicitarPermissaoNotificacaoNavegador,
  tocarSomPedidoPronto,
} from '../infra/notificacaoPedido';
import {
  classeBordaCampo,
  formatarMoeda,
  MensagemCampo,
  normalizarTexto,
} from '../utils/formatadores';
import { MenuCard } from './MenuCard';

export interface TelaAlunoProps {
  visivel: boolean;
  perfilAluno: DadosAluno;
  editandoPerfilAluno: boolean;
  rascunhoAluno: DadosAluno;
  errosAluno: ErrosCampos<CampoAluno>;
  aoIniciarEdicaoAluno: () => void;
  aoAlterarRascunhoAluno: (novo: DadosAluno) => void;
  aoSalvarPerfilAluno: () => void;
  aoCancelarEdicaoAluno: () => void;
  cardapio: Produto[];
  itensCarrinho: ItemCarrinho[];
  quantidadeTotalCarrinho: number;
  valorTotalCarrinho: number;
  todosPedidos: Pedido[];
  historicoTemposReais: number[];
  calculadoraGargalo: CalculadoraGargaloFila;
  carrinhoNoLimite: boolean;
  pedidoAcompanhadoId: string;
  aoSelecionarPedidoAcompanhado: (id: string) => void;
  aoAdicionarAoCarrinho: (produto: Produto) => void;
  aoAlterarQuantidadeCarrinho: (produtoId: string, novaQtd: number) => void;
  aoAbrirCarrinho: () => void;
  aoNotificarPedidoPronto: (pedido: Pedido) => void;
  versaoEstado: number;
}

export function TelaAluno({
  visivel,
  perfilAluno,
  editandoPerfilAluno,
  rascunhoAluno,
  errosAluno,
  aoIniciarEdicaoAluno,
  aoAlterarRascunhoAluno,
  aoSalvarPerfilAluno,
  aoCancelarEdicaoAluno,
  cardapio,
  itensCarrinho,
  quantidadeTotalCarrinho,
  valorTotalCarrinho,
  todosPedidos,
  historicoTemposReais,
  calculadoraGargalo,
  carrinhoNoLimite,
  pedidoAcompanhadoId,
  aoSelecionarPedidoAcompanhado,
  aoAdicionarAoCarrinho,
  aoAlterarQuantidadeCarrinho,
  aoAbrirCarrinho,
  aoNotificarPedidoPronto,
  versaoEstado,
}: TelaAlunoProps) {
  const [buscaTexto, setBuscaTexto] = useState<string>('');
  const [categoriasAbertas, setCategoriasAbertas] = useState<Record<string, boolean>>({
    Salgados: true,
  });
  const [permissaoNotificacao, setPermissaoNotificacao] = useState<string>(() =>
    typeof window !== 'undefined' && 'Notification' in window
      ? Notification.permission
      : 'indisponivel'
  );

  // Diretriz 3: Observador (useEffect) exclusivo da visão do aluno que escuta mudanças para
  // "Pronto para Retirada" e dispara HTML5 Audio API + Browser Notification API
  useObservadorPedidosAluno(todosPedidos, versaoEstado, (pedidoPronto) => {
    aoSelecionarPedidoAcompanhado(pedidoPronto.obterId());
    aoNotificarPedidoPronto(pedidoPronto);
  });

  const mapaQtdPorProduto = useMemo(() => {
    const mapa = new Map<string, number>();
    for (const item of itensCarrinho) {
      mapa.set(item.obterProdutoId(), item.obterQuantidade());
    }
    return mapa;
  }, [itensCarrinho]);

  const previsaoMovimentoAtualMinutos = calculadoraGargalo.obterPrevisaoMovimentoAtualMinutos(
    todosPedidos,
    historicoTemposReais
  );

  const termoBusca = normalizarTexto(buscaTexto);

  // Agrupa os produtos por categoria mantendo a ordem do Cardápio Real
  const gruposCategorias = useMemo(() => {
    const ordemCategorias: CategoriaProduto[] = [
      ...CATEGORIAS_CARDAPIO_REAL,
      ...CATEGORIAS_PRODUTO.filter(
        (c) => !(CATEGORIAS_CARDAPIO_REAL as readonly string[]).includes(c)
      ),
    ];

    return ordemCategorias
      .map((categoria) => {
        const itensDaCategoria = cardapio.filter((produto) => {
          if (produto.obterCategoria() !== categoria) return false;
          if (termoBusca !== '') {
            return normalizarTexto(produto.obterNome()).includes(termoBusca);
          }
          return true;
        });

        const qtdNaSacolaCategoria = itensDaCategoria.reduce(
          (soma, prod) => soma + (mapaQtdPorProduto.get(prod.obterId()) ?? 0),
          0
        );

        return {
          categoria,
          itens: itensDaCategoria,
          qtdNaSacolaCategoria,
        };
      })
      .filter((grupo) => grupo.itens.length > 0);
  }, [cardapio, termoBusca, mapaQtdPorProduto]);

  if (!visivel) return null;

  const pedidoRastreado =
    todosPedidos.find((p) => p.obterId() === pedidoAcompanhadoId) ?? todosPedidos[0];

  const alternarSanfonaCategoria = (categoria: string) => {
    setCategoriasAbertas((prev) => ({
      ...prev,
      [categoria]: !prev[categoria],
    }));
  };

  const expandirOuRecolherTodas = (expandir: boolean) => {
    const novoMapa: Record<string, boolean> = {};
    for (const grupo of gruposCategorias) {
      novoMapa[grupo.categoria] = expandir;
    }
    setCategoriasAbertas(novoMapa);
  };

  const handleAtivarAlertasNavegador = async () => {
    tocarSomPedidoPronto();
    const resultado = await solicitarPermissaoNotificacaoNavegador();
    setPermissaoNotificacao(resultado);
  };

  return (
    <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6 pb-28">
      {/* ===================================================================
          CABEÇALHO ENXUTO: ALUNO + PREVISÃO BASEADA NO MOVIMENTO ATUAL
          =================================================================== */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200 rounded-2xl px-4 py-3.5 shadow-2xs">
        {!editandoPerfilAluno ? (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#FF6B00] flex items-center justify-center font-bold text-xs shrink-0">
              {(perfilAluno.nome.charAt(0) || 'A').toUpperCase()}
            </div>
            <div className="text-xs sm:text-sm">
              <span className="font-extrabold text-slate-900">{perfilAluno.nome}</span>
              <button
                type="button"
                onClick={aoIniciarEdicaoAluno}
                className="ml-2 text-xs font-semibold text-[#FF6B00] hover:underline cursor-pointer"
              >
                Alterar
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-start gap-2">
            <div>
              <input
                type="text"
                value={rascunhoAluno.nome}
                onChange={(e) =>
                  aoAlterarRascunhoAluno({ ...rascunhoAluno, nome: e.target.value })
                }
                placeholder="Seu nome"
                aria-label="Nome do aluno"
                maxLength={LIMITES.nomePessoa.max}
                autoFocus
                className={`px-3 py-1.5 text-xs border rounded-lg focus:outline-none ${classeBordaCampo(
                  errosAluno.nome
                )}`}
              />
              <MensagemCampo id="erro-aluno-nome" erro={errosAluno.nome} />
            </div>
            <div>
              <input
                type="text"
                value={rascunhoAluno.matricula}
                onChange={(e) =>
                  aoAlterarRascunhoAluno({ ...rascunhoAluno, matricula: e.target.value })
                }
                placeholder="Matrícula"
                aria-label="Matrícula"
                maxLength={LIMITES.matricula.max}
                className={`w-28 px-3 py-1.5 text-xs font-mono tabular-nums border rounded-lg focus:outline-none ${classeBordaCampo(
                  errosAluno.matricula
                )}`}
              />
              <MensagemCampo id="erro-aluno-matricula" erro={errosAluno.matricula} />
            </div>
            <button
              type="button"
              onClick={aoSalvarPerfilAluno}
              className="px-3 py-1.5 text-xs font-bold text-white bg-slate-900 rounded-lg hover:bg-[#FF6B00] cursor-pointer"
            >
              Salvar
            </button>
            <button
              type="button"
              onClick={aoCancelarEdicaoAluno}
              className="px-2.5 py-1.5 text-xs font-bold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          {/* Diretriz 4: Previsão baseada no movimento atual (Média Móvel) */}
          <span className="inline-flex items-center gap-1.5 text-xs text-slate-700 bg-orange-50/70 border border-orange-200/80 px-3 py-1.5 rounded-xl">
            <Clock className="w-3.5 h-3.5 text-[#FF6B00] shrink-0" />
            <span>
              Previsão baseada no movimento atual:{' '}
              <strong className="text-slate-900 font-mono tabular-nums">
                ~{previsaoMovimentoAtualMinutos} min
              </strong>
            </span>
          </span>

          {permissaoNotificacao !== 'granted' && permissaoNotificacao !== 'indisponivel' && (
            <button
              type="button"
              onClick={handleAtivarAlertasNavegador}
              title="Permitir alerta sonoro e notificação do navegador quando seu pedido ficar pronto"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-[#FF6B00] bg-white border border-orange-200 hover:bg-orange-50 rounded-xl transition-colors cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ativar Alerta</span>
            </button>
          )}
        </div>
      </div>

      {/* ===================================================================
          FOCO 1: ACOMPANHAR STATUS (DIRETO, SEM IDs TÉCNICOS OU LOGS)
          =================================================================== */}
      {todosPedidos.length > 0 && pedidoRastreado && (
        <section
          aria-label="Acompanhar Status"
          className={`bg-white border rounded-2xl p-5 space-y-4 shadow-2xs transition-all ${
            pedidoRastreado.obterStatus() === 'Pronto para Retirada'
              ? 'border-2 border-emerald-500 ring-4 ring-emerald-500/10'
              : 'border-slate-200'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800">
                Acompanhar Status
              </h2>

              {todosPedidos.length > 1 && (
                <div className="flex flex-wrap items-center gap-1">
                  {todosPedidos.map((p) => (
                    <button
                      key={p.obterId()}
                      type="button"
                      onClick={() => aoSelecionarPedidoAcompanhado(p.obterId())}
                      className={`px-2.5 py-1 text-xs font-mono tabular-nums font-bold rounded-lg transition-colors cursor-pointer ${
                        pedidoRastreado.obterId() === p.obterId()
                          ? 'bg-[#FF6B00] text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {p.obterCodigoTicket()}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">
                {pedidoRastreado.obterTipoFila()}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-[#FF6B00] font-mono tabular-nums text-xs font-extrabold">
                Senha {pedidoRastreado.obterCodigoTicket()}
              </span>
            </div>
          </div>

          {pedidoRastreado.obterStatus() === 'Pronto para Retirada' && (
            <div className="p-3.5 rounded-xl bg-emerald-600 text-white flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 shrink-0" />
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-wider">
                    Seu pedido está pronto para retirada!
                  </p>
                  <p className="text-xs text-emerald-100">
                    Apresente a senha {pedidoRastreado.obterCodigoTicket()} em:{' '}
                    {pedidoRastreado.obterTipoFila()}.
                  </p>
                </div>
              </div>
            </div>
          )}

          {pedidoRastreado.obterStatus() === 'Cancelado' ? (
            <div className="p-3.5 rounded-xl border border-red-200 bg-red-50 text-red-900 flex items-center gap-2.5">
              <Ban className="w-4 h-4 shrink-0" />
              <p className="text-xs font-bold">
                Pedido cancelado. Procure o balcão caso precise de ajuda.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {ETAPAS_PEDIDO.map((etapa, idx) => {
                const indiceAtual = (ETAPAS_PEDIDO as readonly StatusPedido[]).indexOf(
                  pedidoRastreado.obterStatus()
                );
                const concluidoOuAtual = idx <= indiceAtual;
                const ehAtual = idx === indiceAtual;
                const rotuloAmigavel = etapa === 'Fazendo' ? 'Em Preparo' : etapa;

                return (
                  <div
                    key={etapa}
                    className={`px-3 py-2.5 rounded-xl border flex items-center justify-between transition-all ${
                      ehAtual
                        ? 'bg-orange-50/90 border-2 border-[#FF6B00] text-slate-950'
                        : concluidoOuAtual
                        ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                  >
                    <span className="text-xs font-extrabold">{rotuloAmigavel}</span>
                    {concluidoOuAtual && (
                      <CheckCircle2
                        className={`w-4 h-4 shrink-0 ${
                          ehAtual ? 'text-[#FF6B00]' : 'text-emerald-600'
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
            <div className="flex items-center gap-2 text-slate-700">
              {pedidoRastreado.ehFilaExpressa() ? (
                <BadgeCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <Store className="w-4 h-4 text-amber-600 shrink-0" />
              )}
              <span>
                <strong>
                  {pedidoRastreado
                    .obterItens()
                    .map((i) => `${i.obterQuantidade()}x ${i.obterNomeProduto()}`)
                    .join(', ')}
                </strong>{' '}
                · {formatarMoeda(pedidoRastreado.obterValorTotal())}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 font-mono tabular-nums">
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold">
                Previsão: ~{pedidoRastreado.obterTempoEstimadoInicial()} min
              </span>

              {pedidoRastreado.obterTempoRealPreparoMinutos() !== undefined && (
                <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-950 font-extrabold">
                  Tempo Real: {pedidoRastreado.obterTempoRealPreparoMinutos()} min
                </span>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ===================================================================
          FOCO 2: FAZER PEDIDO (MENUS EXPANSÍVEIS / SANFONADOS POR CATEGORIA)
          =================================================================== */}
      <section aria-label="Fazer Pedido" className="space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">
              Fazer Pedido
            </h2>
            <p className="text-xs text-slate-500">
              Toque em uma categoria para abrir os itens e clique em Pedir.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={buscaTexto}
                onChange={(e) => setBuscaTexto(e.target.value)}
                maxLength={60}
                aria-label="Buscar no cardápio"
                placeholder="Buscar item..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#FF6B00]"
              />
            </div>

            <button
              type="button"
              onClick={() =>
                expandirOuRecolherTodas(
                  Object.values(categoriasAbertas).filter(Boolean).length <
                    gruposCategorias.length
                )
              }
              className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl whitespace-nowrap cursor-pointer"
            >
              {Object.values(categoriasAbertas).filter(Boolean).length <
              gruposCategorias.length
                ? 'Expandir tudo'
                : 'Recolher tudo'}
            </button>
          </div>
        </div>

        {/* Lista de Categorias Sanfonadas (Accordion) */}
        {gruposCategorias.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-2">
            <p className="text-sm font-bold text-slate-700">
              Nenhum item encontrado para &ldquo;{buscaTexto}&rdquo;
            </p>
            <button
              type="button"
              onClick={() => setBuscaTexto('')}
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-slate-900 rounded-xl cursor-pointer"
            >
              Limpar busca
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {gruposCategorias.map(({ categoria, itens, qtdNaSacolaCategoria }) => {
              // Se houver busca ativa, abre automaticamente as categorias com resultados
              const aberta =
                termoBusca !== '' ? true : Boolean(categoriasAbertas[categoria]);

              return (
                <div
                  key={categoria}
                  className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs"
                >
                  {/* Cabeçalho da Sanfona (Accordion Header) */}
                  <button
                    type="button"
                    aria-expanded={aberta}
                    onClick={() => alternarSanfonaCategoria(categoria)}
                    className="w-full px-5 py-4 flex items-center justify-between gap-3 text-left hover:bg-slate-50/80 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm sm:text-base font-extrabold text-slate-900">
                        {categoria}
                      </span>
                      <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-slate-100 text-slate-600 font-mono tabular-nums">
                        {itens.length}
                      </span>
                      {qtdNaSacolaCategoria > 0 && (
                        <span className="px-2 py-0.5 text-[11px] font-extrabold rounded-full bg-[#FF6B00] text-white font-mono tabular-nums">
                          {qtdNaSacolaCategoria} na sacola
                        </span>
                      )}
                    </div>

                    <ChevronDown
                      className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${
                        aberta ? 'rotate-180 text-[#FF6B00]' : ''
                      }`}
                    />
                  </button>

                  {/* Corpo da Sanfona com os <MenuCard /> */}
                  {aberta && (
                    <div className="px-4 pb-4 pt-1 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-slate-50/40">
                      {itens.map((produto) => {
                        const tempoEstimado =
                          calculadoraGargalo.calcularTempoEstimadoProduto(
                            produto,
                            todosPedidos,
                            historicoTemposReais
                          );
                        const qtdNaSacola =
                          mapaQtdPorProduto.get(produto.obterId()) ?? 0;

                        return (
                          <MenuCard
                            key={produto.obterId()}
                            produto={produto}
                            tempoEstimadoMinutos={tempoEstimado}
                            quantidadeNaSacola={qtdNaSacola}
                            carrinhoNoLimite={carrinhoNoLimite}
                            aoPedir={aoAdicionarAoCarrinho}
                            aoAlterarQuantidade={aoAlterarQuantidadeCarrinho}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Barra Flutuante Inferior de Fechamento Rápido (Mobile / Desktop) */}
      {quantidadeTotalCarrinho > 0 && (
        <div className="fixed bottom-4 inset-x-4 max-w-xl mx-auto z-30">
          <button
            type="button"
            onClick={aoAbrirCarrinho}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-2xl px-5 py-3.5 shadow-xl flex items-center justify-between gap-4 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#FF6B00] flex items-center justify-center font-mono font-extrabold text-xs">
                {quantidadeTotalCarrinho}
              </div>
              <div className="text-left">
                <p className="text-xs font-extrabold flex items-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5 text-[#FF6B00]" />
                  <span>Ver Sacola e Confirmar</span>
                </p>
                <p className="text-[11px] text-slate-300">
                  Previsão baseada no movimento atual: ~{previsaoMovimentoAtualMinutos} min
                </p>
              </div>
            </div>

            <span className="font-mono tabular-nums font-extrabold text-sm sm:text-base text-[#FF6B00]">
              {formatarMoeda(valorTotalCarrinho)} →
            </span>
          </button>
        </div>
      )}
    </main>
  );
}
