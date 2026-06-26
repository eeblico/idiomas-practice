---
version: alpha
name: leadpilot-design
description: Design system moderno, limpo e premium em Light Mode para o LeadPilot AI, inspirado em interfaces contemporâneas como Linear e Vercel.

colors:
  background: "#f4f4f5"
  surface: "#ffffff"
  border: "#e4e4e7"
  text-primary: "#09090b"
  text-secondary: "#71717a"
  accent: "#2563eb"
  accent-hover: "#1d4ed8"
  accent-light: "#eff6ff"
  success: "#16a34a"
  success-light: "#f0fdf4"
  warning: "#d97706"
  warning-light: "#fffbeb"
  danger: "#dc2626"
  danger-light: "#fef2f2"
  info: "#3b82f6"
  info-light: "#eff6ff"

typography:
  display:
    fontFamily: "system-ui, -apple-system, sans-serif"
    fontSize: "30px"
    fontWeight: "700"
    lineHeight: "1.2"
    letterSpacing: "-0.02em"
  h1:
    fontFamily: "system-ui, -apple-system, sans-serif"
    fontSize: "24px"
    fontWeight: "600"
    lineHeight: "1.3"
    letterSpacing: "-0.015em"
  h2:
    fontFamily: "system-ui, -apple-system, sans-serif"
    fontSize: "20px"
    fontWeight: "600"
    lineHeight: "1.3"
  h3:
    fontFamily: "system-ui, -apple-system, sans-serif"
    fontSize: "16px"
    fontWeight: "600"
    lineHeight: "1.4"
  body:
    fontFamily: "system-ui, -apple-system, sans-serif"
    fontSize: "14px"
    fontWeight: "400"
    lineHeight: "1.5"
  caption:
    fontFamily: "system-ui, -apple-system, sans-serif"
    fontSize: "12px"
    fontWeight: "400"
    lineHeight: "1.4"
  mono:
    fontFamily: "monospace"
    fontSize: "12px"
    fontWeight: "400"
    lineHeight: "1.4"

rounded:
  small: "4px"
  medium: "6px"
  large: "10px"
  full: "9999px"

spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"

components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.surface}"
    typography: "{typography.body}"
    rounded: "{rounded.medium}"
    padding: "8px 16px"
  button-primary-hover:
    backgroundColor: "{colors.accent-hover}"
    textColor: "{colors.surface}"
    typography: "{typography.body}"
    rounded: "{rounded.medium}"
    padding: "8px 16px"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    typography: "{typography.body}"
    rounded: "{rounded.medium}"
    padding: "8px 16px"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.large}"
    padding: "16px"
  input-text:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    typography: "{typography.body}"
    rounded: "{rounded.medium}"
    padding: "8px 12px"
  badge-cold:
    backgroundColor: "{colors.info-light}"
    textColor: "{colors.info}"
    typography: "{typography.caption}"
    rounded: "{rounded.full}"
    padding: "4px 8px"
  badge-warm:
    backgroundColor: "{colors.warning-light}"
    textColor: "{colors.warning}"
    typography: "{typography.caption}"
    rounded: "{rounded.full}"
    padding: "4px 8px"
  badge-hot:
    backgroundColor: "{colors.danger-light}"
    textColor: "{colors.danger}"
    typography: "{typography.caption}"
    rounded: "{rounded.full}"
    padding: "4px 8px"
  sidebar-item:
    backgroundColor: "transparent"
    textColor: "{colors.text-secondary}"
    typography: "{typography.body}"
    rounded: "{rounded.medium}"
    padding: "8px 12px"
  sidebar-item-active:
    backgroundColor: "{colors.accent-light}"
    textColor: "{colors.accent}"
    typography: "{typography.body}"
    rounded: "{rounded.medium}"
    padding: "8px 12px"
---

# LeadPilot AI Design System

## Overview

O sistema de design do LeadPilot AI adota uma abordagem Light Mode de alta fidelidade visual, focada na clareza comercial, no profissionalismo e na simplicidade de uso diário. Inspirado em ferramentas contemporâneas como Linear, Vercel Dashboard e Attio, ele utiliza um fundo cinza muito claro, superfícies brancas puras com bordas cinzas suaves e sombras discretas. A tipografia limpa baseada nas fontes de sistema oferece legibilidade impecável e rapidez no carregamento, enquanto os acentos azuis e as cores semânticas identificam rapidamente a temperatura dos leads. 

Evita-se qualquer estilo de tema escuro pesado ou neons excessivos para manter o visual limpo, corporativo e focado nos dados comerciales reais.

## Colors

