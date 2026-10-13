import React, { useState } from 'react';
import {
  FolderKanban,
  FileText,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Database,
  Tag,
  Shield,
  Layers,
  BookOpen,
  MessageSquare,
  Compass,
  CheckCircle2,
  Lock,
  Search
} from 'lucide-react';

interface NotionBlock {
  id: string;
  title: string;
  category: string;
  icon: string;
  tag: string;
  preview: string[];
  explanation: string;
}

const NOTION_BLOCKS: NotionBlock[] = [
  {
    id: 'quem-sou',
    title: 'Quem Sou',
    category: 'Identidade',
    icon: '👤',
    tag: 'Fundação',
    preview: [
      'Origem profissional: 10 anos atuando na trincheira do mercado sem atalhos.',
      'O momento divisor de águas que definiu a metodologia atual.',
      'Valores inegociáveis que moldam cada decisão comercial.'
    ],
    explanation: 'A biografia viva e não-engessada que a IA consulta para nunca soar desconectada da sua história real.'
  },
  {
    id: 'o-que-faco',
    title: 'O Que Faço',
    category: 'Identidade',
    icon: '⚡',
    tag: 'Oferta',
    preview: [
      'Transformação central: Extração e discernimento de repertório bruto para IA.',
      'O mecanismo único: A sessão individual de provocação de 90 minutos.',
      'O resultado prático: Cérebro no Notion + DNA Prompt para ChatGPT/Claude.'
    ],
    explanation: 'A clareza cirúrgica sobre a sua entrega, sem jargões corporativos genéricos.'
  },
  {
    id: 'para-quem-faco',
    title: 'Para Quem Faço',
    category: 'Público',
    icon: '🎯',
    tag: 'Avatar Real',
    preview: [
      'Profissionais experientes que cansaram de respostas genéricas da IA.',
      'Criadores e consultores com vasta bagagem prática, mas sem tempo para estruturar.',
      'Quem recusa publicar posts rasos ou depender de dancinhas e trends.'
    ],
    explanation: 'Define os perfis e as dores reais do seu cliente ideal para que a IA fale direto no plexo solar dele.'
  },
  {
    id: 'como-penso',
    title: 'Como Penso',
    category: 'Mentalidade',
    icon: '🧠',
    tag: 'Filosofia',
    preview: [
      'Ideias são commodities; a perspectiva e discernimento são os verdadeiros ativos.',
      'A IA é um amplificador de repertório: lixo entra, lixo sai.',
      'Se o seu conteúdo não incomoda a mediocridade, ele é invisível.'
    ],
    explanation: 'O filtro epistemológico e as premissas que regem toda a sua produção intelectual.'
  },
  {
    id: 'como-trabalho',
    title: 'Como Trabalho',
    category: 'Processo',
    icon: '🛠️',
    tag: 'Método',
    preview: [
      'Fluxo de 5 etapas: Experiência → Extração → Discernimento → Contexto → Conteúdo.',
      'Investigação socrática 1 a 1 sem formulários burocráticos prévios.',
      'Entrega do DNA Prompt pronto para plugar em qualquer LLM.'
    ],
    explanation: 'Descreve sua mecânica de trabalho para gerar autoridade imediata através do processo.'
  },
  {
    id: 'o-que-defendo',
    title: 'O Que Defendo',
    category: 'Bandeiras',
    icon: '🛡️',
    tag: 'Teses Fortes',
    preview: [
      'Criação de conteúdo fundamentada na própria vivência e cicatrizes reais.',
      'Uso da inteligência artificial como assistente de contexto, não gerador de alma.',
      'Profundidade editorial em vez de volume frenético de posts vazios.'
    ],
    explanation: 'Suas trincheiras e causas. A IA usa isso para criar ganchos de atração magnética.'
  },
  {
    id: 'o-que-questiono',
    title: 'O Que Questiono',
    category: 'Bandeiras',
    icon: '💣',
    tag: 'Antíteses',
    preview: [
      'A ilusão de que posts diários automáticos constroem autoridade sólida.',
      'Agências que terceirizam o cérebro do cliente e devolvem clichês.',
      'Listas genéricas de "100 prompts mágicos para o seu nicho".'
    ],
    explanation: 'O que te irrita no mercado. Essencial para posts de ruptura e diferenciação.'
  },
  {
    id: 'conhecimentos-domino',
    title: 'Conhecimentos que Domino',
    category: 'Expertise',
    icon: '📚',
    tag: 'Hard Skills',
    preview: [
      'Engenharia de contexto e orquestração de prompts proprietários.',
      'Estruturação de bancos de conhecimento e bases no Notion.',
      'Metodologia de entrevista investigativa e discernimento narrativo.'
    ],
    explanation: 'Mapeamento técnico para a IA citar frameworks, terminologias corretas e analogias ricas.'
  },
  {
    id: 'experiencias-historias',
    title: 'Experiências e Histórias',
    category: 'Repertório',
    icon: '🎙️',
    tag: 'Storytelling',
    preview: [
      'O caso do cliente que postava 3x ao dia e quase quebrou a operação.',
      'A reunião em que descobri a metáfora do "rótulo dentro da garrafa".',
      'O erro de tentar delegar voz autêntica para uma agência júnior.'
    ],
    explanation: 'O baú de ouro: causos, bastidores e erros que nenhuma IA do planeta saberia inventar.'
  },
  {
    id: 'temas-recorrentes',
    title: 'Temas Recorrentes (Âncoras)',
    category: 'Editorial',
    icon: '⚓',
    tag: 'Pilares',
    preview: [
      'Tema 01: A tirania do conteúdo genérico de IA.',
      'Tema 02: O poder do discernimento editorial e filtro de vivências.',
      'Tema 03: Arquitetura de Segundo Cérebro para criadores sérios.'
    ],
    explanation: 'Seus 3 a 5 temas âncora para desdobrar em dezenas de formatos sem perder a coerência.'
  },
  {
    id: 'vocabulario-jeito-falar',
    title: 'Vocabulário e Jeito de Falar',
    category: 'Voz & Tom',
    icon: '🗣️',
    tag: 'Cadência',
    preview: [
      'Expressões próprias: "rótulo dentro da garrafa", "matéria-prima bruta", "fábrica de clichês".',
      'Ritmo: frases curtas, cortes secos, ritmo reflexivo e provocativo.',
      'Palavras proibidas: "revolucionário", "sinergia", "alavanque", "no mundo dinâmico de hoje".'
    ],
    explanation: 'A fórmula secreta para a IA soar exatamente como você fala numa mesa de café.'
  },
  {
    id: 'exemplos-repertorio',
    title: 'Exemplos e Repertório Cultural',
    category: 'Repertório',
    icon: '💡',
    tag: 'Analogias',
    preview: [
      'Metáfora da garrafa de vidro e do observador externo.',
      'Analogia do cozinheiro que precisa de ingredientes frescos em vez de comida congelada.',
      'Referências a autores, livros e filmes que moldaram a sua tese.'
    ],
    explanation: 'Analogias e metáforas prontas que tornam conceitos abstratos instantaneamente visuais.'
  },
  {
    id: 'posicionamentos',
    title: 'Posicionamentos Claros',
    category: 'Estratégia',
    icon: '📍',
    tag: 'Mercado',
    preview: [
      'Não somos uma agência de social media nem gerenciamos calendários mensais.',
      'Não vendemos listas de prompts genéricos; vendemos extração de contexto humano.',
      'Nosso compromisso é com a autoridade genuína de quem já tem estrada.'
    ],
    explanation: 'A demarcação exata do seu território no mercado contra falsas soluções.'
  },
  {
    id: 'limites-editoriais',
    title: 'Limites Editoriais',
    category: 'Segurança',
    icon: '⛔',
    tag: 'No-Go Zones',
    preview: [
      'Nunca expor a identidade ou segredos industriais de clientes atendidos.',
      'Não entrar em polêmicas vazias de celebridades ou política partidária.',
      'Não prometer fórmulas mágicas de faturamento fácil.'
    ],
    explanation: 'As barreiras éticas e de privacidade para a IA nunca cruzar a linha do bom senso.'
  }
];

