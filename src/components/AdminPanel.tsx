import React, { useState, useEffect } from 'react';
import { useApp, Phrase } from '../context/AppContext';
import { supabase } from '../services/supabase';
import { Plus, Upload, ListFilter, Play, RefreshCw, CheckCircle, AlertTriangle, FileSpreadsheet, Trash2 } from 'lucide-react';

interface QueueItem {
  id: string;
  phrase_id: string;
  text: string;
  voice_name: string;
  speed: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error_log: string | null;
  created_at: string;
  phrases?: {
    translation: string;
    audio_url: string | null;
  };
}

export const AdminPanel: React.FC = () => {
  const { languages, categories, refreshCatalog, phrases } = useApp();
  const [adminTab, setAdminTab] = useState<'create' | 'queue'>('create');
  
  // Manual form states
  const [langId, setLangId] = useState('en');
  const [catId, setCatId] = useState('');
  const [text, setText] = useState('');
  const [translation, setTranslation] = useState('');
  const [explanation, setExplanation] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [voiceName, setVoiceName] = useState('Fenrir');
  const [speed, setSpeed] = useState(1.0);
  const [autoQueue, setAutoQueue] = useState(true);
  
  // CSV Import states
  const [csvData, setCsvData] = useState('');
  const [importDelimiter, setImportDelimiter] = useState(';');
  
  // Queue state
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [loadingQueue, setLoadingQueue] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Filter categories by language
  const filteredCategories = categories.filter(c => c.language_id === langId);

  useEffect(() => {
    if (filteredCategories.length > 0 && !catId) {
      setCatId(filteredCategories[0].id);
    }
  }, [langId, filteredCategories, catId]);

  useEffect(() => {
    if (adminTab === 'queue') {
      loadQueue();
    }
  }, [adminTab]);

  const loadQueue = async () => {
    setLoadingQueue(true);
    try {
      // Query the audio generation queue joined with phrases details
      const { data, error } = await supabase
        .from('audio_generation_queue')
        .select('*, phrases(translation, audio_url)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQueue(data || []);
    } catch (e) {
      console.error('Error loading audio queue:', e);
    } finally {
      setLoadingQueue(false);
    }
  };

  const handleCreatePhrase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catId) {
      alert('Selecione uma Ilha de Idioma (Categoria) primeiro!');
      return;
    }

    setSubmitting(true);
    try {
      // 1. Insert phrase
      const { data: phraseData, error: phraseErr } = await supabase
        .from('phrases')
        .insert({
          language_id: langId,
          category_id: catId,
          text,
          translation,
          explanation,
          difficulty,
          voice_name: voiceName,
          speed,
          is_published: true
        })
        .select()
        .single();

      if (phraseErr) throw phraseErr;

      // 2. Add to audio generation queue if enabled
      if (autoQueue && phraseData) {
        await supabase.from('audio_generation_queue').insert({
          phrase_id: phraseData.id,
          text: phraseData.text,
          voice_name: phraseData.voice_name,
          speed: phraseData.speed,
          status: 'pending'
        });
      }

      alert('Frase adicionada com sucesso!');
      setText('');
      setTranslation('');
      setExplanation('');
      refreshCatalog();
    } catch (err: any) {
      alert(`Erro ao salvar frase: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCSVImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catId) {
      alert('Selecione uma categoria/ilha!');
      return;
    }
    if (!csvData.trim()) {
      alert('Cole os dados do CSV no campo de texto.');
      return;
    }

    setSubmitting(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      const rows = csvData.split('\n');
      for (const row of rows) {
        if (!row.trim()) continue;
        
        const cols = row.split(importDelimiter);
        if (cols.length < 2) {
          errorCount++;
          continue;
        }

        const phraseText = cols[0].trim();
        const phraseTranslation = cols[1].trim();
        const phraseExplanation = cols[2] ? cols[2].trim() : '';

        // Insert
        const { data: phraseData, error: phraseErr } = await supabase
          .from('phrases')
          .insert({
            language_id: langId,
            category_id: catId,
            text: phraseText,
            translation: phraseTranslation,
            explanation: phraseExplanation,
            difficulty: 'medium',
            voice_name: voiceName,
            speed,
            is_published: true
          })
          .select()
          .single();

        if (phraseErr) {
          console.error(phraseErr);
          errorCount++;
          continue;
        }

        // Add to queue
        if (autoQueue && phraseData) {
          await supabase.from('audio_generation_queue').insert({
            phrase_id: phraseData.id,
            text: phraseData.text,
            voice_name: phraseData.voice_name,
            speed: phraseData.speed,
            status: 'pending'
          });
        }
        successCount++;
      }

      alert(`Importação concluída! ${successCount} frases importadas com sucesso. ${errorCount} erros.`);
      setCsvData('');
      refreshCatalog();
    } catch (err: any) {
      alert(`Erro na importação: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegenerateAudio = async (item: QueueItem) => {
    try {
      // Reset status in the queue to 'pending' to trigger worker reprocessing
      const { error } = await supabase
        .from('audio_generation_queue')
        .update({
          status: 'pending',
          error_log: null,
          voice_name: item.voice_name, // keep or let them change
          speed: item.speed
        })
        .eq('id', item.id);

      if (error) throw error;
      loadQueue();
    } catch (e: any) {
      alert(`Erro ao reenfileirar: ${e.message}`);
    }
  };

  const handleDeletePhrase = async (phraseId: string) => {
    if (!confirm('Deseja realmente excluir esta frase? Isso também apagará o progresso dos usuários.')) return;
    
    try {
      const { error } = await supabase.from('phrases').delete().eq('id', phraseId);
      if (error) throw error;
      alert('Frase deletada com sucesso!');
      refreshCatalog();
      if (adminTab === 'queue') loadQueue();
    } catch (e: any) {
      alert(`Erro ao excluir: ${e.message}`);
    }
  };

  const getAudioUrl = (audioUrl: string | null): string | null => {
    if (!audioUrl) return null;
    if (audioUrl.startsWith('http')) return audioUrl;
    const { data } = supabase.storage.from('phrase-audios').getPublicUrl(audioUrl);
    return data.publicUrl;
  };

  const playPreview = (audioUrl: string | null) => {
    const url = getAudioUrl(audioUrl);
    if (url) {
      const audio = new Audio(url);
      audio.play().catch(e => console.error('Error playing preview:', e));
    } else {
      alert('Áudio não carregado ou indisponível.');
    }
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h2 style={{ fontSize: '1.4rem', marginBottom: '4px' }}>Painel do Administrador</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Gerencie frases, faça importações e controle a geração de vozes por IA.</p>
      </div>

      {/* Internal Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
        <button
          onClick={() => setAdminTab('create')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: adminTab === 'create' ? '2px solid var(--accent)' : 'none',
            color: adminTab === 'create' ? 'var(--accent)' : 'var(--text-secondary)',
            padding: '10px 16px',
            fontSize: '0.9rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Cadastrar & Importar
        </button>
        <button
          onClick={() => setAdminTab('queue')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: adminTab === 'queue' ? '2px solid var(--accent)' : 'none',
            color: adminTab === 'queue' ? 'var(--accent)' : 'var(--text-secondary)',
            padding: '10px 16px',
            fontSize: '0.9rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Fila de Geração
        </button>
      </div>

      {adminTab === 'create' ? (
        // FORM & CSV IMPORT TAB
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Manual Input Form */}
          <form onSubmit={handleCreatePhrase} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Plus size={18} /> Cadastrar Nova Frase
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '12px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Idioma</label>
                <select
                  className="input-text"
                  value={langId}
                  onChange={(e) => { setLangId(e.target.value); setCatId(''); }}
                >
                  {languages.map(l => (
                    <option key={l.id} value={l.id}>{l.name} {l.flag_emoji}</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Ilha de Idioma</label>
                <select
                  className="input-text"
                  value={catId}
                  onChange={(e) => setCatId(e.target.value)}
                >
                  {filteredCategories.length === 0 ? (
                    <option value="">Sem categorias disponíveis</option>
                  ) : (
                    filteredCategories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))
                  )}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Texto da Frase (Original)</label>
              <input
                type="text"
                required
                className="input-text"
                placeholder="Ex: Good morning, how are you?"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Tradução (Português)</label>
              <input
                type="text"
                required
                className="input-text"
                placeholder="Ex: Bom dia, como vai você?"
                value={translation}
                onChange={(e) => setTranslation(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Explicação Gramatical / Dicas</label>
              <textarea
                className="input-text"
                rows={3}
                placeholder="Explique detalhes da estrutura, tempos verbais ou contexto..."
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                style={{ resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '12px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Voz Gemini</label>
                <select className="input-text" value={voiceName} onChange={(e) => setVoiceName(e.target.value)}>
                  <option value="Fenrir">Fenrir (Masculino)</option>
                  <option value="Puck">Puck (Juvenil)</option>
                  <option value="Kore">Kore (Feminino)</option>
                  <option value="Aoede">Aoede (Clássico)</option>
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Velocidade</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.5"
                  max="2.0"
                  className="input-text"
                  value={speed}
                  onChange={(e) => setSpeed(parseFloat(e.target.value))}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Dificuldade</label>
                <select className="input-text" value={difficulty} onChange={(e) => setDifficulty(e.target.value as any)}>
                  <option value="easy">Fácil</option>
                  <option value="medium">Médio</option>
                  <option value="hard">Difícil</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '4px 0' }}>
              <input
                type="checkbox"
                id="autoQueue"
                checked={autoQueue}
                onChange={(e) => setAutoQueue(e.target.checked)}
              />
              <label htmlFor="autoQueue" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Enviar automaticamente para fila de áudio por IA
              </label>
            </div>

            <button type="submit" disabled={submitting} className="btn btn-primary" style={{ width: '100%' }}>
              Salvar Frase
            </button>
          </form>

          {/* Bulk CSV Import Form */}
          <form onSubmit={handleCSVImport} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileSpreadsheet size={18} /> Importar Lotes (CSV / Tabela)
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Categoria de Destino</label>
                <select
                  className="input-text"
                  value={catId}
                  onChange={(e) => setCatId(e.target.value)}
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>[{c.language_id.toUpperCase()}] {c.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Delimitador</label>
                <select className="input-text" value={importDelimiter} onChange={(e) => setImportDelimiter(e.target.value)}>
                  <option value=";">Ponto e vírgula (;)</option>
                  <option value=",">Vírgula (,)</option>
                  <option value="\t">Tabulação (Tab)</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Dados CSV (Uma frase por linha)</label>
              <textarea
                className="input-text"
                rows={6}
                placeholder={`Frase${importDelimiter}Tradução${importDelimiter}Explicação\nMy mother said nothing${importDelimiter}Minha mãe não disse nada${importDelimiter}Explicação aqui`}
                value={csvData}
                onChange={(e) => setCsvData(e.target.value)}
                style={{ resize: 'vertical', fontSize: '0.8rem', fontFamily: 'monospace' }}
              />
            </div>

            <button type="submit" disabled={submitting} className="btn btn-secondary" style={{ width: '100%' }}>
              Importar Lote de Frases
            </button>
          </form>

        </div>
      ) : (
        // QUEUE AND AUDIO PROCESSING MONITOR TAB
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.1rem' }}>Fila de Geração de Vozes</h3>
            <button className="btn btn-secondary" onClick={loadQueue} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
              Atualizar <RefreshCw size={14} />
            </button>
          </div>

          {loadingQueue ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Carregando fila...</div>
          ) : queue.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', border: '1px dashed var(--border)', borderRadius: 'var(--radius-md)' }}>
              Nenhum item na fila de áudio.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {queue.map((item) => (
                <div key={item.id} className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <strong style={{ fontSize: '1.05rem' }}>{item.text}</strong>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Voz: {item.voice_name} | Speed: {item.speed}x
                      </span>
                    </div>

                    {/* Status Badge */}
                    <span className={`badge ${
                      item.status === 'completed' ? 'badge-easy' : 
                      item.status === 'failed' ? 'badge-hard' : 'badge-medium'
                    }`}>
                      {item.status}
                    </span>
                  </div>

                  {/* Actions / Previews Row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {item.status === 'completed' && item.phrases?.audio_url && (
                        <button 
                          className="btn btn-secondary" 
                          style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                          onClick={() => playPreview(item.phrases?.audio_url || null)}
                        >
                          Ouvir Prévia <Play size={12} />
                        </button>
                      )}
                      
                      <button 
                        className="btn btn-secondary" 
                        style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                        onClick={() => handleRegenerateAudio(item)}
                      >
                        Regerar Áudio <RefreshCw size={12} />
                      </button>
                    </div>

                    <button 
                      style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                      onClick={() => handleDeletePhrase(item.phrase_id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Error Log rendering */}
                  {item.status === 'failed' && item.error_log && (
                    <div style={{
                      background: 'rgba(239, 68, 68, 0.08)',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      padding: '10px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.75rem',
                      fontFamily: 'monospace',
                      color: 'var(--danger)',
                      overflowX: 'auto'
                    }}>
                      <strong>Erro:</strong> {item.error_log}
                    </div>
                  )}

                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
