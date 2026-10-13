import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeMode = 'dark' | 'light';
export type ActiveTab = 'landing' | 'cockpit' | 'exporter' | 'prompts';

export interface ContextPillars {
  stories: string[];
  beliefs: string[];
  antitheses: string[];
  vocabulary: string[];
  positioning: string[];
}

export interface AIPromptItem {
  id: string;
  category: 'Linha Editorial' | 'Posts de Venda' | 'Histórias de Conexão' | 'Carrosséis' | 'Vídeos Curtos';
  title: string;
  prompt: string;
}

export interface ClientSession {
  clientName: string;
  clientNiche: string;
  sessionDate: string;
  rawTranscript: string;
  pillars: ContextPillars;
  prompts: AIPromptItem[];
}

interface BrandTherapyContextType {
  theme: ThemeMode;
  toggleTheme: () => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  session: ClientSession;
  updateSession: (partialSession: Partial<ClientSession>) => void;
  updatePillar: (pillarKey: keyof ContextPillars, items: string[]) => void;
  resetSession: () => void;
  generateNotionMarkdown: () => string;
  generateWordHTML: () => string;
}

const DEFAULT_SESSION: ClientSession = {
  clientName: 'Cliente Exemplo',
  clientNiche: 'Consultoria Estratégica & Mentorias',
  sessionDate: new Date().toISOString().split('T')[0],
  rawTranscript: `Exemplo de Transcrição da Reunião de 2 Horas:
- Jonas: "Me conta a história de quando você percebeu que o mercado atual estava errado?"
- Cliente: "Eu passei 5 anos tentando usar agências tradicionais. Elas me entregavam textos bonitos, mas genéricos. Não tinha minha alma nem minhas crenças reais. Quando comecei a alimentar o ChatGPT com as minhas próprias frases e causos do dia a dia, tudo mudou."
- Jonas: "Excelente. Qual é a sua principal crença que a maioria discorda?"
- Cliente: "Que conteúdo não serve para agradar todo mundo. Se ninguém fica incomodado com a sua tese, você não tem posicionamento de verdade."`,
  pillars: {
    stories: [
      'Passou 5 anos contratando agências tradicionais e recebendo conteúdo genérico sem alma.',
      'Momento de virada: Quando passou a alimentar a IA com causos reais e frases do seu próprio dia a dia.',
      'A revelação de que ninguém lê o rótulo do frasco quando está dentro da garrafa.'
    ],
    beliefs: [
      'Conteúdo genérico de IA é reflexo de falta de contexto, não culpa da ferramenta.',
      'Se o seu posicionamento não incomoda ninguém, ele não atrai ninguém relevante.',
      'A IA é a melhor aceleradora de produção de conteúdo, desde que você forneça a matéria-prima autêntica.'
    ],
    antitheses: [
      'Contra o mito de que "você precisa postar 3 vezes ao dia conteúdo genérico".',
      'Contra agências que cobram caro para entregar cópias sem personalidade.',
      'Contra a ideia de que criar conteúdo autêntico exige horas diárias de escrita do zero.'
    ],
    vocabulary: [
      '"Cérebro Digital de Conteúdo"',
      '"Matéria-prima bruta"',
      '"Rótulo dentro da garrafa"',
      '"Provocação estratégica"',
      '"Repertório autêntico"'
    ],
    positioning: [
      'Especialista em transformar vivências individuais em Arquitetura de Contexto para IA.',
      'Serviço exclusivo de Terapia de Marca e extração de contexto em 2 horas de videochamada.',
      'Entrega do Cérebro Digital no Notion pronto para gerar 60+ conteúdos com autenticidade.'
    ]
  },
  prompts: [
    {
      id: 'p1',
      category: 'Linha Editorial',
      title: 'Prompt Mestre: O Rótulo de Dentro da Garrafa',
      prompt: `Aja como o estrategista de conteúdo autêntico do meu negócio. Use os dados do meu Cérebro Digital abaixo para escrever um post provocativo para o LinkedIn sobre por que a maioria das pessoas falha ao usar IA sem contexto prévio.\n\n[CONTEXTO DO CLIENTE]:\n- Nicho: Consultoria Estratégica\n- Crença Central: Conteúdo sem contexto vira texto de robô.\n- Tom de Voz: Provocativo, autêntico, direto ao ponto.\n- Chamada para Ação: Convide para agendar a Terapia de Marca de 2h.`
    },
    {
      id: 'p2',
      category: 'Posts de Venda',
      title: 'Prompt Mestre: Conversão de Alta Autoridade',
      prompt: `Escreva uma sequência de 3 stories do Instagram contando a história de virada do meu Cérebro Digital. O objetivo é mostrar que uma sessão de 2 horas entrega mais repertório que 6 meses de agência tradicional.`
    },
    {
      id: 'p3',
      category: 'Carrosséis',
      title: 'Carrossel: Os 5 Erros da IA sem Contexto',
      prompt: `Crie a estrutura slide por slide de um carrossel de 7 páginas desmistificando o uso genérico do ChatGPT e apresentando o conceito do Segundo Cérebro em 2 Horas.`
    }
  ]
};

const BrandTherapyContext = createContext<BrandTherapyContextType | undefined>(undefined);

