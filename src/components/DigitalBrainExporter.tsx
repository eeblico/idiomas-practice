import React, { useState } from 'react';
import {
  Brain,
  Copy,
  Check,
  Download,
  Plus,
  Trash2,
  Sparkles,
  FileCode,
  FileText,
  BookOpen,
  Zap,
  ShieldAlert,
  MessageCircle,
  Target
} from 'lucide-react';
import { useBrandTherapy, ContextPillars } from '../context/BrandTherapyContext';

export const DigitalBrainExporter: React.FC = () => {
  const { session, updatePillar, generateNotionMarkdown, generateWordHTML } = useBrandTherapy();

  const [copiedNotion, setCopiedNotion] = useState<boolean>(false);
  const [copiedGDocs, setCopiedGDocs] = useState<boolean>(false);
  const [activePillarTab, setActivePillarTab] = useState<keyof ContextPillars>('stories');
  const [newItemText, setNewItemText] = useState<string>('');

  const handleCopyNotion = () => {
    const md = generateNotionMarkdown();
    navigator.clipboard.writeText(md);
    setCopiedNotion(true);
    setTimeout(() => setCopiedNotion(false), 2500);
  };

  const handleCopyGoogleDocs = async () => {
    const html = generateWordHTML();
    const plainText = generateNotionMarkdown();
    try {
      const blobHtml = new Blob([html], { type: 'text/html' });
      const blobText = new Blob([plainText], { type: 'text/plain' });
      const item = new ClipboardItem({
        'text/html': blobHtml,
        'text/plain': blobText
      });
      await navigator.clipboard.write([item]);
      setCopiedGDocs(true);
      setTimeout(() => setCopiedGDocs(false), 2500);
    } catch (e) {
      navigator.clipboard.writeText(plainText);
      setCopiedGDocs(true);
      setTimeout(() => setCopiedGDocs(false), 2500);
    }
  };

  const handleDownloadWord = () => {
    const html = generateWordHTML();
    const blob = new Blob(['\ufeff', html], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Cerebro_Digital_${session.clientName.replace(/\s+/g, '_')}.doc`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadMarkdown = () => {
    const md = generateNotionMarkdown();
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Cerebro_Digital_${session.clientName.replace(/\s+/g, '_')}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const addItemToActivePillar = () => {
    if (!newItemText.trim()) return;
    const currentList = session.pillars[activePillarTab] || [];
    updatePillar(activePillarTab, [...currentList, newItemText.trim()]);
    setNewItemText('');
  };

  const removeItemFromActivePillar = (idx: number) => {
    const currentList = session.pillars[activePillarTab] || [];
    const updated = currentList.filter((_, i) => i !== idx);
    updatePillar(activePillarTab, updated);
  };

  const pillarMeta: Record<keyof ContextPillars, { title: string; icon: React.ReactNode; color: string }> = {
    stories: { title: '1. Histórias & Viradas', icon: <BookOpen size={16} />, color: '#a855f7' },
    beliefs: { title: '2. Crenças Centrais', icon: <Zap size={16} />, color: '#22c55e' },
    antitheses: { title: '3. Antíteses de Mercado', icon: <ShieldAlert size={16} />, color: '#ef4444' },
    vocabulary: { title: '4. Vocabulário & Tom', icon: <MessageCircle size={16} />, color: '#3b82f6' },
    positioning: { title: '5. Posicionamento', icon: <Target size={16} />, color: '#eab308' }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px 20px 80px 20px' }}>
      {/* Top Banner & Export Actions */}
      <div
        className="brand-card-glow"
        style={{
          background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-primary) 100%)',
          marginBottom: '28px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div className="hero-glow-badge" style={{ marginBottom: '8px' }}>
              <Brain size={14} />
              <span>O Entregável Final do Cliente</span>
            </div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>
              Cérebro Digital no Notion: {session.clientName}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
              Nicho: <strong>{session.clientNiche}</strong> | Data: <strong>{session.sessionDate}</strong>
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={handleDownloadWord}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                borderRadius: 'var(--radius-full)',
                background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
                color: '#ffffff',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)'
              }}
            >
              <FileText size={18} />
              <span>Baixar Word (.doc)</span>
            </button>

            <button
              onClick={handleCopyGoogleDocs}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {copiedGDocs ? <Check size={18} style={{ color: '#22c55e' }} /> : <Copy size={18} />}
              <span>{copiedGDocs ? 'Formatado para Google Docs!' : 'Copiar para Google Docs'}</span>
            </button>

            <button
              onClick={handleCopyNotion}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                borderRadius: 'var(--radius-full)',
                background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)',
                color: '#ffffff',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer'
              }}
            >
              {copiedNotion ? <Check size={18} /> : <Copy size={18} />}
              <span>{copiedNotion ? 'Copiado para Notion!' : 'Copiar para Notion'}</span>
            </button>

            <button
              onClick={handleDownloadMarkdown}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 18px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              <Download size={16} />
              <span>.md</span>
            </button>
          </div>
        </div>
      </div>

      {/* Editor & Manager of 5 Pillars */}
      <div className="brand-card-glow" style={{ marginBottom: '28px' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '16px' }}>
          🧩 Editar Pilares da Arquitetura de Contexto
        </h3>

        {/* Pillar Selection Tabs */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '20px', paddingBottom: '4px' }}>
          {(Object.keys(pillarMeta) as Array<keyof ContextPillars>).map(key => {
            const meta = pillarMeta[key];
            const active = activePillarTab === key;
            return (
              <button
                key={key}
                onClick={() => setActivePillarTab(key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-full)',
                  border: active ? `1px solid ${meta.color}` : '1px solid var(--border)',
                  background: active ? 'var(--bg-primary)' : 'transparent',
                  color: active ? meta.color : 'var(--text-secondary)',
                  fontWeight: active ? 700 : 500,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {meta.icon}
                <span>{meta.title}</span>
                <span
                  style={{
                    background: 'var(--bg-secondary)',
                    padding: '2px 6px',
                    borderRadius: '999px',
                    fontSize: '0.75rem'
                  }}
                >
                  {session.pillars[key]?.length || 0}
                </span>
              </button>
            );
          })}
        </div>

        {/* List of items in active pillar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
          {(session.pillars[activePillarTab] || []).map((item, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border)'
              }}
            >
              <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                • {item}
              </span>
              <button
                onClick={() => removeItemFromActivePillar(idx)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px'
                }}
                title="Remover item"
              >
                <Trash2 size={16} style={{ color: '#ef4444' }} />
              </button>
            </div>
          ))}

          {session.pillars[activePillarTab]?.length === 0 && (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', fontStyle: 'italic' }}>
              Nenhum item adicionado neste pilar ainda.
            </p>
          )}
        </div>

        {/* Add item input */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={newItemText}
            onChange={e => setNewItemText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addItemToActivePillar()}
            placeholder={`Adicionar novo item ao pilar "${pillarMeta[activePillarTab].title}"...`}
            style={{
              flexGrow: 1,
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-primary)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              fontSize: '0.9rem'
            }}
          />
          <button
            onClick={addItemToActivePillar}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 18px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--accent)',
              color: '#ffffff',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <Plus size={16} />
            <span>Adicionar</span>
          </button>
        </div>
      </div>

      {/* Interactive Notion Style Preview */}
      <div className="brand-card-glow">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileCode size={18} style={{ color: 'var(--accent)' }} />
            <span>Preview do Documento Notion</span>
          </h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Estilo Nativo do Notion</span>
        </div>

        <div className="notion-preview-box">
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px' }}>
            🧠 Cérebro Digital de Conteúdo — {session.clientName}
          </h2>

          <div className="notion-callout">
            <Sparkles size={20} style={{ color: 'var(--accent)', flexShrink: 0 }} />
            <div>
              <strong>Extração de Contexto & Terapia de Marca (2 Horas)</strong>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Nicho: {session.clientNiche} | Data da Sessão: {session.sessionDate}
              </div>
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '20px 0' }} />

          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '16px' }}>
            📖 1. Matéria-Prima de Histórias & Origem
          </h3>
          {session.pillars.stories.map((s, i) => (
            <div key={i} className="notion-toggle-item" style={{ fontSize: '0.88rem' }}>
              - {s}
            </div>
          ))}

          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '20px' }}>
            ⚡ 2. Crenças Centrais & Teses de Mercado
          </h3>
          {session.pillars.beliefs.map((b, i) => (
            <div key={i} className="notion-toggle-item" style={{ fontSize: '0.88rem' }}>
              - {b}
            </div>
          ))}

          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '20px' }}>
            🛡️ 3. Antíteses & O Que Nós Odiamos
          </h3>
          {session.pillars.antitheses.map((a, i) => (
            <div key={i} className="notion-toggle-item" style={{ fontSize: '0.88rem' }}>
              - {a}
            </div>
          ))}

          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '20px' }}>
            🗣️ 4. Vocabulário Único
          </h3>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
            {session.pillars.vocabulary.map((v, i) => (
              <span
                key={i}
                style={{
                  background: 'rgba(168, 85, 247, 0.12)',
                  color: 'var(--accent)',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  fontSize: '0.8rem',
                  fontFamily: 'monospace'
                }}
              >
                {v}
              </span>
            ))}
          </div>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '24px' }}>
            🤖 Prompts Mestre para IA
          </h3>
          {session.prompts.map(p => (
            <div
              key={p.id}
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                padding: '12px',
                marginTop: '12px'
              }}
            >
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--accent)', marginBottom: '6px' }}>
                {p.title} [{p.category}]
              </div>
              <pre
                style={{
                  fontFamily: 'monospace',
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)',
                  whiteSpace: 'pre-wrap',
                  margin: 0
                }}
              >
                {p.prompt}
              </pre>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
