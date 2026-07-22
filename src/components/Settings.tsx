import React, { useState } from 'react';
import { useApp, AVAILABLE_LANGUAGES } from '../context/AppContext';
import { Auth } from './Auth';
import { User, Globe, Sliders, LogOut, Shield, Trash2, Check, HelpCircle, X, Download, Upload, Share2, FileText } from 'lucide-react';
import { Guide } from './Guide';

export const Settings: React.FC = () => {
  const {
    user,
    signOut,
    targetLanguage,
    setTargetLanguage,
    dailyTarget,
    refreshCatalog,
    reviewAlgorithm,
    setReviewAlgorithm
  } = useApp();

  const [autoplay, setAutoplay] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [geminiApiKey, setGeminiApiKey] = useState(() => {
    return localStorage.getItem('hl_gemini_key') || '';
  });
  const [deepseekApiKey, setDeepseekApiKey] = useState(() => {
    return localStorage.getItem('hl_deepseek_key') || '';
  });
  const [nemotronApiKey, setNemotronApiKey] = useState(() => {
    return localStorage.getItem('hl_nemotron_key') || '';
  });
  const [deepseekModel, setDeepseekModel] = useState(() => {
    return localStorage.getItem('hl_deepseek_model') || 'deepseek-ai/deepseek-v4-pro';
  });

  const handleSaveGeminiKey = (value: string) => {
    setGeminiApiKey(value);
    localStorage.setItem('hl_gemini_key', value);
  };

  const handleSaveDeepseekKey = (value: string) => {
    setDeepseekApiKey(value);
    localStorage.setItem('hl_deepseek_key', value);
  };

  const handleSaveNemotronKey = (value: string) => {
    setNemotronApiKey(value);
    localStorage.setItem('hl_nemotron_key', value);
  };

  const handleSaveDeepseekModel = (value: string) => {
    setDeepseekModel(value);
    localStorage.setItem('hl_deepseek_model', value);
  };

  const handleClearLocal = () => {
    if (confirm('Deseja realmente limpar seus dados locais? Isso resetará suas ofensivas e progresso offline.')) {
      localStorage.removeItem('hl_guest_progress');
      alert('Dados locais limpos com sucesso. Recarregando a página.');
      window.location.reload();
    }
  };

  const handleExportCustomData = () => {
    try {
      const exportObj = {
        customPhrases: JSON.parse(localStorage.getItem('hl_custom_phrases') || '[]'),
        customCategories: JSON.parse(localStorage.getItem('hl_custom_categories') || '[]'),
        categoryOverrides: JSON.parse(localStorage.getItem('hl_category_overrides') || '{}'),
        phraseOverrides: JSON.parse(localStorage.getItem('hl_phrase_overrides') || '{}')
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `noclima_sentencas_backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (e) {
      alert('Erro ao exportar sentenças personalizadas.');
    }
  };

  const handleImportCustomData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        let importedCount = 0;

        if (imported.customPhrases && Array.isArray(imported.customPhrases)) {
          const currentCustom = JSON.parse(localStorage.getItem('hl_custom_phrases') || '[]');
          const mergedPhrases = [...currentCustom, ...imported.customPhrases.filter((p: any) => !currentCustom.some((cp: any) => cp.id === p.id))];
          localStorage.setItem('hl_custom_phrases', JSON.stringify(mergedPhrases));
          importedCount += imported.customPhrases.length;
        }

        if (imported.customCategories && Array.isArray(imported.customCategories)) {
          const currentCats = JSON.parse(localStorage.getItem('hl_custom_categories') || '[]');
          const mergedCats = [...currentCats, ...imported.customCategories.filter((c: any) => !currentCats.some((cc: any) => cc.id === c.id))];
          localStorage.setItem('hl_custom_categories', JSON.stringify(mergedCats));
        }

        if (imported.categoryOverrides) {
          const currentOverrides = JSON.parse(localStorage.getItem('hl_category_overrides') || '{}');
          const mergedOverrides = { ...currentOverrides, ...imported.categoryOverrides };
          localStorage.setItem('hl_category_overrides', JSON.stringify(mergedOverrides));
        }

        alert(`✓ ${importedCount} sentenças e ilhas personalizadas importadas com sucesso! Recarregando a página...`);
        window.location.reload();
      } catch (err) {
        alert('Erro ao ler arquivo de backup. Certifique-se de selecionar um arquivo JSON válido.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h2 style={{ fontSize: '1.4rem', marginBottom: '4px' }}>Configurações</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Ajuste suas preferências de estudo e gerencie sua conta.</p>
      </div>

      {/* Account Section */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <User size={18} style={{ color: 'var(--accent)' }} /> Conta
        </h3>

        {user ? (
          // Logged In User
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Conectado como</span>
              <strong style={{ fontSize: '1rem' }}>{user.email}</strong>
            </div>
            
            <button className="btn btn-danger" onClick={signOut} style={{ width: '100%', marginTop: '8px' }}>
              Sair da Conta <LogOut size={16} />
            </button>
          </div>
        ) : (
          // Guest User State
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{
              background: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.15)',
              padding: '12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8rem',
              color: 'var(--warning)',
              lineHeight: 1.4
            }}>
              Você está praticando como <strong>Visitante</strong>. Seu progresso local não será sincronizado entre dispositivos e pode ser apagado se limpar o histórico do navegador.
            </div>

            {showAuth ? (
              <div className="fade-in" style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: '8px' }}>
                <Auth 
                  onSuccess={() => { setShowAuth(false); refreshCatalog(); }}
                  onSkip={() => setShowAuth(false)}
                />
              </div>
            ) : (
              <button className="btn btn-primary" onClick={() => setShowAuth(true)} style={{ width: '100%' }}>
                Entrar ou Criar Conta
              </button>
            )}
          </div>
        )}
      </div>

      {/* Study Preferences Section */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sliders size={18} style={{ color: 'var(--accent)' }} /> Preferências
        </h3>

        {/* Language select */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Globe size={14} /> Idioma de Estudo
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '8px', marginTop: '6px' }}>
            {AVAILABLE_LANGUAGES.map(lang => {
              const isActive = lang.id === targetLanguage;
              return (
                <button
                  key={lang.id}
                  onClick={() => setTargetLanguage(lang.id)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    gap: '6px', padding: '14px 8px',
                    background: isActive
                      ? 'linear-gradient(135deg, rgba(124,58,237,0.25) 0%, rgba(124,58,237,0.1) 100%)'
                      : 'rgba(255,255,255,0.03)',
                    border: isActive ? '2px solid rgba(124,58,237,0.6)' : '2px solid transparent',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer', transition: 'all 0.2s', outline: 'none'
                  }}
                >
                  <span style={{ fontSize: '2rem', lineHeight: 1 }}>{lang.flag_emoji}</span>
                  <span style={{
                    fontSize: '0.75rem', fontWeight: isActive ? 700 : 500,
                    color: isActive ? 'var(--accent)' : 'var(--text-secondary)'
                  }}>{lang.name}</span>
                  {isActive && <Check size={12} style={{ color: 'var(--accent)' }} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Spaced Repetition Scheduling Algorithm selection */}
        <div className="form-group" style={{ marginBottom: 0, borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sliders size={14} /> Metodologia de Revisão (Active Recall)
          </label>
          <select
            className="input-text"
            value={reviewAlgorithm}
            onChange={(e) => setReviewAlgorithm(e.target.value as 'sm2' | 'fibonacci')}
          >
            <option value="fibonacci">Repetição Espaçada - Fibonacci (1, 2, 3, 5, 8, 13 dias) 🌀</option>
            <option value="sm2">SuperMemo-2 (SM2) Adaptativo 📈</option>
          </select>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.3 }}>
            {reviewAlgorithm === 'fibonacci'
              ? 'Fibonacci: Os intervalos seguem a sequência de Fibonacci. Respostas certas avançam de nível; erros regridem 2 níveis.'
              : 'SM2: Os intervalos são multiplicados pelo Fator de Facilidade que se adapta com base no seu nível de esforço.'
            }
          </span>
        </div>

        {/* Autoplay toggle */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Reprodução Automática</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>Tocar áudio da frase ao mudar de card</div>
          </div>
          <input
            type="checkbox"
            checked={autoplay}
            onChange={(e) => setAutoplay(e.target.checked)}
            style={{ width: '20px', height: '20px', cursor: 'pointer' }}
          />
        </div>

        {/* Daily Goal value view */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Meta Diária</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>Número de frases a completar diariamente</div>
          </div>
          <strong style={{ fontSize: '1rem', color: 'var(--accent)' }}>{dailyTarget} frases</strong>
        </div>

        {/* User Guide Button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Guia do Usuário</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>Metodologia, revisões espaçadas, níveis CEFR e ajuda</div>
          </div>
          <button 
            className="btn btn-secondary" 
            onClick={() => setShowGuide(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', fontSize: '0.8rem' }}
          >
            <HelpCircle size={15} /> Abrir Guia
          </button>
        </div>
      </div>

      {/* API Keys Section */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Shield size={18} style={{ color: 'var(--accent)' }} /> Chaves de API (Inteligência Artificial)
        </h3>
        
        {/* Gemini */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
            Gemini API Key (Dicionário do Shadowing)
          </label>
          <input
            type="password"
            className="input-text"
            placeholder="Cole sua chave da API do Gemini aqui..."
            value={geminiApiKey}
            onChange={(e) => handleSaveGeminiKey(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'white', marginTop: '6px' }}
          />
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '6px', lineHeight: 1.3 }}>
            Usada para obter pronúncias, traduções e explicações das palavras clicadas no Shadowing. Obtenha sua chave grátis no <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>Google AI Studio</a>.
          </p>
        </div>

        {/* DeepSeek API Key */}
        <div className="form-group" style={{ marginBottom: 0, borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
            NVIDIA DeepSeek API Key
          </label>
          <input
            type="password"
            className="input-text"
            placeholder="Cole sua chave da API DeepSeek aqui..."
            value={deepseekApiKey}
            onChange={(e) => handleSaveDeepseekKey(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'white', marginTop: '6px' }}
          />
        </div>

        {/* Nemotron API Key */}
        <div className="form-group" style={{ marginBottom: 0, borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
            NVIDIA Nemotron API Key
          </label>
          <input
            type="password"
            className="input-text"
            placeholder="Cole sua chave da API Nemotron aqui..."
            value={nemotronApiKey}
            onChange={(e) => handleSaveNemotronKey(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'white', marginTop: '6px' }}
          />
        </div>

        {/* Active AI Model Selector */}
        <div className="form-group" style={{ marginBottom: 0, borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
            Modelo Ativo do Chat de IA (NVIDIA)
          </label>
          <select
            className="input-text"
            value={deepseekModel}
            onChange={(e) => handleSaveDeepseekModel(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'white', marginTop: '6px', cursor: 'pointer' }}
          >
            <option value="deepseek-ai/deepseek-v4-pro">DeepSeek V4 Pro (deepseek-ai/deepseek-v4-pro) 🚀</option>
            <option value="nvidia/nemotron-3-ultra-550b-a55b">Nemotron 3 Ultra 550B (nvidia/nemotron-3-ultra-550b-a55b) 🧠</option>
          </select>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '6px', lineHeight: 1.3 }}>
            Selecione o modelo de IA para o Chat Global. O Nemotron exibe o processo de raciocínio lógico no próprio balão de mensagens. Chaves e modelos são pré-configurados no início.
          </p>
        </div>
      </div>

      {/* Backup & Import Custom Sentences */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b' }}>
          <Share2 size={18} /> Sincronizar / Exportar Minhas Sentenças & Ilhas
        </h3>
        
        <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
          Exporte o arquivo das sentenças e ilhas que você adicionou ou editou no PC para importá-las instantaneamente no celular ou em qualquer outro dispositivo.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '4px' }}>
          <button 
            type="button"
            className="btn" 
            onClick={handleExportCustomData} 
            style={{ 
              background: 'rgba(245, 158, 11, 0.15)', 
              color: '#f59e0b', 
              border: '1px solid rgba(245, 158, 11, 0.3)',
              fontWeight: 700,
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <Download size={15} /> Exportar Backup (JSON)
          </button>

          <label 
            className="btn" 
            style={{ 
              background: 'rgba(16, 185, 129, 0.15)', 
              color: '#10b981', 
              border: '1px solid rgba(16, 185, 129, 0.3)',
              fontWeight: 700,
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
          >
            <Upload size={15} /> Importar no Celular
            <input 
              type="file" 
              accept=".json" 
              onChange={handleImportCustomData} 
              style={{ display: 'none' }} 
            />
          </label>
        </div>
      </div>

      {/* Danger Zone Section */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
        <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--danger)' }}>
          <Trash2 size={18} /> Zona de Perigo
        </h3>
        
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
          Limpando os dados locais, todo o seu histórico do modo visitante, ofensivas e revisões SM2 salvas neste navegador serão permanentemente deletados.
        </p>

        <button className="btn btn-danger" onClick={handleClearLocal} style={{ width: '100%', marginTop: '4px' }}>
          Limpar Progresso Local <Trash2 size={16} />
        </button>
      </div>

      {/* User Guide Modal Overlay */}
      {showGuide && (
        <div className="practice-modal-overlay" onClick={() => setShowGuide(false)}>
          <div className="practice-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '750px', width: '92%' }}>
            <div className="practice-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(124, 58, 237, 0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)'
                }}>
                  <HelpCircle size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Como usar o NoClima</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Metodologia, níveis CEFR e práticas de estudo</span>
                </div>
              </div>
              <button 
                onClick={() => setShowGuide(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                title="Fechar guia"
              >
                <X size={18} />
              </button>
            </div>
            <div className="practice-modal-body" style={{ maxHeight: '72vh', overflowY: 'auto', padding: '20px 24px' }}>
              <Guide />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
