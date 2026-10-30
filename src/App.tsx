/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Clock,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  Zap,
  Flame,
  CheckCircle2,
  AlertTriangle,
  ChefHat,
  ArrowRight,
  Edit3,
  Search,
  Receipt,
  BadgeCheck,
  User,
  X,
  Check,
  Utensils,
  Sparkles,
  Store,
  Smartphone,
} from 'lucide-react';

import {
  Produto,
  CategoriaProduto,
  TipoNaturezaCodigo,
  PreparoRapidoEstufa,
  PreparoNaHoraCozinha,
  Carrinho,
  CalculadoraGargaloFila,
  ProcessadorCheckout,
  criarDadosIniciaisCantina,
} from './domain/cantinaDomain';

type ModuloAtivo = 'boas_vindas' | 'aluno_vitrine' | 'aluno_tracker' | 'vendedor_painel';

interface NotificacaoToast {
  id: number;
  titulo: string;
  subtitulo?: string;
  tipo: 'sucesso' | 'aviso' | 'info';
}

const CATEGORIAS: ('Todos' | CategoriaProduto)[] = [
  'Todos',
  'Salgados',
  'Lanches na Chapa',
  'Bebidas',
  'Doces',
];

function formatarMoeda(valor: number): string {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function IlustracaoProdutoCantina({
  categoria,
  ehCozinha,
  tempoBase,
  tempoTotalEstimado,
  nome,
}: {
  categoria: CategoriaProduto;
  ehCozinha: boolean;
  tempoBase: number;
  tempoTotalEstimado: number;
  nome: string;
}) {
  return (
    <div
      className={`relative w-full h-40 flex items-center justify-center overflow-hidden border-b border-slate-100 ${
        ehCozinha
          ? 'bg-gradient-to-br from-amber-50/90 via-orange-50/50 to-slate-100'
          : 'bg-gradient-to-br from-emerald-50/60 via-slate-50 to-orange-50/30'
      }`}
    >
      {/* Badge de Velocidade / Natureza de Preparo no canto superior */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold shadow-2xs ${
            ehCozinha
              ? 'bg-amber-950/90 text-amber-200'
              : 'bg-emerald-900/90 text-emerald-100'
          }`}
        >
          {ehCozinha ? (
            <>
              <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Feito na Hora · Chapa</span>
            </>
          ) : (
            <>
              <Zap className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
              <span>Pronto / Estufa</span>
            </>
          )}
        </span>

        <span className="px-2.5 py-1 rounded-md bg-white/95 text-slate-900 text-xs font-mono tabular-nums font-bold shadow-2xs border border-slate-200/80">
          ~{tempoTotalEstimado} min
        </span>
      </div>

      {/* Ilustração vetorial culinária */}
      <svg
        className="w-20 h-20 text-[#FF6B00]/85 transition-transform duration-200 group-hover:scale-105 mt-3"
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label={nome}
      >
        <circle cx="40" cy="40" r="30" fill="currentColor" fillOpacity="0.08" />
        {categoria === 'Salgados' && (
          <>
            <path
              d="M40 16C31 26 24 36 24 46C24 55.3888 31.1634 62 40 62C48.8366 62 56 55.3888 56 46C56 36 49 26 40 16Z"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="currentColor"
              fillOpacity="0.15"
            />
            <path
              d="M33 46C33 50 36 53 40 53"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </>
        )}
        {categoria === 'Lanches na Chapa' && (
          <>
            <rect
              x="18"
              y="28"
              width="44"
              height="10"
              rx="5"
              stroke="currentColor"
              strokeWidth="2.5"
              fill="currentColor"
              fillOpacity="0.15"
            />
            <path
              d="M16 43H64"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <rect
              x="20"
              y="48"
              width="40"
              height="9"
              rx="4.5"
              stroke="currentColor"
              strokeWidth="2.5"
              fill="currentColor"
              fillOpacity="0.15"
            />
            <path
              d="M30 20C30 17 32 15 32 12M40 20C40 17 42 15 42 12M50 20C50 17 52 15 52 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </>
        )}
        {categoria === 'Bebidas' && (
          <>
            <path
              d="M27 24H53L49 60H31L27 24Z"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinejoin="round"
              fill="currentColor"
              fillOpacity="0.15"
            />
            <path
              d="M24 24H56"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d="M40 24V15L47 12"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        )}
        {categoria === 'Doces' && (
          <>
            <path
              d="M22 36L40 24L58 36V54L40 60L22 54V36Z"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinejoin="round"
              fill="currentColor"
              fillOpacity="0.15"
            />
            <path
              d="M22 45L40 51L58 45"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </>
        )}
      </svg>

      {/* Rodapé informativo na base da ilustração */}
      <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[11px] font-medium text-slate-600">
        <span>{categoria}</span>
        <span>
          {ehCozinha
            ? `Base ${tempoBase} min + fila da chapa`
            : `Retirada rápida (${tempoBase} min)`}
        </span>
      </div>
    </div>
  );
}

export default function App() {
  const dadosIniciais = useMemo(() => criarDadosIniciaisCantina(), []);

  const [cardapio, setCardapio] = useState<Produto[]>(dadosIniciais.cardapioInicial);
  const [gerenciadorPedidos] = useState(() => dadosIniciais.gerenciadorInicial);
  const [processadoresCheckout] = useState<ProcessadorCheckout[]>(
    () => dadosIniciais.processadoresDisponiveis
  );
  const [carrinho] = useState(() => new Carrinho());
  const [calculadoraGargalo] = useState(() => new CalculadoraGargaloFila());

  const [versaoEstado, setVersaoEstado] = useState<number>(0);
  const sincronizarInterface = () => setVersaoEstado((v) => v + 1);

  // Inicia na Tela de Boas-Vindas (Home/Landing Screen)
  const [moduloAtivo, setModuloAtivo] = useState<ModuloAtivo>('boas_vindas');

  // Perfis Pré-Definidos conforme especificação
  const [alunoNome, setAlunoNome] = useState<string>('Filipe Falcão');
  const [alunoMatricula, setAlunoMatricula] = useState<string>('2026.2.001');
  const [editandoPerfilAluno, setEditandoPerfilAluno] = useState<boolean>(false);

  const [operadorNome, setOperadorNome] = useState<string>('Carlos Silva - Turno Manhã');
  const [operadorId, setOperadorId] = useState<string>('OP-01');
  const [editandoPerfilOperador, setEditandoPerfilOperador] = useState<boolean>(false);

  // Controles da Vitrine do Aluno
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<'Todos' | CategoriaProduto>('Todos');
  const [filtroNatureza, setFiltroNatureza] = useState<'TODOS' | TipoNaturezaCodigo>('TODOS');
  const [buscaTexto, setBuscaTexto] = useState<string>('');
  const [drawerCarrinhoAberto, setDrawerCarrinhoAberto] = useState<boolean>(false);
  const [codigoMetodoSelecionado, setCodigoMetodoSelecionado] = useState<string>('PAGAR_NO_APP');
  const [pedidoAcompanhadoId, setPedidoAcompanhadoId] = useState<string>('ped-101');

  // Controles do Painel do Vendedor (KDS + CRUD Modal/Inline)
  const [abaVendedor, setAbaVendedor] = useState<'kds' | 'cardapio'>('kds');
  const [filtroStatusKDS, setFiltroStatusKDS] = useState<'ATIVOS' | 'TODOS'>('ATIVOS');
  const [produtoEditando, setProdutoEditando] = useState<Produto | null>(null);

  // Campos para adicionar novo produto
  const [novoNome, setNovoNome] = useState<string>('');
  const [novoPreco, setNovoPreco] = useState<string>('');
  const [novaCategoria, setNovaCategoria] = useState<CategoriaProduto>('Salgados');
  const [novaNatureza, setNovaNatureza] = useState<TipoNaturezaCodigo>('ESTUFA_RAPIDO');
  const [novoTempoBase, setNovoTempoBase] = useState<string>('2');
  const [novaDescricao, setNovaDescricao] = useState<string>('');

  // Campos para o modal de edição de produto existente
  const [editNome, setEditNome] = useState<string>('');
  const [editPreco, setEditPreco] = useState<string>('');
  const [editCategoria, setEditCategoria] = useState<CategoriaProduto>('Salgados');
  const [editNatureza, setEditNatureza] = useState<TipoNaturezaCodigo>('ESTUFA_RAPIDO');
  const [editTempoBase, setEditTempoBase] = useState<string>('2');
  const [editDescricao, setEditDescricao] = useState<string>('');

  // Sistema de Notificações Toast
  const [toasts, setToasts] = useState<NotificacaoToast[]>([]);
  const dispararToast = (
    titulo: string,
    subtitulo?: string,
    tipo: 'sucesso' | 'aviso' | 'info' = 'sucesso'
  ) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, titulo, subtitulo, tipo }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3400);
  };

  // Leituras em tempo real do estado em memória
  const todosPedidos = gerenciadorPedidos.obterTodosPedidos();
  const itensCarrinho = carrinho.obterItens();
  const valorTotalCarrinho = carrinho.calcularValorTotal();
  const quantidadeTotalCarrinho = carrinho.obterQuantidadeTotalItens();

  // Cálculo Dinâmico de Gargalo na Cozinha
  const minutosGargaloAtivoChapa = calculadoraGargalo.calcularMinutosGargaloCozinha(todosPedidos);
  const qtdPedidosAtivosNaChapa = calculadoraGargalo.contarPedidosAtivosNaCozinha(todosPedidos);
  const diagnosticoCarrinho = calculadoraGargalo.diagnosticarCarrinho(carrinho, todosPedidos);

  // Filtragem de produtos na vitrine do aluno
  const produtosVitrine = cardapio.filter((produto) => {
    if (categoriaSelecionada !== 'Todos' && produto.obterCategoria() !== categoriaSelecionada) {
      return false;
    }
    if (filtroNatureza !== 'TODOS' && produto.obterCodigoNatureza() !== filtroNatureza) {
      return false;
    }
    if (buscaTexto.trim() !== '') {
      const termo = buscaTexto.toLowerCase();
      const bateNome = produto.obterNome().toLowerCase().includes(termo);
      const bateDesc = produto.obterDescricao().toLowerCase().includes(termo);
      if (!bateNome && !bateDesc) return false;
    }
    return true;
  });

  // Ações de Seleção de Perfil na Tela Inicial
  const entrarComoCompradorAluno = () => {
    setModuloAtivo('aluno_vitrine');
    dispararToast(
      `Bem-vindo, ${alunoNome}!`,
      `Matrícula ${alunoMatricula} conectada para autoatendimento rápido.`,
      'info'
    );
  };

  const entrarComoVendedorCantina = () => {
    setModuloAtivo('vendedor_painel');
    dispararToast(
      'Painel da Cantina Ativo',
      `Operador logado: ${operadorNome} (${operadorId})`,
      'info'
    );
  };

  // Ações do Carrinho
  const handleAdicionarAoCarrinho = (produto: Produto) => {
    carrinho.adicionarProduto(produto, 1);
    sincronizarInterface();
    const tempoEst = calculadoraGargalo.calcularTempoEstimadoProduto(produto, todosPedidos);
    dispararToast(
      `${produto.obterNome()} adicionado!`,
      `Estimativa atual: ~${tempoEst} min · Total no carrinho: ${carrinho.obterQuantidadeTotalItens()} iten(s)`,
      'sucesso'
    );
  };

  const handleAlterarQuantidadeCarrinho = (produtoId: string, novaQtd: number) => {
    carrinho.alterarQuantidade(produtoId, novaQtd);
    sincronizarInterface();
  };

  const handleRemoverDoCarrinho = (produtoId: string) => {
    carrinho.removerProduto(produtoId);
    sincronizarInterface();
  };

  const handleSubstituirChapaPorEstufa = () => {
    const opcoesEstufa = cardapio.filter((p) => !p.utilizaGargaloCozinha());
    if (opcoesEstufa.length === 0) return;

    for (const item of carrinho.obterItens()) {
      if (item.utilizaGargaloCozinha()) {
        carrinho.removerProduto(item.obterProdutoId());
      }
    }
    carrinho.adicionarProduto(opcoesEstufa[0], 1);
    sincronizarInterface();
    dispararToast(
      'Pedido otimizado para Estufa Expressa!',
      `Itens de chapa trocados por ${opcoesEstufa[0].obterNome()} (~${opcoesEstufa[0].obterTempoBaseMinutos()} min).`,
      'sucesso'
    );
  };

  // Finalização de Checkout e Roteamento de Filas
  const handleFinalizarPedido = (e: React.FormEvent) => {
    e.preventDefault();
    if (carrinho.estaVazio()) {
      dispararToast('Seu carrinho está vazio', 'Adicione pelo menos um item para continuar.', 'aviso');
      return;
    }

    const processadorEscolhido =
      processadoresCheckout.find((p) => p.obterCodigo() === codigoMetodoSelecionado) ??
      processadoresCheckout[0];

    const novoPedido = gerenciadorPedidos.finalizarPedido(
      { nome: alunoNome || 'Filipe Falcão', matricula: alunoMatricula || '2026.2.001' },
      carrinho,
      processadorEscolhido,
      calculadoraGargalo
    );

    setPedidoAcompanhadoId(novoPedido.obterId());
    setDrawerCarrinhoAberto(false);
    sincronizarInterface();
    setModuloAtivo('aluno_tracker');

    dispararToast(
      `Pedido ${novoPedido.obterCodigoTicket()} enviado!`,
      `${novoPedido.obterNomeTicketFila()} gerado com sucesso.`,
      'sucesso'
    );
  };

  // Ações do KDS (Visão Funcionário)
  const handleAvancarStatusPedido = (pedidoId: string) => {
    const pedido = gerenciadorPedidos.avancarStatusPedido(pedidoId, operadorNome);
    sincronizarInterface();
    if (pedido) {
      dispararToast(
        `Pedido ${pedido.obterCodigoTicket()} → ${pedido.obterStatus()}`,
        pedido.obterStatus() === 'Pronto para Retirada'
          ? 'Fila da cozinha recalculada automaticamente para os alunos!'
          : `Atualizado por ${operadorNome}`,
        'sucesso'
      );
    }
  };

  // Ações de Gestão de Cardápio (CRUD)
  const handleCriarNovoProduto = (e: React.FormEvent) => {
    e.preventDefault();
    const precoNum = parseFloat(novoPreco.replace(',', '.'));
    const tempoNum = parseInt(novoTempoBase, 10) || (novaNatureza === 'ESTUFA_RAPIDO' ? 2 : 6);

    if (!novoNome.trim() || Number.isNaN(precoNum) || precoNum <= 0) {
      dispararToast('Dados inválidos', 'Informe o nome e um valor maior que zero.', 'aviso');
      return;
    }

    const estrategia =
      novaNatureza === 'ESTUFA_RAPIDO'
        ? new PreparoRapidoEstufa(tempoNum)
        : new PreparoNaHoraCozinha(tempoNum, 3);

    const novoProduto = new Produto({
      nome: novoNome,
      preco: precoNum,
      categoria: novaCategoria,
      naturezaPreparo: estrategia,
      descricao:
        novaDescricao.trim() ||
        (novaNatureza === 'ESTUFA_RAPIDO'
          ? 'Pronto na estufa para retirada rápida no intervalo.'
          : 'Preparado na hora na chapa quente da cantina.'),
    });

    setCardapio((prev) => [novoProduto, ...prev]);
    setNovoNome('');
    setNovoPreco('');
    setNovaDescricao('');
    setNovaNatureza('ESTUFA_RAPIDO');
    setNovoTempoBase('2');
    sincronizarInterface();

    dispararToast(
      'Produto cadastrado no cardápio!',
      `${novoProduto.obterNome()} já está visível na vitrine dos alunos.`,
      'sucesso'
    );
  };

  const abrirModalEdicaoProduto = (produto: Produto) => {
    setProdutoEditando(produto);
    setEditNome(produto.obterNome());
    setEditPreco(String(produto.obterPreco()));
    setEditCategoria(produto.obterCategoria());
    setEditNatureza(produto.obterCodigoNatureza());
    setEditTempoBase(String(produto.obterTempoBaseMinutos()));
    setEditDescricao(produto.obterDescricao());
  };

  const handleSalvarEdicaoProduto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!produtoEditando) return;

    const precoNum = parseFloat(editPreco.replace(',', '.'));
    const tempoNum = parseInt(editTempoBase, 10) || (editNatureza === 'ESTUFA_RAPIDO' ? 2 : 6);

    if (!editNome.trim() || Number.isNaN(precoNum) || precoNum <= 0) {
      dispararToast('Verifique os campos', 'Informe um nome válido e preço positivo.', 'aviso');
      return;
    }

    const estrategia =
      editNatureza === 'ESTUFA_RAPIDO'
        ? new PreparoRapidoEstufa(tempoNum)
        : new PreparoNaHoraCozinha(tempoNum, 3);

    produtoEditando.atualizarDados({
      nome: editNome,
      preco: precoNum,
      categoria: editCategoria,
      naturezaPreparo: estrategia,
      descricao: editDescricao,
    });

    const nomeAtualizado = produtoEditando.obterNome();
    setProdutoEditando(null);
    sincronizarInterface();

    dispararToast(
      'Produto atualizado!',
      `As alterações em "${nomeAtualizado}" já estão ativas na vitrine do aluno.`,
      'sucesso'
    );
  };

  const pedidoRastreado =
    gerenciadorPedidos.buscarPedidoPorId(pedidoAcompanhadoId) ?? todosPedidos[0];

  const qtdPedidosAtivosTotais = todosPedidos.filter(
    (p) => p.obterStatus() !== 'Entregue'
  ).length;

  return (
    <div
      className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A]"
      data-version={versaoEstado}
    >
      {/* =====================================================================
          TOAST NOTIFICATIONS (Microinterações Fluídas)
          ===================================================================== */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-lg border backdrop-blur-md transition-all duration-200 ${
              t.tipo === 'sucesso'
                ? 'bg-slate-900/95 text-white border-slate-800'
                : t.tipo === 'aviso'
                ? 'bg-amber-950/95 text-amber-100 border-amber-800'
                : 'bg-slate-900/95 text-white border-slate-700'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                t.tipo === 'sucesso'
                  ? 'bg-[#FF6B00] text-white'
                  : t.tipo === 'aviso'
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-emerald-500 text-slate-950'
              }`}
            >
              {t.tipo === 'aviso' ? (
                <AlertTriangle className="w-3.5 h-3.5" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold leading-snug">{t.titulo}</p>
              {t.subtitulo && (
                <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                  {t.subtitulo}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* =====================================================================
          TOP BAR CONTRACT (Marca | Navegação Rápida de Módulos | Ação Contextual)
          ===================================================================== */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 px-6 py-3.5">
        <div className="max-w-[1360px] mx-auto flex items-center justify-between gap-8">
          {/* Zona 1: Brand Wordmark */}
          <a
            href="#inicio"
            onClick={(e) => {
              e.preventDefault();
              setModuloAtivo('boas_vindas');
            }}
            className="text-lg font-extrabold tracking-tight text-slate-900 whitespace-nowrap shrink-0 font-display"
          >
            Fast-Track <span className="text-[#FF6B00]">Cantina</span>
          </a>

          {/* Zona 2: Seletor Rápido de Visões no Topo (Sem perder dados em memória) */}
          <nav className="flex items-center gap-6 text-sm font-medium text-slate-600 overflow-x-auto">
            <button
              type="button"
              onClick={() => setModuloAtivo('boas_vindas')}
              className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 cursor-pointer ${
                moduloAtivo === 'boas_vindas'
                  ? 'border-[#FF6B00] text-slate-950 font-semibold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              Início
            </button>
            <button
              type="button"
              onClick={() => setModuloAtivo('aluno_vitrine')}
              className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 cursor-pointer ${
                moduloAtivo === 'aluno_vitrine'
                  ? 'border-[#FF6B00] text-slate-950 font-semibold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              Comprador · Vitrine
            </button>
            <button
              type="button"
              onClick={() => setModuloAtivo('aluno_tracker')}
              className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 cursor-pointer ${
                moduloAtivo === 'aluno_tracker'
                  ? 'border-[#FF6B00] text-slate-950 font-semibold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              Live Tracker ({qtdPedidosAtivosTotais})
            </button>
            <button
              type="button"
              onClick={() => setModuloAtivo('vendedor_painel')}
              className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 cursor-pointer ${
                moduloAtivo === 'vendedor_painel'
                  ? 'border-[#FF6B00] text-slate-950 font-semibold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              Vendedor · Painel KDS
            </button>
          </nav>

          {/* Zona 3: 1 Primary CTA Button */}
          <div className="flex items-center shrink-0">
            {moduloAtivo === 'vendedor_painel' ? (
              <button
                type="button"
                onClick={() => setModuloAtivo('aluno_vitrine')}
                className="px-4 py-2 text-xs font-bold text-white bg-[#0F172A] hover:bg-[#FF6B00] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Alternar para Visão Aluno
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (moduloAtivo === 'boas_vindas') {
                    setModuloAtivo('aluno_vitrine');
                  }
                  setDrawerCarrinhoAberto(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#FF6B00] hover:bg-orange-600 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-xs"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>
                  Carrinho ({quantidadeTotalCarrinho}) · {formatarMoeda(valorTotalCarrinho)}
                </span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* =====================================================================
          TELA 1: BOAS-VINDAS (HOME / LANDING SCREEN CENTRALIZADA)
          ===================================================================== */}
      {moduloAtivo === 'boas_vindas' && (
        <main className="flex-1 flex flex-col justify-center px-6 py-12 bg-gradient-to-b from-white via-[#F8FAFC] to-slate-100/70">
          <div className="max-w-4xl w-full mx-auto text-center space-y-10">
            {/* Hero Header */}
            <div className="space-y-4 max-w-2xl mx-auto">
              <p className="text-xs font-bold tracking-wider uppercase text-[#FF6B00]">
                CESAR School · Autoatendimento &amp; Gestão de Filas
              </p>
              <h1
                className="text-3xl sm:text-5xl font-extrabold text-slate-950 font-display tracking-tight leading-tight"
                style={{ textWrap: 'balance' }}
              >
                Faça seu intervalo de 15 minutos render sem filas.
              </h1>
              <p className="text-base text-slate-600 leading-relaxed">
                Peça pela vitrine inteligente com previsão em tempo real da cozinha e retire direto no{' '}
                <strong className="text-slate-900">Balcão Expresso (Fast-Pass)</strong>, ou gerencie a produção dos pedidos no painel operacional da cantina.
              </p>
            </div>

            {/* Dois Grandes Cards / Botões de Seleção de Perfil Pré-Configurados */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              {/* Card 1: Entrar como Comprador (Aluno) */}
              <div className="group bg-white border-2 border-slate-200 hover:border-[#FF6B00] rounded-2xl p-7 flex flex-col justify-between space-y-6 transition-all duration-150 shadow-xs hover:shadow-md">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-orange-50 text-[#FF6B00] flex items-center justify-center">
                    <Utensils className="w-6 h-6" />
                  </div>

                  <div className="space-y-1.5">
                    <h2 className="text-xl font-extrabold text-slate-900 font-display">
                      Módulo Comprador (Aluno)
                    </h2>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Acesse o cardápio separado por velocidade de preparo (Estufa Expressa vs. Cozinha na Hora), veja o tempo real de espera e gere seu ticket Fast-Pass.
                    </p>
                  </div>

                  {/* Credencial Prefixada Carregada Automaticamente */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Sessão de Aluno Pré-Carregada
                    </p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900">{alunoNome}</span>
                      <span className="font-mono tabular-nums font-semibold text-[#FF6B00]">
                        Matrícula: {alunoMatricula}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={entrarComoCompradorAluno}
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
                      Módulo Vendedor (Cantina)
                    </h2>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Gerencie a fila de produção no KDS com 1 clique, identifique pedidos pagos no App vs. Caixa presencial e atualize o cardápio em tempo real.
                    </p>
                  </div>

                  {/* Credencial de Operador Prefixada */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Operador de Turno Pré-Carregado
                    </p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900">{operadorNome}</span>
                      <span className="font-mono tabular-nums font-semibold text-slate-700">
                        ID: {operadorId}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={entrarComoVendedorCantina}
                  className="w-full py-3.5 px-5 text-sm font-bold text-white bg-[#0F172A] hover:bg-slate-800 rounded-xl transition-colors flex items-center justify-between cursor-pointer shadow-xs"
                >
                  <span>Entrar como Vendedor (Cantina)</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>

            {/* Resumo Vivo da Operação Atual */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
              <span>
                Status da Cozinha Agora:{' '}
                <strong className="text-slate-900 font-mono tabular-nums">
                  {qtdPedidosAtivosNaChapa} pedido(s) na chapa (+{minutosGargaloAtivoChapa} min)
                </strong>
              </span>
              <span aria-hidden="true">·</span>
              <span>
                Estufa Expressa:{' '}
                <strong className="text-emerald-700 font-mono tabular-nums">
                  1 a 2 min (Retirada Imediata)
                </strong>
              </span>
              <span aria-hidden="true">·</span>
              <span>
                Cardápio Ativo:{' '}
                <strong className="text-slate-900 font-mono tabular-nums">
                  {cardapio.length} produtos disponíveis
                </strong>
              </span>
            </div>
          </div>
        </main>
      )}

      {/* =====================================================================
          TELA 2: VISÃO DO ALUNO / COMPRADOR (VITRINE INTELIGENTE)
          ===================================================================== */}
      {moduloAtivo === 'aluno_vitrine' && (
        <main className="flex-1 max-w-[1360px] w-full mx-auto px-6 py-8 space-y-6">
          {/* Cabeçalho de Identificação do Aluno Logado + Resumo de Fila da Cozinha */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-orange-50 text-[#FF6B00] flex items-center justify-center font-display font-bold text-base shrink-0">
                {alunoNome.charAt(0).toUpperCase()}
              </div>

              {!editandoPerfilAluno ? (
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-base font-extrabold text-slate-900 font-display">
                      {alunoNome}
                    </span>
                    <span className="text-xs font-mono tabular-nums text-slate-500">
                      · Matrícula {alunoMatricula}
                    </span>
                    <button
                      type="button"
                      onClick={() => setEditandoPerfilAluno(true)}
                      className="text-xs font-semibold text-[#FF6B00] hover:underline cursor-pointer ml-1"
                    >
                      Trocar aluno
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Escolha seus itens abaixo. Os tempos de preparo já incluem a movimentação atual da cozinha.
                  </p>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    value={alunoNome}
                    onChange={(e) => setAlunoNome(e.target.value)}
                    placeholder="Nome do Aluno"
                    className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-[#FF6B00]"
                  />
                  <input
                    type="text"
                    value={alunoMatricula}
                    onChange={(e) => setAlunoMatricula(e.target.value)}
                    placeholder="Matrícula"
                    className="w-32 px-3 py-1.5 text-xs font-mono tabular-nums bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-[#FF6B00]"
                  />
                  <button
                    type="button"
                    onClick={() => setEditandoPerfilAluno(false)}
                    className="px-3 py-1.5 text-xs font-bold text-white bg-slate-900 rounded-lg hover:bg-[#FF6B00] cursor-pointer"
                  >
                    Salvar
                  </button>
                </div>
              )}
            </div>

            {/* Indicador Dinâmico da Cozinha e Atalho para Pedidos Ativos */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <span className="text-slate-500">Fila atual na Chapa: </span>
                <strong className="font-mono tabular-nums text-slate-900">
                  +{minutosGargaloAtivoChapa} min ({qtdPedidosAtivosNaChapa} em preparo)
                </strong>
              </div>

              <button
                type="button"
                onClick={() => setModuloAtivo('aluno_tracker')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#FF6B00] bg-orange-50 hover:bg-orange-100 rounded-xl transition-colors cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Acompanhar Meus Pedidos ({qtdPedidosAtivosTotais})</span>
              </button>
            </div>
          </div>

          {/* Barra de Filtros: Natureza de Preparo (Estufa vs Chapa) + Abas de Categoria + Busca */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Filtro por Natureza de Preparo */}
              <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setFiltroNatureza('TODOS')}
                  className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    filtroNatureza === 'TODOS'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Todos os Preparos
                </button>
                <button
                  type="button"
                  onClick={() => setFiltroNatureza('ESTUFA_RAPIDO')}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    filtroNatureza === 'ESTUFA_RAPIDO'
                      ? 'bg-emerald-700 text-white shadow-2xs'
                      : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Pronto / Estufa (~1 a 2 min)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFiltroNatureza('COZINHA_NA_HORA')}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    filtroNatureza === 'COZINHA_NA_HORA'
                      ? 'bg-amber-900 text-white shadow-2xs'
                      : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>Feito na Hora · Chapa (5–8m + {minutosGargaloAtivoChapa}m fila)</span>
                </button>
              </div>

              {/* Campo de Busca */}
              <div className="relative min-w-[240px] flex-1 sm:flex-initial">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={buscaTexto}
                  onChange={(e) => setBuscaTexto(e.target.value)}
                  placeholder="Buscar coxinha, tapioca, café, suco..."
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#FF6B00] focus:bg-white"
                />
              </div>
            </div>

            {/* Abas de Categorias */}
            <div className="flex items-center gap-2 overflow-x-auto pt-3 border-t border-slate-100">
              {CATEGORIAS.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoriaSelecionada(cat)}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    categoriaSelecionada === cat
                      ? 'bg-[#0F172A] text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Grid da Vitrine de Produtos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {produtosVitrine.map((produto) => {
              const ehCozinha = produto.utilizaGargaloCozinha();
              const tempoBase = produto.obterTempoBaseMinutos();
              const tempoTotalEstimado = calculadoraGargalo.calcularTempoEstimadoProduto(
                produto,
                todosPedidos
              );

              return (
                <article
                  key={produto.obterId()}
                  className="group bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div>
                    <IlustracaoProdutoCantina
                      categoria={produto.obterCategoria()}
                      ehCozinha={ehCozinha}
                      tempoBase={tempoBase}
                      tempoTotalEstimado={tempoTotalEstimado}
                      nome={produto.obterNome()}
                    />

                    <div className="p-5 space-y-2">
                      <h2 className="text-base font-extrabold text-slate-900 font-display leading-snug">
                        {produto.obterNome()}
                      </h2>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {produto.obterDescricao()}
                      </p>
                    </div>
                  </div>

                  <div className="px-5 py-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-3">
                    <div>
                      <span className="block text-[10px] font-semibold uppercase text-slate-400">
                        Valor Unitário
                      </span>
                      <span className="text-lg font-extrabold text-slate-900 font-mono tabular-nums">
                        {formatarMoeda(produto.obterPreco())}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAdicionarAoCarrinho(produto)}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-[#0F172A] hover:bg-[#FF6B00] rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Adicionar</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </main>
      )}

      {/* =====================================================================
          TELA 3: ACOMPANHAMENTO DE PEDIDOS (LIVE TRACKER DO ALUNO)
          ===================================================================== */}
      {moduloAtivo === 'aluno_tracker' && (
        <main className="flex-1 max-w-[1360px] w-full mx-auto px-6 py-8 space-y-7">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 font-display">
                Acompanhamento de Pedido (Live Tracker)
              </h1>
              <p className="text-sm text-slate-600">
                Acompanhe o preparo em tempo real e veja o balcão indicado para sua retirada.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setModuloAtivo('aluno_vitrine')}
                className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 cursor-pointer"
              >
                Voltar ao Cardápio
              </button>
              <button
                type="button"
                onClick={() => setModuloAtivo('vendedor_painel')}
                className="px-4 py-2 text-xs font-bold text-white bg-[#0F172A] rounded-xl hover:bg-slate-800 cursor-pointer"
              >
                Abrir KDS da Cozinha
              </button>
            </div>
          </div>

          {/* Abas de Pedidos Ativos para Acompanhamento */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-500 mr-2">
              Pedidos na Fila:
            </span>
            {todosPedidos.map((p) => (
              <button
                key={p.obterId()}
                type="button"
                onClick={() => setPedidoAcompanhadoId(p.obterId())}
                className={`px-3.5 py-2 text-xs font-mono tabular-nums font-bold rounded-xl border transition-colors cursor-pointer ${
                  pedidoRastreado?.obterId() === p.obterId()
                    ? 'bg-[#FF6B00] text-white border-[#FF6B00]'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {p.obterCodigoTicket()} · {p.obterAlunoNome()} ({p.obterStatus()})
              </button>
            ))}
          </div>

          {pedidoRastreado && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Progresso Principal e Destaque do Balcão */}
              <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 space-y-6">
                <div className="flex flex-wrap items-start justify-between gap-4 pb-5 border-b border-slate-100">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="font-mono tabular-nums font-bold text-slate-800">
                        Pedido #{pedidoRastreado.obterCodigoTicket()}
                      </span>
                      <span>·</span>
                      <span>Realizado às {pedidoRastreado.obterHorarioCriacao()}</span>
                      <span>·</span>
                      <span>Matrícula {pedidoRastreado.obterAlunoMatricula()}</span>
                    </div>
                    <h2 className="text-2xl font-extrabold text-slate-900 font-display">
                      {pedidoRastreado.obterAlunoNome()}
                    </h2>
                  </div>

                  {/* Destaque Visual do Tipo de Fila (Balcão Expresso vs Fila do Caixa) */}
                  <div
                    className={`px-4 py-3 rounded-xl border text-right ${
                      pedidoRastreado.ehFilaExpressa()
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                        : 'bg-amber-50 border-amber-300 text-amber-950'
                    }`}
                  >
                    <p className="text-[11px] font-bold uppercase tracking-wider opacity-75">
                      {pedidoRastreado.obterNomeTicketFila()}
                    </p>
                    <p className="text-sm font-extrabold mt-0.5">
                      Destino: {pedidoRastreado.obterTipoFila()}
                    </p>
                  </div>
                </div>

                {/* Barra de Progresso em 4 Etapas */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-600">
                      Status do Preparo em Tempo Real
                    </span>
                    <span className="font-mono tabular-nums font-bold text-[#FF6B00]">
                      Estimativa: ~{pedidoRastreado.obterTempoEstimadoInicial()} min
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    {(
                      [
                        'Recebido',
                        'Fazendo',
                        'Pronto para Retirada',
                        'Entregue',
                      ] as const
                    ).map((etapa, idx) => {
                      const ordem = [
                        'Recebido',
                        'Fazendo',
                        'Pronto para Retirada',
                        'Entregue',
                      ];
                      const indiceAtual = ordem.indexOf(pedidoRastreado.obterStatus());
                      const concluidoOuAtual = idx <= indiceAtual;
                      const ehAtual = idx === indiceAtual;

                      return (
                        <div
                          key={etapa}
                          className={`p-4 rounded-xl border transition-all ${
                            ehAtual
                              ? 'bg-orange-50/90 border-2 border-[#FF6B00] text-slate-950 shadow-2xs'
                              : concluidoOuAtual
                              ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                              : 'bg-slate-50 border-slate-200 text-slate-400'
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs font-mono tabular-nums mb-1.5">
                            <span className="font-bold">Passo 0{idx + 1}</span>
                            {concluidoOuAtual && (
                              <CheckCircle2
                                className={`w-4 h-4 ${
                                  ehAtual ? 'text-[#FF6B00]' : 'text-emerald-600'
                                }`}
                              />
                            )}
                          </div>
                          <p className="text-xs font-extrabold">{etapa}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Orientação clara de Retirada */}
                <div
                  className={`p-5 rounded-xl border flex items-start gap-3.5 ${
                    pedidoRastreado.ehFilaExpressa()
                      ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                      : 'bg-amber-50/80 border-amber-300 text-amber-950'
                  }`}
                >
                  {pedidoRastreado.ehFilaExpressa() ? (
                    <BadgeCheck className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <Store className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <p className="text-sm font-extrabold">
                      {pedidoRastreado.ehFilaExpressa()
                        ? 'Dirija-se ao Balcão de Retirada Expressa (Fast-Pass)'
                        : 'Dirija-se à Fila do Caixa para Pagamento e Retirada'}
                    </p>
                    <p className="text-xs leading-relaxed">
                      {pedidoRastreado.obterInstrucaoAluno()}
                    </p>
                  </div>
                </div>

                {/* Lista de Itens do Pedido */}
                <div className="space-y-2.5">
                  <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Resumo dos Itens
                  </h3>
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl">
                    {pedidoRastreado.obterItens().map((item) => (
                      <div
                        key={item.obterProdutoId()}
                        className="px-4 py-3 flex items-center justify-between text-sm"
                      >
                        <div>
                          <span className="font-mono tabular-nums font-bold text-slate-900 mr-2">
                            {item.obterQuantidade()}x
                          </span>
                          <span className="font-semibold text-slate-800">
                            {item.obterNomeProduto()}
                          </span>
                          <span className="text-xs text-slate-500 ml-2">
                            ·{' '}
                            {item.utilizaGargaloCozinha()
                              ? 'Feito na Hora (Chapa)'
                              : 'Pronto / Estufa'}
                          </span>
                        </div>
                        <span className="font-mono tabular-nums font-bold text-slate-900">
                          {formatarMoeda(item.calcularSubtotal())}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Lateral do Ticket */}
              <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
                <div className="text-center p-5 rounded-xl bg-slate-900 text-white space-y-1">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Código de Retirada no Balcão
                  </p>
                  <p className="text-3xl font-extrabold font-mono tabular-nums text-[#FF6B00]">
                    {pedidoRastreado.obterCodigoTicket()}
                  </p>
                  <p className="text-xs text-slate-300 pt-1">
                    {pedidoRastreado.obterTipoFila()}
                  </p>
                </div>

                <div className="space-y-2.5 text-xs border-t border-slate-100 pt-4">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Modalidade de Pagamento</span>
                    <span className="font-bold text-slate-900">
                      {pedidoRastreado.obterTituloMetodoPagamento()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Situação Financeira</span>
                    <span
                      className={`font-bold ${
                        pedidoRastreado.ehFilaExpressa()
                          ? 'text-emerald-700'
                          : 'text-amber-700'
                      }`}
                    >
                      {pedidoRastreado.ehFilaExpressa()
                        ? 'Confirmado no App'
                        : 'Pagar na Entrega (Caixa)'}
                    </span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-slate-100 text-base font-extrabold text-slate-900">
                    <span>Total do Pedido</span>
                    <span className="font-mono tabular-nums">
                      {formatarMoeda(pedidoRastreado.obterValorTotal())}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      )}

      {/* =====================================================================
          TELA 4: VISÃO DO FUNCIONÁRIO / VENDEDOR (KDS + GESTÃO DE CARDÁPIO)
          ===================================================================== */}
      {moduloAtivo === 'vendedor_painel' && (
        <main className="flex-1 max-w-[1360px] w-full mx-auto px-6 py-8 space-y-7">
          {/* Cabeçalho do Operador Logado + Seletor KDS vs Gestão de Cardápio */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
                <ChefHat className="w-5 h-5 text-[#FF6B00]" />
              </div>

              {!editandoPerfilOperador ? (
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-extrabold text-slate-900 font-display">
                      {operadorNome}
                    </span>
                    <span className="text-xs font-mono tabular-nums font-semibold text-slate-500">
                      · ID: {operadorId}
                    </span>
                    <button
                      type="button"
                      onClick={() => setEditandoPerfilOperador(true)}
                      className="text-xs font-semibold text-[#FF6B00] hover:underline cursor-pointer ml-1"
                    >
                      Alterar operador
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Carga atual na chapa:{' '}
                    <strong className="font-mono tabular-nums text-slate-900">
                      +{minutosGargaloAtivoChapa} min ({qtdPedidosAtivosNaChapa} pedidos em preparo)
                    </strong>
                  </p>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    value={operadorNome}
                    onChange={(e) => setOperadorNome(e.target.value)}
                    className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                  />
                  <input
                    type="text"
                    value={operadorId}
                    onChange={(e) => setOperadorId(e.target.value)}
                    className="w-24 px-3 py-1.5 text-xs font-mono tabular-nums bg-slate-50 border border-slate-300 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setEditandoPerfilOperador(false)}
                    className="px-3 py-1.5 text-xs font-bold text-white bg-slate-900 rounded-lg cursor-pointer"
                  >
                    Confirmar
                  </button>
                </div>
              )}
            </div>

            {/* Sub-Abas do Vendedor: Fila de Pedidos (KDS) vs Gestão de Cardápio (CRUD) */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setAbaVendedor('kds')}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  abaVendedor === 'kds'
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Fila de Pedidos (KDS) ({qtdPedidosAtivosTotais})
              </button>
              <button
                type="button"
                onClick={() => setAbaVendedor('cardapio')}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  abaVendedor === 'cardapio'
                    ? 'bg-[#FF6B00] text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Gestão de Cardápio ({cardapio.length} itens)
              </button>
            </div>
          </div>

          {/* SUB-ABA 1: PAINEL KDS (KITCHEN DISPLAY SYSTEM) */}
          {abaVendedor === 'kds' && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900 font-display">
                    Painel de Controle da Fila de Pedidos (KDS)
                  </h2>
                  <p className="text-xs text-slate-600">
                    Avance os pedidos com 1 clique. Quando um pedido de chapa é marcado como{' '}
                    <strong>Pronto</strong> ou <strong>Entregue</strong>, o tempo estimado na vitrine dos alunos reduz automaticamente.
                  </p>
                </div>

                <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setFiltroStatusKDS('ATIVOS')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer ${
                      filtroStatusKDS === 'ATIVOS'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Em Andamento / Prontos
                  </button>
                  <button
                    type="button"
                    onClick={() => setFiltroStatusKDS('TODOS')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer ${
                      filtroStatusKDS === 'TODOS'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Todos os Pedidos ({todosPedidos.length})
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {todosPedidos
                  .filter((p) =>
                    filtroStatusKDS === 'TODOS' ? true : p.obterStatus() !== 'Entregue'
                  )
                  .map((pedido) => {
                    const status = pedido.obterStatus();
                    const pagoNoApp = pedido.ehFilaExpressa();

                    return (
                      <div
                        key={pedido.obterId()}
                        className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-2xs"
                      >
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
                                <span>~{pedido.obterTempoEstimadoInicial()} min</span>
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
                                  : 'bg-slate-100 text-slate-500'
                              }`}
                            >
                              {status}
                            </span>
                          </div>

                          {/* Etiqueta de Pagamento em Destaque (Verde Pago no App vs Amarelo Pagar no Caixa) */}
                          <div
                            className={`p-3 rounded-xl border text-xs font-extrabold flex items-center gap-2 ${
                              pagoNoApp
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                                : 'bg-amber-50 border-amber-300 text-amber-950'
                            }`}
                          >
                            {pagoNoApp ? (
                              <BadgeCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                            ) : (
                              <Receipt className="w-4 h-4 text-amber-600 shrink-0" />
                            )}
                            <span>{pedido.obterEtiquetaOperacionalKDS()}</span>
                          </div>

                          {/* Lista de Itens com Quantidades */}
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
                                    {item.utilizaGargaloCozinha()
                                      ? 'Chapa'
                                      : 'Estufa'}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Botões de Ação Rápida com 1 Clique */}
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
                              onClick={() => handleAvancarStatusPedido(pedido.obterId())}
                              className="w-full py-3 px-4 text-xs font-extrabold text-white bg-[#FF6B00] hover:bg-orange-600 rounded-xl transition-colors cursor-pointer shadow-2xs"
                            >
                              Marcar como Fazendo
                            </button>
                          )}
                          {status === 'Fazendo' && (
                            <button
                              type="button"
                              onClick={() => handleAvancarStatusPedido(pedido.obterId())}
                              className="w-full py-3 px-4 text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors cursor-pointer shadow-2xs"
                            >
                              Marcar como Pronto
                            </button>
                          )}
                          {status === 'Pronto para Retirada' && (
                            <button
                              type="button"
                              onClick={() => handleAvancarStatusPedido(pedido.obterId())}
                              className="w-full py-3 px-4 text-xs font-extrabold text-white bg-[#0F172A] hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                            >
                              Marcar como Entregue
                            </button>
                          )}
                          {status === 'Entregue' && (
                            <div className="py-2 text-center text-xs font-bold text-slate-400 bg-slate-50 rounded-xl">
                              Pedido Finalizado e Entregue
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* SUB-ABA 2: GESTÃO DE CARDÁPIO (CRUD DE PRODUTOS EM TEMPO REAL) */}
          {abaVendedor === 'cardapio' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Formulário para Adicionar Novo Produto */}
              <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900 font-display">
                    Adicionar Novo Produto
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Cadastre novos itens definindo categoria, natureza de preparo e tempo base.
                  </p>
                </div>

                <form onSubmit={handleCriarNovoProduto} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nome do Item
                    </label>
                    <input
                      type="text"
                      required
                      value={novoNome}
                      onChange={(e) => setNovoNome(e.target.value)}
                      placeholder="Ex: Enroladinho de Queijo e Presunto"
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#FF6B00] focus:bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Preço (R$)
                      </label>
                      <input
                        type="number"
                        step="0.10"
                        min="0.50"
                        required
                        value={novoPreco}
                        onChange={(e) => setNovoPreco(e.target.value)}
                        placeholder="Ex: 10.50"
                        className="w-full px-3.5 py-2.5 text-xs font-mono tabular-nums bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#FF6B00] focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Categoria
                      </label>
                      <select
                        value={novaCategoria}
                        onChange={(e) =>
                          setNovaCategoria(e.target.value as CategoriaProduto)
                        }
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#FF6B00] focus:bg-white"
                      >
                        <option value="Salgados">Salgados</option>
                        <option value="Lanches na Chapa">Lanches na Chapa</option>
                        <option value="Bebidas">Bebidas</option>
                        <option value="Doces">Doces</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Natureza de Preparo
                      </label>
                      <select
                        value={novaNatureza}
                        onChange={(e) => {
                          const cod = e.target.value as TipoNaturezaCodigo;
                          setNovaNatureza(cod);
                          setNovoTempoBase(cod === 'ESTUFA_RAPIDO' ? '2' : '6');
                        }}
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#FF6B00] focus:bg-white"
                      >
                        <option value="ESTUFA_RAPIDO">Pronto / Estufa (~1 a 2 min)</option>
                        <option value="COZINHA_NA_HORA">Feito na Hora (Cozinha/Chapa)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Tempo Base (minutos)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="25"
                        required
                        value={novoTempoBase}
                        onChange={(e) => setNovoTempoBase(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs font-mono tabular-nums bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#FF6B00] focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Descrição do Produto
                    </label>
                    <input
                      type="text"
                      value={novaDescricao}
                      onChange={(e) => setNovaDescricao(e.target.value)}
                      placeholder="Ingredientes e detalhes rápidos..."
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#FF6B00] focus:bg-white"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-4 text-xs font-extrabold text-white bg-[#FF6B00] hover:bg-orange-600 rounded-xl transition-colors cursor-pointer shadow-xs"
                  >
                    Cadastrar Produto na Vitrine
                  </button>
                </form>
              </div>

              {/* Lista de Produtos para Edição Instantânea */}
              <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900 font-display">
                      Itens Cadastrados no Cardápio ({cardapio.length})
                    </h2>
                    <p className="text-xs text-slate-500">
                      Qualquer edição reflete instantaneamente na vitrine do aluno.
                    </p>
                  </div>
                </div>

                <div className="divide-y divide-slate-100 max-h-[520px] overflow-y-auto">
                  {cardapio.map((prod) => (
                    <div
                      key={prod.obterId()}
                      className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors"
                    >
                      <div className="min-w-0 space-y-0.5">
                        <p className="text-sm font-extrabold text-slate-900 truncate">
                          {prod.obterNome()}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                          <span>{prod.obterCategoria()}</span>
                          <span>·</span>
                          <span
                            className={`font-semibold ${
                              prod.utilizaGargaloCozinha()
                                ? 'text-amber-700'
                                : 'text-emerald-700'
                            }`}
                          >
                            {prod.obterRotuloNatureza()}
                          </span>
                          <span>·</span>
                          <span className="font-mono tabular-nums">
                            Base: {prod.obterTempoBaseMinutos()} min
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-sm font-mono tabular-nums font-extrabold text-slate-900">
                          {formatarMoeda(prod.obterPreco())}
                        </span>
                        <button
                          type="button"
                          onClick={() => abrirModalEdicaoProduto(prod)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Editar</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      )}

      {/* =====================================================================
          DRAWER LATERAL FLUIDO DO CARRINHO DE COMPRAS & CHECKOUT
          ===================================================================== */}
      {drawerCarrinhoAberto && (
        <div className="fixed inset-0 z-40 flex justify-end bg-slate-950/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden">
            {/* Cabeçalho do Drawer */}
            <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-5 h-5 text-[#FF6B00]" />
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900 font-display">
                    Seu Carrinho Fast-Track
                  </h2>
                  <p className="text-xs text-slate-500">
                    {alunoNome} ({alunoMatricula})
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setDrawerCarrinhoAberto(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Corpo do Carrinho */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {itensCarrinho.length === 0 ? (
                <div className="py-14 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-slate-800">
                    Seu carrinho ainda está vazio
                  </p>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    Adicione salgados da estufa ou lanches na chapa para visualizar o tempo estimado de preparo.
                  </p>
                </div>
              ) : (
                <>
                  {/* Lista de Itens com Ajuste de Quantidades (+ e -) */}
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl px-4">
                    {itensCarrinho.map((item) => {
                      const prod = item.obterProduto();
                      const usaChapa = item.utilizaGargaloCozinha();
                      return (
                        <div
                          key={item.obterProdutoId()}
                          className="py-3.5 flex items-center justify-between gap-3"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-900 truncate">
                              {item.obterNomeProduto()}
                            </p>
                            <p className="text-xs text-slate-500">
                              <span className="font-mono tabular-nums font-semibold text-slate-700">
                                {formatarMoeda(item.obterPrecoUnitario())}
                              </span>
                              <span> · </span>
                              <span>
                                {usaChapa
                                  ? `Chapa (base ${prod.obterTempoBaseMinutos()}m)`
                                  : `Estufa (${prod.obterTempoBaseMinutos()}m)`}
                              </span>
                            </p>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() =>
                                handleAlterarQuantidadeCarrinho(
                                  item.obterProdutoId(),
                                  item.obterQuantidade() - 1
                                )
                              }
                              className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 cursor-pointer"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-6 text-center text-xs font-mono tabular-nums font-bold">
                              {item.obterQuantidade()}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                handleAlterarQuantidadeCarrinho(
                                  item.obterProdutoId(),
                                  item.obterQuantidade() + 1
                                )
                              }
                              className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoverDoCarrinho(item.obterProdutoId())}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Resumo de Tempo Estimado Dinâmico */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                    <div className="flex justify-between text-xs text-slate-600">
                      <span>Tempo base de preparo dos itens</span>
                      <span className="font-mono tabular-nums font-semibold text-slate-900">
                        {diagnosticoCarrinho.tempoBaseItens} min
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-600">
                      <span>
                        Fila ativa da Cozinha/Chapa ({diagnosticoCarrinho.pedidosAtivosNaChapa}{' '}
                        pedidos)
                      </span>
                      <span className="font-mono tabular-nums font-semibold text-slate-900">
                        +{diagnosticoCarrinho.acrescimoGargaloCozinha} min
                      </span>
                    </div>
                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                      <span className="text-xs font-extrabold text-slate-900">
                        Tempo Total Estimado de Preparo
                      </span>
                      <span
                        className={`text-base font-extrabold font-mono tabular-nums ${
                          diagnosticoCarrinho.ultrapassaLimiteSeguranca
                            ? 'text-red-600'
                            : 'text-emerald-700'
                        }`}
                      >
                        ~{diagnosticoCarrinho.tempoTotalEstimadoMinutos} min
                      </span>
                    </div>
                  </div>

                  {/* Aviso Amigável quando o tempo ultrapassa 12 minutos */}
                  {diagnosticoCarrinho.ultrapassaLimiteSeguranca && (
                    <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 space-y-3">
                      <div className="flex items-start gap-2.5">
                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <p className="text-xs font-extrabold text-amber-950">
                            Atenção ao seu intervalo de 15 minutos! (~
                            {diagnosticoCarrinho.tempoTotalEstimadoMinutos} min estimados)
                          </p>
                          <p className="text-xs text-amber-900 leading-relaxed">
                            A chapa está movimentada agora. Que tal trocar por itens de{' '}
                            <strong>Estufa / Prontos (1 a 2 min)</strong> para retirar imediatamente e não correr risco de atrasar para a aula?
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleSubstituirChapaPorEstufa}
                        className="w-full py-2 px-3 text-xs font-bold text-amber-950 bg-amber-200/80 hover:bg-amber-300/80 rounded-xl transition-colors cursor-pointer"
                      >
                        Trocar por opção rápida da Estufa (~1 a 2 min)
                      </button>
                    </div>
                  )}

                  {/* Duas Opções Diretas de Pagamento e Roteamento de Filas */}
                  <div className="space-y-2.5">
                    <p className="text-xs font-extrabold text-slate-900">
                      Escolha como deseja pagar e retirar:
                    </p>
                    <div className="space-y-2.5">
                      {processadoresCheckout.map((proc) => {
                        const codigo = proc.obterCodigo();
                        const selecionado = codigoMetodoSelecionado === codigo;
                        const ehNoApp = codigo === 'PAGAR_NO_APP';

                        return (
                          <label
                            key={codigo}
                            className={`flex items-start gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                              selecionado
                                ? 'border-[#FF6B00] bg-orange-50/40'
                                : 'border-slate-200 hover:border-slate-300 bg-white'
                            }`}
                          >
                            <input
                              type="radio"
                              name="opcaoPagamentoCheckout"
                              value={codigo}
                              checked={selecionado}
                              onChange={() => setCodigoMetodoSelecionado(codigo)}
                              className="mt-1 accent-[#FF6B00]"
                            />
                            <div className="flex-1 min-w-0 space-y-1">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-extrabold text-slate-900">
                                  {proc.obterNomeExibicao()}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-600 leading-relaxed">
                                {proc.obterSubtituloExibicao()}
                              </p>
                              <p
                                className={`text-[11px] font-bold pt-0.5 ${
                                  ehNoApp ? 'text-emerald-700' : 'text-amber-700'
                                }`}
                              >
                                → Gera: {proc.obterDestaqueFila()}
                              </p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Rodapé do Drawer com Total e Botão Finalizar */}
            <form
              onSubmit={handleFinalizarPedido}
              className="p-6 bg-slate-50 border-t border-slate-200 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">Valor Total</span>
                <span className="text-xl font-extrabold text-slate-900 font-mono tabular-nums">
                  {formatarMoeda(valorTotalCarrinho)}
                </span>
              </div>

              <button
                type="submit"
                disabled={itensCarrinho.length === 0}
                className="w-full py-3.5 px-5 text-sm font-extrabold text-white bg-[#FF6B00] hover:bg-orange-600 disabled:bg-slate-300 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Confirmar Pedido e Gerar Ticket</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL DE EDIÇÃO RÁPIDA DE PRODUTO (VISÃO DO VENDEDOR)
          ===================================================================== */}
      {produtoEditando && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 font-display">
                Editar Produto do Cardápio
              </h3>
              <button
                type="button"
                onClick={() => setProdutoEditando(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSalvarEdicaoProduto} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nome do Produto
                </label>
                <input
                  type="text"
                  required
                  value={editNome}
                  onChange={(e) => setEditNome(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#FF6B00]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Preço (R$)
                  </label>
                  <input
                    type="number"
                    step="0.10"
                    min="0.50"
                    required
                    value={editPreco}
                    onChange={(e) => setEditPreco(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs font-mono tabular-nums bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#FF6B00]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Categoria
                  </label>
                  <select
                    value={editCategoria}
                    onChange={(e) =>
                      setEditCategoria(e.target.value as CategoriaProduto)
                    }
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#FF6B00]"
                  >
                    <option value="Salgados">Salgados</option>
                    <option value="Lanches na Chapa">Lanches na Chapa</option>
                    <option value="Bebidas">Bebidas</option>
                    <option value="Doces">Doces</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Natureza de Preparo
                  </label>
                  <select
                    value={editNatureza}
                    onChange={(e) => {
                      const cod = e.target.value as TipoNaturezaCodigo;
                      setEditNatureza(cod);
                      setEditTempoBase(cod === 'ESTUFA_RAPIDO' ? '2' : '6');
                    }}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#FF6B00]"
                  >
                    <option value="ESTUFA_RAPIDO">Pronto / Estufa</option>
                    <option value="COZINHA_NA_HORA">Feito na Hora (Chapa)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tempo Base (min)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="25"
                    required
                    value={editTempoBase}
                    onChange={(e) => setEditTempoBase(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs font-mono tabular-nums bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#FF6B00]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Descrição
                </label>
                <input
                  type="text"
                  value={editDescricao}
                  onChange={(e) => setEditDescricao(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#FF6B00]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setProdutoEditando(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-extrabold text-white bg-[#FF6B00] hover:bg-orange-600 rounded-xl cursor-pointer"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rodapé Comercial Limpo */}
      <footer className="bg-white border-t border-slate-200 px-6 py-4 mt-auto">
        <div className="max-w-[1360px] mx-auto flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
          <span>Fast-Track Cantina · Autoatendimento &amp; Operação CESAR School</span>
          <span>Intervalo Inteligente · Retirada Expressa &amp; KDS Integrado</span>
        </div>
      </footer>
    </div>
  );
}
