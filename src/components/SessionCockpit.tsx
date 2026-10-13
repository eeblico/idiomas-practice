import React, { useState } from 'react';
import {
  Mic,
  Brain,
  Sparkles,
  HelpCircle,
  Play,
  Save,
  ArrowRight,
  ListPlus,
  Trash2,
  Check
} from 'lucide-react';
import { useBrandTherapy, ContextPillars } from '../context/BrandTherapyContext';

export const SessionCockpit: React.FC = () => {
  const { session, updateSession, updatePillar, setActiveTab } = useBrandTherapy();

  const [activeStep, setActiveStep] = useState<number>(0);
  const [copiedScriptIndex, setCopiedScriptIndex] = useState<number | null>(null);

  const steps = [
    { title: '1. Histórias & Viradas', time: '0m - 30m', icon: '📖' },
    { title: '2. Crenças & Antíteses', time: '30m - 60m', icon: '⚡' },
    { title: '3. Vocabulário & Tom', time: '60m - 90m', icon: '🗣️' },
    { title: '4. Posicionamento', time: '90m - 120m', icon: '🎯' }
  ];

  const questionsByStep = [
    [
      'Qual foi o momento exato em que você percebeu que as soluções padrão do mercado não funcionavam para o seu caso?',
      'Me conta a história da sua maior frustração profissional e o que você aprendeu com ela.',
      'Qual é o causo ou exemplo prático que você viveu recentemente e que poucas pessoas no seu nicho conhecem?'
    ],
    [
      'Se você pudesse proibir uma prática comum do seu mercado hoje, qual seria?',
      'Qual é a opinião que você defende que a maioria dos seus concorrentes discorda?',
      'Por que a maioria das pessoas tenta resolver esse problema do jeito errado?'
    ],
    [
      'Quais são as palavras, expressões ou metáforas que você usa no seu dia a dia quando está conversando informalmente?',
      'Como você descreveria o seu tom de voz ideal? (ex: Provocativo, acolhedor, irônico, cirúrgico, didático)',
      'O que você odeia quando lê textos com cara de robô / IA genérica?'
    ],
    [
      'Qual é o resultado prático e tangível que o seu produto/serviço gera para quem contrata você?',
      'Qual é a sua tese principal de mercado resumida em uma única frase impactante?',
      'Como nós vamos transformar essa conversa no seu Segundo Cérebro no Notion?'
    ]
  ];

  const copyQuestion = (q: string, idx: number) => {
    navigator.clipboard.writeText(q);
    setCopiedScriptIndex(idx);
    setTimeout(() => setCopiedScriptIndex(null), 2000);
  };

  const handleProcessTranscript = () => {
    // Process transcript raw text into organized pillars
    const lines = session.rawTranscript
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 5);

    const newStories = lines.filter(l => l.toLowerCase().includes('história') || l.toLowerCase().includes('anos') || l.toLowerCase().includes('virada') || l.toLowerCase().includes('passou') || l.toLowerCase().includes('quando'));
    const newBeliefs = lines.filter(l => l.toLowerCase().includes('creio') || l.toLowerCase().includes('acredito') || l.toLowerCase().includes('que') || l.toLowerCase().includes('não serve') || l.toLowerCase().includes('concordo'));
    const newAntitheses = lines.filter(l => l.toLowerCase().includes('odeio') || l.toLowerCase().includes('errado') || l.toLowerCase().includes('contra') || l.toLowerCase().includes('agência'));

    if (newStories.length > 0) updatePillar('stories', Array.from(new Set([...session.pillars.stories, ...newStories])));
    if (newBeliefs.length > 0) updatePillar('beliefs', Array.from(new Set([...session.pillars.beliefs, ...newBeliefs])));
    if (newAntitheses.length > 0) updatePillar('antitheses', Array.from(new Set([...session.pillars.antitheses, ...newAntitheses])));

    alert('✨ Transcrição processada e distribuída nos 5 Pilares do Cérebro Digital!');
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px 20px 80px 20px' }}>
      {/* Title Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
        <div>
          <div className="hero-glow-badge" style={{ marginBottom: '8px' }}>
            <Mic size={14} />
            <span>Cockpit do Consultor (Reunião de 2 Horas)</span>
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>
            Guiar Sessão de Extração & Transcrição
          </h1>
        </div>

        <button
          onClick={() => setActiveTab('exporter')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            borderRadius: 'var(--radius-full)',
            background: 'linear-gradient(135deg, #a855f7 0%, #3b82f6 100%)',
            color: '#ffffff',
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer'
          }}
        >
          <Brain size={18} />
          <span>Ver Cérebro Digital Gerado</span>
          <ArrowRight size={16} />
        </button>
      </div>

      {/* Client Meta Form */}
      <div className="brand-card-glow" style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>
          📋 Dados do Cliente & Sessão
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Nome do Cliente:</label>
            <input
              type="text"
              value={session.clientName}
              onChange={e => updateSession({ clientName: e.target.value })}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
                marginTop: '6px'
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Nicho / Área da Consultoria:</label>
            <input
              type="text"
              value={session.clientNiche}
              onChange={e => updateSession({ clientNiche: e.target.value })}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
                marginTop: '6px'
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Data da Reunião:</label>
            <input
              type="date"
              value={session.sessionDate}
              onChange={e => updateSession({ sessionDate: e.target.value })}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
                marginTop: '6px'
              }}
            />
          </div>
        </div>
      </div>

      {/* Main 2-Grid: Questions Script & Transcript Area */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>

        {/* Column 1: Live Provocation Questions */}
        <div>
          <div className="brand-card-glow" style={{ height: '100%' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <HelpCircle size={18} style={{ color: 'var(--accent)' }} />
              <span>Roteiro de Provocações ao Vivo</span>
            </h3>

            {/* Step Tabs */}
            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', marginBottom: '20px', paddingBottom: '4px' }}>
              {steps.map((st, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveStep(idx)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    background: activeStep === idx ? 'var(--accent)' : 'var(--bg-primary)',
                    color: activeStep === idx ? '#ffffff' : 'var(--text-secondary)',
                    fontWeight: activeStep === idx ? 600 : 500,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {st.icon} {st.title}
                </button>
              ))}
            </div>

            {/* Questions List for Active Step */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {questionsByStep[activeStep].map((q, qIdx) => (
                <div
                  key={qIdx}
                  style={{
                    padding: '14px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border)',
                    position: 'relative'
                  }}
                >
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '10px', lineHeight: 1.5 }}>
                    "{q}"
                  </p>
                  <button
                    onClick={() => copyQuestion(q, qIdx)}
                    style={{
                      fontSize: '0.78rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-full)',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer'
                    }}
                  >
                    {copiedScriptIndex === qIdx ? <Check size={12} style={{ color: '#22c55e' }} /> : null}
                    <span>{copiedScriptIndex === qIdx ? 'Copiada!' : 'Copiar Pergunta'}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Column 2: Raw Transcript & Notes Entry */}
        <div>
          <div className="brand-card-glow" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} style={{ color: '#22c55e' }} />
              <span>Transcrição Bruta & Notas da Reunião</span>
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Cole aqui a transcrição de áudio do Zoom/Meet ou suas anotações em tópicos tiradas durante as 2 horas de bate-papo.
            </p>

            <textarea
              value={session.rawTranscript}
              onChange={e => updateSession({ rawTranscript: e.target.value })}
              rows={12}
              placeholder="Cole o texto bruto da reunião aqui..."
              style={{
                width: '100%',
                flexGrow: 1,
                padding: '14px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
                fontFamily: 'monospace',
                fontSize: '0.88rem',
                lineHeight: 1.6,
                resize: 'vertical',
                marginBottom: '16px'
              }}
            />

            <button
              onClick={handleProcessTranscript}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-primary)',
                border: '1px solid var(--accent)',
                color: 'var(--accent)',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <Sparkles size={18} />
              <span>Distribuir Automático nos 5 Pilares</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