export const BrandTherapyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  const [theme, setTheme] = useState<ThemeMode>(() => {
    const savedTheme = localStorage.getItem('bt_theme') as ThemeMode;
    return savedTheme || 'dark';
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('landing');

  const [session, setSession] = useState<ClientSession>(() => {
    const savedSession = localStorage.getItem('bt_session');
    if (savedSession) {
      try {
        return JSON.parse(savedSession);
      } catch (e) {
        console.error('Error loading saved session', e);
      }
    }
    return DEFAULT_SESSION;
  });

  useEffect(() => {
    localStorage.setItem('bt_theme', theme);
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light-theme');
    } else {
      root.classList.remove('light-theme');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('bt_session', JSON.stringify(session));
  }, [session]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const updateSession = (partialSession: Partial<ClientSession>) => {
    setSession(prev => ({ ...prev, ...partialSession }));
  };

  const updatePillar = (pillarKey: keyof ContextPillars, items: string[]) => {
    setSession(prev => ({
      ...prev,
      pillars: {
        ...prev.pillars,
        [pillarKey]: items
      }
    }));
  };

  const resetSession = () => {
    setSession(DEFAULT_SESSION);
    localStorage.removeItem('bt_session');
  };

  const generateNotionMarkdown = (): string => {
    return `# 🧠 Cérebro Digital de Conteúdo — ${session.clientName}
> **Extração de Contexto & Terapia de Marca (2 Horas)**
> *Data da Sessão:* ${session.sessionDate} | *Nicho:* ${session.clientNiche}

---

## 1. 📖 Matéria-Prima de Histórias & Origem
${session.pillars.stories.map(s => `- ${s}`).join('\n')}

---

## 2. ⚡ Crenças Centrais & Teses de Mercado
${session.pillars.beliefs.map(b => `- ${b}`).join('\n')}

---

## 3. 🛡️ Antíteses & O Que Nós Odiamos no Mercado
${session.pillars.antitheses.map(a => `- ${a}`).join('\n')}

---

## 4. 🗣️ Vocabulário Único & Tom de Voz Autêntico
${session.pillars.vocabulary.map(v => `- \`${v}\``).join('\n')}

---

## 5. 🎯 Posicionamento & Ângulos de Ataque
${session.pillars.positioning.map(p => `- ${p}`).join('\n')}

---

## 🤖 Prompts Mestre para Inteligência Artificial (ChatGPT / Claude / DeepSeek)

${session.prompts.map(p => `### ${p.title} [${p.category}]
\`\`\`markdown
${p.prompt}
\`\`\`
`).join('\n\n')}

---
*Gerado via Terapia de Marca | O seu Segundo Cérebro em 2 Horas.*`;
  };

  const generateWordHTML = (): string => {
    return `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head><meta charset='utf-8'><title>Cérebro Digital - ${session.clientName}</title>
<style>
  body { font-family: 'Calibri', 'Arial', sans-serif; color: #1e293b; line-height: 1.6; padding: 20px; }
  h1 { color: #7e22ce; font-size: 24pt; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; }
  h2 { color: #a855f7; font-size: 16pt; margin-top: 24px; }
  h3 { color: #2563eb; font-size: 13pt; margin-top: 18px; }
  .callout { background: #f3e8ff; border-left: 4px solid #a855f7; padding: 12px 16px; margin: 12px 0; border-radius: 4px; }
  ul { margin-left: 20px; }
  li { margin-bottom: 6px; }
  .prompt-box { background: #f8fafc; border: 1px solid #cbd5e1; padding: 12px; font-family: 'Consolas', monospace; font-size: 10pt; border-radius: 4px; margin-top: 8px; }
</style>
</head>
<body>
  <h1>🧠 Cérebro Digital de Conteúdo — ${session.clientName}</h1>
  <div class="callout">
    <strong>Extração de Contexto & Terapia de Marca (2 Horas)</strong><br/>
    <em>Data da Sessão: ${session.sessionDate} | Nicho: ${session.clientNiche}</em>
  </div>

  <h2>📖 1. Matéria-Prima de Histórias & Origem</h2>
  <ul>${session.pillars.stories.map(s => `<li>${s}</li>`).join('')}</ul>

  <h2>⚡ 2. Crenças Centrais & Teses de Mercado</h2>
  <ul>${session.pillars.beliefs.map(b => `<li>${b}</li>`).join('')}</ul>

  <h2>🛡️ 3. Antíteses & O Que Nós Odiamos no Mercado</h2>
  <ul>${session.pillars.antitheses.map(a => `<li>${a}</li>`).join('')}</ul>

  <h2>🗣️ 4. Vocabulário Único & Tom de Voz Autêntico</h2>
  <ul>${session.pillars.vocabulary.map(v => `<li><strong>${v}</strong></li>`).join('')}</ul>

  <h2>🎯 5. Posicionamento & Ângulos de Ataque</h2>
  <ul>${session.pillars.positioning.map(p => `<li>${p}</li>`).join('')}</ul>

  <h2>🤖 Prompts Mestre para IA</h2>
  ${session.prompts.map(p => `
    <h3>${p.title} [${p.category}]</h3>
    <div class="prompt-box">${p.prompt.replace(/\n/g, '<br/>')}</div>
  `).join('')}
</body>
</html>`;
  };


  return (
    <BrandTherapyContext.Provider
      value={{
        theme,
        toggleTheme,
        activeTab,
        setActiveTab,
        session,
        updateSession,
        updatePillar,
        resetSession,
        generateNotionMarkdown,
        generateWordHTML
      }}
    >
      {children}
    </BrandTherapyContext.Provider>
  );
};

export const useBrandTherapy = () => {
  const context = useContext(BrandTherapyContext);
  if (!context) {
    throw new Error('useBrandTherapy must be used within a BrandTherapyProvider');
  }
  return context;
};
