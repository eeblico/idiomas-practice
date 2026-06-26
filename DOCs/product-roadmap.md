# Product Roadmap — LeadPilot AI

> Gerado pelo PLAID. O agente de codificação deve marcar as tarefas como `- [x]` à medida que forem concluídas.

**Status:** Aguardando para iniciar (0/10 tarefas completas)
**Current Phase:** Phase 0: Foundation & UI System

---

## Build Philosophy

1. **Cada fase entrega algo utilizável comercialmente.** Nenhuma fase deixa a aplicação quebrada ou inexecutável.
2. **Sistema de estilo simplificado.** Estilização centralizada usando CSS Vanilla moderno para acelerar o desenvolvimento do agente.
3. **Foco no momento mágico da simulação.** Priorizar o pipeline de leads e os templates de mensagens para viabilizar a demonstração comercial rápida.
4. **Offline-first estrito.** Zero consumo de APIs externas ou logins reais para evitar bugs de integração no vídeo.
5. **Revisão rápida de sessões.** O agente deve ler apenas as seções do PRD especificadas nas referências da fase atual para otimizar o uso do contexto.

---

## Phase 0: Foundation & UI System

> **Goal:** Configurar a estrutura básica do projeto, criar a paleta de cores moderna em CSS global e implementar a barra de navegação principal.

**Reference sections — read these before starting this phase:**
- PRD: `§ 2. Technical Architecture > Chosen Stack`
- PRD: `§ 2. Technical Architecture > Repository Structure`
- Vision: `§ 4. Brand Strategy > Brand Personality`

**Phase prompt — give this to your coding agent:**
> "Leia docs/product-roadmap.md e encontre a Phase 0. Leia as seções de referência correspondentes em docs/prd.md e docs/product-vision.md. Comece a trabalhar na TASK-001. Atualize o arquivo do roadmap marcando as caixas com [x] conforme conclui as tarefas. Ao final da Phase 0, certifique-se de que a sidebar de navegação e a estrutura da aplicação rodam localmente."

- [ ] **TASK-001** — Configuração do CSS Global e Variáveis de Cores
  Files: `src/index.css`
  Notes: Definir variáveis CSS de cores para o tema escuro (fundo escuro de cockpit `#0f172a`, glows de neon lilás `#a855f7` e neon verde `#22c55e`). Configurar resets básicos de layout, centralização de tipografia limpa (Inter ou system-ui) e transições suaves globais.
  Verify: Verifique se o arquivo compila sem erros no build do Vite.

- [ ] **TASK-002** — Contexto de Estado Global e Persistência local (Dados de Mock)
  Files: `src/context/LeadContext.tsx`, `src/data/mockLeads.ts`
  Notes: Criar o arquivo de dados mockados contendo uma lista inicial de pelo menos 5 leads fictícios realistas (com nome, empresa, e-mail, telefone, canal de entrada, temperatura térmica 'Quente'/'Morno'/'Frio' e status 'Novo'/'Contato Inicial'). Desenvolver o `LeadContext` que gerencia o array de leads no estado do React, lê e escreve no `localStorage` do navegador para persistência da simulação comercial.
  Verify: Escreva um console.log no carregamento inicial mostrando os leads vindos do localStorage.

- [ ] **TASK-003** — Layout Estrutural e Sidebar de Navegação
  Files: `src/App.tsx`, `src/components/Sidebar.tsx`
  Notes: Criar o componente `Sidebar` fixo na lateral esquerda exibindo o título "LeadPilot AI" e botões com ícones visuais elegantes (usando Lucide-React se disponível ou SVG em linha) para alternar as telas (Landing, Dashboard, Funil, Lista de Leads, Configurações). Integrar o `LeadProvider` no `App.tsx` e controlar a alternância de tela ativa via estado simples (`activeTab`).
  Verify: Inicie o servidor de desenvolvimento, clique nos itens da barra de navegação e confirme se o título da tela ativa é renderizado no container principal.

---

## Phase 1: Cockpit & Pipeline

> **Goal:** Implementar o dashboard comercial de oportunidades e a visualização do funil de leads em formato Kanban.

**Reference sections — read these before starting this phase:**
- PRD: `§ 3. Data Model > Entity Definitions`
- PRD: `§ 6. Functional Requirements > FR-002: Dashboard Comercial`
- PRD: `§ 8. UI/UX Requirements > Screen: Funil Pipeline (Kanban)`

**Phase prompt — give this to your coding agent:**
> "Leia docs/product-roadmap.md e encontre a Phase 1. Leia as seções de referência correspondentes em docs/prd.md e docs/product-vision.md. Comece a trabalhar na TASK-004. Atualize o roadmap conforme avança. Ao final da fase, verifique se as colunas do funil atualizam dinamicamente as métricas no dashboard."

- [ ] **TASK-004** — Dashboard de Métricas e Funil de Vendas
  Files: `src/components/Dashboard.tsx`
  Notes: Criar uma tela com 3 cards de métricas (Total de Leads, Oportunidades Quentes e Leads Convertidos) calculadas dinamicamente com base no estado global de leads. Adicionar uma representação gráfica simples do funil de vendas em formato de barras verticais ou horizontais em CSS puro mostrando a contagem de leads em cada status comercial.
  Verify: Altere um dado de lead manualmente no mock e confirme se os números no dashboard atualizam dinamicamente.

