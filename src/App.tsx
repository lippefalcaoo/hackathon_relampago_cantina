/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RotateCcw } from 'lucide-react';
import {
  Produto,
  StatusPedido,
  Pedido,
  Carrinho,
  CalculadoraGargaloFila,
  ProcessadorCheckout,
  DadosAluno,
  DadosOperador,
  CampoAluno,
  CampoOperador,
  CampoProduto,
  EntradaProduto,
  ErrosCampos,
  LIMITES,
  ErroRegraNegocio,
  ErroValidacao,
  descreverErro,
  validarEntradaProduto,
  validarDadosAluno,
  validarDadosOperador,
  criarCardapioRealCantina,
  criarDadosReaisCantina,
} from './domain/cantinaDomain';
import {
  EstadoCantina,
  carregarEstado,
  interpretarEstadoSalvo,
  observarAlteracoesExternas,
  salvarTexto,
  serializarEstado,
} from './infra/persistenciaCantina';
import { solicitarPermissaoNotificacaoNavegador } from './infra/notificacaoPedido';
import { useToasts } from './hooks/useToasts';
import { descricaoPadrao, formatarMoeda, normalizarTexto } from './utils/formatadores';
import { BarraNavegacao, ModuloAtivo } from './components/BarraNavegacao';
import { BarraToasts } from './components/BarraToasts';
import { TelaBoasVindas } from './components/TelaBoasVindas';
import { TelaAluno } from './components/TelaAluno';
import { DrawerCarrinho } from './components/DrawerCarrinho';
import { PainelCantina } from './components/PainelCantina';

const PERFIL_ALUNO_PADRAO: DadosAluno = {
  nome: 'Filipe Falcão',
  matricula: '2026.2.001',
};
const PERFIL_OPERADOR_PADRAO: DadosOperador = {
  nome: 'Carlos Silva - Turno Manhã',
  id: 'OP-01',
};

function inicializarCantina(): {
  estado: EstadoCantina;
  avisos: string[];
  processadores: ProcessadorCheckout[];
} {
  const demonstracao = criarDadosReaisCantina();
  const carregado = carregarEstado();

  // Caso o navegador ainda tenha o cardápio antigo de 10 itens da Entrega 1, migra para o Cardápio Real (41 itens)
  if (carregado.estado && carregado.estado.cardapio.length <= 10) {
    carregado.estado = {
      ...carregado.estado,
      cardapio: criarCardapioRealCantina(),
    };
  }

  return {
    estado: carregado.estado ?? {
      cardapio: demonstracao.cardapioInicial,
      gerenciador: demonstracao.gerenciadorInicial,
      perfilAluno: null,
      perfilOperador: null,
    },
    avisos: carregado.avisos,
    processadores: demonstracao.processadoresDisponiveis,
  };
}

