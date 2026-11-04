# 🍔 Fast-Track Cantina — CESAR School

Prova de Conceito (PoC) desenvolvida para otimizar o intervalo de 15 minutos na cantina da CESAR School, reduzindo filas através de pedidos antecipados, previsão de tempo em tempo real e separação inteligente de fluxo de retirada.

## 💡 O que é o App?

O sistema é dividido em duas visões integradas em tempo real:

- **Visão do Aluno (Comprador):** Permite consultar o cardápio separado por tempo de preparo (⚡ *Prontos/Estufa* vs. 🍳 *Feitos na Hora*), visualizar o cálculo dinâmico de espera conforme a lotação da cozinha, montar o carrinho e escolher entre pagar no App (**Fila Expressa / Fast-Pass**) ou pagar na loja (**Fila do Caixa**), acompanhando o status do pedido ao vivo.
- **Visão da Cantina (Vendedor):** Painel de operação (KDS) para gerenciamento da fila de pedidos (`Recebido` ➔ `Fazendo` ➔ `Pronto` ➔ `Entregue`) com identificação visual do status de pagamento, registro de pagamento no caixa, cancelamento de pedidos, além de cadastro, edição e controle de itens esgotados no cardápio.

## 🛠️ Stack Utilizada

- **Front-end:** React 19 + TypeScript, Vite e Tailwind CSS 4
- **Domínio:** classes TypeScript orientadas a objetos (`src/domain`), com padrão Strategy para natureza de preparo e forma de pagamento
- **Armazenamento:** `localStorage` do navegador (`src/infra`), com sincronização automática entre abas

  >Justificativa
- React 19: utilizado na construção das interfaces interativas, permitindo organizar a aplicação em componentes reutilizáveis e facilitar a manutenção das diferentes telas.

- TypeScript: utilizado na implementação das classes de domínio e regras de negócio, oferecendo tipagem estática e maior segurança no tratamento dos dados.

- Vite: utilizado como ferramenta de desenvolvimento e build, proporcionando um ambiente de desenvolvimento rápido e geração dos arquivos para execução da aplicação.

- Tailwind CSS 4: utilizado na estilização das interfaces por meio de classes utilitárias, facilitando a criação e padronização dos elementos visuais.

- localStorage: utilizado para persistência local dos dados no navegador, dispensando a configuração de um banco de dados externo para esta prova de conceito.

- Lucide React: utilizado para fornecer ícones personalizáveis nos elementos da interface.

- Motion: utilizado para implementar animações e transições nos componentes da aplicação.

A stack atende à proposta de uma aplicação web interativa, permitindo desenvolver as interfaces, implementar regras de negócio e persistir os dados localmente, sem a necessidade de uma infraestrutura de backend para esta PoC.

## 🧩 Onde estão os princípios de projeto?

Os princípios do capítulo 5 de *Engenharia de Software Moderna* foram aplicados principalmente na organização das classes de domínio, no encapsulamento das regras de negócio e na utilização de interfaces para reduzir o acoplamento entre componentes.

