import React, { useState } from 'react';
import { ChefHat, CheckCircle2, Edit3, X } from 'lucide-react';
import {
  CampoOperador,
  CampoProduto,
  CategoriaProduto,
  CATEGORIAS_CARDAPIO_REAL,
  DadosOperador,
  EntradaProduto,
  ErrosCampos,
  LIMITES,
  Pedido,
  Produto,
  StatusPedido,
  TipoNaturezaCodigo,
} from '../domain/cantinaDomain';
import {
  classeBordaCampo,
  formatarMoeda,
  MensagemCampo,
} from '../utils/formatadores';
import { CardPedido } from './CardPedido';

interface PainelCantinaProps {
  perfilOperador: DadosOperador;
  editandoPerfilOperador: boolean;
  rascunhoOperador: DadosOperador;
  errosOperador: ErrosCampos<CampoOperador>;
  aoIniciarEdicaoOperador: () => void;
  aoAlterarRascunhoOperador: (novo: DadosOperador) => void;
  aoSalvarPerfilOperador: () => void;
  aoCancelarEdicaoOperador: () => void;
  todosPedidos: Pedido[];
  cardapio: Produto[];
  minutosGargaloAtivoChapa: number;
  qtdPedidosAtivosNaChapa: number;
  mediaMovelMinutos: number | null;
  aoAvancarStatusPedido: (pedidoId: string, statusEsperado: StatusPedido) => void;
  aoConfirmarPagamento: (pedidoId: string) => void;
  aoCancelarPedido: (pedidoId: string, statusEsperado: StatusPedido) => void;
  aoCriarProduto: (
    entrada: EntradaProduto,
    definirErros: (erros: ErrosCampos<CampoProduto>) => void,
    limparFormulario: () => void
  ) => void;
  aoEditarProduto: (
    produtoId: string,
    entrada: EntradaProduto,
    definirErros: (erros: ErrosCampos<CampoProduto>) => void,
    fecharModal: () => void
  ) => void;
  aoAlternarDisponibilidade: (produto: Produto) => void;
}

