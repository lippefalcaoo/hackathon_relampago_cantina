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
