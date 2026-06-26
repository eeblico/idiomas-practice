import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Languages, Target, Flame, Play, Square } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const { languages, setTargetLanguage, targetLanguage } = useApp();
  const [step, setStep] = useState(1);
  const [selectedGoal, setSelectedGoal] = useState(10);

  const handleStart = () => {
    setTargetLanguage(targetLanguage);
    onComplete();
  };

  return (
    <div className="onboarding-screen fade-in">
      <div className="logo-glow" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Square size={48} style={{ fill: 'var(--accent)', stroke: 'none' }} />
      </div>
      
      {step === 1 && (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
          <div>
            <h1 style={{ fontSize: '2.2rem', marginBottom: '8px', fontWeight: 800 }}>LearnChunk</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.5' }}>
              Aprenda novos idiomas através de frases práticas de conversação real, escuta ativa e active recall inteligente.
            </p>
          </div>
          
          <div style={{ marginTop: '10px' }}>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setStep(2)}>
              Escolher Idioma <Play size={16} />
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', textAlign: 'left' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Qual idioma deseja aprender?</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Você poderá alterar isso a qualquer momento.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {languages.map((lang) => (
              <button
                key={lang.id}
                onClick={() => setTargetLanguage(lang.id)}
                className={`island-card ${targetLanguage === lang.id ? 'active' : ''}`}
                style={{ textAlign: 'left' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{ fontSize: '2rem' }}>{lang.flag_emoji}</span>
                  <div>
                    <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{lang.name}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <button className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }} onClick={() => setStep(3)}>
            Continuar
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', textAlign: 'left' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Defina sua meta diária</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Escolha a quantidade de novas frases que deseja praticar todos os dias.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { count: 5, label: 'Suave', desc: '5 frases / dia' },
              { count: 10, label: '(Recomendado) Padrão', desc: '10 frases / dia' },
              { count: 20, label: 'Intenso', desc: '20 frases / dia' }
            ].map((goalOption) => (
              <button
                key={goalOption.count}
                onClick={() => setSelectedGoal(goalOption.count)}
                className={`island-card ${selectedGoal === goalOption.count ? 'active' : ''}`}
                style={{ textAlign: 'left' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'var(--bg-tertiary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: selectedGoal === goalOption.count ? 'var(--accent)' : 'var(--text-muted)'
                    }}>
                      <Target size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700 }}>{goalOption.label}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{goalOption.desc}</div>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <button className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }} onClick={handleStart}>
            Começar Agora! <Flame size={16} />
          </button>
        </div>
      )}
    </div>
  );
};