export default function App() {
  const [inicial] = useState(inicializarCantina);

  const [cardapio, setCardapio] = useState<Produto[]>(inicial.estado.cardapio);
  const [gerenciadorPedidos] = useState(() => inicial.estado.gerenciador);
  const [processadoresCheckout] = useState<ProcessadorCheckout[]>(() => inicial.processadores);
  const [carrinho] = useState(() => new Carrinho());
  const [calculadoraGargalo] = useState(() => new CalculadoraGargaloFila());

  const [versaoEstado, setVersaoEstado] = useState<number>(0);
  const sincronizarInterface = useCallback(() => setVersaoEstado((v) => v + 1), []);

  const [moduloAtivo, setModuloAtivo] = useState<ModuloAtivo>('boas_vindas');
  const [drawerCarrinhoAberto, setDrawerCarrinhoAberto] = useState<boolean>(false);
  const [codigoMetodoSelecionado, setCodigoMetodoSelecionado] = useState<string>('PAGAR_NO_APP');
  const [pedidoAcompanhadoId, setPedidoAcompanhadoId] = useState<string>('ped-101');
  const [confirmandoRestauracao, setConfirmandoRestauracao] = useState<boolean>(false);

  // Perfis de Aluno e Operador
  const [perfilAluno, setPerfilAluno] = useState<DadosAluno>(
    inicial.estado.perfilAluno ?? PERFIL_ALUNO_PADRAO
  );
  const [rascunhoAluno, setRascunhoAluno] = useState<DadosAluno>(perfilAluno);
  const [errosAluno, setErrosAluno] = useState<ErrosCampos<CampoAluno>>({});
  const [editandoPerfilAluno, setEditandoPerfilAluno] = useState<boolean>(false);

  const [perfilOperador, setPerfilOperador] = useState<DadosOperador>(
    inicial.estado.perfilOperador ?? PERFIL_OPERADOR_PADRAO
  );
  const [rascunhoOperador, setRascunhoOperador] = useState<DadosOperador>(perfilOperador);
  const [errosOperador, setErrosOperador] = useState<ErrosCampos<CampoOperador>>({});
  const [editandoPerfilOperador, setEditandoPerfilOperador] = useState<boolean>(false);

  const { toasts, dispararToast, fecharToast } = useToasts();

  const executarAcao = useCallback(
    (contexto: string, acao: () => void): boolean => {
      try {
        acao();
        return true;
      } catch (erro) {
        const { titulo, detalhe, esperado } = descreverErro(erro, contexto);
        if (!esperado) console.error(`[Fast-Track Cantina] falha ao ${contexto}:`, erro);
        dispararToast(titulo, detalhe, esperado ? 'aviso' : 'erro');
        sincronizarInterface();
        return false;
      }
    },
    [dispararToast, sincronizarInterface]
  );

  // Avisos sobre dados restaurados
  useEffect(() => {
    for (const aviso of inicial.avisos) {
      dispararToast('Dados restaurados com ajustes', aviso, 'aviso');
    }
  }, [inicial, dispararToast]);

  // Persistência automática em localStorage
  const ultimoTextoSalvo = useRef<string | null>(null);
  const avisouFalhaSalvamento = useRef(false);

  useEffect(() => {
    let texto: string;
    try {
      texto = serializarEstado({
        cardapio,
        gerenciador: gerenciadorPedidos,
        perfilAluno,
        perfilOperador,
      });
    } catch (erro) {
      console.error('[Fast-Track Cantina] falha ao preparar dados para salvar:', erro);
      return;
    }
    if (texto === ultimoTextoSalvo.current) return;

    const resultado = salvarTexto(texto);
    if (resultado.ok) {
      ultimoTextoSalvo.current = texto;
      avisouFalhaSalvamento.current = false;
    } else if (!avisouFalhaSalvamento.current) {
      avisouFalhaSalvamento.current = true;
      dispararToast(
        'Os dados não estão sendo salvos',
        `${resultado.motivo} Tudo continua funcionando, mas some ao recarregar a página.`,
        'aviso'
      );
    }
  }, [versaoEstado, cardapio, perfilAluno, perfilOperador, gerenciadorPedidos, dispararToast]);

  // Sincronização entre abas (StorageEvent)
  useEffect(() => {
    return observarAlteracoesExternas((novoTexto) => {
      if (novoTexto === null || novoTexto === ultimoTextoSalvo.current) return;
      const { estado } = interpretarEstadoSalvo(novoTexto, { guardarBackup: false });
      if (!estado) return;

      ultimoTextoSalvo.current = novoTexto;
      gerenciadorPedidos.substituirEstado(
        estado.gerenciador.obterTodosPedidos(),
        estado.gerenciador.obterSequencialTicket()
      );
      const removidosDoCarrinho = carrinho.reconciliarComCardapio(estado.cardapio);
      setCardapio(estado.cardapio);
      if (estado.perfilAluno) setPerfilAluno(estado.perfilAluno);
      if (estado.perfilOperador) setPerfilOperador(estado.perfilOperador);
      sincronizarInterface();

      if (removidosDoCarrinho.length > 0) {
        dispararToast(
          'Itens removidos do seu carrinho',
          `${removidosDoCarrinho.join(', ')} saiu do cardápio.`,
          'aviso'
        );
      }
    });
  }, [gerenciadorPedidos, carrinho, sincronizarInterface, dispararToast]);

  // Leituras derivadas
  const todosPedidos = gerenciadorPedidos.obterTodosPedidos();
  const historicoTemposReais = gerenciadorPedidos.obterHistoricoTemposReaisMinutos();
  const itensCarrinho = carrinho.obterItens();
  const valorTotalCarrinho = carrinho.calcularValorTotal();
  const quantidadeTotalCarrinho = carrinho.obterQuantidadeTotalItens();
  const itensIndisponiveisCarrinho = carrinho.obterItensIndisponiveis();
  const carrinhoNoLimite = quantidadeTotalCarrinho >= LIMITES.unidadesPorPedido;

  const minutosGargaloAtivoChapa = calculadoraGargalo.calcularMinutosGargaloCozinha(todosPedidos);
  const qtdPedidosAtivosNaChapa = calculadoraGargalo.contarPedidosAtivosNaCozinha(todosPedidos);
  const mediaMovelMinutos = calculadoraGargalo.calcularMediaMovelPreparo(
    todosPedidos,
    historicoTemposReais
  );
  const diagnosticoCarrinho = calculadoraGargalo.diagnosticarCarrinho(
    carrinho,
    todosPedidos,
    historicoTemposReais
  );
  const qtdPedidosAtivosTotais = todosPedidos.filter((p) => p.estaEmAberto()).length;

  // Handlers de Perfil
  const salvarPerfilAluno = () => {
    const resultado = validarDadosAluno(rascunhoAluno.nome, rascunhoAluno.matricula);
    if (!resultado.ok) {
      setErrosAluno(resultado.erros);
      return;
    }
    setPerfilAluno(resultado.valor);
    setErrosAluno({});
    setEditandoPerfilAluno(false);
    dispararToast('Aluno atualizado', resultado.valor.nome, 'info');
  };

  const salvarPerfilOperador = () => {
    const resultado = validarDadosOperador(rascunhoOperador.nome, rascunhoOperador.id);
    if (!resultado.ok) {
      setErrosOperador(resultado.erros);
      return;
    }
    setPerfilOperador(resultado.valor);
    setErrosOperador({});
    setEditandoPerfilOperador(false);
    dispararToast('Operador atualizado', `${resultado.valor.nome} (${resultado.valor.id})`, 'info');
  };

  // Handlers de Carrinho e Checkout (com trava contra duplo clique)
  const handleAdicionarAoCarrinho = (produto: Produto) => {
    executarAcao('adicionar o item ao carrinho', () => {
      carrinho.adicionarProduto(produto, 1);
      sincronizarInterface();
      const tempoEst = calculadoraGargalo.calcularTempoEstimadoProduto(
        produto,
        todosPedidos,
        historicoTemposReais
      );
      dispararToast(
        `${produto.obterNome()} na sacola!`,
        `Previsão: ~${tempoEst} min · ${carrinho.obterQuantidadeTotalItens()} item(ns)`,
        'sucesso'
      );
    });
  };

  const handleAlterarQuantidadeCarrinho = (produtoId: string, novaQtd: number) => {
    executarAcao('alterar a quantidade', () => {
      carrinho.alterarQuantidade(produtoId, novaQtd);
      sincronizarInterface();
    });
  };

  const handleRemoverDoCarrinho = (produtoId: string) => {
    executarAcao('remover o item', () => {
      carrinho.removerProduto(produtoId);
      sincronizarInterface();
    });
  };

  const handleSubstituirChapaPorEstufa = () => {
    executarAcao('trocar os itens de chapa', () => {
      const itensChapa = carrinho.obterItens().filter((item) => item.utilizaGargaloCozinha());
      if (itensChapa.length === 0) {
        dispararToast('Seu pedido já é só de estufa', 'Não há itens de chapa para trocar.', 'info');
        return;
      }
      const opcaoEstufa = cardapio.find((p) => !p.utilizaGargaloCozinha() && p.estaDisponivel());
      if (!opcaoEstufa) {
        throw new ErroRegraNegocio(
          'Não há itens de estufa disponíveis agora. Mantenha o pedido ou remova itens da chapa.'
        );
      }

      for (const item of itensChapa) carrinho.removerProduto(item.obterProdutoId());
      try {
        carrinho.adicionarProduto(opcaoEstufa, 1);
      } catch (erro) {
        for (const item of itensChapa) {
          try {
            carrinho.adicionarProduto(item.obterProduto(), item.obterQuantidade());
          } catch {
            /* item ficou indisponível */
          }
        }
        throw erro;
      } finally {
        sincronizarInterface();
      }

      dispararToast(
        'Troca rápida concluída!',
        `Substituído por ${opcaoEstufa.obterNome()} (~${opcaoEstufa.obterTempoBaseMinutos()} min).`,
        'sucesso'
      );
    });
  };

  const finalizandoPedido = useRef(false);

  const handleFinalizarPedido = (e: React.FormEvent) => {
    e.preventDefault();
    if (finalizandoPedido.current) return;
    finalizandoPedido.current = true;
    window.setTimeout(() => {
      finalizandoPedido.current = false;
    }, 800);

    executarAcao('finalizar o pedido', () => {
      const processadorEscolhido = processadoresCheckout.find(
        (p) => p.obterCodigo() === codigoMetodoSelecionado
      );
      if (!processadorEscolhido) {
        throw new ErroValidacao('Escolha uma forma de pagamento para continuar.');
      }

      const novoPedido = gerenciadorPedidos.finalizarPedido(
        perfilAluno,
        carrinho,
        processadorEscolhido,
        calculadoraGargalo
      );

      setPedidoAcompanhadoId(novoPedido.obterId());
      setDrawerCarrinhoAberto(false);
      sincronizarInterface();
      setModuloAtivo('aluno');

      dispararToast(
        `Pedido ${novoPedido.obterCodigoTicket()} confirmado!`,
        `Retirada em: ${novoPedido.obterTipoFila()}`,
        'sucesso'
      );
    });
  };

  // Handlers do KDS (com trava de 700ms por pedido contra duplo clique)
  const ultimaAcaoPorPedido = useRef(new Map<string, number>());
  const acaoMuitoRecente = (pedidoId: string): boolean => {
    const agora = Date.now();
    const anterior = ultimaAcaoPorPedido.current.get(pedidoId) ?? 0;
    if (agora - anterior < 700) return true;
    ultimaAcaoPorPedido.current.set(pedidoId, agora);
    return false;
  };

  const handleAvancarStatusPedido = (pedidoId: string, statusEsperado: StatusPedido) => {
    if (acaoMuitoRecente(pedidoId)) return;
    executarAcao('atualizar o pedido', () => {
      const pedido = gerenciadorPedidos.avancarStatusPedido(
        pedidoId,
        perfilOperador.nome,
        statusEsperado
      );
      sincronizarInterface();
      dispararToast(
        `Pedido ${pedido.obterCodigoTicket()} → ${pedido.obterStatus()}`,
        pedido.obterStatus() === 'Pronto para Retirada'
          ? 'Tempo real registrado na média móvel e aluno notificado!'
          : `Atualizado por ${perfilOperador.nome}`,
        'sucesso'
      );
    });
  };

  const handleConfirmarPagamento = (pedidoId: string) => {
    if (acaoMuitoRecente(pedidoId)) return;
    executarAcao('registrar o pagamento', () => {
      const pedido = gerenciadorPedidos.confirmarPagamentoPedido(pedidoId, perfilOperador.nome);
      sincronizarInterface();
      dispararToast(
        `Pagamento do ${pedido.obterCodigoTicket()} registrado`,
        `${formatarMoeda(pedido.obterValorTotal())} recebidos no caixa.`,
        'sucesso'
      );
    });
  };

  const handleCancelarPedido = (pedidoId: string, statusEsperado: StatusPedido) => {
    executarAcao('cancelar o pedido', () => {
      const pedido = gerenciadorPedidos.cancelarPedido(
        pedidoId,
        perfilOperador.nome,
        statusEsperado
      );
      sincronizarInterface();
      dispararToast(
        `Pedido ${pedido.obterCodigoTicket()} cancelado`,
        'A fila da cozinha foi recalculada.',
        'info'
      );
    });
  };

  // Handlers CRUD de Cardápio
  const nomeJaExiste = (nome: string, ignorarId?: string) => {
    const alvo = normalizarTexto(nome);
    return cardapio.some(
      (p) => p.obterId() !== ignorarId && normalizarTexto(p.obterNome()) === alvo
    );
  };

  const handleCriarProduto = (
    entrada: EntradaProduto,
    definirErros: (erros: ErrosCampos<CampoProduto>) => void,
    limparFormulario: () => void
  ) => {
    executarAcao('cadastrar o produto', () => {
      const resultado = validarEntradaProduto(entrada);
      const erros: ErrosCampos<CampoProduto> = resultado.ok ? {} : { ...resultado.erros };
      if (resultado.ok && nomeJaExiste(resultado.valor.nome)) {
        erros.nome = 'Já existe um produto com esse nome no cardápio.';
      }
      if (!resultado.ok || Object.keys(erros).length > 0) {
        definirErros(erros);
        dispararToast('Revise os campos destacados', Object.values(erros)[0], 'aviso');
        return;
      }

      const naturezaCodigo = resultado.valor.naturezaPreparo.obterCodigo();
      const novoProduto = new Produto({
        ...resultado.valor,
        descricao: resultado.valor.descricao || descricaoPadrao(naturezaCodigo),
      });

      setCardapio((prev) => [novoProduto, ...prev]);
      limparFormulario();
      sincronizarInterface();

      dispararToast(
        'Produto cadastrado!',
        `${novoProduto.obterNome()} já está disponível para os alunos.`,
        'sucesso'
      );
    });
  };

  const handleEditarProduto = (
    produtoId: string,
    entrada: EntradaProduto,
    definirErros: (erros: ErrosCampos<CampoProduto>) => void,
    fecharModal: () => void
  ) => {
    const produto = cardapio.find((p) => p.obterId() === produtoId);
    if (!produto) {
      fecharModal();
      dispararToast('Produto não encontrado', 'A lista foi atualizada.', 'aviso');
      return;
    }

    executarAcao('salvar o produto', () => {
      const resultado = validarEntradaProduto(entrada);
      const erros: ErrosCampos<CampoProduto> = resultado.ok ? {} : { ...resultado.erros };
      if (resultado.ok && nomeJaExiste(resultado.valor.nome, produto.obterId())) {
        erros.nome = 'Já existe outro produto com esse nome.';
      }
      if (!resultado.ok || Object.keys(erros).length > 0) {
        definirErros(erros);
        return;
      }

      produto.atualizarDados(resultado.valor);
      fecharModal();
      sincronizarInterface();

      dispararToast(
        'Produto atualizado!',
        `As alterações em "${produto.obterNome()}" já estão ativas.`,
        'sucesso'
      );
    });
  };

  const handleAlternarDisponibilidade = (produto: Produto) => {
    executarAcao('alterar a disponibilidade', () => {
      const ficaraEsgotado = produto.estaDisponivel();
      produto.definirDisponibilidade(!ficaraEsgotado);
      sincronizarInterface();
      dispararToast(
        ficaraEsgotado
          ? `${produto.obterNome()} marcado como esgotado`
          : `${produto.obterNome()} voltou ao cardápio`,
        undefined,
        'info'
      );
    });
  };

  const handleRestaurarDemonstracao = () => {
    if (!confirmandoRestauracao) {
      setConfirmandoRestauracao(true);
      return;
    }
    executarAcao('restaurar os dados de demonstração', () => {
      const demonstracao = criarDadosReaisCantina();
      gerenciadorPedidos.substituirEstado(
        demonstracao.gerenciadorInicial.obterTodosPedidos(),
        demonstracao.gerenciadorInicial.obterSequencialTicket()
      );
      carrinho.limpar();
      setCardapio(demonstracao.cardapioInicial);
      setPerfilAluno(PERFIL_ALUNO_PADRAO);
      setPerfilOperador(PERFIL_OPERADOR_PADRAO);
      setEditandoPerfilAluno(false);
      setEditandoPerfilOperador(false);
      setPedidoAcompanhadoId('ped-101');
      setDrawerCarrinhoAberto(false);
      setConfirmandoRestauracao(false);
      sincronizarInterface();
      dispararToast('Dados de demonstração restaurados', undefined, 'info');
    });
  };

  return (
    <div
      className="min-h-screen flex flex-col bg-[#FAF9F5] text-stone-900 selection:bg-orange-500 selection:text-white"
      data-version={versaoEstado}
    >
      <BarraToasts toasts={toasts} aoFechar={fecharToast} />

      <BarraNavegacao
        moduloAtivo={moduloAtivo}
        aoMudarModulo={(modulo) => {
          if (modulo === 'aluno') {
            void solicitarPermissaoNotificacaoNavegador();
          }
          setModuloAtivo(modulo);
        }}
        quantidadeTotalCarrinho={quantidadeTotalCarrinho}
        valorTotalCarrinho={valorTotalCarrinho}
        qtdPedidosAtivos={qtdPedidosAtivosTotais}
        aoAbrirCarrinho={() => {
          if (moduloAtivo === 'boas_vindas') setModuloAtivo('aluno');
          setDrawerCarrinhoAberto(true);
        }}
      />

      {moduloAtivo === 'boas_vindas' && (
        <TelaBoasVindas
          alunoNome={perfilAluno.nome}
          operadorNome={perfilOperador.nome}
          tempoMedioPreparoMinutos={mediaMovelMinutos}
          aoEntrarComoAluno={() => {
            void solicitarPermissaoNotificacaoNavegador();
            setModuloAtivo('aluno');
          }}
          aoEntrarComoCantina={() => setModuloAtivo('cantina')}
        />
      )}

      {/* TelaAluno permanece montada para que seu observer useEffect detecte pedidos prontos em tempo real */}
      <TelaAluno
        visivel={moduloAtivo === 'aluno'}
        perfilAluno={perfilAluno}
        editandoPerfilAluno={editandoPerfilAluno}
        rascunhoAluno={rascunhoAluno}
        errosAluno={errosAluno}
        aoIniciarEdicaoAluno={() => {
          setRascunhoAluno(perfilAluno);
          setErrosAluno({});
          setEditandoPerfilAluno(true);
        }}
        aoAlterarRascunhoAluno={setRascunhoAluno}
        aoSalvarPerfilAluno={salvarPerfilAluno}
        aoCancelarEdicaoAluno={() => {
          setErrosAluno({});
          setEditandoPerfilAluno(false);
        }}
        cardapio={cardapio}
        itensCarrinho={itensCarrinho}
        quantidadeTotalCarrinho={quantidadeTotalCarrinho}
        valorTotalCarrinho={valorTotalCarrinho}
        todosPedidos={todosPedidos}
        historicoTemposReais={historicoTemposReais}
        calculadoraGargalo={calculadoraGargalo}
        carrinhoNoLimite={carrinhoNoLimite}
        pedidoAcompanhadoId={pedidoAcompanhadoId}
        aoSelecionarPedidoAcompanhado={setPedidoAcompanhadoId}
        aoAdicionarAoCarrinho={handleAdicionarAoCarrinho}
        aoAlterarQuantidadeCarrinho={handleAlterarQuantidadeCarrinho}
        aoAbrirCarrinho={() => setDrawerCarrinhoAberto(true)}
        aoNotificarPedidoPronto={(pedidoPronto) =>
          dispararToast(
            `🔔 Pedido ${pedidoPronto.obterCodigoTicket()} Pronto para Retirada!`,
            `Retire agora em: ${pedidoPronto.obterTipoFila()}`,
            'sucesso'
          )
        }
        versaoEstado={versaoEstado}
      />

      {moduloAtivo === 'cantina' && (
        <PainelCantina
          perfilOperador={perfilOperador}
          editandoPerfilOperador={editandoPerfilOperador}
          rascunhoOperador={rascunhoOperador}
          errosOperador={errosOperador}
          aoIniciarEdicaoOperador={() => {
            setRascunhoOperador(perfilOperador);
            setErrosOperador({});
            setEditandoPerfilOperador(true);
          }}
          aoAlterarRascunhoOperador={setRascunhoOperador}
          aoSalvarPerfilOperador={salvarPerfilOperador}
          aoCancelarEdicaoOperador={() => {
            setErrosOperador({});
            setEditandoPerfilOperador(false);
          }}
          todosPedidos={todosPedidos}
          cardapio={cardapio}
          minutosGargaloAtivoChapa={minutosGargaloAtivoChapa}
          qtdPedidosAtivosNaChapa={qtdPedidosAtivosNaChapa}
          mediaMovelMinutos={mediaMovelMinutos}
          aoAvancarStatusPedido={handleAvancarStatusPedido}
          aoConfirmarPagamento={handleConfirmarPagamento}
          aoCancelarPedido={handleCancelarPedido}
          aoCriarProduto={handleCriarProduto}
          aoEditarProduto={handleEditarProduto}
          aoAlternarDisponibilidade={handleAlternarDisponibilidade}
        />
      )}

      <DrawerCarrinho
        aberto={drawerCarrinhoAberto}
        alunoNome={perfilAluno.nome}
        itensCarrinho={itensCarrinho}
        itensIndisponiveis={itensIndisponiveisCarrinho}
        valorTotal={valorTotalCarrinho}
        carrinhoNoLimite={carrinhoNoLimite}
        diagnosticoCarrinho={diagnosticoCarrinho}
        processadoresCheckout={processadoresCheckout}
        codigoMetodoSelecionado={codigoMetodoSelecionado}
        aoSelecionarMetodo={setCodigoMetodoSelecionado}
        aoAlterarQuantidade={handleAlterarQuantidadeCarrinho}
        aoRemoverItem={handleRemoverDoCarrinho}
        aoSubstituirChapaPorEstufa={handleSubstituirChapaPorEstufa}
        aoFinalizarPedido={handleFinalizarPedido}
        aoFechar={() => setDrawerCarrinhoAberto(false)}
      />

      <footer className="bg-white border-t border-slate-200 px-6 py-4 mt-auto">
        <div className="max-w-[1280px] mx-auto flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
          <span>Fast-Track Cantina · CESAR School</span>
          <div className="flex flex-wrap items-center gap-3">
            {confirmandoRestauracao && (
              <button
                type="button"
                onClick={() => setConfirmandoRestauracao(false)}
                className="font-semibold text-slate-500 hover:text-slate-900 cursor-pointer"
              >
                Manter dados atuais
              </button>
            )}
            <button
              type="button"
              onClick={handleRestaurarDemonstracao}
              className={`inline-flex items-center gap-1.5 font-semibold rounded-lg cursor-pointer ${
                confirmandoRestauracao
                  ? 'px-3 py-1.5 text-white bg-red-600 hover:bg-red-700'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>
                {confirmandoRestauracao
                  ? 'Confirmar restauração'
                  : 'Restaurar demonstração'}
              </span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