- [ ] **TASK-005** — Pipeline Kanban de Leads com Colunas Interativas
  Files: `src/components/Pipeline.tsx`
  Notes: Criar o layout do Kanban com 4 colunas ('Novo', 'Contato Inicial', 'Em Negociação', 'Fechado/Perdido'). Renderizar os cards de leads organizados por coluna. Cada card de lead deve exibir tags visuais de cor conforme sua temperatura (Frio = azul, Morno = amarelo/laranja, Quente = verde/vermelho). Adicionar botões rápidos discretos no rodapé de cada card (ex: "→" e "←") ou drag & drop simplificado para mover o lead rapidamente entre as colunas, disparando a atualização no Context.
  Verify: Clique no botão de avançar de um lead da coluna 'Novo' e confirme se ele é reposicionado na coluna 'Contato Inicial' na interface gráfica.

- [ ] **TASK-006** — Visualização de Tabela de Leads com Filtros de Temperatura
  Files: `src/components/LeadList.tsx`
  Notes: Criar uma tela de tabela alternativa para visualizar os leads como uma lista detalhada. Implementar filtros rápidos no topo para filtrar leads por temperatura ('Quente', 'Morno', 'Frio') e canais de entrada ('WhatsApp', 'Instagram', etc.).
  Verify: Selecione o filtro "Quente" e certifique-se de que apenas leads com temperatura correspondente são exibidos na lista.

---

## Phase 2: Details & Follow-up

> **Goal:** Construir o painel lateral de detalhes de leads com roteiros de mensagens prontos para copiar, a Landing Page do produto e a tela de configurações.

**Reference sections — read these before starting this phase:**
- PRD: `§ 5. User Stories > Epic: Visualização Comercial`
- PRD: `§ 6. Functional Requirements > FR-003: Biblioteca de Roteiros`
- PRD: `§ 8. UI/UX Requirements > Screen: Landing Page`

**Phase prompt — give this to your coding agent:**
> "Leia docs/product-roadmap.md e encontre a Phase 2. Leia as seções de referência correspondentes em docs/prd.md e docs/product-vision.md. Comece a trabalhar na TASK-007. Ao final, faça testes completos de fluxos cruzados na aplicação e remova quaisquer logs de depuração temporários."

- [ ] **TASK-007** — Painel Lateral de Detalhes e Roteiros de Mensagens
  Files: `src/components/LeadDetails.tsx`
  Notes: Criar um componente de painel lateral (Drawer/Slide-over) que desliza a partir do lado direito quando um lead é selecionado no Kanban ou na Lista. Exibir os detalhes completos do lead (telefone, e-mail, canal, histórico e data de criação). Mostrar um Lead Score (de 0 a 100) destacado visualmente baseado na temperatura (Frio = 30, Morno = 65, Quente = 95). Exibir uma caixa com a recomendação do próximo follow-up contendo um template de texto correspondente ao status atual (ex: para status 'Novo', mostrar mensagem de boas-vindas; para status 'Em Negociação', mostrar lembrete de proposta).
  Verify: Clique em leads com status diferentes e verifique se o roteiro de mensagem exibido na tela é atualizado dinamicamente.

- [ ] **TASK-008** — Sistema de Cópia Rápida com Feedback Toast
  Files: `src/components/LeadDetails.tsx`
  Notes: Adicionar funcionalidade no botão de cópia do painel lateral que utiliza a Clipboard API (`navigator.clipboard.writeText`) para transferir o roteiro de mensagem formatado do lead. Implementar um sistema de feedback visual rápido (pode ser a alteração temporária do texto do botão para "Copiado!" por 2 segundos ou um toast flutuante no topo da tela).
  Verify: Clique no botão de cópia rápida, abra um editor de textos e cole o conteúdo confirmando que a mensagem copiada está idêntica ao template.

- [ ] **TASK-009** — Landing Page e Página de Configurações
  Files: `src/components/LandingPage.tsx`, `src/components/Settings.tsx`
  Notes: Criar a tela `LandingPage` institucional do LeadPilot AI com título atraente, seção explicativa em parágrafos elegantes sobre os benefícios e botão CTA que redireciona o usuário para o Dashboard do app. Desenvolver a tela `Settings` simulando configurações do perfil do vendedor e opções para restaurar os dados de leads padrão no localStorage (botão de "Resetar Dados Comercial").
  Verify: Clique no botão de reset nas configurações e verifique se a lista de leads é restaurada ao estado de mock padrão inicial.

- [ ] **TASK-010** — Polish, Ajuste de Responsividade e Validação Final
  Files: `src/App.tsx`, `src/index.css`
  Notes: Realizar ajustes finais de espaçamento (padding/margin), verificar se a visualização mobile oculta a sidebar para layouts de barra inferior compacta e refinar transições de animação no slide-over do painel lateral. Validar se a contagem total de tarefas no topo do arquivo do roadmap está correta.
  Verify: Teste o app em diferentes tamanhos de tela do navegador e confirme que a navegação e o pipeline Kanban não quebram o layout.

---

## Agent Session Guide

### Como usar este Roadmap com seu Agente de Código

1. **Início da Sessão:** Forneça ao agente o prompt correspondente ao início da fase no início das alterações.
2. **Leitura Seletiva:** Instrua o agente a ler apenas as seções de referência do PRD e Vision descritas em cada fase para economizar contexto e processamento.
3. **Fluxo Contínuo:** Garanta que o agente atualize o checkbox Markdown para `- [x]` na tarefa correspondente imediatamente após finalizá-la e validá-la.
4. **Verificação de Fim de Fase:** Ao final de cada fase, certifique-se de que a aplicação se encontra em um estado executável e estável antes de prosseguir.