A paleta de cores é estruturada em torno de tons neutros claros para o layout e cores semânticas bem definidas para sinalizar a urgência de cada lead:
- **`background` (`#f4f4f5`)**: Fornece o fundo contrastante perfeito para destacar os cartões do aplicativo.
- **`surface` (`#ffffff`)**: Utilizado em todos os painéis, cards e caixas de dados, criando uma forte hierarquia tridimensional.
- **`border` (`#e4e4e7`)**: Uma linha de divisão sutil que evita contrastes pretos duros e mantém o visual fluido.
- **`accent` (`#2563eb`)**: Azul royal de alta legibilidade, usado em botões de ação e abas ativas.
- **Cores Semânticas de Temperatura**:
  - `Frio`: Azul claro (`info`) para contatos recém-adquiridos ou frios.
  - `Morno`: Amarelo/Âmbar (`warning`) para contatos em andamento ou mornos.
  - `Quente`: Vermelho sutil (`danger`) para leads de alta prioridade.

## Typography

Utilizamos a fonte nativa do sistema (`system-ui`) para garantir máxima performance de renderização no cliente sem precisar carregar arquivos externos do Google Fonts durante o vídeo. A hierarquia typográfica é organizada em 7 níveis:
- **`display`**: Título de destaque usado na Hero da Landing Page.
- **`h1` a `h3`**: Títulos de seção no Dashboard, Kanban e barra lateral.
- **`body`**: Texto corrido, tabelas e valores padrões.
- **`caption`**: Usado em datas, badges de temperatura e rótulos secundários.
- **`mono`**: Código de identificação do lead (Lead ID) ou atalhos.

## Layout

O layout segue o modelo de duas colunas clássico para aplicações SaaS:
- Uma barra lateral de navegação (Sidebar) fixa à esquerda, com largura de `240px`, fundo branco, borda sutil à direita e itens de menu com espaçamento e padding confortáveis.
- Área de conteúdo principal à direita, com margens confortáveis (`xl` / `32px`) e grades flexíveis (CSS Grid ou Flexbox).
- O pipeline Kanban é estruturado em 4 colunas com largura mínima fixa para permitir visualização de rolagem horizontal em telas menores.

## Elevation & Depth

Para criar profundidade visual no fundo claro:
- Os cards brancos (`surface`) utilizam uma sombra muito sutil (`box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)`) combinada com a borda de `1px` cinza.
- O painel lateral (Drawer) que desliza da direita utiliza uma sombra mais profunda para indicar sobreposição e foco contextual (`box-shadow: -4px 0 12px -2px rgba(0, 0, 0, 0.08)`).
- Botões primários têm sombra discreta para induzir o clique.

## Shapes

Os cantos arredondados seguem uma linguagem visual suave e amigável:
- **`small` (`4px`)**: Detalhes em badges e ícones dentro de cards.
- **`medium` (`6px`)**: Cantos de botões e campos de entrada de texto (inputs).
- **`large` (`10px`)**: Curvatura dos cards de leads, painel lateral e do container do gráfico de funil.
- **`full` (`9999px`)**: Usado em badges/pills de filtros e canal de origem.

## Components

Os componentes visuais do protótipo são construídos no React e estilizados com o arquivo `src/index.css`:
- **`card`**: Caixa de fundo branco, cantos arredondados, borda cinza suave, e hover sutil que eleva levemente o card.
- **`button-primary`**: Botão azul sólido com texto branco, mudando para azul escuro no estado de hover.
- **`button-secondary`**: Fundo branco, borda cinza, texto preto. Usado para botões secundários como fechar painéis ou cancelar.
- **`input-text`**: Fundo branco com borda suave, focado com contorno azul sutil.
- **`badges` (Frio, Morno, Quente)**: Rótulos arredondados ovais com fundo pastel correspondente ao canal ou temperatura e texto na cor semântica em contraste WCAG AA.
- **`sidebar-item`**: Elemento transparente que ganha fundo azul claro pastel e texto azul ao ficar ativo.

## Do's and Don'ts

### Do's
- **Use cores de fundo pastel nas badges**: Garanta que o texto da badge seja legível sobre o fundo claro da tag (ex: texto vermelho escuro sobre fundo vermelho muito claro).
- **Mantenha os cards perfeitamente alinhados**: Utilize CSS Flexbox para alinhar verticalmente os ícones dos canais (WhatsApp/Instagram) ao lado dos nomes dos leads.
- **Exiba feedback de cópia**: O botão de copiar mensagem deve mudar para "Copiado!" temporariamente para dar certeza de sucesso ao usuário.
- **Use espaçamentos consistentes**: Mantenha o padding de `md` (`16px`) como padrão de espaçamento interno em todas as caixas de informação.

### Don'ts
- **Não misture cores escuras no fundo do app**: O fundo principal deve ser consistentemente claro (`#f4f4f5`) e as superfícies brancas.
- **Não use bordas pretas grossas**: Linhas de separação e contornos devem sempre usar a variável de cor `border`.
- **Não use gradientes neon vibrantes no texto do dashboard**: Mantenha as fontes limpas e legíveis, aplicando cores sólidas.
- **Não adicione decorações desnecessárias aos cards**: A informação do lead deve ser a única estrela do card no pipeline.
