import React from 'react';
import { ThemeToggle } from './ThemeToggle';

export const ClassicHeader: React.FC = () => {
  const scrollToPricing = () => {
    const el = document.getElementById('pricing');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const tickerItems = [
    'OFERTA DE LANÇAMENTO POR TEMPO LIMITADO'
  ];

  return (
    <div style={{ position: 'sticky', top: 0, zIndex: 50 }}>
      {/* 🚀 1. BARRA CONTÍNUA BEM LENTA E SUAVE */}
      <div
        onClick={scrollToPricing}
        style={{
          background: 'linear-gradient(90deg, #6d28d9 0%, #7c3aed 50%, #2563eb 100%)',
          color: '#ffffff',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          padding: '10px 0',
          cursor: 'pointer',
          borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
          userSelect: 'none',
          boxShadow: '0 2px 10px rgba(0,0,0,0.15)'
        }}
      >
        <div
          className="marquee-track"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '40px',
            willChange: 'transform'
          }}
        >
          {[
            ...tickerItems,
            ...tickerItems,
            ...tickerItems,
            ...tickerItems,
            ...tickerItems,
            ...tickerItems,
            ...tickerItems,
            ...tickerItems,
            ...tickerItems,
            ...tickerItems,
            ...tickerItems,
            ...tickerItems
          ].map((item, index) => (
            <div
              key={index}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '14px',
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
                  boxShadow: '0 0 6px #4ade80',
                  display: 'inline-block'
                }}
              />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Theme Toggle (Discreto no topo direito) */}
      <div
        style={{
          position: 'fixed',
          top: '48px',
          right: '16px',
          zIndex: 60
        }}
      >
        <ThemeToggle />
      </div>

      <style>{`
        .marquee-track {
          animation: marqueeScroll 60s linear infinite;
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
