import React, { useState } from 'react';
import { X, CheckCircle2, ArrowRight, MessageSquare, ShieldCheck, Sparkles, Lock } from 'lucide-react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose
}) => {
  const [name, setName] = useState<string>('');
  const [niche, setNiche] = useState<string>('');
  const [currentTool, setCurrentTool] = useState<string>('ChatGPT');

  if (!isOpen) return null;

  const features = [
    'Sessão individual de 1h30 ao vivo com roteiro proprietário',
    'Extração profunda de vivências, bastidores e voz real',
    'Curadoria e discernimento estratégico (separação de ruído)',
    'Mapa de narrativas completo estruturado no Notion',
    'DNA Prompt personalizado pronto para ChatGPT, Claude e Gemini',
    'BÔNUS: Lista estratégica de ganchos de alta retenção',
    'Entrega de todo o material em até 7 dias corridos'
  ];

  const handleCheckoutWhatsApp = () => {
    const clientName = name.trim() || 'Criador';
    const clientNiche = niche.trim() || 'meu nicho';

    const message = encodeURIComponent(
      `Olá! Gostaria de garantir minha sessão individual no *Fala Que Eu Te Escuto* (R$ 297,00)!\n\n` +
      `*Nome:* ${clientName}\n` +
      `*Nicho/Atuação:* ${clientNiche}\n` +
      `*IA que mais uso:* ${currentTool}\n\n` +
      `Gostaria de verificar os horários disponíveis na agenda para o nosso encontro de 1h30!`
    );

    window.open(`https://wa.me/5511999999999?text=${message}`, '_blank');
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
        background: 'rgba(5, 7, 13, 0.85)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          maxWidth: '540px',
          width: '100%',
          maxHeight: '92vh',
          overflowY: 'auto',
          padding: '28px',
          boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
          position: 'relative'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border)',
            borderRadius: '50%',
            width: '34px',
            height: '34px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-secondary)',
            cursor: 'pointer'
          }}
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div style={{ marginBottom: '20px', paddingRight: '36px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(124, 58, 237, 0.15)',
              color: 'var(--accent)',
              fontSize: '0.8rem',
              fontWeight: 700,
              marginBottom: '8px'
            }}
          >
            <Sparkles size={14} />
            <span>Sessão Individual de Investigação Estratégica</span>
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
            Garantir Minha Sessão
          </h2>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', margin: '6px 0 0 0' }}>
            Extração de repertório real + Notion estruturado + seu DNA Prompt.
          </p>
        </div>

        {/* Plan Summary Card */}
        <div
          style={{
            background: 'var(--bg-primary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '18px',
            marginBottom: '20px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase' }}>
                Fala Que Eu Te Escuto
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                R$ 297,00
              </div>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              à vista ou até 12x no cartão
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
            {features.map((feat, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                <CheckCircle2 size={15} color="var(--success)" style={{ flexShrink: 0 }} />
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Input Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '22px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
              Seu Nome Completo:
            </label>
            <input
              type="text"
              placeholder="Ex: Carlos Mendes"
              value={name}
              onChange={e => setName(e.target.value)}
              style={{
                width: '100%',
                padding: '11px 14px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
              Seu Nicho / Área de Atuação:
            </label>
            <input
              type="text"
              placeholder="Ex: Consultoria Empresarial, Finanças, Saúde..."
              value={niche}
              onChange={e => setNiche(e.target.value)}
              style={{
                width: '100%',
                padding: '11px 14px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
              Qual IA você costuma utilizar?
            </label>
            <select
              value={currentTool}
              onChange={e => setCurrentTool(e.target.value)}
              style={{
                width: '100%',
                padding: '11px 14px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            >
              <option value="ChatGPT (OpenAI)">ChatGPT (OpenAI)</option>
              <option value="Claude (Anthropic)">Claude (Anthropic)</option>
              <option value="Gemini (Google)">Gemini (Google)</option>
              <option value="DeepSeek">DeepSeek</option>
              <option value="Ainda estou começando com IA">Ainda estou começando com IA</option>
            </select>
          </div>
        </div>

        {/* Primary CTA */}
        <button
          onClick={handleCheckoutWhatsApp}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            padding: '16px 24px',
            borderRadius: 'var(--radius-full)',
            background: 'linear-gradient(135deg, #a855f7 0%, #3b82f6 100%)',
            color: '#fff',
            fontSize: '1.05rem',
            fontWeight: 800,
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 8px 25px var(--accent-glow)',
            transition: 'transform var(--transition-fast)'
          }}
        >
          <MessageSquare size={19} />
          <span>Agendar Sessão por R$ 297,00</span>
          <ArrowRight size={18} />
        </button>

        {/* Guarantee Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginTop: '14px',
            fontSize: '0.78rem',
            color: 'var(--text-muted)'
          }}
        >
          <ShieldCheck size={16} color="var(--success)" />
          <span>Atendimento 100% individual e sigiloso • Vagas limitadas</span>
        </div>
      </div>
    </div>
  );
};
