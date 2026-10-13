import React, { useState } from 'react';
import { Sparkles, Bot, AlertTriangle, CheckCircle2, Copy, Check, ArrowRight, Zap, RefreshCw } from 'lucide-react';

interface PromptScenario {
  id: string;
  tabLabel: string;
  userPrompt: string;
  withoutContext: {
    title: string;
    reaction: string;
    content: string;
  };
  withContext: {
    title: string;
    reaction: string;
    content: string;
    sourceUsed: string;
  };
}

const PROMPT_SCENARIOS: PromptScenario[] = [
  {
    id: 'hero-compare',
    tabLabel: '1. Pedido de Ideias',
    userPrompt: '“Me dê 10 ideias de conteúdo para o meu nicho de negócios.”',
    withoutContext: {
      title: 'Sem Contexto (IA Padrão)',
      reaction: '💔 Genérico, previsível e sem alma',
      content: `1. 5 Dicas para Alavancar sua Empresa em 2026
2. A Importância do Planejamento Estratégico
3. Como Fazer Gestão de Tempo Eficiente
4. 3 Erros que Todo Empreendedor Comete
5. O Segredo dos Líderes de Sucesso...
(Parece que foi escrito para qualquer pessoa no mundo.)`
    },
    withContext: {
      title: 'Com DNA Prompt (Seu Repertório)',
      reaction: '🔥 Autêntico, provocativo e com sua voz',
      content: `1. "Por que demiti meu melhor cliente quando ele me pediu para mentir numa proposta" (Conecta com sua tese de Integridade Radical).
2. "O erro de R$ 40 mil que cometi no meu 2º ano de consultoria e a regra que criei para nunca mais repetir".
3. "Por que odeio o conselho de 'acorde às 5h da manhã' que os gurus pregam".
4. "O caso da cliente Mariana: como destravar a autoridade sem parecer arrogante".`,
      sourceUsed: 'Baseado no seu Mapa: Pilares de Histórias de Bastidor + Antíteses do Mercado'
    }
  },
  {
    id: 'find-story',
    tabLabel: '2. Encontrar História',
    userPrompt: '“Encontre no meu repertório uma história que possa explicar por que consistência cega gera burnout.”',
    withoutContext: {
      title: 'Sem Contexto (IA Padrão)',
      reaction: '⚠️ Inventa fábulas ou clichês corporativos',
      content: `Era uma vez um profissional chamado João que trabalhava 14 horas por dia até ter estafa. A moral da história é que precisamos de equilíbrio entre vida e trabalho. Use a técnica Pomodoro e beba 2 litros de água por dia.`
    },
    withContext: {
      title: 'Com DNA Prompt (Seu Repertório)',
      reaction: '✨ Puxa sua vivência real mapeada',
      content: `Extraído da sua conversa de Mapeamento:
"Em novembro de 2023, você postou 3x ao dia por 60 dias seguidos seguindo a recomendação de uma agência. Seu engajamento subiu 12%, mas você perdeu 2 clientes high-ticket porque estava exausto demais para entregar o acompanhamento."
→ Gancho sugerido: "Em 2023 eu segui a cartilha perfeita do Instagram e quase quebrei meu negócio..."`,
      sourceUsed: 'Baseado no seu Mapa: História #03 do Notion (Capítulo de Bastidores)'
    }
  },
  {
    id: 'deepen-idea',
    tabLabel: '3. Aprofundar Opinião',
    userPrompt: '“Quais opiniões minhas podem virar conteúdos contra o mercado sobre agências tradicionais?”',
    withoutContext: {
      title: 'Sem Contexto (IA Padrão)',
      reaction: '🥱 Resposta neutra que não incomoda ninguém',
      content: `Agências de marketing prestam bons serviços, mas às vezes a comunicação interna pode falhar. É importante alinhar expectativas e manter relatórios semanais de desempenho para evitar desalinhamentos de objetivos.`
    },
    withContext: {
      title: 'Com DNA Prompt (Seu Repertório)',
      reaction: '⚡ Sua tese forte e posicionamento claro',
      content: `Opiniões mapeadas no seu DNA Prompt:
1. "Agências vendem volume de posts porque é mais fácil mensurar posts entregues do que profundidade de pensamento."
2. "Ninguém lê o rótulo do frasco quando está dentro da garrafa — por isso delegar sua voz para terceiros sempre resulta em cópia sem personalidade."
3. "Calendário editorial mensal é uma fábrica de encher linguiça."`,
      sourceUsed: 'Baseado no seu Mapa: Seção "O Que Defendo" e "O Que Questiono"'
    }
  },
  {
    id: 'unfold-anchor',
    tabLabel: '4. Desdobrar Tema Âncora',
    userPrompt: '“Pegue meu tema âncora de ‘Discernimento Editorial’ e encontre 4 possibilidades de formatos.”',
    withoutContext: {
      title: 'Sem Contexto (IA Padrão)',
      reaction: '📋 Formatos óbvios sem ângulo estratégico',
      content: `1. Post em Carrossel com 5 passos.
2. Vídeo Reels de 30 segundos falando rápido.
3. Post de texto com frase motivacional.
4. Caixinha de perguntas nos stories perguntando o nicho das pessoas.`
    },
    withContext: {
      title: 'Com DNA Prompt (Seu Repertório)',
      reaction: '🧩 Estrutura adaptada ao seu modelo de pensamento',
      content: `1. Carrossel Comparativo: A pirâmide Informação → Extração → Discernimento → Contexto.
2. Vídeo de Provocação: "Por que nem toda história da sua vida deve ir para o seu feed (e como escolher as 3 certas)".
3. Post Narrativo: O dia em que você decidiu filtrar 80% do que sabia e suas vendas triplicaram.
4. Framework em PDF: O checklist de 3 perguntas antes de apertar 'publicar'.`,
      sourceUsed: 'Baseado no seu Mapa: Metodologia e Limites Editoriais'
    }
  },
  {
    id: 'script-voice',
    tabLabel: '5. Roteiro no Seu Tom',
    userPrompt: '“Desenvolva um roteiro mantendo a minha maneira de pensar e falar sobre conteúdo com IA.”',
    withoutContext: {
      title: 'Sem Contexto (IA Padrão)',
      reaction: '🤖 Tom robótico corporativo / papo de LinkedIn',
      content: `Olá pessoal! No mundo dinâmico de hoje, a inteligência artificial tem revolucionado a criação de conteúdo. É fundamental que aproveitemos essas sinergias para potencializar nosso engajamento. Deixe seu like e compartilhe!`
    },
    withContext: {
      title: 'Com DNA Prompt (Seu Repertório)',
      reaction: '🎙️ Sua cadência, vocabulário e estilo direto',
      content: `[Corte seco para a câmera]:
"Você não está sem repertório. Você só está alimentando a IA com o lixo do que os seus concorrentes estão postando.
A verdade é simples: o ChatGPT não adivinha quem você é. Se você entrega um prompt genérico, ele te cospe uma resposta genérica.
O que você precisa não é de 100 ideias novas. É de abrir a gaveta do que você já viveu."`,
      sourceUsed: 'Baseado no seu Mapa: Vocabulário, Cadência e Tom de Voz Registrado'
    }
  }
];

