import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Zap,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Check,
  Mic,
  Brain,
  FolderKanban,
  Dna,
  Clock,
  Lock,
  Landmark,
  Wrench,
  Eye,
  Lightbulb,
  Radio
} from 'lucide-react';
import { BookingModal } from './BookingModal';

export const LandingPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const openBooking = () => {
    setIsModalOpen(true);
  };

  const faqItems = [
    {
      q: 'Preciso dominar ferramentas de inteligência artificial antes da sessão?',
      a: 'Não. O foco principal é a investigação do seu conhecimento humano. O DNA Prompt é entregue pronto com orientações práticas para você apenas copiar, colar no ChatGPT/Claude e começar a usar.'
    },
    {
      q: 'Vou receber conteúdos prontos para publicação?',
      a: 'Não. Você recebe a matéria-prima filtrada, o mapa no Notion e o arquivo mestre de contexto. Isso permite que você gere dezenas de postagens autorais sempre que quiser com total autonomia.'
    },
    {
      q: 'Isso é o mesmo que uma consultoria de branding/marca pessoal?',
      a: 'Não. O mapeamento responde "o que existe dentro da sua vivência que pode ser comunicado". A marca pessoal responde "como moldar a percepção pública". O Fala Que Eu Te Escuto entrega a base indispensável de conteúdo.'
    },
    {
      q: 'Como funciona o agendamento após o pagamento?',
      a: 'Confirmada a compra, você recebe o formulário inicial de preparação e o link da agenda para escolher o melhor dia e horário para o nosso encontro de 1h30.'
    },
    {
      q: 'Qual o prazo para receber meu material?',
      a: 'Após a nossa chamada individual, o Notion estruturado e o seu DNA Prompt serão entregues em até 7 dias corridos.'
    }
  ];

  const sixAxes = [
    {
      axis: 'Sua História',
      icon: <Landmark size={20} color="var(--accent)" />,
      desc: 'A origem real da sua autoridade e os marcos que sustentam o que você vende.'
    },
    {
      axis: 'Seus Bastidores',
      icon: <Wrench size={20} color="var(--accent)" />,
      desc: 'Aprendizados caros, erros práticos, rotinas de trabalho e desafios reais.'
    },
    {
      axis: 'Sua Visão',
      icon: <Eye size={20} color="var(--accent)" />,
      desc: 'O que você defende, o que não tolera no mercado e onde discorda da maioria.'
    },
    {
      axis: 'Seu Conhecimento',
      icon: <Brain size={20} color="var(--accent)" />,
      desc: 'Como resolve problemas técnicos e os exemplos que usa para explicar seu método.'
    },
    {
      axis: 'Seu Repertório Vivo',
      icon: <Lightbulb size={20} color="var(--accent)" />,
      desc: 'Situações cotidianas que funcionam como metáforas para reter a atenção do público.'
    },
    {
      axis: 'Sua Voz',
      icon: <Radio size={20} color="var(--accent)" />,
      desc: 'O ritmo do seu raciocínio, suas expressões habituais e a cadência do seu pensamento.'
    }
  ];

  return (
    <div style={{ paddingBottom: '20px', color: 'var(--text-primary)' }}>
      {/* 🚀 1. HERO SECTION */}
      <section
        style={{
          padding: '60px 20px 48px 20px',
          maxWidth: '960px',
          margin: '0 auto',
          textAlign: 'center'
        }}
      >
        {/* Glow Tag */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(124, 58, 237, 0.12)',
            border: '1px solid rgba(124, 58, 237, 0.3)',
            color: 'var(--accent)',
            fontSize: '0.84rem',
            fontWeight: 700,
            marginBottom: '24px'
          }}
        >
          <Sparkles size={15} />
          <span>Sessão Individual • Vagas Limitadas</span>
        </div>

        {/* Primary Headline */}
        <h1
          style={{
            fontSize: 'clamp(2.2rem, 5.5vw, 4rem)',
            fontWeight: 900,
            lineHeight: 1.1,
            letterSpacing: '-0.04em',
            marginBottom: '18px',
            textTransform: 'uppercase'
          }}
        >
          NUNCA MAIS ABRA O CHATGPT <br />
          <span
            style={{
              background: 'linear-gradient(135deg, #a855f7 0%, #38bdf8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            SEM SABER O QUE DIZER.
          </span>
        </h1>

        {/* Subheadline */}
        <h2
          style={{
            fontSize: 'clamp(1.2rem, 2.6vw, 1.65rem)',
            fontWeight: 500,
            color: 'var(--text-secondary)',
            maxWidth: '750px',
            margin: '0 auto 36px auto',
            lineHeight: 1.4
          }}
        >
          O seu conteúdo não precisa de mais ideias. <br />
          Precisa de mais <strong style={{ color: 'var(--text-primary)', borderBottom: '2px solid var(--accent)' }}>você</strong>.
        </h2>

        {/* Hero CTA Button */}
        <div>
          <button
            onClick={openBooking}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '18px 38px',
              borderRadius: 'var(--radius-full)',
              background: 'linear-gradient(135deg, #a855f7 0%, #3b82f6 100%)',
              color: '#ffffff',
              fontSize: '1.08rem',
              fontWeight: 800,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 8px 25px var(--accent-glow)',
              transition: 'transform 160ms ease-out'
            }}
          >
            <span>QUERO MAPEAR MEU REPERTÓRIO</span>
            <ArrowRight size={19} />
          </button>
        </div>
      </section>

      {/* ⚠️ 2. O CICLO VICIOSO DO CONTEÚDO GENÉRICO */}
      <section
        style={{
          padding: '40px 20px',
          maxWidth: '860px',
          margin: '0 auto'
        }}
      >
        <div
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '32px 28px'
          }}
        >
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, marginBottom: '14px', color: 'var(--text-primary)' }}>
            O ciclo vicioso do conteúdo genérico
          </h2>
          <p style={{ fontSize: '0.96rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Você já passou por isso:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
            {[
              'Passou horas olhando o feed de concorrentes para ver o que postar;',
              'Salvou dezenas de referências que nunca usou;',
              'Tentou acompanhar trends que não combinam com a sua postura;',
              'Pediu ideias para o ChatGPT e recebeu respostas óbvias;',
              'Sentou na frente do computador e simplesmente travou.'
            ].map((item, idx) => (
              <div
                key={idx}
                style={{
                  background: 'var(--bg-primary)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontSize: '0.92rem',
                  color: 'var(--text-primary)'
                }}
              >
                <XCircle size={17} color="var(--danger)" style={{ flexShrink: 0 }} />
                <span>{item}</span>
              </div>
            ))}
          </div>

          <p style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.5, marginBottom: '18px' }}>
            Quanto mais você busca referências externas, mais você se desprende de quem é.
          </p>

          <div
            style={{
              background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.1) 0%, rgba(59, 130, 246, 0.06) 100%)',
              border: '1px solid var(--accent)',
              borderRadius: 'var(--radius-md)',
              padding: '20px',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '1.18rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
              Você não está sem assunto.
            </div>
            <div style={{ fontSize: '0.96rem', color: 'var(--text-secondary)' }}>
              Você só está sem um método para <strong style={{ color: 'var(--accent)' }}>encontrar, organizar e transformar</strong> sua vivência em contexto de comunicação.
            </div>
          </div>
        </div>
      </section>

      {/* ❓ 3. “MAS EU NÃO ACHO QUE TENHO HISTÓRIAS INTERESSANTES…” */}
      <section
        style={{
          padding: '40px 20px',
          maxWidth: '860px',
          margin: '0 auto'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, margin: '0 0 6px 0' }}>
            “Mas eu não acho que tenho histórias interessantes…”
          </h2>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--accent)' }}>
            Tem certeza?
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px', marginBottom: '20px' }}>
          {[
            'E aquela decisão difícil que mudou a rota de um projeto?',
            'E aquele erro crasso no início de carreira que hoje você ensina a evitar?',
            'E o caso daquele cliente que te fez enxergar o mercado de outra forma?',
            'E aquela técnica que você executa no piloto automático porque já virou óbvia, mas seus clientes pagariam para entender?'
          ].map((desc, i) => (
            <div
              key={i}
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px'
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'rgba(124, 58, 237, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Lightbulb size={17} color="var(--accent)" />
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4, paddingTop: '4px' }}>
                {desc}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '18px',
            textAlign: 'center',
            fontSize: '1rem',
            fontWeight: 700,
            color: 'var(--text-primary)'
          }}
        >
          O que parece banal para você só parece banal porque <strong>você viveu aquilo</strong>. <br />
          Para quem está do outro lado, <span style={{ color: 'var(--success)' }}>isso é autoridade pura.</span>
        </div>
      </section>

      {/* 🧭 4. OS 6 EIXOS QUE INVESTIGAMOS NA NOSSA CONVERSA */}
      <section
        style={{
          padding: '40px 20px',
          maxWidth: '920px',
          margin: '0 auto'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', marginBottom: '6px' }}>
            Roteiro Proprietário
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '6px' }}>
            Os 6 eixos que investigamos na nossa conversa
          </h2>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', margin: 0 }}>
            Durante 1h30 individual ao vivo, extraímos a matéria-prima da sua autoridade:
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))',
            gap: '14px'
          }}
        >
          {sixAxes.map((axis, i) => (
            <div
              key={i}
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '20px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '14px'
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'rgba(124, 58, 237, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                {axis.icon}
              </div>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
                  {axis.axis}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
                  {axis.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ⏳ 5. COMO FUNCIONA (6 ETAPAS OBJETIVAS) */}
      <section
        style={{
          padding: '40px 20px',
          maxWidth: '860px',
          margin: '0 auto'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 900, marginBottom: '6px' }}>
            Como funciona o Fala Que Eu Te Escuto
          </h2>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', margin: 0 }}>
            Processo prático de extração e curadoria em 6 etapas:
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '10px', marginBottom: '16px' }}>
          {[
            { n: '01', t: 'Preparação', d: 'Formulário prévio para reativar marcos da memória.' },
            { n: '02', t: 'A Sessão (1h30)', d: 'Encontro individual ao vivo comigo com roteiro de provocação.' },
            { n: '03', t: 'Extração', d: 'Processamento de relatos brutos em dados estruturados.' },
            { n: '04', t: 'Discernimento', d: 'Curadoria rigorosa: separação de informação comum de repertório com autoridade.' },
            { n: '05', t: 'Estruturação Notion', d: 'Organização em temas âncora, histórias centrais e desdobramentos.' },
            { n: '06', t: 'DNA Prompt', d: 'Arquivo mestre de contexto pronto para ChatGPT, Claude ou Gemini.' }
          ].map((s, i) => (
            <div
              key={i}
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                padding: '14px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px'
              }}
            >
              <span style={{ fontWeight: 900, color: 'var(--accent)', fontSize: '0.9rem' }}>{s.n}.</span>
              <div>
                <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{s.t}: </strong>
                <span style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>{s.d}</span>
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            fontSize: '0.86rem',
            color: 'var(--success)',
            fontWeight: 700
          }}
        >
          <Clock size={16} />
          <span>Prazo de entrega do material: até 7 dias corridos após a sessão.</span>
        </div>
      </section>

      {/* 🎯 6. PARA QUEM É vs NÃO É */}
      <section
        style={{
          padding: '40px 20px',
          maxWidth: '860px',
          margin: '0 auto'
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px'
          }}
        >
          {/* É para você se */}
          <div style={{ background: 'rgba(16, 185, 129, 0.04)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: 'var(--radius-md)', padding: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', fontWeight: 800, color: 'var(--success)', marginBottom: '12px' }}>
              <CheckCircle2 size={18} />
              <span>É para você se:</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <Check size={16} color="var(--success)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>Tem domínio técnico e bagagem, mas não sabe como transformar isso em posts consistentes;</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <Check size={16} color="var(--success)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>Já usa IA para ganhar tempo, mas recusa publicar textos plastificados e genéricos;</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <Check size={16} color="var(--success)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>Quer parar de depender de trends vazias e construir autoridade pela sua competência;</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <Check size={16} color="var(--success)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>Quer autonomia para produzir carrosséis, roteiros e artigos sem travar diante da tela.</span>
              </div>
            </div>
          </div>

          {/* Não é para você se */}
          <div style={{ background: 'rgba(239, 68, 68, 0.04)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: 'var(--radius-md)', padding: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', fontWeight: 800, color: 'var(--danger)', marginBottom: '12px' }}>
              <XCircle size={18} />
              <span>Não é para você se:</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <XCircle size={16} color="var(--danger)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>Procura um pacote de posts prontos para copiar e colar sem envolvimento;</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <XCircle size={16} color="var(--danger)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>Busca uma consultoria completa de marca pessoal e identidade visual (o mapeamento extrai a matéria-prima);</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <XCircle size={16} color="var(--danger)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>Não está disposto a sentar por 1h30 para analisar a própria trajetória com profundidade.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 📦 7. O QUE VOCÊ RECEBE */}
      <section
        style={{
          padding: '40px 20px',
          maxWidth: '860px',
          margin: '0 auto'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '22px' }}>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 900, marginBottom: '6px' }}>
            O que você recebe
          </h2>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '14px'
          }}
        >
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '20px', textAlign: 'center' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(124, 58, 237, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px auto' }}>
              <Mic size={22} color="var(--accent)" />
            </div>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: '4px' }}>Sessão Individual (1h30)</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Ao vivo com roteiro proprietário de extração.</div>
          </div>

          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '20px', textAlign: 'center' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(124, 58, 237, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px auto' }}>
              <FolderKanban size={22} color="var(--accent)" />
            </div>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: '4px' }}>Mapa no Notion</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Base organizada com histórias e temas âncora.</div>
          </div>

          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '20px', textAlign: 'center' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(124, 58, 237, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px auto' }}>
              <Dna size={22} color="var(--accent)" />
            </div>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: '4px' }}>DNA Prompt</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Contexto pronto para rodar em qualquer IA.</div>
          </div>

          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '20px', textAlign: 'center' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(124, 58, 237, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px auto' }}>
              <Zap size={22} color="var(--accent)" />
            </div>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: '4px' }}>Bônus: Ganchos</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Modelos de abertura de alta retenção.</div>
          </div>
        </div>
      </section>

      {/* 💰 8. INVESTIMENTO & CHECKOUT CARD */}
      <section
        id="pricing"
        style={{
          padding: '40px 20px 50px 20px',
          maxWidth: '600px',
          margin: '0 auto'
        }}
      >
        <div
          style={{
            background: 'linear-gradient(180deg, rgba(124, 58, 237, 0.12) 0%, var(--bg-secondary) 100%)',
            border: '2px solid var(--accent)',
            borderRadius: 'var(--radius-lg)',
            padding: '36px 26px',
            textAlign: 'center',
            boxShadow: '0 12px 35px var(--accent-glow)'
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 14px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(245, 158, 11, 0.14)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              color: '#f59e0b',
              fontSize: '0.74rem',
              fontWeight: 800,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              marginBottom: '14px'
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f59e0b' }} />
            <span>Vagas Limitadas por Semana</span>
          </div>

          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '4px' }}>
            Fala Que Eu Te Escuto
          </div>
          <div style={{ fontSize: '0.9rem', color: 'var(--accent)', fontWeight: 700, marginBottom: '20px' }}>
            Extração de Repertório & Contexto de IA
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              textAlign: 'left',
              maxWidth: '420px',
              margin: '0 auto 24px auto',
              background: 'var(--bg-primary)',
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              fontSize: '0.88rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Check size={16} color="var(--success)" /> <span>Sessão individual de 1h30 comigo</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Check size={16} color="var(--success)" /> <span>Mapa completo de narrativas no Notion</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Check size={16} color="var(--success)" /> <span>DNA Prompt personalizado</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Check size={16} color="var(--success)" /> <span>Curadoria e discernimento estratégico</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Check size={16} color="var(--success)" /> <span>Bônus: Lista estratégica de ganchos</span>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '2.6rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>
              R$ 297,00
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              à vista ou em até 12x no cartão
            </div>
          </div>

          <button
            onClick={openBooking}
            style={{
              width: '100%',
              maxWidth: '420px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              padding: '16px 24px',
              borderRadius: 'var(--radius-full)',
              background: 'linear-gradient(135deg, #a855f7 0%, #3b82f6 100%)',
              color: '#fff',
              fontSize: '1.05rem',
              fontWeight: 900,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 6px 20px var(--accent-glow)',
              transition: 'transform 160ms ease-out'
            }}
          >
            <span>QUERO MAPEAR MEU REPERTÓRIO AGORA</span>
            <ArrowRight size={18} />
          </button>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              fontSize: '0.78rem',
              color: 'var(--text-muted)',
              marginTop: '14px'
            }}
          >
            <Lock size={13} color="var(--text-muted)" />
            <span>Vagas limitadas conforme disponibilidade de agenda individual.</span>
          </div>
        </div>
      </section>

      {/* ❓ 9. PERGUNTAS FREQUENTES */}
      <section
        style={{
          padding: '40px 20px',
          maxWidth: '820px',
          margin: '0 auto'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 900, marginBottom: '6px' }}>
            Perguntas Frequentes
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {faqItems.map((faq, index) => {
            const isExpanded = expandedFaq === index;
            return (
              <div
                key={index}
                style={{
                  background: 'var(--bg-secondary)',
                  border: isExpanded ? '1px solid var(--accent)' : '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  overflow: 'hidden'
                }}
              >
                <button
                  onClick={() => setExpandedFaq(isExpanded ? null : index)}
                  style={{
                    width: '100%',
                    padding: '14px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '10px',
                    background: 'transparent',
                    border: 'none',
                    textAlign: 'left',
                    color: 'var(--text-primary)',
                    fontWeight: 700,
                    fontSize: '0.92rem',
                    cursor: 'pointer'
                  }}
                >
                  <span>{faq.q}</span>
                  {isExpanded ? <ChevronUp size={16} color="var(--accent)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
                </button>

                {isExpanded && (
                  <div
                    style={{
                      padding: '0 18px 16px 18px',
                      fontSize: '0.88rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.5,
                      borderTop: '1px solid var(--border)',
                      paddingTop: '12px'
                    }}
                  >
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Dynamic Booking Modal */}
      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