export const NotionMapExplorer: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string>('experiencias-historias');
  const [searchFilter, setSearchFilter] = useState<string>('');

  const filteredBlocks = NOTION_BLOCKS.filter(
    b =>
      b.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      b.category.toLowerCase().includes(searchFilter.toLowerCase()) ||
      b.tag.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const selectedBlock = NOTION_BLOCKS.find(b => b.id === selectedId) || NOTION_BLOCKS[0];

  return (
    <div
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-lg)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Top Notion-style App Header */}
      <div
        style={{
          background: 'var(--bg-tertiary)',
          borderBottom: '1px solid var(--border)',
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }} />
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }} />
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }} />
          </div>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginLeft: '8px' }}>
            📂 Notion Workspace / <strong>Mapa de Histórias & Repertório</strong>
          </span>
        </div>

        {/* Live Search input */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--bg-primary)',
            padding: '6px 12px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border)',
            minWidth: '220px'
          }}
        >
          <Search size={14} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Buscar entre os 14 pilares..."
            value={searchFilter}
            onChange={e => setSearchFilter(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: '0.82rem',
              width: '100%'
            }}
          />
        </div>
      </div>

      {/* Main Split Body: Left List + Right Viewer */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          minHeight: '440px'
        }}
      >
        {/* Left Side: Sidebar of 14 pillars */}
        <div
          style={{
            borderRight: '1px solid var(--border)',
            padding: '16px',
            background: 'rgba(0,0,0,0.1)',
            maxHeight: '480px',
            overflowY: 'auto'
          }}
        >
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            14 Módulos do Mapa ({filteredBlocks.length})
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {filteredBlocks.map(block => {
              const isSelected = block.id === selectedId;
              return (
                <button
                  key={block.id}
                  onClick={() => setSelectedId(block.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: isSelected ? '1px solid var(--accent)' : '1px solid transparent',
                    background: isSelected ? 'rgba(124, 58, 237, 0.15)' : 'transparent',
                    color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '0.86rem',
                    fontWeight: isSelected ? 700 : 500,
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>{block.icon}</span>
                    <span>{block.title}</span>
                  </div>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: isSelected ? 'rgba(124, 58, 237, 0.3)' : 'var(--bg-tertiary)',
                      color: isSelected ? 'var(--accent)' : 'var(--text-muted)'
                    }}
                  >
                    {block.tag}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Notion Page Mockup Preview */}
        <div style={{ padding: '24px', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            {/* Notion Breadcrumbs & Title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <span>Notion</span>
              <span>/</span>
              <span>Repertório Organizado</span>
              <span>/</span>
              <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{selectedBlock.category}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <span style={{ fontSize: '2rem' }}>{selectedBlock.icon}</span>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {selectedBlock.title}
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Tag: <strong style={{ color: 'var(--accent)' }}>{selectedBlock.tag}</strong> | Categoria: {selectedBlock.category}
                </span>
              </div>
            </div>

            {/* Explanation Callout */}
            <div
              style={{
                background: 'rgba(124, 58, 237, 0.08)',
                borderLeft: '4px solid var(--accent)',
                padding: '12px 16px',
                borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
                marginBottom: '20px',
                fontSize: '0.88rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.5
              }}
            >
              💡 <strong>Como a IA usa este bloco:</strong> {selectedBlock.explanation}
            </div>

            {/* Sample structured items */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={15} color="var(--success)" />
                <span>Exemplo de dados extraídos nesta seção:</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {selectedBlock.preview.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border)',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.85rem',
                      color: 'var(--text-primary)',
                      lineHeight: 1.4,
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '8px'
                    }}
                  >
                    <span style={{ color: 'var(--accent)', fontWeight: 800 }}>•</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Notion footer badge */}
          <div
            style={{
              paddingTop: '16px',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.78rem',
              color: 'var(--text-muted)',
              flexWrap: 'wrap',
              gap: '8px'
            }}
          >
            <span>✓ Estrutura 100% editável e duplicável no seu Notion</span>
            <span style={{ color: 'var(--success)', fontWeight: 600 }}>Pronto para exportar e usar com DNA Prompt</span>
          </div>
        </div>
      </div>
    </div>
  );
};