export const AIPromptSimulator: React.FC = () => {
  const [activeScenarioId, setActiveScenarioId] = useState<string>('hero-compare');
  const [copied, setCopied] = useState<boolean>(false);

  const currentScenario = PROMPT_SCENARIOS.find(s => s.id === activeScenarioId) || PROMPT_SCENARIOS[0];

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(currentScenario.userPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        boxShadow: 'var(--shadow-lg)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Decorative top pill */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(124, 58, 237, 0.15)',
              border: '1px solid rgba(124, 58, 237, 0.3)',
              color: 'var(--accent)',
              fontSize: '0.8rem',
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase'
            }}
          >
            <Bot size={14} />
            <span>Simulador Interativo de Repertório vs. IA Padrão</span>
          </div>
        </div>

        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Clique nas abas abaixo para testar diferentes cenários ↴
        </div>
      </div>

      {/* Scenario Selector Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '8px',
          marginBottom: '20px',
          scrollbarWidth: 'none'
        }}
      >
        {PROMPT_SCENARIOS.map(sc => {
          const isActive = sc.id === activeScenarioId;
          return (
            <button
              key={sc.id}
              onClick={() => setActiveScenarioId(sc.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: 'var(--radius-md)',
                border: isActive ? '1px solid var(--accent)' : '1px solid var(--border)',
                background: isActive ? 'rgba(124, 58, 237, 0.18)' : 'var(--bg-tertiary)',
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontSize: '0.85rem',
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all var(--transition-fast)'
              }}
            >
              <span>{sc.tabLabel}</span>
            </button>
          );
        })}
      </div>

      {/* Simulated User Input Bar */}
      <div
        style={{
          background: 'var(--bg-primary)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '14px 18px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #a855f7 0%, #3b82f6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '0.75rem',
              fontWeight: 800,
              flexShrink: 0
            }}
          >
            VOCÊ
          </div>
          <span
            style={{
              fontFamily: 'monospace',
              fontSize: '0.92rem',
              color: 'var(--text-primary)',
              lineHeight: 1.4
            }}
          >
            {currentScenario.userPrompt}
          </span>
        </div>

        <button
          onClick={handleCopyPrompt}
          title="Copiar prompt"
          style={{
            background: 'transparent',
            border: 'none',
            color: copied ? 'var(--success)' : 'var(--text-muted)',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.75rem',
            flexShrink: 0
          }}
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          <span>{copied ? 'Copiado' : 'Copiar'}</span>
        </button>
      </div>

      {/* Side by Side Comparison Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
          gap: '16px'
        }}
      >
        {/* Card 1: WITHOUT Context */}
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.04)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: 'var(--radius-md)',
            padding: '18px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '10px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={18} color="var(--danger)" />
                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--danger)' }}>
                  {currentScenario.withoutContext.title}
                </span>
              </div>
            </div>

            <div
              style={{
                fontSize: '0.78rem',
                color: 'var(--danger)',
                fontWeight: 600,
                marginBottom: '12px'
              }}
            >
              {currentScenario.withoutContext.reaction}
            </div>

            <pre
              style={{
                fontFamily: 'monospace',
                fontSize: '0.82rem',
                color: 'var(--text-secondary)',
                background: 'var(--bg-primary)',
                padding: '14px',
                borderRadius: '8px',
                whiteSpace: 'pre-wrap',
                lineHeight: 1.5,
                border: '1px solid var(--border)',
                margin: 0
              }}
            >
              {currentScenario.withoutContext.content}
            </pre>
          </div>

          <div
            style={{
              marginTop: '14px',
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              borderTop: '1px dashed var(--border)',
              paddingTop: '8px'
            }}
          >
            ❌ Não sabe quem você é, o que viveu nem como fala.
          </div>
        </div>

        {/* Card 2: WITH DNA Prompt Context */}
        <div
          style={{
            background: 'rgba(16, 185, 129, 0.05)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '18px',
            boxShadow: '0 0 20px rgba(16, 185, 129, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '10px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={18} color="var(--success)" />
                <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--success)' }}>
                  {currentScenario.withContext.title}
                </span>
              </div>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '12px',
                  background: 'rgba(16, 185, 129, 0.2)',
                  color: 'var(--success)'
                }}
              >
                FALA QUE EU TE ESCUTO
              </span>
            </div>

            <div
              style={{
                fontSize: '0.78rem',
                color: 'var(--success)',
                fontWeight: 600,
                marginBottom: '12px'
              }}
            >
              {currentScenario.withContext.reaction}
            </div>

            <pre
              style={{
                fontFamily: 'monospace',
                fontSize: '0.82rem',
                color: 'var(--text-primary)',
                background: 'var(--bg-primary)',
                padding: '14px',
                borderRadius: '8px',
                whiteSpace: 'pre-wrap',
                lineHeight: 1.5,
                border: '1px solid rgba(16, 185, 129, 0.25)',
                margin: 0
              }}
            >
              {currentScenario.withContext.content}
            </pre>
          </div>

          <div
            style={{
              marginTop: '14px',
              fontSize: '0.76rem',
              color: 'var(--text-secondary)',
              borderTop: '1px dashed rgba(16, 185, 129, 0.3)',
              paddingTop: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Sparkles size={14} color="var(--accent)" />
            <span><strong>Origem:</strong> {currentScenario.withContext.sourceUsed}</span>
          </div>
        </div>
      </div>

      {/* Bottom Summary Callout */}
      <div
        style={{
          marginTop: '20px',
          textAlign: 'center',
          padding: '12px',
          background: 'rgba(124, 58, 237, 0.08)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid rgba(124, 58, 237, 0.2)',
          fontSize: '0.88rem',
          color: 'var(--text-secondary)'
        }}
      >
        💡 <strong>O que muda:</strong> Você deixa de usar IA como uma <em>máquina de ideias genéricas</em> e passa a usar como uma <em>ferramenta que trabalha sobre o seu repertório real</em>.
      </div>
    </div>
  );
};
