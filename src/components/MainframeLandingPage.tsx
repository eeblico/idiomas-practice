import React, { useState, useEffect, useRef, useMemo } from 'react';
import { BookingModal } from './BookingModal';

// Custom useTypewriter hook according to spec
function useTypewriter(text: string, speed = 38, startDelay = 600) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed('');
    setDone(false);

    const startTimer = setTimeout(() => {
      let i = 0;
      const interval = setInterval(() => {
        if (i < text.length) {
          setDisplayed(text.slice(0, i + 1));
          i++;
        } else {
          setDone(true);
          clearInterval(interval);
        }
      }, speed);

      return () => clearInterval(interval);
    }, startDelay);

    return () => clearTimeout(startTimer);
  }, [text, speed, startDelay]);

  return { displayed, done };
}

export const MainframeLandingPage: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [pillsVisible, setPillsVisible] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [activeModalSection, setActiveModalSection] = useState<'axes' | 'method' | 'faq' | 'dna' | null>(null);
  const [copied, setCopied] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const isSeekingRef = useRef<boolean>(false);
  const targetTimeRef = useRef<number>(0);
  const prevXRef = useRef<number | null>(null);
  const SENSITIVITY = 0.8;

  // Typewriter text adapted to Fala Que Eu Te Escuto
  const heroPromptText = "O seu conteúdo não precisa de mais ideias. Precisa de mais você. Pare de pedir para a IA inventar o que você já viveu.";
  const { displayed, done } = useTypewriter(heroPromptText, 36, 600);

  // Fade-in pills after 400ms independently
  useEffect(() => {
    const timer = setTimeout(() => {
      setPillsVisible(true);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  // Mouse-scrub video control according to spec
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!videoRef.current || !videoRef.current.duration) return;

      if (prevXRef.current === null) {
        prevXRef.current = e.clientX;
        return;
      }

      const delta = e.clientX - prevXRef.current;
      prevXRef.current = e.clientX;

      const duration = videoRef.current.duration;
      const timeOffset = (delta / window.innerWidth) * SENSITIVITY * duration;

      const current = targetTimeRef.current || videoRef.current.currentTime;
      const nextTime = Math.max(0, Math.min(duration, current + timeOffset));
      targetTimeRef.current = nextTime;

      if (!isSeekingRef.current) {
        isSeekingRef.current = true;
        videoRef.current.currentTime = nextTime;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleSeeked = () => {
    if (!videoRef.current) return;
    if (Math.abs(videoRef.current.currentTime - targetTimeRef.current) > 0.04) {
      videoRef.current.currentTime = targetTimeRef.current;
    } else {
      isSeekingRef.current = false;
    }
  };

  const copyEmail = () => {
    navigator.clipboard.writeText('contato@falaqueeuteescuto.com');
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const navLinks = [
    { label: 'O Método', action: () => setActiveModalSection('method') },
    { label: 'Os 6 Eixos', action: () => setActiveModalSection('axes') },
    { label: 'DNA Prompt', action: () => setActiveModalSection('dna') },
    { label: 'FAQ', action: () => setActiveModalSection('faq') }
  ];

  return (
    <div
      style={{
        fontFamily: 'var(--font-body)',
        minHeight: '100vh',
        width: '100%',
        position: 'relative',
        overflowX: 'hidden'
      }}
    >
      {/* 🎬 1. BACKGROUND VIDEO (MOUSE-SCRUB CONTROLLED) */}
      <video
        ref={videoRef}
        onSeeked={handleSeeked}
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260530_042513_df96a13b-6155-4f6e-8b93-c9dee66fba08.mp4"
        muted
        playsInline
        preload="auto"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          width: '100vw',
          height: '100vh',
          objectFit: 'cover',
          objectPosition: '70% center',
          pointerEvents: 'none'
        }}
      />

      {/* 🧭 2. NAVBAR (FIXED, Z-INDEX: 10) */}
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 24px',
          boxSizing: 'border-box'
        }}
        className="px-5 sm:px-8 py-4 sm:py-5"
      >
        {/* Logo (left) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer'
          }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <span
            style={{
              fontFamily: 'var(--font-heading)',
              color: '#000000',
              fontWeight: 600,
              letterSpacing: '-0.02em',
              lineHeight: 1
            }}
            className="text-[21px] sm:text-[26px] tracking-tight"
          >
            Fala Que Eu Te Escuto®
          </span>
          <span
            style={{
              color: '#000000',
              userSelect: 'none',
              letterSpacing: '-0.02em',
              lineHeight: 1
            }}
            className="text-[25px] sm:text-[30px]"
          >
            ✳︎
          </span>
        </div>

        {/* Desktop Nav Links (center, hidden below md) */}
        <div
          style={{
            alignItems: 'center',
            color: '#000000',
            fontWeight: 400
          }}
          className="hidden md:flex text-[23px] gap-1"
        >
          {navLinks.map((link, idx) => (
            <React.Fragment key={link.label}>
              <span
                onClick={link.action}
                style={{ cursor: 'pointer', transition: 'opacity 0.2s ease' }}
                className="hover:opacity-60 transition-opacity"
              >
                {link.label}
              </span>
              {idx < navLinks.length - 1 && <span style={{ marginRight: '6px' }}>,</span>}
            </React.Fragment>
          ))}
        </div>

        {/* Desktop CTA (right, hidden below md) */}
        <div className="hidden md:flex items-center">
          <a
            onClick={() => setIsBookingOpen(true)}
            style={{
              color: '#000000',
              cursor: 'pointer',
              textDecoration: 'underline',
              textUnderlineOffset: '4px',
              transition: 'opacity 0.2s ease'
            }}
            className="text-[23px] hover:opacity-60 transition-opacity"
          >
            Garantir Vaga — R$ 297
          </a>
        </div>

        {/* Mobile Hamburger (visible below md) */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '5px',
            zIndex: 20
          }}
          className="flex md:hidden"
          aria-label="Abrir Menu"
        >
          <span
            style={{
              width: '24px',
              height: '2px',
              backgroundColor: '#000000',
              transition: 'all 0.3s ease',
              transform: menuOpen ? 'rotate(45deg) translateY(7px)' : 'none'
            }}
          />
          <span
            style={{
              width: '24px',
              height: '2px',
              backgroundColor: '#000000',
              transition: 'all 0.3s ease',
              opacity: menuOpen ? 0 : 1
            }}
          />
          <span
            style={{
              width: '24px',
              height: '2px',
              backgroundColor: '#000000',
              transition: 'all 0.3s ease',
              transform: menuOpen ? 'rotate(-45deg) translateY(-7px)' : 'none'
            }}
          />
        </button>
      </nav>

      {/* 📱 Mobile Overlay (z-index: 9) */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9,
          backgroundColor: 'rgba(255, 255, 255, 0.96)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '0 32px',
          gap: '24px',
          transition: 'opacity 0.3s ease, transform 0.3s ease',
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? 'auto' : 'none',
          transform: menuOpen ? 'translateY(0)' : 'translateY(-10px)'
        }}
        className="md:hidden"
      >
        {navLinks.map(link => (
          <span
            key={link.label}
            onClick={() => {
              link.action();
              setMenuOpen(false);
            }}
            style={{
              fontSize: '32px',
              fontWeight: 500,
              color: '#000000',
              cursor: 'pointer'
            }}
          >
            {link.label}
          </span>
        ))}
        <span
          onClick={() => {
            setIsBookingOpen(true);
            setMenuOpen(false);
          }}
          style={{
            fontSize: '32px',
            fontWeight: 500,
            color: '#000000',
            textDecoration: 'underline',
            textUnderlineOffset: '6px',
            cursor: 'pointer',
            marginTop: '8px'
          }}
        >
          Garantir Vaga — R$ 297
        </span>
      </div>

      {/* ⚡ 3. HERO SECTION (Z-INDEX: 1) */}
      <main
        style={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          zIndex: 1,
          overflow: 'hidden'
        }}
        className="px-5 sm:px-8 md:px-10 justify-end pb-12 md:justify-center md:pb-0"
      >
        <div className="max-w-xl relative z-10">
          {/* 1. Blurred Intro Label */}
          <div
            style={{
              pointerEvents: 'none',
              userSelect: 'none',
              color: '#000000',
              filter: 'blur(4px)',
              lineHeight: 1.3,
              fontWeight: 400
            }}
            className="mb-5 sm:mb-6 text-[18px] sm:text-[22px] md:text-[26px]"
          >
            Sua história, seus bastidores e sua voz,
            <br />
            Fala Que Eu Te Escuto — Contexto Real para Inteligência Artificial
          </div>

          {/* 2. Typewriter Text */}
          <p
            style={{
              color: '#000000',
              lineHeight: 1.35,
              fontWeight: 400,
              minHeight: '54px'
            }}
            className="mb-5 sm:mb-6 text-[18px] sm:text-[22px] md:text-[26px]"
          >
            {displayed}
            {!done && (
              <span
                style={{
                  display: 'inline-block',
                  width: '2px',
                  height: '1.1em',
                  backgroundColor: '#000000',
                  verticalAlign: 'middle',
                  marginLeft: '2px',
                  animation: 'blink 1s step-end infinite'
                }}
              />
            )}
          </p>

          {/* 3. Action Pill Buttons */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              rowGap: '4px',
              opacity: pillsVisible ? 1 : 0,
              transform: pillsVisible ? 'translateY(0)' : 'translateY(8px)',
              transition: 'opacity 0.4s ease, transform 0.4s ease'
            }}
          >
            {/* White Pill 1: Primary CTA */}
            <button
              onClick={() => setIsBookingOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#ffffff',
                color: '#000000',
                border: '1px solid rgba(0,0,0,0.1)',
                borderRadius: '9999px',
                padding: '0.3em 1.2em',
                margin: '0 0.2em 0.4em 0.2em',
                whiteSpace: 'nowrap',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'background-color 0.2s ease, color 0.2s ease'
              }}
              className="text-[13px] sm:text-[15px] hover:bg-black hover:text-white"
            >
              Quero Mapear Meu Repertório — R$ 297
            </button>

            {/* White Pill 2: Os 6 Eixos */}
            <button
              onClick={() => setActiveModalSection('axes')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#ffffff',
                color: '#000000',
                border: '1px solid rgba(0,0,0,0.1)',
                borderRadius: '9999px',
                padding: '0.3em 1.2em',
                margin: '0 0.2em 0.4em 0.2em',
                whiteSpace: 'nowrap',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'background-color 0.2s ease, color 0.2s ease'
              }}
              className="text-[13px] sm:text-[15px] hover:bg-black hover:text-white"
            >
              Os 6 Eixos de Investigação
            </button>

            {/* White Pill 3: Como Funciona */}
            <button
              onClick={() => setActiveModalSection('method')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#ffffff',
                color: '#000000',
                border: '1px solid rgba(0,0,0,0.1)',
                borderRadius: '9999px',
                padding: '0.3em 1.2em',
                margin: '0 0.2em 0.4em 0.2em',
                whiteSpace: 'nowrap',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'background-color 0.2s ease, color 0.2s ease'
              }}
              className="text-[13px] sm:text-[15px] hover:bg-black hover:text-white"
            >
              Como Funciona (1h30 ao vivo)
            </button>

            {/* White Pill 4: DNA Prompt */}
            <button
              onClick={() => setActiveModalSection('dna')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#ffffff',
                color: '#000000',
                border: '1px solid rgba(0,0,0,0.1)',
                borderRadius: '9999px',
                padding: '0.3em 1.2em',
                margin: '0 0.2em 0.4em 0.2em',
                whiteSpace: 'nowrap',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'background-color 0.2s ease, color 0.2s ease'
              }}
              className="text-[13px] sm:text-[15px] hover:bg-black hover:text-white"
            >
              O Ativo Mestre (DNA Prompt)
            </button>

            {/* Outline Pill: Copy Email Button */}
            <button
              onClick={copyEmail}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'transparent',
                color: '#ffffff',
                border: '1px solid #ffffff',
                borderRadius: '9999px',
                padding: '0.3em 1.2em',
                margin: '0 0.2em 0.4em 0.2em',
                whiteSpace: 'nowrap',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'background-color 0.2s ease, color 0.2s ease'
              }}
              className="text-[13px] sm:text-[15px] gap-2 sm:gap-3 hover:bg-white hover:text-black"
            >
              <span>
                Fale conosco: <span style={{ textDecoration: 'underline', textUnderlineOffset: '2px' }}>contato@falaqueeuteescuto.com</span>
              </span>
              {/* Copy Icon (12x12 inline SVG overlapping rectangles) */}
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="1" y="3" width="7" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
                <path d="M4 3V2C4 1.44772 4.44772 1 5 1H10C10.5523 1 11 1.44772 11 2V7C11 7.55228 10.5523 8 10 8H9" stroke="currentColor" strokeWidth="1.2" />
              </svg>
              {copied && <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#4ade80' }}>✓ Copiado!</span>}
            </button>
          </div>
        </div>
      </main>

      {/* 🗂️ 4. CONTENT DETAIL MODAL (PARA OS 6 EIXOS, MÉTODO, DNA PROMPT E FAQ) */}
      {activeModalSection && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setActiveModalSection(null)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              color: '#000000',
              borderRadius: '20px',
              maxWidth: '680px',
              width: '100%',
              maxHeight: '85vh',
              overflowY: 'auto',
              padding: '32px 28px',
              position: 'relative',
              boxShadow: '0 25px 60px rgba(0,0,0,0.4)'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setActiveModalSection(null)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: '#f3f4f6',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '16px'
              }}
            >
              ✕
            </button>

            {/* Modal Content: OS 6 EIXOS */}
            {activeModalSection === 'axes' && (
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Investigação Profunda
                </div>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '14px', letterSpacing: '-0.02em' }}>
                  Os 6 Eixos de Investigação
                </h2>
                <p style={{ color: '#4b5563', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '20px' }}>
                  Durante 1h30 individual ao vivo, extraímos a matéria-prima da sua autoridade:
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
                  {[
                    { t: '1. Sua História', d: 'A origem real da sua autoridade e os marcos que sustentam o que você vende.' },
                    { t: '2. Seus Bastidores', d: 'Aprendizados caros, erros práticos, rotinas de trabalho e desafios reais.' },
                    { t: '3. Sua Visão', d: 'O que você defende, o que não tolera no mercado e onde discorda da maioria.' },
                    { t: '4. Seu Conhecimento', d: 'Como resolve problemas técnicos e os exemplos que usa para explicar seu método.' },
                    { t: '5. Seu Repertório Vivo', d: 'Situações cotidianas que funcionam como metáforas para reter a atenção do público.' },
                    { t: '6. Sua Voz', d: 'O ritmo do seu raciocínio, suas expressões habituais e a cadência do seu pensamento.' }
                  ].map(axis => (
                    <div key={axis.t} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', padding: '14px', borderRadius: '12px' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px', color: '#111827' }}>{axis.t}</div>
                      <div style={{ fontSize: '0.85rem', color: '#4b5563', lineHeight: 1.4 }}>{axis.d}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Content: O MÉTODO */}
            {activeModalSection === 'method' && (
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Passo a Passo
                </div>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '14px', letterSpacing: '-0.02em' }}>
                  Como funciona o Fala Que Eu Te Escuto
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    { n: '01', t: 'Preparação', d: 'Formulário prévio para reativar marcos da memória.' },
                    { n: '02', t: 'A Sessão (1h30)', d: 'Encontro individual ao vivo comigo com roteiro proprietário de provocação.' },
                    { n: '03', t: 'Extração', d: 'Processamento de relatos brutos em dados estruturados.' },
                    { n: '04', t: 'Discernimento', d: 'Curadoria rigorosa: separação de informação comum de repertório com autoridade.' },
                    { n: '05', t: 'Estruturação no Notion', d: 'Organização em temas âncora, histórias centrais e desdobramentos.' },
                    { n: '06', t: 'Entrega do DNA Prompt', d: 'Arquivo mestre de contexto pronto para rodar no ChatGPT, Claude ou Gemini em até 7 dias corridos.' }
                  ].map(step => (
                    <div key={step.n} style={{ display: 'flex', gap: '12px', background: '#f9fafb', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e5e7eb' }}>
                      <span style={{ fontWeight: 800, color: '#7c3aed', fontSize: '0.95rem' }}>{step.n}.</span>
                      <div>
                        <strong style={{ color: '#111827', fontSize: '0.9rem' }}>{step.t}: </strong>
                        <span style={{ color: '#4b5563', fontSize: '0.86rem' }}>{step.d}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Content: DNA PROMPT */}
            {activeModalSection === 'dna' && (
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase', marginBottom: '6px' }}>
                  O Ativo Mestre
                </div>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '14px', letterSpacing: '-0.02em' }}>
                  O seu DNA Prompt
                </h2>
                <p style={{ color: '#4b5563', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '16px' }}>
                  Você não vai sair da sessão com uma planilha estática que nunca mais vai abrir. Você recebe o seu <strong>DNA Prompt</strong>: um comando estruturado de contexto profundo para rodar nas principais ferramentas de IA (<strong>ChatGPT, Claude, Gemini</strong>).
                </p>
                <div style={{ background: '#f3f4f6', borderLeft: '4px solid #7c3aed', padding: '14px 16px', borderRadius: '0 10px 10px 0', fontSize: '0.92rem', color: '#1f2937', lineHeight: 1.5 }}>
                  A regra do jogo muda: <strong>em vez de pedir para a inteligência artificial inventar quem você é, você entrega o contexto exato para ela pensar, estruturar e redigir a partir da sua experiência real.</strong>
                </div>
              </div>
            )}

            {/* Modal Content: FAQ */}
            {activeModalSection === 'faq' && (
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Tire Suas Dúvidas
                </div>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '14px', letterSpacing: '-0.02em' }}>
                  Perguntas Frequentes
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    { q: 'Preciso dominar IA antes da sessão?', a: 'Não. O foco é a investigação do seu conhecimento humano. O DNA Prompt é entregue pronto para você apenas copiar e colar.' },
                    { q: 'Vou receber conteúdos prontos?', a: 'Não. Você recebe a matéria-prima filtrada, o mapa no Notion e o prompt mestre para gerar dezenas de postagens autorais com autonomia.' },
                    { q: 'É o mesmo que consultoria de branding?', a: 'Não. O mapeamento extrai "o que existe dentro da sua vivência que pode ser comunicado" para abastecer sua produção de conteúdo.' },
                    { q: 'Qual o prazo de entrega?', a: 'Após a nossa chamada individual de 1h30, todo o material é entregue em até 7 dias corridos.' }
                  ].map(f => (
                    <div key={f.q} style={{ background: '#f9fafb', padding: '14px', borderRadius: '10px', border: '1px solid #e5e7eb' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#111827', marginBottom: '4px' }}>{f.q}</div>
                      <div style={{ fontSize: '0.85rem', color: '#4b5563', lineHeight: 1.4 }}>{f.a}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Modal CTA */}
            <div style={{ marginTop: '24px', textAlign: 'center', borderTop: '1px solid #e5e7eb', paddingTop: '18px' }}>
              <button
                onClick={() => {
                  setActiveModalSection(null);
                  setIsBookingOpen(true);
                }}
                style={{
                  background: '#000000',
                  color: '#ffffff',
                  padding: '12px 28px',
                  borderRadius: '9999px',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Garantir Sessão Individual — R$ 297
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Booking WhatsApp Modal */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
      />
    </div>
  );
};