| Princípio | Onde encontrar no código | Aplicação no projeto |
|---|---|---|
| **Responsabilidade Única (SRP)** | `src/domain/cantinaDomain.ts` — `Produto`, `Pedido` e `CalculadoraGargaloFila` | As classes possuem responsabilidades distintas, como gerenciamento dos produtos, controle dos pedidos e cálculo da estimativa de espera, favorecendo a coesão e a manutenção. |
| **Ocultamento de Informação** | `src/domain/cantinaDomain.ts` — `Produto`, `Carrinho` e `Pedido` | Os atributos internos são protegidos com `private`, permitindo que alterações ocorram por métodos que preservam as regras de negócio. |
| **Coesão** | `src/domain/cantinaDomain.ts` — `Carrinho`, `Pedido` e `GerenciadorPedidos` | Os métodos de cada classe estão relacionados à sua responsabilidade. Por exemplo, `Carrinho` concentra as operações de gerenciamento dos itens e cálculo dos valores. |
| **Inversão de Dependências (DIP)** | `src/domain/cantinaDomain.ts` — `ProcessadorCheckout` e `NaturezaPreparo` | O sistema utiliza interfaces para definir contratos de pagamento e preparo, permitindo diferentes implementações sem depender diretamente de classes concretas. |
| **Composição em vez de Herança** | `src/domain/cantinaDomain.ts` — `Produto`, `ItemCarrinho` e `Pedido` | Os objetos são construídos a partir de outros objetos, permitindo combinar responsabilidades e comportamentos sem depender de hierarquias de herança. |
| **Aberto/Fechado (OCP)** | `src/domain/cantinaDomain.ts` — `ProcessadorCheckout`, `PagamentoOnlineApp` e `PagamentoPresencialLoja` | As formas de pagamento são implementadas separadamente por meio de uma interface, permitindo adicionar novas estratégias sem modificar diretamente a lógica de finalização dos pedidos. |
| **Substituição de Liskov (LSP)** | `src/domain/cantinaDomain.ts` — `NaturezaPreparo` e `ProcessadorCheckout` | As diferentes implementações seguem os contratos de suas interfaces, podendo ser utilizadas nos mesmos pontos do sistema. |
| **Integridade Conceitual** | `src/domain/cantinaDomain.ts` — `ETAPAS_PEDIDO`, `LIMITES` e classes de domínio; `src/domain/erros.ts` | As regras, os estados e os limites são centralizados, mantendo soluções e convenções consistentes ao longo do sistema. |

**Observação:** Os princípios são demonstrados principalmente na camada de domínio (`src/domain`). A camada de persistência está organizada separadamente em `src/infra/persistenciaCantina.ts`.
## 🛡️ Robustez e tratamento de erros

- **Erros de domínio tipados** (`src/domain/erros.ts`): validação, regra de negócio, conflito e não encontrado. A interface mostra mensagens claras e nunca expõe detalhes técnicos ao usuário.
- **Validação completa** de produtos, quantidades, alunos e operadores, com erro destacado em cada campo do formulário.
- **Regras de negócio protegidas:** pedido "pagar no caixa" só é entregue após o pagamento ser registrado; duplo clique no KDS não pula etapas; pedidos guardam uma cópia dos itens, então editar o cardápio não altera pedidos já feitos; limites de unidades por pedido e de pedidos em aberto por matrícula.
- **Persistência resiliente:** os dados sobrevivem ao recarregar a página; dados corrompidos são descartados registro a registro (com backup); se o navegador bloquear o armazenamento, o app continua funcionando e avisa.
- **Error Boundary:** um erro inesperado de renderização mostra uma tela de recuperação em vez de uma página em branco.

> Dica para a demonstração: abra a visão do aluno em uma aba e o KDS em outra. Os pedidos aparecem na cozinha sem recarregar. O botão "Restaurar dados de demonstração", no rodapé, volta tudo ao estado inicial.

## 🚀 Como Rodar

1. Clone este repositório:

   ```
   git clone https://github.com/lippefalcaoo/hackathon_relampago_cantina.git
   cd hackathon_relampago_cantina
   ```

2. Instale as dependências e suba o servidor de desenvolvimento:

   ```
   npm install
   npm run dev
   ```

3. Acesse `http://localhost:3000`.

## ✅ Testes

```
npm test       # testes do domínio e da persistência
npm run lint   # checagem de tipos
```
## Equipe e responsabilidades

| Integrante | Papel e responsabilidades |
|---|---|
| **Filipe Falcão** | Líder de desenvolvimento: coordenação das atividades técnicas e acompanhamento do desenvolvimento do projeto. |
| **Aurea Patrícia** | Design e desenvolvimento da interface: participação na concepção visual e organização dos elementos da interface. |
| **Brenda Paiva** | Design e desenvolvimento da interface: participação na concepção visual e organização dos elementos da interface. |
| **Brenna Lyra** | Documentação do projeto, elaboração do README, organização da entrega do vídeo e participação no processo de ideação. |
| **Ardilles Felix** | Produção e edição do vídeo de apresentação do projeto. |
| **Lucas Vinícius** | Desenvolvimento e revisão do código. |
| **Gabriel Pimentel** | Desenvolvimento e revisão do código. |
| **Manoel Messias** | Desenvolvimento e revisão do código. |
