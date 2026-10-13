import React, { useRef, useEffect, useState } from 'react';
import {
  Globe,
  ArrowRight,
  Sparkles,
  Check,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Lock,
  Sun,
  Moon
} from 'lucide-react';
import { useBrandTherapy } from '../../context/BrandTherapyContext';
import { AboutSection } from './AboutSection';
import { PhilosophySection } from './PhilosophySection';
import { ServicesSection } from './ServicesSection';
import { BookingModal } from '../BookingModal';

export const LiquidLandingPage: React.FC = () => {
  const { theme, toggleTheme } = useBrandTherapy();
  const isDark = theme === 'dark';

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  // Video smooth fade loop logic (vanilla JS via refs as specified in prompt)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let fadeAnimId: number | null = null;

    const fade = (start: number, end: number, duration: number, onComplete?: () => void) => {
      if (fadeAnimId) cancelAnimationFrame(fadeAnimId);
      const startTime = performance.now();

      const step = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        video.style.opacity = String(start + (end - start) * progress);

        if (progress < 1) {
          fadeAnimId = requestAnimationFrame(step);
        } else if (onComplete) {
          onComplete();
        }
      };

      fadeAnimId = requestAnimationFrame(step);
    };

    const handleCanPlay = () => {
      video.play().catch(() => {});
      fade(0, 1, 500);
    };

    let isFadingOut = false;
    const handleTimeUpdate = () => {
      if (video.duration && video.duration - video.currentTime <= 0.55 && !isFadingOut) {
        isFadingOut = true;
        fade(parseFloat(video.style.opacity || '1'), 0, 500);
      }
    };

    const handleEnded = () => {
      video.style.opacity = '0';
      isFadingOut = false;
      setTimeout(() => {
        video.currentTime = 0;
        video.play().catch(() => {});
        fade(0, 1, 500);
      }, 100);
    };

    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);

    if (video.readyState >= 3) {
      handleCanPlay();
    }

    return () => {
      if (fadeAnimId) cancelAnimationFrame(fadeAnimId);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
    };
  }, []);

  const scrollToPricing = () => {
    const el = document.getElementById('liquid-pricing');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      setIsBookingOpen(true);
    }
  };

  const faqItems = [
    {
      q: 'Eu preciso já produzir conteúdo?',
      a: 'Não. A sessão parte da sua experiência e do seu conhecimento profissional. Você não precisa possuir um grande volume de conteúdo publicado anteriormente.'
    },
    {
      q: 'E se eu achar que não tenho histórias interessantes?',
      a: 'Esse é justamente um dos problemas que a sessão procura resolver. Muitas experiências parecem banais para quem as viveu, mas revelam conhecimento, posicionamento e maturidade quando são exploradas pelas perguntas certas.'
    },
    {
      q: 'Vocês vão escrever meus conteúdos durante a sessão?',
      a: 'Esse não é o objetivo central do Banco de Repertório. A principal entrega é identificar, extrair e organizar a matéria-prima que poderá alimentar sua produção posteriormente.'
    },
    {
      q: 'Preciso usar ChatGPT?',
      a: 'Não. O arquivo de contexto pode ser utilizado como base em diferentes ferramentas de inteligência artificial, incluindo ChatGPT, Claude e Gemini.'
    },
    {
      q: 'Isso é um pacote de prompts?',
      a: 'Não. Prompts dizem à IA o que fazer. O Banco de Repertório ajuda a fornecer algo anterior: sobre o que ela deverá pensar. Seu conhecimento, suas experiências, seus argumentos e seu contexto.'
    }
  ];

  return (
    <div
      style={{
        backgroundColor: isDark ? '#000000' : '#f8fafc',
        color: isDark ? '#ffffff' : '#0f172a',
        transition: 'background-color 0.3s ease, color 0.3s ease'
      }}
      className={`min-h-screen relative font-sans ${theme === 'light' ? 'light-theme' : ''}`}
    >
      {/* 🚀 FAIXA SUPERIOR - WORKSHOP INDIVIDUAL */}
      <div
        onClick={scrollToPricing}
        style={{
          position: 'relative',
          width: '100%',
          zIndex: 20,
          background: 'linear-gradient(90deg, #6d28d9 0%, #7c3aed 50%, #2563eb 100%)',
          color: '#ffffff',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          padding: '10px 0',
          cursor: 'pointer',
          borderBottom: '1px solid rgba(168, 85, 247, 0.35)',
          userSelect: 'none',
          boxShadow: '0 2px 18px rgba(124, 58, 237, 0.4)'
        }}
      >
        <div
          className="marquee-track"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '50px',
            willChange: 'transform'
          }}
        >
          {[
            'WORKSHOP INDIVIDUAL • BANCO DE REPERTÓRIO',
            'O CONTEÚDO ESTÁ NO QUE VOCÊ CONTA',
            'WORKSHOP INDIVIDUAL • BANCO DE REPERTÓRIO',
            'O CONTEÚDO ESTÁ NO QUE VOCÊ CONTA',
            'WORKSHOP INDIVIDUAL • BANCO DE REPERTÓRIO',
            'O CONTEÚDO ESTÁ NO QUE VOCÊ CONTA',
            'WORKSHOP INDIVIDUAL • BANCO DE REPERTÓRIO',
            'O CONTEÚDO ESTÁ NO QUE VOCÊ CONTA'
          ].map((item, index) => (
            <div
              key={index}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '0.78rem',
                fontWeight: 800,
                letterSpacing: '0.08em',
                textTransform: 'uppercase'
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#4ade80',
                  boxShadow: '0 0 8px #4ade80',
                  display: 'inline-block'
                }}
              />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 🚀 1. HERO SECTION (FULL-VIEWPORT) */}
      <div className="min-h-screen overflow-hidden relative flex flex-col justify-between">
        {/* Background Video with Smooth Fade Crossfade */}
        <video
          ref={videoRef}
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_074625_a81f018a-956b-43fb-9aee-4d1508e30e6a.mp4"
          muted
          autoPlay
          playsInline
          preload="auto"
          style={{ opacity: 0 }}
          className="absolute inset-0 w-full h-full object-cover object-bottom pointer-events-none"
        />

        {/* Top Gradient for subtle header readability */}
        <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-black/40 to-transparent pointer-events-none z-10" />

        {/* Hero Content */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12 text-center -translate-y-[2%] md:-translate-y-[5%]">
          {/* Badge */}
          <div className="mb-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-md text-white/90 text-xs sm:text-sm font-medium tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Workshop Individual • Extração de Repertório</span>
          </div>

          {/* Main Heading with Instrument Serif */}
          <h1
            style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white tracking-tight leading-[1.08] mb-5 font-normal max-w-3xl"
          >
            <span>Crie conteúdo que mostre a sua </span>
            <br className="hidden sm:block" />
            <em className="italic font-normal text-white/90">maturidade profissional</em>.
          </h1>

          {/* Subtitle */}
          <p className="text-white/80 text-sm sm:text-base md:text-lg max-w-2xl leading-relaxed px-4 mb-4 font-light">
            Você não precisa aprender a parecer mais interessante na internet. Precisa aprender a enxergar o conteúdo que já existe naquilo que você <strong>sabe, pensa e viveu</strong>.
          </p>

          <p className="text-white/60 text-xs sm:text-sm max-w-xl leading-relaxed px-4 mb-8 font-light italic">
            Crie com a mesma naturalidade com que você explica seu trabalho para um amigo na mesa de um café. O conteúdo está no que você conta — a IA só precisa do contexto.
          </p>

          {/* Primary Action Button */}
          <div className="mb-2 flex justify-center w-full max-w-xl">
            <button
              onClick={scrollToPricing}
              style={{
                background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 50%, #2563eb 100%)',
                border: '1px solid rgba(168, 85, 247, 0.45)',
                boxShadow: '0 6px 28px rgba(124, 58, 237, 0.55)'
              }}
              className="group relative w-full sm:w-auto inline-flex items-center justify-center px-8 sm:px-10 py-4 sm:py-5 rounded-full text-white font-bold text-base sm:text-lg tracking-tight hover:shadow-[0_8px_38px_rgba(124,58,237,0.85)] hover:brightness-110 transition-all duration-300 active:scale-95 cursor-pointer text-center"
            >
              <span>Quero agendar minha conversa — R$ 297</span>
            </button>
          </div>
        </div>

        {/* 🌫️ Suave Transição Discreta Somente no Modo Escuro */}
        {isDark && (
          <div
            style={{
              background: 'linear-gradient(to top, #000000 0%, rgba(0,0,0,0.6) 40%, transparent 100%)'
            }}
            className="absolute bottom-0 left-0 right-0 h-16 sm:h-24 pointer-events-none z-10"
          />
        )}
      </div>

      {/* 🏛️ SECTION 2 -- ABOUT */}
      <div id="about">
        <AboutSection />
      </div>

      {/* 🧠 SECTION 3 -- PHILOSOPHY / REPERTÓRIO X DISCERNIMENTO */}
      <div id="philosophy">
        <PhilosophySection />
      </div>

      {/* ⚙️ SECTION 4 -- SERVICES / OS 6 EIXOS DE INVESTIGAÇÃO */}
      <div id="eixos">
        <ServicesSection onOpenBooking={() => setIsBookingOpen(true)} />
      </div>

      {/* 💰 SECTION 5 -- INVESTIMENTO & CHECKOUT */}
      <section id="liquid-pricing" className="py-24 md:py-36 px-6 relative z-10 starry-background">
        <div className="max-w-3xl mx-auto text-center">
          <div className="liquid-glass rounded-3xl p-8 sm:p-12 border border-white/10 shadow-2xl">
            <div className="text-white/40 text-xs uppercase tracking-widest font-semibold mb-3">
              Workshop Individual
            </div>
            <h2
              style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
              className="text-4xl sm:text-6xl text-white tracking-tight mb-3 font-normal"
            >
              Banco de Repertório
            </h2>
            <p className="text-white/70 text-sm sm:text-base max-w-lg mx-auto mb-6 leading-relaxed font-light">
              Sessão individual de mapeamento e extração (~90 min) que transforma suas experiências, crenças, histórias, opiniões e aprendizados em contexto organizado para você criar conteúdo com IA sem parecer todo mundo.
            </p>

            {/* Price Tag */}
            <div className="mb-8">
              <div className="text-5xl sm:text-6xl font-bold text-white tracking-tight">
                R$ 297,00
              </div>
              <div className="text-white/50 text-xs sm:text-sm mt-1 font-light">
                à vista ou em até 12x no cartão • Menos que duas pizzas no final de semana
              </div>
            </div>

            {/* Deliverables Checklist */}
            <div className="flex flex-col gap-3 text-left max-w-md mx-auto mb-8 text-sm text-white/80">
              <div className="flex items-center gap-3">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Sessão individual de extração (~90 min ao vivo)</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Mapeamento do seu repertório profissional no Notion</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Arquivo de contexto mestre (DNA Prompt)</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Material pronto para rodar no ChatGPT, Claude, Gemini ou outra IA</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Bônus: Lista de ganchos de alta retenção</span>
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={() => setIsBookingOpen(true)}
              className="w-full max-w-md bg-white text-black font-semibold text-base py-4 rounded-full hover:bg-white/90 transition-transform active:scale-95 cursor-pointer shadow-xl"
            >
              Quero agendar minha conversa — R$ 297
            </button>

            <div className="mt-4 flex items-center justify-center gap-2 text-white/40 text-xs font-light">
              <Lock className="w-3.5 h-3.5 text-white/40" />
              <span>A entrega central é simples: descobrir e organizar o que já existe.</span>
            </div>
          </div>
        </div>
      </section>

      {/* ❓ SECTION 6 -- PERGUNTAS FREQUENTES */}
      <section id="faq" className="py-20 md:py-28 px-6 relative z-10 starry-background">
        <div className="max-w-3xl mx-auto">
          <h2
            style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
            className="text-4xl sm:text-6xl text-white tracking-tight mb-12 text-center font-normal"
          >
            Perguntas Frequentes
          </h2>

          <div className="flex flex-col gap-3">
            {faqItems.map((faq, index) => {
              const isExpanded = expandedFaq === index;
              return (
                <div key={index} className="liquid-glass rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setExpandedFaq(isExpanded ? null : index)}
                    className="w-full p-5 sm:p-6 flex items-center justify-between gap-4 text-left font-medium text-white text-base sm:text-lg cursor-pointer bg-transparent border-none"
                  >
                    <span>{faq.q}</span>
                    {isExpanded ? <ChevronUp size={18} className="text-white/60" /> : <ChevronDown size={18} className="text-white/60" />}
                  </button>

                  {isExpanded && (
                    <div className="px-5 sm:px-6 pb-6 text-white/70 text-sm sm:text-base leading-relaxed font-light border-t border-white/10 pt-4">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 🏁 Footer */}
      <footer className="py-12 px-6 border-t border-white/10 text-center text-white/40 text-xs relative z-10">
        <p>Banco de Repertório • Workshop Individual © {new Date().getFullYear()} — O conteúdo está no que você conta.</p>
      </footer>

      {/* 🌓 Botão Flutuante Elegante de Alternância Claro / Escuro */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={toggleTheme}
          aria-label="Alternar modo claro ou escuro"
          title={isDark ? "Mudar para Modo Claro" : "Mudar para Modo Escuro"}
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-full shadow-2xl transition-all duration-300 active:scale-95 cursor-pointer border backdrop-blur-md"
          style={{
            backgroundColor: isDark ? 'rgba(15, 23, 42, 0.85)' : 'rgba(255, 255, 255, 0.95)',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.18)' : 'rgba(0, 0, 0, 0.12)',
            color: isDark ? '#ffffff' : '#0f172a',
            boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.5)' : '0 10px 30px rgba(0,0,0,0.12)'
          }}
        >
          {isDark ? (
            <>
              <Sun className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-semibold tracking-wide">Modo Claro</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-semibold tracking-wide">Modo Escuro</span>
            </>
          )}
        </button>
      </div>

      {/* Booking WhatsApp Modal */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
      />

      <style>{`
        .marquee-track {
          animation: marqueeScroll 45s linear infinite;
        }
        .marquee-track:hover {
          animation-play-state: paused;
        }
        @keyframes marqueeScroll {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
};