export function PainelCantina({
  perfilOperador,
  editandoPerfilOperador,
  rascunhoOperador,
  errosOperador,
  aoIniciarEdicaoOperador,
  aoAlterarRascunhoOperador,
  aoSalvarPerfilOperador,
  aoCancelarEdicaoOperador,
  todosPedidos,
  cardapio,
  minutosGargaloAtivoChapa,
  qtdPedidosAtivosNaChapa,
  mediaMovelMinutos,
  aoAvancarStatusPedido,
  aoConfirmarPagamento,
  aoCancelarPedido,
  aoCriarProduto,
  aoEditarProduto,
  aoAlternarDisponibilidade,
}: PainelCantinaProps) {
  const [abaVendedor, setAbaVendedor] = useState<'kds' | 'cardapio'>('kds');
  const [filtroStatusKDS, setFiltroStatusKDS] = useState<'ATIVOS' | 'TODOS'>('ATIVOS');
  const [pedidoConfirmandoCancelamento, setPedidoConfirmandoCancelamento] = useState<string | null>(null);

  // Estado do formulário de novo produto
  const [novoNome, setNovoNome] = useState<string>('');
  const [novoPreco, setNovoPreco] = useState<string>('');
  const [novaCategoria, setNovaCategoria] = useState<CategoriaProduto>('Salgados');
  const [novaNatureza, setNovaNatureza] = useState<TipoNaturezaCodigo>('ESTUFA_RAPIDO');
  const [novoTempoBase, setNovoTempoBase] = useState<string>(
    String(LIMITES.tempoBase.ESTUFA_RAPIDO.padrao)
  );
  const [novaDescricao, setNovaDescricao] = useState<string>('');
  const [errosNovoProduto, setErrosNovoProduto] = useState<ErrosCampos<CampoProduto>>({});

  // Estado do modal de edição de produto
  const [produtoEditandoId, setProdutoEditandoId] = useState<string | null>(null);
  const produtoEditando = produtoEditandoId
    ? cardapio.find((p) => p.obterId() === produtoEditandoId) ?? null
    : null;
  const [editNome, setEditNome] = useState<string>('');
  const [editPreco, setEditPreco] = useState<string>('');
  const [editCategoria, setEditCategoria] = useState<CategoriaProduto>('Salgados');
  const [editNatureza, setEditNatureza] = useState<TipoNaturezaCodigo>('ESTUFA_RAPIDO');
  const [editTempoBase, setEditTempoBase] = useState<string>('2');
  const [editDescricao, setEditDescricao] = useState<string>('');
  const [errosEdicaoProduto, setErrosEdicaoProduto] = useState<ErrosCampos<CampoProduto>>({});

  const qtdPedidosAtivosTotais = todosPedidos.filter((p) => p.estaEmAberto()).length;
  const pedidosKDS = todosPedidos.filter((p) =>
    filtroStatusKDS === 'TODOS' ? true : p.estaEmAberto()
  );

  const handleConfirmarOuSolicitarCancelamento = (pedido: Pedido) => {
    if (pedidoConfirmandoCancelamento !== pedido.obterId()) {
      setPedidoConfirmandoCancelamento(pedido.obterId());
      return;
    }
    aoCancelarPedido(pedido.obterId(), pedido.obterStatus());
    setPedidoConfirmandoCancelamento(null);
  };

  const handleSubmeterNovoProduto = (e: React.FormEvent) => {
    e.preventDefault();
    aoCriarProduto(
      {
        nome: novoNome,
        descricao: novaDescricao,
        preco: novoPreco,
        categoria: novaCategoria,
        natureza: novaNatureza,
        tempoBase: novoTempoBase,
      },
      setErrosNovoProduto,
      () => {
        setNovoNome('');
        setNovoPreco('');
        setNovaDescricao('');
        setNovaNatureza('ESTUFA_RAPIDO');
        setNovoTempoBase(String(LIMITES.tempoBase.ESTUFA_RAPIDO.padrao));
        setErrosNovoProduto({});
      }
    );
  };

  const abrirModalEdicao = (produto: Produto) => {
    setProdutoEditandoId(produto.obterId());
    setEditNome(produto.obterNome());
    setEditPreco(produto.obterPreco().toFixed(2));
    setEditCategoria(produto.obterCategoria());
    setEditNatureza(produto.obterCodigoNatureza());
    setEditTempoBase(String(produto.obterTempoBaseMinutos()));
    setEditDescricao(produto.obterDescricao());
    setErrosEdicaoProduto({});
  };

  const handleSubmeterEdicao = (e: React.FormEvent) => {
    e.preventDefault();
    if (!produtoEditandoId) return;
    aoEditarProduto(
      produtoEditandoId,
      {
        nome: editNome,
        descricao: editDescricao,
        preco: editPreco,
        categoria: editCategoria,
        natureza: editNatureza,
        tempoBase: editTempoBase,
      },
      setErrosEdicaoProduto,
      () => {
        setProdutoEditandoId(null);
        setErrosEdicaoProduto({});
      }
    );
  };

  return (
    <main className="flex-1 max-w-[1280px] w-full mx-auto px-6 py-8 space-y-7">
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
                  {perfilOperador.nome}
                </span>
                <span className="text-xs font-mono tabular-nums font-semibold text-slate-500">
                  · ID: {perfilOperador.id}
                </span>
                <button
                  type="button"
                  onClick={aoIniciarEdicaoOperador}
                  className="text-xs font-semibold text-[#FF6B00] hover:underline cursor-pointer ml-1"
                >
                  Alterar operador
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Carga ativa na chapa:{' '}
                <strong className="font-mono tabular-nums text-slate-900">
                  +{minutosGargaloAtivoChapa} min ({qtdPedidosAtivosNaChapa} em preparo)
                </strong>
                {mediaMovelMinutos !== null && (
                  <>
                    {' · '}Média móvel real:{' '}
                    <strong className="font-mono tabular-nums text-emerald-700">
                      {mediaMovelMinutos} min
                    </strong>
                  </>
                )}
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap items-start gap-2">
              <div>
                <input
                  type="text"
                  value={rascunhoOperador.nome}
                  onChange={(e) =>
                    aoAlterarRascunhoOperador({ ...rascunhoOperador, nome: e.target.value })
                  }
                  placeholder="Nome do operador"
                  aria-label="Nome do operador"
                  maxLength={LIMITES.nomePessoa.max}
                  autoFocus
                  className={`px-3 py-1.5 text-xs border rounded-lg focus:outline-none ${classeBordaCampo(
                    errosOperador.nome
                  )}`}
                />
                <MensagemCampo id="erro-operador-nome" erro={errosOperador.nome} />
              </div>
              <div>
                <input
                  type="text"
                  value={rascunhoOperador.id}
                  onChange={(e) =>
                    aoAlterarRascunhoOperador({ ...rascunhoOperador, id: e.target.value })
                  }
                  placeholder="OP-01"
                  aria-label="ID do operador"
                  maxLength={LIMITES.idOperador.max}
                  className={`w-24 px-3 py-1.5 text-xs font-mono tabular-nums border rounded-lg focus:outline-none ${classeBordaCampo(
                    errosOperador.id
                  )}`}
                />
                <MensagemCampo id="erro-operador-id" erro={errosOperador.id} />
              </div>
              <button
                type="button"
                onClick={aoSalvarPerfilOperador}
                className="px-3 py-1.5 text-xs font-bold text-white bg-slate-900 rounded-lg cursor-pointer"
              >
                Confirmar
              </button>
              <button
                type="button"
                onClick={aoCancelarEdicaoOperador}
                className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          )}
        </div>

        {/* Sub-Abas do Vendedor */}
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

      {/* SUB-ABA 1: PAINEL KDS */}
      {abaVendedor === 'kds' && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 font-display">
                Fila de Produção (KDS)
              </h2>
              <p className="text-xs text-slate-600">
                Avance os pedidos com 1 clique. O tempo real entre &ldquo;Em Preparo&rdquo; e &ldquo;Pronto&rdquo; alimenta a média móvel dos alunos.
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
                onClick={() => {
                  setFiltroStatusKDS('TODOS');
                  setPedidoConfirmandoCancelamento(null);
                }}
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

          {pedidosKDS.length === 0 ? (
            <div className="bg-white border border-dashed border-slate-300 rounded-2xl px-6 py-14 text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-800">
                {filtroStatusKDS === 'ATIVOS'
                  ? 'Nenhum pedido em andamento'
                  : 'Nenhum pedido registrado'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pedidosKDS.map((pedido) => (
                <CardPedido
                  key={pedido.obterId()}
                  pedido={pedido}
                  confirmandoCancelamento={
                    pedidoConfirmandoCancelamento === pedido.obterId()
                  }
                  aoAvancarStatus={(id, statusEsperado) => {
                    setPedidoConfirmandoCancelamento(null);
                    aoAvancarStatusPedido(id, statusEsperado);
                  }}
                  aoConfirmarPagamento={aoConfirmarPagamento}
                  aoCancelarPedido={handleConfirmarOuSolicitarCancelamento}
                  aoDesistirCancelamento={() => setPedidoConfirmandoCancelamento(null)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB-ABA 2: GESTÃO DE CARDÁPIO (CRUD) */}
      {abaVendedor === 'cardapio' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Formulário Novo Produto */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 font-display">
                Adicionar Novo Produto
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Cadastre novos itens definindo categoria, natureza de preparo e tempo base.
              </p>
            </div>

            <form onSubmit={handleSubmeterNovoProduto} noValidate className="space-y-4">
              <div>
                <label htmlFor="novo-nome" className="block text-xs font-bold text-slate-700 mb-1">
                  Nome do Item
                </label>
                <input
                  id="novo-nome"
                  type="text"
                  value={novoNome}
                  onChange={(e) => setNovoNome(e.target.value)}
                  maxLength={LIMITES.nomeProduto.max}
                  placeholder="Ex: Enroladinho de Queijo e Presunto"
                  className={`w-full px-3.5 py-2.5 text-xs border rounded-xl focus:outline-none ${classeBordaCampo(
                    errosNovoProduto.nome
                  )}`}
                />
                <MensagemCampo id="erro-novo-nome" erro={errosNovoProduto.nome} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="novo-preco" className="block text-xs font-bold text-slate-700 mb-1">
                    Preço (R$)
                  </label>
                  <input
                    id="novo-preco"
                    type="text"
                    inputMode="decimal"
                    value={novoPreco}
                    onChange={(e) => setNovoPreco(e.target.value)}
                    maxLength={10}
                    placeholder="Ex: 10,50"
                    className={`w-full px-3.5 py-2.5 text-xs font-mono tabular-nums border rounded-xl focus:outline-none ${classeBordaCampo(
                      errosNovoProduto.preco
                    )}`}
                  />
                  <MensagemCampo id="erro-novo-preco" erro={errosNovoProduto.preco} />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Categoria
                  </label>
                  <select
                    value={novaCategoria}
                    onChange={(e) => setNovaCategoria(e.target.value as CategoriaProduto)}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#FF6B00] focus:bg-white"
                  >
                    {CATEGORIAS_CARDAPIO_REAL.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
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
                      setNovoTempoBase(String(LIMITES.tempoBase[cod].padrao));
                      setErrosNovoProduto((erros) => ({ ...erros, tempoBase: undefined }));
                    }}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#FF6B00] focus:bg-white"
                  >
                    <option value="ESTUFA_RAPIDO">Pronto / Estufa (~1 a 2 min)</option>
                    <option value="COZINHA_NA_HORA">Feito na Hora (Cozinha/Chapa)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="novo-tempo" className="block text-xs font-bold text-slate-700 mb-1">
                    Tempo Base (minutos)
                  </label>
                  <input
                    id="novo-tempo"
                    type="number"
                    inputMode="numeric"
                    step="1"
                    min={LIMITES.tempoBase[novaNatureza].min}
                    max={LIMITES.tempoBase[novaNatureza].max}
                    value={novoTempoBase}
                    onChange={(e) => setNovoTempoBase(e.target.value)}
                    className={`w-full px-3.5 py-2.5 text-xs font-mono tabular-nums border rounded-xl focus:outline-none ${classeBordaCampo(
                      errosNovoProduto.tempoBase
                    )}`}
                  />
                  <MensagemCampo id="dica-novo-tempo" erro={errosNovoProduto.tempoBase} />
                </div>
              </div>

              <div>
                <label htmlFor="nova-descricao" className="block text-xs font-bold text-slate-700 mb-1">
                  Descrição do Produto
                </label>
                <input
                  id="nova-descricao"
                  type="text"
                  value={novaDescricao}
                  onChange={(e) => setNovaDescricao(e.target.value)}
                  maxLength={LIMITES.descricaoProduto.max}
                  placeholder="Ingredientes e detalhes rápidos..."
                  className={`w-full px-3.5 py-2.5 text-xs border rounded-xl focus:outline-none ${classeBordaCampo(
                    errosNovoProduto.descricao
                  )}`}
                />
                <MensagemCampo id="erro-nova-descricao" erro={errosNovoProduto.descricao} />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 text-xs font-extrabold text-white bg-[#FF6B00] hover:bg-orange-600 rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                Cadastrar Produto na Vitrine
              </button>
            </form>
          </div>

          {/* Lista de Produtos Cadastrados */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="text-base font-extrabold text-slate-900 font-display">
                Itens Cadastrados no Cardápio ({cardapio.length})
              </h2>
              <p className="text-xs text-slate-500">
                Qualquer edição reflete instantaneamente na vitrine do aluno.
              </p>
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
                      {!prod.estaDisponivel() && (
                        <span className="ml-2 align-middle px-2 py-0.5 rounded-md text-[10px] font-bold text-red-700 bg-red-50 border border-red-200">
                          Esgotado
                        </span>
                      )}
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
                      onClick={() => aoAlternarDisponibilidade(prod)}
                      className={`px-3 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
                        prod.estaDisponivel()
                          ? 'text-slate-500 hover:text-red-700 hover:bg-red-50'
                          : 'text-emerald-800 bg-emerald-50 hover:bg-emerald-100'
                      }`}
                    >
                      {prod.estaDisponivel() ? 'Marcar esgotado' : 'Repor'}
                    </button>
                    <button
                      type="button"
                      onClick={() => abrirModalEdicao(prod)}
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

      {/* MODAL DE EDIÇÃO DE PRODUTO */}
      {produtoEditando && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setProdutoEditandoId(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Editar produto do cardápio"
            className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 font-display">
                Editar Produto do Cardápio
              </h3>
              <button
                type="button"
                onClick={() => setProdutoEditandoId(null)}
                aria-label="Fechar edição"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmeterEdicao} noValidate className="space-y-4">
              <div>
                <label htmlFor="edit-nome" className="block text-xs font-bold text-slate-700 mb-1">
                  Nome do Produto
                </label>
                <input
                  id="edit-nome"
                  type="text"
                  value={editNome}
                  onChange={(e) => setEditNome(e.target.value)}
                  maxLength={LIMITES.nomeProduto.max}
                  className={`w-full px-3.5 py-2 text-xs border rounded-xl focus:outline-none ${classeBordaCampo(
                    errosEdicaoProduto.nome
                  )}`}
                />
                <MensagemCampo id="erro-edit-nome" erro={errosEdicaoProduto.nome} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="edit-preco" className="block text-xs font-bold text-slate-700 mb-1">
                    Preço (R$)
                  </label>
                  <input
                    id="edit-preco"
                    type="text"
                    inputMode="decimal"
                    value={editPreco}
                    onChange={(e) => setEditPreco(e.target.value)}
                    maxLength={10}
                    className={`w-full px-3.5 py-2 text-xs font-mono tabular-nums border rounded-xl focus:outline-none ${classeBordaCampo(
                      errosEdicaoProduto.preco
                    )}`}
                  />
                  <MensagemCampo id="erro-edit-preco" erro={errosEdicaoProduto.preco} />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Categoria
                  </label>
                  <select
                    value={editCategoria}
                    onChange={(e) => setEditCategoria(e.target.value as CategoriaProduto)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#FF6B00]"
                  >
                    {CATEGORIAS_CARDAPIO_REAL.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
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
                      setEditTempoBase(String(LIMITES.tempoBase[cod].padrao));
                      setErrosEdicaoProduto((erros) => ({ ...erros, tempoBase: undefined }));
                    }}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#FF6B00]"
                  >
                    <option value="ESTUFA_RAPIDO">Pronto / Estufa</option>
                    <option value="COZINHA_NA_HORA">Feito na Hora (Chapa)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="edit-tempo" className="block text-xs font-bold text-slate-700 mb-1">
                    Tempo Base (min)
                  </label>
                  <input
                    id="edit-tempo"
                    type="number"
                    inputMode="numeric"
                    step="1"
                    min={LIMITES.tempoBase[editNatureza].min}
                    max={LIMITES.tempoBase[editNatureza].max}
                    value={editTempoBase}
                    onChange={(e) => setEditTempoBase(e.target.value)}
                    className={`w-full px-3.5 py-2 text-xs font-mono tabular-nums border rounded-xl focus:outline-none ${classeBordaCampo(
                      errosEdicaoProduto.tempoBase
                    )}`}
                  />
                  <MensagemCampo id="erro-edit-tempo" erro={errosEdicaoProduto.tempoBase} />
                </div>
              </div>

              <div>
                <label htmlFor="edit-descricao" className="block text-xs font-bold text-slate-700 mb-1">
                  Descrição
                </label>
                <input
                  id="edit-descricao"
                  type="text"
                  value={editDescricao}
                  onChange={(e) => setEditDescricao(e.target.value)}
                  maxLength={LIMITES.descricaoProduto.max}
                  className={`w-full px-3.5 py-2 text-xs border rounded-xl focus:outline-none ${classeBordaCampo(
                    errosEdicaoProduto.descricao
                  )}`}
                />
                <MensagemCampo id="erro-edit-descricao" erro={errosEdicaoProduto.descricao} />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setProdutoEditandoId(null)}
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
    </main>
  );
}
