import React, { useState } from 'react';
import { Bot, Copy, Check, Sparkles, Filter, Code } from 'lucide-react';
import { useBrandTherapy, AIPromptItem } from '../context/BrandTherapyContext';

export const PromptsLibrary: React.FC = () => {
  const { session } = useBrandTherapy();
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = ['Todos', 'Linha Editorial', 'Posts de Venda', 'Histórias de Conexão', 'Carrosséis', 'Vídeos Curtos'];

  const filteredPrompts = selectedCategory === 'Todos'
    ? session.prompts
    : session.prompts.filter(p => p.category === selectedCategory);

  const handleCopyPrompt = (promptText: string, id: string) => {
    navigator.clipboard.writeText(promptText);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px 20px 80px 20px' }}>
      <div style={{ marginBottom: '28px' }}>
        <div className="hero-glow-badge" style={{ marginBottom: '8px' }}>
          <Bot size={14} />
          <span>Gerador & Biblioteca de Prompts Mestre</span>
        </div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>
          Prompts Personalizados para ChatGPT / Claude / DeepSeek
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
          Alimentados com o contexto autêntico de {session.clientName}.
        </p>
      </div>

      {/* Filter Chips */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '24px', paddingBottom: '4px' }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-full)',
              border: selectedCategory === cat ? '1px solid var(--accent)' : '1px solid var(--border)',
              background: selectedCategory === cat ? 'var(--accent)' : 'var(--bg-secondary)',
              color: selectedCategory === cat ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: selectedCategory === cat ? 600 : 500,
              fontSize: '0.85rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Prompts Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {filteredPrompts.map(item => (
          <div key={item.id} className="brand-card-glow">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <span
                  style={{
                    background: 'rgba(168, 85, 247, 0.12)',
                    color: 'var(--accent)',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    marginRight: '8px'
                  }}
                >
                  {item.category}
                </span>
                <span style={{ fontWeight: 700, fontSize: '1.05rem' }}>{item.title}</span>
              </div>

              <button
                onClick={() => handleCopyPrompt(item.prompt, item.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {copiedId === item.id ? <Check size={14} style={{ color: '#22c55e' }} /> : <Copy size={14} />}
                <span>{copiedId === item.id ? 'Prompt Copiado!' : 'Copiar Prompt'}</span>
              </button>
            </div>

            <pre
              style={{
                background: 'var(--bg-primary)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                padding: '14px',
                color: 'var(--text-secondary)',
                fontFamily: 'monospace',
                fontSize: '0.88rem',
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
                margin: 0
              }}
            >
              {item.prompt}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
};
